import { useCharacter } from '@/context/use-character';
import { useCharacterMedia } from '@/lib/client/hooks/react_query/get/character/related/media';
import { useDebounce } from '@/lib/client/hooks/use-debounce';
import { MEDIA_FORMAT } from '@/lib/constants';
import { debounce, fuzzyRegexMatch } from '@/utils/general';
import { Columns3Icon, Grid3x3Icon, SpeechIcon } from '@yamada-ui/lucide';
import {
  Accordion,
  AccordionItem,
  AccordionLabel,
  AccordionPanel,
  Box,
  Button,
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
  Option,
  Select,
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
import MediaCard from '../media-card';
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

export default function RelatedMedia({ characterId, Wrapper }) {
  const [mediaType, setMediaType] = useState('ANIME');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetched } =
    useCharacterMedia({ characterId, mediaType });

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
      const searchData = data?.pages.flatMap((page) => page.data) ?? [];

      const indices = fuzzySearchGrouped(
        debouncedSearchTerm,
        searchData.map(({ media }) => {
          return [
            media.title.romaji,
            media.title.native,
            media.title.english,
            media.title.userPreferred,
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
    <Flex gap="4" direction={'column'}>
      <Select
        defaultValue={mediaType}
        onChange={(option) => setMediaType(option)}
      >
        <Option value="ANIME">Anime</Option>
        <Option value="MANGA">Manga</Option>
      </Select>

      <Input
        placeholder="Search related Media"
        onChange={(ev) => setSearchTerm(ev.target.value)}
      />

      <Flex
        wrap={'wrap'}
        overflow={'hidden'}
        w={'full'}
        justify={'center'}
        gap="md"
        align={'center'}
      >
        {isFetched ? (
          searchResult.length ? (
            <Accordion toggle defaultIndex={0}>
              {Object.entries(
                Object.groupBy(searchResult, ({ media }) => media.format)
              ).map(([format, mediaGroups]) => {
                return (
                  <AccordionItem key={format}>
                    <AccordionLabel>
                      {MEDIA_FORMAT[mediaType.toLowerCase()].find(
                        ({ value }) => value === format
                      )?.label ?? 'TBA'}
                    </AccordionLabel>
                    <AccordionPanel>
                      <MediaGroupComponent
                        Wrapper={Wrapper}
                        mediaGroups={mediaGroups}
                      />
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <EmptyState>
              <EmptyStateTitle>No result found</EmptyStateTitle>
            </EmptyState>
          )
        ) : (
          <Loading fontSize={'lg'} />
        )}

        {hasNextPage && (
          <Button
            w={'full'}
            mt={'2'}
            onClick={fetchMore}
            disabled={isFetchingNextPage || !hasNextPage}
          >
            {isFetchingNextPage ? <Loading variant="grid" /> : 'Load More'}
          </Button>
        )}
      </Flex>
    </Flex>
  );
}

function RelatedMediaCard({ entry, media, voiceActors, characterRole }) {
  const { open, onOpen, onClose } = useDisclosure();

  const character = useCharacter();

  const [vaContext, setVAContext] = useState();
  return (
    <Flex gap="4" align={'center'} flexShrink={0}>
      <VStack gap="0">
        <MediaCard
          entry={entry}
          media={media}
          key={media.id}
          aboveDataListComponent={
            <>
              <Text>
                <em>{character.name.userPreferred}</em> plays a{' '}
                <span className="underline">{characterRole.toLowerCase()}</span>{' '}
                role.
              </Text>
              <Separator />
            </>
          }
        />
        <Menu>
          <MenuButton
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
                key={`${media.id}-${language}`}
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

function MediaGroupComponent({ Wrapper, mediaGroups }) {
  const [cardGroupStyle, setCardGroupStyle] = useState('columns');

  function Component({ mediaCardDetail }) {
    const { id, entry, media, voiceActors, characterRole } = mediaCardDetail;
    return Wrapper ? (
      <Wrapper key={id} {...mediaCardDetail}>
        <RelatedMediaCard
          entry={entry}
          media={media}
          voiceActors={voiceActors}
          characterRole={characterRole}
        />
      </Wrapper>
    ) : (
      <RelatedMediaCard
        key={id}
        entry={entry}
        media={media}
        voiceActors={voiceActors}
        characterRole={characterRole}
      />
    );
  }

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
          {mediaGroups.map((mediaCardDetail) => (
            <Component
              key={mediaCardDetail.id}
              mediaCardDetail={mediaCardDetail}
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
          {mediaGroups.map((mediaCardDetail) => (
            <Component
              key={mediaCardDetail.id}
              mediaCardDetail={mediaCardDetail}
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
          {vaContext?.VAs?.length > 1 ? 's' : ''} voicing{' '}
          <em>{character.name.userPreferred}</em> in{' '}
          <strong>{media.title.userPreferred}</strong>
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
    <Flex gap="4">
      <Box boxShadow={'xl'} flexShrink={0}>
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
      <VStack>
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
