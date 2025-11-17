export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_availability: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_available: boolean
          last_seen_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_available?: boolean
          last_seen_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_available?: boolean
          last_seen_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_availability_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_clients: {
        Row: {
          agent_id: string
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_clients_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_commissions: {
        Row: {
          agent_id: string
          base_fare: number
          booking_id: string
          commission_amount: number
          commission_rate: number
          created_at: string | null
          currency: string | null
          id: string
          paid_at: string | null
          payout_status: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          agent_id: string
          base_fare: number
          booking_id: string
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          payout_status?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          agent_id?: string
          base_fare?: number
          booking_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          payout_status?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_commissions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_feedback: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          message: string
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_feedback_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          agent_code: string
          commission_rate: number | null
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          gst_number: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          status: string | null
          stripe_connect_account_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_code: string
          commission_rate?: number | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          status?: string | null
          stripe_connect_account_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_code?: string
          commission_rate?: number | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          status?: string | null
          stripe_connect_account_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_wallet: {
        Row: {
          agent_id: string
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          last_topup_at: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_topup_at?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_topup_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_wallet_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agent_id: string | null
          amadeus_order_id: string | null
          amadeus_pnr: string | null
          amount: number
          booking_details: Json
          booking_type: Database["public"]["Enums"]["booking_type"]
          confirmed_at: string | null
          contact_email: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          currency: string
          fare_validated_at: string | null
          hold_expiry: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          refund_amount: number | null
          refund_reason: string | null
          refund_status: string | null
          status: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          ticket_issued_at: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          amadeus_order_id?: string | null
          amadeus_pnr?: string | null
          amount: number
          booking_details: Json
          booking_type: Database["public"]["Enums"]["booking_type"]
          confirmed_at?: string | null
          contact_email: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          fare_validated_at?: string | null
          hold_expiry?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_status?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          ticket_issued_at?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          amadeus_order_id?: string | null
          amadeus_pnr?: string | null
          amount?: number
          booking_details?: Json
          booking_type?: Database["public"]["Enums"]["booking_type"]
          confirmed_at?: string | null
          contact_email?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          fare_validated_at?: string | null
          hold_expiry?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_status?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          ticket_issued_at?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          agent_id: string | null
          closed_at: string | null
          created_at: string
          id: string
          last_message_at: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
          sender_type?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          airline: string
          airline_code: string | null
          bookings_count: number | null
          class: string
          clicks_count: number | null
          created_at: string | null
          currency: string | null
          date_from: string
          date_to: string
          description: string | null
          dest_city: string
          dest_code: string
          featured: boolean | null
          id: string
          images: Json | null
          notes: string | null
          origin_city: string
          origin_code: string
          original_price_usd: number
          price_usd: number
          published: boolean | null
          short_description: string | null
          slug: string
          source: string | null
          tags: Json | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          airline: string
          airline_code?: string | null
          bookings_count?: number | null
          class?: string
          clicks_count?: number | null
          created_at?: string | null
          currency?: string | null
          date_from: string
          date_to: string
          description?: string | null
          dest_city: string
          dest_code: string
          featured?: boolean | null
          id?: string
          images?: Json | null
          notes?: string | null
          origin_city: string
          origin_code: string
          original_price_usd: number
          price_usd: number
          published?: boolean | null
          short_description?: string | null
          slug: string
          source?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          airline?: string
          airline_code?: string | null
          bookings_count?: number | null
          class?: string
          clicks_count?: number | null
          created_at?: string | null
          currency?: string | null
          date_from?: string
          date_to?: string
          description?: string | null
          dest_city?: string
          dest_code?: string
          featured?: boolean | null
          id?: string
          images?: Json | null
          notes?: string | null
          origin_city?: string
          origin_code?: string
          original_price_usd?: number
          price_usd?: number
          published?: boolean | null
          short_description?: string | null
          slug?: string
          source?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_login: string | null
          login_method: string | null
          name: string | null
          profile_image: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          last_login?: string | null
          login_method?: string | null
          name?: string | null
          profile_image?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_login?: string | null
          login_method?: string | null
          name?: string | null
          profile_image?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      site_review_helpful: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "site_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      site_reviews: {
        Row: {
          body: string
          created_at: string
          display_name: string
          helpful_count: number
          id: string
          is_deleted: boolean
          is_featured: boolean
          rating: number
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          display_name: string
          helpful_count?: number
          id?: string
          is_deleted?: boolean
          is_featured?: boolean
          rating: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          display_name?: string
          helpful_count?: number
          id?: string
          is_deleted?: boolean
          is_featured?: boolean
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          agent_id: string
          amount: number
          balance_after: number | null
          booking_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          stripe_payment_intent_id: string | null
          type: string
        }
        Insert: {
          agent_id: string
          amount: number
          balance_after?: number | null
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          stripe_payment_intent_id?: string | null
          type: string
        }
        Update: {
          agent_id?: string
          amount?: number
          balance_after?: number | null
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          stripe_payment_intent_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          provider: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          provider: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          provider?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "agent"
      booking_status: "pending_payment" | "confirmed" | "cancelled" | "refunded"
      booking_type: "flight" | "hotel" | "car"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "agent"],
      booking_status: ["pending_payment", "confirmed", "cancelled", "refunded"],
      booking_type: ["flight", "hotel", "car"],
    },
  },
} as const
