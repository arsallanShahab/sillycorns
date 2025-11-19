export interface Post {
  id: string;
  title: string;
  image: string;
  yt_url: string;
  product_url: string;
  active: boolean;
  createdAt: string;
}

export interface PostsData {
  posts: Post[];
  version: string;
}
