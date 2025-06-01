'use client';

import { useSchedule } from '@/lib/client/hooks/react_query/get/media/schedule'
import { useUserMediaList } from '@/lib/client/hooks/react_query/get/user/media/list'
import { formatTimeLeft } from '@/utils/general'
import AppStorage from '@/utils/local-storage'
import { Carousel, CarouselSlide } from '@yamada-ui/carousel'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon
} from '@yamada-ui/lucide'
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
  Radio,
  RadioGroup,
  Slider,
  SliderMark,
  SliderThumb,
  Text,
  Tooltip,
  useBoolean,
  useMediaQuery
} from '@yamada-ui/react'
import NextLink from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  getAdjustedMaxTimestamp,
  getAdjustedMinTimestamp,
  getBaseTimestamp,
  getSkyGradient,
  getTimeProgress,
  groupShowsByProximity,
} from './utils'

export default function SchedulePage() {
  const [offset, setOffset] = useState(0);
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
            setOffset((prev) => prev - 1);
          }}
        >
          <ChevronLeftIcon />
        </InputLeftAddon>
        <Input
          readOnly
          value={Intl.DateTimeFormat(AppStorage.get('locale') ?? 'en', {
            timeZone: AppStorage.get('timezone') ?? undefined,
            dateStyle: 'medium',
          }).format(new Date(Date.now() + offset * 24 * 60 * 60 * 1000))}
          w="fit-content"
          textAlign={'center'}
        />
        <InputRightAddon
          as={Button}
          disabled={scheduleIsLoading}
          onClick={() => {
            setOffset((prev) => prev + 1);
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
            getBaseTimestamp(
              new Date(Date.now() + offset * 24 * 60 * 60 * 1000)
            ) / 1000,
          endTimestamp:
            getBaseTimestamp(
              new Date(Date.now() + offset * 24 * 60 * 60 * 1000)
            ) /
              1000 +
            24 * 60 * 60,
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
      const prevFirstMarker = markerHistory[0];
      const prevSelectedMarkerShow = prevFirstMarker?.shows.at(
        carouselRef.current
      );

      const groupedData = groupShowsByProximity(
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
        data.shows.some((show) => show.id === prevSelectedMarkerShow?.id)
      );
      const newLeafSliderMarkers = rootSliderSelectedMarker
        ? groupShowsByProximity(rootSliderSelectedMarker.shows, 60)
        : [];
      setTimeSliders(() => {
        const newSlidersArray = [
          {
            id: 'root',
            markers: groupedData,
          },
          ...(rootSliderSelectedMarker
            ? [
                {
                  id: rootSliderSelectedMarker.id, // Leve 1 Slider id
                  markers: newLeafSliderMarkers,
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
              markers?.shows[0]?.id === prevMarkerHistory.at(-1)?.shows[0]?.id
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
      {timeSliders.map((slider, index) => (
        <ScheduleTimeline
          key={slider.id}
          level={index}
          markers={slider.markers}
          setSliders={setTimeSliders}
          markerHistory={markerHistory}
          setMarkerHistory={setMarkerHistory}
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
}) {
  const startTime = useRef(
    getAdjustedMinTimestamp(
      Math.min(...markers?.map((marker) => marker?.timestampMark)) * 1000,
      level > 0 ? 10 * 60 * 1000 : 30 * 60 * 1000
    )
  );
  const endTime = useRef(
    getAdjustedMaxTimestamp(
      Math.max(...markers?.map((marker) => marker?.timestampMark)) * 1000,
      level > 0 ? 10 * 60 * 1000 : 30 * 60 * 1000
    )
  );

  useEffect(() => {
    startTime.current = getAdjustedMinTimestamp(
      Math.min(...markers?.map((marker) => marker?.timestampMark)) * 1000,
      level > 0 ? 10 * 60 * 1000 : 30 * 60 * 1000
    );
    endTime.current = getAdjustedMaxTimestamp(
      Math.max(...markers?.map((marker) => marker?.timestampMark)) * 1000,
      level > 0 ? 10 * 60 * 1000 : 30 * 60 * 1000
    );
  }, [markers]);

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
  }, [markers]);

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
      <SliderMark
        value={
          100 *
          getTimeProgress({
            currentTimestamp: 1748750400000,
            lowerTimestamp: startTime.current,
            upperTimestamp: endTime.current,
          })
        }
        mt="-7"
      >
        <SunIcon color="yellow.200" fontSize={'xl'} />
      </SliderMark>
      <For each={markers}>
        {(marker) => (
          <SliderMark
            key={marker.timestampMark}
            value={
              100 *
              getTimeProgress({
                currentTimestamp: marker.timestampMark * 1000,
                lowerTimestamp: startTime.current,
                upperTimestamp: endTime.current,
              })
            }
            pointerEvents={'all'}
            w="fit-content"
            h="fit-content"
          >
            <Flex
              pointerEvents={'all'}
              onClick={() => {
                if (
                  Array.from(new Set(marker.shows.map((ep) => ep.airingAt)))
                    .length > 1
                ) {
                  setSliders((prev) => {
                    const newSlidersArray = [...prev];
                    const lastSlider = newSlidersArray.at(-1);
                    if (lastSlider?.id === marker.id) {
                      setMarkerHistory([]);
                      return newSlidersArray.slice(0, -1);
                    }

                    newSlidersArray[level + 1] = {
                      id: marker.id,
                      markers: groupShowsByProximity(marker.shows, 60),
                    };

                    return newSlidersArray;
                  });
                } else {
                  // once deleted had to revive, this code ensures that a marker with only one episode when clicked clears the slider of next level if exists,
                  // if this code is not present, then clicking a marker with many shows first and then a marker with 1 episode will retain the 2nd slider.
                  setSliders((prev) => {
                    return prev.slice(0, level + 1);
                  });
                }
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
              }}
              direction={'column'}
            >
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
              <Text transform={'translateX(-30%)'}>
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
              </Text>
            </Flex>
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

                  <GalleryMediaTImeComponent
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

function GalleryMediaTImeComponent({ airingAt, duration, nextEp }) {
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
