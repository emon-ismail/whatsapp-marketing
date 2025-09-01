-- Create separate table for Zizii Island birthday campaign
CREATE TABLE birthday_numbers (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  person_name VARCHAR(100),
  birthday DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  assigned_moderator UUID REFERENCES moderators(id),
  assigned_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_birthday_numbers_status ON birthday_numbers(status);
CREATE INDEX idx_birthday_numbers_birthday ON birthday_numbers(birthday);
CREATE INDEX idx_birthday_numbers_assigned_moderator ON birthday_numbers(assigned_moderator);

-- Add company field to moderators table for multi-company support
ALTER TABLE moderators ADD COLUMN company VARCHAR(50) DEFAULT 'oasis_outfit';

-- Update existing moderators
UPDATE moderators SET company = 'oasis_outfit' WHERE company IS NULL;