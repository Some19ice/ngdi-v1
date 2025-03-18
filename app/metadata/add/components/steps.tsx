import { Check } from "lucide-react";

interface StepsProps {
  currentStep: number
  totalSteps?: number
}

const defaultSteps = [
  { id: 1, name: "General Information And Description" },
  { id: 2, name: "Data Quality Information" },
  { id: 3, name: "Data Distribution Information" },
]

export function Steps({ currentStep, totalSteps = 3 }: StepsProps) {
  const steps =
    totalSteps === 3 ? defaultSteps : defaultSteps.slice(0, totalSteps)

  return (
    <nav aria-label="Progress" className="w-full overflow-x-auto pb-2">
      <ol role="list" className="flex items-center min-w-max">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={`${
              stepIdx !== steps.length - 1 ? "pr-6 md:pr-20" : ""
            } relative`}
          >
            <div className="flex items-center">
              <div
                className={`${
                  step.id <= currentStep ? "bg-primary" : "bg-secondary"
                } h-8 w-8 rounded-full flex items-center justify-center`}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <span
                    className={`${
                      step.id === currentStep
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    } text-sm font-semibold`}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              <span
                className={`${
                  step.id <= currentStep
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                } ml-3 text-sm whitespace-nowrap`}
              >
                {step.name}
              </span>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className={`${
                  step.id < currentStep ? "border-primary" : "border-border"
                } absolute left-0 top-4 -ml-px mt-0.5 h-0.5 w-full border-t-2`}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}