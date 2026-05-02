import { supabase } from "@/integrations/supabase/client";

export type PlayMode = "demo" | "competition";
export type SessionStatus = "playing" | "finished" | "quit";
export type PlayerCountMode = "automatic" | "manual";
export type LeaderboardControlMode = "automatic" | "manual";
export type SessionExitReason = "quit" | "home" | "replay";

export type GameSummary = {
  score: number;
  timeMs: number;
  correctAnswers: number;
  answeredCount: number;
  accuracy: number;
  bestStreak: number;
  comboBonusXp?: number;
  comboCoinBonus?: number;
  clearedRun?: boolean;
};

export type AdminConfig = {
  id: string;
  adminPassword: string;
  expectedPlayersMode: PlayerCountMode;
  expectedPlayers: number;
  leaderboardMode: LeaderboardControlMode;
  leaderboardOpen: boolean;
  currentRoundId: string;
  updatedAt: string;
};

export type PlayerSession = {
  id: string;
  roundId: string;
  name: string;
  avatarId: number;
  mode: PlayMode;
  status: SessionStatus;
  score: number;
  timeMs: number;
  correctAnswers: number;
  answeredCount: number;
  accuracy: number;
  bestStreak: number;
  feedbackRating: number | null;
  feedbackText: string;
  feedbackSubmitted: boolean;
  exitReason: SessionExitReason | null;
  exitedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSnapshot = {
  config: AdminConfig;
  sessions: PlayerSession[];
};

type AdminConfigRow = {
  id: string;
  admin_password: string;
  expected_players_mode: PlayerCountMode;
  expected_players: number;
  leaderboard_mode: LeaderboardControlMode;
  leaderboard_open: boolean;
  current_round_id: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  round_id: string;
  name: string;
  avatar_id: number;
  mode: PlayMode;
  status: SessionStatus;
  score: number | null;
  time_ms: number | null;
  correct_answers: number | null;
  answered_count: number | null;
  accuracy: number | null;
  best_streak: number | null;
  feedback_rating: number | null;
  feedback_text: string | null;
  feedback_submitted: boolean | null;
  exit_reason: SessionExitReason | null;
  exited_at: string | null;
  created_at: string;
  updated_at: string;
};

const ADMIN_STORAGE_KEY = "elite-admin-config";
const SESSION_STORAGE_KEY = "elite-player-sessions";
const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "elite-admin";
const DEFAULT_EXPECTED_PLAYERS = 40;

function createRoundId() {
  return `round-${crypto.randomUUID()}`;
}

function nowIso() {
  return new Date().toISOString();
}

function getDefaultAdminConfig(): AdminConfig {
  return {
    id: "main",
    adminPassword: DEFAULT_ADMIN_PASSWORD,
    expectedPlayersMode: "automatic",
    expectedPlayers: DEFAULT_EXPECTED_PLAYERS,
    leaderboardMode: "automatic",
    leaderboardOpen: false,
    currentRoundId: createRoundId(),
    updatedAt: nowIso(),
  };
}

function mapAdminConfigRow(row: AdminConfigRow): AdminConfig {
  return {
    id: row.id,
    adminPassword: row.admin_password,
    expectedPlayersMode: row.expected_players_mode,
    expectedPlayers: row.expected_players,
    leaderboardMode: row.leaderboard_mode,
    leaderboardOpen: row.leaderboard_open,
    currentRoundId: row.current_round_id,
    updatedAt: row.updated_at,
  };
}

function mapAdminConfigToRow(config: AdminConfig): AdminConfigRow {
  return {
    id: config.id,
    admin_password: config.adminPassword,
    expected_players_mode: config.expectedPlayersMode,
    expected_players: config.expectedPlayers,
    leaderboard_mode: config.leaderboardMode,
    leaderboard_open: config.leaderboardOpen,
    current_round_id: config.currentRoundId,
    updated_at: config.updatedAt,
  };
}

function mapSessionRow(row: SessionRow): PlayerSession {
  return {
    id: row.id,
    roundId: row.round_id,
    name: row.name,
    avatarId: row.avatar_id,
    mode: row.mode,
    status: row.status,
    score: row.score ?? 0,
    timeMs: row.time_ms ?? 0,
    correctAnswers: row.correct_answers ?? 0,
    answeredCount: row.answered_count ?? 0,
    accuracy: row.accuracy ?? 0,
    bestStreak: row.best_streak ?? 0,
    feedbackRating: row.feedback_rating,
    feedbackText: row.feedback_text ?? "",
    feedbackSubmitted: row.feedback_submitted ?? false,
    exitReason: row.exit_reason,
    exitedAt: row.exited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSessionToRow(session: PlayerSession): SessionRow {
  return {
    id: session.id,
    round_id: session.roundId,
    name: session.name,
    avatar_id: session.avatarId,
    mode: session.mode,
    status: session.status,
    score: session.score,
    time_ms: session.timeMs,
    correct_answers: session.correctAnswers,
    answered_count: session.answeredCount,
    accuracy: session.accuracy,
    best_streak: session.bestStreak,
    feedback_rating: session.feedbackRating,
    feedback_text: session.feedbackText,
    feedback_submitted: session.feedbackSubmitted,
    exit_reason: session.exitReason,
    exited_at: session.exitedAt,
    created_at: session.createdAt,
    updated_at: session.updatedAt,
  };
}

function readLocalAdminConfig(): AdminConfig {
  if (typeof window === "undefined") return getDefaultAdminConfig();

  const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) {
    const config = getDefaultAdminConfig();
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(config));
    return config;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AdminConfig>;
    const expectedPlayers =
      typeof parsed.expectedPlayers === "number" && Number.isFinite(parsed.expectedPlayers)
        ? Math.max(1, parsed.expectedPlayers)
        : DEFAULT_EXPECTED_PLAYERS;

    return {
      ...getDefaultAdminConfig(),
      ...parsed,
      adminPassword: parsed.adminPassword || DEFAULT_ADMIN_PASSWORD,
      expectedPlayers,
      currentRoundId: parsed.currentRoundId || createRoundId(),
      updatedAt: parsed.updatedAt || nowIso(),
    };
  } catch {
    const config = getDefaultAdminConfig();
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(config));
    return config;
  }
}

