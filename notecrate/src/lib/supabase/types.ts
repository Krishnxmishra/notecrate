export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          image?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          name: string;
          parent_id: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          parent_id?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          parent_id?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "folders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      highlights: {
        Row: {
          id: string;
          text: string;
          source_title: string;
          source_url: string;
          color: string;
          type: string;
          image_url: string | null;
          video_id: string | null;
          video_timestamp: string | null;
          folder_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          source_title: string;
          source_url: string;
          color?: string;
          type?: string;
          image_url?: string | null;
          video_id?: string | null;
          video_timestamp?: string | null;
          folder_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          source_title?: string;
          source_url?: string;
          color?: string;
          type?: string;
          image_url?: string | null;
          video_id?: string | null;
          video_timestamp?: string | null;
          folder_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "highlights_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "highlights_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          role: string;
          content: string;
          folder_id: string;
          user_id: string;
          created_at: string;
          artifact_title: string | null;
          artifact_content: string | null;
          artifact_type: string | null;
        };
        Insert: {
          id?: string;
          role: string;
          content: string;
          folder_id: string;
          user_id: string;
          created_at?: string;
          artifact_title?: string | null;
          artifact_content?: string | null;
          artifact_type?: string | null;
        };
        Update: {
          id?: string;
          role?: string;
          content?: string;
          folder_id?: string;
          user_id?: string;
          created_at?: string;
          artifact_title?: string | null;
          artifact_content?: string | null;
          artifact_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "folders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
