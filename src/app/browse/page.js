'use client';

import { useGenreCollection } from '@/lib/client/hooks/react_query/get/media/genre-collection';
import { useTagCollection } from '@/lib/client/hooks/react_query/get/media/tag-collection';
import { useSearch } from '@/lib/client/hooks/react_query/get/search-results';
import { useDebounce } from '@/lib/client/hooks/use-debounce';
import {
  COUNTRY_OF_ORIGIN,
  MEDIA_FORMAT,
  MEDIA_SEASONS,
  MEDIA_SORT,
  MEDIA_SOURCE,
  MEDIA_STATUS,
  MEDIA_TYPES,
} from '@/lib/constants';
import { debounce, sentenceCase, snakeToCamel } from '@/utils/general';
import { DatePicker, YearPicker } from '@yamada-ui/calendar';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  MinusIcon,
  PlusIcon,
} from '@yamada-ui/lucide';
import {
  Airy,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Checkbox,
  CheckboxGroup,
  Collapse,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  FormControl,
  Grid,
  Heading,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Separator,
  Skeleton,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useDynamicAnimation,
  VStack,
} from '@yamada-ui/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';
import ReactSelect from 'react-select';

function getFuzzyDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid input: Please provide a valid Date object.');
    return null;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return {
    year,
    month,
    day,
  };
}

