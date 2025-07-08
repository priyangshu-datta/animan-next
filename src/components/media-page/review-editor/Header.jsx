import { useMedia } from '@/context/use-media';
import { useCountDownTimer } from '@/lib/client/hooks/use-count-down-timer';
import { REVIEW_CATEGORIES } from '@/lib/constants';
import {
  Box,
  Flex,
  Heading,
  HStack,
  Image,
  Select,
  Text,
  VStack,
} from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export function Header({ currentReviewMetadata }) {
  const media = useMedia();
  const { control, reset, getValues } = useFormContext();
  const timeLeft = useCountDownTimer(media.nextAiringEpisode?.airingAt);
  return (
    <HStack align={'start'}>
      <Box aspectRatio={0.61805} w={{ md: '20', base: '24' }}>
        <Image
          objectFit={'cover'}
          objectPosition={'center'}
          src={media.coverImage.extraLarge}
          w={'full'}
          height={'full'}
        />
      </Box>
      <VStack gap="2">
        <Flex gap={'sm'} alignItems={'baseline'}>
          <Heading size={{ base: 'lg', sm: 'md' }}>
            {media.title.userPreferred}
          </Heading>
        </Flex>
        {timeLeft ? (
          <Text
            fontWeight={'light'}
            fontSize={{ lg: 'lg', md: 'md', base: 'xl' }}
          >
            Next Episode {media.nextAiringEpisode.episode} in {timeLeft}
          </Text>
        ) : (
          ''
        )}

        <Flex gap={'sm'} alignItems={'baseline'} wrap="wrap">
          <Text fontSize={{ base: 'md', sm: 'sm' }}>Review</Text>

          <Controller
            name="subjectType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                variant={"flushed"}
                disabled={!!currentReviewMetadata?.id}
                w={'fit-content'}
                items={REVIEW_CATEGORIES[media.type.toLowerCase()]}
                onChange={(option) => {
                  if (option === 'anime' || option === 'manga') {
                    const { unit, ...values } = getValues();
                    reset(values);
                  } else {
                    reset({
                      ...getValues(),
                      ...(['episode', 'chapter'].includes(
                        currentReviewMetadata?.subjectType
                      ) && {
                        unit: media.entry.progress ?? 0,
                      }),
                    });
                  }
                  field.onChange(option);
                }}
              />
            )}
          />
        </Flex>
      </VStack>
    </HStack>
  );
}
