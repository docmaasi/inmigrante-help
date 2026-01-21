export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: string;
          onboarding_completed: boolean;
          legal_accepted_at: string | null;
          subscription_status: string;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          onboarding_completed?: boolean;
          legal_accepted_at?: string | null;
          subscription_status?: string;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          onboarding_completed?: boolean;
          legal_accepted_at?: string | null;
          subscription_status?: string;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_recipients: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string | null;
          gender: string | null;
          photo_url: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          phone: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relationship: string | null;
          medical_conditions: string[] | null;
          allergies: string[] | null;
          blood_type: string | null;
          insurance_provider: string | null;
          insurance_policy_number: string | null;
          primary_physician: string | null;
          primary_physician_phone: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          date_of_birth?: string | null;
          gender?: string | null;
          photo_url?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          phone?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relationship?: string | null;
          medical_conditions?: string[] | null;
          allergies?: string[] | null;
          blood_type?: string | null;
          insurance_provider?: string | null;
          insurance_policy_number?: string | null;
          primary_physician?: string | null;
          primary_physician_phone?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string | null;
          gender?: string | null;
          photo_url?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          phone?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relationship?: string | null;
          medical_conditions?: string[] | null;
          allergies?: string[] | null;
          blood_type?: string | null;
          insurance_provider?: string | null;
          insurance_policy_number?: string | null;
          primary_physician?: string | null;
          primary_physician_phone?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          user_id: string;
          invited_user_id: string | null;
          email: string;
          full_name: string;
          phone: string | null;
          role: string;
          status: string;
          permissions: Json;
          care_recipient_ids: string[] | null;
          invited_at: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invited_user_id?: string | null;
          email: string;
          full_name: string;
          phone?: string | null;
          role?: string;
          status?: string;
          permissions?: Json;
          care_recipient_ids?: string[] | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          invited_user_id?: string | null;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role?: string;
          status?: string;
          permissions?: Json;
          care_recipient_ids?: string[] | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string;
          title: string;
          description: string | null;
          appointment_type: string | null;
          provider_name: string | null;
          provider_phone: string | null;
          location: string | null;
          start_time: string;
          end_time: string | null;
          all_day: boolean;
          reminder_minutes: number;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id: string;
          title: string;
          description?: string | null;
          appointment_type?: string | null;
          provider_name?: string | null;
          provider_phone?: string | null;
          location?: string | null;
          start_time: string;
          end_time?: string | null;
          all_day?: boolean;
          reminder_minutes?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string;
          title?: string;
          description?: string | null;
          appointment_type?: string | null;
          provider_name?: string | null;
          provider_phone?: string | null;
          location?: string | null;
          start_time?: string;
          end_time?: string | null;
          all_day?: boolean;
          reminder_minutes?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string;
          name: string;
          generic_name: string | null;
          dosage: string | null;
          dosage_unit: string | null;
          form: string | null;
          route: string | null;
          frequency: string | null;
          times_per_day: number | null;
          schedule_times: string[] | null;
          instructions: string | null;
          prescriber: string | null;
          pharmacy: string | null;
          pharmacy_phone: string | null;
          rx_number: string | null;
          start_date: string | null;
          end_date: string | null;
          refills_remaining: number | null;
          quantity: number | null;
          is_active: boolean;
          is_prn: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id: string;
          name: string;
          generic_name?: string | null;
          dosage?: string | null;
          dosage_unit?: string | null;
          form?: string | null;
          route?: string | null;
          frequency?: string | null;
          times_per_day?: number | null;
          schedule_times?: string[] | null;
          instructions?: string | null;
          prescriber?: string | null;
          pharmacy?: string | null;
          pharmacy_phone?: string | null;
          rx_number?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          refills_remaining?: number | null;
          quantity?: number | null;
          is_active?: boolean;
          is_prn?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string;
          name?: string;
          generic_name?: string | null;
          dosage?: string | null;
          dosage_unit?: string | null;
          form?: string | null;
          route?: string | null;
          frequency?: string | null;
          times_per_day?: number | null;
          schedule_times?: string[] | null;
          instructions?: string | null;
          prescriber?: string | null;
          pharmacy?: string | null;
          pharmacy_phone?: string | null;
          rx_number?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          refills_remaining?: number | null;
          quantity?: number | null;
          is_active?: boolean;
          is_prn?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medication_logs: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          care_recipient_id: string;
          administered_by: string | null;
          scheduled_time: string | null;
          administered_time: string | null;
          status: string;
          dosage_given: string | null;
          notes: string | null;
          skipped_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_id: string;
          care_recipient_id: string;
          administered_by?: string | null;
          scheduled_time?: string | null;
          administered_time?: string | null;
          status?: string;
          dosage_given?: string | null;
          notes?: string | null;
          skipped_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_id?: string;
          care_recipient_id?: string;
          administered_by?: string | null;
          scheduled_time?: string | null;
          administered_time?: string | null;
          status?: string;
          dosage_given?: string | null;
          notes?: string | null;
          skipped_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medication_refills: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          requested_date: string | null;
          filled_date: string | null;
          quantity: number | null;
          pharmacy: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_id: string;
          requested_date?: string | null;
          filled_date?: string | null;
          quantity?: number | null;
          pharmacy?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_id?: string;
          requested_date?: string | null;
          filled_date?: string | null;
          quantity?: number | null;
          pharmacy?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string | null;
          assigned_to: string | null;
          title: string;
          description: string | null;
          category: string | null;
          priority: string;
          status: string;
          due_date: string | null;
          completed_at: string | null;
          completed_by: string | null;
          recurring: boolean;
          recurrence_pattern: string | null;
          parent_task_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id?: string | null;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          category?: string | null;
          priority?: string;
          status?: string;
          due_date?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          recurring?: boolean;
          recurrence_pattern?: string | null;
          parent_task_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string | null;
          assigned_to?: string | null;
          title?: string;
          description?: string | null;
          category?: string | null;
          priority?: string;
          status?: string;
          due_date?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          recurring?: boolean;
          recurrence_pattern?: string | null;
          parent_task_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_plans: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string;
          title: string;
          description: string | null;
          status: string;
          start_date: string | null;
          end_date: string | null;
          goals: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id: string;
          title: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          goals?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          start_date?: string | null;
          end_date?: string | null;
          goals?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_plan_details: {
        Row: {
          id: string;
          care_plan_id: string;
          section: string;
          content: Json | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          care_plan_id: string;
          section: string;
          content?: Json | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          care_plan_id?: string;
          section?: string;
          content?: Json | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_notes: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string;
          author_id: string | null;
          title: string | null;
          content: string;
          category: string | null;
          mood: string | null;
          vitals: Json | null;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id: string;
          author_id?: string | null;
          title?: string | null;
          content: string;
          category?: string | null;
          mood?: string | null;
          vitals?: Json | null;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string;
          author_id?: string | null;
          title?: string | null;
          content?: string;
          category?: string | null;
          mood?: string | null;
          vitals?: Json | null;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          type: string;
          participant_ids: string[] | null;
          care_recipient_id: string | null;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          type?: string;
          participant_ids?: string[] | null;
          care_recipient_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          type?: string;
          participant_ids?: string[] | null;
          care_recipient_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: string;
          attachments: Json | null;
          read_by: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: string;
          attachments?: Json | null;
          read_by?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          message_type?: string;
          attachments?: Json | null;
          read_by?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string | null;
          type: string | null;
          reference_type: string | null;
          reference_id: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message?: string | null;
          type?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string | null;
          type?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string | null;
          name: string;
          description: string | null;
          file_path: string;
          file_type: string | null;
          file_size: number | null;
          category: string | null;
          tags: string[] | null;
          is_shared: boolean;
          shared_with: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id?: string | null;
          name: string;
          description?: string | null;
          file_path: string;
          file_type?: string | null;
          file_size?: number | null;
          category?: string | null;
          tags?: string[] | null;
          is_shared?: boolean;
          shared_with?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string | null;
          name?: string;
          description?: string | null;
          file_path?: string;
          file_type?: string | null;
          file_size?: number | null;
          category?: string | null;
          tags?: string[] | null;
          is_shared?: boolean;
          shared_with?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          plan_id: string | null;
          plan_name: string | null;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          plan_id?: string | null;
          plan_name?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          plan_id?: string | null;
          plan_name?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      receipts: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          stripe_invoice_id: string | null;
          stripe_payment_intent_id: string | null;
          amount: number;
          currency: string;
          status: string | null;
          description: string | null;
          invoice_pdf_url: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          stripe_invoice_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount: number;
          currency?: string;
          status?: string | null;
          description?: string | null;
          invoice_pdf_url?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          stripe_invoice_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount?: number;
          currency?: string;
          status?: string | null;
          description?: string | null;
          invoice_pdf_url?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
      };
      caregiver_shifts: {
        Row: {
          id: string;
          user_id: string;
          team_member_id: string | null;
          care_recipient_id: string | null;
          start_time: string;
          end_time: string;
          status: string;
          notes: string | null;
          handoff_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_member_id?: string | null;
          care_recipient_id?: string | null;
          start_time: string;
          end_time: string;
          status?: string;
          notes?: string | null;
          handoff_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_member_id?: string | null;
          care_recipient_id?: string | null;
          start_time?: string;
          end_time?: string;
          status?: string;
          notes?: string | null;
          handoff_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      caregiver_availability: {
        Row: {
          id: string;
          user_id: string;
          team_member_id: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_member_id?: string | null;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_member_id?: string | null;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_tasks: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string;
          title: string;
          description: string | null;
          category: string | null;
          frequency: string | null;
          time_of_day: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          frequency?: string | null;
          time_of_day?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          frequency?: string | null;
          time_of_day?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      external_communications: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string | null;
          contact_name: string;
          contact_type: string | null;
          contact_info: string | null;
          communication_type: string | null;
          direction: string | null;
          subject: string | null;
          content: string | null;
          occurred_at: string | null;
          follow_up_required: boolean;
          follow_up_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id?: string | null;
          contact_name: string;
          contact_type?: string | null;
          contact_info?: string | null;
          communication_type?: string | null;
          direction?: string | null;
          subject?: string | null;
          content?: string | null;
          occurred_at?: string | null;
          follow_up_required?: boolean;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string | null;
          contact_name?: string;
          contact_type?: string | null;
          contact_info?: string | null;
          communication_type?: string | null;
          direction?: string | null;
          subject?: string | null;
          content?: string | null;
          occurred_at?: string | null;
          follow_up_required?: boolean;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_announcements: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          priority: string;
          is_pinned: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          priority?: string;
          is_pinned?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          priority?: string;
          is_pinned?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      legal_acceptances: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          document_version: string;
          accepted_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: string;
          document_version: string;
          accepted_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_type?: string;
          document_version?: string;
          accepted_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      onboarding_progress: {
        Row: {
          id: string;
          user_id: string;
          current_step: number;
          completed_steps: number[];
          data: Json;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_step?: number;
          completed_steps?: number[];
          data?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_step?: number;
          completed_steps?: number[];
          data?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      widget_preferences: {
        Row: {
          id: string;
          user_id: string;
          widget_id: string;
          is_visible: boolean;
          position: number | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          widget_id: string;
          is_visible?: boolean;
          position?: number | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          widget_id?: string;
          is_visible?: boolean;
          position?: number | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_access: {
        Row: {
          id: string;
          user_id: string;
          care_recipient_id: string;
          access_code: string;
          permissions: Json;
          is_active: boolean;
          last_accessed_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          care_recipient_id: string;
          access_code: string;
          permissions?: Json;
          is_active?: boolean;
          last_accessed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          care_recipient_id?: string;
          access_code?: string;
          permissions?: Json;
          is_active?: boolean;
          last_accessed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      action_logs: {
        Row: {
          id: string;
          user_id: string | null;
          actor_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          actor_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          actor_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Entity type aliases for easier migration
export type Profile = Tables<'profiles'>;
export type CareRecipient = Tables<'care_recipients'>;
export type TeamMember = Tables<'team_members'>;
export type Appointment = Tables<'appointments'>;
export type Medication = Tables<'medications'>;
export type MedicationLog = Tables<'medication_logs'>;
export type MedicationRefill = Tables<'medication_refills'>;
export type Task = Tables<'tasks'>;
export type TaskComment = Tables<'task_comments'>;
export type CarePlan = Tables<'care_plans'>;
export type CarePlanDetail = Tables<'care_plan_details'>;
export type CareNote = Tables<'care_notes'>;
export type Conversation = Tables<'conversations'>;
export type Message = Tables<'messages'>;
export type Notification = Tables<'notifications'>;
export type Document = Tables<'documents'>;
export type Subscription = Tables<'subscriptions'>;
export type Receipt = Tables<'receipts'>;
export type CaregiverShift = Tables<'caregiver_shifts'>;
export type CaregiverAvailability = Tables<'caregiver_availability'>;
export type CareTask = Tables<'care_tasks'>;
export type ExternalCommunication = Tables<'external_communications'>;
export type TeamAnnouncement = Tables<'team_announcements'>;
export type LegalAcceptance = Tables<'legal_acceptances'>;
export type OnboardingProgress = Tables<'onboarding_progress'>;
export type WidgetPreference = Tables<'widget_preferences'>;
export type ClientAccess = Tables<'client_access'>;
export type ActionLog = Tables<'action_logs'>;