export default function SearchPage() {
  const methods = useForm({
    defaultValues: {
      query: '',
      mediaType: 'anime',
      season: '',
      seasonYear: null,
      countryOfOrigin: 'JP',
      mediaSource: [],
      mediaSort: [],
      mediaFormat: [],
      mediaFormatInclusion: true,
      mediaStatus: [],
      mediaStatusInclusion: true,
      genres: [],
      genresInclusion: true,
      mediaTag: [],
      mediaTagInclusion: true,
      mediaTagCategory: [],
      mediaTagCategoryInclusion: true,
      episodesLesser: '',
      chaptersLesser: '',
      volumesLesser: '',
      scoreLesser: '',
      popularityLesser: '',
      durationLesser: '',
      episodesGreater: '',
      chaptersGreater: '',
      volumesGreater: '',
      scoreGreater: '',
      popularityGreater: '',
      durationGreater: '',
      startDateComparator: '',
      startDate: null,
      endDateComparator: '',
      endDate: null,
      booleans: ["onList"],
    },
  });

  const [searchOptions, setSearchOptions] = useState(null);

  function onSubmit(data) {
    const {
      mediaFormat,
      mediaFormatInclusion,

      mediaTagCategory,
      mediaTagCategoryInclusion,

      mediaTag,
      mediaTagInclusion,

      mediaStatus,
      mediaStatusInclusion,

      genres,
      genresInclusion,

      startDateComparator,
      startDate,

      endDateComparator,
      endDate,

      ...restData
    } = data;

    const searchOptions = Object.fromEntries(
      Object.entries({
        ...restData,
        ...(mediaFormatInclusion
          ? { mediaFormatIn: mediaFormat }
          : { mediaFormatNotIn: mediaFormat }),
        ...(mediaTagCategoryInclusion
          ? { mediaTagCategoryIn: mediaTagCategory }
          : { mediaTagCategoryNotIn: mediaTagCategory }),
        ...(mediaTagInclusion
          ? { mediaTagIn: mediaTag }
          : { mediaTagNotIn: mediaTag }),
        ...(mediaStatusInclusion
          ? { mediaStatusIn: mediaStatus }
          : { mediaStatusNotIn: mediaStatus }),
        ...(genresInclusion ? { genresIn: genres } : { genresNotIn: genres }),
        ...(startDateComparator === 'is'
          ? { startDate: getFuzzyDate(startDate) }
          : {
              ...(startDateComparator === 'before' && {
                startDateLesser: getFuzzyDate(startDate),
              }),
              ...(startDateComparator === 'after' && {
                startDateGreater: getFuzzyDate(startDate),
              }),
            }),
        ...(endDateComparator === 'is'
          ? { endDate: getFuzzyDate(endDate) }
          : {
              ...(endDateComparator === 'before' && {
                endDateLesser: getFuzzyDate(endDate),
              }),
              ...(endDateComparator === 'after' && {
                endDateGreater: getFuzzyDate(endDate),
              }),
            }),
      }).filter(
        ([_, value]) =>
          value !== '' &&
          value !== 0 &&
          value !== null &&
          value !== undefined &&
          value !== false &&
          !Number.isNaN(value) &&
          (Array.isArray(value) ? value.length > 0 : true)
      )
    );

    setSearchOptions(searchOptions);
  }

  const { open: basicOptionsOpen, onToggle: basicOptionsToggle } =
    useDisclosure({
      defaultOpen: true,
    });

  const { open: advancedOptionsOpen, onToggle: advancedOptionsToggle } =
    useDisclosure();

  const genresInfo = useGenreCollection();
  const tagsInfo = useTagCollection();

  const [advLabelAnim, setAdvLabelAnim] = useDynamicAnimation({
    open: {
      keyframes: {
        '0%': {
          transform: 'rotateZ(0deg)',
        },
        '50%': {
          transform: 'rotateZ(90deg)',
        },
        '100%': {
          transform: 'rotateZ(180deg)',
        },
      },
      duration: 'slower',
      fillMode: 'forwards',
      timingFunction: 'ease-in-out',
    },
    close: {
      keyframes: {
        '0%': {
          transform: 'rotateZ(180deg)',
        },
        '50%': {
          transform: 'rotateZ(270deg)',
        },
        '100%': {
          transform: 'rotateZ(360deg)',
        },
      },
      duration: 'slower',
      fillMode: 'forwards',
      timingFunction: 'ease-in-out',
    },
  });

  const [basicLabelAnim, setBasicLabelAnim] = useDynamicAnimation({
    open: {
      keyframes: {
        '0%': {
          transform: 'rotateZ(0deg)',
        },
        '50%': {
          transform: 'rotateZ(90deg)',
        },
        '100%': {
          transform: 'rotateZ(180deg)',
        },
      },
      duration: 'slower',
      fillMode: 'forwards',
      timingFunction: 'ease-in-out',
    },
    close: {
      keyframes: {
        '0%': {
          transform: 'rotateZ(180deg)',
        },
        '50%': {
          transform: 'rotateZ(270deg)',
        },
        '100%': {
          transform: 'rotateZ(360deg)',
        },
      },
      duration: 'slower',
      fillMode: 'forwards',
      timingFunction: 'ease-in-out',
    },
  });

  const tagCategories = useMemo(
    () =>
      Array.from(
        new Set((tagsInfo.data?.data ?? []).flatMap((t) => t.category))
      ),
    [tagsInfo.data]
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const debouncedFormValues = useDebounce(methods.watch());

  useEffect(() => {
    const {
      mediaType,
      query,
      countryOfOrigin,
      mediaSource,
      mediaSort,
      popularityLesser,
      popularityGreater,
      scoreLesser,
      scoreGreater,
      mediaTagIn,
      mediaTagNotIn,
      mediaTagCategoryIn,
      mediaTagCategoryNotIn,
      genresIn,
      genresNotIn,

      season,
      seasonYear,
      mediaFormatIn,
      mediaFormatNotIn,
      mediaStatusIn,
      mediaStatusNotIn,
      episodesLesser,
      episodesGreater,
      durationLesser,
      durationGreater,
      chaptersLesser,
      chaptersGreater,
      volumesLesser,
      volumesGreater,

      startDate,
      startDateLesser,
      startDateGreater,
      endDate,
      endDateLesser,
      endDateGreater,

      isAdult,
      isLicensed,
      onList,
    } = Object.fromEntries(searchParams.entries());

    const formValues = {};

    if (mediaType && MEDIA_TYPES.includes(mediaType.toUpperCase())) {
      formValues['mediaType'] = mediaType.toUpperCase();
    }

    if (query) {
      formValues['query'] = query;
    }

    if (
      countryOfOrigin &&
      COUNTRY_OF_ORIGIN.map((coo) => coo.value).includes(
        countryOfOrigin.toUpperCase()
      )
    ) {
      formValues['countryOfOrigin'] = countryOfOrigin.toUpperCase();
    }

    if (mediaSource && MEDIA_SOURCE.includes(mediaSource.toUpperCase())) {
      formValues['mediaSource'] = mediaSource.toLocaleUpperCase();
    }

    if (
      mediaSort &&
      mediaSort
        .split(',')
        .every((msUrl) =>
          MEDIA_SORT.map((ms) => ms.value).includes(msUrl.trim().toUpperCase())
        )
    ) {
      formValues['mediaSort'] = mediaSort
        .split(',')
        .map((msUrl) => msUrl.trim().toUpperCase());
    }

    if (
      mediaFormatIn &&
      mediaFormatIn
        .split(',')
        .every((mfUrl) =>
          MEDIA_FORMAT[formValues['mediaType'] ?? 'anime']
            .map((mf) => mf.value)
            .includes(mfUrl.trim().toUpperCase())
        )
    ) {
      formValues['mediaFormatInclusion'] = true;
      formValues['mediaFormat'] = mediaFormatIn
        .split(',')
        .map((mfUrl) => mfUrl.trim().toUpperCase());
    }

    if (
      mediaFormatNotIn &&
      mediaFormatNotIn
        .split(',')
        .every((mfUrl) =>
          MEDIA_FORMAT[formValues['mediaType'] ?? 'anime']
            .map((mf) => mf.value)
            .includes(mfUrl.trim().toUpperCase())
        )
    ) {
      formValues['mediaFormatInclusion'] = false;
      formValues['mediaFormat'] = mediaFormatNotIn
        .split(',')
        .map((mfUrl) => mfUrl.trim().toUpperCase());
    }

    if (
      mediaStatusIn &&
      mediaStatusIn
        .split(',')
        .every((mstUrl) =>
          MEDIA_STATUS[formValues['mediaType'] ?? 'anime']
            .map((mst) => mst.value)
            .includes(mstUrl.trim().toUpperCase())
        )
    ) {
      formValues['mediaStatusInclusion'] = true;
      formValues['mediaStatus'] = mediaStatusIn
        .split(',')
        .map((mstUrl) => mstUrl.trim().toUpperCase());
    }

    if (
      mediaStatusNotIn &&
      mediaStatusNotIn
        .split(',')
        .every((mstUrl) =>
          MEDIA_STATUS[formValues['mediaType'] ?? 'anime']
            .map((mst) => mst.value)
            .includes(mstUrl.trim().toUpperCase())
        )
    ) {
      formValues['mediaStatusInclusion'] = false;
      formValues['mediaStatus'] = mediaStatusNotIn
        .split(',')
        .map((mstUrl) => mstUrl.trim().toUpperCase());
    }

    if (popularityLesser) {
      formValues['popularityLesser'] = popularityLesser;
    }

    if (popularityGreater) {
      formValues['popularityGreater'] = popularityGreater;
    }

    if (scoreLesser) {
      formValues['scoreLesser'] = scoreLesser;
    }

    if (scoreGreater) {
      formValues['scoreGreater'] = scoreGreater;
    }

    if (episodesLesser) {
      formValues['episodesLesser'] = episodesLesser;
    }

    if (episodesGreater) {
      formValues['episodesGreater'] = episodesGreater;
    }

    if (durationLesser) {
      formValues['durationLesser'] = durationLesser;
    }

    if (durationGreater) {
      formValues['durationGreater'] = durationGreater;
    }

    if (chaptersLesser) {
      formValues['chaptersLesser'] = chaptersLesser;
    }

    if (chaptersGreater) {
      formValues['chaptersGreater'] = chaptersGreater;
    }

    if (volumesLesser) {
      formValues['volumesLesser'] = volumesLesser;
    }

    if (volumesGreater) {
      formValues['volumesGreater'] = volumesGreater;
    }

    if (season && MEDIA_SEASONS.includes(season.toUpperCase())) {
      formValues['season'] = season.toUpperCase();
    }

    if (seasonYear && !!seasonYear.match(/\d{4}/)) {
      formValues['seasonYear'] = new Date(Date.parse(seasonYear));
    }

    if (
      tagsInfo.data?.data &&
      mediaTagIn &&
      mediaTagIn
        .split(',')
        .map((tagUrl) =>
          tagsInfo
            .map((tag) => tag.name.toUpperCase())
            .includes(tagUrl.trim().toUpperCase())
        )
    ) {
      // if needed change all of them to sentenceCase, both here and inMediaTagSelector
      formValues['mediaTagInclusion'] = true;
      formValues['mediaTag'] = mediaTagIn
        .split(',')
        .map((tagUrl) => tagUrl.trim());
    }

    if (
      tagsInfo.data?.data &&
      mediaTagNotIn &&
      mediaTagNotIn
        .split(',')
        .map((tagUrl) =>
          tagsInfo
            .map((tag) => tag.name.toUpperCase())
            .includes(tagUrl.trim().toUpperCase())
        )
    ) {
      // if needed change all of them to sentenceCase, both here and inMediaTagSelector
      formValues['mediaTagInclusion'] = false;
      formValues['mediaTag'] = mediaTagNotIn
        .split(',')
        .map((tagUrl) => tagUrl.trim());
    }

    if (
      tagCategories &&
      mediaTagCategoryIn &&
      mediaTagCategoryIn
        .split(',')
        .map((tagCatUrl) =>
          tagCategories
            .map((tagCat) => tagCat.toUpperCase())
            .includes(tagCatUrl.trim().toUpperCase())
        )
    ) {
      // if needed change all of them to sentenceCase, both here and inMediaTagSelector
      formValues['mediaTagCategoryInclusion'] = true;
      formValues['mediaTagCategory'] = mediaTagCategoryIn
        .split(',')
        .map((tagCatUrl) => tagCatUrl.trim());
    }

    if (
      tagCategories &&
      mediaTagCategoryNotIn &&
      mediaTagCategoryNotIn
        .split(',')
        .map((tagCatUrl) =>
          tagCategories
            .map((tagCat) => tagCat.toUpperCase())
            .includes(tagCatUrl.trim().toUpperCase())
        )
    ) {
      // if needed change all of them to sentenceCase, both here and inMediaTagSelector
      formValues['mediaTagCategoryInclusion'] = false;
      formValues['mediaTagCategory'] = mediaTagCategoryNotIn
        .split(',')
        .map((tagCatUrl) => tagCatUrl.trim());
    }

    if (
      genresInfo.data?.data &&
      genresIn &&
      genresIn
        .split(',')
        .map((genreUrl) =>
          genresInfo.data?.data
            .map((genre) => genre.toUpperCase())
            .includes(genreUrl.trim().toUpperCase())
        )
    ) {
      // if needed change all of them to sentenceCase, both here and inMediaTagSelector
      formValues['genresInclusion'] = true;
      formValues['genres'] = genresIn
        .split(',')
        .map((genreUrl) => genreUrl.trim());
    }

    if (
      genresInfo.data?.data &&
      genresNotIn &&
      genresNotIn
        .split(',')
        .map((genreUrl) =>
          genresInfo.data?.data
            .map((genre) => genre.toUpperCase())
            .includes(genreUrl.trim().toUpperCase())
        )
    ) {
      // if needed change all of them to sentenceCase, both here and inMediaTagSelector
      formValues['genresInclusion'] = false;
      formValues['genres'] = genresNotIn
        .split(',')
        .map((genreUrl) => genreUrl.trim());
    }

    if (startDate && Date.parse(startDate)) {
      formValues['startDateComparator'] = 'is';
      formValues['startDate'] = new Date(Date.parse(startDate));
    }

    if (startDateLesser && Date.parse(startDateLesser)) {
      formValues['startDateComparator'] = 'before';
      formValues['startDate'] = new Date(Date.parse(startDateLesser));
    }

    if (startDateGreater && Date.parse(startDateGreater)) {
      formValues['startDateComparator'] = 'after';
      formValues['startDate'] = new Date(Date.parse(startDateGreater));
    }

    if (endDate && Date.parse(endDate)) {
      formValues['endDateComparator'] = 'is';
      formValues['endDate'] = new Date(Date.parse(endDate));
    }

    if (endDateLesser && Date.parse(endDateLesser)) {
      formValues['endDateComparator'] = 'before';
      formValues['endDate'] = new Date(Date.parse(endDateLesser));
    }

    if (endDateGreater && Date.parse(endDateGreater)) {
      formValues['endDateComparator'] = 'after';
      formValues['endDate'] = new Date(Date.parse(endDateGreater));
    }

    formValues['booleans'] = [];

    if (isAdult?.length === 0 || isAdult === 'true') {
      formValues['booleans'].push('isAdult');
    }
    if (onList?.length === 0 || onList === 'true') {
      formValues['booleans'].push('onList');
    }
    if (isLicensed?.length === 0 || isLicensed === 'true') {
      formValues['booleans'].push('isLicensed');
    }

    console.log({ ...methods.formState.defaultValues, ...formValues });

    methods.reset({ ...methods.formState.defaultValues, ...formValues });
  }, [searchParams, tagsInfo.data, genresInfo.data, tagCategories]);

  useEffect(() => {}, []);

  return (
    <>
      <Center>
        <Box
          maxW={{ sm: '100%', xl: '90%', '2xl': '80%', base: '60%' }}
          w="full"
          as="form"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <FormProvider {...methods}>
            <Flex
              gap="2"
              alignItems={'flex-start'}
              flexWrap={{ base: 'nowrap', md: 'wrap' }}
              p="2"
            >
              <Box w={{ base: 'max-content', md: 'full' }}>
                <MediaTypeSelector />
              </Box>
              <VStack gap="2">
                <Controller
                  name="query"
                  render={({ field }) => (
                    <Input {...field} type="search" autoFocus />
                  )}
                />
                <Flex
                  gap="2"
                  alignSelf={'flex-end'}
                  alignItems={'center'}
                  flexWrap={{ base: 'nowrap', md: 'wrap' }}
                >
                  <Button
                    variant={'link'}
                    onClick={() => {
                      basicOptionsToggle();
                      setBasicLabelAnim((prev) =>
                        prev === 'open' ? 'close' : 'open'
                      );
                    }}
                  >
                    <ChevronUpIcon animation={basicLabelAnim} />
                    Basic Options
                  </Button>
                  <Separator orientation="vertical" h={'4'} />
                  <Button
                    variant={'link'}
                    onClick={() => {
                      setAdvLabelAnim((prev) =>
                        prev === 'open' ? 'close' : 'open'
                      );
                      advancedOptionsToggle();
                    }}
                  >
                    <ChevronDownIcon animation={advLabelAnim} />
                    Advanced Options
                  </Button>
                </Flex>
              </VStack>
              <Button
                type="submit"
                colorScheme={'primary'}
                variant={'outline'}
                w={{ base: 'max-content', md: 'full' }}
              >
                Search
              </Button>
            </Flex>
            {basicOptionsOpen && (
              <Collapse
                open={basicOptionsOpen}
                style={{ overflow: 'visible' }}
                mt="2"
              >
                <Card variant={'outline'}>
                  <CardHeader>
                    <Heading size={'md'}>Basic Options</Heading>
                  </CardHeader>
                  <CardBody>
                    <Flex
                      gap="4"
                      w="full"
                      flexWrap={{ base: 'nowrap', md: 'wrap' }}
                    >
                      <SeasonSelector />
                      <SeasonYearSelector />
                    </Flex>
                    <Flex
                      gap="4"
                      w="full"
                      flexWrap={{ base: 'nowrap', md: 'wrap' }}
                    >
                      {genresInfo.isFetched && (
                        <GenreSelector genres={genresInfo.data.data} />
                      )}
                      <MediaSortMethodSelector />
                    </Flex>
                    <Flex
                      gap="4"
                      w="full"
                      flexWrap={{ base: 'nowrap', md: 'wrap' }}
                    >
                      <MediaStatusSelector />
                      <MediaFormatSelector />
                    </Flex>
                  </CardBody>
                </Card>
              </Collapse>
            )}
            {advancedOptionsOpen && (
              <Collapse
                open={advancedOptionsOpen}
                style={{ overflow: 'visible' }}
                mt="2"
              >
                <Card variant={'outline'}>
                  <CardHeader>
                    <Heading size={'md'}>Advanced Options</Heading>
                  </CardHeader>
                  <CardBody>
                    <Flex
                      gap="4"
                      w="full"
                      flexWrap={{ base: 'nowrap', md: 'wrap' }}
                    >
                      <Booleans />
                      <CountrySelector />
                      <MediaSourceSelector />
                    </Flex>

                    <Flex
                      gap="4"
                      w="full"
                      justifyContent={'space-between'}
                      flexWrap={{ base: 'nowrap', md: 'wrap' }}
                    >
                      <DateSelector name={'start'} />
                      <DateSelector name={'end'} />
                    </Flex>
                    {tagsInfo.isFetched && (
                      <MediaTagSelector
                        tagCategories={tagCategories}
                        tags={tagsInfo.data.data}
                      />
                    )}
                    <MediaTagCategorySelector tagCategories={tagCategories} />
                    <Grid
                      w="full"
                      gap="2"
                      justifyItems={'center'}
                      gridTemplateColumns={{
                        base: '1fr 10px 1fr',
                        md: '1fr',
                      }}
                    >
                      {methods.watch('mediaType') === 'anime' ? (
                        <>
                          <OpenEndedRange label={'episodes'} />
                          <Separator
                            orientation="vertical"
                            display={{ md: 'none', base: 'block' }}
                          />

                          <OpenEndedRange label={'duration'} />
                        </>
                      ) : (
                        <>
                          <OpenEndedRange label={'chapters'} />
                          <Separator
                            orientation="vertical"
                            display={{ md: 'none', base: 'block' }}
                          />

                          <OpenEndedRange label={'volumes'} />
                        </>
                      )}
                      <OpenEndedRange label={'popularity'} />
                      <Separator
                        orientation="vertical"
                        display={{ md: 'none', base: 'block' }}
                      />

                      <OpenEndedRange label={'score'} />
                    </Grid>
                  </CardBody>
                </Card>
              </Collapse>
            )}
          </FormProvider>
          {searchOptions && <SearchResult searchOptions={searchOptions} />}
        </Box>
      </Center>
    </>
  );
}

function SearchResult({ searchOptions }) {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetched } =
    useSearch({
      searchOptions,
    });

  const fetchMore = debounce(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <>
      <Grid
        w={'full'}
        gap={'4'}
        p={'2'}
        placeItems={'center'}
        gridTemplateColumns={'repeat(auto-fill, minmax(220px, 1fr))'}
      >
        {isFetched
          ? data.pages
              .flatMap((page) => page.searchResults)
              .map((result) => {
                return (
                  <Card maxW="md" variant={'outline'} key={result.id}>
                    <CardHeader>
                      <Image
                        src={result.coverImage.extraLarge}
                        objectFit="cover"
                        minW={'40'}
                        maxW={'80'}
                        w="full"
                        aspectRatio={2 / 3}
                        alt={result.title.userPreferred}
                      />
                    </CardHeader>
                    <CardBody>
                      <Tooltip label={result.title.userPreferred}>
                        <Link
                          href={`/media?id=${result.id}&type=${result.type}`}
                        >
                          <Text lineClamp={1} fontSize={'xl'}>
                            {result.title.userPreferred}
                          </Text>
                        </Link>
                      </Tooltip>
                      <DataList
                        col={2}
                        variant={'subtle'}
                        size={{ base: 'lg' }}
                        gapY={{ base: '4', lg: '2' }}
                      >
                        <DataListItem>
                          <DataListTerm>
                            {result.status === 'RELEASING' &&
                            result.type !== 'MANGA'
                              ? 'Time Left'
                              : 'Status'}
                          </DataListTerm>
                          <DataListDescription>
                            {sentenceCase(result.status.replaceAll('_', ' '))}
                          </DataListDescription>
                        </DataListItem>
                      </DataList>
                    </CardBody>
                  </Card>
                );
              })
          : Array.from({ length: 5 }).map(() => (
              <Box key={Math.random()} padding={'4'}>
                <Skeleton h={'xs'} w={'150px'} />
              </Box>
            ))}
      </Grid>
      <Button
        w={'full'}
        onClick={fetchMore}
        disabled={isFetchingNextPage || !hasNextPage}
        visibility={!isFetchingNextPage && !hasNextPage && 'collapse'}
      >
        {isFetchingNextPage ? 'Loading more...' : hasNextPage && 'Load More'}
      </Button>
    </>
  );
}

