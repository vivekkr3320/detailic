import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { maskAadhaar, maskPan } from "@/lib/utils";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const date = searchParams.get("date") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const offset = (page - 1) * limit;

  const adminClient = createAdminSupabaseClient();

  let query = adminClient
    .from("workers")
    .select(
      "id, full_name, photo_url, mobile_number, father_name, address, aadhaar_number, pan_number, status, registration_date, updated_at",
      { count: "exact" }
    )
    .order("registration_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,mobile_number.ilike.%${search}%,father_name.ilike.%${search}%`
    );
  }

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query = query
      .gte("registration_date", start.toISOString())
      .lte("registration_date", end.toISOString());
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Worker list error:", error.message);
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 });
  }

  // Mask sensitive fields — NEVER return raw aadhaar/PAN
  const workers = (data ?? []).map((w) => ({
    id: w.id,
    full_name: w.full_name,
    photo_url: w.photo_url,
    mobile_number: w.mobile_number,
    father_name: w.father_name,
    address: w.address,
    aadhaar_masked: maskAadhaar(w.aadhaar_number),
    pan_masked: maskPan(w.pan_number),
    status: w.status,
    registration_date: w.registration_date,
    updated_at: w.updated_at,
  }));

  return NextResponse.json({ workers, total: count ?? 0, page, limit });
}
