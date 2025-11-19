import { NextRequest, NextResponse } from "next/server";
import { getActivePosts, getActivePostsCount } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "20");

    const posts = await getActivePosts(skip, limit);
    const total = await getActivePostsCount();

    return NextResponse.json({ posts, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