function CountrySelector() {
  const { control } = useFormContext();
  return (
    <FormControl label={'Country of Origin'}>
      <Controller
        control={control}
        name="countryOfOrigin"
        render={({ field }) => (
          <ReactSelectCustom
            {...field}
            placeholder="Any"
            isSearchable={false}
            options={COUNTRY_OF_ORIGIN}
            components={{ IndicatorSeparator: null }}
            value={
              field.value && {
                label: COUNTRY_OF_ORIGIN.find(
                  ({ value }) => value === field.value
                )['label'],
                value: field.value,
              }
            }
            onChange={(option) => {
              field.onChange(option?.value ?? null);
            }}
          />
        )}
      />
    </FormControl>
  );
}

function SeasonSelector() {
  const { control } = useFormContext();
  return (
    <FormControl label={'Season'}>
      <Controller
        name="season"
        control={control}
        render={({ field }) => (
          <ReactSelectCustom
            {...field}
            placeholder="Any"
            isSearchable={false}
            isClearable
            options={MEDIA_SEASONS.map((t) => ({
              label: sentenceCase(t),
              value: t.toLowerCase(),
            }))}
            components={{ IndicatorSeparator: null }}
            value={
              field.value && {
                label: sentenceCase(field?.value),
                value: field.value,
              }
            }
            onChange={(option) => {
              field.onChange(option?.value ?? null);
            }}
          />
        )}
      />
    </FormControl>
  );
}

