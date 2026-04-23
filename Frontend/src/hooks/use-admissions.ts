import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useAdmissions() {
  return useQuery({
    queryKey: ['admissions'],
    queryFn: async () => {
      const token = localStorage.getItem("crm_token");
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get(`${API_URL}/api/admissions`, { headers });
      return data.map((a: any) => ({ ...a, id: a._id }));
    },
  });
}
