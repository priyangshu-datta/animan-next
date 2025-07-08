import { useMedia } from '@/context/use-media';
import {
  Box,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  EmptyState,
  EmptyStateTitle,
  Flex,
  Image,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { useMemo } from 'react';
import TextWithCopyButton from '../text-with-copy-btn';

export default function Episodes() {
  const media = useMedia();
  const episodes = useMemo(
    () =>
      media.status === 'CURRENT'
        ? media.streamingEpisodes.map((episode, index) => ({
            ...episode,
            number: media.streamingEpisodes.length - index,
          }))
        : media.streamingEpisodes
            .map((episode, index) => ({
              ...episode,
              number: media.streamingEpisodes.length - index,
            }))
            .reverse(),
    [media]
  );

  return episodes.length > 0 ? (
    <Flex wrap="wrap" gap="4" justifyContent={'center'}>
      {episodes.map((episode) => (
        <Popover trigger="hover" closeOnButton={false} key={episode.title}>
          <PopoverTrigger>
            <Box
              aspectRatio={16 / 9}
              w="30%"
              boxShadow={'xl'}
              position={'relative'}
              minW="64"
            >
              <Image
                w="full"
                h="full"
                objectFit={'cover'}
                src={episode.thumbnail}
              />

              <Text
                position={'absolute'}
                top="0"
                left="0"
                fontSize={'lg'}
                p="2"
                bgColor={'ActiveCaption'}
                rounded={'md'}
                m="2"
              >
                {String(episode.number).padStart(
                  `${media.streamingEpisodes.length}`.length,
                  0
                )}
              </Text>
            </Box>
          </PopoverTrigger>

          <PopoverContent>
            <PopoverBody px="3" py="1">
              <DataList col={2} w="full" size="lg">
                <DataListItem>
                  <DataListTerm>Title</DataListTerm>
                  <DataListDescription display={'flex'} gap="2">
                    <TextWithCopyButton
                      copyText={episode.title
                        .split(/Episode \d+ -/)
                        .at(1)
                        .trim()}
                      textComponent={
                        <Link as={NextLink} href={episode.url}>
                          {episode.title
                            .split(/Episode \d+ -/)
                            .at(1)
                            .trim()}
                        </Link>
                      }
                      variant="link"
                    />
                  </DataListDescription>
                </DataListItem>
                <DataListItem>
                  <DataListTerm>Site</DataListTerm>
                  <DataListDescription>{episode.site}</DataListDescription>
                </DataListItem>
              </DataList>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ))}
    </Flex>
  ) : (
    <EmptyState>
      <EmptyStateTitle>
        {media.status === 'NOT_YET_RELEASED' ? 'Wait for it!' : 'No data here'}
      </EmptyStateTitle>
    </EmptyState>
  );
}
