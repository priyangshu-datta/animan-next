'use client';

import { makeQueryClient } from '@/lib/client/api-clients/query-client';
import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

const Providers = ({ children }) => {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <ProgressProvider
      height="4px"
      options={{ showSpinner: false,  }}
      shallowRouting
      
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ProgressProvider>
  );
};

export default Providers;
