import { useState, useMemo } from "react";
import { StatCard } from "@/components/StatCard";
import { DollarSign, Users, TrendingUp, BarChart3, Target } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { useCampaigns } from "@/features/campaigns/hooks/use-campaigns";
import { useLeads } from "@/features/leads/hooks/use-leads";
import { useAdmissions } from "@/hooks/use-admissions";

const CHART_COLORS = [
  "hsl(358, 78%, 51%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)",
  "hsl(220, 70%, 55%)", "hsl(280, 60%, 55%)", "hsl(180, 60%, 45%)",
];

export function MarketingDashboard() {
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns();
  const { data: leadsData, isLoading: leadsLoading } = useLeads();
  const { data: admissionsData, isLoading: admissionsLoading } = useAdmissions();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const isLoading = campaignsLoading || leadsLoading || admissionsLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const campaigns = campaignsData?.campaigns || campaignsData || [];
  const leads = leadsData?.leads || [];
  const admissions = admissionsData || [];

  const totalSpend = campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0);
  const totalLeadsGenerated = campaigns.reduce((s: number, c: any) => s + (c.leadsGenerated || 0), 0);
  const avgCPL = totalLeadsGenerated > 0 ? Math.round(totalSpend / totalLeadsGenerated) : 0;
  const totalRevenue = admissions.reduce((s: number, a: any) => s + (a.totalFee || 0), 0);
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : "0";
  const cac = admissions.length > 0 ? Math.round(totalSpend / admissions.length) : 0;

  const sourceData = useMemo(() => {
    const m = new Map<string, { leads: number; admissions: number }>();
    const filteredLeads = leads.filter((l: any) => l.source !== "Telecaller Inquiry");
    
    filteredLeads.forEach((l: any) => { const e = m.get(l.source) || { leads: 0, admissions: 0 }; e.leads++; m.set(l.source, e); });
    admissions.forEach((a: any) => {
      const lead = leads.find((l: any) => l.id === a.leadId);
      if (lead && (lead as any).source !== "Telecaller Inquiry") { const e = m.get((lead as any).source) || { leads: 0, admissions: 0 }; e.admissions++; m.set((lead as any).source, e); }
    });
    return Array.from(m.entries()).map(([source, d]) => ({ source, ...d }));
  }, [leads, admissions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing Dashboard</h1>
        <p className="text-sm text-muted-foreground">Campaign performance and marketing ROI</p>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard title="Campaign Spend" value={`₹${totalSpend.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Leads Generated" value={totalLeadsGenerated} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Cost Per Lead" value={`₹${avgCPL}`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="ROAS" value={`${roas}x`} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard title="CAC" value={`₹${cac.toLocaleString()}`} icon={<Target className="h-5 w-5" />} />
      </div>

      {/* Lead source pie */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Lead Source Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sourceData} dataKey="leads" nameKey="source" cx="50%" cy="50%" outerRadius={90} label={({ source, leads }) => `${source}: ${leads}`}>
                {sourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign performance */}
        <div className="rounded-xl bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaigns.map((c: any) => ({ name: c.name.substring(0, 15), spend: c.budget || 0, leads: c.leadsGenerated || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="spend" name="Spend (₹)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" name="Leads" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-primary font-medium hover:underline">
        {showAdvanced ? "Hide" : "Show"} Advanced Analytics →
      </button>
      {showAdvanced && (
        <div className="rounded-xl bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Source Conversion Analysis</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium text-center">Leads</th>
                <th className="pb-2 font-medium text-center">Admissions</th>
                <th className="pb-2 font-medium text-center">Conv %</th>
              </tr>
            </thead>
            <tbody>
              {sourceData.map((s) => (
                <tr key={s.source} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-card-foreground">{s.source}</td>
                  <td className="py-2.5 text-center text-muted-foreground">{s.leads}</td>
                  <td className="py-2.5 text-center text-muted-foreground">{s.admissions}</td>
                  <td className="py-2.5 text-center font-medium text-card-foreground">{s.leads > 0 ? ((s.admissions / s.leads) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
