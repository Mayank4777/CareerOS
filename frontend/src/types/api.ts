export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[] | string> | string[] | string;
}

export interface ApiError {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[] | string> | string[] | string;
}