export function getLocalAdminConfig(): AdminConfig {
  return readLocalAdminConfig();
}

function writeLocalAdminConfig(config: AdminConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(config));
}

function readLocalSessions(): PlayerSession[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return [];

  try {
    return (JSON.parse(raw) as PlayerSession[]).map((session) => ({
      ...session,
      score: session.score ?? 0,
      timeMs: session.timeMs ?? 0,
      correctAnswers: session.correctAnswers ?? 0,
      answeredCount: session.answeredCount ?? 0,
      accuracy: session.accuracy ?? 0,
      bestStreak: session.bestStreak ?? 0,
      feedbackText: session.feedbackText ?? "",
      feedbackSubmitted: Boolean(session.feedbackSubmitted),
      exitReason: session.exitReason ?? null,
      exitedAt: session.exitedAt ?? null,
    }));
  } catch {
    return [];
  }
}

export function getLocalSessions(): PlayerSession[] {
  return readLocalSessions();
}

function writeLocalSessions(sessions: PlayerSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
}

function sortSessionsByUpdatedAt(sessions: PlayerSession[]) {
  return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function runWithFallback<T>(
  remoteAction: () => Promise<T>,
  fallbackAction: () => Promise<T> | T,
): Promise<T> {
  try {
    return await remoteAction();
  } catch {
    return await fallbackAction();
  }
}

export function getExpectedPlayerCount(config: AdminConfig) {
  return config.expectedPlayersMode === "automatic"
    ? DEFAULT_EXPECTED_PLAYERS
    : config.expectedPlayers;
}

export function getCompetitionSessions(sessions: PlayerSession[]) {
  return sessions.filter((session) => session.mode === "competition");
}

export function getFinishedCompetitionSessions(sessions: PlayerSession[]) {
  return getCompetitionSessions(sessions).filter((session) => session.status === "finished");
}

export function getPlayingCompetitionSessions(sessions: PlayerSession[]) {
  return getCompetitionSessions(sessions).filter((session) => session.status === "playing");
}

export function getExitedCompetitionSessions(sessions: PlayerSession[]) {
  return getCompetitionSessions(sessions).filter((session) => session.exitReason !== null);
}

export function getLeaderboardSessions(sessions: PlayerSession[]) {
  return getFinishedCompetitionSessions(sessions).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return a.updatedAt.localeCompare(b.updatedAt);
  });
}

export async function ensureAdminConfig(): Promise<AdminConfig> {
  return runWithFallback(
    async () => {
      const { data, error } = await supabase.from("app_control").select("*").limit(1).maybeSingle();
      if (error) throw error;

      if (data) return mapAdminConfigRow(data as AdminConfigRow);

      const config = getDefaultAdminConfig();
      const { data: inserted, error: insertError } = await supabase
        .from("app_control")
        .insert(mapAdminConfigToRow(config))
        .select("*")
        .single();

      if (insertError) throw insertError;
      return mapAdminConfigRow(inserted as AdminConfigRow);
    },
    async () => readLocalAdminConfig(),
  );
}

