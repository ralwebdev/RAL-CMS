import axios from 'axios';
import {
  Invoice, Payment, EmiSchedule, Expense, Vendor, VendorBill,
  Budget, CashFlowEntry, FinanceLog, ExpenseCategory, PaymentMode,
} from "./finance-types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("crm_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/* ───────── API FETCHERS ───────── */

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const { data } = await axios.get(`${API_URL}/api/finance/invoices`, getHeaders());
  return data;
};

export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data } = await axios.get(`${API_URL}/api/finance/expenses`, getHeaders());
  return data;
};

export const fetchPayments = async (): Promise<Payment[]> => {
  const { data } = await axios.get(`${API_URL}/api/finance/payments`, getHeaders());
  return data;
};

export const fetchVendors = async (): Promise<Vendor[]> => {
  const { data } = await axios.get(`${API_URL}/api/finance/vendors`, getHeaders());
  return data;
};


/* ───────── API MUTATIONS ───────── */

export const createInvoiceApi = async (invoice: any) => {
  const { data } = await axios.post(`${API_URL}/api/finance/invoices`, invoice, getHeaders());
  return data;
};

export const updateInvoiceApi = async ({ id, ...patch }: any) => {
  const { data } = await axios.put(`${API_URL}/api/finance/invoices/${id}`, patch, getHeaders());
  return data;
};

export const createExpenseApi = async (expense: any) => {
  const { data } = await axios.post(`${API_URL}/api/finance/expenses`, expense, getHeaders());
  return data;
};

export const updateExpenseApi = async ({ id, ...patch }: any) => {
  const { data } = await axios.put(`${API_URL}/api/finance/expenses/${id}`, patch, getHeaders());
  return data;
};

export const createPaymentApi = async (payment: any) => {
  const { data } = await axios.post(`${API_URL}/api/finance/payments`, payment, getHeaders());
  return data;
};

export const createVendorApi = async (vendor: any) => {
  const { data } = await axios.post(`${API_URL}/api/finance/vendors`, vendor, getHeaders());
  return data;
};


/* ───────── MOCK DATA FOR UNSUPPORTED MODELS ───────── */
// The backend currently does not support VendorBills, Budgets, CashFlow, and EMIs.
// We keep static mock data here to prevent UI components from crashing.

const pad = (n: number, w = 4) => String(n).padStart(w, "0");

export function getMockFinanceData() {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1, 2)}`;
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
  const daysAhead = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

  const vendorBills: VendorBill[] = [
    { id: "vb1", billNo: "BAM-2410", vendorId: "v1", vendorName: "BrightAds Media", billDate: daysAgo(15), dueDate: daysAhead(5), amount: 80000, gst: 14400, total: 94400, paid: 0, status: "Pending", createdAt: daysAgo(15) },
    { id: "vb2", billNo: "CW-9921", vendorId: "v2", vendorName: "Cloudways Hosting", billDate: daysAgo(20), dueDate: daysAgo(2), amount: 22000, gst: 3960, total: 25960, paid: 0, status: "Overdue", createdAt: daysAgo(20) },
    { id: "vb3", billNo: "RENT-NOV", vendorId: "v4", vendorName: "Office Landlord", billDate: daysAgo(5), dueDate: daysAhead(10), amount: 60000, gst: 0, total: 60000, paid: 60000, status: "Paid", createdAt: daysAgo(5) },
  ];

  const budgets: Budget[] = [
    { id: "bud1", department: "Marketing", category: "Marketing", month: monthKey, plannedAmount: 100000, createdAt: now.toISOString() },
    { id: "bud2", department: "HR", category: "Salaries", month: monthKey, plannedAmount: 350000, createdAt: now.toISOString() },
  ];

  const emiSchedules: EmiSchedule[] = [];
  const cashflow: CashFlowEntry[] = [];
  const logs: FinanceLog[] = [];

  return {
    vendorBills,
    budgets,
    emiSchedules,
    cashflow,
    logs
  };
}

// Deprecated mock functions used by frontend until fully migrated
export function subscribeFinance(l: any) { return () => {}; }
export function getFinance() { 
  return { 
    invoices: [], payments: [], expenses: [], vendors: [], 
    ...getMockFinanceData() 
  }; 
}
export function recomputeOverdue() {}
export function autoSeedEmisForPartial() { return 0; }

// Dummy mock mutation functions to keep UI from breaking before Phase 4 is completely done on every sub-component
export function createInvoice(input: any, by: string) { return {} as Invoice; }
export function recordPayment(input: any, by: string) { return {} as Payment; }
export function createExpense(input: any, by: string) { return {} as Expense; }
export function setExpenseStatus(id: string, status: any, by: string) {}
export function createVendor(input: any, by: string) { return {} as Vendor; }
export function createVendorBill(input: any, by: string) { return {} as VendorBill; }
export function payVendorBill(id: string, amount: number, by: string) {}
export function createBudget(input: any, by: string) { return {} as Budget; }
export function payEmi(id: string, mode: any, by: string) {}
export function updateInvoice(id: string, patch: any, by: string) { return {} as Invoice; }
export function cancelInvoice(id: string, by: string, reason?: string) { return {} as Invoice; }
export function cloneInvoice(id: string, by: string) { return {} as Invoice; }
