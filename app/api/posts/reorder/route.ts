import { NextRequest, NextResponse } from "next/server";
import { reorderPosts } from "@/lib/storage";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { postIds } = body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid post IDs array" },
        { status: 400 }
      );
    }

    const success = await reorderPosts(postIds);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to reorder posts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process reorder" },
      { status: 500 }
    );
  }
}
