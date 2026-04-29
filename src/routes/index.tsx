import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { GameCanvas } from "@/components/GameCanvas";
import { GameOver } from "@/components/GameOver";
import { PlayerSetup } from "@/components/PlayerSetup";
import { RulesScreen } from "@/components/RulesScreen";
import {
  createPlayerSession,
  ensureAdminConfig,
  fetchAdminSnapshot,
  finishPlayerSession,
  forceOpenLeaderboard,
  closeLeaderboard,
  markPlayerQuit,
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
  const [sessions, setSessions] = useState<PlayerSession[]>(() => getLocalSessions());
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const refreshSnapshot = async () => {
    try {
      const snapshot = await fetchAdminSnapshot();
      setAdminConfig(snapshot.config);
      setSessions(snapshot.sessions);
    } catch {
      setAdminConfig(getLocalAdminConfig());
      setSessions(getLocalSessions());
    }
  };

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
    const intervalId = window.setInterval(() => {
      void refreshSnapshot();
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

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
    if (mode === "competition" && currentSessionId) {
      await finishPlayerSession(currentSessionId, summary);
      await refreshSnapshot();
    }
    setResult(summary);
    setPhase("over");
  };

  const quitGameplay = async () => {
    if (mode === "competition" && currentSessionId) {
      await markPlayerQuit(currentSessionId);
      await refreshSnapshot();
    }
    setCurrentSessionId(null);
    setResult(null);
    setPhase("setup");
  };

  const goHome = () => {
    setCurrentSessionId(null);
    setResult(null);
    setPhase("setup");
  };

  const playAgain = () => {
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
      {phase === "setup" && (
        <PlayerSetup
          demoPlaysUsed={demoPlaysUsed}
          onOpenAdmin={() => setAdminPanelOpen(true)}
          onStart={enterMode}
        />
      )}

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
