"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Post } from "@/lib/types";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ExternalLink, Music } from "lucide-react";
import Link from "next/link";

const POSTS_PER_PAGE = 4;

export function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/posts/published?skip=${skip}&limit=${POSTS_PER_PAGE}`
      );

      if (response.ok) {
        const data = await response.json();
        const newPosts = data.posts as Post[];

        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
          setSkip((prev) => prev + newPosts.length);
        }
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [skip, isLoading, hasMore]);

  // Initial load
  useEffect(() => {
    loadMorePosts();
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMorePosts, hasMore, isLoading]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            target="_blank"
            href={post.product_url || post.yt_url || "#"}
          >
            {" "}
            <div className="relative h-auto aspect-square">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      )}

      {/* Observer target */}
      <div ref={observerTarget} className="h-10" />

      {/* No more posts message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No more posts to load
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 && !isLoading && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No posts yet</p>
          <p className="text-sm mt-2">Check back soon for updates!</p>
        </div>
      )}
    </div>
  );
}
