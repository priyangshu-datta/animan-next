import { useMedia } from '@/context/use-media';
import { useMediaCharacters } from '@/lib/client/hooks/react_query/get/media/related/characters';
import { useDebounce } from '@/lib/client/hooks/use-debounce';
import { debounce, fuzzyRegexMatch, sentenceCase } from '@/utils/general';
import { Columns3Icon, Grid3x3Icon, SpeechIcon } from '@yamada-ui/lucide';
import {
  Accordion,
  AccordionItem,
  AccordionLabel,
  AccordionPanel,
  Box,
  Button,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  EmptyState,
  EmptyStateTitle,
  Flex,
  Heading,
  IconButton,
  Image,
  Input,
  Link,
  Loading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Separator,
  Status,
  Text,
  Toggle,
  ToggleGroup,
  useDisclosure,
  VStack,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import Spoiler from '../spoiler';

function fuzzySearchGrouped(query, data) {
  const results = [];

  for (let i = 0; i < data.length; i++) {
    for (const item of data[i]) {
      const match = fuzzyRegexMatch(query, item);
      if (match) {
        results.push(i);
        break;
      }
    }
  }

  return results;
}

export default function RelatedCharacters(props) {
  const media = useMedia();
  // const { mediaId: media.id, mediaType: media.type } = props;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useMediaCharacters({ mediaId: media.id, mediaType: media.type });

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    if (isFetched) {
      const searchData = data?.pages.flatMap((page) => page.characters) ?? [];

      const indices = fuzzySearchGrouped(
        debouncedSearchTerm,
        searchData.map(({ character }) => {
          return [
            character.name.full,
            character.name.native,
            character.name.userPreferred,
            ...character.name.alternative,
            // character.name.alternativeSpoiler
          ];
        })
      );
      setSearchResult(indices.map((i) => searchData[i]));
    }
  }, [
    data,
    isFetched,
    setSearchResult,
    fuzzySearchGrouped,
    debouncedSearchTerm,
  ]);

  return (
    <Flex direction={'column'} gap="4" justify={'center'}>
      <Input
        placeholder="Search related Characters"
        onChange={(ev) => setSearchTerm(ev.target.value)}
      />
      {isFetched ? (
        searchResult.length ? (
          <Accordion toggle defaultIndex={0}>
            {Object.entries(
              Object.groupBy(searchResult, ({ character }) => character.role)
            ).map(([characterRole, charactersGroup]) => (
              <AccordionItem key={characterRole}>
                <AccordionLabel>
                  {sentenceCase(characterRole.split('_').join(' '))}
                </AccordionLabel>
                <AccordionPanel>
                  <CharactersGroupComponent charactersGroup={charactersGroup} />
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No Characters found</EmptyStateTitle>
          </EmptyState>
        )
      ) : (
        <Loading fontSize={'lg'} />
      )}

      {hasNextPage && (
        <Button
          w={'full'}
          onClick={fetchMore}
          disabled={isFetchingNextPage || !hasNextPage}
        >
          {isFetchingNextPage ? <Loading variant="grid" /> : 'Load More'}
        </Button>
      )}
    </Flex>
  );
}

function RelatedCharacterCard({ character, voiceActors }) {
  const { open, onOpen, onClose } = useDisclosure();
  const [vaContext, setVAContext] = useState();
  const media = useMedia();
  return (
    <Flex gap="4" align={'center'} flexShrink={0}>
      <VStack gap="0">
        <CharacterCard
          character={character}
          key={character.id}
          dataListItems={
            <DataListItem>
              <DataListTerm>Role</DataListTerm>
              <DataListDescription>
                {sentenceCase(character.role)}
              </DataListDescription>
            </DataListItem>
          }
        />
        <Menu>
          <MenuButton
            p="0"
            roundedTop={'none'}
            as={IconButton}
            bgColor={'whiteAlpha.700'}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <SpeechIcon fontSize={'2xl'} />
          </MenuButton>

          <MenuList>
            {Object.entries(
              Object.groupBy(voiceActors, ({ language }) => language)
            ).map(([language, VAs]) => (
              <MenuItem
                key={`${character.id}-${language}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setVAContext({ language, VAs });
                  return onOpen();
                }}
              >
                {language}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </VStack>

      <VoiceActorsListModal
        character={character}
        media={media}
        onClose={onClose}
        open={open}
        vaContext={vaContext}
      />
    </Flex>
  );
}

function CharactersGroupComponent({ charactersGroup }) {
  const [cardGroupStyle, setCardGroupStyle] = useState('columns');

  return (
    <VStack w="full" wrap="wrap" justify={'center'} gap="md">
      <ToggleGroup
        ml="auto"
        value={cardGroupStyle}
        onChange={setCardGroupStyle}
      >
        <Toggle value="columns" disabled={cardGroupStyle === 'columns'}>
          <Columns3Icon />
        </Toggle>
        <Toggle value="grid" disabled={cardGroupStyle === 'grid'}>
          <Grid3x3Icon />
        </Toggle>
      </ToggleGroup>
      {cardGroupStyle === 'grid' && (
        <Flex gap="2" wrap="wrap" justify={'center'}>
          {charactersGroup.map(({ id, character, voiceActors }) => (
            <RelatedCharacterCard
              key={id}
              character={character}
              voiceActors={voiceActors}
            />
          ))}
        </Flex>
      )}
      {cardGroupStyle === 'columns' && (
        <Flex
          gap="4"
          w="full"
          overflow={'auto'}
          p="4"
          boxShadow={'inner'}
          _dark={{
            boxShadow: '0px 0px 0px 0px rgba(255,255,255,1) inset',
          }}
          bgColor={'whiteAlpha.100'}
        >
          {charactersGroup.map(({ id, character, voiceActors }) => (
            <RelatedCharacterCard
              key={id}
              character={character}
              voiceActors={voiceActors}
            />
          ))}
        </Flex>
      )}
    </VStack>
  );
}

function VoiceActorsListModal({ character, media, onClose, open, vaContext }) {
  return (
    <Modal open={open} size="4xl">
      <ModalHeader>
        <Heading size="xl" fontWeight={'normal'}>
          {vaContext?.language} voice actor
          {vaContext?.VAs?.length > 1 ? 's' : ''} (
          <em>{character.name.userPreferred}</em> in{' '}
          <strong>{media.title.userPreferred}</strong>)
        </Heading>
      </ModalHeader>
      <ModalBody>
        <VStack>
          {vaContext?.VAs?.map((va, index) => (
            <Fragment key={`${media.id}-${va.id}`}>
              <VoiceActorListItem character={character} voiceActor={va} />
              {index !== vaContext.VAs.length - 1 && <Separator />}
            </Fragment>
          ))}
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => onClose()}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

function VoiceActorListItem({ character, voiceActor }) {
  const profileImageRef = useRef(null);
  const descriptionRef = useRef(null);
  const [startingHeight, setStartingHeight] = useState(135);

  useEffect(() => {
    if (descriptionRef.current && profileImageRef.current) {
      setStartingHeight(
        207 -
          (descriptionRef.current.getBoundingClientRect().top -
            profileImageRef.current.getBoundingClientRect().top) -
          20
      );
    }
  }, [voiceActor]);

  return (
    <Flex gap="4" align={'start'} position={'relative'}>
      <Box boxShadow={'xl'} flexShrink={0} position={'sticky'} top="0">
        <Image
          ref={profileImageRef}
          src={voiceActor?.image?.large}
          objectFit="cover"
          objectPosition={'center'}
          w="32"
          aspectRatio={0.61805}
          alt={voiceActor?.name?.userPreferred}
          _dark={{
            boxShadow: '0px 2px 5px 0px rgb(123 118 118 / 94%)',
          }}
          boxShadow={
            '0 1px 1px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% / 0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075), 0 8px 8px hsl(0deg 0% 0% / 0.075), 0 16px 16px hsl(0deg 0% 0% / 0.075)'
          }
        />
      </Box>
      <VStack position="relative" h="full">
        <Heading
          size="lg"
          fontSize={'2xl'}
          position={'sticky'}
          top="0"
          zIndex="2"
          bgColor={'white'}
        >
          <Link as={NextLink} href={`/va?id=${voiceActor.id}`} color="link.200">
            {voiceActor.name.userPreferred}
          </Link>
        </Heading>
        {voiceActor.roleNotes && (
          <Status>
            {voiceActor.name.userPreferred} voices{' '}
            <em>{character.name.userPreferred}</em> ({voiceActor.roleNotes})
            {voiceActor.dubGroup ? ` in ${voiceActor.dubGroup} dubbing` : '.'}
          </Status>
        )}
        {!voiceActor.roleNotes && voiceActor.dubGroup && (
          <Status>
            {voiceActor.name.userPreferred} voices{' '}
            <em>{character.name.userPreferred}</em> in {voiceActor.dubGroup}{' '}
            dubbing.
          </Status>
        )}
        {(voiceActor.roleNotes || voiceActor.dubGroup) &&
          voiceActor.description && <Separator />}
        <Box ref={descriptionRef}>
          <Spoiler
            text={voiceActor.description}
            startingHeight={startingHeight}
          />
        </Box>
      </VStack>
    </Flex>
  );
}

function CharacterCard({
  character,
  aboveDataListComponent,
  dataListItems,
  belowDataListComponent,
}) {
  return (
    <Popover closeOnButton={false} trigger="hover">
      <PopoverTrigger>
        <Box boxShadow={'2xl'} flexShrink={0}>
          <Image
            src={character?.image?.large}
            objectFit="cover"
            w="32"
            aspectRatio={0.61805}
            alt={character?.name?.userPreferred}
            _dark={{
              boxShadow: '0px 2px 5px 0px rgb(123 118 118 / 94%)',
            }}
            boxShadow={
              '0 1px 1px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% / 0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075), 0 8px 8px hsl(0deg 0% 0% / 0.075), 0 16px 16px hsl(0deg 0% 0% / 0.075)'
            }
          />
        </Box>
      </PopoverTrigger>

      <PopoverContent style={{ width: '15rem' }}>
        <PopoverHeader>
          <Link as={NextLink} href={`/character?id=${character.id}`}>
            <Text lineClamp={1}>{character?.name?.userPreferred}</Text>
          </Link>
        </PopoverHeader>
        <PopoverBody>
          {aboveDataListComponent}
          <DataList col={2} w="full">
            {dataListItems}
          </DataList>
          {belowDataListComponent}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
