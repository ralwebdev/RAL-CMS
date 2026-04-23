import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CallLog } from '@/lib/types';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useCalllogs() {
  return useQuery({
    queryKey: ['calllogs'],
    queryFn: async () => {
      const token = localStorage.getItem("crm_token");
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get(`${API_URL}/api/calllogs`, { headers });
      return data.map((c: any) => ({ ...c, id: c._id })) as CallLog[];
    },
  });
}
