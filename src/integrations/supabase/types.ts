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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_name: string
          account_number: string
          available_balance: number
          balance: number
          created_at: string
          currency: string
          iban: string | null
          id: string
          is_primary: boolean
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          account_name?: string
          account_number: string
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          iban?: string | null
          id?: string
          is_primary?: boolean
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          iban?: string | null
          id?: string
          is_primary?: boolean
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          account_number: string | null
          address: string | null
          bank_name: string | null
          country: string | null
          created_at: string
          currency: string
          email: string | null
          iban: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          phone: string | null
          swift_code: string | null
          updated_at: string
          vendor_type: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          phone?: string | null
          swift_code?: string | null
          updated_at?: string
          vendor_type?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          email?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          phone?: string | null
          swift_code?: string | null
          updated_at?: string
          vendor_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      card_controls: {
        Row: {
          allowed_categories: string[] | null
          atm_enabled: boolean
          blocked_categories: string[] | null
          card_id: string
          contactless_enabled: boolean
          daily_limit: number | null
          id: string
          international_enabled: boolean
          monthly_limit: number | null
          online_enabled: boolean
          per_transaction_limit: number | null
          updated_at: string
        }
        Insert: {
          allowed_categories?: string[] | null
          atm_enabled?: boolean
          blocked_categories?: string[] | null
          card_id: string
          contactless_enabled?: boolean
          daily_limit?: number | null
          id?: string
          international_enabled?: boolean
          monthly_limit?: number | null
          online_enabled?: boolean
          per_transaction_limit?: number | null
          updated_at?: string
        }
        Update: {
          allowed_categories?: string[] | null
          atm_enabled?: boolean
          blocked_categories?: string[] | null
          card_id?: string
          contactless_enabled?: boolean
          daily_limit?: number | null
          id?: string
          international_enabled?: boolean
          monthly_limit?: number | null
          online_enabled?: boolean
          per_transaction_limit?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_controls_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_transactions: {
        Row: {
          amount: number
          card_id: string
          created_at: string
          currency: string
          declined_reason: string | null
          id: string
          merchant_category: string | null
          merchant_name: string | null
          status: Database["public"]["Enums"]["transaction_status"]
        }
        Insert: {
          amount: number
          card_id: string
          created_at?: string
          currency?: string
          declined_reason?: string | null
          id?: string
          merchant_category?: string | null
          merchant_name?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Update: {
          amount?: number
          card_id?: string
          created_at?: string
          currency?: string
          declined_reason?: string | null
          id?: string
          merchant_category?: string | null
          merchant_name?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
        }
        Relationships: [
          {
            foreignKeyName: "card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string | null
          assigned_to: string | null
          card_number_last4: string | null
          card_type: Database["public"]["Enums"]["card_type"]
          cardholder_name: string
          created_at: string
          expires_at: string | null
          id: string
          monthly_limit: number | null
          organization_id: string
          spending_limit: number | null
          status: Database["public"]["Enums"]["card_status"]
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          assigned_to?: string | null
          card_number_last4?: string | null
          card_type?: Database["public"]["Enums"]["card_type"]
          cardholder_name: string
          created_at?: string
          expires_at?: string | null
          id?: string
          monthly_limit?: number | null
          organization_id: string
          spending_limit?: number | null
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          assigned_to?: string | null
          card_number_last4?: string | null
          card_type?: Database["public"]["Enums"]["card_type"]
          cardholder_name?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          monthly_limit?: number | null
          organization_id?: string
          spending_limit?: number | null
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_prequalifications: {
        Row: {
          assessed_at: string
          eligibility_reason: string | null
          expires_at: string | null
          id: string
          max_eligible_amount: number | null
          organization_id: string
          status: Database["public"]["Enums"]["credit_status"]
        }
        Insert: {
          assessed_at?: string
          eligibility_reason?: string | null
          expires_at?: string | null
          id?: string
          max_eligible_amount?: number | null
          organization_id: string
          status?: Database["public"]["Enums"]["credit_status"]
        }
        Update: {
          assessed_at?: string
          eligibility_reason?: string | null
          expires_at?: string | null
          id?: string
          max_eligible_amount?: number | null
          organization_id?: string
          status?: Database["public"]["Enums"]["credit_status"]
        }
        Relationships: [
          {
            foreignKeyName: "credit_prequalifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_requests: {
        Row: {
          approved_amount: number | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          id: string
          interest_rate: number | null
          organization_id: string
          purpose: string | null
          repayment_preference: string | null
          requested_amount: number
          status: Database["public"]["Enums"]["credit_status"]
          term_months: number | null
          updated_at: string
        }
        Insert: {
          approved_amount?: number | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          interest_rate?: number | null
          organization_id: string
          purpose?: string | null
          repayment_preference?: string | null
          requested_amount: number
          status?: Database["public"]["Enums"]["credit_status"]
          term_months?: number | null
          updated_at?: string
        }
        Update: {
          approved_amount?: number | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          interest_rate?: number | null
          organization_id?: string
          purpose?: string | null
          repayment_preference?: string | null
          requested_amount?: number
          status?: Database["public"]["Enums"]["credit_status"]
          term_months?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category: string | null
          created_at: string
          currency: string
          description: string | null
          expense_date: string
          id: string
          needs_approval: boolean
          organization_id: string
          receipt_url: string | null
          status: Database["public"]["Enums"]["expense_status"]
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          expense_date?: string
          id?: string
          needs_approval?: boolean
          organization_id: string
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          expense_date?: string
          id?: string
          needs_approval?: boolean
          organization_id?: string
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          organization_id: string
          paid_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total: number
          updated_at: string
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kyb_applications: {
        Row: {
          business_activity: string | null
          company_name: string | null
          created_at: string
          directors: Json | null
          expected_monthly_volume: number | null
          id: string
          jurisdiction: string | null
          legal_form: Database["public"]["Enums"]["legal_form"] | null
          organization_id: string
          registered_address: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["kyb_status"]
          submitted_at: string | null
          trade_license_number: string | null
          ubos: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_activity?: string | null
          company_name?: string | null
          created_at?: string
          directors?: Json | null
          expected_monthly_volume?: number | null
          id?: string
          jurisdiction?: string | null
          legal_form?: Database["public"]["Enums"]["legal_form"] | null
          organization_id: string
          registered_address?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyb_status"]
          submitted_at?: string | null
          trade_license_number?: string | null
          ubos?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_activity?: string | null
          company_name?: string | null
          created_at?: string
          directors?: Json | null
          expected_monthly_volume?: number | null
          id?: string
          jurisdiction?: string | null
          legal_form?: Database["public"]["Enums"]["legal_form"] | null
          organization_id?: string
          registered_address?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyb_status"]
          submitted_at?: string | null
          trade_license_number?: string | null
          ubos?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyb_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kyb_documents: {
        Row: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          kyb_application_id: string
          uploaded_at: string
        }
        Insert: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          kyb_application_id: string
          uploaded_at?: string
        }
        Update: {
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          kyb_application_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyb_documents_kyb_application_id_fkey"
            columns: ["kyb_application_id"]
            isOneToOne: false
            referencedRelation: "kyb_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      kyb_events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kyb_application_id: string
          note: string | null
          status: Database["public"]["Enums"]["kyb_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kyb_application_id: string
          note?: string | null
          status: Database["public"]["Enums"]["kyb_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kyb_application_id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["kyb_status"]
        }
        Relationships: [
          {
            foreignKeyName: "kyb_events_kyb_application_id_fkey"
            columns: ["kyb_application_id"]
            isOneToOne: false
            referencedRelation: "kyb_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          business_activity: string | null
          created_at: string
          expected_monthly_volume: number | null
          id: string
          jurisdiction: string | null
          legal_form: Database["public"]["Enums"]["legal_form"] | null
          name: string
          owner_id: string | null
          registered_address: string | null
          trade_license_number: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          business_activity?: string | null
          created_at?: string
          expected_monthly_volume?: number | null
          id?: string
          jurisdiction?: string | null
          legal_form?: Database["public"]["Enums"]["legal_form"] | null
          name: string
          owner_id?: string | null
          registered_address?: string | null
          trade_license_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          business_activity?: string | null
          created_at?: string
          expected_monthly_volume?: number | null
          id?: string
          jurisdiction?: string | null
          legal_form?: Database["public"]["Enums"]["legal_form"] | null
          name?: string
          owner_id?: string | null
          registered_address?: string | null
          trade_license_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      payment_links: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          expires_at: string | null
          id: string
          is_paid: boolean
          link_code: string
          organization_id: string
          paid_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_paid?: boolean
          link_code: string
          organization_id: string
          paid_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_paid?: boolean
          link_code?: string
          organization_id?: string
          paid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          account_id: string | null
          amount: number
          approved_by: string | null
          beneficiary_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          id: string
          organization_id: string
          processed_at: string | null
          purpose: string | null
          reference: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          approved_by?: string | null
          beneficiary_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          organization_id: string
          processed_at?: string | null
          purpose?: string | null
          reference?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          approved_by?: string | null
          beneficiary_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          organization_id?: string
          processed_at?: string | null
          purpose?: string | null
          reference?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          counterparty_account: string | null
          counterparty_name: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          account_id: string
          amount: number
          category?: string | null
          counterparty_account?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          counterparty_account?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
      card_status: "requested" | "active" | "frozen" | "cancelled" | "expired"
      card_type: "physical" | "virtual"
      credit_status:
        | "not_eligible"
        | "pre_qualified"
        | "applied"
        | "under_review"
        | "approved"
        | "rejected"
        | "active"
        | "closed"
      document_type:
        | "trade_license"
        | "moa"
        | "passport"
        | "emirates_id"
        | "proof_of_address"
        | "bank_statement"
        | "other"
      expense_status: "pending" | "approved" | "rejected" | "reimbursed"
      invoice_status:
        | "draft"
        | "sent"
        | "viewed"
        | "paid"
        | "overdue"
        | "cancelled"
      kyb_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "needs_info"
        | "approved"
        | "account_ready"
        | "rejected"
      legal_form:
        | "fz_llc"
        | "llc"
        | "sole_establishment"
        | "branch"
        | "free_zone"
        | "other"
      payment_status:
        | "draft"
        | "pending_approval"
        | "scheduled"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      transaction_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      transaction_type: "credit" | "debit"
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
      card_status: ["requested", "active", "frozen", "cancelled", "expired"],
      card_type: ["physical", "virtual"],
      credit_status: [
        "not_eligible",
        "pre_qualified",
        "applied",
        "under_review",
        "approved",
        "rejected",
        "active",
        "closed",
      ],
      document_type: [
        "trade_license",
        "moa",
        "passport",
        "emirates_id",
        "proof_of_address",
        "bank_statement",
        "other",
      ],
      expense_status: ["pending", "approved", "rejected", "reimbursed"],
      invoice_status: [
        "draft",
        "sent",
        "viewed",
        "paid",
        "overdue",
        "cancelled",
      ],
      kyb_status: [
        "draft",
        "submitted",
        "in_review",
        "needs_info",
        "approved",
        "account_ready",
        "rejected",
      ],
      legal_form: [
        "fz_llc",
        "llc",
        "sole_establishment",
        "branch",
        "free_zone",
        "other",
      ],
      payment_status: [
        "draft",
        "pending_approval",
        "scheduled",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      transaction_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      transaction_type: ["credit", "debit"],
    },
  },
} as const
