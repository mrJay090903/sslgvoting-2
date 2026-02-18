import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse, getClientIdentifier } from '@/lib/security/rate-limit';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/candidate-votes/election-data?electionId=...&studentId=...&sessionToken=...
 * Returns positions + candidates for the voting page.
 * Validates the session token so only authenticated voters can access this.
 */
export async function GET(request: Request) {
  try {
    const clientIp = getClientIdentifier(request);
    const { allowed, resetIn } = checkRateLimit(`election-data:get:${clientIp}`);
    if (!allowed) return rateLimitResponse(resetIn);

    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');
    const studentId = searchParams.get('studentId');
    const sessionToken = searchParams.get('sessionToken');

    if (!electionId || !studentId || !sessionToken) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Validate the session token
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('voting_sessions')
      .select('*')
      .eq('election_id', electionId)
      .eq('student_id', studentId)
      .eq('session_token', sessionToken)
      .eq('has_voted', false)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // Fetch student grade (handle both schema formats)
    const { data: studentRows } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('id', studentId)
      .limit(1);

    const studentRow = studentRows?.[0] ?? null;

    const gradeLevel = Number(
      studentRow?.['Grade'] ?? studentRow?.['grade_level'] ?? 0
    );

    // Fetch active positions
    const { data: positionsData, error: positionsError } = await supabaseAdmin
      .from('positions')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (positionsError || !positionsData) {
      return NextResponse.json({ error: 'Failed to load positions' }, { status: 500 });
    }

    // Build positions with candidates
    const positionsWithCandidates = [];

    for (const position of positionsData) {
      // Filter grade representative positions
      const positionName = position.name.toLowerCase();
      const isGradeRep = positionName.includes('grade') && positionName.includes('representative');

      if (isGradeRep) {
        const gradeMatch = position.name.match(/Grade\s+(\d+)/i);
        if (gradeMatch) {
          const repGrade = parseInt(gradeMatch[1]);
          const nextGrade = gradeLevel + 1;
          if (repGrade !== nextGrade || nextGrade > 12) {
            continue;
          }
        }
      }

      // Fetch candidates with student + partylist info
      const { data: candidatesData } = await supabaseAdmin
        .from('candidates')
        .select(`
          id,
          platform,
          photo_url,
          vision,
          mission,
          student:students(*),
          partylist:partylists(name, color)
        `)
        .eq('position_id', position.id)
        .eq('is_active', true);

      const enrichedCandidates = (candidatesData || []).map((c: Record<string, unknown>) => {
        const s = c.student as Record<string, unknown> | null;
        const fullName = s?.['Full Name'] as string
          || (s ? `${s['first_name'] || ''} ${s['last_name'] || ''}`.trim() : '')
          || 'Unknown Candidate';
        return {
          id: c.id,
          platform: c.platform,
          photo_url: c.photo_url,
          vision: c.vision,
          mission: c.mission,
          student: { full_name: fullName },
          partylist: c.partylist || null,
        };
      });

      positionsWithCandidates.push({
        ...position,
        candidates: enrichedCandidates,
      });
    }

    return NextResponse.json({
      gradeLevel,
      positions: positionsWithCandidates,
    });
  } catch (err) {
    console.error('Election data error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
