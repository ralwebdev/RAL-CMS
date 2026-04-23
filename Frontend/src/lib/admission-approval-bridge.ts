import axios from 'axios';
import { type ApprovalRequest, type ApprovalStatus } from "./approvals";
import { createInvoiceApi } from "./finance-store";
import { computeBreakup } from "./gst-calc";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("crm_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/** Approval-engine action callback: mirror result onto the admission record and auto-generate invoice. */
export async function syncApprovalToAdmission(req: ApprovalRequest, status: ApprovalStatus) {
  if (req.requestType !== "Admission") return;

  const next = status === "Approved" ? "Approved" : status === "Rejected" ? "Rejected" : null;
  if (!next) return;

  try {
    const headers = getHeaders();

    // 1. Update Admission approvalStatus in backend
    await axios.put(`${API_URL}/api/admissions/${req.requestId}`, { approvalStatus: next }, headers);

    // 2. If Approved, auto-generate Invoice
    if (next === "Approved") {
      // Fetch full admission details to get fields for invoice
      const { data: adm } = await axios.get(`${API_URL}/api/admissions/${req.requestId}`, headers);

      // We assume standard 18% GST and Intra-state (West Bengal) for auto-generation
      const breakup = computeBreakup(adm.totalFee, 18, "gross_inclusive", true);

      // Create Invoice structure
      const invoiceData = {
        customerId: adm.leadId,
        customerName: adm.studentName,
        customerType: "Student",
        revenueStream: "Student Admissions",
        programName: adm.courseSelected,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), // 7-day payment window
        subtotal: breakup.taxable,
        discount: 0,
        gstType: "Taxable",
        gstRate: 18,
        cgst: breakup.cgst,
        sgst: breakup.sgst,
        igst: breakup.igst,
        totalAmount: breakup.gross,
        notes: `Automatically generated from approved admission record.`,
        createdBy: "system_auto",
      };

      const inv = await createInvoiceApi(invoiceData);

      // Update the Admission record with the generated Invoice ID
      await axios.put(`${API_URL}/api/admissions/${req.requestId}`, { invoiceId: inv._id || inv.id }, headers);
    }
  } catch (error) {
    console.error("Failed to sync approval to admission or generate invoice:", error);
  }
}