function SeasonYearSelector() {
  const { control } = useFormContext();
  return (
    <FormControl label="Season Year">
      <Controller
        control={control}
        name="seasonYear"
        render={({ field }) => <YearPicker {...field} placeholder="YYYY" />}
      />
    </FormControl>
  );
}

function Booleans() {
  const { control } = useFormContext();
  return (
    <Controller
      name="booleans"
      control={control}
      render={({ field }) => (
        <CheckboxGroup {...field} direction="row" w="full" alignItems={'center'}>
          <Checkbox checked={field.value} {...field} value="isAdult">
            Adult
          </Checkbox>
          <Checkbox checked={field.value} {...field} value="onList">
            On List
          </Checkbox>
          <Checkbox checked={field.value} {...field} value="isLicensed">
            Licensed
          </Checkbox>
        </CheckboxGroup>
      )}
    />
  );
}

/**
 *
 * @param {import('react-select').Props & {label: string}} props
 * @returns {import('react').ReactElement}
 */
function InclusionToggleMultiSelector(props) {
  const { control } = useFormContext();
  const label = snakeToCamel(props.label.replaceAll(' ', '_'));
  return (
    <FormControl label={sentenceCase(props.label)}>
      <InputGroup>
        <InputLeftAddon p="0" minH={'38px'}>
          <Controller
            control={control}
            name={`${label}Inclusion`}
            render={({ field }) => (
              <Airy
                px="3"
                w="full"
                h="full"
                from={<PlusIcon color="green.500" />}
                to={<MinusIcon color="red.500" />}
                value={field.value ? 'from' : 'to'}
                onChange={(state) => {
                  field.onChange(state === 'from');
                }}
              />
            )}
          />
        </InputLeftAddon>
        <Controller
          control={control}
          name={label}
          render={({ field }) =>
            props.Selector ? (
              props.Selector({ field })
            ) : (
              <ReactSelectCustom
                {...field}
                value={field.value.map((fv) => ({
                  label: sentenceCase(fv),
                  value: fv,
                }))}
                onChange={(options) => {
                  field.onChange(options.map((opt) => opt.value));
                }}
                isMulti
                closeMenuOnSelect={false}
                options={props.items}
                className="w-full"
                classNames={{ control: () => '!rounded-l-none' }}
              />
            )
          }
        />
      </InputGroup>
    </FormControl>
  );
}

