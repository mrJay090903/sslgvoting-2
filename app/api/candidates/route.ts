import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin-guard';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';
import { validateInput, candidateSchema, uuidSchema } from '@/lib/security/validation';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

    // If candidate had a photo, delete the file
    if (candidate?.photo_url) {
      try {
        // Extract filename from URL (e.g., /uploads/candidates/filename.jpg)
        const filename = path.basename(candidate.photo_url);
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'candidates', filename);
        
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (fileError) {
        console.error('Failed to delete candidate photo:', fileError);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
