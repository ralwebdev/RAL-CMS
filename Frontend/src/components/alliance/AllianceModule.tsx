/**
 * Industry Alliances Module — main UI.
 * Mounted inside InstitutionalSalesPage as additional tabs and used by
 * dedicated alliance manager + executive dashboards.
 *
 * Encapsulates Phases 1-5: CRUD, dashboards, automation, reports/export.
 */
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  downloadCSV, allianceUsers,
  fetchInstitutions, fetchVisits, fetchProposals,
  createInstitutionApi, updateInstitutionApi, createVisitApi, createProposalApi, updateProposalApi,
  createTaskApi, updateTaskApi, createEventApi, createExpenseApi, updateExpenseApi,
  fetchContacts, fetchTasks, fetchEvents, fetchExpenses, submitApprovalApi,
  fetchAllianceUsersApi, createContactApi
} from "@/lib/alliance-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PIPELINE_STAGES, INSTITUTION_TYPES, BOARD_UNIVERSITIES, VISIT_INTEREST_LEVELS,
  VISIT_STATUSES, TASK_STATUSES, TASK_PRIORITIES, PROPOSAL_TYPES, PROPOSAL_STATUSES,
  EVENT_TYPES, EXPENSE_TYPES, EXPENSE_STATUSES, computePriority,
} from "@/lib/alliance-types";
import type {
  Institution, AllianceContact, AllianceVisit, AllianceTask, AllianceProposal,
  AllianceEvent, AllianceExpense, AlliancePipelineStage, TaskStatus,
} from "@/lib/alliance-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/StatCard";
import { DataTable, FormEngine, StatusPill, ActivityTimeline } from "@/components/alliance/AllianceUI";
import type { ColumnDef, FieldConfig, ActivityItem } from "@/components/alliance/AllianceUI";
import { ApprovalCenter } from "@/components/alliance/ApprovalCenter";
import { approvalStore } from "@/lib/approvals";
import {
  Building2, Users, Calendar, ListChecks, FileText, PartyPopper, Receipt,
  BarChart3, Plus, AlertTriangle, Download, TrendingUp, MapPin, ShieldCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { toast } from "sonner";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--info))", "hsl(280, 60%, 55%)", "hsl(180, 60%, 45%)"];

