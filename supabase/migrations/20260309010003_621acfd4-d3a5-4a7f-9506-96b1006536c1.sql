-- Fix 1: Restrict deduct_credits to service_role only and add positive amount check
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
BEGIN
  -- Validate positive amount to prevent self-granting credits
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'p_amount must be positive';
  END IF;

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

-- Revoke from all roles and grant only to service_role
REVOKE EXECUTE ON FUNCTION public.deduct_credits(uuid, integer) FROM public, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.deduct_credits(uuid, integer) TO service_role;

-- Fix 2: Remove the public SELECT policy on allowed_emails (server-side trigger handles the check now)
DROP POLICY IF EXISTS "Anyone can check allowed emails" ON public.allowed_emails;