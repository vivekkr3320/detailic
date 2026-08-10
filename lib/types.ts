export interface Worker {
  id: string;
  full_name: string;
  photo_url: string | null;
  mobile_number: string;
  father_name: string;
  address: string;
  status: "active" | "inactive";
  registration_date: string;
  updated_at: string;
}

// Admin-facing worker (includes masked sensitive fields)
export interface AdminWorker extends Worker {
  aadhaar_masked: string; // e.g. XXXX XXXX 1234
  pan_masked: string;     // e.g. ABCDEXXXXF
}

// Registration form data (multi-step, stored in React state)
export interface RegistrationFormData {
  // Step 1
  full_name: string;
  father_name: string;
  mobile_number: string;
  // Step 2
  address: string;
  // Step 3
  aadhaar_number: string;
  pan_number: string;
  photo_file: File | null;
  photo_preview: string | null;
}

export type FormStep = 1 | 2 | 3 | "review" | "success";

export interface StepProps {
  data: RegistrationFormData;
  onChange: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

// API response types
export interface RegisterResponse {
  success: boolean;
  id?: string;
  ref_id?: string;
  error?: string;
}

export interface WorkerListResponse {
  workers: AdminWorker[];
  total: number;
  page: number;
  limit: number;
}
