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
  job_title: string | null;
  phone_number: string | null;
  role: UserRole;
  organizer_status: ApprovalStatus;
  deleted_at?: string | null;
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

export type EventNotification = {
  id: string;
  event_id: string;
  user_id: string;
  actor_id: string | null;
  type: "announcement" | "document" | "event_update";
  title: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
};

export type EventVote = {
  id: string;
  event_id: string;
  user_id: string;
  value: -1 | 1;
  created_at: string;
  updated_at: string;
};

export type EventComment = {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  hidden: boolean;
  hidden_by: string | null;
  hidden_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
    company_name: string | null;
  } | null;
};

export type EventCommentRestriction = {
  id: string;
  event_id: string;
  user_id: string;
  restricted_by: string | null;
  reason: string | null;
  created_at: string;
};
