"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Home, 
  Vote as VoteIcon, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  HelpCircle,
  Menu
} from "lucide-react";

interface Position {
  id: string;
  name: string;
  description: string | null;
  max_votes: number;
}

interface Candidate {
  id: string;
  platform: string | null;
  photo_url: string | null;
  vision: string | null;
  mission: string | null;
  student: {
    full_name: string;
  };
  partylist: {
    name: string;
    color: string;
  } | null;
}

interface PositionWithCandidates extends Position {
  candidates: Candidate[];
}

export default function VotePage() {
  const router = useRouter();
  const params = useParams();
  const electionId = params.id as string;

  const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState<number>(0);


  useEffect(() => {
    // Get student info from session storage
    const name = sessionStorage.getItem("student_name");
    const storedElectionId = sessionStorage.getItem("election_id");
    const studentId = sessionStorage.getItem("student_id");
    const sessionToken = sessionStorage.getItem("session_token");

    console.log('Vote page loaded, checking session:', {
      hasName: !!name,
      hasStudentId: !!studentId,
      hasSessionToken: !!sessionToken,
      electionIdMatch: storedElectionId === electionId
    });

    if (!name || !studentId || !sessionToken || storedElectionId !== electionId) {
      console.error('Missing session data, redirecting to login');
      setError("Session expired or invalid. Redirecting to login...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return;
    }

    setStudentName(name);
    fetchElectionData(studentId);
  }, [electionId, router]);

  const fetchElectionData = async (studentId: string) => {
    const supabase = createClient();

    // Fetch student's actual grade from database
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select('"Grade"')
      .eq("id", studentId)
      .single();

    if (studentError || !studentData) {
      console.error('Error fetching student grade:', studentError);
      setError("Failed to load student information");
      setLoading(false);
      return;
    }

    const studentGradeLevel = Number(studentData["Grade"]) || 0;
    console.log("Student grade from database:", studentGradeLevel);
    setStudentGrade(studentGradeLevel);

    console.log("Fetching election data for grade:", studentGradeLevel);

    // Get all active positions
    const { data: positionsData, error: positionsError } = await supabase
      .from("positions")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    console.log("Positions data:", positionsData, positionsError);

    if (positionsError || !positionsData) {
      setError("Failed to load election data");
      setLoading(false);
      return;
    }

    // Get candidates for each position
    const positionsWithCandidates: PositionWithCandidates[] = [];

    for (const position of positionsData) {
      // Handle grade representatives - show next grade level
      const positionName = position.name.toLowerCase();
      const isGradeRep = positionName.includes('grade') && positionName.includes('representative');
      
      if (isGradeRep) {
        // Extract grade number from position name (e.g., "Grade 7 Representative" -> 7)
        const gradeMatch = position.name.match(/Grade\s+(\d+)/i);
        if (gradeMatch) {
          const repGrade = parseInt(gradeMatch[1]);
          const nextGrade = studentGradeLevel + 1;
          
          // Show next grade's representatives
          // e.g., if student is grade 7, show grade 8 representatives
          // if student is grade 12, don't show any representatives
          if (repGrade !== nextGrade || nextGrade > 12) {
            console.log(`Skipping ${position.name} - student is grade ${studentGradeLevel}, next grade is ${nextGrade}`);
            continue;
          }
        }
      }

      // Get candidates with separate queries to avoid RLS issues
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("*")
        .eq("position_id", position.id)
        .eq("is_active", true);

      console.log(`Raw candidates for ${position.name}:`, candidatesData, candidatesError);

      // Enrich candidates with student and partylist data
      const enrichedCandidates = [];
      if (candidatesData && candidatesData.length > 0) {
        for (const candidate of candidatesData) {
          // Get student info
          const { data: studentData } = await supabase
            .from("students")
            .select("\"Full Name\"")
            .eq("id", candidate.student_id)
            .single();

          // Get partylist info if exists
          let partylistData = null;
          if (candidate.partylist_id) {
            const { data: partylist } = await supabase
              .from("partylists")
              .select("name, color")
              .eq("id", candidate.partylist_id)
              .single();
            partylistData = partylist;
          }

          enrichedCandidates.push({
            id: candidate.id,
            platform: candidate.platform,
            photo_url: candidate.photo_url,
            vision: candidate.vision,
            mission: candidate.mission,
            student: {
              full_name: (studentData as any)?.["Full Name"] || "Unknown Candidate"
            },
            partylist: partylistData,
          });
        }
      }

      console.log(`Enriched candidates for ${position.name}:`, enrichedCandidates);

      console.log(`Enriched candidates for ${position.name}:`, enrichedCandidates);

      positionsWithCandidates.push({
        ...position,
        candidates: enrichedCandidates,
      });
    }

    console.log("Final positions with candidates:", positionsWithCandidates);
    setPositions(positionsWithCandidates);
    setLoading(false);
  };

  const handleVoteSelect = (positionId: string, candidateId: string, maxVotes: number) => {
    setSelectedVotes((prev) => {
      const currentVotes = prev[positionId] || [];
      
      // Check if candidate is already selected
      if (currentVotes.includes(candidateId)) {
        // Deselect
        return {
          ...prev,
          [positionId]: currentVotes.filter(id => id !== candidateId),
        };
      }
      
      // Check if max votes reached
      if (currentVotes.length >= maxVotes) {
        // Replace last selection if only 1 vote allowed, otherwise don't add
        if (maxVotes === 1) {
          return {
            ...prev,
            [positionId]: [candidateId],
          };
        }
        return prev; // Don't add if max reached for multiple votes
      }
      
      // Add new selection
      return {
        ...prev,
        [positionId]: [...currentVotes, candidateId],
      };
    });
  };



  const handleSubmit = async () => {
    // No validation needed - positions without votes are automatically abstained

    if (!confirm("Are you sure you want to submit your votes? This action cannot be undone.")) {
      return;
    }

    setSubmitting(true);
    setError("");

    const studentId = sessionStorage.getItem("student_id");
    const sessionToken = sessionStorage.getItem("session_token");

    console.log('Vote submission debug:', {
      studentId: studentId ? 'exists' : 'missing',
      sessionToken: sessionToken ? 'exists' : 'missing',
      electionId,
      votesCount: Object.keys(selectedVotes).length
    });

    if (!studentId || !sessionToken) {
      setError("Session expired. Please login again.");
      setSubmitting(false);
      setTimeout(() => {
        sessionStorage.clear();
        router.push("/");
      }, 2000);
      return;
    }

    try {
      // Submit votes through secure API - flatten array of candidate IDs
      const votes: any[] = [];
      Object.entries(selectedVotes).forEach(([positionId, candidateIds]) => {
        candidateIds.forEach(candidateId => {
          votes.push({
            election_id: electionId,
            candidate_id: candidateId,
            position_id: positionId,
          });
        });
      });

      console.log('Submitting votes:', votes.length, 'votes');

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          studentId,
          electionId,
          votes,
        }),
      });

      const result = await response.json();
      console.log('Vote response:', { status: response.status, result });

      if (!response.ok) {
        if (response.status === 401) {
          setError(result.error || "Your session has expired. Redirecting to login...");
          setTimeout(() => {
            sessionStorage.clear();
            router.push("/");
          }, 2000);
        } else {
          setError(result.error || "Failed to submit votes. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      // Clear session storage
      sessionStorage.removeItem("student_id");
      sessionStorage.removeItem("student_name");
      sessionStorage.removeItem("student_grade");
      sessionStorage.removeItem("election_id");
      sessionStorage.removeItem("session_token");

      console.log('Vote submitted successfully, redirecting...');

      // Redirect to success page
      router.push("/vote/success");
    } catch (err) {
      console.error('Vote submission error:', err);
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-600">Loading ballot...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-gradient-to-r from-sky-500 to-blue-600 border-b border-blue-700 px-8 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <img 
              src="/sslglogo.png" 
              alt="SSLG Logo" 
              className="h-14 w-14 object-contain"
            />
            <h1 className="text-2xl font-bold text-white">INHS SSLG VOTING SYSTEM</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="w-6 h-6 text-white" />
            </button>
            <button>
              <HelpCircle className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-white">{studentName.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Ballot Content */}
        <div className="px-8 py-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">
            YOU MAY NOW CAST YOUR VOTES!
          </h1>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-lg mb-6 shadow-sm">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  {error.includes('session') && (
                    <p className="text-sm mt-1">Please log in again to continue voting.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Positions and Candidates */}
          {positions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Positions Available</h3>
              <p className="text-slate-500">
                There are no active positions with candidates for this election yet.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {positions.map((position) => {
                const selectedCount = (selectedVotes[position.id] || []).length;
                const maxVotes = position.max_votes || 1;
                const isRepPosition = position.name.toLowerCase().includes('representative');
                
                return (
                  <div key={position.id} className="bg-white rounded-lg shadow-sm p-6">
                    {/* Position Header */}
                    <div className="mb-6 text-center">
                      <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        {position.name}
                      </h2>
                      <p className="text-slate-600">
                        {isRepPosition 
                          ? `You can vote for up to ${maxVotes} candidates` 
                          : "You can only vote for one candidate"}
                      </p>
                    </div>

                    {/* Candidates Grid */}
                    {position.candidates.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No candidates for this position
                      </p>
                    ) : (
                      <div className="flex justify-center">
                        <div className={`grid gap-6 mb-6 max-w-4xl ${
                          position.candidates.length === 1 
                            ? 'grid-cols-1' 
                            : position.candidates.length === 2
                            ? 'grid-cols-2'
                            : 'grid-cols-1 md:grid-cols-3'
                        }`}>
                        {position.candidates.map((candidate) => {
                          const isSelected = (selectedVotes[position.id] || []).includes(candidate.id);
                          
                          return (
                            <div
                              key={candidate.id}
                              className="relative bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-8 flex flex-col items-center"
                            >
                              {/* Photo */}
                              <div className="mb-6">
                                <div className={`w-40 h-40 rounded-full p-1 bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center`}>
                                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                                    {candidate.photo_url ? (
                                      <img
                                        src={candidate.photo_url}
                                        alt={candidate.student.full_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-sky-300 to-blue-400 flex items-center justify-center">
                                        <User className="w-20 h-20 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Name */}
                              <h3 className="font-bold text-slate-900 text-center mb-2 text-lg">
                                {candidate.student.full_name}
                              </h3>
                              
                              {/* Role/Platform */}
                              <p className="text-sm text-slate-600 text-center mb-6">
                                {candidate.partylist?.name || candidate.platform?.substring(0, 30) + '...' || 'Candidate'}
                              </p>

                              {/* Details */}
                              {candidate.platform && (
                                <div className="w-full mb-4 text-left">
                                  <p className="text-xs font-bold text-slate-600 uppercase mb-1">Platform</p>
                                  <p className="text-sm text-slate-700 line-clamp-2">{candidate.platform}</p>
                                </div>
                              )}
                              {candidate.vision && (
                                <div className="w-full mb-4 text-left">
                                  <p className="text-xs font-bold text-slate-600 uppercase mb-1">Vision</p>
                                  <p className="text-sm text-slate-700 line-clamp-2">{candidate.vision}</p>
                                </div>
                              )}
                              {candidate.mission && (
                                <div className="w-full mb-4 text-left">
                                  <p className="text-xs font-bold text-slate-600 uppercase mb-1">Mission</p>
                                  <p className="text-sm text-slate-700 line-clamp-2">{candidate.mission}</p>
                                </div>
                              )}

                              {/* Vote Button */}
                              <Button
                                onClick={() => handleVoteSelect(position.id, candidate.id, maxVotes)}
                                className={`w-full rounded-full font-semibold ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                                }`}
                              >
                                {isSelected ? '✓ VOTED' : 'VOTE'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* Submit Button */}
          {positions.length > 0 && (
            <div className="flex flex-col items-center py-8 gap-4">
              {submitting && (
                <div className="text-center mb-2">
                  <div className="inline-flex items-center gap-2 text-indigo-600">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">Submitting your votes...</span>
                  </div>
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                size="lg"
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-4 px-16 rounded-full text-lg shadow-lg shadow-sky-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT VOTES"}
              </Button>
            </div>
          )}
          
          {/* Reminder Text */}
          {positions.length > 0 && (
            <p className="text-center text-sm text-slate-500 pb-8">
              Double-check your choices before submitting your votes.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
