import type { Question } from "@/game/questions";

type Props = {
  question: Question;
  index: number;
  total: number;
  onAnswer: (idx: number) => void;
};

export function QuestionPopup({ question, index, total, onAnswer }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/90 p-3 backdrop-blur-md sm:p-4">
      <div className="w-full max-w-xl my-auto rounded-2xl border-2 border-primary bg-card p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-widest sm:text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent/20 px-3 py-1 font-bold text-accent">
              {question.category}
            </span>
            <span className="rounded-full bg-primary/15 px-3 py-1 font-bold text-primary">
              {question.difficulty}
            </span>
          </div>
          <span className="text-muted-foreground">
            Question {index + 1} / {total}
          </span>
        </div>
        <h2 className="mt-3 text-base font-bold leading-snug text-foreground sm:mt-4 sm:text-xl md:text-2xl">
          {question.q}
        </h2>
        {question.code && (
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background/60 border border-border p-3 text-xs sm:text-sm font-mono text-neon-green whitespace-pre">
            {question.code}
          </pre>
        )}
        <div className="mt-4 sm:mt-5 grid gap-2">
          {question.options.map((opt, i) => {
            const isCodeOption = opt.includes("\n");

            return (
              <button
                key={i}
                onClick={() => onAnswer(i)}
                className="rounded-xl border bg-secondary px-3 py-2.5 text-left text-sm font-medium text-secondary-foreground transition-all hover:translate-x-1 hover:border-primary hover:bg-primary/15 active:scale-95 sm:px-4 sm:py-3 sm:text-base"
              >
                <span className="flex items-start gap-2">
                  <span className="shrink-0 text-primary font-bold">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span
                    className={
                      isCodeOption
                        ? "whitespace-pre-wrap font-mono text-[13px] leading-relaxed sm:text-sm"
                        : "whitespace-pre-wrap"
                    }
                  >
                    {opt}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
