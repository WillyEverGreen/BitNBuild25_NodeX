-- Enable Row Level Security and define policies

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Clean existing policies (idempotent-ish)
DO $$
BEGIN
  -- user_profiles
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='Users can view their own profile';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their own profile" ON public.user_profiles'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='Users can insert their own profile';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can insert their own profile" ON public.user_profiles'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='Users can update their own profile';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their own profile" ON public.user_profiles'; END IF;
END $$;

-- user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- projects
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Anyone can view projects';
  IF FOUND THEN EXECUTE 'DROP POLICY "Anyone can view projects" ON public.projects'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Authenticated users can insert projects';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can insert projects" ON public.projects'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects' AND policyname='Users can update their own projects';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their own projects" ON public.projects'; END IF;
END $$;
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');

-- bids
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='bids' AND policyname='Anyone can view bids';
  IF FOUND THEN EXECUTE 'DROP POLICY "Anyone can view bids" ON public.bids'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='bids' AND policyname='Authenticated users can insert bids';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can insert bids" ON public.bids'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='bids' AND policyname='Authenticated users can update bids';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can update bids" ON public.bids'; END IF;
END $$;
CREATE POLICY "Anyone can view bids" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert bids" ON public.bids FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update bids" ON public.bids FOR UPDATE USING (auth.role() = 'authenticated');

-- conversations
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversations' AND policyname='Users can view their conversations';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their conversations" ON public.conversations'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversations' AND policyname='Users can insert conversations';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can insert conversations" ON public.conversations'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversations' AND policyname='Users can update conversations';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update conversations" ON public.conversations'; END IF;
END $$;
CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Users can insert conversations" ON public.conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update conversations" ON public.conversations FOR UPDATE USING (true);

-- messages
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can view their messages';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their messages" ON public.messages'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can send messages';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can send messages" ON public.messages'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can update their messages';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their messages" ON public.messages'; END IF;
END $$;
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their messages" ON public.messages FOR UPDATE USING (true);

-- notifications
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users can view their notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their notifications" ON public.notifications'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Anyone can insert notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Anyone can insert notifications" ON public.notifications'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users can update their notifications';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their notifications" ON public.notifications'; END IF;
END $$;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (true);

-- opportunities
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Anyone can view opportunities';
  IF FOUND THEN EXECUTE 'DROP POLICY "Anyone can view opportunities" ON public.opportunities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Authenticated users can insert opportunities';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can insert opportunities" ON public.opportunities'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='opportunities' AND policyname='Authenticated users can update opportunities';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can update opportunities" ON public.opportunities'; END IF;
END $$;
CREATE POLICY "Anyone can view opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update opportunities" ON public.opportunities FOR UPDATE USING (auth.role() = 'authenticated');

-- escrows
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='escrows' AND policyname='Authenticated users can view escrows';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can view escrows" ON public.escrows'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='escrows' AND policyname='Authenticated users can insert escrows';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can insert escrows" ON public.escrows'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='escrows' AND policyname='Authenticated users can update escrows';
  IF FOUND THEN EXECUTE 'DROP POLICY "Authenticated users can update escrows" ON public.escrows'; END IF;
END $$;
CREATE POLICY "Authenticated users can view escrows" ON public.escrows FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert escrows" ON public.escrows FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update escrows" ON public.escrows FOR UPDATE USING (auth.role() = 'authenticated');

-- wallets
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='wallets' AND policyname='Users can view their own wallets';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their own wallets" ON public.wallets'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='wallets' AND policyname='Users can insert wallets';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can insert wallets" ON public.wallets'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='wallets' AND policyname='Users can update their own wallets';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their own wallets" ON public.wallets'; END IF;
END $$;
CREATE POLICY "Users can view their own wallets" ON public.wallets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert wallets" ON public.wallets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own wallets" ON public.wallets FOR UPDATE USING (auth.role() = 'authenticated');

-- transactions
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='transactions' AND policyname='Users can view transactions';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view transactions" ON public.transactions'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='transactions' AND policyname='Users can insert transactions';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can insert transactions" ON public.transactions'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='transactions' AND policyname='Users can update transactions';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update transactions" ON public.transactions'; END IF;
END $$;
CREATE POLICY "Users can view transactions" ON public.transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert transactions" ON public.transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update transactions" ON public.transactions FOR UPDATE USING (auth.role() = 'authenticated');

-- bank_accounts
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='bank_accounts' AND policyname='Users can view their own bank accounts';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can view their own bank accounts" ON public.bank_accounts'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='bank_accounts' AND policyname='Users can insert bank accounts';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can insert bank accounts" ON public.bank_accounts'; END IF;
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='bank_accounts' AND policyname='Users can update their own bank accounts';
  IF FOUND THEN EXECUTE 'DROP POLICY "Users can update their own bank accounts" ON public.bank_accounts'; END IF;
END $$;
CREATE POLICY "Users can view their own bank accounts" ON public.bank_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert bank accounts" ON public.bank_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own bank accounts" ON public.bank_accounts FOR UPDATE USING (auth.role() = 'authenticated');
