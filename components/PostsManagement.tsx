"use client";

import { useState, useMemo, useEffect } from "react";
import { Post } from "@/lib/types";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  CheckCircle2,
  Circle,
  Upload,
  X,
  GripVertical,
  Edit,
  Eye,
  EyeOff,
  Search,
  Filter,
  ImageIcon,
  Link as LinkIcon,
  Youtube,
  Plus,
} from "lucide-react";
import Image from "next/image";

interface PostsManagementProps {
  initialPosts: Post[];
  onPostsChange: () => void;
}

export function PostsManagement({
  initialPosts = [],
  onPostsChange,
}: PostsManagementProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [yt_url, setYtUrl] = useState("");
  const [product_url, setProductUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Bulk operations
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  // Filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "order">("order");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch posts from API with filters
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(POSTS_PER_PAGE),
        sortBy,
        status: statusFilter,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setTotalPosts(data.pagination.total);
        setTotalPages(data.pagination.pages);
      }
    } catch {
      alert("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortBy, statusFilter, searchQuery]);

  // Reset form
  const resetForm = () => {
    setTitle("");
    setImageFile(null);
    setImagePreview("");
    setYtUrl("");
    setProductUrl("");
    setEditingPost(null);
    setValidationErrors({});
  };

  // Open edit dialog
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setImagePreview(post.image);
    setYtUrl(post.yt_url || "");
    setProductUrl(post.product_url);
  };

  const validateImage = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please select an image file (JPG, PNG, GIF, etc.)";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "Image size must be less than 5MB";
    }
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, image: error }));
      return;
    }

    setValidationErrors((prev) => ({ ...prev, image: "" }));
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, image: error }));
      return;
    }

    setValidationErrors((prev) => ({ ...prev, image: "" }));
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleImageDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editingPost) {
        handleUpdatePost();
      } else if (isCreating) {
        handleCreatePost();
      }
    }
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
        resetForm();
        setIsCreating(false);
        await fetchPosts();
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

  const handleUpdatePost = async () => {
    if (!editingPost || !title || !product_url) {
      alert("Please fill required fields: title and product URL");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("yt_url", yt_url);
      formData.append("product_url", product_url);

      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        resetForm();
        await fetchPosts();
        onPostsChange();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update post");
      }
    } catch {
      alert("Failed to update post");
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
        await fetchPosts();
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
        await fetchPosts();
        onPostsChange();
      }
    } catch {
      alert("Failed to delete post");
    }
  };

  // Bulk operations
  const togglePostSelection = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      alert("No posts selected");
      return;
    }

    if (!confirm(`Delete ${selectedPosts.size} selected post(s)?`)) return;

    setLoading(true);
    try {
      const response = await fetch("/api/posts/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedPosts) }),
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedPosts(new Set());
        await fetchPosts();
        onPostsChange();
        alert(
          result.message || `Successfully deleted ${result.deleted} post(s)`
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete posts");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Failed to delete posts");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    if (selectedPosts.size === 0) {
      alert("No posts selected");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/posts/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedPosts),
          active: activate,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedPosts(new Set());
        await fetchPosts();
        onPostsChange();
        alert(
          result.message || `Successfully updated ${result.updated} post(s)`
        );
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update posts");
      }
    } catch (err) {
      console.error("Bulk update error:", err);
      alert("Failed to update posts");
    } finally {
      setLoading(false);
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

    if (sourcePostId === targetPostId) {
      setDraggedItem(null);
      return;
    }

    // Find indices
    const sourceIndex = posts.findIndex((p) => p.id === sourcePostId);
    const targetIndex = posts.findIndex((p) => p.id === targetPostId);

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Reorder locally for immediate feedback
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
        await fetchPosts();
      }
    } catch {
      alert("Failed to save reorder");
      await fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Posts Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage your product posts
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Post
        </Button>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={isCreating} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Post</DialogTitle>
            <p className="text-sm text-gray-500">
              Add a new product post to your feed
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="create-title" className="text-base font-medium">
                Post Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Amazing Wireless Earbuds"
                className="text-base"
              />
              <p className="text-xs text-gray-500">
                Give your post a catchy, descriptive title
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Product Image <span className="text-red-500">*</span>
              </Label>

              {!imagePreview ? (
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleImageDragOver}
                  onDragLeave={handleImageDragLeave}
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                    isDraggingFile
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
                  }`}
                >
                  <input
                    id="create-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="create-image"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative group">
                  <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                    <label
                      htmlFor="create-image"
                      className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Change</span>
                      <input
                        id="create-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium">Remove</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ✓ {imageFile?.name}
                  </p>
                </div>
              )}
              {validationErrors.image && (
                <p className="text-sm text-red-600">{validationErrors.image}</p>
              )}
            </div>

            {/* YouTube URL */}
            <div className="space-y-2">
              <Label
                htmlFor="create-yt"
                className="text-base font-medium flex items-center gap-2"
              >
                <Youtube className="w-4 h-4 text-red-600" />
                YouTube URL{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (Optional)
                </span>
              </Label>
              <Input
                id="create-yt"
                value={yt_url}
                onChange={(e) => setYtUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                className="text-base"
              />
              <p className="text-xs text-gray-500">
                Add a YouTube video to showcase the product
              </p>
            </div>

            {/* Product URL */}
            <div className="space-y-2">
              <Label
                htmlFor="create-product"
                className="text-base font-medium flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Product URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-product"
                value={product_url}
                onChange={(e) => setProductUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://amazon.com/... or https://yourstore.com/product"
                className="text-base"
              />
              <p className="text-xs text-gray-500">
                Where users can purchase this product
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleCreatePost}
                disabled={loading || !title || !imageFile || !product_url}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
                disabled={loading}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPost}
        onOpenChange={(open) => !open && resetForm()}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Post title"
              />
            </div>

            <div>
              <Label htmlFor="edit-image">
                Image {!imageFile && "(keep existing or upload new)"}
              </Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {imageFile ? imageFile.name : "Click to upload new image"}
                  </span>
                  <input
                    id="edit-image"
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
                    {imageFile && (
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(editingPost?.image || "");
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-yt">YouTube URL (Optional)</Label>
              <Input
                id="edit-yt"
                value={yt_url}
                onChange={(e) => setYtUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label htmlFor="edit-product">Product URL *</Label>
              <Input
                id="edit-product"
                value={product_url}
                onChange={(e) => setProductUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com/product"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdatePost} disabled={loading}>
                {loading ? "Updating..." : "Update Post"}
              </Button>
              <Button variant="outline" onClick={() => resetForm()}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value: "all" | "active" | "inactive") => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: "order" | "date" | "title") =>
                setSortBy(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedPosts.size > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {selectedPosts.size} post(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkActivate(true)}
                disabled={loading}
              >
                <Eye className="w-4 h-4 mr-1" />
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkActivate(false)}
                disabled={loading}
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedPosts(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Posts List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Posts ({totalPosts})</h3>
          {posts.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedPosts.size === posts.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {loading ? (
            <Card className="p-8 text-center text-gray-500">
              Loading posts...
            </Card>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              {totalPosts === 0
                ? "No posts yet. Create your first post!"
                : "No posts match your filters."}
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                draggable={sortBy === "order"}
                onDragStart={(e) =>
                  sortBy === "order" && handleDragStart(e, post.id)
                }
                onDragOver={(e) => sortBy === "order" && handleDragOver(e)}
                onDrop={(e) => sortBy === "order" && handleDrop(e, post.id)}
                className={`p-4 transition-all ${
                  draggedItem === post.id
                    ? "opacity-50 border-2 border-blue-500"
                    : selectedPosts.has(post.id)
                    ? "border-2 border-blue-400"
                    : "hover:border-gray-300"
                } ${sortBy === "order" ? "cursor-move" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="flex items-center pt-1">
                    <Checkbox
                      checked={selectedPosts.has(post.id)}
                      onCheckedChange={() => togglePostSelection(post.id)}
                    />
                  </div>

                  {/* Drag Handle */}
                  {sortBy === "order" && (
                    <GripVertical className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                  )}

                  {/* Image Preview */}
                  <div className="relative w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden shrink-0">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Post Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{post.title}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge
                            variant={post.active ? "default" : "secondary"}
                          >
                            {post.active ? "Active" : "Inactive"}
                          </Badge>
                          {post.yt_url && (
                            <Badge variant="outline" className="text-xs">
                              Has Video
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {post.product_url}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created:{" "}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(post.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      title={post.active ? "Deactivate" : "Activate"}
                    >
                      {post.active ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
