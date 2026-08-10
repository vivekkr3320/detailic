import { z } from "zod";

const NAME_REGEX = /^[a-zA-Z\s.'-]+$/;

export const step1Schema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters")
    .regex(NAME_REGEX, "Name can only contain letters, spaces, and . ' -"),
  father_name: z
    .string()
    .min(2, "Father's name must be at least 2 characters")
    .max(100, "Father's name must be under 100 characters")
    .regex(NAME_REGEX, "Name can only contain letters, spaces, and . ' -"),
  mobile_number: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

export const step2Schema = z.object({
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be under 500 characters"),
});

export const step3Schema = z.object({
  aadhaar_number: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar number must be exactly 12 digits"),
  pan_number: z
    .string()
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Enter a valid PAN (e.g. ABCDE1234F)"
    ),
});

export const fullRegistrationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type FullRegistrationData = z.infer<typeof fullRegistrationSchema>;
