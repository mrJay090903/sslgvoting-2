import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin-guard';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';
import { validateInput, partylistSchema, uuidSchema } from '@/lib/security/validation';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`partylists:get:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const { data, error } = await supabaseAdmin
      .from('partylists')
      .select('*')
      .order('name');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch partylists' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`partylists:post:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    
    // Validate input
    const validation = validateInput(partylistSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('partylists')
      .insert([validation.data])
      .select();

    if (error) {
      return NextResponse.json({ error: 'Failed to create partylist' }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`partylists:put:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Validate ID
    const idValidation = validateInput(uuidSchema, id);
    if (!idValidation.success) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('partylists')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: 'Failed to update partylist' }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`partylists:delete:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Validate ID
    const idValidation = validateInput(uuidSchema, id);
    if (!idValidation.success) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('partylists')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete partylist' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
