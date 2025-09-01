-- Create phone_numbers table
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'failed')),
  has_whatsapp BOOLEAN,
  assigned_moderator UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create moderators table
CREATE TABLE IF NOT EXISTS moderators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON phone_numbers(status);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_moderator ON phone_numbers(assigned_moderator);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone ON phone_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_moderators_user_id ON moderators(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_phone_numbers_updated_at BEFORE UPDATE ON phone_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moderators_updated_at BEFORE UPDATE ON moderators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Moderators can view their assigned numbers" ON phone_numbers
  FOR SELECT USING (assigned_moderator = auth.uid());

CREATE POLICY "Moderators can update their assigned numbers" ON phone_numbers
  FOR UPDATE USING (assigned_moderator = auth.uid());

CREATE POLICY "Moderators can view their profile" ON moderators
  FOR SELECT USING (user_id = auth.uid());

-- Insert sample moderators (replace with actual user IDs after creating users)
-- INSERT INTO moderators (user_id, name, email) VALUES
-- ('user-id-1', 'Moderator 1', 'mod1@example.com'),
-- ('user-id-2', 'Moderator 2', 'mod2@example.com');

-- Insert sample phone numbers
-- INSERT INTO phone_numbers (phone_number) VALUES
-- ('+1234567890'),
-- ('+1234567891'),
-- ('+1234567892');