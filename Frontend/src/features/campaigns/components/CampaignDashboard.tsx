import { useMemo } from "react";
import { DollarSign, UserPlus, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "@/components/StatCard";
import { Campaign } from "@/lib/types";

const CHART_COLORS = ["hsl(358,78%,51%)", "hsl(0,0%,10%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(210,79%,46%)", "hsl(0,0%,60%)"];
const PLATFORMS = ["Meta", "Google", "LinkedIn", "YouTube", "Referral", "Offline Event"];

interface CampaignDashboardProps {
  campaigns: Campaign[];
  admissions: any[];
}

export function CampaignDashboard({ campaigns, admissions }: CampaignDashboardProps) {
  const stats = useMemo(() => {
    const totalSpend = campaigns.reduce((s: number, c: any) => s + (c.budget || 0), 0);
    const totalLeads = campaigns.reduce((s: number, c: any) => s + (c.leadsGenerated || 0), 0);
    const avgCPL = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
    const totalRevenue = admissions.reduce((s: number, a: any) => s + (a.totalFee || 0), 0);
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(1) : "0";
    return { totalSpend, totalLeads, avgCPL, roas };
  }, [campaigns, admissions]);

  const platformData = useMemo(() => 
    PLATFORMS.map(p => ({ 
      name: p, 
      value: campaigns.filter((c: any) => c.platform === p).reduce((s: number, c: any) => s + (c.budget || 0), 0) 
    })), 
  [campaigns]);

  const efficiencyData = useMemo(() => 
    campaigns.slice(0, 5).map((c: any) => ({ 
      name: c.name.substring(0, 10), 
      cpl: c.costPerLead || 0 
    })), 
  [campaigns]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Spend" value={`₹${stats.totalSpend.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Leads Generated" value={stats.totalLeads} icon={<UserPlus className="h-5 w-5" />} />
        <StatCard title="Avg. CPL" value={`₹${stats.avgCPL}`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard title="ROAS" value={`${stats.roas}x`} icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Spend by Platform</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RPieChart>
              <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {platformData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </RPieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Campaign Efficiency (CPL)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cpl" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
