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
import AppStorage from '@/utils/local-storage';

export default function ReviewCard({ review }) {
  const emotionList = review.emotions ? review.emotions.split(';') : [];

  // extract to parent logic, or multiple small requests will rate limit the provider server.
  let associatedMedia = useMediaBasicInfoById({
    mediaId: review.associatedMediaId,
    mediaType: review.associatedMediaType,
  });

  return (
    <Container>
      <Flex align="start" mb="2">
        {review.associatedMediaId && associatedMedia?.isFetching && (
          <HStack alignItems={'flex-start'}>
            <Skeleton>
              <Box
                justifyContent="center"
                aspectRatio={9 / 13}
                w={'28'}
                flexShrink={0}
              ></Box>
            </Skeleton>
            <VStack gap={'6'} py="2">
              <VStack gap={'4'}>
                <SkeletonText lineClamp={1}>
                  <Heading>One Piece</Heading>
                </SkeletonText>
                <SkeletonText lineClamp={1}>
                  <Heading>Character Role</Heading>
                </SkeletonText>
              </VStack>
              <Box mt="5">
                <RatingWithEmotions rating={null} emotionList={null} />
              </Box>
            </VStack>
          </HStack>
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
              rating={review.rating}
              emotionList={emotionList}
            />
          </VStack>
        </HStack>

        {review.favourite && <HeartIcon color={'red'} fill={'red'} />}
      </Flex>

      <VStack align="start" spacing="2">
        <Spoiler text={review.reviewText} />

        <Text fontSize="sm" color="gray.200" mt="2">
          Last edited:{' '}
          {Intl.DateTimeFormat(AppStorage.get('locale'), {
            dateStyle: 'long',
            timeStyle: 'long',
            timeZone: AppStorage.get('timezone') ?? undefined,
          }).format(new Date(review.updatedAt))}
        </Text>
      </VStack>
    </Container>
  );
}

function RatingWithEmotions({ rating, emotionList }) {
  const normalizedScore = (5 * rating) / 10;
  const fractions = Math.floor(
    1 / (5 * (rating / 10) - Math.floor(5 * (rating / 10)))
  );
  return (
    <VStack gap={'2'}>
      <Rating
        readOnly
        defaultValue={5 * normalizedScore}
        fractions={fractions === Infinity ? null : fractions}
      />
      {emotionList ? (
        emotionList.length > 0 && (
          <HStack spacing="1" flexWrap="wrap">
            {emotionList.map((emotion) => (
              <Badge key={emotion} colorScheme="pink" variant="subtle">
                {emotion}
              </Badge>
            ))}
          </HStack>
        )
      ) : (
        <Badge
          key={'default-emotion'}
          colorScheme="pink"
          variant="subtle"
          w={'fit-content'}
        >
          <Skeleton h={'5'} w={'10'} />
        </Badge>
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
