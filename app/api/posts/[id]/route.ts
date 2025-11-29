import { NextRequest, NextResponse } from "next/server";
import {
  updatePost,
  deletePost,
  togglePostStatus,
  saveImage,
} from "@/lib/storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload for edit
      const formData = await request.formData();
      const title = formData.get("title") as string;
      const yt_url = formData.get("yt_url") as string;
      const product_url = formData.get("product_url") as string;
      const imageFile = formData.get("image") as File | null;

      if (!title || !product_url) {
        return NextResponse.json(
          { error: "Missing required fields: title and product_url" },
          { status: 400 }
        );
      }

      const updates: any = {
        title,
        yt_url: yt_url || undefined,
        product_url,
      };

      // Only update image if a new one was uploaded
      if (imageFile && imageFile.size > 0) {
        const buffer = await imageFile.arrayBuffer();
        const imagePath = await saveImage(Buffer.from(buffer), imageFile.name);
        updates.image = imagePath;
      }

      const post = await updatePost(id, updates);

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json(post);
    } else {
      // Handle JSON for backward compatibility
      const body = await request.json();
      const post = await updatePost(id, body);

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json(post);
    }
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deletePost(id);

    if (!success) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await togglePostStatus(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to toggle post status" },
      { status: 500 }
    );
  }
}
