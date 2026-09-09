-- Stateside initial schema. Applied automatically by the Netlify deploy
-- (hosted databases) and by netlify/lib/db.ts (local embedded database).

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  headline text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  years_experience integer NOT NULL DEFAULT 0,
  skills text[] NOT NULL DEFAULT '{}',
  open_to_work boolean NOT NULL DEFAULT true,
  veteran_status text NOT NULL DEFAULT 'none', -- none | self_reported | verified
  veteran_branch text NOT NULL DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  website text NOT NULL,
  domain text NOT NULL,
  description text NOT NULL DEFAULT '',
  verification_status text NOT NULL DEFAULT 'unverified', -- unverified | domain_verified | admin_verified | rejected
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS companies_owner_idx ON companies (owner_user_id);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  posted_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  employment_type text NOT NULL, -- full_time | contract | contract_to_hire | part_time
  workplace text NOT NULL,       -- onsite | hybrid | remote
  city text NOT NULL DEFAULT '',
  state text NOT NULL,
  salary_min integer,
  salary_max integer,
  seniority text NOT NULL,       -- mid | senior | lead | principal | manager | director
  skills text[] NOT NULL DEFAULT '{}',
  veteran_preferred boolean NOT NULL DEFAULT false,
  requires_us_work_auth boolean NOT NULL DEFAULT true,
  apply_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending_payment', -- pending_payment | published | closed | removed
  stripe_session_id text,
  paid_at timestamptz,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jobs_status_published_idx ON jobs (status, published_at DESC);
CREATE INDEX IF NOT EXISTS jobs_company_idx ON jobs (company_id);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL UNIQUE,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending', -- pending | paid | demo
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  resume_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted', -- submitted | reviewed | contacted | declined
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- owner | moderator | member
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending | accepted | declined | blocked
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE (requester_id, addressee_id)
);
CREATE INDEX IF NOT EXISTS connections_addressee_idx ON connections (addressee_id, status);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_a, user_b)
);

CREATE TABLE IF NOT EXISTS messages (
  id bigserial PRIMARY KEY,
  channel_type text NOT NULL, -- group | dm
  channel_id uuid NOT NULL,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS messages_channel_idx ON messages (channel_type, channel_id, id);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type text NOT NULL, -- job | user | message | group
  target_id text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users(id),
  resolution text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS reports_open_idx ON reports (resolved_at, created_at DESC);

CREATE TABLE IF NOT EXISTS veteran_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch text NOT NULL,
  service_years text NOT NULL DEFAULT '',
  evidence text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  reviewed_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE TABLE IF NOT EXISTS rate_events (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rate_events_idx ON rate_events (user_id, kind, created_at);
