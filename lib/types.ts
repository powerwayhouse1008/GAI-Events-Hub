export type UserRole = "member" | "organizer" | "admin";
export type ApprovalStatus = "none" | "pending" | "approved" | "rejected";
export type EventStatus = "pending" | "published" | "rejected" | "draft";
export type RegistrationStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  role: UserRole;
  organizer_status: ApprovalStatus;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  organizer_id: string;
  organizer_name: string | null;
  category: string | null;
  region: string | null;
  location: string | null;
  online_url: string | null;
  cover_url: string | null;
  theme_color?: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  ticket_price: number | null;
  approval_mode: "manual" | "auto";
  status: EventStatus;
  featured: boolean;
  created_at: string;
};

export type Registration = {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  message: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  event_id: string;
  organizer_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type EventDocument = {
  id: string;
  event_id: string;
  organizer_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};
