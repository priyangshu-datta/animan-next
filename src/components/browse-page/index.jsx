'use client';

import { ChevronDownIcon, ChevronUpIcon } from '@yamada-ui/lucide'
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
  useDisclosure,
  useDynamicAnimation,
  VStack
} from '@yamada-ui/react'
import { useEffect, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useSearchForm } from './hooks'
import { SearchResults } from './search-results'
import { CountryOfOriginSelector } from './selectors/country-of-origin'
import { DateSelector } from './selectors/date'
import { MediaSeasonSelector } from './selectors/media-season'
import { MediaSortMethodSelector } from './selectors/media-sort'
import { MediaSourceSelector } from './selectors/media-source'
import { MediaTypeSelector } from './selectors/media-type'
import { OpenEndedRange } from './selectors/open-ended-range'
import {
  CheckBoxes,
  GenreSelector,
  MediaFormatSelector,
  MediaStatusSelector,
  MediaTagCategorySelector,
  MediaTagSelector,
  OnListRadio,
  SeasonYearSelector,
} from './small-components'
import {
  animOptions,
  searchParamsToFormControlValues,
  setSearchOptionOnSubmit,
} from './utils'

export default function SearchPageComponent() {
  const { open: basicOptionsOpen, onToggle: basicOptionsToggle } =
    useDisclosure();

  const { open: advancedOptionsOpen, onToggle: advancedOptionsToggle } =
    useDisclosure();

  const [advLabelAnim, setAdvLabelAnim] = useDynamicAnimation(animOptions);

  const [basicLabelAnim, setBasicLabelAnim] = useDynamicAnimation(animOptions);

  const { methods, genresInfo, tagCategories, tagsInfo, searchParams } =
    useSearchForm();

  const [searchOptions, setSearchOptions] = useState();

  function onSubmit() {
    methods.reset({
      ...methods.formState.defaultValues,
      ...searchParamsToFormControlValues(
        searchParams,
        tagsInfo.data?.data,
        tagCategories,
        genresInfo.data?.data
      ),
    });
  }

  useEffect(() => {
    setSearchOptions(setSearchOptionOnSubmit(methods.formState.defaultValues));
  }, [methods.formState.defaultValues]);

  return (
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
            px="2"
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
                    setBasicLabelAnim((prev) =>
                      prev === 'open' ? 'close' : 'open'
                    );
                    basicOptionsToggle();
                  }}
                >
                  <ChevronDownIcon animation={basicLabelAnim} />
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
