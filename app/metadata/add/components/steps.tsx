import { Check } from "lucide-react";

interface StepsProps {
  currentStep: number
  totalSteps: number
}

export function Steps({ currentStep, totalSteps }: StepsProps) {
  // Generate step labels based on total steps
  const getStepLabels = () => {
    if (totalSteps === 5) {
      return ["General", "Technical", "Quality", "Access", "Review"]
    }
    // Fallback for the original 3-step process
    return ["General", "Quality", "Distribution"]
  }

  const stepLabels = getStepLabels()

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        <div
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
        ></div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {stepLabels.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                index + 1 <= currentStep
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 text-gray-300"
              }`}
            >
              {index + 1 <= currentStep ? index + 1 : index + 1}
            </div>
            <div
              className={`text-xs mt-1 font-medium ${
                index + 1 <= currentStep ? "text-primary" : "text-gray-400"
              }`}
            >
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}