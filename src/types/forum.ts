import { RoleBrief, Role, UserBrief } from './auth';

export interface PostFull {
  id: number;
  author: Role;
  title: string;
  content: string;
  type: number;
  media_type: number;
  alias: string;
  images: number[];
  image_items: { id: number; key: string }[];
  video_item: { id: number; play_token: string; vcode: string };
  tags: string[];
  read_count: number;
  comment_count: number;
  coin_count: number;
  coin_record: number;
  liked: boolean;
  like_count: number;
  liked_by: RoleBrief[];
  is_edited: boolean;
  source: string;
  review_status: number;
  review_message: any[];
  share_with: number;
  pinned: boolean;
  create_time: string;
  edit_time: string;
  update_time: string;
  deleted?: boolean;
  allow_comment: boolean;
  current_version: number;
  latest_version: number;
  real_version: number;
  brief_content?: string;
}

export interface PostComment {
  id: number;
  author: RoleBrief;
  children: PostComment[];
  children_count: number;
  liked: boolean;
  parent: number | null;
  content: string | null;
  deleted: boolean;
  depth: number;
  like_count: number;
  review_status: number;
  create_time: string;
  update_time: string;
  post?: PostFull;
  reply_to: {
    id: number;
    author: RoleBrief;
  } | null;
  hidden: boolean;
  pinned: boolean;
  review_message?: any[];
  user?: UserBrief;
  preview?: boolean;
}
