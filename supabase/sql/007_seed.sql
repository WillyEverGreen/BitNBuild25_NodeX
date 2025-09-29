-- Seed data (optional). Safe to run multiple times.
-- Requires corresponding users to exist in auth.users

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN
    INSERT INTO public.user_profiles (id, email, name, type, university, year, major, skills)
    VALUES ('550e8400-e29b-41d4-a716-446655440001', 'john@mit.edu', 'John Student', 'student', 'MIT', 3, 'Computer Science', ARRAY['React','Node.js','Python'])
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO public.user_profiles (id, email, name, type, company_name, industry, contact_person)
    VALUES ('550e8400-e29b-41d4-a716-446655440002', 'company@test.com', 'Tech Solutions Inc', 'company', 'Tech Solutions Inc', 'Technology', 'Jane Manager')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = '550e8400-e29b-41d4-a716-446655440002') THEN
    INSERT INTO public.projects (id, title, description, budget, deadline, duration, skills, category, client_id, client_name, client_rating, status) VALUES
      ('650e8400-e29b-41d4-a716-446655440001', 'E-commerce Website Development', 'Build an e-commerce site with React and Node.js', 2500, NOW() + INTERVAL '30 days', '4 weeks', ARRAY['React','Node.js','Stripe'], 'Web Development', '550e8400-e29b-41d4-a716-446655440002', 'Tech Solutions Inc', 5.0, 'open')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
