"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Partylist {
  id: string;
  name: string;
  acronym: string | null;
  description: string | null;
  color: string;
  is_active: boolean;
}

export default function PartylistsPage() {
  const [partylists, setPartylists] = useState<Partylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartylist, setEditingPartylist] = useState<Partylist | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    acronym: "",
    description: "",
    color: "#0066CC",
    is_active: true,
  });

  useEffect(() => {
    fetchPartylists();
  }, []);

  const fetchPartylists = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("partylists")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPartylists(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    if (editingPartylist) {
      const { error } = await supabase
        .from("partylists")
        .update({
          name: formData.name,
          acronym: formData.acronym || null,
          description: formData.description || null,
          color: formData.color,
          is_active: formData.is_active,
        })
        .eq("id", editingPartylist.id);

      if (!error) {
        await fetchPartylists();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("partylists").insert({
        name: formData.name,
        acronym: formData.acronym || null,
        description: formData.description || null,
        color: formData.color,
        is_active: formData.is_active,
      });

      if (!error) {
        await fetchPartylists();
        resetForm();
      }
    }
  };

  const handleEdit = (partylist: Partylist) => {
    setEditingPartylist(partylist);
    setFormData({
      name: partylist.name,
      acronym: partylist.acronym || "",
      description: partylist.description || "",
      color: partylist.color,
      is_active: partylist.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partylist?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("partylists").delete().eq("id", id);

    if (!error) {
      await fetchPartylists();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      acronym: "",
      description: "",
      color: "#0066CC",
      is_active: true,
    });
    setEditingPartylist(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div>Loading partylists...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partylists</h1>
          <p className="text-muted-foreground">Manage political parties</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Partylist
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Partylists ({partylists.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Acronym</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partylists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No partylists found
                  </TableCell>
                </TableRow>
              ) : (
                partylists.map((partylist) => (
                  <TableRow key={partylist.id}>
                    <TableCell className="font-medium">{partylist.name}</TableCell>
                    <TableCell>{partylist.acronym || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: partylist.color }}
                        ></div>
                        <span className="text-sm font-mono">{partylist.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={partylist.is_active ? "default" : "secondary"}>
                        {partylist.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(partylist)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(partylist.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPartylist ? "Edit Partylist" : "Add New Partylist"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partylist Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., United Student Alliance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acronym">Acronym</Label>
              <Input
                id="acronym"
                value={formData.acronym}
                onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                placeholder="e.g., USA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Party Color *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                  required
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#0066CC"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active Partylist
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPartylist ? "Update" : "Create"} Partylist
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
