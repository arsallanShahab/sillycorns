"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Post } from "@/lib/types";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ExternalLink, Music } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <div className="space-y-8 relative">
      {/* Posts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {posts.map((post, idx) => (
          <motion.div
            key={post.id + idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05, ease: "easeOut" }}
          >
            <Link
              target="_blank"
              href={post.product_url || post.yt_url || "#"}
              className="group block relative"
            >
              <div className="relative h-auto aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1">
                {post.image ? (
                  <>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Title overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white font-semibold text-sm md:text-base drop-shadow-lg line-clamp-2">
                        {post.title}
                      </p>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-white" />
            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-blue-400/20 to-purple-400/20 animate-pulse" />
          </div>
        </div>
      )}

      {/* Observer target */}
      <div ref={observerTarget} className="h-10" />

      {/* No more posts message */}
      {!hasMore && posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <div className="inline-block px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              🎉 You&apos;ve seen it all!
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {posts.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-20"
        >
          <div className="inline-block px-8 py-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No posts yet
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for amazing gadgets! ✨
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
