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
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          preferences: Json
        }
        Insert: {
          id: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          preferences?: Json
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          preferences?: Json
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          emoji: string
          category: string | null
          shelf_life_days: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          emoji?: string
          category?: string | null
          shelf_life_days?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          emoji?: string
          category?: string | null
          shelf_life_days?: number | null
          created_at?: string
        }
      }
      fridge_items: {
        Row: {
          id: string
          user_id: string
          ingredient_id: string | null
          name: string
          emoji: string
          quantity: string
          category: string
          added_at: string
          expires_at: string | null
          is_expiring_soon: boolean
          is_expired: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ingredient_id?: string | null
          name: string
          emoji?: string
          quantity?: string
          category?: string
          added_at?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ingredient_id?: string | null
          name?: string
          emoji?: string
          quantity?: string
          category?: string
          added_at?: string
          expires_at?: string | null
          created_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          cooking_time_minutes: number | null
          difficulty: string | null
          cuisine_type: string | null
          image_url: string | null
          instructions: Json
          tips: Json
          is_ai_generated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          cooking_time_minutes?: number | null
          difficulty?: string | null
          cuisine_type?: string | null
          image_url?: string | null
          instructions?: Json
          tips?: Json
          is_ai_generated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          cooking_time_minutes?: number | null
          difficulty?: string | null
          cuisine_type?: string | null
          image_url?: string | null
          instructions?: Json
          tips?: Json
          is_ai_generated?: boolean
          created_at?: string
        }
      }
      saved_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          cooked_count: number
          notes: string | null
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          cooked_count?: number
          notes?: string | null
          saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          cooked_count?: number
          notes?: string | null
          saved_at?: string
        }
      }
      scan_history: {
        Row: {
          id: string
          user_id: string
          image_url: string | null
          detected_items: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url?: string | null
          detected_items?: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string | null
          detected_items?: Json
          status?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          type: string
          related_item_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          type?: string
          related_item_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string | null
          type?: string
          related_item_id?: string | null
          is_read?: boolean
          created_at?: string
        }
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
  }
}
