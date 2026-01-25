-- Add missing fields to softwares table
ALTER TABLE softwares 
ADD COLUMN IF NOT EXISTS version TEXT,
ADD COLUMN IF NOT EXISTS vendor TEXT,
ADD COLUMN IF NOT EXISTS license TEXT,
ADD COLUMN IF NOT EXISTS installation_instructions TEXT,
ADD COLUMN IF NOT EXISTS documentation_link TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;
