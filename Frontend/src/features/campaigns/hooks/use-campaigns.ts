import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CampaignsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const useCampaigns = (params: CampaignsParams = {}) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      const { data } = await api.get('/api/campaigns', { params });
      // Handle both array (old) and object (new paginated) response
      const campaigns = (data.campaigns || data || []).map((c: any) => ({ ...c, id: c._id }));
      return Array.isArray(data) ? campaigns : { ...data, campaigns };
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/campaigns', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
