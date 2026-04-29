import { QUESTIONS_PER_RUN } from "@/game/config";
import { startMusic } from "@/game/audio";
import type { PlayMode } from "@/game/store";

type Props = {
  mode: PlayMode;
  onStart: () => void;
  onBack: () => void;
};

const rules = [
  {
    icon: "C",
    title: "Topics: C Programming",
    desc: `Arrays, Strings, and Functions with ${QUESTIONS_PER_RUN} multiple-choice questions.`,
  },
  {
    icon: "Q",
    title: `${QUESTIONS_PER_RUN} Questions Total`,
    desc: "Smash question marks on the running track to face challenges.",
  },
  { icon: "+", title: "Correct = +5 Points", desc: "Each right answer boosts your score." },
  { icon: "3", title: "3 Lives Total", desc: "You start every run with 3 hearts." },
  {
    icon: "-",
    title: "Wrong Answer = -1 Point And -1 Life",
    desc: "Every wrong answer costs both a life and a point.",
  },
  {
    icon: "KO",
    title: "0 Lives = Game Over",
    desc: "When all 3 lives are gone, the run ends instantly.",
  },
  {
    icon: "T",
    title: "5 Minute Timer",
    desc: `The run ends if the timer hits zero or you answer all ${QUESTIONS_PER_RUN} questions.`,
  },
] as const;

export function RulesScreen({ mode, onStart, onBack }: Props) {
  const isDemo = mode === "demo";
  const handleContinue = () => {
    startMusic();
    onStart();
  };

  return (
    <div className="min-h-dvh w-full px-3 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto flex w-max max-w-full items-center justify-center rounded-full border border-primary/35 bg-background/40 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.24em] text-primary sm:text-xs sm:tracking-[0.3em]">
          {isDemo ? "Demo Play" : "Main Event"}
        </div>
        <h1 className="mt-4 text-center text-3xl font-black text-glow-yellow sm:text-5xl">
          GAME RULES
        </h1>
        <p className="mt-3 text-center text-sm text-muted-foreground sm:text-base">
          {isDemo
            ? "Practice the live gameplay flow. Demo runs do not unlock the event leaderboard."
            : "This run counts for the live leaderboard and the admin dashboard."}
        </p>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4">
          {rules.map((rule) => (
            <div
              key={rule.title}
              className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-lg sm:gap-4 sm:p-5"
            >
              <div className="shrink-0 text-3xl font-black text-primary sm:text-4xl">
                {rule.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-primary sm:text-lg">{rule.title}</h3>
                <p className="text-sm text-muted-foreground sm:text-base">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border bg-secondary py-3 text-sm font-bold uppercase tracking-wider text-secondary-foreground hover:bg-secondary/80 sm:text-base"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-[2] rounded-xl bg-accent py-3 text-sm font-bold uppercase tracking-widest text-accent-foreground transition-transform hover:scale-[1.02] sm:text-base"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
