import { useAuth } from "@/lib/auth-context";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Target, TrendingUp, AlertTriangle, GraduationCap, DollarSign, Clock, Star, Zap } from "lucide-react";
import { useLeads } from "@/features/leads/hooks/use-leads";
import { useAdmissions } from "@/hooks/use-admissions";
import { useFollowUps } from "@/hooks/use-call-logs"; // Note: both hooks are in this file now
import { MASTER_COURSES } from "@/lib/master-schema";

export function CounselorDashboard() {
  const { currentUser } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: admissionsData, isLoading: admissionsLoading } = useAdmissions();
  const { data: followUpsData, isLoading: followUpsLoading } = useFollowUps();

  const isLoading = leadsLoading || admissionsLoading || followUpsLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const leads = leadsData?.leads || [];
  const admissions = admissionsData || [];
  const followUps = followUpsData || [];

  const myLeads = leads.filter((l: any) => l.assignedCounselor === currentUser!.id);
  const pendingCounseling = myLeads.filter((l: any) => l.status === "Counseling");
  const hotLeads = leads.filter((l: any) => l.intentCategory === "High Intent" && l.qualification?.budgetConfirmed && l.status !== "Admission" && l.status !== "Lost");
  const admissionsToday = admissions.filter((a: any) => a.admissionDate === today);
  const scholarshipReqs = leads.filter((l: any) => l.scholarshipApplied && l.status !== "Admission" && l.status !== "Lost");
  const emiLeads = leads.filter((l: any) => l.emiSelected && l.status !== "Admission" && l.status !== "Lost");
  const highTicket = leads.filter((l: any) => {
    const course = MASTER_COURSES.find((c) => c.course_name === l.interestedCourse);
    return course && course.course_fee >= 160000 && l.status !== "Admission" && l.status !== "Lost";
  });

  // Walk-in metrics
  const walkInsAssigned = myLeads.filter((l: any) => l.walkInStatus && l.walkInStatus !== "Not Scheduled");
  const walkInsScheduledToday = walkInsAssigned.filter((l: any) => l.walkInDate === today && l.walkInStatus === "Scheduled");
  const walkInsCompleted = walkInsAssigned.filter((l: any) => l.walkInStatus === "Completed");
  const walkInsCompletedToday = walkInsCompleted.filter((l: any) => l.walkInDate === today);
  const walkInAdmissions = admissions.filter((a: any) => {
    const lead = leads.find((l: any) => l.id === a.leadId);
    return lead?.walkInStatus === "Completed" && lead?.assignedCounselor === currentUser!.id;
  });
  const walkInConvRate = walkInsCompleted.length > 0 ? ((walkInAdmissions.length / walkInsCompleted.length) * 100).toFixed(1) : "0";

  // Follow-up KPIs
  const myFollowUps = followUps.filter((f: any) => f.assignedTo === currentUser!.id);
  const overdueFU = myFollowUps.filter((f: any) => !f.completed && f.date < today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Counselor Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome, {currentUser!.name}</p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <StatCard title="Walk-ins Assigned" value={walkInsAssigned.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Today's Walk-ins" value={walkInsScheduledToday.length} icon={<Calendar className="h-5 w-5" />} />
        <StatCard title="Completed Today" value={walkInsCompletedToday.length} icon={<Target className="h-5 w-5" />} />
        <StatCard title="Walk-in Conv%" value={`${walkInConvRate}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Overdue Follow-ups" value={overdueFU.length} icon={<AlertTriangle className="h-5 w-5" />} className={overdueFU.length > 0 ? "border-destructive/20" : ""} />
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Admission Discussions" value={pendingCounseling.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Scholarship Requests" value={scholarshipReqs.length} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="EMI Discussions" value={emiLeads.length} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="High Ticket Leads" value={highTicket.length} icon={<Star className="h-5 w-5" />} />
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <StatCard title="Hot Leads" value={hotLeads.length} icon={<Zap className="h-5 w-5" />} />
        <StatCard title="Admissions Today" value={admissionsToday.length} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard title="Total Admissions" value={admissions.length} icon={<Target className="h-5 w-5" />} />
      </div>

      <div className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-semibold text-card-foreground flex items-center gap-2"><Star className="h-4 w-4 text-warning" /> Hot Leads — Ready for Conversion</h3>
        {hotLeads.length === 0 ? <p className="text-sm text-muted-foreground">No hot leads at the moment</p> : (
          <div className="space-y-2">
            {hotLeads.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.interestedCourse} · Budget: {l.budgetRange || "—"} {l.scholarshipApplied ? `· Scholarship: ${l.scholarshipPercentage || 0}%` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  {l.admissionProbability && <Badge variant="outline" className={`text-[10px] ${l.admissionProbability === "High" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{l.admissionProbability}</Badge>}
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-semibold text-card-foreground">Recent Admissions</h3>
        {admissions.length === 0 ? <p className="text-sm text-muted-foreground">No admissions yet</p> : (
          <div className="space-y-2">
            {admissions.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{a.studentName}</p>
                  <p className="text-xs text-muted-foreground">{a.courseSelected} · ₹{(a.totalFee || 0).toLocaleString()} {a.scholarshipApplied ? `· ${a.scholarshipPercentage}% scholarship` : ""}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{a.admissionDate}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
