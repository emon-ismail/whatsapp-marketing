-- Add campaign_type column to phone_numbers table
ALTER TABLE phone_numbers 
ADD COLUMN campaign_type VARCHAR(50) DEFAULT 'oasis_outfit';

-- Update existing records to have default campaign type
UPDATE phone_numbers 
SET campaign_type = 'oasis_outfit' 
WHERE campaign_type IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_phone_numbers_campaign_type ON phone_numbers(campaign_type);

-- For future birthday campaign, add birthday column
ALTER TABLE phone_numbers 
ADD COLUMN birthday DATE;