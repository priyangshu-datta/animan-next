import CharacterPage from '@/components/character-page'
import { Loading } from '@yamada-ui/react'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<Loading fontSize={'2xl'} />}>
      <CharacterPage />
    </Suspense>
  );
}
