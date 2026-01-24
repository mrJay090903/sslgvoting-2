"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { Search, Users, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  lrn: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  grade_level: number;
  section: string;
  is_active: boolean;
  created_at: string;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [sections, setSections] = useState<string[]>([]);
  const [gradeLevel, setGradeLevel] = useState<number | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
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

      const assignedGrade = userData.assigned_grade;
      setGradeLevel(assignedGrade);

      // Fetch students for this grade only
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("grade_level", assignedGrade)
        .order("last_name", { ascending: true });

      if (error) throw error;

      setStudents(data || []);
      setFilteredStudents(data || []);
      
      // Get unique sections
      const uniqueSections = [...new Set((data || []).map(s => s.section))].sort();
      setSections(uniqueSections);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to load students");
    }
    setLoading(false);
  };

  const filterStudents = useCallback(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.first_name.toLowerCase().includes(search) ||
          s.last_name.toLowerCase().includes(search) ||
          s.lrn.toLowerCase().includes(search) ||
          (s.middle_name && s.middle_name.toLowerCase().includes(search))
      );
    }

    // Filter by section
    if (sectionFilter !== "all") {
      filtered = filtered.filter((s) => s.section === sectionFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, sectionFilter]);

  useEffect(() => {
    filterStudents();
  }, [filterStudents]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-600 font-medium">Student Management</p>
            <h1 className="text-3xl font-bold text-slate-800">Students</h1>
          </div>
        </div>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500">Loading students...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-emerald-600 font-medium">Student Management</p>
          <h1 className="text-3xl font-bold text-slate-800">Grade {gradeLevel} Students</h1>
        </div>
        <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 px-4 py-2 text-sm">
          <GraduationCap className="w-4 h-4 mr-2" />
          Grade {gradeLevel} Only
        </Badge>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="text-2xl font-bold text-slate-800">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Students</p>
              <p className="text-2xl font-bold text-slate-800">{students.filter(s => s.is_active).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Sections</p>
              <p className="text-2xl font-bold text-slate-800">{sections.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or LRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full sm:w-48 border-slate-200">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b border-slate-100">
          <CardTitle className="text-slate-800">
            Student List ({filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="text-slate-600 font-semibold">LRN</TableHead>
                <TableHead className="text-slate-600 font-semibold">Name</TableHead>
                <TableHead className="text-slate-600 font-semibold">Section</TableHead>
                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-slate-300" />
                      <p className="font-medium">No students found</p>
                      <p className="text-sm">
                        {searchTerm || sectionFilter !== "all" 
                          ? "Try adjusting your filters"
                          : `No students in Grade ${gradeLevel}`
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-emerald-50/50 transition-colors">
                    <TableCell className="font-mono text-slate-600">{student.lrn}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {student.last_name}, {student.first_name} {student.middle_name ? student.middle_name[0] + '.' : ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                        {student.section}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={student.is_active 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0" 
                        : "bg-slate-200 text-slate-600 border-0"
                      }>
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Note */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 shadow-lg">
        <CardContent className="p-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> As a Grade {gradeLevel} adviser, you can only view students assigned to your grade level. 
            Contact the administrator if you need to manage students from other grade levels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
