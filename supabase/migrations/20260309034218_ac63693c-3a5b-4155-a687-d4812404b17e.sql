
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- grade_results
DROP POLICY IF EXISTS "Users can insert their own grades" ON public.grade_results;
DROP POLICY IF EXISTS "Users can update their own grades" ON public.grade_results;
DROP POLICY IF EXISTS "Users can view their own grades" ON public.grade_results;

CREATE POLICY "Users can insert their own grades" ON public.grade_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own grades" ON public.grade_results FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own grades" ON public.grade_results FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- outcome_logs
DROP POLICY IF EXISTS "Users can insert their own outcome_logs" ON public.outcome_logs;
DROP POLICY IF EXISTS "Users can update their own outcome_logs" ON public.outcome_logs;
DROP POLICY IF EXISTS "Users can view their own outcome_logs" ON public.outcome_logs;

CREATE POLICY "Users can insert their own outcome_logs" ON public.outcome_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own outcome_logs" ON public.outcome_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own outcome_logs" ON public.outcome_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_credits
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;

CREATE POLICY "Users can view their own credits" ON public.user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);
