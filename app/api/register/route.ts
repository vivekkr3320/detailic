import { NextRequest, NextResponse } from "next/server";
import { fullRegistrationSchema } from "@/lib/validations";
import { generateRefId } from "@/lib/utils";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract text fields
    const raw = {
      full_name: (formData.get("full_name") as string | null)?.trim() ?? "",
      father_name: (formData.get("father_name") as string | null)?.trim() ?? "",
      mobile_number: (formData.get("mobile_number") as string | null)?.trim() ?? "",
      address: (formData.get("address") as string | null)?.trim() ?? "",
      aadhaar_number: (formData.get("aadhaar_number") as string | null)?.replace(/\D/g, "") ?? "",
      pan_number: (formData.get("pan_number") as string | null)?.toUpperCase().trim() ?? "",
    };

    // Server-side validation
    const result = fullRegistrationSchema.safeParse(raw);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const validated = result.data;
    const adminClient = createAdminSupabaseClient();

    // Handle photo upload
    let photoUrl: string | null = null;
    const photoFile = formData.get("photo") as File | null;

    if (photoFile && photoFile.size > 0) {
      const arrayBuffer = await photoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await adminClient.storage
        .from("worker-photos")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError.message);
        // Don't fail registration if photo upload fails — store without photo
      } else {
        const { data: urlData } = adminClient.storage
          .from("worker-photos")
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    // Insert worker record — NEVER log aadhaar/pan
    const { data: worker, error: dbError } = await adminClient
      .from("workers")
      .insert({
        full_name: validated.full_name,
        photo_url: photoUrl,
        mobile_number: validated.mobile_number,
        father_name: validated.father_name,
        address: validated.address,
        aadhaar_number: validated.aadhaar_number,
        pan_number: validated.pan_number,
        status: "active",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError.message);
      return NextResponse.json(
        { success: false, error: "Registration failed. Please try again." },
        { status: 500 }
      );
    }

    const refId = generateRefId(worker.id);

    return NextResponse.json({ success: true, id: worker.id, ref_id: refId });
  } catch (err) {
    console.error("Registration error:", err instanceof Error ? err.message : "Unknown");
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
