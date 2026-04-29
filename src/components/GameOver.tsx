import { useEffect, useMemo, useRef, useState } from "react";
import { AVATARS } from "@/game/avatars";
import { EventLeaderboard } from "./EventLeaderboard";
import {
  getExpectedPlayerCount,
  getFinishedCompetitionSessions,
  getLeaderboardSessions,
  type AdminConfig,
  type GameSummary,
  type PlayMode,
  type PlayerSession,
} from "@/game/store";

type Props = {
  playerName: string;
  avatarId: number;
  mode: PlayMode;
  result: GameSummary;
  config: AdminConfig;
  sessions: PlayerSession[];
  currentSessionId: string | null;
  onFinalizeResult: (summary: GameSummary) => Promise<void>;
  onSubmitFeedback: (rating: number, feedback: string) => Promise<void>;
  onPlayAgain: () => void;
  onHome: () => void;
};

export function GameOver({
  playerName,
  avatarId,
  mode,
  result,
  config,
  sessions,
  currentSessionId,
  onFinalizeResult,
  onSubmitFeedback,
  onPlayAgain,
  onHome,
}: Props) {
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const finalizeStartedRef = useRef(false);

  const isDemo = mode === "demo";
  const accuracy = result.answeredCount === 0 ? 0 : result.accuracy;
  const currentSession = sessions.find((session) => session.id === currentSessionId) ?? null;
  const feedbackSubmitted = currentSession?.feedbackSubmitted ?? false;
  const totalSeconds = Math.floor(result.timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const optimisticCurrentSession = useMemo(() => {
    if (isDemo || !currentSessionId) return null;

    return {
      id: currentSessionId,
      roundId: currentSession?.roundId ?? config.currentRoundId,
      name: playerName,
      avatarId,
      mode: "competition" as const,
      status: "finished" as const,
      score: result.score,
      timeMs: result.timeMs,
      correctAnswers: result.correctAnswers,
      answeredCount: result.answeredCount,
      accuracy,
      bestStreak: result.bestStreak,
      feedbackRating: currentSession?.feedbackRating ?? null,
      feedbackText: currentSession?.feedbackText ?? "",
      feedbackSubmitted: currentSession?.feedbackSubmitted ?? false,
      exitReason: currentSession?.exitReason ?? null,
      exitedAt: currentSession?.exitedAt ?? null,
      createdAt: currentSession?.createdAt ?? new Date().toISOString(),
      updatedAt: currentSession?.updatedAt ?? new Date().toISOString(),
    } satisfies PlayerSession;
  }, [
    accuracy,
    avatarId,
    config.currentRoundId,
    currentSession,
    currentSessionId,
    isDemo,
    playerName,
    result.answeredCount,
    result.bestStreak,
    result.correctAnswers,
    result.score,
    result.timeMs,
  ]);
  const visibleSessions = useMemo(() => {
    if (!optimisticCurrentSession) return sessions;

    const withoutCurrent = sessions.filter((session) => session.id !== optimisticCurrentSession.id);
    return [optimisticCurrentSession, ...withoutCurrent];
  }, [optimisticCurrentSession, sessions]);
  const leaderboardSessions = useMemo(
    () => getLeaderboardSessions(visibleSessions),
    [visibleSessions],
  );
  const finishedPlayers = getFinishedCompetitionSessions(visibleSessions).length;
  const expectedPlayers = getExpectedPlayerCount(config);
  const playersLeft = Math.max(expectedPlayers - finishedPlayers, 0);

  useEffect(() => {
    if (isDemo || !currentSessionId || finalizeStartedRef.current) return;
    if (currentSession?.status === "finished") return;

    finalizeStartedRef.current = true;
    void onFinalizeResult(result);
  }, [currentSession?.status, currentSessionId, isDemo, onFinalizeResult, result]);

  const submitFeedback = async () => {
    if (!currentSessionId || feedbackSubmitted) return;
    setSubmitting(true);
    try {
      await onSubmitFeedback(rating, feedbackText);
      setFeedbackOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-[radial-gradient(circle_at_top,rgba(255,61,172,0.18),transparent_30%),linear-gradient(180deg,rgba(16,10,31,1),rgba(28,15,48,1))] px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-primary/20 bg-card/80 p-5 shadow-[0_0_60px_rgba(255,61,172,0.12)] sm:p-8">
        <img
          src={AVATARS[avatarId].image}
          alt={AVATARS[avatarId].label}
          width={128}
          height={128}
          className="mx-auto h-24 w-24 rounded-3xl border-2 border-primary object-cover shadow-[0_0_30px_rgba(255,61,172,0.28)] sm:h-32 sm:w-32"
        />
        <h1 className="mt-5 text-center text-3xl font-black text-glow-cyan sm:text-5xl">
          {playerName}
        </h1>
        <p className="mt-2 text-center text-sm font-bold uppercase tracking-[0.3em] text-glow-pink sm:text-base">
          {isDemo ? "Demo Finish" : "Main Event Finish"}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard label="Score" value={result.score} accent="cyan" />
          <ResultCard
            label="Correct"
            value={`${result.correctAnswers}/${Math.max(result.answeredCount, 1)}`}
            accent="cyan"
          />
          <ResultCard label="Accuracy" value={`${accuracy}%`} accent="cyan" />
          <ResultCard label="Time Used" value={`${minutes}:${seconds}`} accent="pink" />
          <ResultCard label="Best Streak" value={result.bestStreak} accent="pink" />
        </div>

        {isDemo ? (
          <div className="mt-8 rounded-[1.75rem] border border-primary/20 bg-background/35 p-5 text-center">
            <div className="text-xl font-black text-glow-yellow">Demo Complete</div>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Demo scores stay local and do not enter the main event leaderboard. You can return
              home and join the real game when you are ready.
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-accent/30 bg-accent/8 p-5">
            {config.leaderboardOpen ? (
              <>
                <div className="text-xl font-black uppercase tracking-[0.2em] text-glow-cyan">
                  Leaderboard Open
                </div>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  The leaderboard is now live. You can view rankings below on this same score page.
                </p>
              </>
            ) : (
              <>
                <div className="text-xl font-black uppercase tracking-[0.2em] text-glow-pink">
                  Leaderboard Locked
                </div>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  {config.leaderboardMode === "automatic"
                    ? "Waiting for everyone to finish before the leaderboard opens for all players."
                    : "Waiting for the admin to unlock the leaderboard for all players."}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold">
                  <span className="text-primary">
                    {finishedPlayers}/{expectedPlayers} done
                  </span>
                  <span className="text-accent">{playersLeft} left</span>
                </div>
              </>
            )}
          </div>
        )}

        {!isDemo && (
          <div className="mt-6 rounded-[1.75rem] border border-primary/20 bg-background/30 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.24em] text-primary">
                  Feedback And Ratings
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Rate your experience and share feedback. Then please wait until the leaderboard
                  opens for everyone.
                </p>
              </div>
              <button
                onClick={() => setFeedbackOpen((value) => !value)}
                disabled={feedbackSubmitted}
                className="rounded-2xl border border-primary/30 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary disabled:opacity-50"
              >
                {feedbackSubmitted
                  ? "Feedback Submitted"
                  : feedbackOpen
                    ? "Close Feedback"
                    : "Feedback"}
              </button>
            </div>

            {feedbackOpen && !feedbackSubmitted && (
              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                    Rating
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`rounded-xl px-4 py-2 text-sm font-black ${
                          rating === star
                            ? "bg-primary text-primary-foreground"
                            : "border border-primary/20 bg-background/40 text-primary"
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your feedback here..."
                  className="min-h-32 w-full rounded-2xl border bg-background/50 px-4 py-3 outline-none ring-primary focus:ring-2"
                />

                <button
                  onClick={submitFeedback}
                  disabled={submitting}
                  className="rounded-2xl bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className={`mt-8 grid gap-3 ${isDemo ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          <button
            onClick={onHome}
            className="rounded-2xl border border-primary/30 bg-background/40 py-3 text-sm font-black uppercase tracking-[0.22em] text-primary"
          >
            Home
          </button>
          <button
            onClick={onPlayAgain}
            className="rounded-2xl border border-primary/30 bg-background/40 py-3 text-sm font-black uppercase tracking-[0.22em] text-primary"
          >
            Replay
          </button>
          {!isDemo && (
            <button
              onClick={() => setFeedbackOpen(true)}
              disabled={feedbackSubmitted}
              className="rounded-2xl border border-primary/30 bg-background/40 py-3 text-sm font-black uppercase tracking-[0.22em] text-primary disabled:opacity-50"
            >
              Feedback
            </button>
          )}
        </div>
      </div>

      {!isDemo && config.leaderboardOpen && (
        <div className="mx-auto mt-8 max-w-6xl">
          <EventLeaderboard sessions={leaderboardSessions} />
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: "cyan" | "pink";
}) {
  return (
    <div className="rounded-[1.75rem] border border-primary/20 bg-background/30 p-5">
      <div
        className={`text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.24em] ${
          accent === "cyan" ? "text-glow-cyan" : "text-glow-pink"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-4 text-3xl font-black sm:text-4xl ${
          accent === "cyan" ? "text-glow-cyan" : "text-glow-pink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
