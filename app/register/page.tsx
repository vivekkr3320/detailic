"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "@/components/registration/ProgressBar";
import StepBasicDetails from "@/components/registration/StepBasicDetails";
import StepAddress from "@/components/registration/StepAddress";
import StepIdAndPhoto from "@/components/registration/StepIdAndPhoto";
import ReviewScreen from "@/components/registration/ReviewScreen";
import type { RegistrationFormData, FormStep } from "@/lib/types";

const INITIAL_DATA: RegistrationFormData = {
  full_name: "",
  father_name: "",
  mobile_number: "",
  address: "",
  aadhaar_number: "",
  pan_number: "",
  photo_file: null,
  photo_preview: null,
};

const STEP_TITLES: Record<number, string> = {
  1: "Basic Details",
  2: "Address",
  3: "ID & Photo",
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<RegistrationFormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const updateData = useCallback((updates: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = (s: FormStep) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevent double submit
    setSubmitting(true);
    setSubmitError(undefined);

    try {
      const body = new FormData();
      body.append("full_name", formData.full_name);
      body.append("father_name", formData.father_name);
      body.append("mobile_number", formData.mobile_number);
      body.append("address", formData.address);
      body.append("aadhaar_number", formData.aadhaar_number);
      body.append("pan_number", formData.pan_number);
      if (formData.photo_file) {
        body.append("photo", formData.photo_file, "photo.jpg");
      }

      const res = await fetch("/api/register", {
        method: "POST",
        body,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setSubmitError(json.error || "Registration failed. Please try again.");
        return;
      }

      router.push(`/success?id=${json.id}&ref_id=${json.ref_id}`);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Header back button logic
  const handleBack = () => {
    if (step === 2) goToStep(1);
    else if (step === 3) goToStep(2);
    else if (step === "review") goToStep(3);
    else router.push("/");
  };

  const numericStep = step === "review" ? 3 : (step as number);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium">Worker Registration</p>
          <h1 className="text-sm font-bold text-slate-900">
            {step === "review" ? "Review Details" : STEP_TITLES[numericStep]}
          </h1>
        </div>
      </header>

      {/* Progress bar — show only for steps 1–3 */}
      {typeof step === "number" && (
        <ProgressBar currentStep={step} totalSteps={3} />
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        {step === 1 && (
          <StepBasicDetails
            data={formData}
            onChange={updateData}
            onNext={() => goToStep(2)}
          />
        )}
        {step === 2 && (
          <StepAddress
            data={formData}
            onChange={updateData}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        )}
        {step === 3 && (
          <StepIdAndPhoto
            data={formData}
            onChange={updateData}
            onNext={() => goToStep("review")}
            onBack={() => goToStep(2)}
          />
        )}
        {step === "review" && (
          <>
            {submitError && (
              <div className="mx-5 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-700 font-medium">⚠ {submitError}</p>
              </div>
            )}
            <ReviewScreen
              data={formData}
              onSubmit={handleSubmit}
              onEdit={() => goToStep(1)}
              submitting={submitting}
            />
          </>
        )}
      </div>
    </div>
  );
}
