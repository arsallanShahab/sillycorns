import { MetadataRoute } from "next";
import { getStaticPosts } from "@/lib/posts-client";
import type { Post } from "@/lib/types";

export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sillycorn.vercel.app";

  // Get latest posts to determine last modification time
  const allPosts = await getStaticPosts();
  const latestPosts = allPosts.slice(0, 1);
  const lastPostDate = latestPosts[0]?.createdAt
    ? new Date(latestPosts[0].createdAt)
    : new Date();

  // Main pages with dynamic last modified dates
  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastPostDate,
      changeFrequency: "hourly" as const, // Changed to hourly since posts are added hourly
      priority: 1.0,
    },
    {
      url: `${baseUrl}/api/posts/published`,
      lastModified: lastPostDate,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
  ];

  // Add recent posts to sitemap for better indexing
  const recentPosts = allPosts.slice(0, 50);
  const postUrls: MetadataRoute.Sitemap = recentPosts.map((post: Post) => ({
    url: `${baseUrl}#${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...pages, ...postUrls];
}
