export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          type: 'client' | 'barber' | 'admin'
          full_name: string
          cpf: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          type: 'client' | 'barber' | 'admin'
          full_name: string
          cpf?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'client' | 'barber' | 'admin'
          full_name?: string
          cpf?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      barbers: {
        Row: {
          id: string
          bio: string | null
          instagram_url: string | null
          document_url: string | null
          selfie_url: string | null
          status: 'pending' | 'verified' | 'suspended' | 'banned'
          rating_avg: number
          rating_count: number
          service_radius_km: number
          base_address: string | null
          base_lat: number | null
          base_lng: number | null
          stripe_account_id: string | null
          warnings_count: number
          created_at: string
        }
        Insert: {
          id: string
          bio?: string | null
          instagram_url?: string | null
          document_url?: string | null
          selfie_url?: string | null
          status?: 'pending' | 'verified' | 'suspended' | 'banned'
          rating_avg?: number
          rating_count?: number
          service_radius_km?: number
          base_address?: string | null
          base_lat?: number | null
          base_lng?: number | null
          stripe_account_id?: string | null
          warnings_count?: number
          created_at?: string
        }
        Update: {
          bio?: string | null
          instagram_url?: string | null
          document_url?: string | null
          selfie_url?: string | null
          status?: 'pending' | 'verified' | 'suspended' | 'banned'
          rating_avg?: number
          rating_count?: number
          service_radius_km?: number
          base_address?: string | null
          base_lat?: number | null
          base_lng?: number | null
          stripe_account_id?: string | null
          warnings_count?: number
        }
        Relationships: []
      }
      barber_services: {
        Row: {
          id: string
          barber_id: string
          service_type: 'haircut' | 'beard' | 'combo' | 'treatment'
          name: string
          price: number
          duration_minutes: number
          active: boolean
        }
        Insert: {
          id?: string
          barber_id: string
          service_type: 'haircut' | 'beard' | 'combo' | 'treatment'
          name: string
          price: number
          duration_minutes: number
          active?: boolean
        }
        Update: {
          service_type?: 'haircut' | 'beard' | 'combo' | 'treatment'
          name?: string
          price?: number
          duration_minutes?: number
          active?: boolean
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          default_address: string | null
          default_lat: number | null
          default_lng: number | null
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          default_address?: string | null
          default_lat?: number | null
          default_lng?: number | null
          stripe_customer_id?: string | null
        }
        Update: {
          default_address?: string | null
          default_lat?: number | null
          default_lng?: number | null
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          barber_id: string
          service_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'no_show_client' | 'no_show_barber'
          address: string
          lat: number
          lng: number
          scheduled_at: string | null
          distance_km: number
          service_price: number
          travel_fee: number
          total_amount: number
          platform_fee: number
          barber_payout: number
          stripe_payment_intent_id: string | null
          check_in_at: string | null
          check_out_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          barber_id: string
          service_id: string
          status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'no_show_client' | 'no_show_barber'
          address: string
          lat: number
          lng: number
          scheduled_at?: string | null
          distance_km: number
          service_price: number
          travel_fee: number
          total_amount: number
          platform_fee: number
          barber_payout: number
          stripe_payment_intent_id?: string | null
          check_in_at?: string | null
          check_out_at?: string | null
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'no_show_client' | 'no_show_barber'
          scheduled_at?: string | null
          stripe_payment_intent_id?: string | null
          check_in_at?: string | null
          check_out_at?: string | null
        }
        Relationships: []
      }
      booking_time_suggestions: {
        Row: {
          id: string
          booking_id: string
          suggested_at: string
          proposed_by: 'client' | 'barber'
        }
        Insert: {
          id?: string
          booking_id: string
          suggested_at: string
          proposed_by: 'client' | 'barber'
        }
        Update: Record<string, never>
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewed_id: string
          rating: number
          comment: string | null
          portfolio_photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          reviewer_id: string
          reviewed_id: string
          rating: number
          comment?: string | null
          portfolio_photo_url?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          booking_id: string
          sender_id: string
          content: string
          blocked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          sender_id: string
          content: string
          blocked?: boolean
          created_at?: string
        }
        Update: {
          blocked?: boolean
        }
        Relationships: []
      }
      bypass_flags: {
        Row: {
          id: string
          booking_id: string
          reason: string
          reviewed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          reason: string
          reviewed?: boolean
          created_at?: string
        }
        Update: {
          reviewed?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_barber_warnings: {
        Args: { barber_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
