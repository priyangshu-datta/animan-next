import { useMediaBasicInfoById } from '@/lib/client/hooks/react_query/get/media/info/basic/by-id';
import { sentenceCase } from '@/utils/general';
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
import Spoiler from '../spoiler';

export default function ReviewCard({ review }) {
  const emotionList = review.emotions ? review.emotions.split(';') : [];
  const score = Math.floor(
    1 / (5 * (review.rating / 10) - Math.floor(5 * (review.rating / 10)))
  );

  let associatedMedia = null;

  if (review.associatedMediaId && review.associatedMediaType) {
    associatedMedia = useMediaBasicInfoById({
      mediaId: review.associatedMediaId,
      mediaType: review.associatedMediaType,
    });
  }

  return (
    <Container>
      <Flex align="start" mb="2">
        {review.associatedMediaId && associatedMedia?.isFetching && (
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
          {review.associatedMediaId && associatedMedia?.isFetched && (
            <Box
              justifyContent="center"
              aspectRatio={9 / 13}
              w={'28'}
              flexShrink={0}
            >
              <Image
                src={associatedMedia.data.data.coverImage.extraLarge}
                alt={associatedMedia.data.data.title.userPreferred}
                w={'full'}
                h={'full'}
              />
            </Box>
          )}
          <VStack gap={'6'}>
            {review.associatedMediaId && associatedMedia?.isFetched && (
              <VStack gap={'2'}>
                <Heading size={'md'}>
                  {associatedMedia.data.data.title.userPreferred}
                </Heading>
                <Text>
                  Character Role: <strong>{sentenceCase(review.role)}</strong>
                </Text>
              </VStack>
            )}
            <RatingWithEmotions
              review={review}
              score={score}
              emotionList={emotionList}
            />
          </VStack>
        </HStack>

        {review.favourite && <HeartIcon color={'red'} fill={'red'} />}
      </Flex>

      <VStack align="start" spacing="2">
        <Spoiler text={review.reviewText} />
        {/* <Text fontSize="md" fontWeight="medium">
          {}
        </Text> */}

        <Text fontSize="sm" color="gray.200" mt="2">
          Last edited:{' '}
          {Intl.DateTimeFormat(localStorage.getItem('animan-locale'), {
            dateStyle: 'long',
            timeStyle: 'long',
            timeZone: localStorage.getItem('animan-timezone') ?? undefined,
          }).format(new Date(review.updatedAt))}
        </Text>
      </VStack>
    </Container>
  );
}

function RatingWithEmotions({ review, score, emotionList }) {
  return (
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
  );
}

function Container({ children }) {
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
      {children}
    </Box>
  );
}
