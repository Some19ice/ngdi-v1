import { Check } from "lucide-react";

interface StepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "General Information" },
  { id: 2, name: "Technical Details" },
  { id: 3, name: "Access Information" },
];

export function Steps({ currentStep }: StepsProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={`${
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
            } relative`}
          >
            <div className="flex items-center">
              <div
                className={`${
                  step.id <= currentStep
                    ? "bg-primary"
                    : "bg-secondary"
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
                    ? "text-foreground"
                    : "text-muted-foreground"
                } ml-4 text-sm font-medium`}
              >
                {step.name}
              </span>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className={`${
                  step.id < currentStep ? "border-primary" : "border-border"
                } absolute left-0 top-4 -ml-px mt-0.5 h-0.5 w-full border-t`}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}