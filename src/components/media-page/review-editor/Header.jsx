import { useMedia } from '@/context/use-media';
import { useCountDownTimer } from '@/lib/client/hooks/use-count-down-timer';
import { REVIEW_CATEGORIES } from '@/lib/constants';
import { HeartIcon } from '@yamada-ui/lucide';
import {
  Flex,
  Heading,
  Image,
  Select,
  Text,
  Toggle,
  VStack,
} from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export function Header({ currentReviewMetadata }) {
  const media = useMedia();
  const { control, watch } = useFormContext();
  const timeLeft = useCountDownTimer(media.nextAiringEpisode?.airingAt);
  return (
    <>
      <Image src={media.coverImage.extraLarge} w={'40'} />
      <VStack>
        <Flex gap={'sm'} alignItems={'baseline'}>
          <Heading size={{ base: 'lg', sm: 'md' }}>
            {media.title.userPreferred}
          </Heading>
        </Flex>
        {timeLeft ? (
          <Text fontWeight={'light'}>
            Next Episode {media.nextAiringEpisode.episode} in {timeLeft}
          </Text>
        ) : (
          ''
        )}
        <Flex gap={'sm'} alignItems={'baseline'} wrap="wrap">
          <Text>Review</Text>

          <Controller
            name="subjectType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                disabled={!!currentReviewMetadata?.id}
                w={'fit-content'}
                items={REVIEW_CATEGORIES[media.type.toLowerCase()]}
              />
            )}
          />
        </Flex>
      </VStack>
    </>
  );
}
