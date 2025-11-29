import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/storage";

export async function GET() {
  try {
    const posts = await getAllPosts();
    const active = posts.filter((p) => p.active).length;

    return NextResponse.json({
      total: posts.length,
      active,
      inactive: posts.length - active,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
