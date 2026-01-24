import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse, getClientIdentifier, getRateLimitConfig } from '@/lib/security/rate-limit';
import { validateInput, votesArraySchema, uuidSchema } from '@/lib/security/validation';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Rate limiting - strict for voting
    const clientIp = getClientIdentifier(request);
    const config = getRateLimitConfig('/api/votes');
    const { allowed, remaining, resetIn } = checkRateLimit(`votes:${clientIp}`, config);
    
    if (!allowed) {
      return rateLimitResponse(resetIn);
    }

    const body = await request.json();
    const { sessionToken, studentId, electionId, votes } = body;

    console.log('Vote submission received:', {
      hasToken: !!sessionToken,
      studentId,
      electionId,
      votesCount: votes?.length
    });

    // Validate required fields
    if (!sessionToken || !studentId || !electionId || !votes) {
      console.error('Missing required fields:', { sessionToken: !!sessionToken, studentId: !!studentId, electionId: !!electionId, votes: !!votes });
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Validate UUIDs
    const studentIdValidation = validateInput(uuidSchema, studentId);
    const electionIdValidation = validateInput(uuidSchema, electionId);
    
    if (!studentIdValidation.success || !electionIdValidation.success) {
      return NextResponse.json(
        { error: 'Invalid ID format' }, 
        { status: 400 }
      );
    }

    // Validate votes array
    const votesValidation = validateInput(votesArraySchema, votes);
    if (!votesValidation.success) {
      return NextResponse.json(
        { error: votesValidation.error }, 
        { status: 400 }
      );
    }

    // Verify the session token matches the stored one
    const { data: votingSession, error: sessionError } = await supabaseAdmin
      .from('voting_sessions')
      .select('*')
      .eq('election_id', electionId)
      .eq('student_id', studentId)
      .eq('session_token', sessionToken)
      .eq('has_voted', false)
      .maybeSingle();

    console.log('Session verification:', {
      found: !!votingSession,
      error: sessionError?.message,
      errorCode: sessionError?.code,
      searchingFor: { electionId, studentId, hasToken: !!sessionToken }
    });

    // Debug: Check what sessions exist for this student
    if (!votingSession) {
      const { data: allSessions } = await supabaseAdmin
        .from('voting_sessions')
        .select('id, election_id, student_id, has_voted, created_at, session_token')
        .eq('student_id', studentId);
      
      console.log('All sessions for student:', allSessions);
    }

    if (sessionError) {
      console.error('Session verification database error:', sessionError);
      return NextResponse.json(
        { error: 'Database error during session verification.' }, 
        { status: 500 }
      );
    }

    if (!votingSession) {
      // Check if any session exists for this student/election
      const { data: anySession } = await supabaseAdmin
        .from('voting_sessions')
        .select('has_voted, session_token')
        .eq('election_id', electionId)
        .eq('student_id', studentId)
        .maybeSingle();

      console.log('Any session check:', anySession);

      if (anySession?.has_voted) {
        console.log('Student has already voted');
        return NextResponse.json(
          { error: 'You have already voted in this election.' }, 
          { status: 403 }
        );
      }

      console.error('No valid session found. Session may have expired or not been created.');
      return NextResponse.json(
        { error: 'Session not found. Please log in again to vote.' }, 
        { status: 401 }
      );
    }

    // Check if session is expired (30 minute timeout)
    // Note: If created_at column exists, we can check timeout
    if (votingSession.created_at) {
      const sessionCreated = new Date(votingSession.created_at);
      const now = new Date();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now.getTime() - sessionCreated.getTime() > thirtyMinutes) {
        return NextResponse.json(
          { error: 'Session expired. Please login again.' }, 
          { status: 401 }
        );
      }
    }

    // Verify election is still open
    const { data: election, error: electionError } = await supabaseAdmin
      .from('elections')
      .select('status')
      .eq('id', electionId)
      .single();

    if (electionError || !election || election.status !== 'open') {
      return NextResponse.json(
        { error: 'Election is not currently open' }, 
        { status: 403 }
      );
    }

    // Verify all candidates exist and are active
    const candidateIds = votes.map((v: { candidate_id: string }) => v.candidate_id);
    const { data: candidates, error: candidatesError } = await supabaseAdmin
      .from('candidates')
      .select('id, position_id')
      .in('id', candidateIds)
      .eq('is_active', true);

    if (candidatesError || !candidates || candidates.length !== candidateIds.length) {
      return NextResponse.json(
        { error: 'Invalid candidate selection' }, 
        { status: 400 }
      );
    }

    // Check for duplicate position votes
    const positionIds = candidates.map(c => c.position_id);
    const uniquePositions = new Set(positionIds);
    if (uniquePositions.size !== positionIds.length) {
      return NextResponse.json(
        { error: 'Cannot vote for multiple candidates in the same position' }, 
        { status: 400 }
      );
    }

    // Prepare votes with server-validated data
    const validatedVotes = votes.map((vote: { candidate_id: string; position_id: string }) => ({
      election_id: electionId,
      student_id: studentId,
      candidate_id: vote.candidate_id,
      position_id: vote.position_id,
    }));

    // Insert votes
    const { error: votesError } = await supabaseAdmin
      .from('votes')
      .insert(validatedVotes);

    if (votesError) {
      console.error('Vote insertion error:', votesError);
      return NextResponse.json(
        { error: 'Failed to submit votes. Please try again.' }, 
        { status: 500 }
      );
    }

    // Mark session as voted
    const { error: updateError } = await supabaseAdmin
      .from('voting_sessions')
      .update({ 
        has_voted: true,
        session_token: null // Invalidate token after use
      })
      .eq('id', votingSession.id);

    if (updateError) {
      console.error('Session update error:', updateError);
      // Votes are still recorded, so don't fail
    }

    return NextResponse.json({ 
      success: true,
      message: 'Your vote has been recorded successfully'
    }, {
      headers: { 'X-RateLimit-Remaining': remaining.toString() }
    });

  } catch (err) {
    console.error('Vote submission error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
