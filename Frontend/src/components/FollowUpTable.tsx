import React, { useState, useMemo } from "react";
import { format, isPast, isToday, isFuture, parseISO } from "date-fns";
import { 
  Search, Calendar, Clock, CheckCircle2, AlertCircle, 
  Phone, MessageSquare, ChevronRight, Filter, 
  ArrowRightLeft, BadgeCheck, ListFilter
} from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { FollowUp, LeadStatus } from "@/lib/types";

interface FollowUpTableProps {
  followUps: any[];
  onComplete: (id: string) => void;
  onCall: (lead: any) => void;
}

export function FollowUpTable({ followUps, onComplete, onCall }: FollowUpTableProps) {
  const [filter, setFilter] = useState<"all" | "overdue" | "today" | "upcoming" | "completed">("today");
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return followUps.filter(fu => {
      const lead = fu.leadId;
      const name = lead?.name || "";
      const phone = lead?.phone || "";
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || phone.includes(search);
      
      if (!matchesSearch) return false;

      if (filter === "all") return true;
      if (filter === "completed") return fu.completed;
      if (fu.completed) return false; // Hide completed from other filters

      const date = parseISO(fu.date);
      if (filter === "overdue") return isPast(date) && !isToday(date);
      if (filter === "today") return isToday(date);
      if (filter === "upcoming") return isFuture(date);
      
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [followUps, filter, search]);

  const getStatusBadge = (fu: any) => {
    if (fu.completed) return <Badge className="bg-success/20 text-success border-success/30">Completed</Badge>;
    const date = parseISO(fu.date);
    if (isToday(date)) return <Badge className="bg-warning/20 text-warning border-warning/30">Due Today</Badge>;
    if (isPast(date)) return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Overdue</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">Upcoming</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/30 p-3 rounded-lg border">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search leads..." 
            className="pl-9 h-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ListFilter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="h-9 w-full sm:w-40 text-xs sm:text-sm">
              <SelectValue placeholder="Filter tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[200px]">Lead Details</TableHead>
              <TableHead>Follow-up Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="max-w-[250px]">Notes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BadgeCheck className="h-10 w-10 opacity-20" />
                    <p>No follow-up tasks found for this filter.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((fu) => (
                <TableRow key={fu.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{fu.leadId?.name || "Unknown Lead"}</span>
                      <span className="text-[11px] text-muted-foreground">{fu.leadId?.phone || "N/A"}</span>
                      {fu.leadId?.interestedCourse && (
                        <span className="text-[10px] text-primary/80 mt-0.5">{fu.leadId.interestedCourse}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(parseISO(fu.date), "MMM dd, yyyy")}
                      </div>
                      {fu.followUpTime && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          {fu.followUpTime}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {fu.followUpType || "Regular Follow-up"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                      {fu.notes || "No notes provided"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(fu)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {!fu.completed && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                            onClick={() => onComplete(fu.id)}
                            title="Mark as completed"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="h-8 text-[11px] px-3 font-medium"
                            onClick={() => onCall(fu.leadId)}
                          >
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            Call
                          </Button>
                        </>
                      )}
                      {fu.completed && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-muted-foreground flex items-center gap-1"
                          onClick={() => onCall(fu.leadId)}
                        >
                          View Lead <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
