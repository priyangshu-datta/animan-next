'use client';

import { ChevronDownIcon, ChevronUpIcon } from '@yamada-ui/lucide';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Collapse,
  Flex,
  Grid,
  Heading,
  Input,
  Separator,
  Snacks,
  useDisclosure,
  useDynamicAnimation,
  useSnacks,
  VStack,
} from '@yamada-ui/react';
import { useState } from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { SearchResults } from './search-results';
import { CountryOfOriginSelector } from './selectors/country-of-origin';
import { DateSelector } from './selectors/date';
import { MediaSeasonSelector } from './selectors/media-season';
import { MediaSortMethodSelector } from './selectors/media-sort';
import { MediaSourceSelector } from './selectors/media-source';
import { MediaTypeSelector } from './selectors/media-type';
import { OpenEndedRange } from './selectors/open-ended-range';
import {
  CheckBoxes,
  GenreSelector,
  MediaFormatSelector,
  MediaStatusSelector,
  MediaTagCategorySelector,
  MediaTagSelector,
  OnListRadio,
  SeasonYearSelector,
} from './small-components';
import { animOptions, searchParamsToFormControlValues } from './utils';
import { useSearchForm } from './hooks';

function setSearchOptionOnSubmit(data) {
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

    seasonYear,

    checkboxes,

    onList,

    ...restData
  } = data;

  const searchOptions = Object.fromEntries([
    ...Object.entries({
      ...restData,
      ...{ seasonYear: seasonYear?.getFullYear() },
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
      ...(onList === 'inList'
        ? { onList: true }
        : onList === 'notInList'
        ? { onList: false }
        : {}),
    }).filter(
      ([_, value]) =>
        value !== '' &&
        value !== 0 &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(value) &&
        (Array.isArray(value) ? value.length > 0 : true)
    ),
    ...checkboxes.map((b) => [b, true]),
  ]);

  return searchOptions;
}

export default function SearchPageComponent() {
  const [searchOptions, setSearchOptions] = useState(null);

  const { open: basicOptionsOpen, onToggle: basicOptionsToggle } =
    useDisclosure({
      defaultOpen: true,
    });

  const { open: advancedOptionsOpen, onToggle: advancedOptionsToggle } =
    useDisclosure();

  const [advLabelAnim, setAdvLabelAnim] = useDynamicAnimation(animOptions);

  const [basicLabelAnim, setBasicLabelAnim] = useDynamicAnimation(animOptions);

  const { snack, snacks } = useSnacks();

  const { methods, genresInfo, tagCategories, tagsInfo, searchParams } =
    useSearchForm({
      snack,
    });

  function onSubmit(data) {
    setSearchOptions(setSearchOptionOnSubmit(data));
  }

  return (
    <Center>
      <Box
        maxW={{ sm: '100%', xl: '90%', '2xl': '80%', base: '60%' }}
        w="full"
        as="form"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <Snacks snacks={snacks} mb="2" />
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
              onClick={() => {
                methods.reset({
                  ...methods.formState.defaultValues,
                  ...searchParamsToFormControlValues(
                    searchParams,
                    tagsInfo.data?.data,
                    tagCategories,
                    genresInfo.data?.data
                  ),
                });
              }}
            >
              Search {methods.formState.isDirty ? '*' : ''}
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
                    <MediaSeasonSelector />
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
                    <Grid w="full" gap="sm">
                      <CheckBoxes />
                      <OnListRadio />
                    </Grid>
                    <CountryOfOriginSelector />
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
                  <MediaTagCategorySelector tagCategories={tagCategories} />
                  <MediaTagSelector
                    tagCategories={tagCategories}
                    tags={tagsInfo.data?.data}
                  />
                  <Grid
                    w="full"
                    gap="2"
                    justifyItems={'center'}
                    gridTemplateColumns={{
                      base: '1fr 10px 1fr',
                      md: '1fr',
                    }}
                  >
                    {methods.watch('mediaType') === 'ANIME' ? (
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
        {searchOptions && <SearchResults searchOptions={searchOptions} />}
      </Box>
    </Center>
  );
}
