import { AxiosError } from "axios";

export interface ApiResponse<T = any> {
  status: number;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
  status: number;
  data: T[];
  pagination: Pagination;
  message?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiError {
  message?: string | AxiosError;
  error?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
