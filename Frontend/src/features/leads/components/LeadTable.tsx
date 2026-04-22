import { StatusBadge } from "@/components/StatusBadge";
import { Lead } from "@/lib/types";

interface LeadTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export function LeadTable({ leads, onLeadClick }: LeadTableProps) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="p-4 font-medium">Name</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Course</th>
            <th className="p-4 font-medium">Phone</th>
            <th className="p-4 font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(l => (
            <tr 
              key={l.id} 
              className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" 
              onClick={() => onLeadClick(l)}
            >
              <td className="p-4 font-medium">{l.name}</td>
              <td className="p-4"><StatusBadge status={l.status} /></td>
              <td className="p-4">{l.interestedCourse}</td>
              <td className="p-4 text-muted-foreground">{l.phone}</td>
              <td className="p-4 font-bold">{l.leadScore}</td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                No leads found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
