import { useEffect, useMemo, useRef, useState } from "react";
import { Award, Coins, Flame, Gem, Gift, ShieldCheck, Sparkles, Trophy, Zap } from "lucide-react";
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
import type { RunRewardSummary } from "@/game/progression";

type Props = {
  playerName: string;
  avatarId: number;
  mode: PlayMode;
  result: GameSummary;
  rewardSummary: RunRewardSummary | null;
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
  rewardSummary,
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
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(236,72,153,0.16),transparent_24%),linear-gradient(180deg,#050816_0%,#090f1f_55%,#04070f_100%)] px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-cyan-400/18 bg-slate-950/68 p-5 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={AVATARS[avatarId].image}
                alt={AVATARS[avatarId].label}
                width={128}
                height={128}
                className="h-24 w-24 rounded-[1.8rem] border border-cyan-300/30 object-cover shadow-[0_0_28px_rgba(34,211,238,0.2)] sm:h-28 sm:w-28"
              />
              <div>
                <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  {isDemo
                    ? "Demo Summary"
                    : rewardSummary?.clearedRun
                      ? "Mission Cleared"
                      : "Run Ended"}
                </div>
                <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">{playerName}</h1>
                <p className="mt-2 text-sm text-slate-400 sm:text-base">
                  {isDemo
                    ? "You completed the practice run."
                    : rewardSummary?.clearedRun
                      ? "Rewards have been banked and your progression has been updated."
                      : "The run ended before the full difficulty was cleared. Progress unlocks need a full clear."}
                </p>
              </div>
            </div>

            {!isDemo && rewardSummary && (
              <div className="rounded-[1.5rem] border border-violet-300/15 bg-violet-500/8 px-4 py-3 text-sm text-slate-200">
                <div className="font-black uppercase tracking-[0.22em] text-violet-300">
                  Progress Update
                </div>
                <div className="mt-2">Level {rewardSummary.playerLevel}</div>
                <div className="mt-1">{rewardSummary.completedLevels}/5 levels complete</div>
                <div className="mt-1">Streak: {rewardSummary.streakDays} days</div>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <ResultCard label="Score" value={result.score} accent="cyan" />
            <ResultCard
              label="Correct"
              value={`${result.correctAnswers}/${Math.max(result.answeredCount, 1)}`}
              accent="cyan"
            />
            <ResultCard label="Accuracy" value={`${accuracy}%`} accent="violet" />
            <ResultCard label="Time Used" value={`${minutes}:${seconds}`} accent="pink" />
            <ResultCard label="Best Streak" value={result.bestStreak} accent="amber" />
          </div>

          {!isDemo && rewardSummary && (
            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5">
                <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                  Reward Summary
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <RewardCard
                    icon={<Zap className="h-4 w-4" />}
                    label="XP Earned"
                    value={`+${rewardSummary.xpEarned}`}
                    accent="cyan"
                  />
                  <RewardCard
                    icon={<Coins className="h-4 w-4" />}
                    label="Coins Earned"
                    value={`+${rewardSummary.coinsEarned}`}
                    accent="amber"
                  />
                  <RewardCard
                    icon={<Gem className="h-4 w-4" />}
                    label="Gems Earned"
                    value={`+${rewardSummary.gemsEarned}`}
                    accent="violet"
                  />
                  <RewardCard
                    icon={<Flame className="h-4 w-4" />}
                    label="Combo Bonus"
                    value={`+${rewardSummary.comboBonusXp} XP`}
                    accent="pink"
                  />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <InfoBanner
                    icon={<ShieldCheck className="h-5 w-5 text-emerald-200" />}
                    title={
                      rewardSummary.clearedRun ? "Difficulty Completed" : "Difficulty Not Cleared"
                    }
                    detail={
                      rewardSummary.clearedRun
                        ? rewardSummary.unlockedNextLevel
                          ? `Next level unlocked: ${rewardSummary.unlockedNextLevel}.`
                          : "This run counted toward roadmap progression."
                        : "You can replay this mode to finish the full clear and unlock progress."
                    }
                  />

                  <InfoBanner
                    icon={<Sparkles className="h-5 w-5 text-violet-200" />}
                    title={`Streak: ${rewardSummary.streakDays} Days`}
                    detail="Keep completing at least one challenge daily to protect your streak and milestone rewards."
                  />
                </div>
              </div>

              <div className="space-y-4">
                {rewardSummary.chestReward && (
                  <div className="rounded-[1.8rem] border border-amber-300/18 bg-amber-400/10 p-5 shadow-[0_0_40px_rgba(251,191,36,0.08)]">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                      <Gift className="h-4 w-4" />
                      Reward Chest
                    </div>
                    <div className="mt-3 text-xl font-black text-white">
                      {rewardSummary.chestReward.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">
                      {rewardSummary.chestReward.description}
                    </p>
                  </div>
                )}

                {rewardSummary.badgesEarned.length > 0 && (
                  <div className="rounded-[1.8rem] border border-emerald-300/15 bg-emerald-400/10 p-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
                      <Award className="h-4 w-4" />
                      New Badges
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rewardSummary.badgesEarned.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full border border-emerald-300/18 bg-emerald-400/8 px-3 py-1 text-sm font-bold text-emerald-100"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rewardSummary.streakReward && (
                  <div className="rounded-[1.8rem] border border-pink-300/15 bg-pink-500/10 p-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-pink-300">
                      <Sparkles className="h-4 w-4" />
                      Streak Reward Triggered
                    </div>
                    <div className="mt-3 text-lg font-black text-white">
                      {rewardSummary.streakReward.title}
                    </div>
                    <p className="mt-2 text-sm text-slate-200">
                      {rewardSummary.streakReward.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isDemo ? (
            <div className="mt-8 rounded-[1.8rem] border border-cyan-300/15 bg-cyan-400/8 p-5 text-center">
              <div className="text-xl font-black text-cyan-100">Demo Complete</div>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Demo results stay local and do not unlock the main roadmap rewards. Return home when
                you are ready for the real C Quest progression flow.
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-[1.8rem] border border-fuchsia-300/15 bg-fuchsia-500/8 p-5">
              {config.leaderboardOpen ? (
                <>
                  <div className="flex items-center gap-2 text-xl font-black text-cyan-100">
                    <Trophy className="h-5 w-5" />
                    Leaderboard Open
                  </div>
                  <p className="mt-3 text-sm text-slate-300 sm:text-base">
                    The event leaderboard is now live below for all players.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xl font-black text-pink-100">
                    <Trophy className="h-5 w-5" />
                    Leaderboard Locked
                  </div>
                  <p className="mt-3 text-sm text-slate-300 sm:text-base">
                    {config.leaderboardMode === "automatic"
                      ? "Waiting for everyone to finish before the leaderboard opens."
                      : "Waiting for the admin to unlock the leaderboard."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold">
                    <span className="text-cyan-200">
                      {finishedPlayers}/{expectedPlayers} done
                    </span>
                    <span className="text-pink-200">{playersLeft} left</span>
                  </div>
                </>
              )}
            </div>
          )}

          {!isDemo && (
            <div className="mt-6 rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">
                    Feedback And Ratings
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Share how the experience felt after this run.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen((value) => !value)}
                  disabled={feedbackSubmitted}
                  className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 disabled:opacity-50"
                >
                  {feedbackSubmitted
                    ? "Feedback Submitted"
                    : feedbackOpen
                      ? "Close Feedback"
                      : "Leave Feedback"}
                </button>
              </div>

              {feedbackOpen && !feedbackSubmitted && (
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                      Rating
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`rounded-xl px-4 py-2 text-sm font-black ${
                            rating === star
                              ? "bg-cyan-400 text-slate-950"
                              : "border border-cyan-300/18 bg-white/[0.04] text-cyan-100"
                          }`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={feedbackText}
                    onChange={(event) => setFeedbackText(event.target.value)}
                    placeholder="Share your feedback here..."
                    className="min-h-32 w-full rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-white outline-none ring-cyan-300 focus:ring-2"
                  />

                  <button
                    type="button"
                    onClick={submitFeedback}
                    disabled={submitting}
                    className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={`mt-8 grid gap-3 ${isDemo ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            <button
              type="button"
              onClick={onHome}
              className="rounded-2xl border border-white/10 bg-white/[0.05] py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white/[0.08]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 py-3 text-sm font-black uppercase tracking-[0.22em] text-cyan-100 transition hover:bg-cyan-400/15"
            >
              Replay
            </button>
            {!isDemo && (
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                disabled={feedbackSubmitted}
                className="rounded-2xl border border-violet-300/20 bg-violet-500/10 py-3 text-sm font-black uppercase tracking-[0.22em] text-violet-100 disabled:opacity-50"
              >
                Feedback
              </button>
            )}
          </div>
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
  accent: "cyan" | "violet" | "pink" | "amber";
}) {
  const tone =
    accent === "cyan"
      ? "border-cyan-300/15 bg-cyan-400/8 text-cyan-100"
      : accent === "violet"
        ? "border-violet-300/15 bg-violet-500/8 text-violet-100"
        : accent === "amber"
          ? "border-amber-300/15 bg-amber-400/8 text-amber-100"
          : "border-pink-300/15 bg-pink-500/8 text-pink-100";

  return (
    <div className={`rounded-[1.6rem] border p-5 ${tone}`}>
      <div className="text-xs font-black uppercase tracking-[0.22em] opacity-75">{label}</div>
      <div className="mt-4 text-3xl font-black text-white sm:text-4xl">{value}</div>
    </div>
  );
}

function RewardCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "cyan" | "amber" | "violet" | "pink";
}) {
  const tone =
    accent === "cyan"
      ? "border-cyan-300/15 bg-cyan-400/8 text-cyan-100"
      : accent === "amber"
        ? "border-amber-300/15 bg-amber-400/8 text-amber-100"
        : accent === "violet"
          ? "border-violet-300/15 bg-violet-500/8 text-violet-100"
          : "border-pink-300/15 bg-pink-500/8 text-pink-100";

  return (
    <div className={`rounded-[1.2rem] border p-4 ${tone}`}>
      <div className="flex items-center justify-between">
        {icon}
        <div className="text-[10px] font-black uppercase tracking-[0.22em] opacity-75">{label}</div>
      </div>
      <div className="mt-4 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function InfoBanner({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-sm font-black text-white">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{detail}</p>
    </div>
  );
}
