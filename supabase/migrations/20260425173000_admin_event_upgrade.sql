CREATE TABLE IF NOT EXISTS public.app_control (
  id TEXT PRIMARY KEY,
  admin_password TEXT NOT NULL DEFAULT 'elite-admin',
  expected_players_mode TEXT NOT NULL DEFAULT 'automatic',
  expected_players INTEGER NOT NULL DEFAULT 40,
  leaderboard_mode TEXT NOT NULL DEFAULT 'automatic',
  leaderboard_open BOOLEAN NOT NULL DEFAULT false,
  current_round_id TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app control"
  ON public.app_control FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage app control"
  ON public.app_control FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO public.app_control (
  id,
  admin_password,
  expected_players_mode,
  expected_players,
  leaderboard_mode,
  leaderboard_open,
  current_round_id
)
VALUES (
  'main',
  'elite-admin',
  'automatic',
  40,
  'automatic',
  false,
  'round-bootstrap'
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.player_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_id INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'competition',
  status TEXT NOT NULL DEFAULT 'playing',
  score INTEGER NOT NULL DEFAULT 0,
  time_ms INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  answered_count INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  feedback_rating INTEGER,
  feedback_text TEXT NOT NULL DEFAULT '',
  feedback_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.player_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read player sessions"
  ON public.player_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert player sessions"
  ON public.player_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update player sessions"
  ON public.player_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS player_sessions_round_idx
  ON public.player_sessions (round_id, updated_at DESC);
