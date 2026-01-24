"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Users, Vote, CheckCircle2, Clock, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  totalStudents: number;
  votedStudents: number;
  pendingStudents: number;
  activeElections: number;
  gradeLevel: number;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();
      
      // Get current user's assigned grade
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("assigned_grade")
        .eq("id", user.id)
        .single();

      if (!userData) return;

      const gradeLevel = userData.assigned_grade;

      // Get total students for this grade
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("grade_level", gradeLevel);

      // Get voted students for this grade (check if votes table exists)
      let votedStudents = 0;
      try {
        const { data: votedData } = await supabase
          .from("votes")
          .select("student_id, students!inner(grade_level)")
          .eq("students.grade_level", gradeLevel);
        
        if (votedData) {
          votedStudents = new Set(votedData.map(v => v.student_id)).size;
        }
      } catch {
        // votes table might not exist yet
        votedStudents = 0;
      }

      // Get active elections
      const { count: activeElections } = await supabase
        .from("elections")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get recent students for this grade
      const { data: recentStudentsData } = await supabase
        .from("students")
        .select("*")
        .eq("grade_level", gradeLevel)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalStudents: totalStudents || 0,
        votedStudents: votedStudents || 0,
        pendingStudents: (totalStudents || 0) - (votedStudents || 0),
        activeElections: activeElections || 0,
        gradeLevel,
      });

      setRecentStudents(recentStudentsData || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast.error("Failed to load dashboard data");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-emerald-600 font-medium">Overview</p>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white/80 backdrop-blur border-0 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Grade Level",
      value: `Grade ${stats?.gradeLevel}`,
      icon: GraduationCap,
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/25",
    },
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/25",
    },
    {
      title: "Voted",
      value: stats?.votedStudents || 0,
      icon: CheckCircle2,
      gradient: "from-sky-500 to-blue-600",
      shadowColor: "shadow-sky-500/25",
    },
    {
      title: "Not Yet Voted",
      value: stats?.pendingStudents || 0,
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/25",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-emerald-600 font-medium">Overview</p>
        <h1 className="text-3xl font-bold text-slate-800">Teacher Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome! You&apos;re managing Grade {stats?.gradeLevel} students.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Voting Progress */}
      {stats && stats.totalStudents > 0 && (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b border-slate-100">
            <CardTitle className="text-slate-800">Voting Progress - Grade {stats.gradeLevel}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium text-slate-800">
                  {Math.round((stats.votedStudents / stats.totalStudents) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.votedStudents / stats.totalStudents) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>{stats.votedStudents} voted</span>
                <span>{stats.pendingStudents} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Students */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b border-slate-100">
          <CardTitle className="text-slate-800">Recent Students - Grade {stats?.gradeLevel}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {recentStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No students found for Grade {stats?.gradeLevel}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg hover:bg-emerald-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-slate-500">LRN: {student.lrn}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">
                    {student.section}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Elections Info */}
      {stats && stats.activeElections > 0 && (
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/25">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Vote className="w-7 h-7" />
              </div>
              <div>
                <p className="text-emerald-100 text-sm">Active Elections</p>
                <p className="text-2xl font-bold">{stats.activeElections} election{stats.activeElections > 1 ? 's' : ''} in progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
