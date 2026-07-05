import { cn } from "../../lib/shadcn/utils";

// Список шагов на русском языке
const STEPS = ["Клиент", "Авто", "Смета"]; [cite: 1395]

interface Props {
  activeStep: number;
  onStepChange: (step: number) => void;
} [cite: 1395]

export default function StepHeader({ activeStep, onStepChange }: Props) { [cite: 1395]
  return (
    <div class="flex items-center space-x-2 no-print"> {/* no-print спрячет шапку при печати */}
      {STEPS.map((label, i) => { [cite: 1395]
        const isActive = activeStep === i; [cite: 1395]
        const isComplete = activeStep > i; [cite: 1395]

        return (
          <div key={i} class="flex items-center">
            <button
              onClick={() => onStepChange(i)} [cite: 1395]
              class={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                isActive 
                  ? "text-foreground bg-accent" 
                  : isComplete 
                    ? "text-[#013AD1] hover:bg-accent/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent" [cite: 1395]
              )}
            >
              {/* Кружочек с цифрой шага */}
              <span
                class={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                  isActive
                    ? "bg-[#013AD1] text-white"
                    : isComplete
                      ? "bg-[#A2D0FE] text-[#013AD1]"
                      : "bg-muted text-muted-foreground" [cite: 1395]
                )}
              >
                {i + 1}
              </span>
              
              {/* Текст шага */}
              <span class={cn(isActive && "font-semibold text-foreground")}>
                {label}
              </span> [cite: 1395]
            </button>

            {/* Рисуем соединительную линию между шагами, если это не последний шаг */}
            {i < STEPS.length - 1 && ( [cite: 1395]
              <div
                class={cn(
                  "h-px w-8 mx-2",
                  i < activeStep ? "bg-[#A2D0FE]" : "bg-border" [cite: 1395]
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}