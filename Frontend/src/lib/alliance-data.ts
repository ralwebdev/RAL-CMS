/**
 * Industry Alliances Module — API Store (Backend Integration)
 */
import axios from 'axios';
import type {
  AllianceUser, Institution, AllianceContact, AllianceVisit, AllianceTask,
  AllianceProposal, AllianceEvent, AllianceExpense,
} from "./alliance-types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── DEMO USERS (separate from main CRM users until Phase 5) ──
export const allianceUsers: AllianceUser[] = [
  { id: "69e74aa7130b33ab72372885", name: "Rohit Banerjee", email: "rohit@redapple.com", role: "alliance_manager", status: "active", createdAt: new Date().toISOString() },
  { id: "69e74aa7130b33ab72372888", name: "Sneha Roy", email: "sneha@redapple.com", role: "alliance_executive", status: "active", createdAt: new Date().toISOString() },
  // These two might not be in DB yet, using generated ObjectIds for Karan and Pooja to satisfy schema
  { id: "69e74aa7130b33ab72372889", name: "Karan Mehta", email: "karan@redapple.com", role: "alliance_executive", status: "active", createdAt: new Date().toISOString() },
  { id: "69e74aa7130b33ab7237288a", name: "Pooja Nair", email: "pooja@redapple.com", role: "alliance_executive", status: "active", createdAt: new Date().toISOString() },
];

const getHeaders = () => {
  const token = localStorage.getItem("crm_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/* ───────── API FETCHERS ───────── */

export const fetchInstitutions = async (): Promise<Institution[]> => {
  const { data } = await axios.get(`${API_URL}/api/alliances/institutions`, getHeaders());
  return data;
};

export const fetchVisits = async (): Promise<AllianceVisit[]> => {
  const { data } = await axios.get(`${API_URL}/api/alliances/visits`, getHeaders());
  return data;
};

export const fetchProposals = async (): Promise<AllianceProposal[]> => {
  const { data } = await axios.get(`${API_URL}/api/alliances/proposals`, getHeaders());
  return data;
};

// Dummy fetchers for tabs not yet fully backend-ready (maintaining UI)
export const fetchContacts = async (): Promise<AllianceContact[]> => [];
export const fetchTasks = async (): Promise<AllianceTask[]> => {
  const { data } = await axios.get(`${API_URL}/api/alliances/tasks`, getHeaders());
  return data;
};
export const fetchEvents = async (): Promise<AllianceEvent[]> => {
  const { data } = await axios.get(`${API_URL}/api/alliances/events`, getHeaders());
  return data;
};
export const fetchExpenses = async (): Promise<AllianceExpense[]> => {
  const { data } = await axios.get(`${API_URL}/api/alliances/expenses`, getHeaders());
  return data;
};

/* ───────── MUTATIONS ───────── */

export const createInstitutionApi = async (input: Partial<Institution>): Promise<Institution> => {
  const { data } = await axios.post(`${API_URL}/api/alliances/institutions`, input, getHeaders());
  return data;
};

export const updateInstitutionApi = async (id: string, input: Partial<Institution>): Promise<Institution> => {
  const { data } = await axios.put(`${API_URL}/api/alliances/institutions/${id}`, input, getHeaders());
  return data;
};

export const createVisitApi = async (input: Partial<AllianceVisit>): Promise<AllianceVisit> => {
  const { data } = await axios.post(`${API_URL}/api/alliances/visits`, input, getHeaders());
  return data;
};

export const createProposalApi = async (input: Partial<AllianceProposal>): Promise<AllianceProposal> => {
  const { data } = await axios.post(`${API_URL}/api/alliances/proposals`, input, getHeaders());
  return data;
};

export const updateProposalApi = async (id: string, input: Partial<AllianceProposal>): Promise<AllianceProposal> => {
  const { data } = await axios.put(`${API_URL}/api/alliances/proposals/${id}`, input, getHeaders());
  return data;
};

export const createTaskApi = async (input: Partial<AllianceTask>): Promise<AllianceTask> => {
  const { data } = await axios.post(`${API_URL}/api/alliances/tasks`, input, getHeaders());
  return data;
};

export const updateTaskApi = async (id: string, input: Partial<AllianceTask>): Promise<AllianceTask> => {
  const { data } = await axios.put(`${API_URL}/api/alliances/tasks/${id}`, input, getHeaders());
  return data;
};

export const createEventApi = async (input: Partial<AllianceEvent>): Promise<AllianceEvent> => {
  const { data } = await axios.post(`${API_URL}/api/alliances/events`, input, getHeaders());
  return data;
};

export const createExpenseApi = async (input: Partial<AllianceExpense>): Promise<AllianceExpense> => {
  const { data } = await axios.post(`${API_URL}/api/alliances/expenses`, input, getHeaders());
  return data;
};

/* ───────── LEGACY STORE (Deprecated) ───────── */
// Keeping some utilities for compatibility until refactoring is 100% complete
export const allianceStore = {
  getUsers: () => [],
  resetAll: () => {},
};

// CSV export utility
export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
