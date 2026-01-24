import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin-guard';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';
import { validateInput, studentSchema, studentArraySchema, uuidSchema } from '@/lib/security/validation';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`students:get:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    // Fetch all students in batches to bypass the 1000 row default limit
    const allStudents: any[] = [];
    const batchSize = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('students')
        .select('*')
        .range(offset, offset + batchSize - 1)
        .order('id');

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
      }

      if (data && data.length > 0) {
        allStudents.push(...data);
        offset += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    return NextResponse.json(allStudents);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`students:post:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    
    // Validate input
    const isArray = Array.isArray(body);
    const validation = isArray 
      ? validateInput(studentArraySchema, body)
      : validateInput(studentSchema, body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('students')
      .insert(isArray ? validation.data : [validation.data])
      .select();

    if (error) {
      return NextResponse.json({ error: 'Failed to create student(s)' }, { status: 500 });
    }

    return NextResponse.json(isArray ? data : data[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`students:put:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    const { id, ...updateData } = body;
    
    // Validate ID
    const idValidation = validateInput(uuidSchema, id);
    if (!idValidation.success) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
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
    const { allowed, resetIn } = checkRateLimit(`students:delete:${clientIp}`);
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
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
