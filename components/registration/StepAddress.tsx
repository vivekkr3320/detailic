import { useState } from "react";
import { step2Schema } from "@/lib/validations";
import type { StepProps } from "@/lib/types";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";

export default function StepAddress({ data, onChange, onNext, onBack }: StepProps) {
  const [error, setError] = useState<string>();
  const [touched, setTouched] = useState(false);

  const validate = (value: string) => {
    const result = step2Schema.safeParse({ address: value });
    if (!result.success) {
      const msg = result.error.flatten().fieldErrors.address?.[0];
      setError(msg);
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = () => {
    setTouched(true);
    if (validate(data.address)) {
      onNext();
    }
  };

  const charCount = data.address.length;
  const maxChars = 500;

  return (
    <div className="flex-1 flex flex-col">
      {/* Step title */}
      <div className="px-5 pt-2 pb-6">
        <h2 className="text-xl font-bold text-slate-900">Your Address</h2>
        <p className="text-slate-500 text-sm mt-1">
          Enter your current residential address
        </p>
      </div>

      <div className="flex-1 px-5">
        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
            Full Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
            <textarea
              id="address"
              inputMode="text"
              autoComplete="street-address"
              placeholder="House/Flat No., Street, Area, City, State, PIN"
              rows={5}
              maxLength={maxChars}
              value={data.address}
              onChange={(e) => {
                onChange({ address: e.target.value });
                if (touched) validate(e.target.value);
              }}
              onBlur={(e) => {
                setTouched(true);
                validate(e.target.value);
              }}
              className={`w-full pl-11 pr-4 py-4 rounded-2xl border-2 bg-white text-slate-900 placeholder-slate-400 text-base outline-none transition-colors resize-none ${
                touched && error
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
          <div className="flex items-start justify-between mt-1.5">
            {touched && error ? (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            ) : (
              <span />
            )}
            <span className={`text-xs ml-auto ${charCount > maxChars * 0.9 ? "text-amber-500" : "text-slate-400"}`}>
              {charCount}/{maxChars}
            </span>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Include your complete address with PIN code for faster verification.
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="px-5 pt-8 pb-[calc(1.5rem+var(--sab))] flex gap-3">
        <button
          onClick={onBack}
          className="flex-none w-14 h-14 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
