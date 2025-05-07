import { useQuery } from '@tanstack/react-query';
import { httpRequest } from '../../../api-clients/http-client';

export default function useUserInfo(options) {
  return useQuery({
    queryKey: ['me', 'info'],
    queryFn: async () =>
      httpRequest({
        provider: 'anilist',
        url: '/api/me/info',
        method: 'get',
      }),
    ...options,
  });
}
