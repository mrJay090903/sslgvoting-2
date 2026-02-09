"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Users, Download } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  "Student ID": string;
  "Full Name": string;
  Grade: number;
  Email: string | null;
  "Contact Number"?: string | null;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Grade operation dialogs
  const [updateGradeDialogOpen, setUpdateGradeDialogOpen] = useState(false);
  const [deleteGradeDialogOpen, setDeleteGradeDialogOpen] = useState(false);
  const [filterGradeDialogOpen, setFilterGradeDialogOpen] = useState(false);
  const [checkDuplicatesDialogOpen, setCheckDuplicatesDialogOpen] = useState(false);
  const [duplicatesList, setDuplicatesList] = useState<any[]>([]);
  
  // Grade selections
  const [updateFromGrade, setUpdateFromGrade] = useState<number>(7);
  const [updateToGrade, setUpdateToGrade] = useState<number>(8);
  const [deleteGrade, setDeleteGrade] = useState<number>(12);
  const [filterGrade, setFilterGrade] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    "Student ID": "",
    "Full Name": "",
    Grade: "7",
    Email: "",
    "Contact Number": "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      console.log('Fetching students from API...');
      const response = await fetch('/api/students');
      const data = await response.json();

      console.log('Fetch result:', { data, count: data?.length });

      if (!response.ok) {
        console.error('Error fetching students:', data.error);
      } else {
        console.log('Setting students:', data);
        setStudents(data);
        setFilteredStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
    setLoading(false);
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      setCurrentPage(1); // Reset to first page on filter change
      return;
    }

    const filtered = students.filter(
      (student) =>
        student["Student ID"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        student["Full Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.Email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const studentData = {
      "Student ID": formData["Student ID"],
      "Full Name": formData["Full Name"],
      Grade: parseInt(formData.Grade),
      Email: formData.Email || null,
      "Contact Number": formData["Contact Number"] || null,
    };

    if (editingStudent) {
      // Update existing student
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingStudent.id, ...studentData }),
      });

      if (response.ok) {
        await fetchStudents();
        resetForm();
      }
    } else {
      // Create new student
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        await fetchStudents();
        resetForm();
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      "Student ID": student["Student ID"],
      "Full Name": student["Full Name"],
      Grade: student.Grade.toString(),
      Email: student.Email || "",
      "Contact Number": student["Contact Number"] || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    const response = await fetch(`/api/students?id=${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await fetchStudents();
    }
  };

  const resetForm = () => {
    setFormData({
      "Student ID": "",
      "Full Name": "",
      Grade: "7",
      Email: "",
      "Contact Number": "",
    });
    setEditingStudent(null);
    setDialogOpen(false);
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;

    setImporting(true);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          console.log('Parsed CSV data:', results);
          console.log('Column headers:', results.meta.fields);

          if (!results.data || results.data.length === 0) {
            toast.error('CSV file is empty or invalid');
            setImporting(false);
            return;
          }

          // Get the headers
          const headers = results.meta.fields || [];
          console.log('Available headers:', headers);

          // Map CSV data to database columns
          const studentsToImport = results.data.map((row: any) => {
            // Handle contact number - convert N/A to null
            let contactNumber = row['Contact Number'] || row['contact number'] || null;
            if (contactNumber) {
              const contactValue = contactNumber.trim().toUpperCase();
              if (contactValue === 'N/A' || contactValue === '') {
                contactNumber = null;
              }
            }

            const student = {
              "Student ID": row['Student ID'] || row['student id'] || '',
              "Full Name": row['Full Name'] || row['full name'] || '',
              Grade: parseInt(row['Grade'] || row['grade'] || '7'),
              Email: row['Email'] || row['email'] || null,
              "Contact Number": contactNumber,
            };

            console.log('Mapped student:', student);
            return student;
          }).filter(student => student["Student ID"] && student["Full Name"]);

          console.log('Students to import:', studentsToImport);

          if (studentsToImport.length === 0) {
            toast.error('No valid student data found in CSV. Please ensure your CSV has columns: Student ID, Full Name, Grade, Email, Contact Number');
            setImporting(false);
            return;
          }

          // Import to database via API
          console.log('Inserting students into database...');
          
          const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentsToImport),
          });

          const result = await response.json();
          console.log('Insert result:', result);

          if (!response.ok) {
            console.error('Database error:', result.error);
            toast.error(`Error importing students: ${result.error}`);
          } else {
            toast.success(`Successfully imported ${studentsToImport.length} students!`);
            await fetchStudents();
            setImportDialogOpen(false);
            setCsvFile(null);
          }
        } catch (err) {
          console.error('Import error:', err);
          toast.error('Error importing students. Please check the console for details.');
        }
        setImporting(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error('Error parsing CSV file. Please check the format.');
        setImporting(false);
      }
    });
  };

  const updateGrade7To8 = async () => {
    if (!confirm(`Are you sure you want to update all Grade ${updateFromGrade} students to Grade ${updateToGrade}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Use bulk update API to avoid rate limits and speed up
      const response = await fetch('/api/students/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromGrade: updateFromGrade, toGrade: updateToGrade }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('Bulk update error:', result?.error);
        toast.error(result?.error || 'Failed to update students');
        return;
      }

      toast.success(`Successfully updated ${result.updated} students from Grade ${updateFromGrade} to Grade ${updateToGrade}`);
      setUpdateGradeDialogOpen(false);
      await fetchStudents();
    } catch (err) {
      console.error('Error updating grades:', err);
      toast.error("Error updating grades");
    }
  };

  const deleteGrade12Students = async () => {
    if (!confirm(`Are you sure you want to delete all Grade ${deleteGrade} students? This action cannot be undone.`)) {
      return;
    }

    try {
      const gradeStudents = students.filter(s => s.Grade === deleteGrade);
      
      if (gradeStudents.length === 0) {
        toast.error(`No Grade ${deleteGrade} students found`);
        return;
      }

      const deletePromises = gradeStudents.map(student =>
        fetch(`/api/students?id=${student.id}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${gradeStudents.length} Grade ${deleteGrade} students`);
      setDeleteGradeDialogOpen(false);
      await fetchStudents();
    } catch (err) {
      console.error('Error deleting students:', err);
      toast.error("Error deleting students");
    }
  };

  const sortStudentsByGrade = () => {
    const sorted = [...filteredStudents].sort((a, b) => a.Grade - b.Grade);
    setFilteredStudents(sorted);
  };

  const removeDuplicateStudents = async () => {
    if (!confirm("This will remove duplicate students (keeping the first entry). This action cannot be undone. Continue?")) {
      return;
    }

    try {
      // Find duplicates based on Student ID and Full Name
      const seen = new Map<string, string>(); // key -> id
      const duplicates: string[] = [];

      students.forEach(student => {
        const key = `${student["Student ID"]}_${student["Full Name"]}`; // Composite key
        if (seen.has(key)) {
          duplicates.push(student.id); // Mark second occurrence as duplicate
        } else {
          seen.set(key, student.id);
        }
      });

      if (duplicates.length === 0) {
        toast.info("No duplicate students found");
        return;
      }

      // Delete duplicates
      const deletePromises = duplicates.map(studentId =>
        fetch(`/api/students?id=${studentId}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      toast.success(`Successfully removed ${duplicates.length} duplicate student(s)`);
      await fetchStudents();
    } catch (err) {
      console.error('Error removing duplicates:', err);
      toast.error("Error removing duplicate students");
    }
  };

  const checkDuplicateStudents = () => {
    // Find duplicates based on Student ID and Full Name
    const seen = new Map<string, Student[]>(); // key -> array of students

    students.forEach(student => {
      const key = `${student["Student ID"]}_${student["Full Name"]}`; // Composite key
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(student);
    });

    // Filter only groups with duplicates
    const duplicateGroups: any[] = [];
    seen.forEach((group, key) => {
      if (group.length > 1) {
        duplicateGroups.push({
          key,
          count: group.length,
          students: group
        });
      }
    });

    setDuplicatesList(duplicateGroups);
    if (duplicateGroups.length === 0) {
      toast.success("No duplicate students found!");
    } else {
      toast.info(`Found ${duplicateGroups.length} duplicate group(s) with ${duplicateGroups.reduce((sum, g) => sum + (g.count - 1), 0)} extra entries`);
    }
    setCheckDuplicatesDialogOpen(true);
  };

  const filterStudentsByGrade = () => {
    if (filterGrade === null) {
      setFilteredStudents(students);
      setCurrentPage(1);
      toast.info("Filter cleared - showing all students");
      return;
    }
    
    const filtered = students.filter(s => s.Grade === filterGrade);
    setFilteredStudents(filtered);
    setCurrentPage(1);
    toast.success(`Showing ${filtered.length} student(s) from Grade ${filterGrade}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-sky-600 font-medium">Student Management</p>
            <h1 className="text-3xl font-bold text-slate-800">Students</h1>
          </div>
        </div>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500">Loading students...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-sky-600 font-medium">Student Management</p>
          <h1 className="text-3xl font-bold text-slate-800">Students</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => setFilterGradeDialogOpen(true)}
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
          >
            Filter by Grade
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setUpdateGradeDialogOpen(true)}
            className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
          >
            Update Grade
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setDeleteGradeDialogOpen(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            Delete Grade
          </Button>
          <Button 
            variant="outline" 
            onClick={removeDuplicateStudents}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
          >
            Remove Duplicates
          </Button>
          <Button 
            variant="outline" 
            onClick={checkDuplicateStudents}
            className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
          >
            Check Duplicates
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setImportDialogOpen(true)}
            className="border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{students.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Search Results</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{filteredStudents.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Current Page</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{currentPage} / {totalPages || 1}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by Student ID, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50/80 border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-800">All Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="text-slate-600 font-semibold">Student ID</TableHead>
                <TableHead className="text-slate-600 font-semibold">Full Name</TableHead>
                <TableHead className="text-slate-600 font-semibold">Grade</TableHead>
                <TableHead className="text-slate-600 font-semibold">Email</TableHead>
                <TableHead className="text-slate-600 font-semibold">Contact Number</TableHead>
                <TableHead className="text-right text-slate-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-slate-300" />
                      <p className="font-medium">No students found</p>
                      <p className="text-sm">Try adjusting your search or add a new student</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-sky-50/50 transition-colors">
                    <TableCell className="font-mono text-slate-700">{student["Student ID"]}</TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {student["Full Name"]}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0">
                        Grade {student.Grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{student.Email || "-"}</TableCell>
                    <TableCell className="text-slate-600">{student["Contact Number"] || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          className="h-8 w-8 p-0 hover:bg-sky-100 hover:text-sky-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {filteredStudents.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Rows per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8 bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">
                  {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
                </span>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 disabled:opacity-50"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium">
                    {currentPage} / {totalPages || 1}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 p-0 border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 p-0 border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 disabled:opacity-50"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Fill in the student information below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student_id" className="text-slate-700">Student ID *</Label>
              <Input
                id="student_id"
                value={formData["Student ID"]}
                onChange={(e) =>
                  setFormData({ ...formData, "Student ID": e.target.value })
                }
                placeholder="e.g., 2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData["Full Name"]}
                onChange={(e) =>
                  setFormData({ ...formData, "Full Name": e.target.value })
                }
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade_level">Grade Level *</Label>
              <Select
                value={formData.Grade}
                onValueChange={(value) =>
                  setFormData({ ...formData, Grade: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[7, 8, 9, 10, 11, 12].map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.Email}
                onChange={(e) =>
                  setFormData({ ...formData, Email: e.target.value })
                }
                placeholder="student@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number (Optional)</Label>
              <Input
                id="contact_number"
                type="tel"
                value={formData["Contact Number"]}
                onChange={(e) =>
                  setFormData({ ...formData, "Contact Number": e.target.value })
                }
                placeholder="09123456789"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingStudent ? "Update" : "Create"} Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Students from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with the following columns: Student ID, Full Name, Grade, Email, Contact Number
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                disabled={importing}
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>CSV Format Example:</strong></p>
              <code className="block bg-slate-100 p-2 rounded text-xs">
                Student ID,Full Name,Grade,Email,Contact Number<br />
                2024-001,John Doe,10,john@example.com,09123456789<br />
                2024-002,Jane Smith,11,jane@example.com,09987654321
              </code>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setCsvFile(null);
              }}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportCSV}
              disabled={!csvFile || importing}
            >
              {importing ? "Importing..." : "Import Students"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sort Grade Dialog */}
      <Dialog open={filterGradeDialogOpen} onOpenChange={setFilterGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Students by Grade</DialogTitle>
            <DialogDescription>Show only students from a specific grade</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-grade">Select Grade (or Clear to Show All)</Label>
              <Select value={filterGrade?.toString() || "all"} onValueChange={(val) => setFilterGrade(val === "all" ? null : parseInt(val))}>
                <SelectTrigger id="filter-grade">
                  <SelectValue placeholder="Select a grade to filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Clear Filter - Show All</SelectItem>
                  {[7, 8, 9, 10, 11, 12].map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade} ({students.filter(s => s.Grade === grade).length} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFilterGradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                filterStudentsByGrade();
                setFilterGradeDialogOpen(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Apply Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Grade Dialog */}
      <Dialog open={updateGradeDialogOpen} onOpenChange={setUpdateGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Grade</DialogTitle>
            <DialogDescription>Update all students from one grade to another</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="from-grade">Update From Grade</Label>
              <Select value={updateFromGrade.toString()} onValueChange={(val) => setUpdateFromGrade(parseInt(val))}>
                <SelectTrigger id="from-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[7, 8, 9, 10, 11, 12].map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade} ({students.filter(s => s.Grade === grade).length} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-grade">Update To Grade</Label>
              <Select value={updateToGrade.toString()} onValueChange={(val) => setUpdateToGrade(parseInt(val))}>
                <SelectTrigger id="to-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[7, 8, 9, 10, 11, 12].map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateGradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={updateGrade7To8}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Update Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Grade Dialog */}
      <Dialog open={deleteGradeDialogOpen} onOpenChange={setDeleteGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Students by Grade</DialogTitle>
            <DialogDescription className="text-red-600">This action cannot be undone!</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-grade">Select Grade to Delete</Label>
              <Select value={deleteGrade.toString()} onValueChange={(val) => setDeleteGrade(parseInt(val))}>
                <SelectTrigger id="delete-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[7, 8, 9, 10, 11, 12].map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade} ({students.filter(s => s.Grade === grade).length} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-semibold">
                {students.filter(s => s.Grade === deleteGrade).length} student(s) will be permanently deleted.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteGradeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={deleteGrade12Students}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Duplicates Dialog */}
      <Dialog open={checkDuplicatesDialogOpen} onOpenChange={setCheckDuplicatesDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Duplicate Students Found</DialogTitle>
            <DialogDescription>
              {duplicatesList.length === 0 
                ? "No duplicate entries found" 
                : `Found ${duplicatesList.length} duplicate group(s) with ${duplicatesList.reduce((sum, g) => sum + (g.count - 1), 0)} extra entries`}
            </DialogDescription>
          </DialogHeader>
          
          {duplicatesList.length > 0 ? (
            <div className="space-y-4 py-4">
              {duplicatesList.map((group, index) => (
                <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="mb-3">
                    <h3 className="font-semibold text-slate-800">Group {index + 1}: {group.count} duplicates</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-medium">ID:</span> {group.students[0]["Student ID"]} | 
                      <span className="font-medium ml-2">Name:</span> {group.students[0]["Full Name"]}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {group.students.map((student: any, idx: number) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-white rounded border border-orange-100 text-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={idx === 0 ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}>
                              {idx === 0 ? "Keep" : "Remove"}
                            </Badge>
                            <span className="text-slate-700">{student["Full Name"]}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Grade {student.Grade} • {student.Email || "No email"}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">{student.id.slice(0, 8)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> The first entry in each group will be kept. Click "Remove Duplicates" to delete the extra entries.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-slate-500">No duplicate students found in the system</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCheckDuplicatesDialogOpen(false)}
            >
              Close
            </Button>
            {duplicatesList.length > 0 && (
              <Button
                onClick={() => {
                  setCheckDuplicatesDialogOpen(false);
                  removeDuplicateStudents();
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Remove These Duplicates
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
