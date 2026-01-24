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
          username: string
          role: 'admin' | 'teacher'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          role: 'admin' | 'teacher'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          role?: 'admin' | 'teacher'
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          student_id: string
          first_name: string
          last_name: string
          grade_level: number
          section: string
          email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          first_name: string
          last_name: string
          grade_level: number
          section: string
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          first_name?: string
          last_name?: string
          grade_level?: number
          section?: string
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      partylists: {
        Row: {
          id: string
          name: string
          acronym: string | null
          description: string | null
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          acronym?: string | null
          description?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          acronym?: string | null
          description?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          name: string
          description: string | null
          display_order: number
          max_votes: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          display_order?: number
          max_votes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          display_order?: number
          max_votes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          student_id: string
          position_id: string
          partylist_id: string | null
          platform: string | null
          photo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          position_id: string
          partylist_id?: string | null
          platform?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          position_id?: string
          partylist_id?: string | null
          platform?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      elections: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          status: 'draft' | 'open' | 'closed'
          allow_abstain: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          status?: 'draft' | 'open' | 'closed'
          allow_abstain?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          status?: 'draft' | 'open' | 'closed'
          allow_abstain?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          election_id: string
          student_id: string
          candidate_id: string
          position_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          election_id: string
          student_id: string
          candidate_id: string
          position_id: string
          voted_at?: string
        }
        Update: {
          id?: string
          election_id?: string
          student_id?: string
          candidate_id?: string
          position_id?: string
          voted_at?: string
        }
      }
      voting_sessions: {
        Row: {
          id: string
          election_id: string
          student_id: string
          has_voted: boolean
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          election_id: string
          student_id: string
          has_voted?: boolean
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          election_id?: string
          student_id?: string
          has_voted?: boolean
          started_at?: string
          completed_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          changes: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_student_voted: {
        Args: {
          p_election_id: string
          p_student_id: string
        }
        Returns: boolean
      }
      get_election_results: {
        Args: {
          p_election_id: string
        }
        Returns: {
          position_id: string
          position_name: string
          candidate_id: string
          candidate_name: string
          partylist_name: string
          vote_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
