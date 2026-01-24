"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Users, 
  Vote, 
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  GraduationCap
} from "lucide-react";

interface TeacherUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  assigned_grade: number;
  is_active: boolean;
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<TeacherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/auth/login?role=teacher");
        return;
      }

      // Check if user is teacher
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .eq("role", "teacher")
        .single();

      if (!userData) {
        router.push("/");
        return;
      }

      // Check if teacher is active
      if (!userData.is_active) {
        await supabase.auth.signOut();
        router.push("/auth/login?role=teacher&error=inactive");
        return;
      }

      setUser(userData);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/teacher/students", icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-emerald-100 via-emerald-50 to-white border-r border-emerald-200/50 pt-5 pb-4 overflow-y-auto shadow-lg">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">SSLG</h1>
                <p className="text-xs text-slate-500 -mt-0.5">Teacher Portal</p>
              </div>
            </div>
          </div>
          
          {/* Grade Badge */}
          <div className="px-6 mt-4 mb-2">
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg px-4 py-2 text-center shadow-lg shadow-violet-500/25">
              <p className="text-xs opacity-80">Assigned Grade</p>
              <p className="text-lg font-bold">Grade {user?.assigned_grade}</p>
            </div>
          </div>
          
          {/* Navigation Section Label */}
          <div className="px-6 mt-6 mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>
          </div>
          
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                        : "text-slate-600 hover:bg-emerald-100/80 hover:text-emerald-700"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110
                        ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600"}
                      `}
                    />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white/80"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="mt-auto px-3 pb-3">
            <div className="bg-white/60 backdrop-blur rounded-xl p-3 border border-emerald-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-emerald-200">
                  <AvatarImage src="" alt={user?.full_name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-medium">
                    {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-3 text-slate-600 hover:text-red-600 hover:bg-red-50 justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">SSLG Teacher</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-emerald-100 shadow-lg">
            <nav className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-4 py-3 text-sm font-medium rounded-lg
                      ${isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        : "text-slate-600 hover:bg-emerald-50"
                      }
                    `}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  className="w-full text-red-600 hover:bg-red-50 justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for desktop */}
        <div className="hidden lg:flex sticky top-0 z-40 items-center justify-between h-16 px-6 bg-white/70 backdrop-blur-lg border-b border-emerald-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-700">
              {navigation.find(item => item.href === pathname)?.name || "Teacher Portal"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-emerald-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-emerald-50">
                  <Avatar className="h-8 w-8 border border-emerald-200">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                      {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700">{user?.full_name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-slate-500">
                  Grade {user?.assigned_grade} Adviser
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6 pt-20 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
