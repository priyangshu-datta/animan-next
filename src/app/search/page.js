'use client';

import { useGenreCollection } from '@/lib/client/hooks/react_query/get/media/genre-collection';
import { useTagCollection } from '@/lib/client/hooks/react_query/get/media/tag-collection';
import { useSearch } from '@/lib/client/hooks/react_query/get/search-results';
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
  Loading,
  Separator,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useDynamicAnimation,
  VStack,
} from '@yamada-ui/react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';
import ReactSelect from 'react-select';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Search />
    </Suspense>
  );
}

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

function Search() {
  document.title = 'Search';

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

  const {
    data: {
      data: { genres: genres },
    },
  } = useGenreCollection();
  const {
    data: {
      data: { tags: tags },
    },
  } = useTagCollection();

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

  const tagCategories = Array.from(new Set(tags.flatMap((t) => t.category)));
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
            <Flex gap="2" alignItems={'flex-start'}>
              <MediaTypeSelector />
              <VStack gap="2">
                <Controller
                  name="query"
                  render={({ field }) => (
                    <Input {...field} type="search" autoFocus />
                  )}
                />
                <Flex gap="2" alignSelf={'flex-end'}>
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
                  |
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
              <Button type="submit" colorScheme={'primary'} variant={'outline'}>
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
                    <Flex gap="4" w="full">
                      <SeasonSelector />
                      <SeasonYearSelector />
                    </Flex>
                    <Flex gap="4" w="full">
                      <GenreSelector genres={genres} />
                      <MediaSortMethodSelector />
                    </Flex>
                    <Flex gap="4" w="full">
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

                    <MediaTagSelector
                      tagCategories={tagCategories}
                      tags={tags}
                    />
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
          {searchOptions && (
            <Suspense fallback={<Loading />}>
              <SearchResult searchOptions={searchOptions} />
            </Suspense>
          )}
        </Box>
      </Center>
    </>
  );
}

function SearchResult({ searchOptions }) {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useSearch({
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
        {data.pages
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
                    <Link href={`/media?id=${result.id}&type=${result.type}`}>
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
                    {/* <DataListItem>
                <DataListTerm>
                  {result.status === 'NOT_YET_RELEASED'
                    ? 'Release in'
                    : 'Progress'}
                </DataListTerm>
                <DataListDescription>
                  {result.status === 'NOT_YET_RELEASED' ? (
                    computeStartDate(listEntry.media.startDate) ?? 'N/A'
                  ) : (
                    <Flex gap={'1'} alignItems={'center'}>
                      {totalEpisodes - progress > 0 ? (
                        <Tooltip
                          label={`Behind ${totalEpisodes - progress} epsiodes`}
                        >
                          <span className="decoration-dashed underline-offset-2 underline">
                            {progress}
                          </span>
                        </Tooltip>
                      ) : (
                        progress
                      )}
                      <Button
                        variant={'link'}
                        onClick={() => {
                          updateMediaProgress({
                            mediaId,
                            progress: progress + 1,
                          });
                        }}
                        disabled={updatingMediaProgress}
                      >
                        {updatingMediaProgress ? '...' : '+'}
                      </Button>
                    </Flex>
                  )}
                </DataListDescription>
              </DataListItem> */}
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
          })}
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
    <CheckboxGroup direction="row" w="full" alignItems={'center'}>
      <FormControl>
        <Controller
          name="isAdult"
          control={control}
          render={({ field }) => (
            <Checkbox {...field} checked={field.value} value="isAdult">
              Adult
            </Checkbox>
          )}
        />
      </FormControl>
      <FormControl>
        <Controller
          name="onList"
          control={control}
          render={({ field }) => (
            <Checkbox {...field} checked={field.value} value="onList">
              On List
            </Checkbox>
          )}
        />
      </FormControl>
      <FormControl>
        <Controller
          name="isLicensed"
          control={control}
          render={({ field }) => (
            <Checkbox {...field} checked={field.value} value="isLicensed">
              Licensed
            </Checkbox>
          )}
        />
      </FormControl>
    </CheckboxGroup>
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
            options={tagCategories.map((tc) => ({
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
            options={tagCategories.map((tc) => ({
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
