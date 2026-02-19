"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UserCircle, Upload, X, Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Candidate {
  id: string;
  platform: string | null;
  vision: string | null;
  mission: string | null;
  photo_url: string | null;
  is_active: boolean;
  student: { "Full Name": string; "Student ID": string } | null;
  position: { name: string } | null;
  partylist: { name: string; color: string } | null;
}

interface Student {
  id: string;
  "Student ID": string;
  "Full Name": string;
  Grade: number;
}

interface Position {
  id: string;
  name: string;
  is_active: boolean;
}

interface Partylist {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [partylists, setPartylists] = useState<Partylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    position_id: "",
    partylist_id: "",
    platform: "",
    vision: "",
    mission: "",
    photo_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch candidates via API
      const candidatesRes = await fetch('/api/candidates');
      const candidatesData = await candidatesRes.json();
      
      // Fetch students via API
      const studentsRes = await fetch('/api/students');
      const studentsData = await studentsRes.json();
      
      // Fetch positions via API
      const positionsRes = await fetch('/api/positions');
      const positionsData = await positionsRes.json();
      
      // Fetch partylists via API
      const partylistsRes = await fetch('/api/partylists');
      const partylistsData = await partylistsRes.json();

      setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      
      // Filter active positions and deduplicate by id and name
      const activePositions = Array.isArray(positionsData) 
        ? positionsData.filter((p: Position) => p.is_active) 
        : [];
      const seenPositionIds = new Set<string>();
      const seenPositionNames = new Set<string>();
      const uniquePositions = activePositions.filter((pos: Position) => {
        if (seenPositionIds.has(pos.id) || seenPositionNames.has(pos.name)) {
          return false;
        }
        seenPositionIds.add(pos.id);
        seenPositionNames.add(pos.name);
        return true;
      });
      setPositions(uniquePositions);
      
