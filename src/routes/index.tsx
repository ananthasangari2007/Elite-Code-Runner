import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { GameCanvas } from "@/components/GameCanvas";
import { GameOver } from "@/components/GameOver";
import { PlayerSetup } from "@/components/PlayerSetup";
import { RulesScreen } from "@/components/RulesScreen";
import { supabase } from "@/integrations/supabase/client";
import {
  createPlayerSession,
  ensureAdminConfig,
  fetchAdminSnapshot,
  finishPlayerSession,
  forceOpenLeaderboard,
  closeLeaderboard,
  markPlayerQuit,
  markPlayerExited,
  saveAdminConfig,
  startNewRound,
  submitPlayerFeedback,
  getLocalAdminConfig,
  getLocalSessions,
  type AdminConfig,
  type GameSummary,
  type PlayMode,
  type PlayerSession,
} from "@/game/store";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Code Runner Elite - Admin Event Upgrade" },
      {
        name: "description",
        content:
          "Code Runner Elite with demo play, event leaderboard release controls, feedback collection, and a live admin panel dashboard.",
      },
    ],
  }),
});

type Phase = "setup" | "rules" | "playing" | "over";

const DEMO_PLAYS_KEY = "elite-demo-plays-used";

function Index() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState(0);
  const [mode, setMode] = useState<PlayMode>("competition");
  const [result, setResult] = useState<GameSummary | null>(null);
  const [demoPlaysUsed, setDemoPlaysUsed] = useState(0);
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => getLocalAdminConfig());
  const [sessions, setSessions] = useState<PlayerSession[]>(() => {
    const config = getLocalAdminConfig();
    return getLocalSessions().filter((session) => session.roundId === config.currentRoundId);
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const refreshSnapshot = useCallback(async () => {
    try {
      const snapshot = await fetchAdminSnapshot();
      setAdminConfig(snapshot.config);
      setSessions(snapshot.sessions);
    } catch {
      setAdminConfig(getLocalAdminConfig());
      const config = getLocalAdminConfig();
      setSessions(
        getLocalSessions().filter((session) => session.roundId === config.currentRoundId),
      );
    }
  }, []);

  useEffect(() => {
    const storedDemoPlays =
      typeof window === "undefined" ? 0 : Number(localStorage.getItem(DEMO_PLAYS_KEY) || "0");
    setDemoPlaysUsed(storedDemoPlays);

    let active = true;
    const boot = async () => {
      try {
        const config = await ensureAdminConfig();
        if (!active) return;
        setAdminConfig(config);
        await refreshSnapshot();
      } catch {
        if (!active) return;
        setAdminConfig(getLocalAdminConfig());
        setSessions(getLocalSessions());
      }
    };

    void boot();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel("elite-live-round")
        .on("postgres_changes", { event: "*", schema: "public", table: "app_control" }, () => {
          void refreshSnapshot();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "player_sessions" }, () => {
          void refreshSnapshot();
        })
        .subscribe();
    } catch {
      channel = null;
    }

    const intervalId = window.setInterval(() => {
      void refreshSnapshot();
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [refreshSnapshot]);

  useEffect(() => {
    if (phase !== "setup" && adminPanelOpen) {
      setAdminPanelOpen(false);
    }
  }, [adminPanelOpen, phase]);

  const incrementDemoPlays = () => {
    const next = demoPlaysUsed + 1;
    setDemoPlaysUsed(next);
    localStorage.setItem(DEMO_PLAYS_KEY, String(next));
  };

  const enterMode = (playerName: string, selectedAvatarId: number, selectedMode: PlayMode) => {
    setAdminPanelOpen(false);
    setName(playerName);
    setAvatarId(selectedAvatarId);
    setMode(selectedMode);
    setPhase("rules");
  };

  const startGameplay = async () => {
    if (mode === "demo") {
      if (demoPlaysUsed >= 3) {
        setPhase("setup");
        return;
      }
      incrementDemoPlays();
      setCurrentSessionId(null);
      setPhase("playing");
      return;
    }

    const session = await createPlayerSession({ name, avatarId, mode });
    setCurrentSessionId(session?.id ?? null);
    await refreshSnapshot();
    setPhase("playing");
  };

  const finishGameplay = async (summary: GameSummary) => {
    setResult(summary);
    setPhase("over");
  };

  const finalizeGameplayResult = useCallback(
    async (summary: GameSummary) => {
      if (mode !== "competition" || !currentSessionId) return;
      await finishPlayerSession(currentSessionId, summary);
      await refreshSnapshot();
    },
    [currentSessionId, mode, refreshSnapshot],
  );

  const quitGameplay = async () => {
    if (mode === "competition" && currentSessionId) {
      await markPlayerQuit(currentSessionId);
      await refreshSnapshot();
    }
    setCurrentSessionId(null);
    setResult(null);
    setPhase("setup");
  };

  const syncResultExit = useCallback(
    (exitReason: "home" | "replay") => {
      if (mode !== "competition" || !currentSessionId) return;

      const sessionId = currentSessionId;
      void (async () => {
        await markPlayerExited(sessionId, exitReason);
        await refreshSnapshot();
      })();
    },
    [currentSessionId, mode, refreshSnapshot],
  );

  const goHome = () => {
    syncResultExit("home");
    setCurrentSessionId(null);
    setResult(null);
    setPhase("setup");
  };

  const playAgain = () => {
    syncResultExit("replay");
    setResult(null);
    setCurrentSessionId(null);
    setPhase("rules");
  };

  const handleSubmitFeedback = async (rating: number, feedback: string) => {
    if (!currentSessionId) return;
    await submitPlayerFeedback(currentSessionId, rating, feedback);
    await refreshSnapshot();
  };

  const handleSaveSettings = async (updates: Partial<AdminConfig>) => {
    await saveAdminConfig({
      adminPassword: updates.adminPassword,
      expectedPlayersMode: updates.expectedPlayersMode,
      expectedPlayers: updates.expectedPlayers,
      leaderboardMode: updates.leaderboardMode,
      leaderboardOpen: updates.leaderboardOpen,
    });
    await refreshSnapshot();
  };

  const handleForceLeaderboard = async () => {
    await forceOpenLeaderboard();
    await refreshSnapshot();
  };

  const handleCloseLeaderboard = async () => {
    await closeLeaderboard();
    await refreshSnapshot();
  };

  const handleStartNewRound = async () => {
    await startNewRound();
    setCurrentSessionId(null);
    setResult(null);
    setPhase("setup");
    await refreshSnapshot();
  };

  return (
    <>
      {phase === "setup" && <PlayerSetup demoPlaysUsed={demoPlaysUsed} onStart={enterMode} />}

      {phase === "rules" && (
        <RulesScreen
          mode={mode}
          onStart={() => void startGameplay()}
          onBack={() => setPhase("setup")}
        />
      )}

      {phase === "playing" && (
        <GameCanvas
          playerName={name}
          avatarId={avatarId}
          onEnd={finishGameplay}
          onQuit={quitGameplay}
        />
      )}

      {phase === "over" && result && (
        <GameOver
          playerName={name}
          avatarId={avatarId}
          mode={mode}
          result={result}
          config={adminConfig}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onFinalizeResult={finalizeGameplayResult}
          onSubmitFeedback={handleSubmitFeedback}
          onPlayAgain={playAgain}
          onHome={goHome}
        />
      )}

      <AdminPanel
        config={adminConfig}
        sessions={sessions}
        visible={phase === "setup"}
        open={adminPanelOpen}
        onOpenChange={setAdminPanelOpen}
        onSaveSettings={handleSaveSettings}
        onForceLeaderboard={handleForceLeaderboard}
        onCloseLeaderboard={handleCloseLeaderboard}
        onStartNewRound={handleStartNewRound}
      />
    </>
  );
}
