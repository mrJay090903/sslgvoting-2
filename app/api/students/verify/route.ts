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

    // Parallelize student lookup and election fetch for faster response
    const [studentResult, electionResult] = await Promise.all([
      supabaseAdmin
        .from('students')
        .select('id, "Full Name"')
        .eq('Student ID', studentId)
        .limit(1),
      supabaseAdmin
        .from('elections')
        .select('id, title')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
    ]);

    if (studentResult.error) {
      console.error('Student lookup error:', studentResult.error.message, '| studentId:', studentId);
    }

    const student = studentResult.data?.[0] ?? null;

    if (!student) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    if (electionResult.error || !electionResult.data || electionResult.data.length === 0) {
      return NextResponse.json(
        { error: 'No active election at the moment' }, 
        { status: 404, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    const activeElection = electionResult.data[0];

    // Check if student has already voted
    const { data: votingSession } = await supabaseAdmin
      .from('voting_sessions')
      .select('has_voted')
      .eq('election_id', activeElection.id)
      .eq('student_id', student.id)
      .eq('has_voted', true)
      .maybeSingle();

    if (votingSession) {
      return NextResponse.json(
        { error: 'You have already voted in this election' }, 
        { status: 403, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }

    // Generate a secure session token for voting
    const sessionToken = crypto.randomUUID();
    
    // Use upsert to create or replace session in one query (faster than delete+insert)
    const { error: sessionError } = await supabaseAdmin
      .from('voting_sessions')
      .upsert({
        election_id: activeElection.id,
        student_id: student.id,
        session_token: sessionToken,
        has_voted: false,
      }, {
        onConflict: 'election_id,student_id'
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError.message);
      return NextResponse.json(
        { error: 'Failed to create voting session' }, 
        { status: 500 }
      );
    }

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
