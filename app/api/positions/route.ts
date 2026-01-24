import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin-guard';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';
import { validateInput, positionSchema, uuidSchema } from '@/lib/security/validation';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`positions:get:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const { data, error } = await supabaseAdmin
      .from('positions')
      .select('*')
      .order('display_order');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
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
    const { allowed, resetIn } = checkRateLimit(`positions:post:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    
    // Validate input
    const validation = validateInput(positionSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('positions')
      .insert([validation.data])
      .select();

    if (error) {
      return NextResponse.json({ error: 'Failed to create position' }, { status: 500 });
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
    const { allowed, resetIn } = checkRateLimit(`positions:put:${clientIp}`);
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

    const body = await request.json();
    
    // Validate input
    const validation = validateInput(positionSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('positions')
      .update(validation.data)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
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
    const { allowed, resetIn } = checkRateLimit(`positions:delete:${clientIp}`);
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
      .from('positions')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
