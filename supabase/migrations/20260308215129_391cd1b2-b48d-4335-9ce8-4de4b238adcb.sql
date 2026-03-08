CREATE TABLE public.grade_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  persona TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  clarity INTEGER,
  relevance INTEGER,
  credibility INTEGER,
  cta INTEGER,
  tone INTEGER,
  red_flags TEXT[],
  message TEXT,
  rewrite_direct TEXT,
  rewrite_friendly TEXT,
  hooks TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.grade_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on grade_results" ON public.grade_results FOR SELECT USING (true);
CREATE POLICY "Allow all insert on grade_results" ON public.grade_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on grade_results" ON public.grade_results FOR UPDATE USING (true);