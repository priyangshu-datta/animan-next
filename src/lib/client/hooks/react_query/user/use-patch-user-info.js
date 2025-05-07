import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpRequest } from '../../../api-clients/http-client';

export default function usePatchUserInfo(options) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) =>
      httpRequest({
        provider: 'anilist',
        url: '/api/me/info',
        method: 'patch',
        data: data,
      }),
    ...options,
    onSuccess: ()=>{
      queryClient.invalidateQueries(["me", "info"])
    }
  });
}
