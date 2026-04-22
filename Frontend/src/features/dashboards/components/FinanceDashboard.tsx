import { useSyncExternalStore, useMemo } from "react";
import { 
  getFinance, subscribeFinance, 
} from "@/lib/finance-store";
import { 
  Invoice, Payment, 
} from "@/lib/finance-types";
import { Card } from "@/components/ui/card";
import { 
  FileText, IndianRupee, AlertTriangle, TrendingUp, Receipt, 
  Lightbulb, BadgePercent, Pencil, ShieldCheck, Calendar as CalIcon 
} from "lucide-react";
import { 
  AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from "recharts";
import { FinanceKpi, fmtINR, fmtDate } from "@/components/finance/FinanceKpi";
import { getInvoiceEdits, subscribeInvoiceEdits } from "@/lib/invoice-edit-store";
import { computeEmiMetrics, computeStudentRisk } from "@/lib/revenue-projection";

const CHART_COLORS = ["hsl(var(--primary))", "#1A1A1A", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#0ea5e9"];

function useFinance() {
  return useSyncExternalStore(
    (l) => subscribeFinance(l),
    () => getFinance(),
    () => getFinance(),
  );
}

export function FinanceDashboard({ onJump = () => {} }: { onJump?: (tab: string) => void }) {
  const fin = useFinance();
  const edits = useSyncExternalStore(subscribeInvoiceEdits, getInvoiceEdits, getInvoiceEdits);
  
  const todayKey = new Date().toDateString();
  const editsToday = edits.filter(e => new Date(e.at).toDateString() === todayKey).length;
  const highValueChanges = edits.filter(e => e.highValue).length;
  const revisedBilling = edits.reduce((s, e) => s + e.amountDelta, 0);
  
  const emiMetrics = computeEmiMetrics(fin.emiSchedules);
  const riskRows = computeStudentRisk(fin.invoices, fin.emiSchedules);
  const riskAtStake = riskRows.filter(r => r.riskLevel !== "low").reduce((s, r) => s + r.balanceDue, 0);
  
  const totalBilled = fin.invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = fin.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = fin.invoices.reduce((s, i) => s + (i.total - i.amountPaid), 0);
  const totalExpenses = fin.expenses.filter(e => e.status === "Approved").reduce((s, e) => s + e.total, 0);
  const netProfit = totalCollected - totalExpenses;
  
  const gstOutput = fin.invoices.reduce((s, i) => s + i.cgst + i.sgst + i.igst, 0);
  const gstInput = fin.expenses.filter(e => e.status === "Approved").reduce((s, e) => s + e.gst, 0);
  const gstLiability = Math.max(0, gstOutput - gstInput);

  const vendorPayables = fin.vendorBills.filter(b => b.status !== "Paid").reduce((s, b) => s + (b.total - b.paid), 0);
  const emiOverdue = fin.emiSchedules.filter(e => e.status === "Overdue").length;
  const collectionEff = totalBilled > 0 ? (totalCollected / totalBilled * 100) : 0;
  const dailyBurn = totalExpenses / 30 || 1;
  const runway = Math.round((totalCollected - totalExpenses) / dailyBurn);

  const byStream = fin.invoices.reduce<Record<string, number>>((acc, i) => {
    acc[i.revenueStream] = (acc[i.revenueStream] || 0) + i.amountPaid;
    return acc;
  }, {});
  const topStream = Object.entries(byStream).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const trend = useMemo(() => {
    const months: Record<string, { name: string; revenue: number; expense: number }> = {};
    fin.payments.forEach(p => {
      const d = new Date(p.paidOn);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[k] = months[k] || { name: k, revenue: 0, expense: 0 };
      months[k].revenue += p.amount;
    });
    fin.expenses.filter(e => e.status === "Approved").forEach(e => {
      const d = new Date(e.spendDate);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[k] = months[k] || { name: k, revenue: 0, expense: 0 };
      months[k].expense += e.total;
    });
    return Object.values(months).sort((a, b) => a.name.localeCompare(b.name));
  }, [fin]);

  const aging = useMemo(() => {
    const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
    const now = Date.now();
    fin.invoices.forEach(i => {
      const due = i.total - i.amountPaid;
      if (due <= 0) return;
      const days = Math.floor((now - new Date(i.dueDate).getTime()) / 86400000);
      if (days < 30) buckets["0-30"] += due;
      else if (days < 60) buckets["31-60"] += due;
      else if (days < 90) buckets["61-90"] += due;
      else buckets["90+"] += due;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [fin]);

  const streamPie = Object.entries(byStream).map(([name, value]) => ({ name, value }));

  const nudges: string[] = [];
  if (outstanding > 50000) nudges.push(`${fmtINR(outstanding)} dues outstanding. Push collections this week.`);
  if (emiOverdue > 0) nudges.push(`${emiOverdue} EMI account${emiOverdue > 1 ? "s" : ""} overdue today.`);
  if (vendorPayables > 0) nudges.push(`${fmtINR(vendorPayables)} payable to vendors.`);
  if (totalCollected > totalExpenses * 1.5) nudges.push(`Strong month — collections are 1.5× your spend.`);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance Overview</h1>
          <p className="text-sm text-muted-foreground">Accounts & collection auditing</p>
        </div>
      </div>

      {nudges.length > 0 && (
        <Card className="p-3 border-l-4 border-l-primary bg-primary/5">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="space-y-0.5 text-xs">
              {nudges.map((n, i) => <p key={i} className="text-foreground">{n}</p>)}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <FinanceKpi label="Billing Raised" value={fmtINR(totalBilled)} hint={`${fin.invoices.length} invoices`} tone="primary" icon={<FileText className="h-4 w-4" />} onClick={() => onJump("billing")} />
        <FinanceKpi label="Cash Received" value={fmtINR(totalCollected)} hint={`${fin.payments.length} receipts`} tone="success" icon={<IndianRupee className="h-4 w-4" />} onClick={() => onJump("collections")} />
        <FinanceKpi label="Outstanding Dues" value={fmtINR(outstanding)} hint="All open invoices" tone="warning" icon={<AlertTriangle className="h-4 w-4" />} onClick={() => onJump("collections")} />
        <FinanceKpi label="Total Expenses" value={fmtINR(totalExpenses)} hint="Approved this period" tone="destructive" icon={<Receipt className="h-4 w-4" />} onClick={() => onJump("expenses")} />
        <FinanceKpi label="Net Profit" value={fmtINR(netProfit)} hint={netProfit >= 0 ? "In the green" : "Negative"} tone={netProfit >= 0 ? "success" : "destructive"} icon={<TrendingUp className="h-4 w-4" />} onClick={() => onJump("profit")} />
        <FinanceKpi label="GST Liability" value={fmtINR(gstLiability)} hint={`Output ${fmtINR(gstOutput)}`} tone="primary" icon={<BadgePercent className="h-4 w-4" />} onClick={() => onJump("gst")} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <FinanceKpi label="Gross Billing" value={fmtINR(totalBilled)} hint="GST inclusive" tone="primary" icon={<FileText className="h-4 w-4" />} onClick={() => onJump("billing")} />
        <FinanceKpi label="Net Revenue" value={fmtINR(totalBilled - gstOutput)} hint="Excl. GST" tone="success" icon={<TrendingUp className="h-4 w-4" />} onClick={() => onJump("revenue")} />
        <FinanceKpi label="GST Collected" value={fmtINR(gstOutput)} hint="Output tax" tone="primary" icon={<BadgePercent className="h-4 w-4" />} onClick={() => onJump("gst")} />
        <FinanceKpi label="Vendor Payables" value={fmtINR(vendorPayables)} tone="warning" onClick={() => onJump("vendors")} />
        <FinanceKpi label="EMI Overdues" value={emiOverdue} hint="accounts" tone={emiOverdue > 0 ? "destructive" : "success"} onClick={() => onJump("emi")} />
        <FinanceKpi label="Cash Runway" value={`${runway} days`} tone={runway > 60 ? "success" : runway > 30 ? "warning" : "destructive"} />
        <FinanceKpi label="Top Revenue" value={topStream} hint={fmtINR(byStream[topStream] || 0)} tone="primary" onClick={() => onJump("revenue")} />
        <FinanceKpi label="Collection Eff." value={`${collectionEff.toFixed(1)}%`} tone={collectionEff > 70 ? "success" : "warning"} />
        <FinanceKpi label="Budget Variance" value={<BudgetVariance fin={fin} />} tone="default" onClick={() => onJump("budgets")} />
        <FinanceKpi label="Invoice Edits Today" value={editsToday} hint={`${edits.length} all-time`} tone={editsToday > 0 ? "primary" : "default"} icon={<Pencil className="h-4 w-4" />} onClick={() => onJump("billing")} />
        <FinanceKpi label="High-Value Changes" value={highValueChanges} hint=">₹2.5L" tone={highValueChanges > 0 ? "warning" : "default"} icon={<AlertTriangle className="h-4 w-4" />} />
        <FinanceKpi label="Revised Billing" value={fmtINR(revisedBilling)} hint="Net delta" tone={revisedBilling >= 0 ? "success" : "destructive"} />
        <FinanceKpi label="EMI Today" value={fmtINR(emiMetrics.todayDue)} tone={emiMetrics.todayDue > 0 ? "warning" : "default"} icon={<CalIcon className="h-4 w-4" />} onClick={() => onJump("emi")} />
        <FinanceKpi label="Overdue EMI" value={fmtINR(emiMetrics.overdueTotal)} tone={emiMetrics.overdueTotal > 0 ? "destructive" : "success"} icon={<AlertTriangle className="h-4 w-4" />} onClick={() => onJump("emi")} />
        <FinanceKpi label="Next 30d EMI" value={fmtINR(emiMetrics.next30Expected)} tone="primary" onClick={() => onJump("projections")} />
        <FinanceKpi label="Risk Revenue" value={fmtINR(riskAtStake)} hint={`${riskRows.filter(r => r.riskLevel !== "low").length} students`} tone={riskAtStake > 0 ? "warning" : "success"} icon={<ShieldCheck className="h-4 w-4" />} onClick={() => onJump("projections")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3">Revenue vs Expense Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(0)}L` : `${v/1000}k`} />
              <Tooltip formatter={(v: number) => fmtINR(v)} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              <Area type="monotone" dataKey="expense" stroke="#1A1A1A" fill="#1A1A1A" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Revenue by Stream</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={streamPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name.split(" ")[0]}>
                {streamPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmtINR(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4 lg:col-span-3">
          <h3 className="text-sm font-semibold mb-3">Outstanding Receivables Aging</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={aging}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(0)}L` : `${v/1000}k`} />
              <Tooltip formatter={(v: number) => fmtINR(v)} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function BudgetVariance({ fin }: { fin: any }) {
  const planned = fin.budgets.reduce((s: number, b: any) => s + b.plannedAmount, 0);
  const actual = fin.expenses.filter((e: any) => e.status === "Approved").reduce((s: number, e: any) => s + e.total, 0);
  const variance = planned - actual;
  const pct = planned > 0 ? (variance / planned * 100) : 0;
  return <span>{pct >= 0 ? "+" : ""}{pct.toFixed(0)}%</span>;
}
