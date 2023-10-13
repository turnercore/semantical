// UUID type imported from 'crypto' library
import type { UUID as CryptoUUID } from 'crypto';

// Re-exporting the UUID type for use in this file
export type UUID = CryptoUUID;

export type User = {
    id: UUID;
    email: string;
    phone: string;
    provider: string;
    created_at: Date;
    last_sign_in: Date;
};

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';

export type UserProfile = {
    id?: UUID;
    name?: string;
    email?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    website?: string;
    stripe_customer_id?: string;
    openai_tokens_used?: number;
};

export interface ServerError {
    message: string;
    status: number;
}

export interface StandardResponse {
    error?: {
      message: string;
      status: number;
    };
    data?: any;
  };

export interface Profile {
  id: UUID;
  username: string;
  full_name: string;
  avatar_url: string;
  website: string;
  user_id: UUID;
}