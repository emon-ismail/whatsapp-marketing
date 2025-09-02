-- Fix the phone status function to properly handle done status
CREATE OR REPLACE FUNCTION update_phone_status(
  phone_id bigint,
  new_status text,
  whatsapp_status boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE phone_numbers 
  SET 
    status = new_status,
    has_whatsapp = CASE 
      WHEN whatsapp_status IS NOT NULL THEN whatsapp_status
      WHEN new_status = 'no_whatsapp' THEN false
      ELSE has_whatsapp
    END,
    updated_at = NOW()
  WHERE id = phone_id;
END;
$$;