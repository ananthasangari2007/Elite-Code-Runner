ALTER TABLE public.player_sessions
ADD COLUMN IF NOT EXISTS exit_reason TEXT,
ADD COLUMN IF NOT EXISTS exited_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS player_sessions_exit_reason_idx
  ON public.player_sessions (round_id, exit_reason);
