"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, UserCog, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: string;
  email: string;
  username: string;
  full_name: string;
  assigned_grade: number;
  contact_number: string | null;
  is_active: boolean;
  created_at: string;
}

interface GeneratedCredentials {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

// Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const symbols = '!@#$%';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  password += Math.floor(Math.random() * 10);
  return password;
};

// Generate username from full name
const generateUsername = (fullName: string) => {
  const parts = fullName.toLowerCase().trim().split(/\s+/);
  if (parts.length >= 2) {
    // First letter of first name + last name
    return parts[0][0] + parts[parts.length - 1];
  }
  return parts[0].substring(0, 8);
};

// Generate email from username
const generateEmail = (username: string) => {
  return `${username}@sslg.edu.ph`;
};

export default function AccountsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<GeneratedCredentials | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    username: "",
    assigned_grade: "7",
    contact_number: "",
    is_active: true,
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setTeachers(data);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      toast.error('Failed to load teacher accounts');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTeacher 
        ? `/api/accounts?id=${editingTeacher.id}` 
        : '/api/accounts';
      
      // Auto-generate credentials for new teachers
      let generatedUsername = formData.username;
      let generatedEmail = formData.email;
      let generatedPassword = formData.password;

      if (!editingTeacher) {
        // Generate username from full name if not provided
        if (!formData.username) {
          generatedUsername = generateUsername(formData.full_name);
          // Check if username exists and add number suffix if needed
          const existingUsernames = teachers.map(t => t.username.toLowerCase());
          let counter = 1;
          let baseUsername = generatedUsername;
          while (existingUsernames.includes(generatedUsername.toLowerCase())) {
            generatedUsername = `${baseUsername}${counter}`;
            counter++;
          }
        }
        // Generate email from username if not provided
        if (!formData.email) {
          generatedEmail = generateEmail(generatedUsername);
        }
        // Generate password if not provided
        if (!formData.password) {
          generatedPassword = generatePassword();
        }
      }

      const body = editingTeacher 
        ? {
            full_name: formData.full_name,
            username: formData.username,
            assigned_grade: parseInt(formData.assigned_grade),
            contact_number: formData.contact_number || null,
            is_active: formData.is_active,
          }
        : {
            email: generatedEmail,
            password: generatedPassword,
            full_name: formData.full_name,
            username: generatedUsername,
            assigned_grade: parseInt(formData.assigned_grade),
            contact_number: formData.contact_number || null,
            is_active: formData.is_active,
          };

      const response = await fetch(url, {
        method: editingTeacher ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to save teacher account');
      } else {
        if (editingTeacher) {
          toast.success('Teacher account updated successfully');
        } else {
          // Show generated credentials dialog
          setGeneratedCredentials({
            email: generatedEmail,
            username: generatedUsername,
            password: generatedPassword,
            full_name: formData.full_name,
          });
          setCredentialsDialogOpen(true);
          toast.success('Teacher account created successfully');
        }
        await fetchTeachers();
        resetForm();
      }
    } catch (err) {
      console.error('Error saving teacher:', err);
      toast.error('Failed to save teacher account');
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      email: teacher.email,
      password: "",
      full_name: teacher.full_name,
      username: teacher.username,
      assigned_grade: teacher.assigned_grade.toString(),
      contact_number: teacher.contact_number || "",
      is_active: teacher.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher account?")) return;

    try {
      const response = await fetch(`/api/accounts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Teacher account deleted successfully');
        await fetchTeachers();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete teacher account');
      }
    } catch (err) {
      console.error('Error deleting teacher:', err);
      toast.error('Failed to delete teacher account');
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      username: "",
      assigned_grade: "7",
      contact_number: "",
      is_active: true,
    });
    setEditingTeacher(null);
    setShowPassword(false);
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-sky-600 font-medium">Account Management</p>
            <h1 className="text-3xl font-bold text-slate-800">Teacher Accounts</h1>
          </div>
        </div>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500">Loading teacher accounts...</p>
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
          <p className="text-sm text-sky-600 font-medium">Account Management</p>
          <h1 className="text-3xl font-bold text-slate-800">Teacher Accounts</h1>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-sky-50/50 border-b border-slate-100">
          <CardTitle className="text-slate-800">All Teacher Accounts ({teachers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="text-slate-600 font-semibold">Name</TableHead>
                <TableHead className="text-slate-600 font-semibold">Username</TableHead>
                <TableHead className="text-slate-600 font-semibold">Email</TableHead>
                <TableHead className="text-slate-600 font-semibold">Assigned Grade</TableHead>
                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                <TableHead className="text-right text-slate-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <UserCog className="w-12 h-12 text-slate-300" />
                      <p className="font-medium">No teacher accounts found</p>
                      <p className="text-sm">Add a teacher to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-sky-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-800">{teacher.full_name}</TableCell>
                    <TableCell className="text-slate-600">{teacher.username}</TableCell>
                    <TableCell className="text-slate-600">{teacher.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                        Grade {teacher.assigned_grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={teacher.is_active 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0" 
                        : "bg-slate-200 text-slate-600"
                      }>
                        {teacher.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(teacher)}
                          className="h-8 w-8 p-0 hover:bg-sky-100 hover:text-sky-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
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
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              {editingTeacher ? 'Edit Teacher Account' : 'Add New Teacher Account'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingTeacher && (
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sm text-sky-800">
                💡 Username, email, and password will be <strong>auto-generated</strong> from the teacher&apos;s name. You can customize them below if needed.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-slate-700">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g., Juan Dela Cruz"
                required
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">
                Username {editingTeacher ? '*' : '(auto-generated)'}
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={editingTeacher ? "e.g., jdelacruz" : "Leave blank to auto-generate"}
                required={!!editingTeacher}
                className="border-slate-200"
              />
            </div>

            {!editingTeacher && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email (auto-generated)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Leave blank to auto-generate (username@sslg.edu.ph)"
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password (auto-generated)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to auto-generate a secure password"
                      className="border-slate-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="assigned_grade" className="text-slate-700">Assigned Grade Level *</Label>
              <Select
                value={formData.assigned_grade}
                onValueChange={(value) => setFormData({ ...formData, assigned_grade: value })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number" className="text-slate-700">Contact Number</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="e.g., 09171234567"
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
                Active Account
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm} className="border-slate-200">
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
              >
                {editingTeacher ? 'Update Account' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generated Credentials Dialog */}
      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Teacher Account Created
            </DialogTitle>
          </DialogHeader>
          
          {generatedCredentials && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Please save these credentials now. The password cannot be recovered later.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Full Name</p>
                    <p className="font-medium text-slate-800">{generatedCredentials.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-xs text-slate-500">Username</p>
                    <p className="font-mono font-medium text-slate-800">{generatedCredentials.username}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCredentials.username, 'Username')}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'Username' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-mono font-medium text-slate-800">{generatedCredentials.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCredentials.email, 'Email')}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'Email' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-xs text-slate-500">Password</p>
                    <p className="font-mono font-medium text-slate-800">{generatedCredentials.password}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCredentials.password, 'Password')}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'Password' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => {
                  const allCredentials = `Teacher Account Credentials\n\nFull Name: ${generatedCredentials.full_name}\nUsername: ${generatedCredentials.username}\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`;
                  copyToClipboard(allCredentials, 'All credentials');
                }}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All Credentials
              </Button>

              <DialogFooter>
                <Button 
                  onClick={() => {
                    setCredentialsDialogOpen(false);
                    setGeneratedCredentials(null);
                  }}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
