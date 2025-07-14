'use client';

import { MEDIA_ENTRY_STATUS } from '@/lib/constants';
import { getCurrentAnimeSeason } from '@/utils/general';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from '@yamada-ui/lucide';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Flex,
  FormControl,
  Grid,
  Heading,
  Input,
  Separator,
  useDisclosure,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { defaultFormValues, useSearchForm } from './hooks';
import { ReactSelectCustom } from './reusable-components';
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
import { setSearchOptionOnSubmit } from './utils';

export default function MediaSearchPageComponent() {
  const { open: basicOptionsOpen, onToggle: basicOptionsToggle } =
    useDisclosure();

  const { open: advancedOptionsOpen, onToggle: advancedOptionsToggle } =
    useDisclosure();

  const { methods, genresInfo, tagCategories, tagsInfo } = useSearchForm();

  const [searchOptions, setSearchOptions] = useState();

  const [entryStatus, setEntryStatus] = useState('all');

  function onSubmit() {
    methods.reset(methods.getValues());
  }

  useEffect(() => {
    setSearchOptions({
      searchSubject: 'media',
      searchVariables: setSearchOptionOnSubmit(methods.formState.defaultValues),
    });
  }, [methods.formState.defaultValues]);

  return (
    <Box w="full" as="form" onSubmit={methods.handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <Flex
          gap="2"
          alignItems={'flex-start'}
          flexWrap={{ base: 'nowrap', md: 'wrap' }}
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
              <Button variant={'link'} onClick={basicOptionsToggle}>
                {basicOptionsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                Basic Options
              </Button>
              <Separator orientation="vertical" h={'4'} />
              <Button variant={'link'} onClick={advancedOptionsToggle}>
                {advancedOptionsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
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
            Search {methods.formState.isDirty ? '*' : ''}
          </Button>
        </Flex>
        <Flex
          justifyContent={'space-between'}
          alignItems={'flex-start'}
          flexWrap={{ base: 'nowrap', md: 'wrap' }}
          mt="2"
          px="2"
          gap="2"
        >
          <QuickFilterButtons methods={methods} />
          <VStack w="fit-content">
            <Button
              size="sm"
              colorScheme={'red'}
              startIcon={<XIcon />}
              variant={'subtle'}
              onClick={() => {
                methods.reset({
                  ...defaultFormValues,
                });
              }}
            >
              Clear all Filters
            </Button>
            <FormControl
              label="Entry Status"
              display={'flex'}
              alignItems={'baseline'}
              flexWrap={'wrap'}
            >
              <ReactSelectCustom
                isSearchable={false}
                options={[
                  { label: 'All', value: 'all' },
                  ...MEDIA_ENTRY_STATUS[
                    methods.watch('mediaType').toLowerCase()
                  ],
                ]}
                components={{ IndicatorSeparator: null }}
                value={[
                  { label: 'All', value: 'all' },
                  ...MEDIA_ENTRY_STATUS[
                    methods.watch('mediaType').toLowerCase()
                  ],
                ].find(({ value }) => value === entryStatus)}
                onChange={(option) => {
                  setEntryStatus(option.value);
                }}
                className="w-[146px]"
              />
            </FormControl>
          </VStack>
        </Flex>
        {basicOptionsOpen && (
          <BasicFilterOptions
            basicOptionsOpen={basicOptionsOpen}
            genresInfo={genresInfo}
          />
        )}
        {advancedOptionsOpen && (
          <AdvancedFilterOptions
            advancedOptionsOpen={advancedOptionsOpen}
            methods={methods}
            tagCategories={tagCategories}
            tagsInfo={tagsInfo}
          />
        )}
      </FormProvider>
      {searchOptions && (
        <SearchResults
          searchOptions={searchOptions}
          entryStatus={entryStatus}
        />
      )}
    </Box>
  );
}

function BasicFilterOptions({ basicOptionsOpen, genresInfo }) {
  return (
    <Collapse open={basicOptionsOpen} style={{ overflow: 'visible' }} mt="2">
      <Card variant={'outline'}>
        <CardHeader>
          <Heading size={'md'}>Basic Options</Heading>
        </CardHeader>
        <CardBody>
          <Flex gap="4" w="full" flexWrap={{ base: 'nowrap', md: 'wrap' }}>
            <MediaSeasonSelector />
            <SeasonYearSelector />
          </Flex>
          <Flex gap="4" w="full" flexWrap={{ base: 'nowrap', md: 'wrap' }}>
            {genresInfo.isFetched && (
              <GenreSelector genres={genresInfo.data.data} />
            )}
            <MediaSortMethodSelector />
          </Flex>
          <Flex gap="4" w="full" flexWrap={{ base: 'nowrap', md: 'wrap' }}>
            <MediaStatusSelector />
            <MediaFormatSelector />
          </Flex>
        </CardBody>
      </Card>
    </Collapse>
  );
}

function AdvancedFilterOptions({
  advancedOptionsOpen,
  methods,
  tagCategories,
  tagsInfo,
}) {
  return (
    <Collapse open={advancedOptionsOpen} style={{ overflow: 'visible' }} mt="2">
      <Card variant={'outline'}>
        <CardHeader>
          <Heading size={'md'}>Advanced Options</Heading>
        </CardHeader>
        <CardBody>
          <Flex gap="4" w="full" flexWrap={{ base: 'nowrap', md: 'wrap' }}>
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
  );
}

function QuickFilterButtons({ methods }) {
  return (
    <Flex
      gap="2"
      alignItems={'flex-start'}
      flexWrap={{ base: 'nowrap', md: 'wrap' }}
    >
      <Button
        onClick={() => {
          methods.reset({
            ...defaultFormValues,
            season: getCurrentAnimeSeason(),
            seasonYear: new Date(),
          });
        }}
        variant={'outline'}
        size="sm"
        colorScheme={'primary'}
      >
        This Season
      </Button>
      <Button
        onClick={() => {
          methods.reset({
            ...defaultFormValues,
            season: getCurrentAnimeSeason(),
            seasonYear: new Date(),
            mediaStatus: ['RELEASING'],
          });
        }}
        variant={'outline'}
        size="sm"
        colorScheme={'primary'}
      >
        This Season: Releasing
      </Button>
      <Button
        onClick={() => {
          methods.reset({
            ...defaultFormValues,
            mediaSort: ['SCORE_DESC'],
          });
        }}
        variant={'outline'}
        size="sm"
        colorScheme={'primary'}
      >
        Top Anime
      </Button>
      <Button
        onClick={() => {
          methods.reset({
            ...defaultFormValues,
            mediaSort: ['SCORE_DESC'],
            mediaFormat: ['MOVIE'],
          });
        }}
        variant={'outline'}
        size="sm"
        colorScheme={'primary'}
      >
        Top Movies
      </Button>
    </Flex>
  );
}
