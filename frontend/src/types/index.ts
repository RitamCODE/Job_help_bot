export type JobScore = {
  id: number;
  profile_id: number;
  fit_score: number;
  fit_label: string;
  summary: string;
  top_matches: string[];
  missing_skills: string[];
  red_flags: string[];
  recommendation: string;
  resume_keywords: string[];
  resume_tailoring_suggestions: string[];
  outreach_message?: string | null;
};

export type JobNote = {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: number;
  source: string;
  title: string;
  company: string;
  location?: string | null;
  remote_type: string;
  employment_type?: string | null;
  experience_level?: string | null;
  description: string;
  url: string;
  posted_at?: string | null;
  status: string;
  tags: string[];
  scores: JobScore[];
  notes: JobNote[];
};

export type Profile = {
  id: number;
  name: string;
  description?: string | null;
  target_roles: string[];
  preferred_locations: string[];
  remote_preference?: string | null;
  target_keywords: string[];
  avoid_keywords: string[];
  skills: string[];
  company_preferences: string[];
  seniority_preferences: string[];
  authorization_notes?: string | null;
  scoring_weights: Record<string, number>;
  is_active: boolean;
};

export type Resume = {
  id: number;
  name: string;
  variant_type?: string | null;
  text_content: string;
  tags: string[];
  is_default: boolean;
};

export type Source = {
  id: number;
  name: string;
  connector_type: string;
  display_name: string;
  config: Record<string, unknown>;
  is_enabled: boolean;
  sync_interval_minutes: number;
  last_status?: string | null;
  last_synced_at?: string | null;
};

export type ConnectorRun = {
  id: number;
  connector_name: string;
  status: string;
  message?: string | null;
  fetched_count: number;
  created_count: number;
  deduped_count: number;
  started_at: string;
  completed_at?: string | null;
};

export type AnalyticsSummary = {
  total_jobs: number;
  jobs_by_status: Record<string, number>;
  jobs_by_source: Record<string, number>;
  profile_score_averages: Record<string, number>;
  recent_runs: number;
};
