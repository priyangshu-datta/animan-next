'use client';

import { useSchedule } from '@/lib/client/hooks/react_query/get/media/schedule';
import AppStorage from '@/utils/local-storage';
import { Carousel, CarouselSlide } from '@yamada-ui/carousel';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleIcon,
  SunIcon,
} from '@yamada-ui/lucide';
import {
  Box,
  Button,
  Flex,
  For,
  Grid,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Link,
  Loading,
  Radio,
  RadioGroup,
  Slider,
  SliderMark,
  SliderThumb,
  Text,
  Tooltip,
  useBoolean,
  useMediaQuery,
} from '@yamada-ui/react';
import NextLink from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  getAdjustedMaxTimestamp,
  getAdjustedMinTimestamp,
  getBaseTimestamp,
  getSkyGradient,
  getTimeProgress,
  groupEpisodesByProximity,
} from './utils';
import { useUserMediaList } from '@/lib/client/hooks/react_query/get/user/media/list';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleIsLoading, setIsLoading] = useState();

  const {
    data: userCurrentMedia,
    fetchNextPage,
    hasNextPage,
    isLoading: userCurrentMediaIsLoading,
  } = useUserMediaList({
    mediaType: 'ANIME',
    mediaListStatus: 'CURRENT',
    perPage: 25,
  });

  useEffect(() => {
    if (userCurrentMedia) {
      if (hasNextPage) {
        fetchNextPage();
      } else {
        console.log(
          userCurrentMedia.pages
            .flatMap((page) => page.mediaList)
            .filter((entry) => entry.media.status === 'RELEASING')
            .map((entry) => entry.media.id)
        );
      }
    }
  }, [userCurrentMedia]);

  const [onList, setOnList] = useState('all');

  return (
    <Flex w="full" justifyContent={'center'} direction={'column'} gap="4">
      <InputGroup w="fit-content" m="auto">
        <InputLeftAddon
          as={Button}
          disabled={scheduleIsLoading}
          onClick={() => {
            const d = new Date();
            d.setDate(currentDate.getDate() - 1);
            setCurrentDate(d);
          }}
        >
          <ChevronLeftIcon />
        </InputLeftAddon>
        <Input
          readOnly
          value={Intl.DateTimeFormat(AppStorage.get('locale') ?? 'en', {
            timeZone: AppStorage.get('timezone') ?? undefined,
            dateStyle: 'medium',
          }).format(currentDate)}
          w="fit-content"
          textAlign={'center'}
        />
        <InputRightAddon
          as={Button}
          disabled={scheduleIsLoading}
          onClick={() => {
            const d = new Date();
            d.setDate(currentDate.getDate() + 1);
            setCurrentDate(d);
          }}
        >
          <ChevronRightIcon />
        </InputRightAddon>
      </InputGroup>
      {userCurrentMediaIsLoading ? (
        <Loading />
      ) : (
        <RadioGroup
          direction={'row'}
          m="auto"
          onChange={(option) => {
            setOnList(option);
          }}
          defaultValue="all"
        >
          <Radio value="inList">In List</Radio>
          <Radio value="notInList">Not in List</Radio>
          <Radio value="all">All</Radio>
        </RadioGroup>
      )}
      <SchedulePageComponent
        searchOptions={{
          startTimestamp: getBaseTimestamp(currentDate) / 1000,
          endTimestamp: getBaseTimestamp(currentDate) / 1000 + 24 * 60 * 60,
          ...(onList === 'inList'
            ? {
                mediaIdIn: userCurrentMedia.pages
                  .flatMap((page) => page.mediaList)
                  .filter((entry) => entry.media.status === 'RELEASING')
                  .map((entry) => entry.media.id),
              }
            : onList === 'notInList'
            ? {
                mediaIdNotIn: userCurrentMedia.pages
                  .flatMap((page) => page.mediaList)
                  .filter((entry) => entry.media.status === 'RELEASING')
                  .map((entry) => entry.media.id),
              }
            : {}),
        }}
        setIsLoading={setIsLoading}
      />
    </Flex>
  );
}

