-- Extensions and helpers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- In Supabase, pgcrypto is often available; include if you need gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;
