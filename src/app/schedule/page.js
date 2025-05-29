'use client';

import { useSchedule } from '@/lib/client/hooks/react_query/get/media/schedule';
import { Carousel, CarouselSlide } from '@yamada-ui/carousel';
import { CircleIcon } from '@yamada-ui/lucide';
import {
  Box,
  Center,
  Flex,
  For,
  Grid,
  Image,
  Link,
  Slider,
  SliderMark,
  SliderThumb,
  Text,
  Tooltip,
  useBoolean,
} from '@yamada-ui/react';
import { useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';

function getBaseTimestamp() {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return Date.parse(date);
}

function getTimeProgress({ currentTimestamp, lowerTimestamp, upperTimestamp }) {
  return (
    ((currentTimestamp ?? Date.now()) -
      (lowerTimestamp ?? getBaseTimestamp())) /
    (upperTimestamp - lowerTimestamp ?? 24 * 60 * 60 * 1000)
  );
}

function groupEpisodesByProximity(episodes, threshold = 60) {
  if (episodes.length < 1) {
    return [];
  }
  // Sort episodes by airingAt value
  episodes.sort((a, b) => a.airingAt - b.airingAt);
  const groupedEpisodes = [];
  let currentGroup = [episodes[0]];
  for (let i = 1; i < episodes.length; i++) {
    const currentEpisode = episodes[i];
    const lastEpisodeInGroup = currentGroup[currentGroup.length - 1];
    // Check if the current episode's airingAt value is within the threshold
    if (currentEpisode.airingAt - lastEpisodeInGroup.airingAt <= threshold) {
      currentGroup.push(currentEpisode);
    } else {
      groupedEpisodes.push({
        timestamp: getAverageTimestamp(currentGroup),
        episodes: currentGroup,
      });
      currentGroup = [currentEpisode];
    }
  }
  // Add the last group
  if (currentGroup.length > 0) {
    groupedEpisodes.push({
      timestamp: getAverageTimestamp(currentGroup),
      episodes: currentGroup,
    });
  }
  return groupedEpisodes;
}

function getAverageTimestamp(episodes) {
  const sum = episodes.reduce((acc, episode) => acc + episode.airingAt, 0);
  return Math.floor(sum / episodes.length);
}

export default function Schedule() {
  const endTime = useRef(getBaseTimestamp());
  const startTime = useRef(getBaseTimestamp() + 24 * 60 * 60 * 1000);
  const [schedule, setSchedule] = useState();

  const { data, isLoading } = useSchedule({
    startTimestamp: getBaseTimestamp() / 1000,
    endTimestamp: getBaseTimestamp() / 1000 + 24 * 60 * 60,
  });

  useEffect(() => {
    if (data) {
      setSchedule(groupEpisodesByProximity(data?.data, 25 * 60));

      startTime.current =
        Math.min(
          ...data?.data?.map((airingSchedule) => airingSchedule.airingAt)
        ) * 1000;
      endTime.current =
        Math.max(
          ...data?.data?.map((airingSchedule) => airingSchedule.airingAt)
        ) * 1000;
    }
  }, [data]);

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
  }, []);

  const [open, { on, off }] = useBoolean(false);

  const [currentHighlighted, setCurrentHighlighted] = useState();

  return (
    <Flex w="full" gap="20" px="4" flexDirection={'column'}>
      <Slider
        defaultValue={
          100 *
          getTimeProgress({
            lowerTimestamp: startTime.current,
            upperTimestamp: endTime.current,
          })
        }
        // reversed
        // orientation="vertical"
        // h="80dvh"
        value={currentTime}
        focusThumbOnChange={false}
        onMouseEnter={on}
        onMouseLeave={off}
      >
        <For each={schedule ?? []}>
          {({ timestamp }) => (
            <SliderMark
              key={timestamp}
              // mb="-3"
              ml="-4"
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
              <Box
                pointerEvents={'all'}
                onClick={() => setCurrentHighlighted(timestamp)}
              >
                <CircleIcon
                  fill={
                    timestamp === currentHighlighted ? 'fuchsia' : 'primary'
                  }
                  stroke={
                    timestamp === currentHighlighted ? 'fuchsia' : 'primary'
                  }
                />
              </Box>
            </SliderMark>
          )}
        </For>
        <Tooltip
          placement="right"
          label={new Date().toLocaleTimeString()}
          open={open}
        >
          <SliderThumb />
        </Tooltip>
      </Slider>
      <Carousel dragFree>
        {(
          schedule?.find((s) => s.timestamp === currentHighlighted)?.episodes ??
          []
        ).map((ep) => (
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
                <Link
                  as={NextLink}
                  alignSelf={'end'}
                  fontSize={'2xl'}
                  color="white"
                  href={`/media?id=${ep.media.id}&type=${ep.media.type}`}
                >
                  {ep.media.title.userPreferred}
                </Link>
              </Flex>
            </Flex>
          </CarouselSlide>
        ))}
      </Carousel>
    </Flex>
  );
}
