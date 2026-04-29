import { useCallback, useEffect, useRef, useState } from "react";
import { sfx, startMusic, stopMusic, setMuted, isMuted } from "@/game/audio";
import { AVATARS } from "@/game/avatars";
import { QUESTIONS_PER_RUN } from "@/game/config";
import { QUESTIONS } from "@/game/questions";
import type { GameSummary } from "@/game/store";
import { Countdown } from "./Countdown";
import { QuestionPopup } from "./QuestionPopup";

const LANES = 4;
const GAME_DURATION_MS = 5 * 60 * 1000;
const SPAWN_INTERVAL_MS = 1400;
const OBJECT_SPEED = 0.45; // px per ms
const MAX_ACTIVE_QUESTIONS = 2;
const PICKUP_SYMBOL = "?";
const HEART_SYMBOL = "\u2665";
const MUTE_ICON = "\ud83d\udd07";
const SOUND_ICON = "\ud83d\udd0a";
const PLAY_ICON = "\u25b6";
const PAUSE_ICON = "\u23f8";
const LEFT_ARROW = "\u2190";
const RIGHT_ARROW = "\u2192";

type GameObject = { id: number; lane: number; y: number; qIndex: number };
type Popup = { id: number; text: string; color: string };

type Props = {
  playerName: string;
  avatarId: number;
  onEnd: (summary: GameSummary) => void;
  onQuit: () => void;
};

function shuffleQuestions() {
  const order = Array.from({ length: QUESTIONS.length }, (_, index) => index);

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order;
}

