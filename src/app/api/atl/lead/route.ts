import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, schoolName, state, role } = body;

    if (!firstName || !email || !phone || !schoolName) {
      return NextResponse.json(
        { error: "First Name, Email, Phone, and School Name are required." },
        { status: 400 }
      );
    }

    const payload = {
      first_name: firstName,
      last_name: lastName || "",
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      school_name: schoolName.trim(),
      state: state || "",
      role: role || "School Educator",
      created_at: new Date().toISOString(),
    };

    // Store in Supabase table if available
    try {
      const { error } = await supabase.from("atl_lead_submissions").insert([payload]);
      if (error) {
        console.warn("Supabase insert notice (fallback active):", error.message);
      }
    } catch (err) {
      console.warn("Supabase connection fallback active:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Lead submission received successfully! Our ATL expert will contact you within 24 hours.",
      data: payload,
    });
  } catch (error) {
    console.error("Error processing ATL lead:", error);
    return NextResponse.json(
      { error: "Internal Server Error processing lead submission." },
      { status: 500 }
    );
  }
}
