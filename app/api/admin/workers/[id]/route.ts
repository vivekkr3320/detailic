import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { maskAadhaar, maskPan } from "@/lib/utils";
import { z } from "zod";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

const updateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  father_name: z.string().min(2).max(100).optional(),
  mobile_number: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.string().min(10).max(500).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient
    .from("workers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...data,
    aadhaar_number: undefined,
    pan_number: undefined,
    aadhaar_masked: maskAadhaar(data.aadhaar_number),
    pan_masked: maskPan(data.pan_number),
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient
    .from("workers")
    .update(result.data)
    .eq("id", id)
    .select("id, full_name, mobile_number, father_name, address, status, updated_at")
    .single();

  if (error) {
    console.error("Worker update error:", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, worker: data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const adminClient = createAdminSupabaseClient();
  const { error } = await adminClient.from("workers").delete().eq("id", id);

  if (error) {
    console.error("Worker delete error:", error.message);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
