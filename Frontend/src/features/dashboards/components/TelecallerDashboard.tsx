import { useAuth } from "@/lib/auth-context";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Phone, GraduationCap, Target, Calendar, PhoneCall, Zap, Star } from "lucide-react";
import { useLeads } from "@/features/leads/hooks/use-leads";
import { useCallLogs, useFollowUps } from "@/hooks/use-call-logs";

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export function TelecallerDashboard() {
  const { currentUser } = useAuth();

  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: callLogsData, isLoading: callLogsLoading } = useCallLogs();
  const { data: followUpsData, isLoading: followUpsLoading } = useFollowUps();

  const isLoading = leadsLoading || callLogsLoading || followUpsLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const leads = leadsData?.leads || [];
  const callLogs = callLogsData || [];
  const followUps = followUpsData || [];

  const today = new Date().toISOString().split("T")[0];

  const myLeads = leads.filter((l: any) => l.assignedTelecallerId === currentUser!.id);
  const activeLeads = myLeads.filter((l: any) => l.status !== "Admission" && l.status !== "Lost");
  const myLogs = callLogs.filter((cl: any) => cl.telecallerId === currentUser!.id);
  const todayLogs = myLogs.filter((cl: any) => cl.createdAt === today);
  const connected = todayLogs.filter((cl: any) => cl.outcome === "Connected" || cl.outcome === "Interested").length;
  const myFollowUps = followUps.filter((f: any) => f.assignedTo === currentUser!.id && !f.completed && f.date <= today);
  const highPriority = activeLeads.filter((l: any) => l.priorityCategory === "High Priority");
  const newLeads = activeLeads.filter((l: any) => daysBetween(l.createdAt, today) <= 1);
  const callbackLeads = activeLeads.filter((l: any) => l.leadSourceFormType === "Free Callback");
  const counsellingReqs = activeLeads.filter((l: any) => l.leadSourceFormType === "Free Counselling");
  const applicationLeads = activeLeads.filter((l: any) => l.leadSourceFormType === "Apply Now");

  // Walk-in metrics
  const walkInsScheduled = myLeads.filter((l: any) => l.walkInStatus === "Scheduled" || l.walkInStatus === "Completed" || l.walkInStatus === "No Show");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Telecaller Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome, {currentUser!.name}</p>
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <StatCard title="New Leads" value={newLeads.length} icon={<UserPlus className="h-5 w-5" />} />
        <StatCard title="Callback Requests" value={callbackLeads.length} icon={<Phone className="h-5 w-5" />} />
        <StatCard title="Counselling Requests" value={counsellingReqs.length} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard title="Application Leads" value={applicationLeads.length} icon={<Target className="h-5 w-5" />} />
        <StatCard title="Walk-ins Scheduled" value={walkInsScheduled.length} icon={<Calendar className="h-5 w-5" />} />
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Calls Today" value={todayLogs.length} icon={<PhoneCall className="h-5 w-5" />} />
        <StatCard title="Connected" value={connected} icon={<Zap className="h-5 w-5" />} />
        <StatCard title="Follow-ups Today" value={myFollowUps.length} icon={<Calendar className="h-5 w-5" />} />
        <StatCard title="High Priority" value={highPriority.length} icon={<Star className="h-5 w-5" />} />
      </div>

      {highPriority.length > 0 && (
        <div className="rounded-xl bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground flex items-center gap-2"><Target className="h-4 w-4 text-destructive" /> High Priority Leads</h3>
          <div className="space-y-2">
            {highPriority.slice(0, 5).map((l: any) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.interestedCourse} · {l.source} {l.leadSourceFormType ? `· ${l.leadSourceFormType}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">{l.priorityScore || 0} pts</Badge>
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {myFollowUps.length > 0 && (
        <div className="rounded-xl bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-warning" /> Follow-ups Due Today</h3>
          <div className="space-y-2">
            {myFollowUps.slice(0, 5).map((f: any) => {
              const leadName = (f.leadId && typeof f.leadId === 'object') ? f.leadId.name : leads.find((l: any) => l.id === f.leadId)?.name;
              return (
                <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{leadName || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{f.notes}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{f.date}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
