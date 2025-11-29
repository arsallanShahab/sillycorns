import { Post } from "./types";

// Client-side function to fetch posts from public folder or API
export async function fetchPosts(): Promise<Post[]> {
  try {
    // Try to fetch from API first (for dynamic content)
    const response = await fetch("/api/posts/published", {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      return data.posts || [];
    }

    // Fallback to static posts.json in public folder
    const staticResponse = await fetch("/posts.json", {
      cache: "no-store",
    });

    if (staticResponse.ok) {
      const data = await staticResponse.json();
      return (data.posts || []).filter((post: Post) => post.active);
    }

    return [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Server-side function for static generation (reads from public at build time)
export async function getStaticPosts(): Promise<Post[]> {
  try {
    // During build, read from the copied public/posts.json
    const fs = await import("fs/promises");
    const path = await import("path");

    const publicPostsPath = path.join(process.cwd(), "public", "posts.json");

    // Try public folder first
    try {
      const data = await fs.readFile(publicPostsPath, "utf-8");
      const parsed = JSON.parse(data);
      return (parsed.posts || []).filter((post: Post) => post.active);
    } catch {
      // Fallback to data folder for local development
      const dataPostsPath = path.join(process.cwd(), "data", "posts.json");
      const data = await fs.readFile(dataPostsPath, "utf-8");
      const parsed = JSON.parse(data);
      return (parsed.posts || []).filter((post: Post) => post.active);
    }
  } catch (error) {
    console.error("Error reading static posts:", error);
    return [];
  }
}
