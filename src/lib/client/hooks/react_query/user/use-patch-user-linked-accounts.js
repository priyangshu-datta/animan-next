import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpRequest } from '@/lib/client/api-clients/http-client';

export default function usePatchUserLinkedAccounts(options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) =>
      httpRequest({
        provider: 'anilist',
        url: '/api/me/linked-accounts',
        method: 'patch',
        data: data,
      }),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries(['me', 'linked-accounts']);
    },
  });
}