/**
 *
 * @param {import('react-select').Props} props
 * @returns {import('react').ReactElement}
 */
function ReactSelectCustom(props) {
  const { colorMode } = useColorMode();
  const colorModeStyles = useColorModeValue(
    { control: {} },
    {
      control: {
        backgroundColor: '#141414',
        borderColor: '#434248',
        ':hover': {
          borderColor: '#4c4c4c',
        },
        ':focus-within:not(:hover)': {
          borderColor: '#0070f0',
        },
        borderRadius: '0.375rem',
      },
      input: {
        color: 'white',
      },
      menu: {
        backgroundColor: 'ThreeDDarkShadow',
      },
      singleValue: {
        color: 'white',
      },
      multiValue: { backgroundColor: 'GrayText' },
      multiValueLabel: {
        backgroundColor: 'GrayText',
        color: 'white',
      },
      multiValueRemove: {
        backgroundColor: 'GrayText',
      },
    }
  );
  return (
    <ReactSelect
      {...props}
      styles={{
        control: (styles) => ({
          ...styles,
          ...colorModeStyles.control,
          minWidth: '95px',
          minHeight: '40px',
        }),
        option: (styles) => ({ ...styles, marginBlock: '5px' }),
        input: (styles) => ({ ...styles, ...colorModeStyles.input }),
        menu: (styles) => ({ ...styles, ...colorModeStyles.menu }),
        singleValue: (styles) => ({
          ...styles,
          ...colorModeStyles.singleValue,
        }),
        multiValue: (styles) => ({
          ...styles,
          ...colorModeStyles.multiValue,
        }),
        multiValueLabel: (styles) => ({
          ...styles,
          ...colorModeStyles.multiValueLabel,
        }),
        multiValueRemove: (styles) => ({
          ...styles,
          ...colorModeStyles.multiValueRemove,
        }),
      }}
      theme={(theme) =>
        colorMode === 'dark'
          ? {
              ...theme,
              colors: {
                ...theme.colors,
                primary25: '#7bb3fd',
              },
            }
          : { ...theme }
      }
    />
  );
}

