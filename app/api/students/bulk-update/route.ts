import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin-guard';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`students:bulk-update:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const from = Number(body?.fromGrade);
    const to = Number(body?.toGrade);

    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      return NextResponse.json({ error: 'fromGrade and toGrade must be valid numbers' }, { status: 400 });
    }

    // Pre-check: how many rows will match?
    const { count, error: countError } = await supabaseAdmin
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('Grade', from);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (!count || count === 0) {
      return NextResponse.json({ updated: 0, message: 'No students matched fromGrade' });
    }

    const { data, error } = await supabaseAdmin
      .from('students')
      .update({ Grade: to })
      .eq('Grade', from)
      .select('id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ updated: data?.length ?? 0, matched: count });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 });
  }
}