export function GameCanvas({ playerName, avatarId, onEnd, onQuit }: Props) {
  const avatar = AVATARS[avatarId];
  const trackRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<"countdown" | "playing" | "paused" | "question">("countdown");
  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [currentQ, setCurrentQ] = useState<{ qIndex: number; objId: number } | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [muted, setMutedState] = useState(isMuted());
  const [shake, setShake] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const answeredQ = useRef<Set<number>>(new Set());
  const idCounter = useRef(0);
  const lastFrame = useRef(performance.now());
  const startTime = useRef<number | null>(null);
  const pendingQRef = useRef<{ qIndex: number; objId: number } | null>(null);
  const correctAnswersRef = useRef(correctAnswers);
  const bestStreakRef = useRef(bestStreak);
  const currentStreakRef = useRef(0);
  const queueRef = useRef<number[]>(shuffleQuestions());
  const currentQRef = useRef<{ qIndex: number; objId: number } | null>(null);

  const phaseRef = useRef(phase);
  const laneRef = useRef(lane);
  const scoreRef = useRef(score);
  const questionsAskedRef = useRef(questionsAsked);
  phaseRef.current = phase;
  laneRef.current = lane;
  scoreRef.current = score;
  questionsAskedRef.current = questionsAsked;
  correctAnswersRef.current = correctAnswers;
  bestStreakRef.current = bestStreak;
  currentQRef.current = currentQ;

  const refillQueueIfNeeded = useCallback((currentObjects: GameObject[]) => {
    if (queueRef.current.length > 0 || questionsAskedRef.current >= QUESTIONS_PER_RUN) return;

    const blocked = new Set(currentObjects.map((obj) => obj.qIndex));
    if (currentQRef.current) blocked.add(currentQRef.current.qIndex);

    const remaining = Array.from({ length: QUESTIONS.length }, (_, index) => index).filter(
      (index) => !answeredQ.current.has(index) && !blocked.has(index),
    );

    if (remaining.length === 0) return;
    queueRef.current = remaining;
  }, []);

  const spawnQuestionObject = useCallback(() => {
    if (questionsAskedRef.current >= QUESTIONS_PER_RUN) return;

    setObjects((currentObjects) => {
      refillQueueIfNeeded(currentObjects);
      if (currentObjects.length >= MAX_ACTIVE_QUESTIONS) return currentObjects;
      if (queueRef.current.length === 0) return currentObjects;

      const qIndex = queueRef.current.shift();
      if (qIndex === undefined) return currentObjects;

      const id = ++idCounter.current;

      return [...currentObjects, { id, lane: Math.floor(Math.random() * LANES), y: -72, qIndex }];
    });
  }, [refillQueueIfNeeded]);

  const moveLane = useCallback((dir: -1 | 1) => {
    if (phaseRef.current !== "playing") return;

    setLane((currentLane) => {
      const nextLane = Math.max(0, Math.min(LANES - 1, currentLane + dir));
      if (nextLane !== currentLane) sfx.move();
      return nextLane;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        moveLane(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        moveLane(1);
      } else if (e.key === "p" || e.key === "P") {
        setPhase((currentPhase) =>
          currentPhase === "playing"
            ? "paused"
            : currentPhase === "paused"
              ? "playing"
              : currentPhase,
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveLane]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        moveLane(dx > 0 ? 1 : -1);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [moveLane]);

  useEffect(() => {
    startMusic();
    return () => stopMusic();
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const elapsed = startTime.current ? performance.now() - startTime.current : 0;
      stopMusic();
      const answeredCount = questionsAskedRef.current;
      const totalCorrect = correctAnswersRef.current;
      onEnd({
        score: finalScore,
        timeMs: Math.min(elapsed, GAME_DURATION_MS),
        correctAnswers: totalCorrect,
        answeredCount,
        accuracy: answeredCount === 0 ? 0 : Math.round((totalCorrect / answeredCount) * 100),
        bestStreak: bestStreakRef.current,
      });
    },
    [onEnd],
  );

  useEffect(() => {
    if (phase !== "playing") {
      lastFrame.current = performance.now();
      return;
    }

    spawnQuestionObject();
    const spawnIntervalId = window.setInterval(spawnQuestionObject, SPAWN_INTERVAL_MS);

    return () => window.clearInterval(spawnIntervalId);
  }, [phase, spawnQuestionObject]);

  useEffect(() => {
    if (phase !== "playing" || currentQ || questionsAsked >= QUESTIONS_PER_RUN) return;
    if (objects.length > 0) return;

    const timeoutId = window.setTimeout(() => {
      spawnQuestionObject();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [phase, currentQ, questionsAsked, objects.length, spawnQuestionObject]);

  useEffect(() => {
    if (phase !== "playing") {
      lastFrame.current = performance.now();
      return;
    }

    if (startTime.current === null) startTime.current = performance.now();

    let raf = 0;
    const trackHeight = trackRef.current?.clientHeight ?? 600;
    const playerCenterY = trackHeight - 150;
    const collisionTop = playerCenterY - 65;
    const collisionBottom = playerCenterY + 35;

    const tick = (now: number) => {
      const dt = Math.min(now - lastFrame.current, 50);
      lastFrame.current = now;

      setTimeLeft((currentTime) => {
        const nextTime = Math.max(0, currentTime - dt);
        if (nextTime === 0) endGame(scoreRef.current);
        return nextTime;
      });

      setObjects((currentObjects) => {
        refillQueueIfNeeded(currentObjects);
        const movedObjects: GameObject[] = [];
        let collision: { qIndex: number; objId: number } | null = null;

        for (const obj of currentObjects) {
          const nextY = obj.y + OBJECT_SPEED * dt;

          if (
            !collision &&
            obj.lane === laneRef.current &&
            nextY >= collisionTop &&
            nextY <= collisionBottom
          ) {
            collision = { qIndex: obj.qIndex, objId: obj.id };
            continue;
          }

          if (nextY > trackHeight + 80) {
            queueRef.current.push(obj.qIndex);
            continue;
          }

          movedObjects.push({ ...obj, y: nextY });
        }

        if (collision) pendingQRef.current = collision;

        return movedObjects;
      });

      if (pendingQRef.current) {
        const collision = pendingQRef.current;
        pendingQRef.current = null;
        sfx.collide();
        setCurrentQ(collision);
        setPhase("question");
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, endGame, refillQueueIfNeeded]);

  const spawnPopup = (text: string, color: string) => {
    const id = ++idCounter.current;
    setPopups((currentPopups) => [...currentPopups, { id, text, color }]);
    setTimeout(() => {
      setPopups((currentPopups) => currentPopups.filter((popup) => popup.id !== id));
    }, 1000);
  };

  const handleAnswer = (idx: number) => {
    if (!currentQ) return;

    const q = QUESTIONS[currentQ.qIndex];
    const correct = idx === q.answer;
    const newAsked = questionsAsked + 1;
    answeredQ.current.add(currentQ.qIndex);
    setQuestionsAsked(newAsked);

    let newScore = score;
    let newLives = lives;

    if (correct) {
      newScore += 5;
      const nextCorrectAnswers = correctAnswers + 1;
      const nextStreak = currentStreakRef.current + 1;
      currentStreakRef.current = nextStreak;
      setCorrectAnswers(nextCorrectAnswers);
      if (nextStreak > bestStreakRef.current) {
        bestStreakRef.current = nextStreak;
        setBestStreak(nextStreak);
      }
      sfx.correct();
      spawnPopup("+5", "var(--neon-green)");
    } else {
      newScore -= 1;
      newLives -= 1;
      currentStreakRef.current = 0;
      sfx.wrong();
      spawnPopup(`-1 ${HEART_SYMBOL}`, "var(--neon-pink)");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }

    setScore(newScore);
    setLives(newLives);
    setCurrentQ(null);

    if (newLives <= 0 || newAsked >= QUESTIONS_PER_RUN) {
      endGame(newScore);
      return;
    }

    setPhase("playing");
    window.setTimeout(() => {
      spawnQuestionObject();
    }, 50);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMutedState(nextMuted);
    setMuted(nextMuted);
  };

  const togglePause = () => {
    setPhase((currentPhase) =>
      currentPhase === "playing" ? "paused" : currentPhase === "paused" ? "playing" : currentPhase,
    );
  };

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  return (
    <div className="relative h-dvh w-full overflow-hidden select-none">
      <div className="absolute top-0 left-0 right-0 z-30 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-2xl border border-primary/20 bg-background/70 p-2 shadow-lg backdrop-blur-sm sm:flex sm:items-center sm:justify-between sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={avatar.image}
              alt={avatar.label}
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 rounded-full border-2 border-primary object-cover sm:h-10 sm:w-10"
            />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Player
              </div>
              <div className="max-w-[110px] truncate text-sm font-bold sm:max-w-[140px] sm:text-base">
                {playerName}
              </div>
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:justify-center sm:gap-5">
            <div className="text-center">
              <div className="text-[9px] uppercase text-muted-foreground sm:text-xs">Score</div>
              <div className="text-base leading-tight font-black text-glow-cyan sm:text-2xl">
                {score}
              </div>
            </div>

            <div className="text-center">
              <div className="text-[9px] uppercase text-muted-foreground sm:text-xs">Q</div>
              <div className="text-base leading-tight font-black text-glow-yellow sm:text-2xl">
                {questionsAsked}/{QUESTIONS_PER_RUN}
              </div>
            </div>

            <div className="text-center">
              <div className="text-[9px] uppercase text-muted-foreground sm:text-xs">Time</div>
              <div className="text-base leading-tight font-black text-glow-pink sm:text-2xl">
                {minutes}:{seconds}
              </div>
            </div>

            <div className="flex gap-0.5 sm:gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`text-base transition-all sm:text-2xl ${
                    i < lives ? "" : "grayscale opacity-30"
                  }`}
                >
                  {HEART_SYMBOL}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-1 sm:gap-2">
            <button
              onClick={toggleMute}
              className="rounded-lg border bg-secondary px-2 py-1.5 text-xs hover:bg-secondary/70 sm:px-3 sm:py-2 sm:text-sm"
            >
              {muted ? MUTE_ICON : SOUND_ICON}
            </button>
            <button
              onClick={togglePause}
              className="rounded-lg border bg-secondary px-2 py-1.5 text-xs hover:bg-secondary/70 sm:px-3 sm:py-2 sm:text-sm"
            >
              {phase === "paused" ? PLAY_ICON : PAUSE_ICON}
            </button>
            <button
              onClick={onQuit}
              className="rounded-lg border bg-destructive/80 px-2 py-1.5 text-xs text-destructive-foreground hover:bg-destructive sm:px-3 sm:py-2 sm:text-sm"
            >
              Quit
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`absolute inset-0 bg-track ${
          phase === "playing" ? "animate-slide-bg" : ""
        } ${shake ? "animate-shake" : ""}`}
      >
        {[1, 2, 3].map((dividerIndex) => (
          <div
            key={dividerIndex}
            className="lane-divider absolute top-0 bottom-0 w-1 opacity-60"
            style={{ left: `${(dividerIndex / LANES) * 100}%` }}
          />
        ))}

        {objects.map((obj) => (
          <div
            key={obj.id}
            className="pointer-events-none absolute z-10 -translate-x-1/2 animate-float"
            style={{
              left: `${(obj.lane + 0.5) * (100 / LANES)}%`,
              top: obj.y,
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary bg-card text-2xl font-black text-primary shadow-[0_0_20px_var(--neon-yellow)] md:h-16 md:w-16 md:text-4xl">
              {PICKUP_SYMBOL}
            </div>
          </div>
        ))}

        <div
          className="pointer-events-none absolute bottom-28 z-20 -translate-x-1/2 transition-[left] duration-200 ease-out sm:bottom-28"
          style={{ left: `${(lane + 0.5) * (100 / LANES)}%` }}
        >
          <img
            src={avatar.image}
            alt={avatar.label}
            width={96}
            height={96}
            className={`h-14 w-14 rounded-full border-4 border-primary object-cover drop-shadow-[0_0_20px_var(--neon-cyan)] sm:h-24 sm:w-24 ${
              phase === "playing" ? "animate-run" : ""
            }`}
          />
        </div>

        {popups.map((popup) => (
          <div
            key={popup.id}
            className="pointer-events-none absolute bottom-44 left-1/2 z-30 -translate-x-1/2 text-2xl font-black animate-rise sm:text-4xl"
            style={{ color: popup.color, textShadow: `0 0 20px ${popup.color}` }}
          >
            {popup.text}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute right-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 z-20 flex justify-between px-3 sm:px-6">
        <button
          onClick={() => moveLane(-1)}
          className="pointer-events-auto h-14 w-14 rounded-full border-2 border-primary bg-primary/80 text-2xl font-bold text-primary-foreground shadow-lg backdrop-blur active:scale-90 sm:h-16 sm:w-16 sm:text-3xl"
          aria-label="Move left"
        >
          {LEFT_ARROW}
        </button>
        <button
          onClick={() => moveLane(1)}
          className="pointer-events-auto h-14 w-14 rounded-full border-2 border-primary bg-primary/80 text-2xl font-bold text-primary-foreground shadow-lg backdrop-blur active:scale-90 sm:h-16 sm:w-16 sm:text-3xl"
          aria-label="Move right"
        >
          {RIGHT_ARROW}
        </button>
      </div>

      {phase === "countdown" && <Countdown onDone={() => setPhase("playing")} />}

      {phase === "paused" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="px-4 text-center">
            <div className="text-4xl font-black text-glow-yellow sm:text-6xl">PAUSED</div>
            <button
              onClick={() => setPhase("playing")}
              className="mt-6 rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {phase === "question" && currentQ && (
        <QuestionPopup
          question={QUESTIONS[currentQ.qIndex]}
          index={questionsAsked}
          total={QUESTIONS_PER_RUN}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
