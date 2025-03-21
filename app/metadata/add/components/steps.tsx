import { Check } from "lucide-react";

interface StepsProps {
  step: number
}

export function Steps({ step }: StepsProps) {
  // We have a fixed 5-step process
  const stepLabels = ["General", "Technical", "Quality", "Access", "Review"]
  const totalSteps = 5

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        <div
          style={{ width: `${(step / totalSteps) * 100}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
        ></div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {stepLabels.map((label, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                index + 1 <= step
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 text-gray-300"
              }`}
            >
              {index + 1}
            </div>
            <div
              className={`text-xs mt-1 font-medium ${
                index + 1 <= step ? "text-primary" : "text-gray-400"
              }`}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}