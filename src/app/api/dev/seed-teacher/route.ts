import { timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/repositories/userRepository";

export async function POST(request: Request) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_E2E_SEED !== "true" ||
    !matchesSeedSecret(request.headers.get("x-e2e-seed-secret"))
  ) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const input = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
  } | null;
  const name = input?.name?.trim() || "Teacher QA";
  const email = input?.email?.trim().toLowerCase();
  const password = input?.password;

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Valid test credentials are required." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await UserRepository.getUserByEmail(email);

  if (existing) {
    const updated = await UserRepository.updateUser(existing.id, {
      name,
      email,
      password_hash: passwordHash,
      role: "Teacher",
    });
    if (!updated) {
      return NextResponse.json({ error: "Unable to prepare the test teacher." }, { status: 500 });
    }
  } else {
    const created = await UserRepository.createUser({
      name,
      email,
      password_hash: passwordHash,
      role: "Teacher",
      enrolled_courses: [],
      enrolled_videos: [],
      purchased_ebooks: [],
    });
    if (!created.success) {
      return NextResponse.json({ error: "Unable to prepare the test teacher." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

function matchesSeedSecret(candidate: string | null) {
  const expected = process.env.E2E_SEED_SECRET;
  if (!candidate || !expected || candidate.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
}