function SchedulePageComponent({ searchOptions, setIsLoading }) {
  const [timeSliders, setTimeSliders] = useState([]);

  const { data, isLoading } = useSchedule(searchOptions);

  useEffect(() => {
    if (isLoading === true) {
      setIsLoading(true);
    } else if (isLoading === false) {
      setIsLoading(false);
    }
  }, [isLoading]);

  const [
    xsTimeThreshold,
    smTimeThreshold,
    mdTimeThreshold,
    lgTimeThreshold,
    xlTimeThreshold,
    xxlTimeThreshold,
    xxxlTimeThreshold,
  ] = useMediaQuery([
    '(width < 320px)',
    '(width < 576px)',
    '(width < 992px)',
    '(width < 1200px)',
    '(width < 1440px)',
    '(width < 1600px)',
    '(width < 2000px)',
  ]);

  const carouselRef = useRef();

  const [markerHistory, setMarkerHistory] = useState([]);

  useEffect(() => {
    if (data) {
      const prevLeafSliderSelectedMarker = markerHistory[0]?.episodes.at(
        carouselRef.current
      );

      const groupedData = groupEpisodesByProximity(
        data?.data,
        (xsTimeThreshold // < 320
          ? 2 * 60
          : smTimeThreshold //  320 -  576
          ? 60
          : mdTimeThreshold //  576 -  992
          ? 55
          : lgTimeThreshold //  992 - 1200
          ? 50
          : xlTimeThreshold // 1200 - 1440
          ? 45
          : xxlTimeThreshold // 1440 - 1600
          ? 40
          : xxxlTimeThreshold // 1600 - 2000
          ? 35
          : 20) * 60
      );
      const rootSliderSelectedMarker = groupedData.find((data) =>
        data.episodes.some((d) => d.id === prevLeafSliderSelectedMarker?.id)
      );
      const newLeafSliderMarkers = rootSliderSelectedMarker
        ? groupEpisodesByProximity(rootSliderSelectedMarker.episodes, 60)
        : [];
      setTimeSliders(() => {
        const newSlidersArray = [
          {
            id: 'root',
            entries: groupedData,
          },
          ...(rootSliderSelectedMarker
            ? [
                {
                  id: rootSliderSelectedMarker.id, // Leve 1 Slider id
                  entries: newLeafSliderMarkers,
                },
              ]
            : []),
        ];

        return newSlidersArray;
      });

      if (rootSliderSelectedMarker) {
        const leafSliderSelectedMarker = (prevMarkerHistory) => [
          newLeafSliderMarkers?.find(
            (markers) =>
              markers?.episodes[0]?.id ===
              prevMarkerHistory.at(-1)?.episodes[0]?.id
          ),
        ];
        setMarkerHistory((prev) => [
          rootSliderSelectedMarker,
          ...(markerHistory.length > 1 ? leafSliderSelectedMarker(prev) : []),
        ]);
      }
    }
  }, [
    data,
    mdTimeThreshold,
    smTimeThreshold,
    xsTimeThreshold,
    smTimeThreshold,
    mdTimeThreshold,
    lgTimeThreshold,
    xlTimeThreshold,
    xxlTimeThreshold,
    xxxlTimeThreshold,
  ]);

  return (
    <Flex w="full" gap="20" px="4" flexDirection={'column'} mt="10">
      {timeSliders.map((schedule, index) => (
        <ScheduleTimeline
          key={schedule.id}
          level={index}
          schedule={schedule.entries}
          setSchedules={setTimeSliders}
          currentHighlighted={markerHistory}
          setCurrentHighlighted={setMarkerHistory}
        />
      ))}
      <Carousel
        autoplay
        onChange={(index) => {
          carouselRef.current = index;
        }}
      >
        {(markerHistory?.at(-1)?.episodes ?? data?.data ?? []).map((ep) => (
          <CarouselSlide
            key={ep.id}
            bgColor={'secondary'}
            bgImg={`url(${ep.media.bannerImage})`}
            bgPosition={'center'}
          >
            <Flex h="full" position={'relative'}>
              <Flex
                p="8"
                position={'absolute'}
                bottom="0"
                left="0"
                right="0"
                gap="4"
                bgGradient={
                  'linear-gradient(0deg,rgba(0, 0, 0, 1) 0%, rgba(107, 105, 105, 0.56) 46%, rgba(255, 255, 255, 0) 100%)'
                }
                flexWrap={'wrap'}
              >
                <Box
                  w="32"
                  aspectRatio={8.7 / 12}
                  alignSelf={'end'}
                  boxShadow={'dark-lg'}
                  flexShrink={0}
                  objectFit={'contain'}
                >
                  <Image
                    w="full"
                    h="full"
                    src={ep.media.coverImage.extraLarge}
                    alt={ep.media.title.userPreferred}
                  />
                </Box>
                <Flex alignSelf={'end'} direction={'column'}>
                  <Link
                    as={NextLink}
                    fontSize={'2xl'}
                    color="white"
                    href={`/media?id=${ep.media.id}&type=${ep.media.type}`}
                  >
                    <Text lineClamp={1}>{ep.media.title.userPreferred}</Text>
                  </Link>
                  <Text color="white">
                    {Intl.DateTimeFormat(AppStorage.get('locale'), {
                      timeZone: AppStorage.get('timezone'),
                      dateStyle: 'long',
                      timeStyle: 'long',
                    }).format(ep.airingAt * 1000)}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </CarouselSlide>
        ))}
      </Carousel>
    </Flex>
  );
}

