'use client';

import CharacterPage from '@/components/character-page';
import { CharacterProvider } from '@/context/use-character';
import { useCharacterFullInfoById } from '@/lib/client/hooks/react_query/get/character/info/full-by-id';
import { Center, Loading } from '@yamada-ui/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function Page() {
  const searchParams = useSearchParams();
  return (
    <Suspense fallback={<Loading fontSize={'2xl'} />}>
      <Character characterId={parseInt(searchParams.get('id'))} />
    </Suspense>
  );
}

function Character({ characterId }) {
  const { data } = useCharacterFullInfoById({ characterId });
  return (
    <Center>
      <CharacterProvider value={data.data.Character}>
        <CharacterPage />
      </CharacterProvider>
    </Center>
  );
}
