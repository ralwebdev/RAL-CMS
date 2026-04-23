import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useFollowups() {
  return useQuery({
    queryKey: ['followups'],
    queryFn: async () => {
      const token = localStorage.getItem("crm_token");
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get(`${API_URL}/api/followups`, { headers });
      return data.map((f: any) => ({ ...f, id: f._id }));
    },
  });
}
