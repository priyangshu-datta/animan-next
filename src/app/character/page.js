import CharacterPage from '@/components/character-page';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <CharacterPage />
    </Suspense>
  );
}
