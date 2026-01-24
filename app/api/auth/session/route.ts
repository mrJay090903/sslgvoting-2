import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, electionId } = body;

    console.log('Session creation request:', { studentId, electionId });

    if (!studentId || !electionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate session token
    const sessionToken = crypto.randomUUID();
    console.log('Generated session token for student:', studentId);

    // Check if there's an existing session (not voted yet)
    const { data: existingSession, error: sessionError } = await supabaseAdmin
      .from('voting_sessions')
      .select('*')
      .eq('election_id', electionId)
      .eq('student_id', studentId)
      .eq('has_voted', false)
      .maybeSingle();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('Session check error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to check session' },
        { status: 500 }
      );
    }

    if (existingSession) {
      console.log('Updating existing session:', existingSession.id);
      // Update existing session with new token
      const { error: updateError } = await supabaseAdmin
        .from('voting_sessions')
        .update({ 
          session_token: sessionToken
        })
        .eq('id', existingSession.id);

      if (updateError) {
        console.error('Session update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update session' },
          { status: 500 }
        );
      }
      console.log('Session updated successfully');
    } else {
      console.log('Creating new session for student:', studentId);
      // Create new voting session
      const { error: insertError } = await supabaseAdmin
        .from('voting_sessions')
        .insert({
          election_id: electionId,
          student_id: studentId,
          session_token: sessionToken,
          has_voted: false,
        });

      if (insertError) {
        console.error('Session insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }
      console.log('Session created successfully');
    }

    return NextResponse.json({ 
      success: true,
      sessionToken 
    });

  } catch (err) {
    console.error('Session creation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
