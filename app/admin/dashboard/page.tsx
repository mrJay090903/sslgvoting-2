"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCircle, Vote, CheckCircle, TrendingUp, TrendingDown, Award, Clock, Calendar, Flag, BarChart3, Activity, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCandidates: number;
  totalVotes: number;
  activeElection: any | null;
  votingPercentage: number;
  totalPartylists: number;
  totalPositions: number;
  gradeDistribution: any[];
  topCandidates: any[];
  recentVotes: number;
  votingTrend: any[];
  partylistVotes: any[];
  candidateVotesByPosition: any[];
  positionParticipation: any[];
  gradeParticipation: any[];
  mostCompetitivePositions: any[];
}

const CHART_COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

const POSITION_COLORS: { [key: string]: string } = {
  'President': '#ef4444',
  'Vice President': '#f59e0b',
  'Secretary': '#10b981',
  'Treasurer': '#0ea5e9',
  'Auditor': '#8b5cf6',
  'Business Manager': '#ec4899',
  'PIO': '#6366f1',
  'Sergeant at Arms': '#14b8a6',
};

// Custom bar shape to color bars by position
const CustomBarShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const positionName = payload?.name;
  const color = POSITION_COLORS[positionName] || '#0ea5e9';

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      rx={8}
      ry={8}
    />
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalCandidates: 0,
    totalVotes: 0,
    activeElection: null,
    votingPercentage: 0,
    totalPartylists: 0,
    totalPositions: 0,
    gradeDistribution: [],
    topCandidates: [],
    recentVotes: 0,
    votingTrend: [],
    partylistVotes: [],
    candidateVotesByPosition: [],
    positionParticipation: [],
    gradeParticipation: [],
    mostCompetitivePositions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      // Get total students
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      // Get active students (use totalStudents as fallback if activeStudents is 0)
      const { count: countActiveStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Use activeStudents for calculations, but if it's 0, check if we should use totalStudents
      const activeStudents = countActiveStudents && countActiveStudents > 0 ? countActiveStudents : totalStudents;

      // Get total candidates
      const { count: totalCandidates } = await supabase
        .from("candidates")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get total partylists
      const { count: totalPartylists } = await supabase
        .from("partylists")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get total positions
      const { count: totalPositions } = await supabase
        .from("positions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get grade distribution - fetch all students in batches (no 1000 limit)
      let allStudents: any[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data } = await supabase
          .from("students")
          .select("id, \"Grade\"")
          .order("id")
          .range(from, from + batchSize - 1);

        if (data && data.length > 0) {
          allStudents = allStudents.concat(data);
          from += batchSize;
          
          // If we got less than batchSize, we've reached the end
          if (data.length < batchSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      const gradeData = allStudents;

      const gradeDistribution = [7, 8, 9, 10, 11, 12].map(grade => ({
        grade,
        count: gradeData?.filter(s => {
          const studentGrade = (s as any)["Grade"];
          // Handle both number and string comparison
          return Number(studentGrade) === grade || studentGrade === grade;
        }).length || 0
      }));

      // Get active election
      const { data: elections } = await supabase
        .from("elections")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1);

      const activeElection = elections && elections.length > 0 ? elections[0] : null;

      // Get total votes for active election
      let totalVotes = 0;
      let votingPercentage = 0;
      let topCandidates: any[] = [];
      let recentVotes = 0;

      if (activeElection) {
        const { count } = await supabase
          .from("voting_sessions")
          .select("*", { count: "exact", head: true })
          .eq("election_id", activeElection.id)
          .eq("has_voted", true);

        totalVotes = count || 0;
        votingPercentage = activeStudents ? (totalVotes / activeStudents) * 100 : 0;

        // Get top candidates by vote count using service role to avoid RLS issues
        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("candidate_id, election_id")
          .eq("election_id", activeElection.id);

        console.log('Votes data fetch:', { count: votesData?.length, error: votesError });

        if (votesData && votesData.length > 0) {
          // Count votes per candidate
          const voteCount: { [key: string]: number } = {};
          votesData.forEach(vote => {
            const candidateId = vote.candidate_id;
            voteCount[candidateId] = (voteCount[candidateId] || 0) + 1;
          });

          // Get candidate details
          const candidateIds = Object.keys(voteCount);
          const { data: candidatesData } = await supabase
            .from("candidates")
            .select(`
              id,
              student_id,
              position_id,
              partylist_id
            `)
            .in("id", candidateIds);

          // Get student details
          const studentIds = candidatesData?.map(c => c.student_id) || [];
          const { data: studentsData } = await supabase
            .from("students")
            .select("id, \"Full Name\"")
            .in("id", studentIds);

          // Get position details
          const positionIds = candidatesData?.map(c => c.position_id) || [];
          const { data: positionsData } = await supabase
            .from("positions")
            .select("id, name")
            .in("id", positionIds);

          // Get partylist details
          const partylistIds = candidatesData?.filter(c => c.partylist_id).map(c => c.partylist_id) || [];
          const { data: partylistsData } = await supabase
            .from("partylists")
            .select("id, name, color")
            .in("id", partylistIds);

          // Build top candidates array
          topCandidates = candidatesData?.map(candidate => {
            const student = studentsData?.find(s => s.id === candidate.student_id);
            const position = positionsData?.find(p => p.id === candidate.position_id);
            const partylist = partylistsData?.find(p => p.id === candidate.partylist_id);

            return {
              candidate: {
                id: candidate.id,
                students: student || { "Full Name": 'Unknown' },
                positions: position || { name: 'Unknown Position' },
                partylists: partylist || null
              },
              votes: voteCount[candidate.id] || 0
            };
          })
          .sort((a: any, b: any) => b.votes - a.votes)
          .slice(0, 5) || [];
        }

        // Get recent votes (in votes table - no timestamp column, so count all)
        recentVotes = votesData?.length || 0;
      }

      // Get partylist vote distribution
      let partylistVotes: any[] = [];
      const { data: partylists } = await supabase
        .from("partylists")
        .select("id, name, color")
        .eq("is_active", true);

      if (partylists && activeElection) {
        // Get all votes for this election
        const { data: allVotesData } = await supabase
          .from("votes")
          .select("candidate_id")
          .eq("election_id", activeElection.id);

        if (allVotesData && allVotesData.length > 0) {
          // Get candidate partylist info
          const candidateIds = [...new Set(allVotesData.map(v => v.candidate_id))];
          const { data: candidatesWithPartylist } = await supabase
            .from("candidates")
            .select("id, partylist_id")
            .in("id", candidateIds);

          // Count votes per partylist
          const partyVoteCount: { [key: string]: number } = {};
          allVotesData.forEach((vote: any) => {
            const candidate = candidatesWithPartylist?.find(c => c.id === vote.candidate_id);
            const partylistId = candidate?.partylist_id;
            if (partylistId) {
              partyVoteCount[partylistId] = (partyVoteCount[partylistId] || 0) + 1;
            }
          });

          partylistVotes = partylists.map((party, index) => ({
            name: party.name,
            value: partyVoteCount[party.id] || 0,
            color: party.color || CHART_COLORS[index % CHART_COLORS.length],
          }));
        } else {
          // No votes yet, show zero for all
          partylistVotes = partylists.map((party, index) => ({
            name: party.name,
            value: 0,
            color: party.color || CHART_COLORS[index % CHART_COLORS.length],
          }));
        }
      }

      // Fetch candidate votes grouped by position
      let candidateVotesByPosition: any[] = [];
      let positionParticipation: any[] = [];
      let mostCompetitivePositions: any[] = [];

      if (activeElection) {
        try {
          const response = await fetch(
            `/api/candidate-votes?electionId=${activeElection.id}`
          );
          const data = await response.json();
          candidateVotesByPosition = data.positionVotes || [];

          // Calculate position participation rates
          if (candidateVotesByPosition && candidateVotesByPosition.length > 0) {
            positionParticipation = candidateVotesByPosition.map((pos: any) => {
              const votesForPosition = pos.candidates?.reduce((sum: number, c: any) => sum + c.votes, 0) || 0;
              return {
                name: pos.positionName,
                votes: votesForPosition,
                candidates: pos.candidates?.length || 0,
                percentage: totalVotes > 0 ? ((votesForPosition / totalVotes) * 100) : 0
              };
            }).sort((a: any, b: any) => b.votes - a.votes);

            // Get most competitive positions (closest races between top candidates)
            mostCompetitivePositions = candidateVotesByPosition
              .map((pos: any) => {
                // Only count candidates who actually received votes
                const candidatesWithVotes = (pos.candidates || []).filter((c: any) => c.votes > 0);
                const votesForPosition = candidatesWithVotes.reduce((sum: number, c: any) => sum + c.votes, 0);
                
                // Sort candidates by votes descending
                const sortedCandidates = [...candidatesWithVotes].sort((a: any, b: any) => b.votes - a.votes);
                const firstPlace = sortedCandidates[0]?.votes || 0;
                const secondPlace = sortedCandidates[1]?.votes || 0;
                
                // Competition index: how close is 2nd place to 1st place
                // 100% means tied, 0% means 2nd place has no votes
                const competition = firstPlace > 0 
                  ? Math.round((secondPlace / firstPlace) * 100) 
                  : 0;
                
                return {
                  name: pos.positionName,
                  competition,
                  totalVotes: votesForPosition,
                  candidates: pos.candidates?.length || 0,
                  candidatesWithVotes: candidatesWithVotes.length,
                  leader: sortedCandidates[0]?.name || 'N/A',
                  margin: firstPlace - secondPlace
                };
              })
              .filter((pos: any) => 
                pos.candidatesWithVotes >= 2 && // At least 2 candidates have votes
                pos.totalVotes >= 2 // At least 2 votes cast in this position
              )
              .sort((a: any, b: any) => {
                // Sort by competition index (higher = closer race)
                // If tied, sort by total votes (more votes = more significant)
                if (b.competition === a.competition) {
                  return b.totalVotes - a.totalVotes;
                }
                return b.competition - a.competition;
              })
              .slice(0, 5);
          }
        } catch (error) {
          console.error('Error fetching candidate votes:', error);
        }
      }

      // Calculate grade participation - Get data directly from voting_sessions
      let gradeParticipation: any[] = [];
      if (activeElection) {
        // Fetch all voting sessions for this election in batches
        let allVotingSessions: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: sessionsBatch } = await supabase
            .from("voting_sessions")
            .select("student_id, has_voted")
            .eq("election_id", activeElection.id)
            .eq("has_voted", true)
            .range(from, from + batchSize - 1);

          if (sessionsBatch && sessionsBatch.length > 0) {
            allVotingSessions = allVotingSessions.concat(sessionsBatch);
            from += batchSize;
            hasMore = sessionsBatch.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        if (allVotingSessions.length > 0) {
          // Get student IDs that voted
          const votingStudentIds = new Set(allVotingSessions.map(v => v.student_id));

          // Count participation by grade
          const gradeMap: { [key: number]: { participated: number; total: number } } = {
            7: { participated: 0, total: 0 },
            8: { participated: 0, total: 0 },
            9: { participated: 0, total: 0 },
            10: { participated: 0, total: 0 },
            11: { participated: 0, total: 0 },
            12: { participated: 0, total: 0 }
          };

          // Count total students per grade and participated count
          if (gradeData && gradeData.length > 0) {
            gradeData.forEach(s => {
              const gradeNum = Number((s as any)["Grade"]);
              if (gradeMap[gradeNum]) {
                gradeMap[gradeNum].total++;
                // Check if this student voted
                if (votingStudentIds.has(s.id)) {
                  gradeMap[gradeNum].participated++;
                }
              }
            });
          }

          // Build the final grade participation array
          gradeParticipation = [7, 8, 9, 10, 11, 12].map(grade => ({
            grade,
            totalStudents: gradeMap[grade].total,
            participated: gradeMap[grade].participated,
            percentage: gradeMap[grade].total > 0 
              ? ((gradeMap[grade].participated / gradeMap[grade].total) * 100)
              : 0
          }));
        } else {
          // No votes yet, show 0 participation but get total students per grade
          const gradeMap: { [key: number]: number } = {
            7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
          };

          if (gradeData && gradeData.length > 0) {
            gradeData.forEach(s => {
              const gradeNum = Number((s as any)["Grade"]);
              if (gradeMap[gradeNum] !== undefined) {
                gradeMap[gradeNum]++;
              }
            });
          }

          gradeParticipation = [7, 8, 9, 10, 11, 12].map(grade => ({
            grade,
            totalStudents: gradeMap[grade],
            participated: 0,
            percentage: 0
          }));
        }
      }

      setStats({
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalCandidates: totalCandidates || 0,
        totalVotes,
        activeElection,
        votingPercentage,
        totalPartylists: totalPartylists || 0,
        totalPositions: totalPositions || 0,
        gradeDistribution,
        topCandidates,
        recentVotes,
        votingTrend: [],
        partylistVotes,
        candidateVotesByPosition,
        positionParticipation,
        gradeParticipation,
        mostCompetitivePositions,
      });

      setLoading(false);
    };

    fetchStats();
    
    // Refresh every 30 seconds if election is active
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-sky-600 font-medium">Welcome back</p>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white/80 backdrop-blur border-0 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      subtitle: "Registered students",
      icon: Users,
      color: "from-sky-500 to-blue-600",
      bgColor: "bg-sky-50",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
      trend: stats.activeStudents > 0 ? `${stats.activeStudents} active` : "No active students",
      trendUp: true,
      trendValue: "+12%"
    },
    {
      title: "Active Candidates",
      value: stats.totalCandidates,
      subtitle: "Running for positions",
      icon: UserCircle,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      trend: `${stats.totalPositions} positions`,
      trendUp: true,
      trendValue: `${stats.totalPartylists} partylists`
    },
    {
      title: "Total Votes Cast",
      value: stats.totalVotes,
      subtitle: `${stats.votingPercentage.toFixed(1)}% turnout`,
      icon: Vote,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      trend: stats.activeElection ? `${stats.recentVotes} this hour` : "No active election",
      trendUp: stats.recentVotes > 0,
      trendValue: stats.activeElection ? "+Active" : "Closed"
    },
    {
      title: "Election Status",
      value: stats.activeElection ? "OPEN" : "CLOSED",
      subtitle: stats.activeElection?.title || "No active election",
      icon: CheckCircle,
      color: stats.activeElection ? "from-amber-500 to-orange-600" : "from-slate-400 to-slate-500",
      bgColor: stats.activeElection ? "bg-amber-50" : "bg-slate-50",
      iconBg: stats.activeElection ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-slate-400 to-slate-500",
      trend: stats.activeElection ? "Live voting" : "Create new election",
      trendUp: !!stats.activeElection,
      trendValue: stats.activeElection ? "Live" : "—"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-sky-600 font-medium">Welcome back</p>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          {stats.activeElection && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="text-sm font-medium text-sky-700">Election Active</span>
            </div>
          )}

        </div>
      </div>

      {/* Quick Actions - Small and Compact */}
      <div className="flex flex-wrap gap-3 justify-start">
        <Link
          href="/admin/students"
          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-100 hover:shadow-md hover:border-sky-300 transition-all duration-200"
        >
          <div className="p-1.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800">Manage Students</h4>
            <p className="text-xs text-slate-500">Add or edit</p>
          </div>
        </Link>
        <Link
          href="/admin/candidates"
          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100 hover:shadow-md hover:border-emerald-300 transition-all duration-200"
        >
          <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:scale-110 transition-transform">
            <UserCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800">Manage Candidates</h4>
            <p className="text-xs text-slate-500">Add or edit</p>
          </div>
        </Link>
        <Link
          href="/admin/elections"
          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100 hover:shadow-md hover:border-violet-300 transition-all duration-200"
        >
          <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
            <Vote className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800">Manage Elections</h4>
            <p className="text-xs text-slate-500">Create/control</p>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
                      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : null}
                        {stat.trendValue}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leading Candidates and Votes per Candidate by Position - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Candidates */}
        {stats.activeElection && stats.topCandidates.length > 0 && (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                  <Award className="w-4 h-4 text-white" />
                </div>
                Leading Candidates
              </CardTitle>
              <CardDescription className="text-slate-500">Top 5 candidates by vote count</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {stats.topCandidates.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-lg font-bold text-xs shadow-lg flex-shrink-0 ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {item.candidate?.students?.["Full Name"]}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                          <span>{item.candidate?.positions?.name}</span>
                          {item.candidate?.partylists && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 truncate">
                                <div 
                                  className="w-2 h-2 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: item.candidate.partylists.color }}
                                />
                                <span className="truncate">{item.candidate.partylists.name}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-slate-800 text-sm">{item.votes}</p>
                      <p className="text-xs text-slate-500">votes</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Votes per Candidate by Position */}
        {stats.activeElection && stats.candidateVotesByPosition.length > 0 && (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                Votes by Position
              </CardTitle>
              <CardDescription className="text-slate-500">Voting results per position</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5 max-h-[500px] overflow-y-auto">
                {stats.candidateVotesByPosition.slice(0, 4).map((position: any) => (
                  <div key={position.positionId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{
                            backgroundColor: POSITION_COLORS[position.positionName] || CHART_COLORS[0]
                          }}
                        />
                        <h3 className="font-semibold text-slate-800 text-sm">{position.positionName}</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{position.candidates?.length || 0} candidates</span>
                    </div>
                    <div className="space-y-1.5">
                      {position.candidates.slice(0, 3).map((candidate: any, index: number) => {
                        const totalVotesForPosition = position.candidates.reduce((sum: number, c: any) => sum + c.votes, 0);
                        const percentage = totalVotesForPosition > 0 ? (candidate.votes / totalVotesForPosition) * 100 : 0;

                        return (
                          <div key={candidate.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-700 truncate">{candidate.name || 'Unknown'}</span>
                              <span className="text-xs font-bold text-slate-800 flex-shrink-0 ml-2">{candidate.votes}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(percentage, 3)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {position.candidates.length > 3 && (
                        <p className="text-xs text-slate-500 italic py-1">+{position.candidates.length - 3} more candidates</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Analytics Section */}
      <div className="space-y-6">
        {/* Position Participation Rate - Compact */}
        {stats.positionParticipation.length > 0 && (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-3 px-6">
              <CardTitle className="text-sm text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                  <BarChart3 className="w-3.5 h-3.5 text-white" />
                </div>
                Position Participation Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.positionParticipation} layout="vertical" margin={{ top: 5, right: 10, left: 120, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={115} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                      }}
                      formatter={(value) => [value, 'Votes']}
                    />
                    <Bar 
                      dataKey="votes" 
                      radius={[0, 6, 6, 0]} 
                      name="Votes"
                      shape={<CustomBarShape />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Color Legend - Compact */}
              <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                {stats.positionParticipation.map((pos: any) => (
                  <div key={pos.name} className="flex items-center gap-1 truncate">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: POSITION_COLORS[pos.name] || CHART_COLORS[0]
                      }}
                    />
                    <span className="text-xs text-slate-600 truncate">{pos.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Grid for Remaining Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Participation */}
          {stats.gradeParticipation.length > 0 && (
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  Voting Participation by Grade
                </CardTitle>
                <CardDescription className="text-slate-500">Grade-wise voting turnout</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {stats.gradeParticipation.map((gradeData: any) => (
                    <div key={gradeData.grade} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Grade {gradeData.grade}</span>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{gradeData.percentage.toFixed(1)}%</span>
                          <p className="text-xs text-slate-500">{gradeData.participated}/{gradeData.totalStudents}</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-rose-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(gradeData.percentage, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Most Competitive Positions */}
          {stats.mostCompetitivePositions.length > 0 && (
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  Most Competitive Positions
                </CardTitle>
                <CardDescription className="text-slate-500">Positions with closest vote margins</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {stats.mostCompetitivePositions.map((position: any, index: number) => (
                    <div key={position.name} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{position.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Competition: <span className="font-bold text-orange-600">{position.competition}%</span>
                            <span className="mx-1.5">•</span>
                            Margin: <span className="font-bold">{position.margin} vote{position.margin !== 1 ? 's' : ''}</span>
                          </p>
                        </div>
                        <Badge 
                          className={`${
                            index === 0 ? 'bg-red-100 text-red-700' :
                            index === 1 ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{position.totalVotes} votes • {position.candidatesWithVotes} active candidates</span>
                        <span className="font-medium">Leading: {position.leader}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* All Candidates Vote Count - Full Width */}
      {stats.activeElection && stats.candidateVotesByPosition.length > 0 && (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  All Candidates Vote Count
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">Complete voting results for all positions and candidates</CardDescription>
              </div>
              <Badge className="bg-slate-100 text-slate-700 text-sm px-3 py-1">
                {stats.candidateVotesByPosition.reduce((total: number, pos: any) => total + (pos.candidates?.length || 0), 0)} Total Candidates
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {stats.candidateVotesByPosition.map((position: any, posIndex: number) => {
                const totalVotesForPosition = position.candidates?.reduce((sum: number, c: any) => sum + c.votes, 0) || 0;
                const positionColor = POSITION_COLORS[position.positionName] || CHART_COLORS[posIndex % CHART_COLORS.length];

                return (
                  <div key={position.positionId} className="space-y-3">
                    {/* Position Header */}
                    <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: positionColor }}
                        />
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{position.positionName}</h3>
                          <p className="text-xs text-slate-500">
                            {position.candidates?.length || 0} candidates • {totalVotesForPosition} total votes
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className="text-xs px-2 py-1"
                        style={{ backgroundColor: `${positionColor}15`, color: positionColor }}
                      >
                        Position #{posIndex + 1}
                      </Badge>
                    </div>

                    {/* Candidates List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {position.candidates.map((candidate: any, candIndex: number) => {
                        const percentage = totalVotesForPosition > 0 ? (candidate.votes / totalVotesForPosition) * 100 : 0;
                        const isLeader = candIndex === 0 && candidate.votes > 0;

                        return (
                          <div 
                            key={candidate.id} 
                            className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                              isLeader 
                                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-md' 
                                : candidate.votes > 0
                                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                  : 'bg-white border-slate-100 opacity-60'
                            }`}
                          >
                            {/* Leader Badge */}
                            {isLeader && (
                              <div className="absolute -top-2 -right-2">
                                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  LEADING
                                </div>
                              </div>
                            )}

                            {/* Candidate Info */}
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-slate-800 text-sm leading-tight flex-1">
                                  {candidate.name || 'Unknown'}
                                </h4>
                                <span className="text-lg font-bold text-slate-800 shrink-0">
                                  {candidate.votes}
                                </span>
                              </div>

                              {/* Partylist */}
                              {candidate.partylist && (
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: candidate.partylist.color }}
                                  />
                                  <span className="text-xs text-slate-600 font-medium">
                                    {candidate.partylist.name}
                                  </span>
                                </div>
                              )}

                              {/* Vote Bar */}
                              <div className="space-y-1">
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${Math.max(percentage, candidate.votes > 0 ? 5 : 0)}%`,
                                      backgroundColor: isLeader ? '#f59e0b' : positionColor
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500">
                                    {percentage.toFixed(1)}% of position
                                  </span>
                                  <span className={`font-semibold ${candidate.votes > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                                    Rank #{candIndex + 1}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
