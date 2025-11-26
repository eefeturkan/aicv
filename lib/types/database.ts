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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cv_analyses: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_url: string
          file_size: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_url: string
          file_size?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      analysis_results: {
        Row: {
          id: string
          cv_analysis_id: string
          overall_score: number | null
          summary: string | null
          strengths: Json
          weaknesses: Json
          improvements: Json
          section_scores: Json
          keywords: Json
          ai_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cv_analysis_id: string
          overall_score?: number | null
          summary?: string | null
          strengths?: Json
          weaknesses?: Json
          improvements?: Json
          section_scores?: Json
          keywords?: Json
          ai_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cv_analysis_id?: string
          overall_score?: number | null
          summary?: string | null
          strengths?: Json
          weaknesses?: Json
          improvements?: Json
          section_scores?: Json
          keywords?: Json
          ai_feedback?: string | null
          created_at?: string
        }
      }
      user_credits: {
        Row: {
          id: string
          user_id: string
          credits: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credits?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credits?: number
          updated_at?: string
        }
      }
    }
  }
}
