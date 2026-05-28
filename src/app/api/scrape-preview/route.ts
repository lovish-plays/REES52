import { NextRequest, NextResponse } from "next/server";
import ogs from "open-graph-scraper";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL query parameter is required." }, { status: 400 });
  }

  try {
    const options = { url: url, timeout: 5000 };
    const { result } = await ogs(options);

    const ogResult = result as any;
    const targetImage = ogResult.ogImage?.[0]?.url || ogResult.ogImage?.url || null;
    const targetTitle = ogResult.ogTitle || "External Link Product";

    return NextResponse.json({
      success: true,
      thumbnail: targetImage,
      title: targetTitle
    });
  } catch (error) {
    console.error("Link preview parsing error:", error);
    // Return graceful fallback state if site blocks bots or request fails
    return NextResponse.json({ 
      success: false, 
      thumbnail: "https://rees52.com/fallback-placeholder.png" 
    });
  }
}
