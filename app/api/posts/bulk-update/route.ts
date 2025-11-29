import { NextRequest, NextResponse } from "next/server";
import { bulkUpdatePostsStatus } from "@/lib/storage";

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, active } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty ids array" },
        { status: 400 }
      );
    }

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "active must be a boolean value" },
        { status: 400 }
      );
    }

    const result = await bulkUpdatePostsStatus(ids, active);

    return NextResponse.json(
      {
        success: result.success,
        updated: result.updated,
        message: `Successfully updated ${result.updated} post(s)`,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to bulk update posts" },
      { status: 500 }
    );
  }
}
