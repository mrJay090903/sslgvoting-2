import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin-guard';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';
import { validateInput, candidateSchema, uuidSchema } from '@/lib/security/validation';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`candidates:get:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    // Fetch candidates with relations
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .select(`
        *,
        student:students(*),
        position:positions(name),
        partylist:partylists(name, color)
      `);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
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
    const { allowed, resetIn } = checkRateLimit(`candidates:post:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    
    // Validate input
    const validation = validateInput(candidateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('candidates')
      .insert([validation.data])
      .select(`
        *,
        student:students(*),
        position:positions(name),
        partylist:partylists(name, color)
      `);

    if (error) {
      return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`candidates:patch:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const idValidation = validateInput(uuidSchema, id);
    if (!idValidation.success) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();

    // Build partial update — only allow known candidate fields
    const allowedFields = ['position_id', 'partylist_id', 'platform', 'vision', 'mission', 'photo_url', 'is_active'];
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('candidates')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        student:students(*),
        position:positions(name),
        partylist:partylists(name, color)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`candidates:delete:${clientIp}`);
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

    // First, get the candidate to check for photo_url
    const { data: candidate } = await supabaseAdmin
      .from('candidates')
      .select('photo_url')
      .eq('id', id)
      .single();

    // Delete the candidate from database
    const { error } = await supabaseAdmin
      .from('candidates')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
    }

    // If candidate had a photo, delete from Supabase Storage
    if (candidate?.photo_url) {
      try {
        // Extract just the filename from the full public URL
        const filename = candidate.photo_url.split('/').pop();
        if (filename) {
          await supabaseAdmin.storage.from('candidate-photos').remove([filename]);
        }
      } catch (fileError) {
        console.error('Failed to delete candidate photo from storage:', fileError);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
