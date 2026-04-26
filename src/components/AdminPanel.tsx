import { useEffect, useMemo, useState } from "react";
import { Shield } from "lucide-react";
import { AVATARS } from "@/game/avatars";
import {
  getAverageRating,
  getAverageScore,
  getCompetitionSessions,
  getCreatorPoints,
  getExpectedPlayerCount,
  getFinishedCompetitionSessions,
  getLeaderboardSessions,
  type AdminConfig,
  type PlayerCountMode,
  type PlayerSession,
  type LeaderboardControlMode,
} from "@/game/store";

type Props = {
  config: AdminConfig;
  sessions: PlayerSession[];
  visible?: boolean;
  onSaveSettings: (updates: Partial<AdminConfig>) => Promise<void>;
  onForceLeaderboard: () => Promise<void>;
  onCloseLeaderboard: () => Promise<void>;
  onStartNewRound: () => Promise<void>;
};

type AdminTab = "dashboard" | "settings" | "leaderboard" | "feedback" | "insights";

export function AdminPanel({
  config,
  sessions,
  visible = true,
  onSaveSettings,
  onForceLeaderboard,
  onCloseLeaderboard,
  onStartNewRound,
}: Props) {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [pendingPassword, setPendingPassword] = useState(config.adminPassword);
  const [expectedMode, setExpectedMode] = useState<PlayerCountMode>(config.expectedPlayersMode);
  const [expectedPlayers, setExpectedPlayers] = useState(String(config.expectedPlayers));
  const [leaderboardMode, setLeaderboardMode] = useState<LeaderboardControlMode>(
    config.leaderboardMode,
  );
  const [saving, setSaving] = useState(false);

  const competitionSessions = useMemo(() => getCompetitionSessions(sessions), [sessions]);
  const leaderboardSessions = useMemo(() => getLeaderboardSessions(sessions), [sessions]);
  const finishedSessions = useMemo(() => getFinishedCompetitionSessions(sessions), [sessions]);
  const playingSessions = competitionSessions.filter((session) => session.status === "playing");
  const expectedPlayersCount = getExpectedPlayerCount(config);
  const feedbackSessions = competitionSessions.filter((session) => session.feedbackSubmitted);
  const averageScore = getAverageScore(sessions);
  const averageRating = getAverageRating(sessions);
  const creatorPoints = getCreatorPoints(sessions);

  useEffect(() => {
    setPendingPassword(config.adminPassword);
    setExpectedMode(config.expectedPlayersMode);
    setExpectedPlayers(String(config.expectedPlayers));
    setLeaderboardMode(config.leaderboardMode);
  }, [config]);

  const unlockPanel = () => {
    if (password === config.adminPassword) {
      setUnlocked(true);
      setError("");
      setPassword("");
      return;
    }
    setError("Wrong password. Please try again.");
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await onSaveSettings({
        adminPassword: pendingPassword.trim() || config.adminPassword,
        expectedPlayersMode: expectedMode,
        expectedPlayers: Math.max(1, Number(expectedPlayers) || 1),
        leaderboardMode,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {visible && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open host admin panel"
          title="Host admin panel"
          className="fixed top-3 right-3 z-[120] flex h-10 w-10 items-center justify-center rounded-full border border-primary/35 bg-background/80 text-primary shadow-[0_0_18px_rgba(255,61,172,0.16)] backdrop-blur transition hover:scale-105 hover:bg-background sm:top-4 sm:right-4"
        >
          <Shield className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[130] bg-background/85 backdrop-blur-md">
          <div className="absolute inset-y-0 right-0 w-full max-w-5xl overflow-y-auto border-l border-primary/25 bg-[linear-gradient(180deg,rgba(35,18,59,0.98),rgba(20,11,38,0.98))] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.26em] text-primary">
                  Elite Admin
                </div>
                <h2 className="mt-2 text-2xl font-black text-glow-pink sm:text-4xl">
                  Control Center
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-primary/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-primary hover:bg-primary/10"
              >
                Close
              </button>
            </div>

            {!unlocked ? (
              <div className="mx-auto mt-16 max-w-md rounded-[2rem] border border-primary/20 bg-card/80 p-6 shadow-2xl">
                <div className="text-center">
                  <div className="text-sm font-bold uppercase tracking-[0.26em] text-primary">
                    Admin Login
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Unlock the admin panel to monitor players, control the leaderboard, and review
                    feedback.
                  </p>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="mt-6 w-full rounded-2xl border bg-background/60 px-4 py-3 outline-none ring-primary focus:ring-2"
                />
                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                <button
                  onClick={unlockPanel}
                  className="mt-6 w-full rounded-2xl bg-primary py-3 font-black uppercase tracking-[0.24em] text-primary-foreground"
                >
                  Unlock
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(
                    ["dashboard", "settings", "leaderboard", "feedback", "insights"] as AdminTab[]
                  ).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] ${
                        activeTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "border border-primary/20 bg-background/40 text-primary"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === "dashboard" && (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <StatCard label="Joined" value={competitionSessions.length} />
                      <StatCard label="Playing Now" value={playingSessions.length} />
                      <StatCard label="Finished" value={finishedSessions.length} />
                      <StatCard label="Expected" value={expectedPlayersCount} />
                    </div>

                    <div className="rounded-3xl border border-primary/20 bg-card/70 p-5">
                      <h3 className="text-lg font-black text-glow-cyan">Current Player Status</h3>
                      <div className="mt-4 space-y-3">
                        {competitionSessions.length === 0 ? (
                          <p className="text-muted-foreground">
                            No live players in this round yet.
                          </p>
                        ) : (
                          competitionSessions.map((session) => (
                            <div
                              key={session.id}
                              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-primary/10 bg-background/30 px-4 py-3"
                            >
                              <img
                                src={AVATARS[session.avatarId].image}
                                alt={AVATARS[session.avatarId].label}
                                width={44}
                                height={44}
                                className="h-11 w-11 rounded-2xl object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-bold">{session.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {session.status === "playing"
                                    ? "Currently playing"
                                    : session.status === "finished"
                                      ? "Finished playing"
                                      : "Exited the game"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs uppercase tracking-[0.2em] text-primary">
                                  {session.status}
                                </div>
                                <div className="text-lg font-black text-glow-pink">
                                  {session.score}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-primary/20 bg-card/70 p-5">
                      <h3 className="text-lg font-black text-glow-cyan">Personal Settings</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Choose automatic player count or manually set the expected number.
                      </p>
                      <div className="mt-4 grid gap-3">
                        <label className="flex items-center gap-3 rounded-2xl border border-primary/15 p-4">
                          <input
                            type="radio"
                            checked={expectedMode === "automatic"}
                            onChange={() => setExpectedMode("automatic")}
                          />
                          <div>
                            <div className="font-bold">Automatic players</div>
                            <div className="text-sm text-muted-foreground">
                              Fixed at 40 expected players.
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 rounded-2xl border border-primary/15 p-4">
                          <input
                            type="radio"
                            checked={expectedMode === "manual"}
                            onChange={() => setExpectedMode("manual")}
                          />
                          <div className="flex-1">
                            <div className="font-bold">Manual player count</div>
                            <div className="mt-2">
                              <input
                                value={expectedPlayers}
                                onChange={(e) => setExpectedPlayers(e.target.value)}
                                type="number"
                                min={1}
                                className="w-full rounded-xl border bg-background/50 px-3 py-2 outline-none ring-primary focus:ring-2"
                              />
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-primary/20 bg-card/70 p-5">
                      <h3 className="text-lg font-black text-glow-pink">Admin Access</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Set the password used by the simple admin unlock page.
                      </p>
                      <input
                        value={pendingPassword}
                        onChange={(e) => setPendingPassword(e.target.value)}
                        className="mt-4 w-full rounded-xl border bg-background/50 px-3 py-2 outline-none ring-primary focus:ring-2"
                        placeholder="Change admin password"
                      />
                      <div className="mt-6">
                        <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                          Leaderboard Control
                        </div>
                        <div className="mt-3 grid gap-3">
                          <label className="flex items-center gap-3 rounded-2xl border border-primary/15 p-4">
                            <input
                              type="radio"
                              checked={leaderboardMode === "automatic"}
                              onChange={() => setLeaderboardMode("automatic")}
                            />
                            <div>
                              <div className="font-bold">Automatic leaderboard</div>
                              <div className="text-sm text-muted-foreground">
                                Opens when all expected players finish.
                              </div>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 rounded-2xl border border-primary/15 p-4">
                            <input
                              type="radio"
                              checked={leaderboardMode === "manual"}
                              onChange={() => setLeaderboardMode("manual")}
                            />
                            <div>
                              <div className="font-bold">Manual leaderboard</div>
                              <div className="text-sm text-muted-foreground">
                                Use the force leaderboard button whenever you decide.
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="mt-6 w-full rounded-2xl bg-primary py-3 font-black uppercase tracking-[0.24em] text-primary-foreground disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Settings"}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "leaderboard" && (
                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-3xl border border-primary/20 bg-card/70 p-5">
                      <h3 className="text-lg font-black text-glow-yellow">Leaderboard Control</h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <StatCard label="Ranked Players" value={leaderboardSessions.length} />
                        <StatCard
                          label="Status"
                          value={config.leaderboardOpen ? "Open" : "Locked"}
                        />
                        <StatCard label="Mode" value={config.leaderboardMode} />
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={onForceLeaderboard}
                          className="rounded-2xl bg-primary px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-primary-foreground"
                        >
                          Force Leaderboard View
                        </button>
                        <button
                          onClick={onCloseLeaderboard}
                          className="rounded-2xl border border-primary/30 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-primary"
                        >
                          Lock Leaderboard
                        </button>
                        <button
                          onClick={onStartNewRound}
                          className="rounded-2xl border border-accent/30 bg-accent/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-accent"
                        >
                          Start New Round
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-primary/20 bg-card/70 p-5">
                      <h3 className="text-lg font-black text-glow-cyan">Round Progress</h3>
                      <div className="mt-4 space-y-3 text-sm">
                        <p>
                          Finished players:{" "}
                          <span className="font-black text-primary">{finishedSessions.length}</span>
                        </p>
                        <p>
                          Players left:{" "}
                          <span className="font-black text-accent">
                            {Math.max(expectedPlayersCount - finishedSessions.length, 0)}
                          </span>
                        </p>
                        <p>
                          Current round ID:{" "}
                          <span className="break-all font-mono text-xs text-muted-foreground">
                            {config.currentRoundId}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "feedback" && (
                  <div className="mt-6 rounded-3xl border border-primary/20 bg-card/70 p-5">
                    <h3 className="text-lg font-black text-glow-pink">Feedback And Ratings</h3>
                    <div className="mt-4 space-y-3">
                      {feedbackSessions.length === 0 ? (
                        <p className="text-muted-foreground">
                          No player feedback has been submitted yet.
                        </p>
                      ) : (
                        feedbackSessions.map((session) => (
                          <div
                            key={session.id}
                            className="rounded-2xl border border-primary/15 bg-background/30 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-bold">{session.name}</div>
                              <div className="text-sm font-black text-primary">
                                {session.feedbackRating}/5
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {session.feedbackText ||
                                "Player submitted a rating without written feedback."}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "insights" && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <StatCard label="Average Player Score" value={averageScore.toFixed(1)} />
                    <StatCard label="Average Rating" value={averageRating.toFixed(1)} />
                    <StatCard label="Creator Points" value={creatorPoints} />
                    <div className="md:col-span-3 rounded-3xl border border-primary/20 bg-card/70 p-5">
                      <h3 className="text-lg font-black text-glow-cyan">Performance Notes</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        Creator points blend player scoring, feedback activity, and rating quality
                        to give you a simple health check for your event. Higher average scores show
                        the players are progressing well, while high ratings and feedback counts
                        show your experience is landing with the audience.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-primary/20 bg-card/70 p-5">
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-3 text-3xl font-black text-glow-cyan">{value}</div>
    </div>
  );
}
