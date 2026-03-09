-- Fix 1: Remove UPDATE policy on user_credits to prevent users from self-granting credits
-- Only the SECURITY DEFINER function deduct_credits() should modify balances
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- Fix 2: Enforce allowed_emails check at database level (server-side)
-- This prevents bypassing the invite-only gate via direct API calls
CREATE OR REPLACE FUNCTION public.enforce_allowed_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.allowed_emails
    WHERE email = lower(NEW.email)
  ) THEN
    RAISE EXCEPTION 'Email not on invite list';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_allowed_email_before_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_allowed_email();