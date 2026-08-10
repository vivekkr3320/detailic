import Image from "next/image";
import { maskAadhaar, maskPan } from "@/lib/utils";
import type { RegistrationFormData } from "@/lib/types";
import { ArrowLeft, Edit2, Send } from "lucide-react";

interface ReviewScreenProps {
  data: RegistrationFormData;
  onSubmit: () => void;
  onEdit: () => void;
  submitting: boolean;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-base text-slate-900 font-medium leading-snug">{value}</p>
    </div>
  );
}

export default function ReviewScreen({
  data,
  onSubmit,
  onEdit,
  submitting,
}: ReviewScreenProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-2 pb-6">
        <h2 className="text-xl font-bold text-slate-900">Review Your Details</h2>
        <p className="text-slate-500 text-sm mt-1">
          Please confirm everything is correct before submitting
        </p>
      </div>

      <div className="flex-1 px-5 space-y-4">
        {/* Photo */}
        {data.photo_preview && (
          <div className="flex justify-center">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-blue-100 shadow-md">
              <Image
                src={data.photo_preview}
                alt="Your photo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 divide-y divide-slate-100 shadow-sm">
          <ReviewRow label="Full Name" value={data.full_name} />
          <ReviewRow label="Father's Name" value={data.father_name} />
          <ReviewRow label="Mobile Number" value={`+91 ${data.mobile_number}`} />
          <ReviewRow label="Address" value={data.address} />
          <ReviewRow label="Aadhaar Number" value={maskAadhaar(data.aadhaar_number)} />
          <ReviewRow label="PAN Number" value={maskPan(data.pan_number)} />
        </div>

        {/* Privacy notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-sm text-amber-800">
            🔒 Your Aadhaar and PAN details are masked for security. By submitting, you confirm these details are correct.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 pt-6 pb-[calc(1.5rem+var(--sab))] space-y-3">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin w-5 h-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting…
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Registration
            </>
          )}
        </button>

        <button
          onClick={onEdit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 text-blue-600 font-semibold text-base py-3 rounded-2xl border-2 border-blue-200 bg-white active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Details
        </button>
      </div>
    </div>
  );
}
