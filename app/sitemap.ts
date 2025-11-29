import { MetadataRoute } from "next";
import { getActivePosts, getActivePostsCount } from "@/lib/storage";

export const revalidate = 0; // Revalidate immediately
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sillycorn.vercel.app";

  // Get latest posts to determine last modification time
  const latestPosts = await getActivePosts(0, 1);
  const lastPostDate = latestPosts[0]?.createdAt
    ? new Date(latestPosts[0].createdAt)
    : new Date();
  const totalPosts = await getActivePostsCount();

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
  const recentPosts = await getActivePosts(0, 50);
  const postUrls: MetadataRoute.Sitemap = recentPosts.map((post) => ({
    url: `${baseUrl}#${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...pages, ...postUrls];
}
