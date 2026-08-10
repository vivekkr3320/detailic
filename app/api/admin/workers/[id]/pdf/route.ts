import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { buildSingleWorkerPdfDoc, urlToBase64 } from "@/lib/pdfGenerator";
import { generateRefId, formatDate } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify admin authentication
    const userSupabase = await createServerSupabaseClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminSupabaseClient();
    const { data: worker, error } = await adminClient
      .from("workers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const refId = generateRefId(worker.id);
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
      },
    });
  } catch (err) {
    console.error("PDF generation route error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
