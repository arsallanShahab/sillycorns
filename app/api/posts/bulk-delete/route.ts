import { NextRequest, NextResponse } from "next/server";
import { bulkDeletePosts } from "@/lib/storage";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty ids array" },
        { status: 400 }
      );
    }

    const result = await bulkDeletePosts(ids);

    return NextResponse.json(
      {
        success: result.success,
        deleted: result.deleted,
        message: `Successfully deleted ${result.deleted} post(s)`,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to bulk delete posts" },
      { status: 500 }
    );
  }
}
