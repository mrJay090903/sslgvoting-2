"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { Users, ArrowLeft } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Verify student exists and is active
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", studentId)
        .eq("is_active", true)
        .single();

      if (studentError || !student) {
        setError("Invalid Student ID or account is not active");
        setLoading(false);
        return;
      }

      // Check if there's an open election
      const { data: elections, error: electionError } = await supabase
        .from("elections")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1);

      if (electionError || !elections || elections.length === 0) {
        setError("No active election at the moment");
        setLoading(false);
        return;
      }

      const activeElection = elections[0];

      // Check if student has already voted
      const { data: votingSession } = await supabase
        .from("voting_sessions")
        .select("*")
        .eq("election_id", activeElection.id)
        .eq("student_id", student.id)
        .eq("has_voted", true)
        .single();

      if (votingSession) {
        setError("You have already voted in this election");
        setLoading(false);
        return;
      }

      // Create voting session via API (uses service role)
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          electionId: activeElection.id,
        }),
      });

      const sessionResult = await sessionResponse.json();

      console.log('Session creation response:', { 
        status: sessionResponse.ok, 
        hasToken: !!sessionResult.sessionToken 
      });

      if (!sessionResponse.ok || !sessionResult.success || !sessionResult.sessionToken) {
        console.error('Session creation failed:', sessionResult);
        setError(sessionResult.error || 'Failed to create voting session. Please try again.');
        setLoading(false);
        return;
      }

      // Store student info in session storage
      sessionStorage.setItem("student_id", student.id);
      sessionStorage.setItem("student_name", `${student.first_name} ${student.last_name}`);
      sessionStorage.setItem("student_grade", student.grade_level.toString());
      sessionStorage.setItem("election_id", activeElection.id);
      sessionStorage.setItem("session_token", sessionResult.sessionToken);

      console.log('Login successful, session token stored');

      // Redirect to voting page
      router.push(`/vote/${activeElection.id}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md space-y-4">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-900 hover:text-sky-400">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="bg-white border-slate-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-slate-100 text-sky-400">
                <Users className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-2xl text-slate-900">Student Login</CardTitle>
            <CardDescription className="text-slate-600">
              Enter your Student ID to cast your vote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  placeholder="e.g., 2024-001"
                  required
                  disabled={loading}
                  className="text-center font-mono text-lg"
                />
                <p className="text-xs text-slate-600 text-center">
                  No password required
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
                disabled={loading}
              >
                {loading ? "Verifying..." : "Proceed to Vote"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-slate-600">
            <p className="w-full">
              Admin or Teacher?{" "}
              <Link href="/auth/login" className="text-sky-400 font-medium hover:underline hover:text-sky-500">
                Login here
              </Link>
            </p>
            <div className="w-full p-3 bg-sky-50 rounded-md text-xs">
              <p className="font-medium text-slate-900">Important:</p>
              <p className="text-slate-700">You can only vote once per election</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
