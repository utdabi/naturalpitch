CREATE TABLE public.outcome_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_result_id UUID NOT NULL REFERENCES public.grade_results(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.outcome_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own outcome_logs" ON public.outcome_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outcome_logs" ON public.outcome_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outcome_logs" ON public.outcome_logs
  FOR UPDATE USING (auth.uid() = user_id);