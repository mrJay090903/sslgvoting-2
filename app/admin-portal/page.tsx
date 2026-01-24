import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck, Users, UserCircle, Flag, Vote, Settings, BarChart3, Lock } from "lucide-react";

export default function AdminPortalPage() {
  const features = [
    {
      title: "Student Management",
      description: "Add, edit, and manage student records with comprehensive grade level and section organization.",
      icon: Users,
    },
    {
      title: "Election Control",
      description: "Create elections, manage candidates, and control voting periods with real-time status updates.",
      icon: Vote,
    },
    {
      title: "Live Analytics",
      description: "Monitor voting progress, track turnout rates, and access instant election results and statistics.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-8 h-8 text-sky-400" />
              <span className="text-xl font-bold text-white">SSLG Admin Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-slate-300 hover:text-sky-400">
                  Main Site
                </Button>
              </Link>
              <Link href="/auth/login?role=admin">
                <Button className="bg-sky-400 hover:bg-sky-500 text-slate-900 font-semibold">
                  Sign In
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
              <Lock className="w-4 h-4 text-sky-400" />
              <span className="text-sm text-sky-400">Administrator Access</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Complete Election
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                Management System
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Full administrative control over student elections. Manage students, candidates, partylists, and monitor real-time voting progress with comprehensive analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login?role=admin">
                <Button size="lg" className="bg-sky-400 hover:bg-sky-500 text-slate-900 font-semibold text-lg px-8">
                  Access Dashboard
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8">
                  View Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Admin Features</h2>
            <p className="text-slate-400 text-lg">Powerful tools for election management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-sky-400/50 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 bg-sky-400/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-sky-400" />
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Additional Admin Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all">
              <CardHeader>
                <Users className="w-8 h-8 text-sky-400 mb-3" />
                <CardTitle className="text-white text-lg">Students</CardTitle>
                <CardDescription className="text-slate-400">Manage student database</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all">
              <CardHeader>
                <UserCircle className="w-8 h-8 text-sky-400 mb-3" />
                <CardTitle className="text-white text-lg">Candidates</CardTitle>
                <CardDescription className="text-slate-400">Add and edit candidates</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all">
              <CardHeader>
                <Flag className="w-8 h-8 text-sky-400 mb-3" />
                <CardTitle className="text-white text-lg">Partylists</CardTitle>
                <CardDescription className="text-slate-400">Organize political parties</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all">
              <CardHeader>
                <Settings className="w-8 h-8 text-sky-400 mb-3" />
                <CardTitle className="text-white text-lg">Elections</CardTitle>
                <CardDescription className="text-slate-400">Create and control elections</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-sky-500/10 to-blue-600/10 border border-sky-400/20 rounded-2xl p-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Manage Elections?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Sign in to access the full administrative dashboard
            </p>
            <Link href="/auth/login?role=admin">
              <Button size="lg" className="bg-sky-400 hover:bg-sky-500 text-slate-900 font-semibold text-lg px-12">
                Administrator Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">© Copyright SSLG Voting System - Administrator Portal</p>
        </div>
      </footer>
    </div>
  );
}