// ── Helpers ──
function daysBetween(a: string, b: string) {
  return Math.floor((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}
function todayIso() { return new Date().toISOString().split("T")[0]; }
function getStrId(val: any): string {
  if (typeof val === 'object' && val !== null) return val.id || val._id || String(val);
  return String(val || "");
}

// ── Field configs (closed-ended) ──
const executiveOptions = allianceUsers.filter(u => u.role === "alliance_executive").map((u) => u.name);
const userIdByLabel = (label: string, users: any[]) => users.find((u) => u.name === label)?.id ?? "";
const userLabelById = (id: string, users: any[]) => users.find((u) => u.id === id)?.name ?? id;

const institutionFields: FieldConfig[] = [
  { key: "name", label: "Institution Name", type: "text", required: true, placeholder: "e.g. Delhi Public School" },
  { key: "type", label: "Type", type: "select", options: INSTITUTION_TYPES, required: true },
  { key: "boardUniversity", label: "Board / University", type: "select", options: BOARD_UNIVERSITIES, required: true },
  { key: "city", label: "City", type: "text", required: true },
  { key: "district", label: "District", type: "text", required: true },
  { key: "address", label: "Address", type: "text", required: true, colSpan: 2 },
  { key: "studentStrength", label: "Student Strength", type: "number", required: true },
  { key: "decisionMaker", label: "Decision Maker", type: "text" },
  { key: "phone", label: "Phone", type: "phone", required: true },
  { key: "email", label: "Email", type: "email" },
  { key: "assignedTo", label: "Assign Executive", type: "select", options: executiveOptions, required: true },
  { key: "pipelineStage", label: "Pipeline Stage", type: "select", options: PIPELINE_STAGES, required: true },
  { key: "notes", label: "Notes", type: "textarea", colSpan: 2 },
];

interface AllianceModuleProps {
  scope: "manager" | "executive";
  executiveId?: string;
  initialTab?: string;
  initialAction?: string;
  initialStageFilter?: string;
  initialDistrictFilter?: string;
}

export function AllianceModule({ scope, executiveId, initialTab, initialAction, initialStageFilter, initialDistrictFilter }: AllianceModuleProps) {
  const { currentUser } = useAuth();
  const validTabs = ["institutions", "contacts", "visits", "tasks", "proposals", "events", "expenses", "approvals", "reports"];
  const [tab, setTab] = useState(validTabs.includes(initialTab ?? "") ? (initialTab as string) : "institutions");
  const [stageFilter, setStageFilter] = useState<string>(initialStageFilter ?? "all");
  const [districtFilter, setDistrictFilter] = useState<string>(initialDistrictFilter ?? "all");

  // dialog state
  const [editInstitution, setEditInstitution] = useState<Institution | null>(null);
  const [showInstForm, setShowInstForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [drillInstitution, setDrillInstitution] = useState<Institution | null>(null);

  // Auto-open create form based on URL action param
  useEffect(() => {
    if (initialAction !== "new") return;
    if (initialTab === "visits") setShowVisitForm(true);
    else if (initialTab === "tasks") setShowTaskForm(true);
    else if (initialTab === "proposals") setShowProposalForm(true);
    else if (initialTab === "events") setShowEventForm(true);
    else if (initialTab === "expenses") setShowExpenseForm(true);
    else if (initialTab === "institutions" && scope === "manager") setShowInstForm(true);
  }, [initialAction, initialTab, scope]);

  const queryClient = useQueryClient();

  // ── Queries ──
  const instQuery = useQuery({ queryKey: ['institutions'], queryFn: fetchInstitutions });
  const visitsQuery = useQuery({ queryKey: ['visits'], queryFn: fetchVisits });
  const proposalsQuery = useQuery({ queryKey: ['proposals'], queryFn: fetchProposals });
  const contactsQuery = useQuery({ queryKey: ['contacts'], queryFn: fetchContacts });
  const tasksQuery = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });
  const eventsQuery = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
  const expensesQuery = useQuery({ queryKey: ['expenses'], queryFn: fetchExpenses });
  const usersQuery = useQuery({ queryKey: ['alliance-users'], queryFn: fetchAllianceUsersApi });

  const isLoading = instQuery.isLoading || visitsQuery.isLoading || proposalsQuery.isLoading || usersQuery.isLoading;
  const users = useMemo(() => usersQuery.data || [], [usersQuery.data]);
  const execOptions = useMemo(() => users.filter(u => u.role === "alliance_executive").map(u => u.name), [users]);

  const data = useMemo(() => {
    const allInst = instQuery.data || [];
    const allTasks = tasksQuery.data || [];
    const allVisits = visitsQuery.data || [];
    const allProposals = proposalsQuery.data || [];
    const allEvents = eventsQuery.data || [];
    const allExpenses = expensesQuery.data || [];
    const allContacts = contactsQuery.data || [];

    let inst = allInst;
    if (stageFilter !== "all") inst = inst.filter((i) => i.pipelineStage === stageFilter);
    if (districtFilter !== "all") inst = inst.filter((i) => i.district === districtFilter);
    
    const instIds = new Set(inst.map((i) => i.id));
    return {
      institutions: inst,
      tasks: allTasks.filter((t) => instIds.has(getStrId(t.institutionId))),
      visits: allVisits.filter((v) => instIds.has(getStrId(v.institutionId))),
      proposals: allProposals.filter((p) => instIds.has(getStrId(p.institutionId))),
      events: allEvents.filter((e) => instIds.has(getStrId(e.institutionId))),
      expenses: allExpenses.filter((e) => instIds.has(getStrId(e.institutionId))),
      contacts: allContacts.filter((c) => instIds.has(getStrId(c.institutionId))),
    };
  }, [instQuery.data, visitsQuery.data, proposalsQuery.data, tasksQuery.data, eventsQuery.data, expensesQuery.data, contactsQuery.data, stageFilter, districtFilter]);

  // ── KPIs ──
  const totalInstitutions = data.institutions.length;
  const meetingsThisMonth = data.visits.filter((v) => new Date(v.visitDate).getMonth() === new Date().getMonth() && v.status === "Completed").length;
  const proposalsSent = data.proposals.filter((p) => p.status !== "Draft").length;
  const mousClosed = data.institutions.filter((i) => i.pipelineStage === "MoU Signed" || i.pipelineStage === "Program Launched").length;
  const overdueTasks = data.tasks.filter((t) => t.status === "Overdue").length;
  const pendingFollowups = data.visits.filter((v) => v.nextFollowup && v.nextFollowup >= todayIso() && v.status === "Completed").length;

  // ── Automations / Alerts ──
  const alerts = useMemo(() => {
    const list: { id: string; severity: "warning" | "danger"; message: string }[] = [];
    // Overdue followups (>7 days since visit, no proposal sent)
    data.visits.forEach((v) => {
      if (v.status === "Completed" && daysBetween(todayIso(), v.visitDate) > 7) {
        const inst = data.institutions.find((i) => i.id === v.institutionId);
        const hasProposal = data.proposals.some((p) => p.institutionId === v.institutionId && p.status !== "Draft");
        if (!hasProposal && inst) {
          list.push({ id: `ovf-${v.id}`, severity: "warning", message: `Overdue follow-up: ${inst.name} (${daysBetween(todayIso(), v.visitDate)}d since last visit, no proposal)` });
        }
      }
    });
    // ≥3 meetings, no proposal
    data.institutions.forEach((inst) => {
      const meetingCount = data.visits.filter((v) => v.institutionId === inst.id && v.status === "Completed").length;
      const hasProposal = data.proposals.some((p) => p.institutionId === inst.id && p.status !== "Draft");
      if (meetingCount >= 3 && !hasProposal) {
        list.push({ id: `npp-${inst.id}`, severity: "danger", message: `${inst.name} has ${meetingCount} meetings but no proposal sent.` });
      }
    });
    // Overdue tasks
    if (overdueTasks > 0) list.push({ id: "ovt", severity: "danger", message: `${overdueTasks} task${overdueTasks === 1 ? "" : "s"} overdue.` });
    return list;
  }, [data, overdueTasks]);

  // ── Pipeline funnel data ──
  const pipelineData = useMemo(() => PIPELINE_STAGES.map((s) => ({
    stage: s,
    count: data.institutions.filter((i) => i.pipelineStage === s).length,
  })), [data.institutions]);

  // Monthly visits trend
  const monthlyVisits = useMemo(() => {
    const buckets: Record<string, number> = {};
    data.visits.forEach((v) => {
      const k = v.visitDate.slice(0, 7);
      buckets[k] = (buckets[k] ?? 0) + 1;
    });
    return Object.entries(buckets).sort().map(([month, count]) => ({ month, count }));
  }, [data.visits]);

  // Top executives
  const execLeaderboard = useMemo(() => {
    const m: Record<string, { meetings: number; mous: number; revenue: number }> = {};
    const executives = allianceUsers.filter(u => u.role === "alliance_executive");
    executives.forEach((u) => { m[u.id] = { meetings: 0, mous: 0, revenue: 0 }; });
    data.visits.forEach((v) => { if (v.status === "Completed" && m[getStrId(v.executiveId)]) m[getStrId(v.executiveId)].meetings += 1; });
    data.institutions.forEach((i) => {
      const assignedId = getStrId(i.assignedTo);
      if ((i.pipelineStage === "MoU Signed" || i.pipelineStage === "Program Launched") && m[assignedId]) m[assignedId].mous += 1;
      const approved = data.proposals.filter((p) => getStrId(p.institutionId) === i.id && p.status === "Approved");
      if (m[assignedId]) m[assignedId].revenue += approved.reduce((s, p) => s + p.amount, 0);
    });
    return executives.map((u) => ({ name: u.name, ...m[u.id] }));
  }, [data]);

  // ── Mutations ──
  const instMutation = useMutation({
    mutationFn: ({ id, data }: { id?: string; data: any }) => id ? updateInstitutionApi(id, data) : createInstitutionApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast.success(editInstitution ? "Institution updated." : "Institution saved.");
      setShowInstForm(false);
      setEditInstitution(null);
    }
  });

  const visitMutation = useMutation({
    mutationFn: createVisitApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast.success("Visit logged.");
      setShowVisitForm(false);
    }
  });

  const proposalMutation = useMutation({
    mutationFn: ({ id, data }: { id?: string; data: any }) => id ? updateProposalApi(id, data) : createProposalApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success("Proposal updated.");
      setShowProposalForm(false);
    }
  });

  const taskMutation = useMutation({
    mutationFn: ({ id, data }: { id?: string; data: any }) => id ? updateTaskApi(id, data) : createTaskApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(showTaskForm ? "Task created." : "Task updated.");
      setShowTaskForm(false);
    }
  });

  const eventMutation = useMutation({
    mutationFn: createEventApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event captured.");
      setShowEventForm(false);
    }
  });

  const approvalMutation = useMutation({
    mutationFn: submitApprovalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    }
  });

  const expenseMutation = useMutation({
    mutationFn: createExpenseApi,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // Automatically submit for approval
      approvalMutation.mutate({
        requestId: data.id,
        requestType: "Expense Bill",
        title: `${data.category} ₹${data.amount} — ${currentUser?.name}`,
        amount: data.amount,
        priority: "Medium",
        notes: data.description || data.notes,
      });
      toast.success("Expense logged & submitted for approval.");
      setShowExpenseForm(false);
    }
  });

  const saveInstitution = (vals: Record<string, unknown>) => {
    const studentStrength = Number(vals.studentStrength) || 0;
    const assignedToId = userIdByLabel(String(vals.assignedTo), users);
    const payload = {
      ...vals,
      studentStrength,
      assignedTo: assignedToId,
      assignedExecutiveId: assignedToId,
    };
    instMutation.mutate({ id: editInstitution?.id, data: payload });
  };

  const updatePipelineStage = (instId: string, newStage: AlliancePipelineStage) => {
    instMutation.mutate({ id: instId, data: { pipelineStage: newStage } });
  };

  const saveVisit = (vals: Record<string, unknown>) => {
    const inst = data.institutions.find((i) => i.name === vals.institution);
    if (!inst) { toast.error("Select a valid institution."); return; }
    visitMutation.mutate({
      ...vals,
      institutionId: inst.id,
      executiveId: scope === "executive" && executiveId ? executiveId : userIdByLabel(String(vals.executive), users) || currentUser?.id,
    } as any);
  };

  const saveProposal = (vals: Record<string, unknown>) => {
    const inst = data.institutions.find((i) => i.name === vals.institution);
    if (!inst) { toast.error("Select an institution."); return; }
    proposalMutation.mutate({
      data: {
        ...vals,
        institutionId: inst.id,
      }
    });
  };

  const approveProposal = (id: string) => {
    proposalMutation.mutate({ id, data: { status: "Approved" } });
  };

  // Keep legacy handlers as dummies or simple logic for non-migrated parts
  const saveTask = (vals: Record<string, unknown>) => {
    const inst = data.institutions.find((i) => i.name === vals.institution);
    if (!inst) { toast.error("Select an institution."); return; }
    taskMutation.mutate({
      data: {
        ...vals,
        institutionId: inst.id,
        assignedTo: userIdByLabel(String(vals.assignedTo), users) || currentUser?.id
      }
    });
  };

  const toggleTaskStatus = (task: AllianceTask) => {
    const next: Record<string, TaskStatus> = { "Pending": "In Progress", "In Progress": "Done", "Done": "Pending", "Overdue": "In Progress" };
    taskMutation.mutate({ id: task.id, data: { status: next[task.status] || "Pending" } });
  };

  const saveEvent = (vals: Record<string, unknown>) => {
    const inst = data.institutions.find((i) => i.name === vals.institution);
    if (!inst) { toast.error("Select an institution."); return; }
    eventMutation.mutate({
      ...vals,
      institutionId: inst.id,
      attendees: Number(vals.attendees) || 0,
      leadsGenerated: Number(vals.leadsGenerated) || 0,
    } as any);
  };

  const saveExpense = (vals: Record<string, unknown>) => {
    const inst = data.institutions.find((i) => i.name === vals.institution);
    if (!inst) { toast.error("Select an institution."); return; }
    expenseMutation.mutate({
      ...vals,
      institutionId: inst.id,
      amount: Number(vals.amount) || 0,
      executiveId: scope === "executive" && executiveId ? executiveId : userIdByLabel(String(vals.executive), users) || currentUser?.id,
    } as any);
  };

  const contactMutation = useMutation({
    mutationFn: createContactApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success("Contact saved.");
      setShowContactForm(false);
    }
  });

  const saveContact = (vals: Record<string, unknown>) => {
    const inst = data.institutions.find((i) => i.name === vals.institution);
    if (!inst) { toast.error("Select an institution."); return; }
    contactMutation.mutate({
      ...vals,
      institutionId: inst.id,
    } as any);
  };

  // ── Column defs ──
  const institutionColumns: ColumnDef<Institution>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[10px] text-muted-foreground">{r.institutionId}</span>, hideOnMobile: true },
    { key: "name", header: "Institution", render: (r) => (
      <div>
        <p className="font-medium">{r.name}</p>
        <p className="text-[10px] text-muted-foreground">{r.type} · {r.city}</p>
      </div>
    ) },
    { key: "stage", header: "Stage", render: (r) => (
      <Select value={r.pipelineStage} onValueChange={(v) => updatePipelineStage(r.id, v as AlliancePipelineStage)}>
        <SelectTrigger className="h-7 w-36 text-[10px]"><SelectValue /></SelectTrigger>
        <SelectContent>{PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>
    ) },
    { key: "priority", header: "Priority", render: (r) => <StatusPill value={r.priority} />, hideOnMobile: true },
    { key: "students", header: "Students", render: (r) => <span className="font-medium">{r.studentStrength.toLocaleString()}</span>, hideOnMobile: true },
    { key: "exec", header: "Executive", render: (r) => <span className="text-xs">{userLabelById(getStrId(r.assignedTo), users)}</span>, hideOnMobile: true },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setDrillInstitution(r)}>View</Button>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setEditInstitution(r); setShowInstForm(true); }}>Edit</Button>
      </div>
    ) },
  ];

  const taskColumns: ColumnDef<AllianceTask>[] = [
    { key: "title", header: "Task", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "inst", header: "Institution", render: (r) => <span className="text-xs text-muted-foreground">{data.institutions.find((i) => i.id === getStrId(r.institutionId))?.name ?? "—"}</span>, hideOnMobile: true },
    { key: "due", header: "Due", render: (r) => <span className="text-xs whitespace-nowrap">{r.dueDate}</span> },
    { key: "priority", header: "Priority", render: (r) => <StatusPill value={r.priority} />, hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
    { key: "act", header: "", render: (r) => <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toggleTaskStatus(r)}>{r.status === "Done" ? "Reopen" : "Mark Done"}</Button> },
  ];

  const visitColumns: ColumnDef<AllianceVisit>[] = [
    { key: "date", header: "Date", render: (r) => <span className="text-xs whitespace-nowrap">{r.visitDate}</span> },
    { key: "inst", header: "Institution", render: (r) => <span className="font-medium text-xs">{data.institutions.find((i) => i.id === getStrId(r.institutionId))?.name ?? "—"}</span> },
    { key: "person", header: "Met With", render: (r) => <span className="text-xs">{r.meetingPerson}</span>, hideOnMobile: true },
    { key: "interest", header: "Interest", render: (r) => <StatusPill value={r.interestLevel} />, hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
    { key: "next", header: "Next Follow-up", render: (r) => <span className="text-xs text-muted-foreground">{r.nextFollowup || "—"}</span>, hideOnMobile: true },
  ];

  const proposalColumns: ColumnDef<AllianceProposal>[] = [
    { key: "inst", header: "Institution", render: (r) => <span className="font-medium text-xs">{data.institutions.find((i) => i.id === getStrId(r.institutionId))?.name ?? "—"}</span> },
    { key: "type", header: "Type", render: (r) => <Badge variant="outline" className="text-[9px]">{r.proposalType}</Badge>, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (r) => <span className="font-semibold text-success">₹{r.amount.toLocaleString()}</span> },
    { key: "sent", header: "Sent", render: (r) => <span className="text-xs whitespace-nowrap">{r.sentDate}</span>, hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
    { key: "act", header: "", render: (r) => scope === "manager" && (r.status === "Sent" || r.status === "Under Review") ? (
      <Button size="sm" className="h-7 text-[10px]" onClick={() => approveProposal(r.id)}>Approve</Button>
    ) : null },
  ];

  const eventColumns: ColumnDef<AllianceEvent>[] = [
    { key: "name", header: "Event", render: (r) => <span className="font-medium text-xs">{r.eventName}</span> },
    { key: "type", header: "Type", render: (r) => <Badge variant="outline" className="text-[9px]">{r.eventType}</Badge>, hideOnMobile: true },
    { key: "inst", header: "Institution", render: (r) => <span className="text-xs text-muted-foreground">{data.institutions.find((i) => i.id === getStrId(r.institutionId))?.name ?? "—"}</span>, hideOnMobile: true },
    { key: "date", header: "Date", render: (r) => <span className="text-xs whitespace-nowrap">{r.eventDate}</span> },
    { key: "att", header: "Attendees", render: (r) => <span className="text-xs">{r.attendees}</span>, hideOnMobile: true },
    { key: "leads", header: "Leads", render: (r) => <span className="font-semibold text-primary">{r.leadsGenerated}</span> },
  ];

  const expenseColumns: ColumnDef<AllianceExpense>[] = [
    { key: "date", header: "Date", render: (r) => <span className="text-xs whitespace-nowrap">{r.expenseDate}</span> },
    { key: "type", header: "Type", render: (r) => <Badge variant="outline" className="text-[9px]">{r.expenseType}</Badge> },
    { key: "exec", header: "Executive", render: (r) => <span className="text-xs">{userLabelById(getStrId(r.executiveId), users)}</span>, hideOnMobile: true },
    { key: "amount", header: "Amount", render: (r) => <span className="font-semibold">₹{r.amount.toLocaleString()}</span> },
    { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
  ];

  const contactColumns: ColumnDef<AllianceContact>[] = [
    { key: "name", header: "Name", render: (r) => <span className="font-medium text-xs">{r.name}</span> },
    { key: "designation", header: "Designation", render: (r) => <span className="text-xs">{r.designation}</span>, hideOnMobile: true },
    { key: "inst", header: "Institution", render: (r) => <span className="text-xs text-muted-foreground">{data.institutions.find((i) => i.id === getStrId(r.institutionId))?.name ?? "—"}</span> },
    { key: "phone", header: "Phone", render: (r) => <span className="text-xs">{r.phone}</span> },
    { key: "email", header: "Email", render: (r) => <span className="text-xs text-muted-foreground">{r.email}</span>, hideOnMobile: true },
  ];

  // ── Field configs for forms ──
  const visitFields: FieldConfig[] = [
    { key: "institution", label: "Institution", type: "select", options: data.institutions.map((i) => i.name), required: true },
    { key: "visitDate", label: "Visit Date", type: "date", required: true },
    { key: "meetingPerson", label: "Met With", type: "text", required: true },
    { key: "interestLevel", label: "Interest Level", type: "select", options: VISIT_INTEREST_LEVELS, required: true },
    { key: "status", label: "Status", type: "select", options: VISIT_STATUSES, required: true },
    { key: "nextFollowup", label: "Next Follow-up", type: "date" },
    ...(scope === "manager" ? [{ key: "executive", label: "Executive", type: "select" as const, options: execOptions, required: true }] : []),
    { key: "summary", label: "Summary", type: "textarea", required: true, colSpan: 2 },
  ];
  const contactFields: FieldConfig[] = [
    { key: "institution", label: "Institution", type: "select", options: data.institutions.map((i) => i.name), required: true },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "designation", label: "Designation", type: "text", required: true },
    { key: "phone", label: "Phone", type: "phone", required: true },
    { key: "email", label: "Email", type: "email" },
  ];
  const taskFields: FieldConfig[] = [
    { key: "title", label: "Task Title", type: "text", required: true, colSpan: 2 },
    { key: "institution", label: "Institution", type: "select", options: data.institutions.map((i) => i.name) },
    { key: "dueDate", label: "Due Date", type: "date", required: true },
    { key: "priority", label: "Priority", type: "select", options: TASK_PRIORITIES, required: true },
    ...(scope === "manager" ? [{ key: "assignedTo", label: "Assign To", type: "select" as const, options: execOptions, required: true }] : []),
  ];
  const proposalFields: FieldConfig[] = [
    { key: "institution", label: "Institution", type: "select", options: data.institutions.map((i) => i.name), required: true },
    { key: "proposalType", label: "Type", type: "select", options: PROPOSAL_TYPES, required: true },
    { key: "amount", label: "Amount (₹)", type: "number", required: true },
    { key: "status", label: "Status", type: "select", options: PROPOSAL_STATUSES, required: true },
    { key: "sentDate", label: "Sent Date", type: "date", required: true },
    { key: "notes", label: "Notes", type: "textarea", colSpan: 2 },
  ];
  const eventFields: FieldConfig[] = [
    { key: "eventName", label: "Event Name", type: "text", required: true, colSpan: 2 },
    { key: "eventType", label: "Type", type: "select", options: EVENT_TYPES, required: true },
    { key: "institution", label: "Institution", type: "select", options: data.institutions.map((i) => i.name) },
    { key: "eventDate", label: "Date", type: "date", required: true },
    { key: "attendees", label: "Attendees", type: "number" },
    { key: "leadsGenerated", label: "Leads Generated", type: "number" },
    { key: "notes", label: "Notes", type: "textarea", colSpan: 2 },
  ];
  const expenseFields: FieldConfig[] = [
    { key: "expenseType", label: "Type", type: "select", options: EXPENSE_TYPES, required: true },
    { key: "amount", label: "Amount (₹)", type: "number", required: true },
    { key: "expenseDate", label: "Date", type: "date", required: true },
    { key: "institution", label: "Institution", type: "select", options: data.institutions.map((i) => i.name) },
    ...(scope === "manager" ? [{ key: "executive", label: "Executive", type: "select" as const, options: execOptions, required: true }] : []),
    { key: "notes", label: "Notes", type: "textarea", colSpan: 2 },
  ];

  // ── Activity timeline (recent events, visits, proposals) ──
  const recentActivity: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];
    data.visits.forEach((v) => {
      const inst = data.institutions.find((i) => i.id === v.institutionId);
      items.push({ id: `act-v-${v.id}`, title: `Visit logged: ${inst?.name ?? "Institution"}`, description: v.summary, timestamp: v.visitDate, badge: v.interestLevel });
    });
    data.proposals.forEach((p) => {
      const inst = data.institutions.find((i) => i.id === p.institutionId);
      items.push({ id: `act-p-${p.id}`, title: `${p.proposalType}: ${inst?.name ?? ""}`, description: `₹${p.amount.toLocaleString()} · ${p.status}`, timestamp: p.sentDate, badge: p.status });
    });
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 8);
  }, [data]);

  // ── Reports / Exports ──
  const exportInstitutions = () => downloadCSV("alliance_institutions.csv", data.institutions.map((i) => ({
    InstitutionID: i.institutionId, Name: i.name, Type: i.type, Board: i.boardUniversity, City: i.city, District: i.district,
    StudentStrength: i.studentStrength, Stage: i.pipelineStage, Priority: i.priority, Executive: userLabelById(i.assignedTo, users),
  })));
  const exportVisits = () => downloadCSV("alliance_visits.csv", data.visits.map((v) => ({
    Date: v.visitDate, Institution: data.institutions.find((i) => i.id === v.institutionId)?.name ?? "", Executive: userLabelById(v.executiveId, users),
    MetWith: v.meetingPerson, Interest: v.interestLevel, Status: v.status, NextFollowup: v.nextFollowup, Summary: v.summary,
  })));
  const exportProposals = () => downloadCSV("alliance_proposals.csv", data.proposals.map((p) => ({
    Institution: data.institutions.find((i) => i.id === p.institutionId)?.name ?? "", Type: p.proposalType, Amount: p.amount, Status: p.status, SentDate: p.sentDate,
  })));
  const exportExpenses = () => downloadCSV("alliance_expenses.csv", data.expenses.map((e) => ({
    Date: e.expenseDate, Executive: userLabelById(e.executiveId, users), Type: e.expenseType, Amount: e.amount, Status: e.status,
    Institution: data.institutions.find((i) => i.id === e.institutionId)?.name ?? "",
  })));

  // Conversion metrics
  const conversionRate = totalInstitutions > 0 ? Math.round((mousClosed / totalInstitutions) * 100) : 0;
  const proposalSuccessRate = data.proposals.length > 0 ? Math.round((data.proposals.filter((p) => p.status === "Approved").length / data.proposals.length) * 100) : 0;
  const totalRevenueForecast = data.proposals.filter((p) => p.status === "Approved" || p.status === "Under Review").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── KPI Snapshot ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Institutions" value={totalInstitutions} icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Meetings (mth)" value={meetingsThisMonth} icon={<Calendar className="h-5 w-5" />} />
        <StatCard title="Proposals" value={proposalsSent} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="MoUs Closed" value={mousClosed} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Pending Tasks" value={data.tasks.filter((t) => t.status !== "Done").length} icon={<ListChecks className="h-5 w-5" />} />
        <StatCard title="Overdue" value={overdueTasks} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <div className="rounded-xl bg-card p-4 shadow-card border-l-4 border-warning">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h4 className="text-sm font-semibold text-card-foreground">Active Alerts ({alerts.length})</h4>
          </div>
          <ul className="space-y-1.5">
            {alerts.slice(0, 5).map((a) => (
              <li key={a.id} className={`text-xs ${a.severity === "danger" ? "text-destructive" : "text-warning"}`}>• {a.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="overflow-x-auto flex-nowrap w-full justify-start">
          <TabsTrigger value="institutions" className="text-[11px] sm:text-xs"><Building2 className="mr-1 h-3.5 w-3.5" />{scope === "executive" ? "My Institutions" : "Institutions"}</TabsTrigger>
          <TabsTrigger value="contacts" className="text-[11px] sm:text-xs"><Users className="mr-1 h-3.5 w-3.5" />Contacts</TabsTrigger>
          <TabsTrigger value="visits" className="text-[11px] sm:text-xs"><Calendar className="mr-1 h-3.5 w-3.5" />Visits</TabsTrigger>
          <TabsTrigger value="tasks" className="text-[11px] sm:text-xs"><ListChecks className="mr-1 h-3.5 w-3.5" />Tasks</TabsTrigger>
          <TabsTrigger value="proposals" className="text-[11px] sm:text-xs"><FileText className="mr-1 h-3.5 w-3.5" />Proposals</TabsTrigger>
          <TabsTrigger value="events" className="text-[11px] sm:text-xs"><PartyPopper className="mr-1 h-3.5 w-3.5" />Events</TabsTrigger>
          <TabsTrigger value="expenses" className="text-[11px] sm:text-xs"><Receipt className="mr-1 h-3.5 w-3.5" />Expenses</TabsTrigger>
          <TabsTrigger value="approvals" className="text-[11px] sm:text-xs"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Approvals</TabsTrigger>
          <TabsTrigger value="reports" className="text-[11px] sm:text-xs"><BarChart3 className="mr-1 h-3.5 w-3.5" />Reports</TabsTrigger>
        </TabsList>

        {/* ── Institutions ── */}
        <TabsContent value="institutions" className="space-y-4 mt-4">
          {/* Active filter banner */}
          {(stageFilter !== "all" || districtFilter !== "all") && (
            <div className="rounded-lg bg-info/5 border-l-4 border-l-info px-3 py-2 flex items-center justify-between gap-3 text-xs">
              <span className="text-card-foreground">
                Filtered by:{" "}
                {stageFilter !== "all" && <Badge variant="outline" className="text-[10px] mr-1">Stage: {stageFilter}</Badge>}
                {districtFilter !== "all" && <Badge variant="outline" className="text-[10px]">District: {districtFilter}</Badge>}
                <span className="text-muted-foreground ml-2">{data.institutions.length} match{data.institutions.length === 1 ? "" : "es"}</span>
              </span>
              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { setStageFilter("all"); setDistrictFilter("all"); }}>Clear</Button>
            </div>
          )}
          {/* Pipeline funnel — clickable bars filter institutions by stage */}
          <div className="rounded-xl bg-card p-4 sm:p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pipeline Funnel</h4>
              <span className="text-[10px] text-muted-foreground italic">Click a stage to filter</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(d: { stage?: string }) => d?.stage && setStageFilter(d.stage)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <DataTable
            data={data.institutions}
            columns={institutionColumns}
            searchable={(r) => `${r.name} ${r.city} ${r.type} ${r.boardUniversity}`}
            onRowClick={(r) => setDrillInstitution(r)}
            searchPlaceholder="Search institutions, cities, boards…"
            emptyMessage={stageFilter !== "all" || districtFilter !== "all" ? "No institutions match the current filters." : "No institutions yet. Add your first high-potential account."}
            toolbar={<Button size="sm" onClick={() => { setEditInstitution(null); setShowInstForm(true); }}><Plus className="mr-1 h-4 w-4" /> Add Institution</Button>}
          />
        </TabsContent>

        {/* ── Contacts ── */}
        <TabsContent value="contacts" className="mt-4">
          <DataTable 
            data={data.contacts} 
            columns={contactColumns} 
            searchable={(r) => `${r.name} ${r.designation} ${r.email}`} 
            searchPlaceholder="Search contacts…" 
            toolbar={<Button size="sm" onClick={() => setShowContactForm(true)}><Plus className="mr-1 h-4 w-4" /> Add Contact</Button>}
          />
        </TabsContent>

        {/* ── Visits ── */}
        <TabsContent value="visits" className="mt-4">
          <DataTable
            data={data.visits}
            columns={visitColumns}
            searchable={(r) => `${r.meetingPerson} ${r.summary}`}
            searchPlaceholder="Search visits…"
            toolbar={<Button size="sm" onClick={() => setShowVisitForm(true)}><Plus className="mr-1 h-4 w-4" /> Log Visit</Button>}
          />
        </TabsContent>

        {/* ── Tasks ── */}
        <TabsContent value="tasks" className="mt-4">
          <DataTable
            data={data.tasks}
            columns={taskColumns}
            searchable={(r) => r.title}
            searchPlaceholder="Search tasks…"
            toolbar={<Button size="sm" onClick={() => setShowTaskForm(true)}><Plus className="mr-1 h-4 w-4" /> Add Task</Button>}
          />
        </TabsContent>

        {/* ── Proposals ── */}
        <TabsContent value="proposals" className="mt-4">
          <DataTable
            data={data.proposals}
            columns={proposalColumns}
            searchable={(r) => r.proposalType + " " + r.notes}
            searchPlaceholder="Search proposals…"
            toolbar={<Button size="sm" onClick={() => setShowProposalForm(true)}><Plus className="mr-1 h-4 w-4" /> New Proposal</Button>}
          />
        </TabsContent>

        {/* ── Events ── */}
        <TabsContent value="events" className="mt-4">
          <DataTable
            data={data.events}
            columns={eventColumns}
            searchable={(r) => `${r.eventName} ${r.eventType}`}
            searchPlaceholder="Search events…"
            toolbar={<Button size="sm" onClick={() => setShowEventForm(true)}><Plus className="mr-1 h-4 w-4" /> Capture Event</Button>}
          />
        </TabsContent>

        {/* ── Expenses ── */}
        <TabsContent value="expenses" className="mt-4">
          <DataTable
            data={data.expenses}
            columns={expenseColumns}
            searchable={(r) => `${r.expenseType} ${r.notes}`}
            searchPlaceholder="Search expenses…"
            toolbar={<Button size="sm" onClick={() => setShowExpenseForm(true)}><Plus className="mr-1 h-4 w-4" /> Submit Expense</Button>}
          />
        </TabsContent>

        {/* ── Approvals ── */}
        <TabsContent value="approvals" className="mt-4">
          <ApprovalCenter />
        </TabsContent>

        {/* ── Reports / Insights ── */}
        <TabsContent value="reports" className="space-y-4 mt-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard title="Proposal Success" value={`${proposalSuccessRate}%`} icon={<FileText className="h-5 w-5" />} />
            <StatCard title="Revenue Forecast" value={`₹${(totalRevenueForecast / 1000).toFixed(0)}k`} icon={<BarChart3 className="h-5 w-5" />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Monthly Visits</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyVisits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h4 className="text-sm font-semibold text-card-foreground mb-3">Executive Leaderboard</h4>
              <div className="space-y-2">
                {execLeaderboard.sort((a, b) => b.mous - a.mous).map((u) => (
                  <div key={u.name} className="flex items-center justify-between rounded-lg border p-2.5 text-xs">
                    <span className="font-medium text-card-foreground">{u.name}</span>
                    <div className="flex gap-3 text-[10px]">
                      <span className="text-muted-foreground">Meetings: <span className="font-semibold text-card-foreground">{u.meetings}</span></span>
                      <span className="text-muted-foreground">MoUs: <span className="font-semibold text-success">{u.mous}</span></span>
                      <span className="text-muted-foreground">Revenue: <span className="font-semibold text-primary">₹{(u.revenue / 1000).toFixed(0)}k</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-semibold text-card-foreground">Export Reports</h4>
              <span className="text-[10px] text-muted-foreground">CSV downloads</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={exportInstitutions}><Download className="mr-1 h-3.5 w-3.5" /> Institutions</Button>
              <Button variant="outline" size="sm" onClick={exportVisits}><Download className="mr-1 h-3.5 w-3.5" /> Visits</Button>
              <Button variant="outline" size="sm" onClick={exportProposals}><Download className="mr-1 h-3.5 w-3.5" /> Proposals</Button>
              <Button variant="outline" size="sm" onClick={exportExpenses}><Download className="mr-1 h-3.5 w-3.5" /> Expenses</Button>
            </div>
          </div>

          <div className="rounded-xl bg-card p-5 shadow-card">
            <h4 className="text-sm font-semibold text-card-foreground mb-3">Recent Activity</h4>
            <ActivityTimeline items={recentActivity} />
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ── */}
      <Dialog open={showInstForm} onOpenChange={(o) => { setShowInstForm(o); if (!o) setEditInstitution(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editInstitution ? "Edit" : "Add"} Institution</DialogTitle>
            <DialogDescription>Fill in the details to {editInstitution ? "update" : "register"} a partner institution.</DialogDescription>
          </DialogHeader>
          <FormEngine
            fields={institutionFields.map(f => f.key === "assignedTo" ? { ...f, options: execOptions } : f)}
            initial={editInstitution ? { ...editInstitution, assignedTo: userLabelById(editInstitution.assignedTo, users) } : { pipelineStage: "Identified", type: "School", boardUniversity: "CBSE" }}
            onSubmit={saveInstitution}
            onCancel={() => { setShowInstForm(false); setEditInstitution(null); }}
            submitLabel={editInstitution ? "Update" : "Save"}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Visit</DialogTitle>
            <DialogDescription>Record the details of your latest field visit and interaction.</DialogDescription>
          </DialogHeader>
          <FormEngine fields={visitFields} initial={{ visitDate: todayIso(), status: "Completed", interestLevel: "Warm" }} onSubmit={saveVisit} onCancel={() => setShowVisitForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Assign a new action item related to an institution or account.</DialogDescription>
          </DialogHeader>
          <FormEngine fields={taskFields} initial={{ priority: "Medium", dueDate: todayIso() }} onSubmit={saveTask} onCancel={() => setShowTaskForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showProposalForm} onOpenChange={setShowProposalForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Proposal</DialogTitle>
            <DialogDescription>Draft and submit a new commercial or academic proposal.</DialogDescription>
          </DialogHeader>
          <FormEngine fields={proposalFields} initial={{ status: "Draft", sentDate: todayIso(), proposalType: "MoU" }} onSubmit={saveProposal} onCancel={() => setShowProposalForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Capture Event</DialogTitle>
            <DialogDescription>Log details of a workshop, seminar, or offline event.</DialogDescription>
          </DialogHeader>
          <FormEngine fields={eventFields} initial={{ eventType: "Workshop", eventDate: todayIso() }} onSubmit={saveEvent} onCancel={() => setShowEventForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Expense</DialogTitle>
            <DialogDescription>Upload and claim reimbursement for business-related expenses.</DialogDescription>
          </DialogHeader>
          <FormEngine fields={expenseFields} initial={{ expenseType: "Travel", expenseDate: todayIso() }} onSubmit={saveExpense} onCancel={() => setShowExpenseForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Drill-down dialog for an institution */}
      <Dialog open={!!drillInstitution} onOpenChange={(o) => !o && setDrillInstitution(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{drillInstitution?.name}</DialogTitle>
            <DialogDescription>Detailed overview of institutional profile, visits, and proposals.</DialogDescription>
          </DialogHeader>
          {drillInstitution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-muted-foreground">ID:</span> <span className="font-mono">{drillInstitution.institutionId}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{drillInstitution.type}</span></div>
                <div><span className="text-muted-foreground">Board:</span> <span className="font-medium">{drillInstitution.boardUniversity}</span></div>
                <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{drillInstitution.city}</span></div>
                <div><span className="text-muted-foreground">Students:</span> <span className="font-semibold">{drillInstitution.studentStrength.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Priority:</span> <StatusPill value={drillInstitution.priority} /></div>
                <div><span className="text-muted-foreground">Stage:</span> <StatusPill value={drillInstitution.pipelineStage} /></div>
                <div><span className="text-muted-foreground">Executive:</span> <span className="font-medium">{userLabelById(drillInstitution.assignedTo, users)}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Decision Maker:</span> <span className="font-medium">{drillInstitution.decisionMaker}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Phone:</span> {drillInstitution.phone} · <span className="text-muted-foreground">Email:</span> {drillInstitution.email}</div>
                <div className="col-span-full"><span className="text-muted-foreground">Address:</span> {drillInstitution.address}</div>
                {drillInstitution.notes && <div className="col-span-full"><span className="text-muted-foreground">Notes:</span> {drillInstitution.notes}</div>}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Visits</h4>
                {data.visits.filter((v) => v.institutionId === drillInstitution.id).map((v) => (
                  <div key={v.id} className="rounded-lg border p-2 mb-1 text-xs flex items-center justify-between">
                    <span>{v.visitDate} · {v.meetingPerson}</span>
                    <StatusPill value={v.interestLevel} />
                  </div>
                ))}
                {data.visits.filter((v) => v.institutionId === drillInstitution.id).length === 0 && <p className="text-xs text-muted-foreground italic">No visits yet.</p>}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Proposals</h4>
                {data.proposals.filter((p) => p.institutionId === drillInstitution.id).map((p) => (
                  <div key={p.id} className="rounded-lg border p-2 mb-1 text-xs flex items-center justify-between">
                    <span>{p.proposalType} · ₹{p.amount.toLocaleString()}</span>
                    <StatusPill value={p.status} />
                  </div>
                ))}
                {data.proposals.filter((p) => p.institutionId === drillInstitution.id).length === 0 && <p className="text-xs text-muted-foreground italic">No proposals yet.</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Add a new point of contact for an institution.</DialogDescription>
          </DialogHeader>
          <FormEngine fields={contactFields} onSubmit={saveContact} onCancel={() => setShowContactForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
