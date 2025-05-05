import { useSmallMediaById } from '@/lib/client/hooks/react_query/graphql/use-media-by-id';
import { sentenceCase } from '@/lib/client/utils';
import { HeartIcon } from '@yamada-ui/lucide';
import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Image,
  Rating,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
} from '@yamada-ui/react';

export default function ReviewCard({ review }) {
  const emotionList = review.emotions ? review.emotions.split(';') : [];
  const score = Math.floor(
    1 / (5 * (review.rating / 10) - Math.floor(5 * (review.rating / 10)))
  );

  const associatedMedia = useSmallMediaById(review.associatedMediaId);

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p="4"
      w="full"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex align="start" mb="2">
        {review.associatedMediaId && associatedMedia.isFetching && (
          <>
            <HStack>
              <Skeleton>
                <Box h={'36'} w={'28'}></Box>
              </Skeleton>
              <SkeletonText lineClamp={1} />
            </HStack>
          </>
        )}

        <HStack alignItems={'flex-start'}>
          {review.associatedMediaId && associatedMedia.isFetched && (
            <Box
              justifyContent="center"
              aspectRatio={4 / 5}
              w={'28'}
              flexShrink={0}
            >
              <Image
                src={associatedMedia.data.data.Media.coverImage.extraLarge}
                alt={associatedMedia.data.data.Media.title.userPreferred}
                w={'full'}
                h={'full'}
              />
            </Box>
          )}
          <VStack gap={'6'}>
            {review.associatedMediaId && associatedMedia.isFetched && (
              <VStack gap={'2'}>
                <Heading size={'md'}>
                  {associatedMedia.data.data.Media.title.userPreferred}
                </Heading>
                <Text>
                  Character Role: <strong>{sentenceCase(review.role)}</strong>
                </Text>
              </VStack>
            )}
            <VStack gap={'2'}>
              <Rating
                readOnly
                defaultValue={5 * (review.rating / 10)}
                fractions={score === Infinity ? null : score}
              />
              {emotionList.length > 0 && (
                <HStack spacing="1" flexWrap="wrap">
                  {emotionList.map((emotion) => (
                    <Badge key={emotion} colorScheme="pink" variant="subtle">
                      {emotion}
                    </Badge>
                  ))}
                </HStack>
              )}
            </VStack>
          </VStack>
        </HStack>

        {review.favourite && <HeartIcon color={'red'} fill={'red'} />}
      </Flex>

      <VStack align="start" spacing="2">
        <Text fontSize="md" fontWeight="medium">
          {review.reviewText}
        </Text>

        <Text fontSize="xs" color="gray.500" mt="2">
          {new Date(review.updatedAt).toLocaleString()}
        </Text>
      </VStack>
    </Box>
  );
}
