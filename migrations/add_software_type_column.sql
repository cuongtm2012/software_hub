-- Add software_type enum and type column to softwares table
-- Migration: add_software_type_column

-- Create the enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE software_type AS ENUM ('software', 'api');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the type column with default value 'software'
ALTER TABLE softwares 
ADD COLUMN IF NOT EXISTS type software_type NOT NULL DEFAULT 'software';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_softwares_type ON softwares(type);

-- Optional: Update existing records based on category or name
-- Uncomment and modify as needed:
-- UPDATE softwares SET type = 'api' WHERE name ILIKE '%API%' OR description ILIKE '%API%';
