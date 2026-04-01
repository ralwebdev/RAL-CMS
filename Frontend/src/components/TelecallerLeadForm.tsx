import { useState } from "react";
import { MASTER_COURSE_NAMES, MASTER_LOCATIONS } from "@/lib/master-schema";
import { Lead, LeadActivity, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Save, Send, X } from "lucide-react";
import { toast } from "sonner";

interface TelecallerLeadFormProps {
  onSave: (lead: any) => void;
  onCancel: () => void;
  currentUser: User;
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? (
    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3" />{msg}
    </p>
  ) : null;
}

export function TelecallerLeadForm({ onSave, onCancel, currentUser }: TelecallerLeadFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interestedCourse: "",
    priorityCategory: "Medium Priority" as "High Priority" | "Medium Priority" | "Low Priority",
    notes: "",
    location: "Kolkata",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format.";
    if (!form.interestedCourse) e.interestedCourse = "Please select a course.";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const now = new Date();
      const timestamp = now.toISOString();

      const activities: LeadActivity[] = [
        {
          leadId: "", // Will be set by backend or mapped later
          type: "Lead Created",
          description: `Lead registered manually by Telecaller: ${currentUser.name}`,
          timestamp,
        }
      ];

      const newLead: Partial<Lead> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        source: "Telecaller Inquiry",
        interestedCourse: form.interestedCourse,
        assignedTelecallerId: currentUser.id,
        status: "New",
        priorityCategory: form.priorityCategory,
        priorityScore: form.priorityCategory === "High Priority" ? 80 : form.priorityCategory === "Medium Priority" ? 50 : 20,
        leadScore: 30,
        leadQuality: "Warm",
        temperature: "Warm",
        intentCategory: "Medium Intent",
        intentScore: 50,
        activities,
        // Default program channel for manual entry
        programChannel: "Individual Course Admission",
      };

      await onSave(newLead);
      toast.success("Lead registered successfully!");
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Failed to register lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
          <Input 
            id="name" 
            placeholder="Student Name" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
          />
          <FieldError msg={errors.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
          <Input 
            id="phone" 
            placeholder="10-digit mobile number" 
            value={form.phone} 
            onChange={(e) => setForm({ ...form, phone: e.target.value })} 
          />
          <FieldError msg={errors.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="email@example.com" 
          value={form.email} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
        />
        <FieldError msg={errors.email} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Interested Course <span className="text-destructive">*</span></Label>
          <Select 
            value={form.interestedCourse} 
            onValueChange={(v) => setForm({ ...form, interestedCourse: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {MASTER_COURSE_NAMES.map((course) => (
                <SelectItem key={course} value={course}>{course}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError msg={errors.interestedCourse} />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select 
            value={form.priorityCategory} 
            onValueChange={(v: any) => setForm({ ...form, priorityCategory: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High Priority">High Priority</SelectItem>
              <SelectItem value="Medium Priority">Medium Priority</SelectItem>
              <SelectItem value="Low Priority">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes (Internal)</Label>
        <Textarea 
          placeholder="Brief notes about the inquiry..." 
          value={form.notes} 
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-4 mt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          <X className="mr-1 h-4 w-4" />Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : (
            <>
              <Send className="mr-1 h-4 w-4" />Register Lead
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
