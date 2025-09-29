-- 002_schema.sql

-- user_profiles extends auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('student','company')),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_verified BOOLEAN DEFAULT TRUE,
  avatar TEXT,
  -- student fields
  university TEXT,
  year INTEGER,
  major TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 5.0,
  completed_projects INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  resume_uploaded BOOLEAN DEFAULT FALSE,
  resume_url TEXT,
  resume_analysis JSONB,
  available_hours INTEGER DEFAULT 20,
  -- company fields
  company_name TEXT,
  industry TEXT,
  website TEXT,
  contact_person TEXT,
  posted_projects INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  payment_method TEXT
);

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS user_id UUID GENERATED ALWAYS AS (id) STORED;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget INTEGER NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  duration TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_rating DECIMAL(3,2) DEFAULT 5.0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in-progress','review','completed','cancelled')),
  bids_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  assigned_to TEXT
);

-- bids
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_rating DECIMAL(3,2) DEFAULT 5.0,
  amount INTEGER NOT NULL,
  proposal TEXT NOT NULL,
  timeline TEXT NOT NULL,
  delivery_time INTEGER NOT NULL DEFAULT 7,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  project_title TEXT,
  last_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT FALSE,
  conversation_id TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  file_data TEXT
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bid','project','message','payment','system','rating_request')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
  action_url TEXT,
  metadata JSONB
);

-- opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internship','job','freelance')),
  created_at TIMESTAMPTZ DEFAULT now(),
  deadline TIMESTAMPTZ
);

-- escrows
CREATE TABLE IF NOT EXISTS public.escrows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  student_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','assigned','locked','released','refunded')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  assigned_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ
);

-- wallets
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  total_deposited INTEGER NOT NULL DEFAULT 0,
  total_withdrawn INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT,
  from_user_id TEXT,
  to_user_id TEXT,
  wallet_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment','refund','withdrawal','deposit','escrow_assignment','escrow_release')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  description TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  escrow_id UUID REFERENCES public.escrows(id) ON DELETE SET NULL,
  bank_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- bank_accounts
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking','savings')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- helper function example
CREATE OR REPLACE FUNCTION public.increment_bids_count(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.projects SET bids_count = bids_count + 1 WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;
