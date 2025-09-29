-- 006_constraints.sql

-- .edu constraint for students
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS chk_user_profiles_student_edu;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT chk_user_profiles_student_edu
  CHECK (
    type <> 'student' OR email ~* '\\.edu$'
  ) NOT VALID;

-- Unique email (optional, but recommended)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname='public' AND t.relname='user_profiles' AND c.conname='user_profiles_email_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;
