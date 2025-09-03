-- Add status column to moderators table if it doesn't exist
ALTER TABLE moderators 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Update existing records to have active status
UPDATE moderators 
SET status = 'active' 
WHERE status IS NULL;