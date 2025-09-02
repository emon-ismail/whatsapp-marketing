-- Add order tracking columns to phone_numbers table
ALTER TABLE phone_numbers 
ADD COLUMN has_ordered BOOLEAN DEFAULT FALSE,
ADD COLUMN order_date TIMESTAMP,
ADD COLUMN order_notes TEXT;

-- Create index for better performance
CREATE INDEX idx_phone_numbers_has_ordered ON phone_numbers(has_ordered);
CREATE INDEX idx_phone_numbers_order_date ON phone_numbers(order_date);