import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin-guard';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';
import { z } from 'zod';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema for teacher account
const teacherSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required').max(200),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  assigned_grade: z.number().int().min(7).max(12),
  contact_number: z.string().max(20).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

const updateTeacherSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  username: z.string().min(3).max(50).optional(),
  assigned_grade: z.number().int().min(7).max(12).optional(),
  contact_number: z.string().max(20).optional().nullable(),
  is_active: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`accounts:get:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    // Fetch all teacher accounts
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'teacher')
      .order('full_name');

    if (error) {
      console.error('Error fetching teachers:', error);
      return NextResponse.json({ error: 'Failed to fetch teacher accounts' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`accounts:post:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const body = await request.json();
    
    // Validate input
    const validation = teacherSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }

    const { email, password, full_name, username, assigned_grade, contact_number, is_active } = validation.data;

    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create user record in users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        username,
        full_name,
        role: 'teacher',
        assigned_grade,
        contact_number: contact_number || null,
        is_active: is_active ?? true,
      }])
      .select()
      .single();

    if (error) {
      // Rollback: delete auth user if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error('DB error:', error);
      return NextResponse.json({ error: 'Failed to create teacher account' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`accounts:put:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate input
    const validation = updateTeacherSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`);
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(validation.data)
      .eq('id', id)
      .eq('role', 'teacher')
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update teacher account' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`accounts:delete:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    // Verify admin authentication
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Delete from users table first
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'teacher');

    if (dbError) {
      console.error('DB delete error:', dbError);
      return NextResponse.json({ error: 'Failed to delete teacher account' }, { status: 500 });
    }

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Auth delete error:', authError);
      // Don't fail if auth user already deleted
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
