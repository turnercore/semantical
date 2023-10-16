export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          name: string | null
          used_count: number
          user_id: string
        }
        Insert: {
          id?: string
          name?: string | null
          used_count?: number
          user_id?: string
        }
        Update: {
          id?: string
          name?: string | null
          used_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          deleted: boolean | null
          description: string | null
          downloaded_count: number | null
          embeddings: string[] | null
          id: string
          knowledgebase: string | null
          length: number
          link: string | null
          name: string | null
          tags: string[] | null
          tokens: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          downloaded_count?: number | null
          embeddings?: string[] | null
          id?: string
          knowledgebase?: string | null
          length?: number
          link?: string | null
          name?: string | null
          tags?: string[] | null
          tokens?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted?: boolean | null
          description?: string | null
          downloaded_count?: number | null
          embeddings?: string[] | null
          id?: string
          knowledgebase?: string | null
          length?: number
          link?: string | null
          name?: string | null
          tags?: string[] | null
          tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      embeddings: {
        Row: {
          created_at: string
          document_id: string
          embedding: number[]
          id: string
          knowledgebase: string
          length: number
          location: number | null
          model: string | null
          retrieved_count: number
          tags: string[] | null
          text: string
          tokens: number
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          embedding: number[]
          id?: string
          knowledgebase?: string
          length?: number
          location?: number | null
          model?: string | null
          retrieved_count?: number
          tags?: string[] | null
          text: string
          tokens?: number
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          embedding?: number[]
          id?: string
          knowledgebase?: string
          length?: number
          location?: number | null
          model?: string | null
          retrieved_count?: number
          tags?: string[] | null
          text?: string
          tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embeddings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          openai_tokens_used: number
          stripe_customer_id: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          openai_tokens_used?: number
          stripe_customer_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          openai_tokens_used?: number
          stripe_customer_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
