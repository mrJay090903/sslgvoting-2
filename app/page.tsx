"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Users, 
  Vote, 
  CheckCircle2, 
  Lock, 
  BarChart3, 
  Zap,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";
import { SplitText } from "@/components/react-bits/SplitText";
import { BlurFade } from "@/components/react-bits/BlurFade";
import { GradientText } from "@/components/react-bits/GradientText";
import { RotatingText } from "@/components/react-bits/RotatingText";
import { Particles } from "@/components/react-bits/Particles";
import { ShinyButton } from "@/components/react-bits/ShinyButton";
import { Magnetic } from "@/components/react-bits/Magnetic";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Student login state
  const [studentId, setStudentId] = useState("");
  
  // Admin login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/students/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // Store secure session data
      sessionStorage.setItem("student_id", data.student.id);
      sessionStorage.setItem("student_name", data.student["Full Name"]);
      sessionStorage.setItem("election_id", data.election.id);
      sessionStorage.setItem("session_token", data.sessionToken);

      router.push(`/vote/${data.election.id}`);
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, role")
        .eq("username", username)
        .eq("role", "admin")
        .single();

      if (userError || !userData) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      if (signInError) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b border-sky-100 bg-white/80 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Magnetic>
              <div className="flex items-center space-x-2 cursor-pointer">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl"
                >
                  <Vote className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  SSLG Voting
                </span>
              </div>
            </Magnetic>
            <div className="hidden md:flex items-center space-x-6">
              <Magnetic>
                <a href="#features" className="text-slate-600 hover:text-sky-600 transition-colors font-medium">
                  Features
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#login" className="text-slate-600 hover:text-sky-600 transition-colors font-medium">
                  Login
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Integrated Login */}
      <section className="relative overflow-hidden">
        {/* Animated Particles Background */}
        <Particles 
          className="opacity-40"
          quantity={80}
          color="#0ea5e9"
          staticity={30}
          ease={80}
        />
        
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <BlurFade delay={0.1}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-medium cursor-default"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                    Fast & Secure Voting
                  </motion.div>
                </BlurFade>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  <SplitText text="Itaran SSLG Voting System" delay={0.2} />
                  <br />
                  <GradientText 
                    colors={["#0ea5e9", "#3b82f6", "#6366f1", "#0ea5e9"]}
                    animationSpeed={4}
                    className="text-4xl lg:text-5xl font-bold"
                  >
                    <RotatingText 
                      words={[
                        { text: "Your Vote" },
                        { text: "Your Choice" },
                        { text: "Your Future" },
                      ]}
                      interval={2500}
                    />
                  </GradientText>
                </h1>
                
                <BlurFade delay={0.4}>
                  <p className="text-lg text-slate-600 max-w-lg">
                    Empowering student democracy with a secure, transparent, and easy-to-use voting system for SSLG elections.
                  </p>
                </BlurFade>
              </div>

              {/* Quick Stats */}
              <BlurFade delay={0.5}>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "100%", label: "Secure" },
                    { value: "Real-time", label: "Results" },
                    { value: "Easy", label: "To Use" },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="text-center p-4 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-sky-100 cursor-default"
                    >
                      <div className="text-2xl font-bold text-sky-600">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </BlurFade>
            </div>

            {/* Right Content - Login Card */}
            <BlurFade delay={0.3} className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <motion.div
                id="login"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/90 backdrop-blur-lg shadow-2xl shadow-sky-500/10 border-0 overflow-hidden">
                  <CardHeader className="text-center pb-2 pt-6">
                    <CardTitle className="text-2xl text-slate-800">Welcome</CardTitle>
                    <CardDescription className="text-slate-500">
                      Sign in to access the voting system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
                      <TabsTrigger 
                        value="student" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Student
                      </TabsTrigger>
                      <TabsTrigger 
                        value="admin"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Admin
                      </TabsTrigger>
                    </TabsList>

                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <TabsContent value="student" className="mt-0">
                      <form onSubmit={handleStudentLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="studentId" className="text-slate-700">Student ID</Label>
                          <Input
                            id="studentId"
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                            placeholder="Enter your Student ID"
                            required
                            disabled={loading}
                            className="h-12 text-center font-mono text-lg border-slate-200 focus:border-sky-500 focus:ring-sky-500"
                          />
                          <p className="text-xs text-slate-500 text-center">
                            No password needed - just your Student ID
                          </p>
                        </div>

                        <ShinyButton 
                          type="submit" 
                          className="w-full h-12 font-semibold" 
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Verifying...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              Cast Your Vote
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </ShinyButton>
                      </form>
                    </TabsContent>

                    <TabsContent value="admin" className="mt-0">
                      <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-slate-700">Username</Label>
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                            disabled={loading}
                            className="h-12 border-slate-200 focus:border-sky-500 focus:ring-sky-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-slate-700">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter password"
                              required
                              disabled={loading}
                              className="h-12 pr-12 border-slate-200 focus:border-sky-500 focus:ring-sky-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <ShinyButton 
                          type="submit" 
                          className="w-full h-12 font-semibold" 
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Signing in...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              Sign In
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </ShinyButton>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </BlurFade>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                <SplitText text="Why Choose SSLG Voting?" delay={0.1} />
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Our system is designed with security, simplicity, and transparency in mind.
              </p>
            </div>
          </BlurFade>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Secure & Private",
                description: "Your vote is encrypted and anonymous. Only verified students can vote, and each student can only vote once.",
                gradient: "from-sky-50 to-blue-50",
                iconGradient: "from-sky-500 to-blue-600",
                shadow: "sky"
              },
              {
                icon: BarChart3,
                title: "Real-time Results",
                description: "Watch election results update live. Administrators can monitor voting progress in real-time.",
                gradient: "from-emerald-50 to-teal-50",
                iconGradient: "from-emerald-500 to-teal-600",
                shadow: "emerald"
              },
              {
                icon: CheckCircle2,
                title: "Easy to Use",
                description: "Simple interface that works on any device. Students only need their ID to vote - no complicated signup.",
                gradient: "from-violet-50 to-purple-50",
                iconGradient: "from-violet-500 to-purple-600",
                shadow: "violet"
              }
            ].map((feature, index) => (
              <BlurFade key={feature.title} delay={0.2 + index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className={`bg-gradient-to-br ${feature.gradient} border-0 shadow-lg shadow-${feature.shadow}-500/5 hover:shadow-xl hover:shadow-${feature.shadow}-500/10 transition-all duration-300 h-full`}>
                    <CardHeader>
                      <motion.div 
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`w-14 h-14 bg-gradient-to-br ${feature.iconGradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-${feature.shadow}-500/30`}
                      >
                        <feature.icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <CardTitle className="text-slate-800">{feature.title}</CardTitle>
                      <CardDescription className="text-slate-600">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                <SplitText text="How It Works" delay={0.1} />
              </h2>
              <p className="text-slate-600">
                Voting is quick and easy - just 3 simple steps
              </p>
            </div>
          </BlurFade>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Enter Your ID", description: "Enter your Student ID in the login form above. No password required." },
              { step: "2", title: "Choose Candidates", description: "Review the candidates and select your preferred choice for each position." },
              { step: "3", title: "Submit Vote", description: "Review and confirm your selections. Your vote is recorded securely." },
            ].map((item, index) => (
              <BlurFade key={item.step} delay={0.2 + index * 0.15}>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sky-500/30"
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </motion.div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </motion.div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-slate-900 text-white"
      >
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About Section */}
            <div className="lg:col-span-1">
              <Magnetic>
                <div className="flex items-center space-x-2 mb-4">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl"
                  >
                    <Vote className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-xl font-bold">SSLG Voting</span>
                </div>
              </Magnetic>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Empowering student democracy through secure, transparent, and accessible digital voting solutions for Supreme Student Government elections.
              </p>
              <div className="flex space-x-3">
                {[
                  { icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z", name: "Twitter" },
                  { icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z", name: "GitHub" },
                ].map((social) => (
                  <Magnetic key={social.name}>
                    <motion.a
                      href="#"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="w-10 h-10 bg-slate-800 hover:bg-sky-600 rounded-lg flex items-center justify-center transition-colors"
                      aria-label={social.name}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d={social.icon} />
                      </svg>
                    </motion.a>
                  </Magnetic>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { label: "Home", href: "#" },
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#" },
                  { label: "Login", href: "#login" },
                ].map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      whileHover={{ x: 5 }}
                      className="text-slate-400 hover:text-sky-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3" />
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policy & Privacy */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Policy & Privacy</h3>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms of Service", href: "/terms-of-service" },
                  { label: "Cookie Policy", href: "/cookie-policy" },
                  { label: "Data Protection", href: "/data-protection" },
                  { label: "Voting Guidelines", href: "/voting-guidelines" },
                ].map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      whileHover={{ x: 5 }}
                      className="text-slate-400 hover:text-sky-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Student Center Building</p>
                    <p className="text-slate-400 text-sm">Campus Main Road</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href="mailto:sslg@school.edu" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                    sslg@school.edu
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <a href="tel:+1234567890" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">
                    (123) 456-7890
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-sm">
                © {new Date().getFullYear()} SSLG Voting System. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <motion.a
                  href="#"
                  whileHover={{ color: "#0ea5e9" }}
                  className="text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  Privacy
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ color: "#0ea5e9" }}
                  className="text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  Terms
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ color: "#0ea5e9" }}
                  className="text-slate-500 hover:text-sky-400 text-sm transition-colors"
                >
                  Sitemap
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