function DateSelector({ name }) {
  const { control } = useFormContext();
  return (
    <FormControl label={`${sentenceCase(name)} Date`}>
      <Flex>
        <Controller
          control={control}
          name={`${name}DateComparator`}
          render={({ field }) => (
            <ReactSelectCustom
              {...field}
              value={{
                label: field.value,
                value: field.value,
              }}
              onChange={({ value }) => {
                field.onChange(value);
              }}
              components={{ IndicatorSeparator: null }}
              defaultValue={{
                label: 'is',
                value: 'is',
              }}
              options={[
                { label: 'is', value: 'is' },
                { label: 'before', value: 'before' },
                { label: 'after', value: 'after' },
              ]}
              classNames={{
                control: () => 'w-[6.6rem] !rounded-r-none',
              }}
            />
          )}
        />
        <Controller
          control={control}
          name={`${name}Date`}
          render={({ field }) => (
            <DatePicker
              {...field}
              placeholder="YYYY/MM/DD"
              fieldProps={{ borderLeftRadius: 'none' }}
            />
          )}
        />
      </Flex>
    </FormControl>
  );
}

function MediaFormatSelector({}) {
  const { watch } = useFormContext();
  return (
    <InclusionToggleMultiSelector
      label={'Media Format'}
      items={MEDIA_FORMAT[watch('mediaType')]}
    />
  );
}

