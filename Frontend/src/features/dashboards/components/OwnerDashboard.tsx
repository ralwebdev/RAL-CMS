import { useState, useMemo } from "react";
import { StatCard } from "@/components/StatCard";
import {
  DollarSign, Users, TrendingUp, BarChart3, Target, Timer,
  AlertTriangle, ArrowUpRight, CheckCircle2, Download,
  FileText, Zap, Star, Clock, Calendar
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend,
  AreaChart, Area
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Note: using Badge as Button placeholder if Button is not exported from shadcn in this context, but I should use the real Button.
// Re-importing Button from ui
import { Button as ShadcnButton } from "@/components/ui/button";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import { useLeads } from "@/features/leads/hooks/use-leads";
import { useAdmissions } from "@/hooks/use-admissions";
import { useUsers } from "@/hooks/use-users";
import { useCallLogs, useFollowUps } from "@/hooks/use-call-logs";
import { MASTER_COURSES } from "@/lib/master-schema";

const BENCHMARKS = {
  cpaMin: 5500,
  cpaMax: 6500,
  marketingSpendRatioMax: 15,
  minROAS: 5,
  monthlyBilling: 5000000,
};

const CHART_COLORS = [
  "hsl(358, 78%, 51%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)",
  "hsl(220, 70%, 55%)", "hsl(280, 60%, 55%)", "hsl(180, 60%, 45%)",
];

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function OwnerDashboard() {
  const { data: campaignsData } = useCampaigns();
  const { data: leadsData } = useLeads({ limit: 1000 });
  const { data: admissionsData } = useAdmissions();
  const { data: usersData } = useUsers();
  const { data: callLogsData } = useCallLogs();
  const { data: followUpsData } = useFollowUps();

  const today = new Date().toISOString().split("T")[0];

  const campaigns = campaignsData?.campaigns || campaignsData || [];
  const leads = leadsData?.leads || [];
  const admissions = admissionsData || [];
  const users = usersData || [];
  const callLogs = callLogsData || [];
  const followUps = followUpsData || [];

  // Metrics
  const totalRevenue = admissions.reduce((s: number, a: any) => s + (a.totalFee || 0), 0);
  const totalCollected = admissions.reduce((s: number, a: any) => s + (a.paymentHistory?.reduce((ps: number, p: any) => ps + (p.amountPaid || 0), 0) || 0), 0);
  const totalSpend = campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0);
  const totalLeadsGenerated = leads.length;
  const cpl = totalLeadsGenerated > 0 ? Math.round(totalSpend / totalLeadsGenerated) : 0;
  const cpa = admissions.length > 0 ? Math.round(totalSpend / admissions.length) : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const spendRatio = totalRevenue > 0 ? (totalSpend / totalRevenue) * 100 : 0;
  const convRate = leads.length > 0 ? ((admissions.length / leads.length) * 100).toFixed(1) : "0";

  const billingProgress = Math.min((totalRevenue / BENCHMARKS.monthlyBilling) * 100, 100);

  // Course Revenue
  const courseRevenue = useMemo(() => {
    return MASTER_COURSES.map((c) => {
      const cLeads = leads.filter((l: any) => l.interestedCourse === c.course_name);
      const cAdm = admissions.filter((a: any) => a.courseSelected === c.course_name);
      const rev = cAdm.reduce((s: number, a: any) => s + (a.totalFee || 0), 0);
      return { name: c.course_name, leads: cLeads.length, admissions: cAdm.length, revenue: rev, convRate: cLeads.length > 0 ? +((cAdm.length / cLeads.length) * 100).toFixed(1) : 0 };
    }).filter(c => c.leads > 0 || c.admissions > 0).sort((a, b) => b.revenue - a.revenue);
  }, [leads, admissions]);

  const [activeSection, setActiveSection] = useState("overview");

  const exportReport = (type: string) => {
    if (type === "revenue") {
      downloadCSV("revenue_report.csv", ["Course", "Leads", "Admissions", "Revenue", "Conv%"], courseRevenue.map(c => [c.name, `${c.leads}`, `${c.admissions}`, `${c.revenue}`, `${c.convRate}%`]));
    }
    // Add other exports as needed
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Director Command Center</h1>
          <p className="text-sm text-muted-foreground">Financial & Operational Audit Overview</p>
        </div>
        <div className="flex gap-2">
          <ShadcnButton variant="outline" size="sm" onClick={() => exportReport("revenue")}><Download className="mr-2 h-4 w-4" /> Export Financials</ShadcnButton>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Total Collected" value={`₹${totalCollected.toLocaleString()}`} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Marketing Spend" value={`₹${totalSpend.toLocaleString()}`} icon={<Megaphone className="h-5 w-5" />} />
        <StatCard title="ROAS" value={`${roas.toFixed(1)}x`} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <div className="rounded-xl bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Monthly Billing Target</h3>
          <span className="text-xs font-medium text-muted-foreground">{billingProgress.toFixed(1)}% of ₹{(BENCHMARKS.monthlyBilling / 100000).toFixed(0)}L</span>
        </div>
        <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${billingProgress}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Course Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseRevenue.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Lead Conversion Funnel</h3>
          {/* Simple funnel or list */}
          <div className="space-y-4">
            {courseRevenue.slice(0, 5).map(c => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{c.name}</span>
                  <span>{c.convRate}% Conv.</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: `${c.convRate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder for Megaphone if not imported
function Megaphone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 18-5v12L3 13v-2Z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
