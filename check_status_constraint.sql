-- Check what status values are allowed
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname LIKE '%status%' AND conrelid = 'phone_numbers'::regclass;

-- Also check the table structure
\d phone_numbers;