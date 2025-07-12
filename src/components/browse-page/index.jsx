'use client';

import { Center, Select, VStack } from '@yamada-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CharactersSearchPageComponent from './characters';
import MediaSearchPageComponent from './media';
import StaffsSearchPageComponent from './staffs';
import StudiosSearchPageComponent from './studios';

export default function SearchPageComponent() {
  const searchParams = useSearchParams();
  const [searchSubject, setSearchSubject] = useState();
  useEffect(() => {
    setSearchSubject(searchParams.get('subject') ?? 'media');
  }, []);
  return (
    <Center p="2">
      <VStack
        maxW={{ sm: '100%', xl: '90%', '2xl': '80%', base: '60%' }}
        w="full"
      >
        <Select
          value={searchSubject}
          onChange={(option) => {
            const newSearchParams = new URLSearchParams();
            newSearchParams.set('subject', option);
            window.history.replaceState(
              null,
              '',
              `?${newSearchParams.toString().replaceAll(/=(&)|=$/g, '$1')}`
            );
            setSearchSubject(option);
          }}
          items={[
            { label: 'Media', value: 'media' },
            { label: 'Characters', value: 'characters' },
            { label: 'Staffs', value: 'staffs' },
            { label: 'Studios', value: 'studios' },
          ]}
        />
        {searchSubject === 'media' ? (
          <MediaSearchPageComponent />
        ) : searchSubject === 'characters' ? (
          <CharactersSearchPageComponent />
        ) : searchSubject === 'staffs' ? (
          <StaffsSearchPageComponent />
        ) : searchSubject === 'studios' ? (
          <StudiosSearchPageComponent />
        ) : (
          ''
        )}
      </VStack>
    </Center>
  );
}
