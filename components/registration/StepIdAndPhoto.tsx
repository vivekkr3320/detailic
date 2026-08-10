import { useState } from "react";
import { step3Schema } from "@/lib/validations";
import { formatAadhaar } from "@/lib/utils";
import type { StepProps } from "@/lib/types";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import PhotoUpload from "./PhotoUpload";

type FieldErrors = {
  aadhaar_number?: string;
  pan_number?: string;
  photo?: string;
};

export default function StepIdAndPhoto({ data, onChange, onNext, onBack }: StepProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [showPan, setShowPan] = useState(false);

  const validate = (field: string, value: string) => {
    const partial: Record<string, string> = {
      aadhaar_number: data.aadhaar_number,
      pan_number: data.pan_number,
      [field]: value,
    };
    const result = step3Schema.safeParse(partial);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors((prev) => ({
        ...prev,
        [field]: (fieldErrors as Record<string, string[]>)[field]?.[0],
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    setTouched({ aadhaar_number: true, pan_number: true, photo: true });

    const result = step3Schema.safeParse({
      aadhaar_number: data.aadhaar_number,
      pan_number: data.pan_number,
    });

    let hasError = false;
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({
        aadhaar_number: fe.aadhaar_number?.[0],
        pan_number: fe.pan_number?.[0],
      });
      hasError = true;
    }

    if (!data.photo_file) {
      setErrors((prev) => ({ ...prev, photo: "Please upload a profile photo." }));
      hasError = true;
    }

    if (!hasError) {
      setErrors({});
      onNext();
    }
  };

  // Aadhaar display value (formatted when showing, masked when hidden)
  const aadhaarDisplay = showAadhaar
    ? formatAadhaar(data.aadhaar_number)
    : data.aadhaar_number
    ? "•".repeat(Math.min(data.aadhaar_number.length, 12))
    : "";

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-5 pt-2 pb-6">
        <h2 className="text-xl font-bold text-slate-900">Identity & Photo</h2>
        <p className="text-slate-500 text-sm mt-1">
          Your ID details are securely stored
        </p>
      </div>

      <div className="flex-1 px-5 space-y-5">
        {/* Aadhaar Number */}
        <div>
          <label htmlFor="aadhaar_number" className="block text-sm font-semibold text-slate-700 mb-2">
            Aadhaar Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="aadhaar_number"
              type={showAadhaar ? "text" : "password"}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Enter 12-digit Aadhaar"
              maxLength={12}
              value={data.aadhaar_number}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                onChange({ aadhaar_number: val });
                if (touched.aadhaar_number) validate("aadhaar_number", val);
              }}
              onBlur={(e) => {
                setTouched((p) => ({ ...p, aadhaar_number: true }));
                validate("aadhaar_number", e.target.value.replace(/\D/g, ""));
              }}
              className={`w-full pl-4 pr-12 py-4 rounded-2xl border-2 bg-white text-slate-900 placeholder-slate-400 text-base outline-none transition-colors tracking-widest ${
                touched.aadhaar_number && errors.aadhaar_number
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowAadhaar((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 active:scale-90 transition-transform"
              aria-label={showAadhaar ? "Hide Aadhaar" : "Show Aadhaar"}
            >
              {showAadhaar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {showAadhaar && data.aadhaar_number && (
            <p className="mt-1 text-xs text-slate-500 font-mono">
              {aadhaarDisplay}
            </p>
          )}
          {touched.aadhaar_number && errors.aadhaar_number && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span>⚠</span> {errors.aadhaar_number}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">12-digit number on your Aadhaar card</p>
        </div>

        {/* PAN Number */}
        <div>
          <label htmlFor="pan_number" className="block text-sm font-semibold text-slate-700 mb-2">
            PAN Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="pan_number"
              type={showPan ? "text" : "password"}
              inputMode="text"
              autoComplete="off"
              placeholder="ABCDE1234F"
              maxLength={10}
              value={data.pan_number}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
                onChange({ pan_number: val });
                if (touched.pan_number) validate("pan_number", val);
              }}
              onBlur={(e) => {
                setTouched((p) => ({ ...p, pan_number: true }));
                validate("pan_number", e.target.value);
              }}
              className={`w-full pl-4 pr-12 py-4 rounded-2xl border-2 bg-white text-slate-900 placeholder-slate-400 text-base outline-none transition-colors tracking-widest ${
                touched.pan_number && errors.pan_number
                  ? "border-red-400 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPan((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 active:scale-90 transition-transform"
              aria-label={showPan ? "Hide PAN" : "Show PAN"}
            >
              {showPan ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {touched.pan_number && errors.pan_number && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
              <span>⚠</span> {errors.pan_number}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">e.g. ABCDE1234F (auto-converts to uppercase)</p>
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Profile Photo <span className="text-red-500">*</span>
          </label>
          <PhotoUpload
            preview={data.photo_preview}
            onFileSelected={(file, preview) => {
              onChange({ photo_file: file, photo_preview: preview });
              setErrors((p) => ({ ...p, photo: undefined }));
            }}
            onClear={() => onChange({ photo_file: null, photo_preview: null })}
          />
          {touched.photo && errors.photo && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <span>⚠</span> {errors.photo}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
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
          Review Details
        </button>
      </div>
    </div>
  );
}