export async function fetchAdminSnapshot(): Promise<AdminSnapshot> {
  return runWithFallback(
    async () => {
      const config = await ensureAdminConfig();
      const { data, error } = await supabase
        .from("player_sessions")
        .select("*")
        .eq("round_id", config.currentRoundId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return {
        config,
        sessions: (data as SessionRow[]).map(mapSessionRow),
      };
    },
    async () => {
      const config = readLocalAdminConfig();
      const sessions = readLocalSessions().filter(
        (session) => session.roundId === config.currentRoundId,
      );
      return { config, sessions: sortSessionsByUpdatedAt(sessions) };
    },
  );
}

export async function saveAdminConfig(
  updates: Partial<
    Pick<
      AdminConfig,
      | "adminPassword"
      | "expectedPlayersMode"
      | "expectedPlayers"
      | "leaderboardMode"
      | "leaderboardOpen"
    >
  >,
): Promise<AdminConfig> {
  return runWithFallback(
    async () => {
      const current = await ensureAdminConfig();
      const next: AdminConfig = {
        ...current,
        ...updates,
        updatedAt: nowIso(),
      };

      const { data, error } = await supabase
        .from("app_control")
        .update(mapAdminConfigToRow(next))
        .eq("id", next.id)
        .select("*")
        .single();

      if (error) throw error;
      return mapAdminConfigRow(data as AdminConfigRow);
    },
    async () => {
      const current = readLocalAdminConfig();
      const next: AdminConfig = {
        ...current,
        ...updates,
        updatedAt: nowIso(),
      };
      writeLocalAdminConfig(next);
      return next;
    },
  );
}

export async function startNewRound(): Promise<AdminConfig> {
  return runWithFallback(
    async () => {
      const current = await ensureAdminConfig();
      const next: AdminConfig = {
        ...current,
        leaderboardOpen: false,
        currentRoundId: createRoundId(),
        updatedAt: nowIso(),
      };

      const { data, error } = await supabase
        .from("app_control")
        .update(mapAdminConfigToRow(next))
        .eq("id", next.id)
        .select("*")
        .single();

      if (error) throw error;
      return mapAdminConfigRow(data as AdminConfigRow);
    },
    async () => {
      const current = readLocalAdminConfig();
      const next: AdminConfig = {
        ...current,
        leaderboardOpen: false,
        currentRoundId: createRoundId(),
        updatedAt: nowIso(),
      };
      writeLocalAdminConfig(next);
      return next;
    },
  );
}

export async function createPlayerSession({
  name,
  avatarId,
  mode,
}: {
  name: string;
  avatarId: number;
  mode: PlayMode;
}): Promise<PlayerSession | null> {
  if (mode !== "competition") return null;

  return runWithFallback(
    async () => {
      const config = await ensureAdminConfig();
      const createdAt = nowIso();
      const insertPayload = {
        round_id: config.currentRoundId,
        name,
        avatar_id: avatarId,
        mode,
        status: "playing" as SessionStatus,
        score: 0,
        time_ms: 0,
        correct_answers: 0,
        answered_count: 0,
        accuracy: 0,
        best_streak: 0,
        feedback_rating: null,
        feedback_text: "",
        feedback_submitted: false,
        exit_reason: null,
        exited_at: null,
        created_at: createdAt,
        updated_at: createdAt,
      };

      const { data, error } = await supabase
        .from("player_sessions")
        .insert(insertPayload)
        .select("*")
        .single();

      if (error) throw error;
      return mapSessionRow(data as SessionRow);
    },
    async () => {
      const config = readLocalAdminConfig();
      const createdAt = nowIso();
      const session: PlayerSession = {
        id: crypto.randomUUID(),
        roundId: config.currentRoundId,
        name,
        avatarId,
        mode,
        status: "playing",
        score: 0,
        timeMs: 0,
        correctAnswers: 0,
        answeredCount: 0,
        accuracy: 0,
        bestStreak: 0,
        feedbackRating: null,
        feedbackText: "",
        feedbackSubmitted: false,
        exitReason: null,
        exitedAt: null,
        createdAt,
        updatedAt: createdAt,
      };
      const sessions = readLocalSessions();
      writeLocalSessions([session, ...sessions]);
      return session;
    },
  );
}

export async function markPlayerQuit(sessionId: string) {
  await runWithFallback(
    async () => {
      const timestamp = nowIso();
      const { error } = await supabase
        .from("player_sessions")
        .update({
          status: "quit",
          exit_reason: "quit",
          exited_at: timestamp,
          updated_at: timestamp,
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    async () => {
      const timestamp = nowIso();
      const sessions: PlayerSession[] = readLocalSessions().map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "quit",
              exitReason: "quit",
              exitedAt: timestamp,
              updatedAt: timestamp,
            }
          : session,
      );
      writeLocalSessions(sessions);
    },
  );

  const config = await ensureAdminConfig();
  await maybeAutoOpenLeaderboard(config);
}

export async function markPlayerExited(
  sessionId: string,
  exitReason: Exclude<SessionExitReason, "quit">,
) {
  return runWithFallback(
    async () => {
      const timestamp = nowIso();
      const { error } = await supabase
        .from("player_sessions")
        .update({
          exit_reason: exitReason,
          exited_at: timestamp,
          updated_at: timestamp,
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    async () => {
      const timestamp = nowIso();
      const sessions = readLocalSessions().map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exitReason,
              exitedAt: timestamp,
              updatedAt: timestamp,
            }
          : session,
      );
      writeLocalSessions(sessions);
    },
  );
}

async function maybeAutoOpenLeaderboard(config: AdminConfig) {
  const snapshot = await fetchAdminSnapshot();
  const activeConfig = snapshot.config.id === config.id ? snapshot.config : config;
  const finishedCount = getFinishedCompetitionSessions(snapshot.sessions).length;
  const activePlayers = getPlayingCompetitionSessions(snapshot.sessions).length;
  const expectedPlayers = getExpectedPlayerCount(activeConfig);
  const resolvedPlayers = getCompetitionSessions(snapshot.sessions).filter(
    (session) => session.status === "finished" || session.status === "quit",
  ).length;
  const autoThresholdReached =
    activeConfig.expectedPlayersMode === "automatic"
      ? activePlayers === 0
      : resolvedPlayers >= expectedPlayers;

  if (
    activeConfig.leaderboardMode === "automatic" &&
    !activeConfig.leaderboardOpen &&
    finishedCount > 0 &&
    autoThresholdReached
  ) {
    await saveAdminConfig({ leaderboardOpen: true });
  }
}

export async function finishPlayerSession(sessionId: string, summary: GameSummary) {
  await runWithFallback(
    async () => {
      const { error } = await supabase
        .from("player_sessions")
        .update({
          status: "finished",
          score: summary.score,
          time_ms: summary.timeMs,
          correct_answers: summary.correctAnswers,
          answered_count: summary.answeredCount,
          accuracy: summary.accuracy,
          best_streak: summary.bestStreak,
          updated_at: nowIso(),
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    async () => {
      const sessions: PlayerSession[] = readLocalSessions().map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "finished",
              score: summary.score,
              timeMs: summary.timeMs,
              correctAnswers: summary.correctAnswers,
              answeredCount: summary.answeredCount,
              accuracy: summary.accuracy,
              bestStreak: summary.bestStreak,
              updatedAt: nowIso(),
            }
          : session,
      );
      writeLocalSessions(sessions);
    },
  );

  const config = await ensureAdminConfig();
  await maybeAutoOpenLeaderboard(config);
}

export async function submitPlayerFeedback(
  sessionId: string,
  rating: number,
  feedbackText: string,
): Promise<void> {
  await runWithFallback(
    async () => {
      const { error } = await supabase
        .from("player_sessions")
        .update({
          feedback_rating: rating,
          feedback_text: feedbackText,
          feedback_submitted: true,
          updated_at: nowIso(),
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    async () => {
      const sessions = readLocalSessions().map((session) =>
        session.id === sessionId
          ? {
              ...session,
              feedbackRating: rating,
              feedbackText,
              feedbackSubmitted: true,
              updatedAt: nowIso(),
            }
          : session,
      );
      writeLocalSessions(sessions);
    },
  );
}

export function getAverageScore(sessions: PlayerSession[]) {
  const finished = getFinishedCompetitionSessions(sessions);
  if (finished.length === 0) return 0;
  return finished.reduce((sum, session) => sum + session.score, 0) / finished.length;
}

export function getAverageRating(sessions: PlayerSession[]) {
  const ratings = sessions.filter((session) => session.feedbackRating !== null);
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, session) => sum + (session.feedbackRating ?? 0), 0) / ratings.length;
}

export function getCreatorPoints(sessions: PlayerSession[]) {
  const averageScore = getAverageScore(sessions);
  const averageRating = getAverageRating(sessions);
  const feedbackCount = sessions.filter((session) => session.feedbackSubmitted).length;
  return Math.round(averageScore * 0.4 + averageRating * 20 + feedbackCount * 5);
}

export async function forceOpenLeaderboard() {
  return saveAdminConfig({ leaderboardOpen: true });
}

export async function closeLeaderboard() {
  return saveAdminConfig({ leaderboardOpen: false });
}

export async function loadLeaderboard(limit = 50): Promise<PlayerSession[]> {
  const snapshot = await fetchAdminSnapshot();
  return getLeaderboardSessions(snapshot.sessions).slice(0, limit);
}

export async function saveScore(): Promise<void> {
  return Promise.resolve();
}

export function exportSessionsForAdmin(sessions: PlayerSession[]) {
  return sessions.map((session) => mapSessionToRow(session));
}
