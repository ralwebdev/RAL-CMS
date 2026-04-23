import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Lead } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const token = localStorage.getItem("crm_token");
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get(`${API_URL}/api/leads`, { headers });
      return data.map((l: any) => ({ ...l, id: l._id })) as Lead[];
    },
  });
}
