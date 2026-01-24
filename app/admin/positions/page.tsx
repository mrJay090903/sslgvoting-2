"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, GripVertical, Award } from "lucide-react";
import { toast } from "sonner";

interface Position {
  id: string;
  name: string;
  description: string | null;
  max_votes: number;
  display_order: number;
  is_active: boolean;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_votes: 1,
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Sort by display_order
        const sorted = data.sort((a: Position, b: Position) => a.display_order - b.display_order);
        setPositions(sorted);
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
      toast.error('Failed to load positions');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPosition 
        ? `/api/positions?id=${editingPosition.id}` 
        : '/api/positions';
      
      const response = await fetch(url, {
        method: editingPosition ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          max_votes: formData.max_votes,
          display_order: formData.display_order || positions.length + 1,
          is_active: formData.is_active,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to save position');
      } else {
        toast.success(editingPosition ? 'Position updated successfully' : 'Position added successfully');
        await fetchPositions();
        resetForm();
      }
    } catch (err) {
      console.error('Error saving position:', err);
      toast.error('Failed to save position');
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      description: position.description || "",
      max_votes: position.max_votes,
      display_order: position.display_order,
      is_active: position.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return;

    try {
      const response = await fetch(`/api/positions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Position deleted successfully');
        await fetchPositions();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete position');
      }
    } catch (err) {
      console.error('Error deleting position:', err);
      toast.error('Failed to delete position');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      max_votes: 1,
      display_order: 0,
      is_active: true,
    });
    setEditingPosition(null);
    setDialogOpen(false);
  };

  const seedDefaultPositions = async () => {
    const defaultPositions = [
      { name: 'President', description: 'Supreme Student Government President', max_votes: 1, display_order: 1 },
      { name: 'Vice President', description: 'Supreme Student Government Vice President', max_votes: 1, display_order: 2 },
      { name: 'Secretary', description: 'Supreme Student Government Secretary', max_votes: 1, display_order: 3 },
      { name: 'Treasurer', description: 'Supreme Student Government Treasurer', max_votes: 1, display_order: 4 },
      { name: 'Auditor', description: 'Supreme Student Government Auditor', max_votes: 1, display_order: 5 },
      { name: 'PIO', description: 'Public Information Officer', max_votes: 1, display_order: 6 },
      { name: 'Protocol Officer', description: 'Protocol Officer', max_votes: 1, display_order: 7 },
      { name: 'Grade 7 Representative', description: 'Grade 7 Class Representative', max_votes: 1, display_order: 8 },
      { name: 'Grade 8 Representative', description: 'Grade 8 Class Representative', max_votes: 1, display_order: 9 },
      { name: 'Grade 9 Representative', description: 'Grade 9 Class Representative', max_votes: 1, display_order: 10 },
      { name: 'Grade 10 Representative', description: 'Grade 10 Class Representative', max_votes: 1, display_order: 11 },
      { name: 'Grade 11 Representative', description: 'Grade 11 Class Representative', max_votes: 1, display_order: 12 },
      { name: 'Grade 12 Representative', description: 'Grade 12 Class Representative', max_votes: 1, display_order: 13 },
    ];

    try {
      for (const position of defaultPositions) {
        await fetch('/api/positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...position, is_active: true }),
        });
      }
      toast.success('Default positions added successfully');
      await fetchPositions();
    } catch (err) {
      console.error('Error seeding positions:', err);
      toast.error('Failed to add default positions');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-sky-600 font-medium">Position Management</p>
            <h1 className="text-3xl font-bold text-slate-800">Positions</h1>
          </div>
        </div>
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500">Loading positions...</p>
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
          <p className="text-sm text-sky-600 font-medium">Position Management</p>
          <h1 className="text-3xl font-bold text-slate-800">Positions</h1>
        </div>
        <div className="flex gap-2">
          {positions.length === 0 && (
            <Button
              variant="outline"
              onClick={seedDefaultPositions}
              className="border-sky-200 text-sky-600 hover:bg-sky-50"
            >
              <Award className="w-4 h-4 mr-2" />
              Add Default SSLG Positions
            </Button>
          )}
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        </div>
      </div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-sky-50/50 border-b border-slate-100">
          <CardTitle className="text-slate-800">All Positions ({positions.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-12 text-slate-600 font-semibold">#</TableHead>
                <TableHead className="text-slate-600 font-semibold">Position Name</TableHead>
                <TableHead className="text-slate-600 font-semibold">Description</TableHead>
                <TableHead className="text-slate-600 font-semibold">Max Votes</TableHead>
                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                <TableHead className="text-right text-slate-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Award className="w-12 h-12 text-slate-300" />
                      <p className="font-medium">No positions found</p>
                      <p className="text-sm">Click "Add Default SSLG Positions" to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((position, index) => (
                  <TableRow key={position.id} className="hover:bg-sky-50/50 transition-colors">
                    <TableCell className="text-slate-500">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-slate-300" />
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{position.name}</TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">
                      {position.description || "-"}
                    </TableCell>
                    <TableCell className="text-slate-600">{position.max_votes}</TableCell>
                    <TableCell>
                      <Badge className={position.is_active 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0" 
                        : "bg-slate-200 text-slate-600"
                      }>
                        {position.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(position)}
                          className="h-8 w-8 p-0 hover:bg-sky-100 hover:text-sky-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(position.id)}
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
              {editingPosition ? 'Edit Position' : 'Add New Position'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Position Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., President, Vice President"
                required
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter position description"
                rows={2}
                className="border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_votes" className="text-slate-700">Max Votes</Label>
                <Input
                  id="max_votes"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.max_votes}
                  onChange={(e) => setFormData({ ...formData, max_votes: parseInt(e.target.value) || 1 })}
                  className="border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-slate-700">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min={0}
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="border-slate-200"
                />
              </div>
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
                Active Position
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
                {editingPosition ? 'Update Position' : 'Add Position'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
