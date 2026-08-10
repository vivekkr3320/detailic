interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs text-slate-500">{pct}% done</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Step dots */}
      <div className="flex items-center justify-between mt-2 px-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i < currentStep ? "bg-blue-600" : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
