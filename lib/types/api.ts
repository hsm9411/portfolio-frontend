/**
 * API 타입 정의
 * 백엔드 DTO와 일치하는 타입 정의
 */

// ============================================
// Common Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// User & Auth
// ============================================

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    avatarUrl: string | null;
    isAdmin: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

// ============================================
// Project
// ============================================

export type ProjectStatus = 'in-progress' | 'completed' | 'archived';

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string; // Markdown
  thumbnailUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  techStack: string[];
  tags: string[];
  status: ProjectStatus;
  viewCount: number;
  likeCount: number;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl?: string;
  startDate?: string; // ISO 8601
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  summary: string;
  description: string;
  thumbnailUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  techStack: string[];
  tags?: string[];
  status?: ProjectStatus;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface GetProjectsRequest {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  sortBy?: 'created_at' | 'view_count' | 'like_count';
  order?: 'ASC' | 'DESC';
}

// ============================================
// Post
// ============================================

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown
  thumbnailUrl?: string;
  category: string; // 'tutorial', 'essay', 'review', 'news'
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime?: number;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  summary?: string;
  category: 'tutorial' | 'essay' | 'review' | 'news';
  tags?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface GetPostsRequest {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
}

// ============================================
// Comment
// ============================================

export type CommentTargetType = 'project' | 'post';

export interface Comment {
  id: string;
  content: string;
  targetType: CommentTargetType;
  targetId: string;
  isAnonymous: boolean;
  isMine: boolean; // 내가 작성한 댓글인지 여부
  user: {
    id: string | null; // 익명이면 null
    nickname: string; // 익명이면 "익명"
    avatarUrl: string | null;
  };
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  isAnonymous?: boolean;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// ============================================
// Like
// ============================================

export type LikeTargetType = 'project' | 'post';

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}

// ============================================
// API Error
// ============================================

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
