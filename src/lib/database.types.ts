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
      players: {
        Row: {
          id: string
          username: string
          credits: number
          torcoins: number
          level: number
          experience: number
          max_concurrent_jobs: number
          last_refresh: string | null
          reputation: Json
          skills: Json
          equipment: Json
          inventory: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          credits?: number
          torcoins?: number
          level?: number
          experience?: number
          max_concurrent_jobs?: number
          last_refresh?: string | null
          reputation?: Json
          skills?: Json
          equipment?: Json
          inventory?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          credits?: number
          torcoins?: number
          level?: number
          experience?: number
          max_concurrent_jobs?: number
          last_refresh?: string | null
          reputation?: Json
          skills?: Json
          equipment?: Json
          inventory?: Json
          created_at?: string | null
          updated_at?: string | null
        }
      }
      player_jobs: {
        Row: {
          id: string
          player_id: string | null
          job_id: string
          status: string
          progress: number
          start_time: string | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id?: string | null
          job_id: string
          status?: string
          progress?: number
          start_time?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string | null
          job_id?: string
          status?: string
          progress?: number
          start_time?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
      }
      player_events: {
        Row: {
          id: string
          player_id: string | null
          event_id: string
          status: string
          last_attempt: string | null
          next_available: string | null
          completed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          player_id?: string | null
          event_id: string
          status?: string
          last_attempt?: string | null
          next_available?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          player_id?: string | null
          event_id?: string
          status?: string
          last_attempt?: string | null
          next_available?: string | null
          completed_at?: string | null
          created_at?: string | null
        }
      }
    }
  }
}