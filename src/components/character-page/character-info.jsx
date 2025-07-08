import { useCharacter } from '@/context/use-character';
import { useOptimisticToggleCharacterFavourite } from '@/lib/client/hooks/react_query/patch/user/character/toggle-favourite';
import { formatPartialDate } from '@/utils/general';
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
  SkeletonText,
  Toggle,
  VStack,
} from '@yamada-ui/react';

export default function CharacterInfo({
  onReviewEditorOpen,
  setCurrentReviewMetadata,
}) {
  const character = useCharacter();

  const {
    characterIsFavourite,
    toggleCharacterFavourite,
    togglingCharacterFavourite,
  } = useOptimisticToggleCharacterFavourite({
    characterIsFavourite: !!character?.isFavourite,
  });

  return (
    <VStack gap="0">
      <CardHeader>
        {character.isLoading ? (
          <SkeletonText lineClamp={1}>
            <Heading size="lg">Monkey D. Luffy</Heading>
          </SkeletonText>
        ) : (
          <Heading size="lg">{character?.name?.userPreferred}</Heading>
        )}
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
        <CharacterInfoDataList />

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

function CharacterInfoDataList() {
  const character = useCharacter();
  if (character.isLoading) {
    return (
      <DataList
        col={2}
        variant={'subtle'}
        size={{ base: 'lg' }}
        gapY={{ base: '4', lg: '2' }}
      >
        <DataListItem>
          <SkeletonText lineClamp={1}>
            <DataListTerm>Gender</DataListTerm>
          </SkeletonText>
          <SkeletonText lineClamp={1}>
            <DataListDescription>Male</DataListDescription>
          </SkeletonText>
        </DataListItem>
        <DataListItem>
          <SkeletonText lineClamp={1}>
            <DataListTerm>Age</DataListTerm>
          </SkeletonText>
          <SkeletonText lineClamp={1}>
            <DataListDescription>19</DataListDescription>
          </SkeletonText>
        </DataListItem>
        <DataListItem>
          <SkeletonText lineClamp={1}>
            <DataListTerm>Blood Type</DataListTerm>
          </SkeletonText>
          <SkeletonText lineClamp={1}>
            <DataListDescription>F</DataListDescription>
          </SkeletonText>
        </DataListItem>
        <DataListItem>
          <SkeletonText lineClamp={1}>
            <DataListTerm>Date of Birth</DataListTerm>
          </SkeletonText>
          <SkeletonText lineClamp={1}>
            <DataListDescription>May 5</DataListDescription>
          </SkeletonText>
        </DataListItem>
      </DataList>
    );
  }
  return (
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
      {(character?.dateOfBirth?.day ||
        character?.dateOfBirth?.month ||
        character?.dateOfBirth?.year) && (
        <DataListItem>
          <DataListTerm>Date of Birth</DataListTerm>
          <DataListDescription>
            {formatPartialDate({
              day: character?.dateOfBirth?.day,
              month: character?.dateOfBirth?.month,
              year: character?.dateOfBirth?.year,
            })}
          </DataListDescription>
        </DataListItem>
      )}
    </DataList>
  );
}
