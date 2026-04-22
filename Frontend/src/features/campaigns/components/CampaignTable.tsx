import { Layers, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/lib/types";

interface CampaignTableProps {
  campaigns: Campaign[];
  onAddAdSet: (id: string) => void;
  onViewDetails: (campaign: Campaign) => void;
}

export function CampaignTable({ campaigns, onAddAdSet, onViewDetails }: CampaignTableProps) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 font-medium">Campaign</th>
            <th className="p-4 font-medium">Platform</th>
            <th className="p-4 font-medium">Budget</th>
            <th className="p-4 font-medium">Leads</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c: any) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="p-4">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.objective}</div>
              </td>
              <td className="p-4">{c.platform}</td>
              <td className="p-4">₹{(c.budget || 0).toLocaleString()}</td>
              <td className="p-4">{c.leadsGenerated || 0}</td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onAddAdSet(c.id)}
                    title="Manage Ad Sets"
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onViewDetails(c)}
                    title="View Analytics"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {campaigns.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                No campaigns found. Start by creating one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
