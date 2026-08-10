import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { buildSingleWorkerPdfDoc, urlToBase64 } from "@/lib/pdfGenerator";
import { generateRefId, formatDate } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/register/pdf?id=<worker_uuid>
 * 
 * Generates a PDF for a newly-registered worker.
 * No auth required — the worker gets this link immediately after registering.
 * The ID is an opaque UUID (not guessable), so security is by obscurity-of-UUID.
 * Aadhaar/PAN are NOT logged. PDF is generated on-demand, never stored.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || id.length < 10) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const adminClient = createAdminSupabaseClient();
    const { data: worker, error } = await adminClient
      .from("workers")
      .select(
        "id, full_name, father_name, mobile_number, address, aadhaar_number, pan_number, photo_url, status, registration_date, updated_at"
      )
      .eq("id", id)
      .single();

    if (error || !worker) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const refId = generateRefId(worker.id);

    // Fetch photo as base64 (server-side, never exposed to client)
    let photoDataUrl: string | null = null;
    if (worker.photo_url) {
      photoDataUrl = await urlToBase64(worker.photo_url);
    }

    const pdfDoc = buildSingleWorkerPdfDoc(
      {
        id: worker.id,
        registration_id: refId,
        registration_date: formatDate(worker.registration_date),
        full_name: worker.full_name,
        father_name: worker.father_name,
        mobile_number: worker.mobile_number,
        address: worker.address,
        aadhaar_number: worker.aadhaar_number,
        pan_number: worker.pan_number,
        photo_url: worker.photo_url,
        status: worker.status,
      },
      photoDataUrl
    );

    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));
    const filename = `Worker_Registration_${refId}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Worker PDF generation error:", err instanceof Error ? err.message : "Unknown");
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
