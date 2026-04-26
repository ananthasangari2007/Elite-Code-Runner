import type { Question } from "@/game/questions";

type Props = {
  question: Question;
  index: number;
  total: number;
  onAnswer: (idx: number) => void;
};

export function QuestionPopup({ question, index, total, onAnswer }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-auto rounded-2xl border-2 border-primary bg-card p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-widest gap-2">
          <span className="rounded-full bg-accent/20 px-3 py-1 text-accent font-bold">
            {question.category}
          </span>
          <span className="text-muted-foreground">
            Question {index + 1} / {total}
          </span>
        </div>
        <h2 className="mt-3 sm:mt-4 text-base sm:text-xl md:text-2xl font-bold leading-snug text-foreground">
          {question.q}
        </h2>
        {question.code && (
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background/60 border border-border p-3 text-xs sm:text-sm font-mono text-neon-green whitespace-pre">
            {question.code}
          </pre>
        )}
        <div className="mt-4 sm:mt-5 grid gap-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              className="text-left rounded-xl border bg-secondary text-secondary-foreground px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium hover:border-primary hover:bg-primary/15 hover:translate-x-1 transition-all active:scale-95"
            >
              <span className="mr-2 text-primary font-bold">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
