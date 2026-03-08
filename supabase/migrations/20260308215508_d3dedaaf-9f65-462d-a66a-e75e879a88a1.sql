-- Drop permissive policies
DROP POLICY IF EXISTS "Allow all select on grade_results" ON public.grade_results;
DROP POLICY IF EXISTS "Allow all insert on grade_results" ON public.grade_results;
DROP POLICY IF EXISTS "Allow all update on grade_results" ON public.grade_results;

-- Make user_id NOT NULL with default
ALTER TABLE public.grade_results ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.grade_results ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Secure RLS policies
CREATE POLICY "Users can view their own grades" ON public.grade_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grades" ON public.grade_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grades" ON public.grade_results
  FOR UPDATE USING (auth.uid() = user_id);