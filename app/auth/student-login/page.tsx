"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, ArrowLeft } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the verify API — it handles student lookup + session creation in one call
      const response = await fetch("/api/students/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Invalid Student ID. Please try again.");
        setLoading(false);
        return;
      }

      // Store verified session data
      sessionStorage.setItem("student_id", result.student.id);
      sessionStorage.setItem("student_name", result.student["Full Name"] || "");
      sessionStorage.setItem("election_id", result.election.id);
      sessionStorage.setItem("session_token", result.sessionToken);

      // Use replace for faster navigation (no back button push)
      startTransition(() => {
        router.replace(`/vote/${result.election.id}`);
      });
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
                disabled={loading || isPending}
              >
                {loading || isPending ? "Verifying..." : "Proceed to Vote"}
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
