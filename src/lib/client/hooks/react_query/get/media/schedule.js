import { rpcRequest } from '@/lib/client/api-clients/rpc-client';
import { useQuery } from '@tanstack/react-query';

export function useSchedule({ startTimestamp, endTimestamp }) {
  return useQuery({
    queryKey: ['schedule', startTimestamp, endTimestamp],
    queryFn: () =>
      rpcRequest({
        action: 'get:anime:schedule',
        context: { startTimestamp, endTimestamp },
      }),
  });
}
