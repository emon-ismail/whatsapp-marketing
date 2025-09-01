-- Insert test birthday numbers for today's date
INSERT INTO phone_numbers (phone_number, campaign_type, birthday, status) VALUES
('+1234567890', 'zizii_island', CURRENT_DATE, 'pending'),
('+1234567891', 'zizii_island', CURRENT_DATE, 'pending'),
('+1234567892', 'zizii_island', '2024-12-25', 'pending'),
('+1234567893', 'zizii_island', '2024-01-15', 'pending');

-- Query to see today's birthdays
SELECT * FROM phone_numbers 
WHERE campaign_type = 'zizii_island' 
AND EXTRACT(MONTH FROM birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
AND EXTRACT(DAY FROM birthday) = EXTRACT(DAY FROM CURRENT_DATE);