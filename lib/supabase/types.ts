export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string
          role: 'admin' | 'member' | 'owner'
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          role?: 'admin' | 'member' | 'owner'
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          role?: 'admin' | 'member' | 'owner'
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          npwp: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          npwp?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          npwp?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          team_id: string
          role: 'admin' | 'member' | 'owner'
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          role?: 'admin' | 'member' | 'owner'
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          role?: 'admin' | 'member' | 'owner'
          joined_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          user_id: string
          team_id: string
          name: string
          phone: string | null
          license_plate: string | null
          role: 'main' | 'assistant' | 'backup'
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          name: string
          phone?: string | null
          license_plate?: string | null
          role?: 'main' | 'assistant' | 'backup'
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          name?: string
          phone?: string | null
          license_plate?: string | null
          role?: 'main' | 'assistant' | 'backup'
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers_suppliers: {
        Row: {
          id: string
          team_id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          npwp: string | null
          siup: string | null
          role: 'customer' | 'supplier'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          npwp?: string | null
          siup?: string | null
          role: 'customer' | 'supplier'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          npwp?: string | null
          siup?: string | null
          role?: 'customer' | 'supplier'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      delivery_notes: {
        Row: {
          id: string
          team_id: string
          dn_number: string
          status: 'draft' | 'printed' | 'delivered' | 'cancelled'
          delivery_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          dn_number: string
          status?: 'draft' | 'printed' | 'delivered' | 'cancelled'
          delivery_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          dn_number?: string
          status?: 'draft' | 'printed' | 'delivered' | 'cancelled'
          delivery_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      delivery_items: {
        Row: {
          id: string
          delivery_note_id: string
          item_number: number
          description: string
          quantity: number
          unit: string | null
          price: number | null
          subtotal: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          delivery_note_id: string
          item_number: number
          description: string
          quantity: number
          unit?: string | null
          price?: number | null
          subtotal?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          delivery_note_id?: string
          item_number?: number
          description?: string
          quantity?: number
          unit?: string | null
          price?: number | null
          subtotal?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          team_id: string
          order_number: string
          customer_supplier_id: string
          order_date: string
          delivery_date: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'canceled'
          total_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          order_number: string
          customer_supplier_id: string
          order_date: string
          delivery_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'canceled'
          total_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          order_number?: string
          customer_supplier_id?: string
          order_date?: string
          delivery_date?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'canceled'
          total_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          team_id: string
          invoice_number: string
          order_id: string | null
          customer_supplier_id: string
          invoice_date: string
          due_date: string | null
          status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
          subtotal: number
          tax: number | null
          total: number
          paid_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          invoice_number: string
          order_id?: string | null
          customer_supplier_id: string
          invoice_date: string
          due_date?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
          subtotal: number
          tax?: number | null
          total: number
          paid_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          invoice_number?: string
          order_id?: string | null
          customer_supplier_id?: string
          invoice_date?: string
          due_date?: string | null
          status?: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
          subtotal?: number
          tax?: number | null
          total?: number
          paid_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          item_number: number
          description: string
          quantity: number
          unit: string | null
          unit_price: number
          subtotal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          item_number: number
          description: string
          quantity: number
          unit?: string | null
          unit_price: number
          subtotal: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          item_number?: number
          description?: string
          quantity?: number
          unit?: string | null
          unit_price?: number
          subtotal?: number
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          team_id: string
          user_id: string | null
          action: string
          timestamp: string
          ip_address: string | null
        }
        Insert: {
          id?: string
          team_id: string
          user_id?: string | null
          action: string
          timestamp?: string
          ip_address?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string | null
          action?: string
          timestamp?: string
          ip_address?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          team_id: string
          email: string
          role: 'admin' | 'member' | 'owner'
          invited_by: string
          invited_at: string
          status: string
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          role?: 'admin' | 'member' | 'owner'
          invited_by: string
          invited_at?: string
          status?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role?: 'admin' | 'member' | 'owner'
          invited_by?: string
          invited_at?: string
          status?: string
        }
      }
    }
    Enums: {
      driver_role_enum: 'main' | 'assistant' | 'backup'
      dn_status_enum: 'draft' | 'printed' | 'delivered' | 'cancelled'
      delivery_status_enum: 'pending' | 'in_progress' | 'completed' | 'canceled'
      invoice_status_enum: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
      role_enum: 'supplier' | 'customer'
      role_team_enum: 'admin' | 'member' | 'owner'
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Driver = Database['public']['Tables']['drivers']['Row']
export type CustomerSupplier = Database['public']['Tables']['customers_suppliers']['Row']
export type DeliveryNote = Database['public']['Tables']['delivery_notes']['Row']
export type DeliveryItem = Database['public']['Tables']['delivery_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type Invitation = Database['public']['Tables']['invitations']['Row']

// User type for compatibility with existing code
export type User = {
  id: string
  email: string | undefined
  name: string | null
  role: 'admin' | 'member' | 'owner'
  teamId: string | undefined
  phone: string | null
  image: string | null
}

export type TeamDataWithMembers = Team & {
  members: Array<{
    id: string
    role: string
    joinedAt: string
    user: {
      id: string
      name: string | null
      email: string
    } | null
  }>
}
