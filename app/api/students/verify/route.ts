import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse, getClientIdentifier, getRateLimitConfig } from '@/lib/security/rate-limit';
import { validateInput, studentIdSchema } from '@/lib/security/validation';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Rate limiting - strict for authentication endpoints
    const clientIp = getClientIdentifier(request);
    const rateLimitKey = `verify:${clientIp}`;
    const config = getRateLimitConfig('/api/students/verify');
    const { allowed, remaining, resetIn } = checkRateLimit(rateLimitKey, config);
    
    if (!allowed) {
      return rateLimitResponse(resetIn);
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateInput(studentIdSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error }, 
        { status: 400, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    const { studentId } = validation.data;

    // Use limit(1) so duplicate Student IDs don't cause a "multiple rows" error
    const { data: rows, error: lookupError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('Student ID', studentId)
      .limit(1);

    if (lookupError) {
      console.error('Student lookup error:', lookupError.message, '| studentId:', studentId);
    }

    const student = rows?.[0] ?? null;

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    // Check if there's an open election
    const { data: elections, error: electionError } = await supabaseAdmin
      .from('elections')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1);

    if (electionError || !elections || elections.length === 0) {
      return NextResponse.json(
        { error: 'No active election at the moment' }, 
        { status: 404, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    const activeElection = elections[0];

    // Check if student has already voted
    const { data: votingSession } = await supabaseAdmin
      .from('voting_sessions')
      .select('*')
      .eq('election_id', activeElection.id)
      .eq('student_id', student.id)
      .eq('has_voted', true)
      .single();

    if (votingSession) {
      return NextResponse.json(
        { error: 'You have already voted in this election' }, 
        { status: 403, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    // Generate a secure session token for voting
    const sessionToken = crypto.randomUUID();
    
    console.log('Creating session for student:', student.id, 'election:', activeElection.id);
    
    // First, try to delete any existing unvoted session
    const { error: deleteError } = await supabaseAdmin
      .from('voting_sessions')
      .delete()
      .eq('election_id', activeElection.id)
      .eq('student_id', student.id)
      .eq('has_voted', false);
    
    if (deleteError) {
      console.warn('Could not delete existing session (might not exist):', deleteError.message);
    }
    
    // Now insert a fresh session
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('voting_sessions')
      .insert({
        election_id: activeElection.id,
        student_id: student.id,
        session_token: sessionToken,
        has_voted: false,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', {
        error: sessionError,
        message: sessionError.message,
        code: sessionError.code,
        details: sessionError.details,
        hint: sessionError.hint
      });
      return NextResponse.json(
        { error: 'Failed to create voting session: ' + sessionError.message }, 
        { status: 500 }
      );
    }

    console.log('Session created successfully with token:', sessionData);

    return NextResponse.json({
      student: {
        id: student.id,
        'Full Name': student['Full Name'],
      },
      election: {
        id: activeElection.id,
        title: activeElection.title,
      },
      sessionToken,
    }, {
      headers: { 'X-RateLimit-Remaining': remaining.toString() }
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
