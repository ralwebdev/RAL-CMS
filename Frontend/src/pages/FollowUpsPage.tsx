import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { FollowUp, FollowUpType, Lead } from "@/lib/types";
import { MASTER_FOLLOWUP_TYPES } from "@/lib/master-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarClock, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("crm_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [fuRes, leadsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/followups`, { headers }),
        axios.get(`${API_URL}/api/leads`, { headers }),
        axios.get(`${API_URL}/api/users`, { headers })
      ]);
      setFollowUps(fuRes.data.map((f: any) => ({ ...f, id: f._id })));
      setLeads(leadsRes.data.map((l: any) => ({ ...l, id: l._id })));
      setUsers(usersRes.data.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch follow-ups");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [form, setForm] = useState({ leadId: "", assignedTo: "", date: "", time: "", notes: "", followUpType: "" as FollowUpType | "" });

  const handleCreate = async () => {
    try {
      const newFUBody = {
        leadId: form.leadId,
        assignedTo: form.assignedTo,
        date: form.date,
        notes: form.notes,
        completed: false,
        followUpType: (form.followUpType as FollowUpType) || undefined,
        followUpTime: form.time || undefined,
      };

      const token = localStorage.getItem("crm_token");
      const { data } = await axios.post(`${API_URL}/api/followups`, newFUBody, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFollowUps(prev => [...prev, { ...data, id: data._id }]);
      setForm({ leadId: "", assignedTo: "", date: "", time: "", notes: "", followUpType: "" });
      setOpen(false);
      toast.success("Follow-up scheduled");
    } catch (error) {
      console.error("Error creating follow-up:", error);
      toast.error("Failed to schedule follow-up");
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const fu = followUps.find(f => f.id === id);
      if (!fu) return;

      const token = localStorage.getItem("crm_token");
      await axios.put(`${API_URL}/api/followups/${id}`, { completed: !fu.completed }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFollowUps(prev => prev.map((f) => (f.id === id ? { ...f, completed: !f.completed } : f)));
      toast.success(fu.completed ? "Marked as pending" : "Marked as completed");
    } catch (error) {
      console.error("Error updating follow-up:", error);
      toast.error("Failed to update follow-up");
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = followUps.filter((f) => !f.completed && f.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const overdue = followUps.filter((f) => !f.completed && f.date < today);
  const completed = followUps.filter((f) => f.completed);

  const renderList = (items: FollowUp[], label: string, emptyText: string) => (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label} ({items.length})</h3>
      {items.length === 0 && <p className="text-sm text-muted-foreground">{emptyText}</p>}
      <div className="space-y-2">
        {items.map((f) => {
          const lead = (typeof f.leadId === 'object' && f.leadId) ? { ...(f.leadId as any), id: (f.leadId as any)._id } : leads.find((l) => l.id === f.leadId);
          const user = typeof f.assignedTo === 'object' && f.assignedTo ? { ...(f.assignedTo as any), id: (f.assignedTo as any)._id } : users.find((u) => u.id === f.assignedTo);
          return (
            <div key={f.id} className={cn("flex items-start gap-3 rounded-lg border p-3 transition-colors", f.completed && "opacity-60")}>
              <button onClick={() => toggleComplete(f.id)} className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors", f.completed ? "border-success bg-success" : "border-input hover:border-primary")}>
                {f.completed && <Check className="h-3 w-3 text-success-foreground" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{lead?.name || "Unknown User"}</p>
                <p className="text-xs text-muted-foreground">{f.notes}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{f.date}{f.followUpTime ? ` at ${f.followUpTime}` : ""}</span>
                  {f.followUpType && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px]">{f.followUpType}</span>}
                  {user && <span>→ {user.name}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Follow-ups</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Track and manage lead follow-ups</p>
        </div>
        {(currentUser?.role === "admin" || currentUser?.role === "owner") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Schedule Follow-up</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Follow-up</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Lead</Label>
                  <Select value={form.leadId} onValueChange={(v) => setForm({ ...form, leadId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                    <SelectContent>{leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assign To</Label>
                  <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Follow-up Type</Label>
                  <Select value={form.followUpType} onValueChange={(v) => setForm({ ...form, followUpType: v as FollowUpType })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{MASTER_FOLLOWUP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
                <Button onClick={handleCreate} className="w-full" disabled={!form.leadId || !form.date}>Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-xl bg-card p-5 shadow-card">
          {renderList(overdue, "Overdue", "No overdue follow-ups")}
        </div>
        <div className="rounded-xl bg-card p-5 shadow-card">
          {renderList(upcoming, "Upcoming", "No upcoming follow-ups")}
        </div>
        <div className="rounded-xl bg-card p-5 shadow-card">
          {renderList(completed, "Completed", "No completed follow-ups")}
        </div>
      </div>
    </div>
  );
}