      // Filter active partylists and deduplicate by id and name
      // Also exclude "Independent" since we add it manually in the dropdown
      const activePartylists = Array.isArray(partylistsData) 
        ? partylistsData.filter((p: Partylist) => p.is_active && p.name.toLowerCase() !== 'independent') 
        : [];
      const seenPartylistIds = new Set<string>();
      const seenPartylistNames = new Set<string>();
      const uniquePartylists = activePartylists.filter((pl: Partylist) => {
        if (seenPartylistIds.has(pl.id) || seenPartylistNames.has(pl.name)) {
          return false;
        }
        seenPartylistIds.add(pl.id);
        seenPartylistNames.add(pl.name);
        return true;
      });
      setPartylists(uniquePartylists);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    const searchTerm = studentSearch.toLowerCase().trim();
    if (!searchTerm) return students;
    return students.filter(student => 
      student["Full Name"].toLowerCase().includes(searchTerm) ||
      student["Student ID"].toLowerCase().includes(searchTerm) ||
      student.Grade.toString().includes(searchTerm)
    );
  }, [students, studentSearch]);

  // Get candidate student IDs for marking in the dropdown
  const candidateStudentIds = useMemo(() => {
    return new Set(
      candidates
        .filter(c => !editingCandidate || c.id !== editingCandidate.id)
        .map(c => c.student)
        .filter(Boolean)
        .map(s => s!["Student ID"])
    );
  }, [candidates, editingCandidate]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error('Upload failed: ' + result.error);
      } else {
        setFormData({ ...formData, photo_url: result.photo_url });
        setPhotoPreview(result.photo_url);
        toast.success('Photo uploaded successfully');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload photo');
    }
    setUploading(false);
  };

  const removePhoto = async () => {
    if (formData.photo_url) {
      // Delete the uploaded file
      const filename = formData.photo_url.split('/').pop();
      try {
        await fetch(`/api/upload?filename=${filename}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete photo:', err);
      }
    }
    setFormData({ ...formData, photo_url: '' });
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      student_id: candidate.student ? (students.find(s => s["Student ID"] === candidate.student!["Student ID"])?.id || "") : "",
      position_id: "", // will be resolved below
      partylist_id: candidate.partylist ? (partylists.find(p => p.name === candidate.partylist!.name)?.id || "independent") : "independent",
      platform: candidate.platform || "",
      vision: candidate.vision || "",
      mission: candidate.mission || "",
      photo_url: candidate.photo_url || "",
      is_active: candidate.is_active,
    });
    // Resolve position id
    const pos = positions.find(p => p.name === candidate.position?.name);
    if (pos) {
      setFormData(prev => ({ ...prev, position_id: pos.id }));
    }
    // Resolve student id
    const stu = students.find(s => s["Full Name"] === candidate.student?.["Full Name"]);
    if (stu) {
      setFormData(prev => ({ ...prev, student_id: stu.id }));
      setSelectedStudent(stu);
    }
    setPhotoPreview(candidate.photo_url || null);
    setStudentSearch("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Handle "independent" selection as null partylist
      const partylistId = formData.partylist_id === 'independent' || !formData.partylist_id 
        ? null 
        : formData.partylist_id;
      
      if (editingCandidate) {
        // Update existing candidate
        const response = await fetch(`/api/candidates?id=${editingCandidate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position_id: formData.position_id,
            partylist_id: partylistId,
            platform: formData.platform || null,
            vision: formData.vision || null,
            mission: formData.mission || null,
            photo_url: formData.photo_url || null,
            is_active: formData.is_active,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          toast.error(result.error || 'Failed to update candidate');
        } else {
          toast.success('Candidate updated successfully');
          await fetchData();
          resetForm();
        }
        return;
      }

      // Create new candidate
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: formData.student_id,
          position_id: formData.position_id,
          partylist_id: partylistId,
          platform: formData.platform || null,
          vision: formData.vision || null,
          mission: formData.mission || null,
          photo_url: formData.photo_url || null,
          is_active: formData.is_active,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to create candidate');
      } else {
        toast.success('Candidate added successfully');
        await fetchData();
        setFormData({
          student_id: "",
          position_id: "",
          partylist_id: "",
          platform: "",
          vision: "",
          mission: "",
          photo_url: "",
          is_active: true,
        });
        setPhotoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setDialogOpen(false);
      }
    } catch (err) {
      console.error('Error creating candidate:', err);
      toast.error('Failed to create candidate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const response = await fetch(`/api/candidates?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Candidate deleted successfully');
        await fetchData();
      } else {
        toast.error('Failed to delete candidate');
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
      toast.error('Failed to delete candidate');
    }
  };

  const resetForm = () => {
    // If there's an uploaded photo that wasn't saved and we're NOT editing, delete it
    if (!editingCandidate && formData.photo_url && photoPreview) {
      const filename = formData.photo_url.split('/').pop();
      fetch(`/api/upload?filename=${filename}`, { method: 'DELETE' }).catch(() => {});
    }
    setFormData({
      student_id: "",
      position_id: "",
      partylist_id: "",
      platform: "",
      vision: "",
      mission: "",
      photo_url: "",
      is_active: true,
    });
    setPhotoPreview(null);
    setEditingCandidate(null);
    setStudentSearch("");
    setSelectedStudent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-sky-600 font-medium">Candidate Management</p>
            <h1 className="text-3xl font-bold text-slate-800">Candidates</h1>
          </div>
        </div>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500">Loading candidates...</p>
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
          <p className="text-sm text-sky-600 font-medium">Candidate Management</p>
          <h1 className="text-3xl font-bold text-slate-800">Candidates</h1>
        </div>
        <Button 
          onClick={() => {
            setStudentSearch("");
            setSelectedStudent(null);
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-800">All Candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="text-slate-600 font-semibold">Photo</TableHead>
                <TableHead className="text-slate-600 font-semibold">Name</TableHead>
                <TableHead className="text-slate-600 font-semibold">Position</TableHead>
                <TableHead className="text-slate-600 font-semibold">Partylist</TableHead>
                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                <TableHead className="text-right text-slate-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <UserCircle className="w-12 h-12 text-slate-300" />
                      <p className="font-medium">No candidates found</p>
                      <p className="text-sm">Add a candidate to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="hover:bg-sky-50/50 transition-colors">
                    <TableCell>
                      {candidate.photo_url ? (
                        <Image
                          src={candidate.photo_url}
                          alt={candidate.student?.["Full Name"] || "Candidate"}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {candidate.student?.["Full Name"] || "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-600">{candidate.position?.name || "N/A"}</TableCell>
                    <TableCell>
                      {candidate.partylist ? (
                        <Badge style={{ backgroundColor: candidate.partylist.color, color: "white" }}>
                          {candidate.partylist.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Independent</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={candidate.is_active 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0" 
                        : "bg-slate-200 text-slate-600"
                      }>
                        {candidate.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(candidate)}
                        className="h-8 w-8 p-0 hover:bg-sky-100 hover:text-sky-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(candidate.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">{editingCandidate ? "Edit Candidate" : "Add New Candidate"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editingCandidate ? (
              <div className="space-y-1">
                <Label className="text-slate-700">Student</Label>
                <p className="text-sm text-slate-600 font-medium px-1">{editingCandidate.student?.["Full Name"]} ({editingCandidate.student?.["Student ID"]})</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="student_id" className="text-slate-700">Student *</Label>
                
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-md bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-800">{selectedStudent["Full Name"]}</p>
                      <p className="text-sm text-slate-600">ID: {selectedStudent["Student ID"]} • Grade {selectedStudent.Grade}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(null);
                        setFormData({ ...formData, student_id: "" });
                        setStudentSearch("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by name, ID, or grade..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-9 border-slate-200"
                      />
                    </div>
                    
                    {studentSearch && (
                      <div className="border border-slate-200 rounded-md max-h-60 overflow-y-auto">
                        {filteredStudents.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-500">
                            No students found
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {filteredStudents.map((student) => {
                              const isCandidate = candidateStudentIds.has(student["Student ID"]);
                              return (
                                <button
                                  key={student.id}
                                  type="button"
                                  onClick={() => {
                                    if (!isCandidate) {
                                      setSelectedStudent(student);
                                      setFormData({ ...formData, student_id: student.id });
                                      setStudentSearch("");
                                    }
                                  }}
                                  disabled={isCandidate}
                                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                                    isCandidate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-slate-800">{student["Full Name"]}</p>
                                      <p className="text-sm text-slate-600">ID: {student["Student ID"]} • Grade {student.Grade}</p>
                                    </div>
                                    {isCandidate && (
                                      <Badge variant="outline" className="ml-2 text-xs">Already a candidate</Badge>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {filteredStudents.length > 0 && (
                          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                            <p className="text-xs text-slate-500">
                              Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="position_id" className="text-slate-700">Position *</Label>
              <Select
                value={formData.position_id}
                onValueChange={(value) => setFormData({ ...formData, position_id: value })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partylist_id" className="text-slate-700">Partylist (Optional)</Label>
              <Select
                value={formData.partylist_id}
                onValueChange={(value) => setFormData({ ...formData, partylist_id: value })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select a partylist or leave empty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent</SelectItem>
                  {partylists.map((partylist) => (
                    <SelectItem key={partylist.id} value={partylist.id}>
                      {partylist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Photo</Label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <Image
                      src={photoPreview}
                      alt="Candidate preview"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                    <UserCircle className="w-10 h-10 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="border-slate-200"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP, GIF (max 5MB)</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform" className="text-slate-700">Platform</Label>
              <Textarea
                id="platform"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="Enter candidate's platform or campaign message"
                rows={2}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vision" className="text-slate-700">Vision</Label>
              <Textarea
                id="vision"
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                placeholder="Enter candidate's vision statement"
                rows={2}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission" className="text-slate-700">Mission</Label>
              <Textarea
                id="mission"
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                placeholder="Enter candidate's mission statement"
                rows={2}
                className="border-slate-200"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-slate-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer text-slate-700">
                Active Candidate
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm} className="border-slate-200">
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
              >
                {editingCandidate ? "Save Changes" : "Add Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
