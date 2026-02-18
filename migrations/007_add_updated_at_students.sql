-- Ensure students table has an updated_at column used by common update triggers
-- Safe to run multiple times due to IF NOT EXISTS
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();
-- Optionally, also ensure created_at exists if your trigger expects both
-- Uncomment if needed in your schema
-- ALTER TABLE public.students
-- ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now();