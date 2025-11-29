import fs from "fs/promises";
import path from "path";
import { Post, PostsData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "posts");

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
  }
}

// Initialize posts file if it doesn't exist
async function initializePostsFile() {
  await ensureDirectories();
  try {
    await fs.access(POSTS_FILE);
  } catch {
    const initialData: PostsData = {
      posts: [],
      version: "1.0.0",
    };
    await fs.writeFile(POSTS_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read all posts with optional pagination
export async function getPosts(
  page?: number,
  limit?: number,
  sortBy?: "order" | "date" | "title",
  statusFilter?: "all" | "active" | "inactive"
): Promise<{ posts: Post[]; total: number; pages: number }> {
  await initializePostsFile();
  try {
    const data = await fs.readFile(POSTS_FILE, "utf-8");
    const parsed: PostsData = JSON.parse(data);
    let posts = parsed.posts;

    // Apply status filter
    if (statusFilter === "active") {
      posts = posts.filter((p) => p.active);
    } else if (statusFilter === "inactive") {
      posts = posts.filter((p) => !p.active);
    }

    // Apply sorting
    if (sortBy === "date") {
      posts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "title") {
      posts.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      posts.sort((a, b) => a.order - b.order);
    }

    const total = posts.length;

    // Apply pagination if specified
    if (page !== undefined && limit !== undefined) {
      const startIndex = (page - 1) * limit;
      posts = posts.slice(startIndex, startIndex + limit);
      const pages = Math.ceil(total / limit);
      return { posts, total, pages };
    }

    return { posts, total, pages: 1 };
  } catch (error) {
    console.error("Error reading posts:", error);
    return { posts: [], total: 0, pages: 0 };
  }
}

// Get all posts without pagination (for internal use)
export async function getAllPosts(): Promise<Post[]> {
  await initializePostsFile();
  try {
    const data = await fs.readFile(POSTS_FILE, "utf-8");
    const parsed: PostsData = JSON.parse(data);
    return parsed.posts;
  } catch (error) {
    console.error("Error reading posts:", error);
    return [];
  }
}

// Get active posts with pagination
export async function getActivePosts(
  skip: number = 0,
  limit: number = 20
): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts
    .filter((post) => post.active)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(skip, skip + limit);
}

// Get total active posts count
export async function getActivePostsCount(): Promise<number> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.active).length;
}

// Create a new post
export async function createPost(
  postData: Omit<Post, "id" | "createdAt" | "active" | "order">
): Promise<Post> {
  await initializePostsFile();
  const posts = await getAllPosts();
  const newPost: Post = {
    ...postData,
    id: Date.now().toString(),
    active: true,
    createdAt: new Date().toISOString(),
    order: posts.length,
  };
  posts.push(newPost);
  await savePostsData(posts);
  return newPost;
}

// Update a post
export async function updatePost(
  id: string,
  updates: Partial<Post>
): Promise<Post | null> {
  await initializePostsFile();
  const posts = await getAllPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated = { ...posts[index], ...updates, id: posts[index].id };
  posts[index] = updated;
  await savePostsData(posts);
  return updated;
}

// Delete a post
export async function deletePost(id: string): Promise<boolean> {
  await initializePostsFile();
  const posts = await getAllPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) return false;

  // Delete associated image if it exists
  if (post.image) {
    await deleteImage(post.image).catch(() => {});
  }

  const filtered = posts.filter((p) => p.id !== id);
  await savePostsData(filtered);
  return true;
}

// Bulk delete posts
export async function bulkDeletePosts(
  ids: string[]
): Promise<{ success: boolean; deleted: number }> {
  await initializePostsFile();
  const posts = await getAllPosts();
  const postsToDelete = posts.filter((p) => ids.includes(p.id));

  // Delete associated images
  await Promise.all(
    postsToDelete.map((post) =>
      post.image ? deleteImage(post.image).catch(() => {}) : Promise.resolve()
    )
  );

  const filtered = posts.filter((p) => !ids.includes(p.id));
  await savePostsData(filtered);
  return { success: true, deleted: postsToDelete.length };
}

// Toggle post active status
export async function togglePostStatus(id: string): Promise<Post | null> {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) return null;

  post.active = !post.active;
  await savePostsData(posts);
  return post;
}

