import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get election_id from query params
    const electionId = request.nextUrl.searchParams.get("electionId");

    if (!electionId) {
      return NextResponse.json(
        { error: "Election ID is required" },
        { status: 400 }
      );
    }

    // Get all votes for the election
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("candidate_id, position_id")
      .eq("election_id", electionId);

    if (votesError) throw votesError;

    if (!votes || votes.length === 0) {
      return NextResponse.json({
        positionVotes: [],
      });
    }

    // Group votes by position_id and candidate_id
    const votesByPositionAndCandidate: {
      [positionId: string]: {
        [candidateId: string]: number;
      };
    } = {};

    votes.forEach((vote) => {
      const posId = vote.position_id;
      const candId = vote.candidate_id;

      if (!votesByPositionAndCandidate[posId]) {
        votesByPositionAndCandidate[posId] = {};
      }

      votesByPositionAndCandidate[posId][candId] =
        (votesByPositionAndCandidate[posId][candId] || 0) + 1;
    });

    // Get unique position IDs from votes
    const positionIds = Object.keys(votesByPositionAndCandidate);
    
    // Get unique candidate IDs from votes
    const uniqueCandidateIds = [...new Set(votes.map((v) => v.candidate_id))];

    // Fetch position details
    const { data: positions } = await supabase
      .from("positions")
      .select("id, name, display_order")
      .in("id", positionIds)
      .order("display_order", { ascending: true });

    // Fetch candidate details - include all candidates from those positions
    const { data: allCandidatesInPositions } = await supabase
      .from("candidates")
      .select("id, student_id, position_id, partylist_id")
      .in("position_id", positionIds)
      .eq("is_active", true);

    // Filter to get students for candidates with votes and other active candidates
    const candidates = allCandidatesInPositions;

    // Fetch student details
    const studentIds = candidates?.map((c) => c.student_id) || [];
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, \"Full Name\"")
      .in("id", studentIds);

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
    }

    // Fetch partylist details
    const partylistIds = candidates
      ?.filter((c) => c.partylist_id)
      .map((c) => c.partylist_id) || [];
    const { data: partylists } = await supabase
      .from("partylists")
      .select("id, name, color")
      .in("id", partylistIds);

    // Build the response with votes grouped by position
    const positionVotes = positions?.map((position) => {
      const candidateVotes = candidates
        ?.filter((c) => c.position_id === position.id)
        .map((candidate) => {
          const student = students?.find((s) => s.id === candidate.student_id);
          const partylist = partylists?.find(
            (p) => p.id === candidate.partylist_id
          );

          // Construct name from Full Name column
          let candidateName = 'Unknown';
          if (student && (student as any)["Full Name"]) {
            candidateName = (student as any)["Full Name"];
          }

          return {
            id: candidate.id,
            name: candidateName,
            votes: votesByPositionAndCandidate[position.id]?.[candidate.id] || 0,
            partylist: partylist
              ? {
                  name: partylist.name,
                  color: partylist.color,
                }
              : null,
          };
        })
        .sort((a, b) => b.votes - a.votes) || [];

      return {
        positionId: position.id,
        positionName: position.name,
        displayOrder: position.display_order,
        candidates: candidateVotes,
      };
    });

    return NextResponse.json({
      positionVotes: positionVotes || [],
    });
  } catch (error) {
    console.error("Error fetching candidate votes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