function MediaStatusSelector({}) {
  const { watch } = useFormContext();
  return (
    <InclusionToggleMultiSelector
      label={'Media Status'}
      items={MEDIA_STATUS[watch('mediaType')]}
    />
  );
}

function GenreSelector({ genres }) {
  return (
    <InclusionToggleMultiSelector
      label="Genres"
      items={genres.map((m) => ({
        label: sentenceCase(m.replaceAll('_', ' ')),
        value: m,
      }))}
    />
  );
}

function MediaSourceSelector({}) {
  const { control } = useFormContext();
  return (
    <FormControl label={'Media Source'}>
      <Controller
        control={control}
        name={'mediaSource'}
        render={({ field }) => (
          <ReactSelectCustom
            {...field}
            value={field.value.map((fv) => ({
              label: sentenceCase(fv.replaceAll('_', ' ')),
              value: fv,
            }))}
            onChange={(options) => {
              field.onChange(options.map((opt) => opt.value));
            }}
            isMulti
            closeMenuOnSelect={false}
            options={MEDIA_SOURCE.map((m) => ({
              label: sentenceCase(m.replaceAll('_', ' ')),
              value: m,
            }))}
            className="w-full"
          />
        )}
      />
    </FormControl>
  );
}

function MediaSortMethodSelector({}) {
  const { control } = useFormContext;
  return (
    <FormControl label={'Media Sort'}>
      <Controller
        control={control}
        name={'mediaSort'}
        render={({ field }) => (
          <ReactSelectCustom
            {...field}
            value={field.value.map((fv) => ({
              label: MEDIA_SORT.find((sort) => sort.value === fv).label,
              value: fv,
            }))}
            onChange={(options) => {
              field.onChange(options.map((opt) => opt.value));
            }}
            isMulti
            closeMenuOnSelect={false}
            options={MEDIA_SORT}
            className="w-full"
          />
        )}
      />
    </FormControl>
  );
}

