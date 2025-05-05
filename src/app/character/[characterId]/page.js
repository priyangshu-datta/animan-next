'use client';

import CharacterPage from '@/components/character-page';
import { CharacterProvider } from '@/context/use-character';
import { useCharacterById } from '@/lib/client/hooks/react_query/graphql/use-character-by-id';
import { Center, Loading } from '@yamada-ui/react';
import { useParams } from 'next/navigation';

export default function Character() {
  const { characterId } = useParams();

  const { data, isLoading, isSuccess } = useCharacterById(characterId);

  return (
    <Center>
      {isLoading ? (
        <Loading />
      ) : (
        isSuccess && (
          <CharacterProvider value={data.data.Character}>
            <CharacterPage />
          </CharacterProvider>
        )
      )}
    </Center>
  );
}
