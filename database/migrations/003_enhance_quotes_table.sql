-- Add enhanced quote fields for external requests
-- This migration adds fields needed for detailed quotes: title, description, deliverables, deposit, timeline_days, and terms

ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS deliverables TEXT[], -- Array of deliverable items
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10, 2), -- Deposit required
ADD COLUMN IF NOT EXISTS timeline_days INTEGER, -- Timeline in days
ADD COLUMN IF NOT EXISTS terms_conditions TEXT, -- Terms and conditions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(); -- Track updates

-- Add index for faster queries on project_id
CREATE INDEX IF NOT EXISTS idx_quotes_project_id ON quotes(project_id);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
