import { useQuery } from '@tanstack/react-query';
import { httpRequest } from '@/lib/client/api-clients/http-client';

export default function useLinkedAccounts(options) {
  return useQuery({
    queryKey: ['me', 'linked-accounts'],
    queryFn: async () =>
      httpRequest({
        provider: 'anilist',
        url: '/api/me/linked-accounts',
        method: 'get',
      }),
    ...options,
  });
}
