import MediaPage from '@/components/media-page';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <Suspense>
      <MediaPage />
    </Suspense>
  );
}
