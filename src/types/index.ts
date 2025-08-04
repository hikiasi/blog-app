export interface User {
  id: number;
  username: string;
}

export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  is_public: boolean;
  is_request_only: boolean;
  author: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  comments_count: number;
  comments?: Comment[];
}

export interface Tag {
  name: string;
  count: number;
}

export interface AuthResponse {
  user: User;
  token: string;
} 