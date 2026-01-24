-- Migration: Seed SSLG positions
-- Date: 2026-01-17

-- Clear existing positions (optional - comment out if you want to keep existing)
-- DELETE FROM positions;

-- Insert SSLG positions with proper order
INSERT INTO positions (name, description, max_votes, display_order, is_active)
VALUES 
  ('President', 'Supreme Student Government President', 1, 1, true),
  ('Vice President', 'Supreme Student Government Vice President', 1, 2, true),
  ('Secretary', 'Supreme Student Government Secretary', 1, 3, true),
  ('Treasurer', 'Supreme Student Government Treasurer', 1, 4, true),
  ('Auditor', 'Supreme Student Government Auditor', 1, 5, true),
  ('PIO', 'Public Information Officer', 1, 6, true),
  ('Protocol Officer', 'Protocol Officer', 1, 7, true),
  ('Grade 7 Representative', 'Grade 7 Class Representative', 1, 8, true),
  ('Grade 8 Representative', 'Grade 8 Class Representative', 1, 9, true),
  ('Grade 9 Representative', 'Grade 9 Class Representative', 1, 10, true),
  ('Grade 10 Representative', 'Grade 10 Class Representative', 1, 11, true),
  ('Grade 11 Representative', 'Grade 11 Class Representative', 1, 12, true),
  ('Grade 12 Representative', 'Grade 12 Class Representative', 1, 13, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
