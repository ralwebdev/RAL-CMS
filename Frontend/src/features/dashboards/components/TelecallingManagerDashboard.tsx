import { useAuth } from "@/lib/auth-context";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, Users, GraduationCap, Timer, AlertTriangle } from "lucide-react";
import { useLeads } from "@/features/leads/hooks/use-leads";
import { useCallLogs } from "@/hooks/use-call-logs";
import { useAdmissions } from "@/hooks/use-admissions";
import { useUsers } from "@/hooks/use-users";

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export function TelecallingManagerDashboard() {
  const today = new Date().toISOString().split("T")[0];

  const { data: leadsData } = useLeads({ limit: 1000 });
  const { data: callLogsData } = useCallLogs();
  const { data: admissionsData } = useAdmissions();
  const { data: usersData } = useUsers();

  const leads = leadsData?.leads || [];
  const callLogs = callLogsData || [];
  const admissions = admissionsData || [];
  const users = usersData || [];

  const telecallers = users.filter((u: any) => u.role === "telecaller");
  
  const conversionData = admissions.map((adm: any) => {
    const lead = leads.find((l: any) => l.id === adm.leadId);
    if (!lead || lead.source === "Telecaller Inquiry") return null;
    return { att: daysBetween(lead.createdAt, adm.admissionDate), telecallerId: lead.assignedTelecallerId };
  }).filter(Boolean) as { att: number; telecallerId: string }[];
  
  const overallATT = conversionData.length > 0 ? +(conversionData.reduce((s, c) => s + c.att, 0) / conversionData.length).toFixed(1) : 0;

  const tcPerf = telecallers.map((tc: any) => {
    const assigned = leads.filter((l: any) => l.assignedTelecallerId === tc.id);
    const calls = callLogs.filter((cl: any) => cl.telecallerId === tc.id);
    const connected = calls.filter((cl: any) => cl.outcome === "Connected" || cl.outcome === "Interested");
    const converted = conversionData.filter((c) => c.telecallerId === tc.id);
    const avgATT = converted.length > 0 ? +(converted.reduce((s, c) => s + c.att, 0) / converted.length).toFixed(1) : 0;
    const uncontacted = assigned.filter((l: any) => l.status !== "Admission" && l.status !== "Lost" && !calls.some((cl: any) => cl.leadId === l.id));
    return {
      name: tc.name, calls: calls.length, connected: connected.length,
      admissions: converted.length, avgATT, assigned: assigned.length,
      connectionRate: calls.length > 0 ? +((connected.length / calls.length) * 100).toFixed(1) : 0,
      uncontacted: uncontacted.length,
    };
  });

  const agingLeads = leads.filter((l: any) => l.status !== "Admission" && l.status !== "Lost" && daysBetween(l.createdAt, today) > 7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Telecalling Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground">Monitor team productivity and performance</p>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Calls Today" value={callLogs.filter((cl: any) => cl.createdAt === today).length} icon={<PhoneCall className="h-5 w-5" />} />
        <StatCard title="Telecallers" value={telecallers.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Admissions" value={admissions.length} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard title="Overall ATT" value={`${overallATT}d`} icon={<Timer className="h-5 w-5" />} />
        <StatCard title="Aging Leads" value={agingLeads.length} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <div className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Agent Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Agent</th>
                <th className="pb-2 font-medium text-center">Calls</th>
                <th className="pb-2 font-medium text-center">Connected</th>
                <th className="pb-2 font-medium text-center">Conn %</th>
                <th className="pb-2 font-medium text-center">Admissions</th>
                <th className="pb-2 font-medium text-center">ATT</th>
                <th className="pb-2 font-medium text-center">Uncontacted</th>
              </tr>
            </thead>
            <tbody>
              {tcPerf.map((tc) => (
                <tr key={tc.name} className="border-b last:border-0">
                  <td className="py-3 font-medium text-card-foreground">{tc.name}</td>
                  <td className="py-3 text-center text-muted-foreground">{tc.calls}</td>
                  <td className="py-3 text-center text-muted-foreground">{tc.connected}</td>
                  <td className="py-3 text-center font-medium text-card-foreground">{tc.connectionRate}%</td>
                  <td className="py-3 text-center text-muted-foreground">{tc.admissions}</td>
                  <td className="py-3 text-center">
                    {tc.avgATT > 0 ? (
                      <Badge variant="outline" className={`text-[10px] ${tc.avgATT <= 5 ? "bg-success/10 text-success" : tc.avgATT <= 10 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>{tc.avgATT}d</Badge>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-3 text-center">
                    {tc.uncontacted > 0 ? <Badge variant="outline" className="bg-destructive/10 text-destructive text-[10px]">{tc.uncontacted}</Badge> : <span className="text-muted-foreground">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {agingLeads.length > 0 && (
        <div className="rounded-xl bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Aging Leads ({agingLeads.length})</h3>
          <div className="space-y-2">
            {agingLeads.slice(0, 5).map((l: any) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.interestedCourse} · {l.source}</p>
                </div>
                <Badge variant="outline" className="bg-destructive/10 text-destructive text-[10px]">{daysBetween(l.createdAt, today)} days old</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
