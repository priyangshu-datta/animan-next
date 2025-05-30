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

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState();

  return (
    <Flex w="full" justifyContent={'center'} direction={'column'}>
      <InputGroup w="fit-content" m="auto">
        <InputLeftAddon
          as={Button}
          disabled={isLoading}
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
          disabled={isLoading}
          onClick={() => {
            const d = new Date();
            d.setDate(currentDate.getDate() + 1);
            setCurrentDate(d);
          }}
        >
          <ChevronRightIcon />
        </InputRightAddon>
      </InputGroup>
      <SchedulePageComponent
        startTimestamp={getBaseTimestamp(currentDate) / 1000}
        endTimestamp={getBaseTimestamp(currentDate) / 1000 + 24 * 60 * 60}
        setIsLoading={setIsLoading}
      />
    </Flex>
  );
}

function SchedulePageComponent({ startTimestamp, endTimestamp, setIsLoading }) {
  const [schedules, setSchedules] = useState([]);

  const { data, isLoading } = useSchedule({
    startTimestamp,
    endTimestamp,
  });

  useEffect(() => {
    if (isLoading === true) {
      setIsLoading(true);
    } else if (isLoading === false) {
      setIsLoading(false);
    }
  }, [isLoading]);

  const [mdTimeThreshold, smTimeThreshold] = useMediaQuery([
    '(width < 786px)',
    '(width < 516px)',
  ]);

  useEffect(() => {
    if (data) {
      console.log({ data: data.data });
      setSchedules(() => {
        const groupedData = groupEpisodesByProximity(
          data?.data,
          (smTimeThreshold ? 55 : mdTimeThreshold ? 35 : 25) * 60
        );
        const newScheduleArray = [
          {
            id: 'root',
            entries: groupedData,
          },
        ];

        return newScheduleArray;
      });
    }
  }, [data, mdTimeThreshold, smTimeThreshold]);

  const [currentHighlighted, setCurrentHighlighted] = useState([]);

  return (
    <Flex w="full" gap="20" px="4" flexDirection={'column'} mt="10">
      {schedules.map((schedule, index) => (
        <ScheduleTimeline
          key={schedule.id}
          level={index}
          schedule={schedule.entries}
          setSchedules={setSchedules}
          currentHighlighted={currentHighlighted}
          setCurrentHighlighted={setCurrentHighlighted}
        />
      ))}
      <Carousel autoplay>
        {(currentHighlighted?.at(-1)?.episodes ?? data?.data ?? []).map(
          (ep) => (
            <CarouselSlide
              key={ep.id}
              bgColor={'secondary'}
              bgImg={`url(${ep.media.bannerImage})`}
            >
              <Flex h="full" position={'relative'}>
                <Flex
                  p="8"
                  position={'absolute'}
                  bottom="0"
                  left="0"
                  right="0"
                  h="full"
                  gap="4"
                  bgGradient={
                    'linear-gradient(0deg,rgba(0, 0, 0, 1) 0%, rgba(107, 105, 105, 0.56) 46%, rgba(255, 255, 255, 0) 100%)'
                  }
                >
                  <Box
                    w="32"
                    aspectRatio={9 / 12}
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
                      {ep.media.title.userPreferred}
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
          )
        )}
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
      level > 0 ? 60 * 1000 : 30 * 60 * 1000
    )
  );
  const endTime = useRef(
    getAdjustedMaxTimestamp(
      Math.max(
        ...schedule?.map((airingSchedule) => airingSchedule?.timestamp)
      ) * 1000,
      level > 0 ? 60 * 1000 : 30 * 60 * 1000
    )
  );

  useEffect(() => {
    startTime.current = getAdjustedMinTimestamp(
      Math.min(
        ...schedule?.map((airingSchedule) => airingSchedule?.timestamp)
      ) * 1000,
      level > 0 ? 60 * 1000 : 30 * 60 * 1000
    );
    endTime.current = getAdjustedMaxTimestamp(
      Math.max(
        ...schedule?.map((airingSchedule) => airingSchedule?.timestamp)
      ) * 1000,
      level > 0 ? 60 * 1000 : 30 * 60 * 1000
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
            ml="-2"
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
                  episodes.length > 1 &&
                  Array.from(new Set(episodes.map((ep) => ep.airingAt)))
                    .length > 1
                ) {
                  setSchedules((prev) => {
                    const newScheduleArray = [...prev];
                    newScheduleArray[level + 1] = {
                      id,
                      entries: groupEpisodesByProximity(episodes, 60),
                    };

                    return newScheduleArray;
                  });
                } else {
                  setSchedules((prev) => {
                    return prev.slice(0, level + 1);
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
              {new Date(timestamp * 1000).getHours() % 12}{' '}
              {new Date(timestamp * 1000).getHours() > 12 ? 'pm' : 'am'}
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
