import SearchPageComponent from '@/components/browse-page';
import { Suspense } from 'react';

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageComponent />
    </Suspense>
  );
}