function ScheduleTimeline({
  schedule,
  setSchedules,
  currentHighlighted,
  setCurrentHighlighted,
  level,
}) {
  const startTime = useRef(
    getAdjustedMinTimestamp(
      Math.min(
        ...schedule?.map((airingSchedule) => airingSchedule?.timestamp)
      ) * 1000,
      level > 0 ? 10 * 60 * 1000 : 30 * 60 * 1000
    )
  );
  const endTime = useRef(
    getAdjustedMaxTimestamp(
      Math.max(
        ...schedule?.map((airingSchedule) => airingSchedule?.timestamp)
      ) * 1000,
      level > 0 ? 10 * 60 * 1000 : 30 * 60 * 1000
    )
  );

  useEffect(() => {
    startTime.current = getAdjustedMinTimestamp(
      Math.min(
        ...schedule?.map((airingSchedule) => airingSchedule?.timestamp)
      ) * 1000,
      level > 0 ? 10 * 60 * 1000 : 30 * 60 * 1000
    );
    endTime.current = getAdjustedMaxTimestamp(
      Math.max(
        ...schedule?.map((airingSchedule) => airingSchedule?.timestamp)
      ) * 1000,
      level > 0 ? 10 * 60 * 1000 : 30 * 60 * 1000
    );
  }, [schedule]);

  const [open, { on, off }] = useBoolean(false);
  const [currentTime, setCurrentTime] = useState();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        100 *
          getTimeProgress({
            lowerTimestamp: startTime.current,
            upperTimestamp: endTime.current,
          })
      );
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [schedule]);

  return (
    <Slider
      defaultValue={
        100 *
        getTimeProgress({
          lowerTimestamp: startTime.current,
          upperTimestamp: endTime.current,
        })
      }
      value={currentTime}
      focusThumbOnChange={false}
      onMouseEnter={on}
      onMouseLeave={off}
      trackColor={getSkyGradient(
        new Date(startTime.current),
        new Date(endTime.current)
      )}
      filledTrackColor={'transparent'}
    >
      <SliderMark
        value={
          100 *
          getTimeProgress({
            currentTimestamp:
              (getBaseTimestamp() + getBaseTimestamp() + 1000 * 60 * 60 * 24) /
              2,
            lowerTimestamp: startTime.current,
            upperTimestamp: endTime.current,
          })
        }
        mt="-7"
      >
        <SunIcon color="yellow.200" fontSize={'xl'} />
      </SliderMark>
      <For each={schedule}>
        {({ id, timestamp, episodes }) => (
          <SliderMark
            key={timestamp}
            ml="-3.5"
            value={
              100 *
              getTimeProgress({
                currentTimestamp: timestamp * 1000,
                lowerTimestamp: startTime.current,
                upperTimestamp: endTime.current,
              })
            }
            pointerEvents={'all'}
            w="fit-content"
            h="fit-content"
          >
            <Grid
              pointerEvents={'all'}
              onClick={() => {
                if (
                  Array.from(new Set(episodes.map((ep) => ep.airingAt)))
                    .length > 1
                ) {
                  setSchedules((prev) => {
                    const newScheduleArray = [...prev];

                    if (newScheduleArray.at(-1)?.id === id) {
                      setCurrentHighlighted([]);
                      return newScheduleArray.slice(0, -1);
                    }

                    newScheduleArray[level + 1] = {
                      id,
                      entries: groupEpisodesByProximity(episodes, 60),
                    };

                    return newScheduleArray;
                  });
                }
                setCurrentHighlighted((prev) => {
                  const newVal = [...prev];
                  const sameAsLast = newVal.at(-1)?.id === id;

                  if (sameAsLast) {
                    return newVal.slice(0, -1);
                  }

                  newVal[level] = { id, timestamp, episodes };

                  return newVal.slice(0, level + 1);
                });
              }}
              placeItems={'center'}
            >
              <CircleIcon
                fill={
                  currentHighlighted.map((ch) => ch.id).includes(id)
                    ? 'fuchsia'
                    : 'primary'
                }
                stroke={
                  currentHighlighted.map((ch) => ch.id).includes(id)
                    ? 'fuchsia'
                    : 'primary'
                }
              />
              {/* {Intl.DateTimeFormat(AppStorage.get('locale'), {
                hour12: true,
                hour: '2-digit',
              }).format(new Date(timestamp * 1000))}{' '} */}
              {episodes.length > 1 ? `(${episodes.length})` : ''}
            </Grid>
          </SliderMark>
        )}
      </For>
      <Tooltip
        placement="right"
        label={
          getBaseTimestamp(new Date(startTime.current)) < Date.now() &&
          Date.now() <
            getBaseTimestamp(new Date(endTime.current)) + 24 * 60 * 60 * 1000
            ? Intl.DateTimeFormat(AppStorage.get('locale'), {
                timeZone: AppStorage.get('timezone'),
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
              }).format(new Date())
            : Intl.DateTimeFormat(AppStorage.get('locale'), {
                dateStyle: 'short',
                timeStyle: 'medium',
                timeZone: AppStorage.get('timezone'),
              }).format(new Date())
        }
        open={open}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
}
