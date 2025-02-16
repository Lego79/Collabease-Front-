// src/types/common.types.ts
export interface PaginationParams {
    page: number;
    size: number;
    sort?: string;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
  }
  
