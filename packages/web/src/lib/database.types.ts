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
          created_at: string
          updated_at: string
          email: string
          name: string | null
          avatar_url: string | null
          role: string
          organization: string | null
          department: string | null
          phone: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: string
          organization?: string | null
          department?: string | null
          phone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: string
          organization?: string | null
          department?: string | null
          phone?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_sessions: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          factor_id: string | null
          aal: string | null
          not_after: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
