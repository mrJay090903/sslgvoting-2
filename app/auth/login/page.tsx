"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, GraduationCap, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "admin";
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      console.log("Attempting login with:", { username, role });

      // First, try to find the user by username only (to see if they exist at all)
      const { data: allUsers, error: allUsersError } = await supabase
        .from("users")
        .select("email, role, is_active, username")
        .eq("username", username);

      console.log("All users with username:", allUsers, allUsersError);

      // Now get the user by username and role
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, role, is_active")
        .eq("username", username)
        .eq("role", role)
        .single();

      console.log("User lookup result:", { userData, userError });

      if (userError || !userData) {
        console.error("User not found:", userError);
        if (allUsers && allUsers.length > 0) {
          const foundUser = allUsers[0];
          setError(`Account found but role is '${foundUser.role}'. Please login at /auth/login?role=${foundUser.role}`);
        } else {
          setError("Invalid username or password. Make sure you created the account from Admin > Accounts.");
        }
        setLoading(false);
        return;
      }

      // Check if teacher account is active (only if is_active field exists)
      if (role === "teacher" && userData.is_active !== undefined && userData.is_active === false) {
        setError("Your account has been deactivated. Please contact the administrator.");
        setLoading(false);
        return;
      }

      console.log("Found user, attempting sign in with email:", userData.email);

      // Try to sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      console.log("Sign in result:", { data, signInError });

      if (signInError) {
        console.error("Sign in error:", signInError);
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      console.log("Login successful, redirecting...");

      // Redirect based on role
      if (userData.role === "admin") {
        router.push("/admin/dashboard");
      } else if (userData.role === "teacher") {
        router.push("/teacher/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
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
              <div className="p-4 rounded-full bg-sky-50 text-slate-900">
                {role === "admin" ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <GraduationCap className="w-8 h-8" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl text-slate-900">
              {role === "admin" ? "Admin" : "Teacher"} Login
            </CardTitle>
            <CardDescription className="text-slate-600">
              Enter your credentials to access the dashboard
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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-slate-600">
            <p className="w-full">
              Are you a student?{" "}
              <Link href="/auth/student-login" className="text-sky-400 font-medium hover:underline hover:text-sky-500">
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <p className="text-slate-900">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
