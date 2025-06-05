'use client';

import { useSchedule } from '@/lib/client/hooks/react_query/get/media/schedule';
import { useUserMediaList } from '@/lib/client/hooks/react_query/get/user/media/list';
import { MS_IN_DAY, MS_IN_MINUTE, MS_IN_SECOND } from '@/lib/constants';
import { formatTimeLeft } from '@/utils/general';
import AppStorage from '@/utils/local-storage';
import { Carousel, CarouselSlide } from '@yamada-ui/carousel';
import { ChevronLeftIcon, ChevronRightIcon, SunIcon } from '@yamada-ui/lucide';
import {
  Box,
  Button,
  Flex,
  For,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Link,
  Loading,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
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
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  findMarkerContainingShow,
  getAdjustedMaxTimestamp,
  getAdjustedMinTimestamp,
  getBaseTimestamp,
  getSkyGradient,
  getTimeProgress,
  groupShowsByProximity,
} from './utils';

export default function SchedulePageWrapper() {
  return (
    <Suspense>
      <SchedulePage />
    </Suspense>
  );
}

function SchedulePage() {
  const searchParams = useSearchParams();
  const [offset, setOffset] = useState(
    parseInt(searchParams.get('offset') ?? 0)
  );
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
    if (userCurrentMedia && hasNextPage) {
      fetchNextPage();
    }
  }, [userCurrentMedia]);

  const [onList, setOnList] = useState('all');

  const releasingMediaIds = useMemo(
    () =>
      (userCurrentMedia?.pages ?? [])
        .flatMap((page) => page.mediaList)
        .filter((entry) => entry.media.status === 'RELEASING')
        .map((entry) => entry.media.id),
    [userCurrentMedia]
  );

  return (
    <Flex w="full" justifyContent={'center'} direction={'column'} gap="4">
      <InputGroup w="fit-content" m="auto">
        <InputLeftAddon
          as={Button}
          disabled={scheduleIsLoading}
          onClick={() => {
            setOffset((prev) => {
              const newSearchParams = new URLSearchParams();
              newSearchParams.set('offset', prev - 1);
              window.history.replaceState(
                null,
                '',
                `?${newSearchParams.toString()}`
              );
              return prev - 1;
            });
          }}
        >
          <ChevronLeftIcon />
        </InputLeftAddon>
        <Input
          readOnly
          value={Intl.DateTimeFormat(AppStorage.get('locale') ?? 'en', {
            timeZone: AppStorage.get('timezone') ?? undefined,
            dateStyle: 'medium',
          }).format(new Date(Date.now() + offset * MS_IN_DAY))}
          w="fit-content"
          textAlign={'center'}
        />
        <InputRightAddon
          as={Button}
          disabled={scheduleIsLoading}
          onClick={() => {
            setOffset((prev) => {
              const newSearchParams = new URLSearchParams();
              newSearchParams.set('offset', prev + 1);
              window.history.replaceState(
                null,
                '',
                `?${newSearchParams.toString()}`
              );
              return prev + 1;
            });
          }}
        >
          <ChevronRightIcon />
        </InputRightAddon>
      </InputGroup>
      {userCurrentMediaIsLoading ? (
        <Loading m="auto" />
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
          startTimestamp:
            getBaseTimestamp(new Date(Date.now() + offset * MS_IN_DAY)) / 1000,
          endTimestamp:
            getBaseTimestamp(new Date(Date.now() + (offset + 1) * MS_IN_DAY)) /
            1000,
          ...(onList === 'inList'
            ? { mediaIdIn: releasingMediaIds }
            : onList === 'notInList'
            ? { mediaIdNotIn: releasingMediaIds }
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
      let groupedShows = groupShowsByProximity(
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

      const newSliders = [{ id: 'root', markers: groupedShows }];
      const newMarkerHistory = [];
      let level = 0;

      const leafNode = markerHistory
        ?.at(-1)
        ?.shows?.at(carouselRef.current - 1);

      while (true) {
        const marker = findMarkerContainingShow(groupedShows, leafNode);
        if (!marker) {
          break;
        }

        newMarkerHistory.push(marker);

        if (
          Array.from(new Set(marker.shows.map((show) => show.airingAt)))
            .length < 2
        ) {
          break;
        }
        groupedShows = groupShowsByProximity(
          marker.shows,
          getThresholdByLevel(level + 1)
        );

        let newLevel = level;
        while (
          groupedShows.length === 1 &&
          Array.from(
            new Set(groupedShows[0].shows.map((show) => show.airingAt))
          ).length > 1
        ) {
          if (newLevel > 10) {
            groupedShows = groupShowsByProximity(
              groupedShows[0].shows,
              SECOND_IN_MS
            );
            newLevel = level;
            break;
          }
          newLevel++;
          groupedShows = groupShowsByProximity(
            groupedShows[0].shows,
            getThresholdByLevel(newLevel + 1)
          );
        }

        newSliders.push({
          id: marker.id,
          markers: groupedShows,
          level: newLevel,
        });
        level++;
      }

      setTimeSliders(newSliders);
      setMarkerHistory((prev) => {
        if (prev?.at(-1)?.shows?.length === 1) return newMarkerHistory;
        else return newMarkerHistory.slice(0, -1);
      });
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
    <Flex w="full" gap="20" px="4" flexDirection={'column'} pt="10" overflow={"clip"}>
      {timeSliders.map((slider, index) => (
        <ScheduleTimeline
          key={slider.id}
          level={index}
          markers={slider.markers}
          setSliders={setTimeSliders}
          markerHistory={markerHistory}
          setMarkerHistory={setMarkerHistory}
          searchOptions={searchOptions}
        />
      ))}

      <Gallery
        carouselRef={carouselRef}
        data={data}
        markerHistory={markerHistory}
      />
    </Flex>
  );
}

function ScheduleTimeline({
  markers,
  setSliders,
  markerHistory,
  setMarkerHistory,
  level,
  searchOptions,
}) {
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
  const delay =
    ((xsTimeThreshold // < 320
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
      : 20) *
      MS_IN_MINUTE) /
    Math.pow(level + 1, 4);

  const startTime = useMemo(() => {
    // Handle cases where markers might be empty or null
    if (!markers || markers.length === 0) {
      return Date.now(); // Or some sensible default
    }
    return getAdjustedMinTimestamp(
      Math.min(...markers.map((marker) => marker?.timestampMark)) * 1000,
      delay
    );
  }, [markers, level]); // Dependencies: markers and level

  const endTime = useMemo(() => {
    // Handle cases where markers might be empty or null
    if (!markers || markers.length === 0) {
      return Date.now() + MS_IN_DAY; // Or some sensible default
    }
    return getAdjustedMaxTimestamp(
      Math.max(...markers.map((marker) => marker?.timestampMark)) * 1000,
      delay
    );
  }, [markers, level]); // Dependencies: markers and level

  const [open, { on, off }] = useBoolean(false);
  const [currentTime, setCurrentTime] = useState();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        100 *
          getTimeProgress({
            lowerTimestamp: startTime, // use state variable
            upperTimestamp: endTime, // use state variable
          })
      );
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [startTime, endTime]); // Add startTime and endTime here

  return (
    <Slider
      defaultValue={
        100 *
        getTimeProgress({
          lowerTimestamp: startTime,
          upperTimestamp: endTime,
        })
      }
      value={currentTime}
      focusThumbOnChange={false}
      onMouseEnter={on}
      onMouseLeave={off}
      trackColor={getSkyGradient(startTime, endTime)}
      filledTrackColor={'transparent'}
    >
      <FixedSunTimelineMark
        endTime={endTime}
        searchOptions={searchOptions}
        startTime={startTime}
      />

      <For each={markers}>
        {(marker) => (
          <SliderMark
            key={marker.timestampMark}
            value={
              100 *
              getTimeProgress({
                timestamp: marker.timestampMark * MS_IN_SECOND,
                lowerTimestamp: startTime,
                upperTimestamp: endTime,
              })
            }
            pointerEvents={'all'}
            w="fit-content"
            h="fit-content"
            ml="-3"
          >
            <TimelineSliderMarker
              level={level}
              marker={marker}
              markerHistory={markerHistory}
              setMarkerHistory={setMarkerHistory}
              setSliders={setSliders}
            />
          </SliderMark>
        )}
      </For>

      <TimelineSliderThumb
        endTime={endTime}
        open={open}
        startTime={startTime}
      />
    </Slider>
  );
}

function Gallery({ carouselRef, data, markerHistory }) {
  return (
    <Carousel
      autoplay
      onChange={(index) => {
        carouselRef.current = index;
      }}
    >
      {(markerHistory?.at(-1)?.shows ?? data?.data ?? []).map(
        ({ episode: nextEp, id, media, airingAt }) => (
          <CarouselSlide
            key={id}
            bgColor={'secondary'}
            {...(media.bannerImage
              ? { bgImg: `url(${media.bannerImage})` }
              : {})}
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
                    src={media.coverImage.extraLarge}
                    alt={media.title.userPreferred}
                  />
                </Box>
                <Flex alignSelf={'end'} direction={'column'} color="white">
                  <Link
                    as={NextLink}
                    fontSize={'2xl'}
                    color="white"
                    href={`/media?id=${media.id}&type=${media.type}`}
                  >
                    <Text lineClamp={1}>{media.title.userPreferred}</Text>
                  </Link>

                  <GalleryMediaTimeComponent
                    airingAt={airingAt}
                    duration={media.duration}
                    nextEp={nextEp}
                  />

                  {media.listEntry && (
                    <Box>
                      {media.listEntry.status === 'CURRENT' ? (
                        <Flex gap="1">
                          You&apos;re <Text as="em">watching</Text> this.
                        </Flex>
                      ) : media.listEntry.status === 'PLANNING' ? (
                        <Flex gap="1">
                          This is on your <Text as="em">planning</Text> list.
                        </Flex>
                      ) : media.listEntry.status === 'PAUSED' ? (
                        <Flex gap="1">
                          You have <Text as="em">paused</Text> this.
                        </Flex>
                      ) : media.listEntry.status === 'DROPPED' ? (
                        <Flex gap="1">
                          You have <Text as="em">dropped</Text> this.
                        </Flex>
                      ) : media.listEntry.status === 'REPEATING' ? (
                        <Flex gap="1">
                          You are <Text as="em">re-watching</Text> this.
                        </Flex>
                      ) : media.listEntry.status === 'COMPLETED' ? (
                        <Flex gap="1">
                          You <Text as="em">finished</Text> this.
                        </Flex>
                      ) : (
                        ''
                      )}
                    </Box>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </CarouselSlide>
        )
      )}
    </Carousel>
  );
}

function GalleryMediaTimeComponent({ airingAt, duration, nextEp }) {
  const [currentTime, setCurrentTime] = useState();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <Text>
      Ep {nextEp} air
      {airingAt > currentTime / 1000
        ? 's'
        : airingAt + duration * 60 > currentTime / 1000
        ? 'ing'
        : 'ed'}{' '}
      {formatTimeLeft(airingAt, duration * 60 ?? 0)}
    </Text>
  );
}

function FixedSunTimelineMark({ endTime, searchOptions, startTime }) {
  return (
    <SliderMark
      value={
        100 *
        getTimeProgress({
          timestamp:
            ((searchOptions.startTimestamp + searchOptions.endTimestamp) *
              MS_IN_SECOND) /
            2,
          lowerTimestamp: startTime,
          upperTimestamp: endTime,
        })
      }
      mt="-7"
    >
      <SunIcon color="yellow.200" fontSize={'xl'} />
    </SliderMark>
  );
}

function TimelineSliderThumb({ endTime, open, startTime }) {
  return (
    <Tooltip
      placement="right"
      label={
        getBaseTimestamp(new Date(startTime)) < Date.now() &&
        Date.now() < getBaseTimestamp(new Date(endTime)) + MS_IN_DAY
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
  );
}

function TimelineSliderMarker({
  level,
  marker,
  markerHistory,
  setMarkerHistory,
  setSliders,
}) {
  return (
    <Flex
      pointerEvents={'all'}
      onClick={() => {
        markerClickHandler();
      }}
      direction={'column'}
    >
      <Popover
        open={markerHistory.map((m) => m.id).includes(marker.id)}
        offset={[0, 0]}
        closeOnEsc
        closeOnButton={false}
        lazy
      >
        <PopoverTrigger>
          <Box
            rounded={'full'}
            aspectRatio={1 / 1}
            textAlign={'center'}
            color={'white'}
            bg={
              markerHistory.map((m) => m.id).includes(marker.id)
                ? 'fuchsia'
                : 'primary'
            }
            w="fit-content"
          >
            {marker.shows.length}
          </Box>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody>
            {markerHistory.map((m) => m.id).includes(marker.id) &&
              (marker.timeRange.length < 2
                ? Intl.DateTimeFormat(AppStorage.get('locale'), {
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(marker.timeRange[0] * 1000))
                : Intl.DateTimeFormat(AppStorage.get('locale'), {
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit',
                  }).formatRange(
                    new Date(marker.timeRange[0] * 1000),
                    new Date(marker.timeRange[1] * 1000)
                  ))}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );

  function markerClickHandler() {
    setSliders((prev) => {
      if (
        Array.from(new Set(marker.shows.map((ep) => ep.airingAt))).length > 1
      ) {
        const newSlidersArray = [...prev];
        const lastSlider = newSlidersArray.at(-1);

        if (
          lastSlider &&
          markerHistory.map((marker) => marker.id).includes(marker.id)
        ) {
          setMarkerHistory((prev) => prev.slice(0, level));
          return newSlidersArray.slice(0, level + 1);
        }

        let newMarkers = groupShowsByProximity(
          marker.shows,
          getThresholdByLevel(level + 1)
        );

        let newLevel = level;
        while (
          newMarkers.length === 1 &&
          Array.from(new Set(newMarkers[0].shows.map((show) => show.airingAt)))
            .length > 1
        ) {
          if (newLevel > 10) {
            newMarkers = groupShowsByProximity(
              newMarkers[0].shows,
              SECOND_IN_MS
            );
            break;
          }
          newLevel++;
          newMarkers = groupShowsByProximity(
            newMarkers[0].shows,
            getThresholdByLevel(newLevel + 1)
          );
        }

        newSlidersArray[level + 1] = {
          id: marker.id,
          markers: groupShowsByProximity(
            marker.shows,
            level === 0 ? 5 * 60 : 60
          ),
        };

        return newSlidersArray.slice(0, level + 2);
      } else {
        // once deleted had to revive, this code ensures that a marker with only one episode when clicked clears the slider of next level if exists,
        // if this code is not present, then clicking a marker with many shows first and then a marker with 1 episode will retain the 2nd slider.
        return prev.slice(0, level + 1);
      }
    });
    setMarkerHistory((prev) => {
      const newVal = [...prev];
      const lastMarker = newVal.at(-1);
      const sameAsLast = lastMarker?.id === marker.id;

      if (sameAsLast) {
        return newVal.slice(0, -1);
      }

      newVal[level] = marker;

      return newVal.slice(0, level + 1);
    });
  }
}
