import MediaPage from '@/components/media-page';
import { Loading } from '@yamada-ui/react';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <Suspense fallback={<Loading fontSize={'2xl'} />}>
      <MediaPage />
    </Suspense>
  );
}