function MediaTagSelector({ tagCategories, tags }) {
  return (
    <InclusionToggleMultiSelector
      label={'Media Tag'}
      Selector={({ field }) => {
        return (
          <ReactSelectCustom
            {...field}
            placeholder="Any"
            value={field.value.map((tagName) => ({
              label: tagName,
              value: tagName,
            }))}
            onChange={(options) => {
              field.onChange(options.map((opt) => opt.value));
            }}
            isMulti
            closeMenuOnSelect={false}
            options={(tagCategories ?? []).map((tc) => ({
              label: tc,
              options: tags
                .filter((t) => t.category === tc)
                .map((t) => ({ label: t.name, value: t.name })),
            }))}
            className="w-full"
            classNames={{ control: () => '!rounded-l-none' }}
          />
        );
      }}
    />
  );
}

function MediaTagCategorySelector({ tagCategories }) {
  return (
    <InclusionToggleMultiSelector
      label={'Media Tag Category'}
      Selector={({ field }) => {
        return (
          <ReactSelectCustom
            {...field}
            placeholder="Any"
            value={field.value.map((tagCategory) => ({
              label: tagCategory,
              value: tagCategory,
            }))}
            onChange={(options) => {
              field.onChange(options.map((opt) => opt.value));
            }}
            isMulti
            closeMenuOnSelect={false}
            options={(tagCategories ?? []).map((tc) => ({
              label: tc,
              value: tc,
            }))}
            className="w-full"
            classNames={{ control: () => '!rounded-l-none' }}
          />
        );
      }}
    />
  );
}

function MediaTypeSelector() {
  const { control } = useFormContext();
  return (
    <Controller
      name="mediaType"
      control={control}
      render={({ field }) => (
        <ReactSelectCustom
          {...field}
          className="w-full"
          components={{
            IndicatorSeparator: null,
            DropdownIndicator: null,
          }}
          isSearchable={false}
          options={MEDIA_TYPES.map((t) => ({
            label: sentenceCase(t),
            value: t.toLowerCase(),
          }))}
          value={{
            label: sentenceCase(field.value),
            value: field.value,
          }}
          onChange={({ value }) => {
            field.onChange(value);
          }}
        />
      )}
    />
  );
}

function OpenEndedRange({ label }) {
  const { colorMode } = useColorMode();
  const { control } = useFormContext();

  return (
    <Flex alignItems={'center'} gap="2">
      <Controller
        control={control}
        name={`${label}Lesser`}
        render={({ field }) => (
          <Input
            {...field}
            onChange={(ev) => {
              field.onChange(ev.target.value);
            }}
            type="number"
            borderRightRadius={'none'}
          />
        )}
      />
      <ChevronLeftIcon />
      <Text
        color={colorMode === 'dark' ? 'whiteAlpha.900' : 'blackAlpha.900'}
        py={'8px'}
        minW={'80px'}
        textAlign={'center'}
      >
        {sentenceCase(label)}
      </Text>
      <ChevronLeftIcon />
      <Controller
        control={control}
        name={`${label}Greater`}
        render={({ field }) => (
          <Input
            type="number"
            onChange={(ev) => {
              field.onChange(ev.target.value);
            }}
            borderLeftRadius={'none'}
          />
        )}
      />
    </Flex>
  );
}
