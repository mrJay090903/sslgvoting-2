"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  UserCircle, 
  Flag, 
  Vote, 
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Settings,
  ChevronDown,
  Award,
  UserCog
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?role=admin");
        return;
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .eq("role", "admin")
        .single();

      if (!userData) {
        router.push("/");
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
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Positions", href: "/admin/positions", icon: Award },
    { name: "Candidates", href: "/admin/candidates", icon: UserCircle },
    { name: "Partylists", href: "/admin/partylists", icon: Flag },
    { name: "Elections", href: "/admin/elections", icon: Vote },
    { name: "Accounts", href: "/admin/accounts", icon: UserCog },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-sky-100 via-sky-50 to-white border-r border-sky-200/50 pt-5 pb-4 overflow-y-auto shadow-lg">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">SSLG</h1>
                <p className="text-xs text-slate-500 -mt-0.5">Voting System</p>
              </div>
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
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25"
                        : "text-slate-600 hover:bg-sky-100/80 hover:text-sky-700"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110
                        ${isActive ? "text-white" : "text-slate-400 group-hover:text-sky-600"}
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
          
          {/* User Section at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-sky-200/50">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-10 w-10 border-2 border-sky-300">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold">
                  {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.username}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-sky-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">SSLG Admin</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-600 hover:bg-sky-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-white pt-16">
          <nav className="px-4 space-y-1 mt-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all
                    ${isActive
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
                      : "text-slate-600 hover:bg-sky-100"
                    }
                  `}
                >
                  <Icon className={`mr-4 h-6 w-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-sky-200/50 p-4">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-10 w-10 border-2 border-sky-300">
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold">
                  {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-slate-700">{user?.username}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-sky-200/50 px-6 py-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-slate-50/80 border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl">
              <Settings className="h-5 w-5" />
            </Button>

            {/* Divider */}
            <div className="w-px h-8 bg-slate-200"></div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 hover:bg-sky-50 rounded-xl px-3">
                  <Avatar className="h-9 w-9 border-2 border-sky-300">
                    <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold text-sm">
                      {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-semibold text-slate-700">{user?.username}</p>
                    <p className="text-xs text-slate-500">Admin</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 pt-16 lg:pt-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
