"use client";

import { useState } from "react";
import { Post } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Trash2,
  CheckCircle2,
  Circle,
  Upload,
  X,
  GripVertical,
} from "lucide-react";
import Image from "next/image";

interface PostsManagementProps {
  initialPosts: Post[];
  onPostsChange: () => void;
}

export function PostsManagement({
  initialPosts,
  onPostsChange,
}: PostsManagementProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [yt_url, setYtUrl] = useState("");
  const [product_url, setProductUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!title || !imageFile || !product_url) {
      alert("Please fill required fields: title, image, and product URL");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", imageFile);
      formData.append("yt_url", yt_url);
      formData.append("product_url", product_url);

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setTitle("");
        setImageFile(null);
        setImagePreview("");
        setYtUrl("");
        setProductUrl("");
        setIsCreating(false);
        onPostsChange();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create post");
      }
    } catch {
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
      });

      if (response.ok) {
        const updated = await response.json();
        setPosts(posts.map((p) => (p.id === id ? updated : p)));
        onPostsChange();
      }
    } catch {
      alert("Failed to toggle post status");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== id));
        onPostsChange();
      }
    } catch {
      alert("Failed to delete post");
    }
  };

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("postId", postId);
    setDraggedItem(postId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetPostId: string) => {
    e.preventDefault();
    const sourcePostId = e.dataTransfer.getData("postId");

    if (sourcePostId === targetPostId) return;

    // Find indices
    const sourceIndex = posts.findIndex((p) => p.id === sourcePostId);
    const targetIndex = posts.findIndex((p) => p.id === targetPostId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Reorder locally
    const newPosts = [...posts];
    const [movedPost] = newPosts.splice(sourceIndex, 1);
    newPosts.splice(targetIndex, 0, movedPost);

    setPosts(newPosts);
    setDraggedItem(null);

    // Send reorder to server
    try {
      const response = await fetch("/api/posts/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: newPosts.map((p) => p.id) }),
      });

      if (!response.ok) {
        alert("Failed to save reorder");
        // Revert to original
        setPosts(initialPosts);
      }
    } catch {
      alert("Failed to save reorder");
      setPosts(initialPosts);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Posts Management</h2>

        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)} className="mb-4">
            Create New Post
          </Button>
        ) : (
          <Card className="p-6 mb-4 space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
              />
            </div>

            <div>
              <Label htmlFor="image">Image</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {imageFile
                      ? imageFile.name
                      : "Click to upload or drag image"}
                  </span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="yt_url">YouTube URL</Label>
              <Input
                id="yt_url"
                value={yt_url}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label htmlFor="product_url">Product URL</Label>
              <Input
                id="product_url"
                value={product_url}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://example.com/product"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreatePost} disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setTitle("");
                  setImageFile(null);
                  setImagePreview("");
                  setYtUrl("");
                  setProductUrl("");
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Posts ({posts.length})</h3>
        <div className="space-y-2">
          {posts.length === 0 ? (
            <p className="text-gray-500">No posts yet</p>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                draggable
                onDragStart={(e) => handleDragStart(e, post.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, post.id)}
                className={`p-4 flex items-start justify-between gap-4 cursor-move transition-all ${
                  draggedItem === post.id
                    ? "opacity-50 border-2 border-blue-500"
                    : "hover:border-2 hover:border-gray-300"
                }`}
              >
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{post.title}</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {post.yt_url}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(post.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    title={post.active ? "Deactivate" : "Activate"}
                  >
                    {post.active ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
