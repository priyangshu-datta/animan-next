import { useMedia } from '@/context/use-media';
import { COUNTRY_OF_ORIGIN, MEDIA_FORMAT } from '@/lib/constants';
import {
  formatMinutesToReadableString,
  formatOrdinal,
  formatPartialDate,
  sentenceCase,
} from '@/utils/general';
import { FlameIcon, HeartIcon, LinkIcon, StarIcon } from '@yamada-ui/lucide';
import {
  Badge,
  Box,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  Image,
  Tag,
  Text,
  useMediaQuery,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { Fragment } from 'react';
import MediaTitleSynonyms from '../media-info/synonyms';
import MediaTags from '../media-info/tags';
import TextWithCopyButton from '../text-with-copy-btn';

export default function Details() {
  const media = useMedia();

  const [isMd] = useMediaQuery(['(width < 786px)']);

  return (
    <DataList
      col={2}
      w="full"
      size="lg"
      gap="2"
      variant={'bold'}
      orientation={isMd ? 'vertical' : 'horizontal'}
    >
      <DataListItem>
        <DataListTerm>Title</DataListTerm>
        <DataListDescription display={'flex'} gap="2" flexWrap={'wrap'}>
          {Object.entries(media.title ?? {})
            .filter(([type, title]) => type !== 'userPreferred' && title)
            .map(([type, title]) => (
              <Box
                borderColor="ActiveBorder"
                borderWidth={'thin'}
                p="2"
                rounded="md"
                key={`${type}-${title}`}
              >
                <TextWithCopyButton
                  copyText={title}
                  textComponent={
                    <span>
                      <strong>{sentenceCase(type)}</strong>: {title}
                    </span>
                  }
                  variant={'link'}
                  size="lg"
                />
              </Box>
            ))}
          <MediaTitleSynonyms />
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm>Format</DataListTerm>
        <DataListDescription>
          {MEDIA_FORMAT[media.type?.toLowerCase()]?.find(
            ({ value }) => value === media.format
          )?.label ?? 'TBA'}
        </DataListDescription>
      </DataListItem>
      {formatPartialDate(media.startDate) && (
        <DataListItem>
          <DataListTerm>Start Date</DataListTerm>
          <DataListDescription>
            {formatPartialDate(media.startDate)}
          </DataListDescription>
        </DataListItem>
      )}
      {formatPartialDate(media.endDate) && (
        <DataListItem>
          <DataListTerm>End Date</DataListTerm>
          <DataListDescription>
            {formatPartialDate(media.endDate)}
          </DataListDescription>
        </DataListItem>
      )}
      {media.duration && (
        <DataListItem>
          <DataListTerm>Duration</DataListTerm>
          <DataListDescription>
            {formatMinutesToReadableString(media.duration)}
          </DataListDescription>
        </DataListItem>
      )}

      {media.volumes && (
        <DataListItem>
          <DataListTerm>Duration</DataListTerm>
          <DataListDescription>{media.volumes}</DataListDescription>
        </DataListItem>
      )}

      <DataListItem>
        <DataListTerm display={'flex'} alignItems={'start'}>
          <Flex align="center">Genre & Tags</Flex>
        </DataListTerm>
        <DataListDescription>
          <Flex gap={'1.5'} wrap={'wrap'} align={'center'}>
            {(media.genres ?? []).map((genre) => {
              return (
                <Tag
                  key={genre}
                  as={NextLink}
                  href={`/browse?mediaType=${media.type}&genresIn=${genre}`}
                >
                  {genre}
                </Tag>
              );
            })}

            <MediaTags />
          </Flex>
        </DataListDescription>
      </DataListItem>

      {media.type === 'ANIME' && (
        <>
          <DataListItem>
            <DataListTerm>Season</DataListTerm>
            <DataListDescription>{media.season}</DataListDescription>
          </DataListItem>
          <DataListItem>
            <DataListTerm>Release Year</DataListTerm>
            <DataListDescription>{media.seasonYear}</DataListDescription>
          </DataListItem>
        </>
      )}

      {media.countryOfOrigin && (
        <DataListItem>
          <DataListTerm>Country of Origin</DataListTerm>
          <DataListDescription>
            {
              COUNTRY_OF_ORIGIN.find(
                ({ value }) => value === media.countryOfOrigin
              )?.label
            }
          </DataListDescription>
        </DataListItem>
      )}

      {media.source && (
        <DataListItem>
          <DataListTerm>Source</DataListTerm>
          <DataListDescription>
            {sentenceCase(media.source.replace('_', ' '))}
          </DataListDescription>
        </DataListItem>
      )}

      {media.hashtag && (
        <DataListItem>
          <DataListTerm>X hashtag</DataListTerm>
          <DataListDescription
            as={NextLink}
            href={`https://x.com/search?q=${encodeURIComponent(
              media.hashtag.trim().split(' ').join(' OR ')
            )}`}
          >
            {media.hashtag}
          </DataListDescription>
        </DataListItem>
      )}

      <DataListItem>
        <DataListTerm>Ranking</DataListTerm>
        <DataListDescription>
          {(media.rankings ?? []).map((mR) => {
            const type =
              mR.type === 'RATED'
                ? 'highest rated'
                : mR.type === 'POPULAR'
                ? 'most popular'
                : 'ERROR: rank type not expected';

            const format = MEDIA_FORMAT[media.type.toLowerCase()].find(
              ({ value }) => value === mR.format
            ).label;

            const suffix = mR.allTime
              ? 'of all time'
              : mR.season
              ? `of ${mR.season} ${mR.year}`
              : mR.year
              ? `of ${mR.year}`
              : 'ERROR: Suffix could not be formed';

            return (
              <Flex key={`${JSON.stringify(mR)}`} align="center" gap="1">
                {mR.type === 'RATED' ? (
                  <StarIcon fill="yellow" stroke="yellow" />
                ) : mR.type === 'POPULAR' ? (
                  <FlameIcon fill="orange" stroke="orange" />
                ) : (
                  ''
                )}{' '}
                <Text>
                  The {mR.rank === 1 ? '' : formatOrdinal(mR.rank)} {type}{' '}
                  {format} {suffix}
                </Text>
              </Flex>
            );
          })}
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm>Favourites</DataListTerm>
        <DataListDescription display={'flex'} gap="1" alignItems={'center'}>
          <HeartIcon fill="red" stroke="red" />
          <Text>{media.favourites}</Text>
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm>External Links</DataListTerm>
        <DataListDescription>
          {Object.entries(
            Object.groupBy(media.externalLinks ?? [], (link) => link.type)
          ).map(([key, value]) => (
            <Fragment key={key}>
              <Text fontWeight={'bold'}>{sentenceCase(key)}</Text>
              <Flex gap="2" wrap="wrap">
                {value.map((link) => (
                  <Badge
                    key={link.id}
                    display={'flex'}
                    gap="1"
                    alignItems={'center'}
                    p="1"
                    flexShrink={0}
                    bgColor={['blackAlpha.100', 'whiteAlpha.100']}
                    _hover={{
                      bgColor: [
                        `oklch(from ${
                          link.color ?? 'white'
                        } calc(l * .75) c h)`,
                        link.color
                          ? `oklch(from ${link.color} calc(l * 0.95) c h)`
                          : 'whiteAlpha.400',
                      ],
                      color: 'white',
                    }}
                    color={['black', 'white']}
                    cursor={'pointer'}
                    as={NextLink}
                    href={link.url}
                    fontSize={'sm'}
                  >
                    {link.icon ? (
                      <Box
                        aspectRatio={1}
                        bgColor={link.color}
                        p="1"
                        flexShrink={0}
                        rounded={'sm'}
                      >
                        <Image w={'3'} h={'3'} src={link.icon} />
                      </Box>
                    ) : (
                      <LinkIcon w="3" h="3" />
                    )}
                    <Text>{link.site}</Text>
                  </Badge>
                ))}
              </Flex>
            </Fragment>
          ))}
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm>Studios</DataListTerm>
        <DataListDescription>
          {media.studios
            ?.filter((studio) => studio.isMain)
            ?.map((studio) => (
              <Tag
                key={studio.id}
                variant={'solid'}
                as={NextLink}
                href={`/studio?id=${studio.id}`}
              >
                {studio.name}
              </Tag>
            ))}
        </DataListDescription>
      </DataListItem>

      <DataListItem>
        <DataListTerm>Producers</DataListTerm>
        <DataListDescription display={'flex'} gap="2">
          {media.studios
            ?.filter((studio) => !studio.isMain)
            ?.map((studio) => (
              <Tag
                key={studio.id}
                variant={'subtle'}
                as={NextLink}
                href={`/studio?id=${studio.id}`}
              >
                {studio.name}
              </Tag>
            ))}
        </DataListDescription>
      </DataListItem>
    </DataList>
  );
}
