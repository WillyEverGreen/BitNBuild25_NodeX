-- Constraints and validations

-- Enforce .edu emails for students on user_profiles
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS chk_user_profiles_student_edu;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT chk_user_profiles_student_edu
  CHECK (
    type <> 'student' OR email ~* '\\.edu$'
  );

-- Optional: ensure user_profiles.email uniqueness to prevent duplicates
-- Comment out if you allow multiple profiles with same email (not recommended)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='user_profiles_email_unique_idx'
  ) THEN
    BEGIN
      ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);
    EXCEPTION WHEN duplicate_object THEN
      -- ignore if exists concurrently in some states
      NULL;
    END;
  END IF;
END $$;