// Bulk update posts status
export async function bulkUpdatePostsStatus(
  ids: string[],
  active: boolean
): Promise<{ success: boolean; updated: number }> {
  await initializePostsFile();
  const posts = await getAllPosts();
  let updated = 0;

  posts.forEach((post) => {
    if (ids.includes(post.id)) {
      post.active = active;
      updated++;
    }
  });

  if (updated > 0) {
    await savePostsData(posts);
  }

  return { success: true, updated };
}

// Save posts data
async function savePostsData(posts: Post[]) {
  await ensureDirectories();
  const data: PostsData = {
    posts,
    version: "1.0.0",
  };
  await fs.writeFile(POSTS_FILE, JSON.stringify(data, null, 2));
}

// Create backup
export async function createBackup(): Promise<string> {
  await initializePostsFile();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = `backup-${timestamp}.json`;
  const backupPath = path.join(BACKUPS_DIR, backupName);

  const postsData = await fs.readFile(POSTS_FILE, "utf-8");
  await fs.writeFile(backupPath, postsData);

  return backupName;
}

// Get all backups
export async function getBackups(): Promise<
  { name: string; date: string; size: number }[]
> {
  await ensureDirectories();
  try {
    const files = await fs.readdir(BACKUPS_DIR);
    const backups = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(BACKUPS_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          date: stats.mtime.toISOString(),
          size: stats.size,
        };
      })
    );
    return backups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error reading backups:", error);
    return [];
  }
}

// Import backup
export async function importBackup(backupName: string): Promise<boolean> {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupName);
    await fs.access(backupPath);

    const backupData = await fs.readFile(backupPath, "utf-8");
    await fs.writeFile(POSTS_FILE, backupData);

    return true;
  } catch (error) {
    console.error("Error importing backup:", error);
    return false;
  }
}

// Delete backup
export async function deleteBackup(backupName: string): Promise<boolean> {
  try {
    const backupPath = path.join(BACKUPS_DIR, backupName);
    await fs.unlink(backupPath);
    return true;
  } catch (error) {
    console.error("Error deleting backup:", error);
    return false;
  }
}

// Save image file
export async function saveImage(
  buffer: Buffer,
  originalFilename: string
): Promise<string> {
  await ensureDirectories();

  // Generate unique filename
  const timestamp = Date.now();
  const ext = path.extname(originalFilename);
  const filename = `${timestamp}-${Math.random()
    .toString(36)
    .substring(7)}${ext}`;

  const filepath = path.join(IMAGES_DIR, filename);
  await fs.writeFile(filepath, buffer);

  // Return relative path for public access
  return `/images/posts/${filename}`;
}

// Delete image file
export async function deleteImage(imagePath: string): Promise<boolean> {
  try {
    // Extract filename from the path
    const filename = imagePath.split("/").pop();
    if (!filename) return false;

    const filepath = path.join(IMAGES_DIR, filename);
    await fs.unlink(filepath);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

// Save backup file from uploaded content
export async function saveBackupFile(
  content: string,
  customName?: string
): Promise<string> {
  await ensureDirectories();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = customName || `imported-${timestamp}.json`;
  const backupPath = path.join(BACKUPS_DIR, backupName);

  await fs.writeFile(backupPath, content);

  return backupName;
}

// Reorder posts
export async function reorderPosts(postIds: string[]): Promise<boolean> {
  try {
    const { posts } = await getPosts();

    // Create a map of posts by id
    const postMap = new Map(posts.map((p) => [p.id, p]));

    // Reorder based on the provided ids
    const reorderedPosts = postIds
      .map((id) => postMap.get(id))
      .filter((post) => post !== undefined) as Post[];

    // Update order field for each post
    reorderedPosts.forEach((post, index) => {
      post.order = index;
    });

    // Add any posts that weren't in the reorder list (shouldn't happen, but be safe)
    const reorderedIds = new Set(postIds);
    posts.forEach((post) => {
      if (!reorderedIds.has(post.id) && !reorderedPosts.includes(post)) {
        post.order = reorderedPosts.length;
        reorderedPosts.push(post);
      }
    });

    await savePostsData(reorderedPosts);
    return true;
  } catch {
    console.error("Error reordering posts");
    return false;
  }
}
