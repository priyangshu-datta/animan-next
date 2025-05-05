import { useCharacter } from '@/context/use-character';
import { useToggleFavourite } from '@/lib/client/hooks/react_query/graphql/use-small-hooks';
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

export default function CharacterInfo(props) {
  const { onReviewEditorOpen, setEditorContext } = props;

  const character = useCharacter();

  const { day, month, year } = character.dateOfBirth;

  const { isFavourite, toggleFavourite, togglingFavourite } =
    useToggleFavourite({
      subjectType: 'character',
      isFavourite: character.isFavourite,
    });

  return (
    <VStack gap="0">
      <CardHeader>
        <Heading size="lg">{character.name.userPreferred}</Heading>
        <Toggle
          borderRadius={'full'}
          value="favourite"
          selected={isFavourite}
          colorScheme="red"
          variant={'solid'}
          icon={togglingFavourite ? <Loading /> : <HeartIcon />}
          aria-label="Favourite Characrter"
          onChange={() => {
            toggleFavourite({ subjectId: character.id });
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
            setEditorContext({
              id: null,
              rating: 0,
              associatedMedia: null,
              emotions: [],
              review: '',
              favourite: false,
            });
            onReviewEditorOpen();
          }}
        >
          Review
        </Button>
      </CardBody>
    </VStack>
  );
}
