import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { maskAadhaar, maskPan, formatDate } from "@/lib/utils";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

function escapeCsvValue(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export async function GET(_req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient
    .from("workers")
    .select("id, full_name, mobile_number, father_name, address, aadhaar_number, pan_number, status, registration_date")
    .order("registration_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }

  const headers = [
    "Worker ID",
    "Full Name",
    "Mobile Number",
    "Father's Name",
    "Address",
    "Aadhaar (Masked)",
    "PAN (Masked)",
    "Status",
    "Registration Date",
  ];

  const rows = (data ?? []).map((w) =>
    [
      w.id,
      w.full_name,
      w.mobile_number,
      w.father_name,
      w.address,
      maskAadhaar(w.aadhaar_number),
      maskPan(w.pan_number),
      w.status,
      formatDate(w.registration_date),
    ]
      .map(escapeCsvValue)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="workers-${Date.now()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
