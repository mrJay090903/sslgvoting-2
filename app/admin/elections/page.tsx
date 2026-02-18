"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: "draft" | "open" | "closed";
  allow_abstain: boolean;
  created_at: string;
}

const emptyForm = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  allow_abstain: false,
};

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setElections(data);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditingElection(null);
    setFormData({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (election: Election) => {
    setEditingElection(election);
    setFormData({
      title: election.title,
      description: election.description || "",
      // datetime-local requires format: "YYYY-MM-DDTHH:mm"
      start_date: election.start_date ? election.start_date.slice(0, 16) : "",
      end_date: election.end_date ? election.end_date.slice(0, 16) : "",
      allow_abstain: election.allow_abstain,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    if (editingElection) {
      // Update existing election
      const { error } = await supabase
        .from("elections")
        .update({
          title: formData.title,
          description: formData.description || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          allow_abstain: formData.allow_abstain,
        })
        .eq("id", editingElection.id);

      if (error) {
        toast.error("Failed to update election");
      } else {
        toast.success("Election updated");
        await fetchElections();
        resetForm();
      }
    } else {
      // Create new election
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("elections").insert({
        title: formData.title,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: "draft",
        allow_abstain: formData.allow_abstain,
        created_by: user?.id,
      });

      if (error) {
        toast.error("Failed to create election");
      } else {
        toast.success("Election created");
        await fetchElections();
        resetForm();
      }
    }
  };

  const handleDelete = async (election: Election) => {
    if (election.status === "open") {
      toast.error("Cannot delete an open election. Close it first.");
      return;
    }
    if (!confirm(`Delete election "${election.title}"? This cannot be undone.`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("elections").delete().eq("id", election.id);

    if (error) {
      toast.error("Failed to delete election");
    } else {
      toast.success("Election deleted");
      await fetchElections();
    }
  };

  const handleStatusChange = async (id: string, newStatus: "open" | "closed") => {
    const supabase = createClient();
    
    // If opening an election, close all other elections first
    if (newStatus === "open") {
      await supabase
        .from("elections")
        .update({ status: "closed" })
        .neq("id", id)
        .eq("status", "open");
    }

    const { error } = await supabase
      .from("elections")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      await fetchElections();
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingElection(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div>Loading elections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Elections</h1>
          <p className="text-muted-foreground">Create and manage elections</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Election
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Elections ({elections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No elections found
                  </TableCell>
                </TableRow>
              ) : (
                elections.map((election) => (
                  <TableRow key={election.id}>
                    <TableCell className="font-medium">{election.title}</TableCell>
                    <TableCell>{new Date(election.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(election.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          election.status === "open"
                            ? "default"
                            : election.status === "draft"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          election.status === "open"
                            ? "bg-green-600"
                            : election.status === "closed"
                            ? "bg-gray-600"
                            : ""
                        }
                      >
                        {election.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {election.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(election.id, "open")}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                      )}
                      {election.status === "open" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(election.id, "closed")}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Close
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/admin/elections/${election.id}/results`, "_blank")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Results
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(election)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(election)}
                        className="hover:bg-red-100 hover:text-red-600"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingElection ? "Edit Election" : "Create New Election"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Election Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., SSLG Election 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the election"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allow_abstain"
                checked={formData.allow_abstain}
                onChange={(e) => setFormData({ ...formData, allow_abstain: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="allow_abstain" className="cursor-pointer">
                Allow abstain votes
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">{editingElection ? "Save Changes" : "Create Election"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
