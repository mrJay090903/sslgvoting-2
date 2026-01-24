import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function verifyAdmin() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { 
      authorized: false, 
      error: NextResponse.json(
        { error: 'Unauthorized - Please login' }, 
        { status: 401 }
      )
    };
  }

  // Check if user has admin role
  // Try both 'id' and 'auth_id' columns for compatibility
  let userData = null;
  let userError = null;
  
  // First try with 'id' column (common pattern)
  const result1 = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!result1.error && result1.data) {
    userData = result1.data;
  } else {
    // Fallback: try matching by email
    const result2 = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single();
    
    userData = result2.data;
    userError = result2.error;
  }

  if (userError || !userData || userData.role !== 'admin') {
    return { 
      authorized: false, 
      error: NextResponse.json(
        { error: 'Forbidden - Admin access required' }, 
        { status: 403 }
      )
    };
  }

  return { authorized: true, user, supabase };
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}
