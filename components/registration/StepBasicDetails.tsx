import { useState } from "react";
import { step1Schema } from "@/lib/validations";
import type { StepProps } from "@/lib/types";
import { ArrowRight, User, Users } from "lucide-react";

type FieldErrors = { full_name?: string; father_name?: string; mobile_number?: string };

export default function StepBasicDetails({ data, onChange, onNext }: StepProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (field: string, value: string) => {
    const partial = {
      full_name: data.full_name,
      father_name: data.father_name,
      mobile_number: data.mobile_number,
      [field]: value,
    };
    const result = step1Schema.safeParse(partial);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field as keyof typeof fieldErrors]?.[0],
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field, value);
  };

  const handleSubmit = () => {
    setTouched({ full_name: true, father_name: true, mobile_number: true });
    const result = step1Schema.safeParse({
      full_name: data.full_name,
      father_name: data.father_name,
      mobile_number: data.mobile_number,
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        full_name: fieldErrors.full_name?.[0],
        father_name: fieldErrors.father_name?.[0],
        mobile_number: fieldErrors.mobile_number?.[0],
      });
      return;
    }
    setErrors({});
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Step title */}
      <div className="px-5 pt-2 pb-6">
        <h2 className="text-xl font-bold text-slate-900">Basic Details</h2>
        <p className="text-slate-500 text-sm mt-1">Enter your personal information</p>
      </div>

      <div className="flex-1 px-5 space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="full_name"
              type="text"
              inputMode="text"
              autoComplete="name"
              placeholder="e.g. Ramesh Kumar Sharma"
              value={data.full_name}
              onChange={(e) => {
                onChange({ full_name: e.target.value });
                if (touched.full_name) validate("full_name", e.target.value);
              }}
              onBlur={(e) => handleBlur("full_name", e.target.value)}
              className={`w-full pl-11 pr-4 py-4 rounded-2xl border-2 bg-white text-slate-900 placeholder-slate-400 text-base outline-none transition-colors ${
                touched.full_name && errors.full_name
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
          {touched.full_name && errors.full_name && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span>⚠</span> {errors.full_name}
            </p>
          )}
        </div>

        {/* Father's Name */}
        <div>
          <label htmlFor="father_name" className="block text-sm font-semibold text-slate-700 mb-2">
            Father&apos;s Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="father_name"
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="e.g. Suresh Kumar Sharma"
              value={data.father_name}
              onChange={(e) => {
                onChange({ father_name: e.target.value });
                if (touched.father_name) validate("father_name", e.target.value);
              }}
              onBlur={(e) => handleBlur("father_name", e.target.value)}
              className={`w-full pl-11 pr-4 py-4 rounded-2xl border-2 bg-white text-slate-900 placeholder-slate-400 text-base outline-none transition-colors ${
                touched.father_name && errors.father_name
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
          {touched.father_name && errors.father_name && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span>⚠</span> {errors.father_name}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobile_number" className="block text-sm font-semibold text-slate-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base font-medium">
              +91
            </span>
            <input
              id="mobile_number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="9876543210"
              maxLength={10}
              value={data.mobile_number}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                onChange({ mobile_number: val });
                if (touched.mobile_number) validate("mobile_number", val);
              }}
              onBlur={(e) => handleBlur("mobile_number", e.target.value)}
              className={`w-full pl-14 pr-4 py-4 rounded-2xl border-2 bg-white text-slate-900 placeholder-slate-400 text-base outline-none transition-colors ${
                touched.mobile_number && errors.mobile_number
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
          {touched.mobile_number && errors.mobile_number && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span>⚠</span> {errors.mobile_number}
            </p>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="px-5 pt-8 pb-[calc(1.5rem+var(--sab))]">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
