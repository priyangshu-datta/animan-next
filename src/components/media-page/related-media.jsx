import { useMedia } from '@/context/use-media';
import { useMediaRelatedMedia } from '@/lib/client/hooks/react_query/get/media/related/media';
import { Columns3Icon, Grid3x3Icon } from '@yamada-ui/lucide';
import {
  Accordion,
  AccordionItem,
  AccordionLabel,
  AccordionPanel,
  Box,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  Heading,
  Input,
  Loading,
  Select,
  Skeleton,
  Toggle,
  ToggleGroup,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useState } from 'react';
import MediaCard from '../media-card';
import { fuzzyRegexMatch, sentenceCase } from '@/utils/general';
import { useDebounce } from '@/lib/client/hooks/use-debounce';
import { MEDIA_FORMAT } from '@/lib/constants';

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

export default function RelatedMedia() {
  const media = useMedia();
  const { data, isFetched } = useMediaRelatedMedia({
    mediaId: media.id,
    mediaType: media.type,
  });

  const [mediaType, setMediaType] = useState('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    if (isFetched) {
      const searchData = data.filter(
        ({ media }) =>
          mediaType === 'all' || media.type.toLowerCase() === mediaType
      );

      const indices = fuzzySearchGrouped(
        debouncedSearchTerm,
        searchData.map(({ media }) => {
          return [
            media.title.full,
            media.title.native,
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
    <Flex direction={'column'} gap="4">
      <VStack>
        <Select
          value={mediaType}
          onChange={(option) => {
            setMediaType(option);
          }}
          items={[
            { label: 'All Media', value: 'all' },
            { label: 'Anime', value: 'anime' },
            { label: 'Manga', value: 'manga' },
          ]}
        />
        <Input
          placeholder="Search related Media"
          onChange={(ev) => setSearchTerm(ev.target.value)}
        />
      </VStack>

      {isFetched ? (
        <Accordion toggle defaultIndex={0}>
          {Object.entries(
            Object.groupBy(searchResult, ({ media }) => {
              return media.relationType;
            })
          ).map(([key, value]) => (
            <AccordionItem key={key}>
              <AccordionLabel>
                {sentenceCase(key.split('_').join(' '))}
              </AccordionLabel>
              <AccordionPanel>
                <CustomComponent value={value} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Loading fontSize={'xl'} />
      )}
    </Flex>
  );
}

function CustomComponent({ value }) {
  const [cardGroupStyle, setCardGroupStyle] = useState('columns');

  return (
    <Flex direction={'column'} gap="4">
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
          {value?.map(({ media, entry }) => (
            <MediaCard
              media={media}
              entry={entry}
              key={media.id}
              dataListItems={
                <DataListItem>
                  <DataListTerm>Format</DataListTerm>
                  <DataListDescription>
                    {media.format &&
                      MEDIA_FORMAT[media.type.toLowerCase()].find(
                        ({ value }) => value === media.format
                      ).label}
                  </DataListDescription>
                </DataListItem>
              }
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
          {value?.map(({ media, entry }) => (
            <MediaCard
              media={media}
              entry={entry}
              key={media.id}
              dataListItems={
                <DataListItem>
                  <DataListTerm>Format</DataListTerm>
                  <DataListDescription>
                    {media.format &&
                      MEDIA_FORMAT[media.type.toLowerCase()].find(
                        ({ value }) => value === media.format
                      ).label}
                  </DataListDescription>
                </DataListItem>
              }
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
}
