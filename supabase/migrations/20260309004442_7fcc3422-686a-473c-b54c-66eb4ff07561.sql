-- Create atomic credit deduction function
-- Returns true if deduction succeeded, false if insufficient credits
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
BEGIN
  -- Lock and get current balance
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user has credits record and sufficient balance
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN false;
  END IF;
  
  -- Deduct credits
  UPDATE user_credits
  SET balance = balance - p_amount
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;