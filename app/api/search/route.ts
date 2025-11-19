import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 1) {
      return NextResponse.json([]);
    }

    const posts = await getPosts();
    const activePublishedPosts = posts.filter((p) => p.active);

    const results = activePublishedPosts
      .filter((post) => post.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10) // Limit to 10 results
      .map((post) => ({
        id: post.id,
        title: post.title,
        image: post.image,
        product_url: post.product_url,
      }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Failed to search posts" },
      { status: 500 }
    );
  }
}
