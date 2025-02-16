
import { PaginationParams } from "./common.type";
  // src/types/post.types.ts
  export interface Post {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      username: string;
    };
    community: {
      id: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
    votes: number;
    commentCount: number;
  }
  
  export interface PostCreate {
    title: string;
    content: string;
    communityId: string;
  }
  
  export interface PostUpdate {
    title?: string;
    content?: string;
  }
  
  export interface PostSearchParams extends PaginationParams {
    keyword?: string;
    communityId?: string;
    authorId?: string;
  }
  
