CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  time_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert score"
  ON public.leaderboard FOR INSERT
  WITH CHECK (
    char_length(name) > 0
    AND char_length(name) <= 30
    AND avatar_id >= 0 AND avatar_id < 100
    AND score >= -100 AND score <= 1000
    AND time_ms >= 0 AND time_ms <= 600000
  );

CREATE INDEX leaderboard_score_idx ON public.leaderboard (score DESC, time_ms ASC);