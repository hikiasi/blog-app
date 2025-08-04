import axios from 'axios';
import { Post, Comment, Tag, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', { username, password });
    return response.data;
  },

  signin: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/signin', { username, password });
    return response.data;
  },
};

export const postsAPI = {
  getPosts: async (params: { tag?: string; author?: string; feed?: string } = {}): Promise<{ posts: Post[] }> => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  getPost: async (postId: number): Promise<{ post: Post }> => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  createPost: async (data: { title: string; content: string; tags: string[]; visibility: string }): Promise<{ post: Post }> => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  updatePost: async (postId: number, data: { title: string; content: string; tags: string[]; visibility: string }): Promise<{ message: string }> => {
    const response = await api.put(`/posts/${postId}`, data);
    return response.data;
  },

  deletePost: async (postId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
};

export const commentsAPI = {
  addComment: async (postId: number, content: string): Promise<{ comment: Comment }> => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },
};

export const followAPI = {
  followUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.post(`/follow/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/follow/${userId}`);
    return response.data;
  },

  getFollowStatus: async (userId: number): Promise<{ isFollowing: boolean }> => {
    const response = await api.get(`/follow/${userId}/status`);
    return response.data;
  },

  getUserStats: async (userId: number): Promise<{ following: number; followers: number }> => {
    const response = await api.get(`/follow/${userId}/stats`);
    return response.data;
  },
};

export const tagsAPI = {
  getTags: async (): Promise<{ tags: Tag[] }> => {
    const response = await api.get('/tags');
    return response.data;
  },
};

export default api; 