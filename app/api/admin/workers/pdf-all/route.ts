import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { buildMultiWorkerPdfDoc, urlToBase64, type PDFWorkerData } from "@/lib/pdfGenerator";
import { generateRefId, formatDate } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const userSupabase = await createServerSupabaseClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminSupabaseClient();

    // Fetch up to 500 workers ordered by creation date
    const { data: workers, error } = await adminClient
      .from("workers")
      .select("*")
      .order("registration_date", { ascending: false })
      .limit(500);

    if (error || !workers || workers.length === 0) {
      return NextResponse.json({ error: "No workers found to generate report" }, { status: 404 });
    }

    // Convert photos in parallel for all workers (with concurrency limit/safety)
    const formattedWorkers: PDFWorkerData[] = await Promise.all(
      workers.map(async (worker) => {
        let photoDataUrl: string | null = null;
        if (worker.photo_url) {
          photoDataUrl = await urlToBase64(worker.photo_url);
        }
        return {
          id: worker.id,
          registration_id: generateRefId(worker.id),
          registration_date: formatDate(worker.registration_date),
          full_name: worker.full_name,
          father_name: worker.father_name,
          mobile_number: worker.mobile_number,
          address: worker.address,
          aadhaar_number: worker.aadhaar_number,
          pan_number: worker.pan_number,
          photo_url: worker.photo_url,
          photo_data_url: photoDataUrl,
          status: worker.status,
        };
      })
    );

    const pdfDoc = buildMultiWorkerPdfDoc(formattedWorkers);
    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));
    const filename = `All_Workers_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Multi-worker PDF report route error:", err);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
