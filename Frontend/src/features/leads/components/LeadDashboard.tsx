import { useMemo } from "react";
import { Users, UserCheck, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "@/components/StatCard";
import { Lead, LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = ["New", "Contact Attempted", "Connected", "Interested", "Application Submitted", "Interview Scheduled", "Interview Completed", "Counseling", "Qualified", "Admission", "Lost"];

interface LeadDashboardProps {
  leads: Lead[];
}

export function LeadDashboard({ leads }: LeadDashboardProps) {
  const stats = useMemo(() => {
    const total = leads.length;
    const connected = leads.filter(l => l.status === "Connected" || l.status === "Interested").length;
    const qualified = leads.filter(l => l.status === "Qualified" || l.status === "Admission").length;
    const convRate = total > 0 ? ((qualified / total) * 100).toFixed(1) : "0";
    return { total, connected, qualified, convRate };
  }, [leads]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => { counts[l.source] = (counts[l.source] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats.total} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Connected" value={stats.connected} icon={<UserCheck className="h-5 w-5" />} />
        <StatCard title="Qualified" value={stats.qualified} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="Conv. Rate" value={`${stats.convRate}%`} icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Lead Source Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {sourceData.map((_, i) => <Cell key={i} fill={`hsl(var(--primary), ${1 - i * 0.2})`} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Pipeline Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={STATUSES.map(s => ({ name: s, count: leads.filter(l => l.status === s).length }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
