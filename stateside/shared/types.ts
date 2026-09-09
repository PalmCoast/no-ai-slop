export interface PublicUser {
  id: string;
  name: string;
  headline: string;
  bio: string;
  city: string;
  state: string;
  years_experience: number;
  skills: string[];
  open_to_work: boolean;
  veteran_status: "none" | "self_reported" | "verified";
  veteran_branch: string;
  created_at: string;
}

export interface Me extends PublicUser {
  email: string;
  is_admin: boolean;
  has_company: boolean;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  domain: string;
  description: string;
  verification_status: "unverified" | "domain_verified" | "admin_verified" | "rejected";
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  company_name: string;
  company_verification: Company["verification_status"];
  title: string;
  description: string;
  employment_type: string;
  workplace: string;
  city: string;
  state: string;
  salary_min: number | null;
  salary_max: number | null;
  seniority: string;
  skills: string[];
  veteran_preferred: boolean;
  requires_us_work_auth: boolean;
  apply_url: string;
  status: "pending_payment" | "published" | "closed" | "removed";
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  veteran_window: boolean;
  applied?: boolean;
  saved?: boolean;
  application_count?: number;
}

export interface Applicant extends PublicUser {
  application_id: string;
  note: string;
  resume_url: string;
  application_status: string;
  applied_at: string;
}

export interface Group {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  member_count: number;
  my_role: "owner" | "moderator" | "member" | null;
}

export interface Message {
  id: number;
  sender_id: string;
  sender_name: string;
  sender_veteran: string;
  body: string;
  created_at: string;
}

export interface Connection {
  id: string;
  status: "pending" | "accepted" | "declined" | "blocked";
  direction: "incoming" | "outgoing";
  user: PublicUser;
  created_at: string;
}

export interface Conversation {
  id: string;
  other: PublicUser;
  last_message: string | null;
  last_at: string | null;
}

export interface Report {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  reporter_name: string;
  created_at: string;
  resolved_at: string | null;
  resolution: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: string[];
}
