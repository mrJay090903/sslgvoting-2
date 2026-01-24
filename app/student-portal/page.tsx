import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Vote, Shield, CheckCircle, ArrowRight } from "lucide-react";

export default function StudentPortalPage() {
  const steps = [
    {
      number: "1",
      title: "Verify Identity",
      description: "Enter your Student ID to verify your eligibility",
    },
    {
      number: "2",
      title: "View Candidates",
      description: "Review all candidates and their platforms",
    },
    {
      number: "3",
      title: "Cast Your Vote",
      description: "Select your preferred candidates for each position",
    },
    {
      number: "4",
      title: "Confirm",
      description: "Submit your ballot securely - you can only vote once",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-sky-400" />
              <span className="text-xl font-bold text-white">SSLG Student Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-slate-300 hover:text-sky-400">
                  Main Site
                </Button>
              </Link>
              <Link href="/auth/student-login">
                <Button className="bg-sky-400 hover:bg-sky-500 text-slate-900 font-semibold">
                  Vote Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-400/10 border border-sky-400/20 rounded-full">
              <Vote className="w-4 h-4 text-sky-400" />
              <span className="text-sm text-sky-400">Student Voting Portal</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Your Voice,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                Your Vote Matters
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Participate in the democratic process. Cast your vote securely for the Supreme Student Government. Simple, fast, and your vote remains confidential.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/student-login">
                <Button size="lg" className="bg-sky-400 hover:bg-sky-500 text-slate-900 font-semibold text-lg px-8">
                  <Vote className="w-5 h-5 mr-2" />
                  Cast Your Vote
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How to Vote</h2>
            <p className="text-slate-400 text-lg">Four simple steps to make your voice heard</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-sky-400/50 transition-all h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-sky-400/10 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-sky-400">{step.number}</span>
                    </div>
                    <CardTitle className="text-white text-xl mb-2">{step.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/30 border-slate-700 text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                <CardTitle className="text-white text-xl mb-2">Secure & Private</CardTitle>
                <CardDescription className="text-slate-400">
                  Your vote is anonymous and encrypted. No one can see who you voted for.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-slate-800/30 border-slate-700 text-center">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                <CardTitle className="text-white text-xl mb-2">One Student, One Vote</CardTitle>
                <CardDescription className="text-slate-400">
                  Each student can vote only once to ensure fair and democratic elections.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-slate-800/30 border-slate-700 text-center">
              <CardHeader>
                <Vote className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                <CardTitle className="text-white text-xl mb-2">Easy & Fast</CardTitle>
                <CardDescription className="text-slate-400">
                  No complicated process. Just your Student ID and a few clicks to vote.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-sky-500/10 to-blue-600/10 border border-sky-400/20 rounded-2xl p-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Vote?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              All you need is your Student ID to get started
            </p>
            <Link href="/auth/student-login">
              <Button size="lg" className="bg-sky-400 hover:bg-sky-500 text-slate-900 font-semibold text-lg px-12">
                <Vote className="w-5 h-5 mr-2" />
                Start Voting Now
              </Button>
            </Link>
            <p className="text-slate-500 text-sm mt-6">
              No password required • Voting only during active elections
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">© Copyright SSLG Voting System - Student Portal</p>
        </div>
      </footer>
    </div>
  );
}
