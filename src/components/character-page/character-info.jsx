import { useCharacter } from '@/context/use-character';
import { useOptimisticToggleCharacterFavourite } from '@/lib/client/hooks/react_query/patch/user/character/toggle-favourite';
import { MONTH_NAMES } from '@/lib/constants';
import { HeartIcon } from '@yamada-ui/lucide';
import {
  Button,
  CardBody,
  CardHeader,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Heading,
  Loading,
  Toggle,
  VStack,
} from '@yamada-ui/react';

export default function CharacterInfo({ onReviewEditorOpen, setCurrentReviewMetadata }) {
  const character = useCharacter();

  const { day, month, year } = character.dateOfBirth;

  const {
    characterIsFavourite,
    toggleCharacterFavourite,
    togglingCharacterFavourite,
  } = useOptimisticToggleCharacterFavourite({
    characterIsFavourite: character.isFavourite,
  });

  return (
    <VStack gap="0">
      <CardHeader>
        <Heading size="lg">{character.name.userPreferred}</Heading>
        <Toggle
          borderRadius={'full'}
          value="favourite"
          selected={characterIsFavourite}
          colorScheme="red"
          variant={'solid'}
          icon={togglingCharacterFavourite ? <Loading /> : <HeartIcon />}
          aria-label="Favourite Characrter"
          onChange={() => {
            toggleCharacterFavourite({ characterId: character.id });
          }}
        />
      </CardHeader>

      <CardBody>
        <DataList
          col={2}
          variant={'subtle'}
          size={{ base: 'lg' }}
          gapY={{ base: '4', lg: '2' }}
        >
          {character.gender && (
            <DataListItem>
              <DataListTerm>Gender</DataListTerm>
              <DataListDescription>{character.gender}</DataListDescription>
            </DataListItem>
          )}
          {character.age && (
            <DataListItem>
              <DataListTerm>Age</DataListTerm>
              <DataListDescription>{character.age}</DataListDescription>
            </DataListItem>
          )}
          {character.bloodType && (
            <DataListItem>
              <DataListTerm>Blood Type</DataListTerm>
              <DataListDescription>{character.bloodType}</DataListDescription>
            </DataListItem>
          )}
          {(day || month || year) && (
            <DataListItem>
              <DataListTerm>Date of Birth</DataListTerm>
              <DataListDescription>
                {day ?? ''} {month ? MONTH_NAMES[month - 1] : ''} {year ?? ''}
              </DataListDescription>
            </DataListItem>
          )}
        </DataList>

        <Button
          onClick={() => {
            setCurrentReviewMetadata(null);
            onReviewEditorOpen();
          }}
        >
          Review
        </Button>
      </CardBody>
    </VStack>
  );
}
