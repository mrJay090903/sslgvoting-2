"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Vote as VoteIcon,
  LogOut,
  CheckCircle,
  Shield,
  Check,
  Sparkles,
  Ban,
  ChevronRight,
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
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState<number>(0);
  const [abstainedPositions, setAbstainedPositions] = useState<Set<string>>(new Set());

  /* ---------- progress tracking ---------- */
  const progress = useMemo(() => {
    const total = positions.length;
    const filled = positions.filter(
      (p) => (selectedVotes[p.id] || []).length > 0 || abstainedPositions.has(p.id)
    ).length;
    return { total, filled, pct: total > 0 ? Math.round((filled / total) * 100) : 0 };
  }, [positions, selectedVotes, abstainedPositions]);

  useEffect(() => {
    const name = sessionStorage.getItem("student_name");
    const storedElectionId = sessionStorage.getItem("election_id");
    const studentId = sessionStorage.getItem("student_id");
    const sessionToken = sessionStorage.getItem("session_token");

    if (!name || !studentId || !sessionToken || storedElectionId !== electionId) {
      toast.error("Session expired or invalid. Redirecting to login...");
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    setStudentName(name);
    fetchElectionData(studentId, sessionToken);
  }, [electionId, router]);

  const fetchElectionData = async (studentId: string, sessionToken: string) => {
    try {
      const res = await fetch(
        `/api/candidate-votes/election-data?electionId=${electionId}&studentId=${studentId}&sessionToken=${encodeURIComponent(sessionToken)}`
      );
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to load election data");
        setLoading(false);
        return;
      }

      setStudentGrade(result.gradeLevel || 0);
      setPositions(result.positions || []);
      toast.success("Ballot loaded successfully!");
    } catch (err) {
      console.error("Error fetching election data:", err);
      toast.error("Failed to load election data");
    }
    setLoading(false);
  };

  const handleVoteSelect = (positionId: string, candidateId: string, maxVotes: number) => {
    setAbstainedPositions((prev) => {
      const next = new Set(prev);
      next.delete(positionId);
      return next;
    });
    setSelectedVotes((prev) => {
      const currentVotes = prev[positionId] || [];

      if (currentVotes.includes(candidateId)) {
        toast.success("Vote removed");
        return { ...prev, [positionId]: currentVotes.filter((id) => id !== candidateId) };
      }

      if (currentVotes.length >= maxVotes) {
        if (maxVotes === 1) {
          toast.success("Vote changed");
          return { ...prev, [positionId]: [candidateId] };
        }
        toast.error(`You can only select up to ${maxVotes} candidates for this position`);
        return prev;
      }

      toast.success("Vote recorded");
      return { ...prev, [positionId]: [...currentVotes, candidateId] };
    });
  };

  const handleAbstain = (positionId: string) => {
    setAbstainedPositions((prev) => {
      const next = new Set(prev);
      if (next.has(positionId)) {
        next.delete(positionId);
        toast("Abstain removed", { icon: "↩️" });
      } else {
        next.add(positionId);
        toast("You have chosen to abstain", { icon: "⊘" });
      }
      return next;
    });
    setSelectedVotes((prev) => {
      const next = { ...prev };
      delete next[positionId];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit your votes? This action cannot be undone.")) return;

    setSubmitting(true);
    toast.loading("Submitting your votes...", { id: "submit" });

    const studentId = sessionStorage.getItem("student_id");
    const sessionToken = sessionStorage.getItem("session_token");

    if (!studentId || !sessionToken) {
      toast.error("Session expired. Please login again.", { id: "submit" });
      setSubmitting(false);
      setTimeout(() => {
        sessionStorage.clear();
        router.push("/");
      }, 2000);
      return;
    }

    try {
      const votes: { election_id: string; candidate_id: string; position_id: string }[] = [];
      Object.entries(selectedVotes).forEach(([positionId, candidateIds]) => {
        candidateIds.forEach((candidateId) => {
          votes.push({ election_id: electionId, candidate_id: candidateId, position_id: positionId });
        });
      });

      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, studentId, electionId, votes }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(result.error || "Session expired. Redirecting...", { id: "submit" });
          setTimeout(() => {
            sessionStorage.clear();
            router.push("/");
          }, 2000);
        } else {
          toast.error(result.error || "Failed to submit votes. Please try again.", { id: "submit" });
        }
        setSubmitting(false);
        return;
      }

      toast.success("Votes submitted successfully!", { id: "submit" });
      sessionStorage.clear();
      setTimeout(() => router.push("/vote/success"), 1000);
    } catch (err) {
      console.error("Vote submission error:", err);
      toast.error("Network error. Please check your connection and try again.", { id: "submit" });
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to leave? Your selections will be lost.")) {
      sessionStorage.clear();
      router.push("/");
    }
  };

  /* ==================== LOADING STATE ==================== */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 via-white to-sky-50">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-xl shadow-sky-500/30">
              <VoteIcon className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-bold text-slate-800">Preparing your ballot</p>
            <p className="text-sm text-slate-500">Loading positions and candidates...</p>
            <div className="flex justify-center gap-1.5 pt-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== MAIN RENDER ==================== */
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#0f172a",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            fontWeight: 600,
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-sky-50/40 flex flex-col">
      {/* ---- HEADER ---- */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left — branding */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-sky-400/20 blur-sm" />
              <img src="/sslglogo.png" alt="SSLG Logo" className="relative h-10 w-10 object-contain" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-bold bg-linear-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                INHS SSLG
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Voting System</p>
            </div>
          </div>

          {/* Center — progress pill (desktop) */}
          <div className="hidden md:flex items-center gap-3 bg-white/80 border border-slate-200/60 rounded-full px-5 py-2 shadow-sm">
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap tabular-nums">
              {progress.filled} of {progress.total}
            </span>
            {progress.pct === 100 && (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
          </div>

          {/* Right — user */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200/60 rounded-full pl-1.5 pr-3.5 py-1.5 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sm">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{studentName.split(" ")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all duration-200 hover:scale-105"
              title="Leave voting"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ---- MOBILE PROGRESS BAR ---- */}
      <div className="md:hidden sticky top-16 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100/60 px-4 py-2.5 flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {progress.filled}/{progress.total}
        </span>
      </div>

      {/* ---- CONTENT ---- */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* Title area */}
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-sky-50 to-blue-50 text-sky-700 border border-sky-200/50 rounded-full px-5 py-2 text-sm font-semibold mb-5 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Official Ballot
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
              Cast Your Vote
            </h1>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Choose your preferred candidate for each position below, or abstain if you wish.
            </p>
          </div>

          {/* Empty state */}
          {positions.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-50 flex items-center justify-center">
                <VoteIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Positions Available</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">There are no active positions with candidates for this election yet.</p>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-12">
              {positions.map((position, posIndex) => {
                const selectedCount = (selectedVotes[position.id] || []).length;
                const maxVotes = position.max_votes || 1;
                const hasVoted = selectedCount > 0;
                const isAbstained = abstainedPositions.has(position.id);
                const hasDecided = hasVoted || isAbstained;

                return (
                  <section
                    key={position.id}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 overflow-hidden scroll-mt-24 hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Position header */}
                    <div className={`px-6 sm:px-8 py-6 sm:py-7 border-b transition-colors duration-300 ${
                      hasDecided
                        ? isAbstained
                          ? "bg-linear-to-r from-amber-50/80 to-orange-50/40 border-amber-100/60"
                          : "bg-linear-to-r from-emerald-50/80 to-green-50/40 border-emerald-100/60"
                        : "bg-linear-to-r from-slate-50/80 to-sky-50/20 border-slate-100/60"
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm transition-all duration-300 ${
                            hasDecided
                              ? isAbstained
                                ? "bg-linear-to-br from-amber-400 to-orange-500 text-white"
                                : "bg-linear-to-br from-emerald-400 to-green-500 text-white"
                              : "bg-white text-slate-500 border border-slate-200"
                          }`}>
                            {hasDecided ? <Check className="w-5 h-5" /> : posIndex + 1}
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
                              {position.name}
                            </h2>
                            <p className="text-slate-400 text-sm mt-1 font-medium">
                              {maxVotes === 1
                                ? "Select one candidate"
                                : `Select up to ${maxVotes} candidates`}
                              <span className="mx-1.5 text-slate-300">&bull;</span>
                              <span className={`tabular-nums ${selectedCount > 0 ? "text-sky-500" : ""}`}>
                                {selectedCount}/{maxVotes} selected
                              </span>
                            </p>
                          </div>
                        </div>
                        {hasDecided && (
                          <Badge className={`font-semibold shrink-0 px-3 py-1 text-xs rounded-lg shadow-sm ${
                            isAbstained
                              ? "bg-linear-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200/60"
                              : "bg-linear-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200/60"
                          }`}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            {isAbstained ? "Abstained" : "Voted"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Candidates */}
                    {position.candidates.length === 0 ? (
                      <div className="px-8 py-16 text-center">
                        <User className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm font-medium">No candidates for this position</p>
                      </div>
                    ) : (
                      <div className="p-5 sm:p-7">
                        <div className={`grid gap-6 ${
                          position.candidates.length === 1
                            ? "grid-cols-1 max-w-lg mx-auto"
                            : position.candidates.length === 2
                            ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        }`}>
                          {position.candidates.map((candidate) => {
                            const isSelected = (selectedVotes[position.id] || []).includes(candidate.id);

                            return (
                              <div
                                key={candidate.id}
                                className={`group relative rounded-2xl border-2 p-6 sm:p-8 transition-all duration-500 ${
                                  isSelected
                                    ? "border-sky-400 bg-linear-to-b from-sky-50/90 to-blue-50/50 shadow-lg shadow-sky-200/40 ring-1 ring-sky-300/40 scale-[1.01]"
                                    : hasDecided
                                      ? "border-slate-100 bg-slate-50/50 opacity-35 saturate-50"
                                      : "border-slate-200/60 bg-white hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/30 hover:scale-[1.005]"
                                }`}
                              >
                                {/* Selection ribbon */}
                                {isSelected && (
                                  <div className="absolute -top-px -right-px">
                                    <div className="w-16 h-16 overflow-hidden">
                                      <div className="absolute top-3 -right-5 w-20 text-center transform rotate-45 bg-linear-to-r from-sky-500 to-blue-500 text-white text-[10px] font-bold py-0.5 shadow-sm">
                                        VOTED
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Candidate photo + name */}
                                <div className="flex flex-col items-center text-center">
                                  <div className={`relative w-40 h-40 sm:w-52 sm:h-52 rounded-2xl overflow-hidden transition-all duration-500 ${
                                    isSelected
                                      ? "ring-4 ring-sky-300/50 shadow-lg shadow-sky-200/40"
                                      : "ring-2 ring-slate-200/60 group-hover:ring-sky-200"
                                  }`}>
                                    {candidate.photo_url ? (
                                      <img
                                        src={candidate.photo_url}
                                        alt={candidate.student.full_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                                        <User className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300" />
                                      </div>
                                    )}
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-linear-to-t from-sky-500/20 to-transparent" />
                                    )}
                                  </div>

                                  <h3 className="mt-4 font-bold text-slate-800 text-sm sm:text-base leading-snug">
                                    {candidate.student.full_name}
                                  </h3>

                                  {candidate.partylist ? (
                                    <span
                                      className="inline-flex items-center mt-2 text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm"
                                      style={{ backgroundColor: candidate.partylist.color || "#64748b" }}
                                    >
                                      {candidate.partylist.name}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200/50">
                                      Independent
                                    </span>
                                  )}
                                </div>

                                {/* Candidate details — always visible */}
                                {(candidate.platform || candidate.vision || candidate.mission) && (
                                  <div className="mt-5 pt-5 border-t border-slate-100/80 space-y-3.5">
                                    {candidate.platform && (
                                      <div className="bg-linear-to-r from-sky-50/80 to-transparent rounded-xl px-4 py-3">
                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-sky-500 mb-1">Platform</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{candidate.platform}</p>
                                      </div>
                                    )}
                                    {candidate.vision && (
                                      <div className="bg-linear-to-r from-violet-50/80 to-transparent rounded-xl px-4 py-3">
                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-500 mb-1">Vision</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{candidate.vision}</p>
                                      </div>
                                    )}
                                    {candidate.mission && (
                                      <div className="bg-linear-to-r from-emerald-50/80 to-transparent rounded-xl px-4 py-3">
                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 mb-1">Mission</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{candidate.mission}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Vote button */}
                                <div className="mt-5 flex justify-center">
                                  <Button
                                    onClick={() => handleVoteSelect(position.id, candidate.id, maxVotes)}
                                    size="sm"
                                    className={`rounded-xl px-8 py-2.5 h-auto text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg ${
                                      isSelected
                                        ? "bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-emerald-200/50 hover:shadow-emerald-300/50"
                                        : "bg-linear-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-sky-200/50 hover:shadow-sky-300/50 hover:scale-105"
                                    }`}
                                  >
                                    {isSelected ? (
                                      <span className="flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        Selected
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-2">
                                        <VoteIcon className="w-4 h-4" />
                                        Vote
                                      </span>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Abstain option */}
                        <div className="mt-6 pt-5 border-t border-slate-100/60 flex justify-center">
                          <button
                            onClick={() => handleAbstain(position.id)}
                            className={`group/abstain flex items-center gap-2.5 px-7 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                              isAbstained
                                ? "bg-linear-to-r from-amber-100 to-orange-100 text-amber-700 border-2 border-amber-300/60 shadow-sm shadow-amber-100/50 hover:shadow-md"
                                : "bg-white text-slate-400 border-2 border-dashed border-slate-200 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/50 hover:shadow-sm"
                            }`}
                          >
                            {isAbstained ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Abstained — Click to change</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 transition-transform group-hover/abstain:rotate-12" />
                                <span>Abstain from this position</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          {/* ---- SUBMIT SECTION ---- */}
          {positions.length > 0 && (
            <div className="mt-12 mb-16">
              {/* Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm p-7 sm:p-9 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm shadow-sky-200/50">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Ballot Summary</h3>
                    <p className="text-xs text-slate-400 font-medium">Review your selections before submitting</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {positions.map((position) => {
                    const votes = selectedVotes[position.id] || [];
                    const voted = votes.length > 0;
                    const posAbstained = abstainedPositions.has(position.id);
                    const selectedNames = votes
                      .map((vid) => position.candidates.find((c) => c.id === vid)?.student.full_name)
                      .filter(Boolean);

                    return (
                      <div
                        key={position.id}
                        className={`rounded-2xl px-5 py-4 text-sm transition-all duration-300 ${
                          voted
                            ? "bg-linear-to-r from-emerald-50 to-green-50/50 border border-emerald-200/60 shadow-sm"
                            : posAbstained
                              ? "bg-linear-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 shadow-sm"
                              : "bg-slate-50/80 border border-slate-200/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className={`font-bold ${
                            voted ? "text-emerald-700" : posAbstained ? "text-amber-700" : "text-slate-400"
                          }`}>
                            {position.name}
                          </p>
                          {(voted || posAbstained) && (
                            <CheckCircle className={`w-4 h-4 ${voted ? "text-emerald-400" : "text-amber-400"}`} />
                          )}
                        </div>
                        <p className={`text-xs mt-1 font-medium ${
                          voted ? "text-emerald-600" : posAbstained ? "text-amber-600" : "text-slate-300"
                        }`}>
                          {voted
                            ? selectedNames.join(", ")
                            : posAbstained
                              ? "Abstained"
                              : "No selection yet"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="lg"
                  className="h-16 px-14 rounded-2xl bg-linear-to-r from-sky-500 via-blue-500 to-sky-500 hover:from-sky-600 hover:via-blue-600 hover:to-sky-600 text-white font-bold text-lg shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] bg-size-[200%_100%] hover:bg-right"
                >
                  {submitting ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting your votes...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <VoteIcon className="w-5 h-5" />
                      Submit My Votes
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </span>
                  )}
                </Button>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  Your vote is confidential and cannot be changed after submission.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
    </>
  );
}
