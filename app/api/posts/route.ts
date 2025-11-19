import { NextRequest, NextResponse } from "next/server";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  togglePostStatus,
  saveImage,
} from "@/lib/storage";

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const title = formData.get("title") as string;
      const yt_url = formData.get("yt_url") as string;
      const product_url = formData.get("product_url") as string;
      const imageFile = formData.get("image") as File;

      if (!title || !product_url) {
        return NextResponse.json(
          { error: "Missing required fields: title and product_url" },
          { status: 400 }
        );
      }

      let imagePath = "";

      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        imagePath = await saveImage(Buffer.from(buffer), imageFile.name);
      }

      const post = await createPost({
        title,
        image: imagePath,
        yt_url,
        product_url,
      });

      return NextResponse.json(post, { status: 201 });
    } else {
      // Handle JSON (for backward compatibility)
      const body = await request.json();
      const { title, image, yt_url, product_url } = body;

      if (!title || !image || !product_url) {
        return NextResponse.json(
          { error: "Missing required fields: title, image, and product_url" },
          { status: 400 }
        );
      }

      const post = await createPost({
        title,
        image,
        yt_url,
        product_url,
      });

      return NextResponse.json(post, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
