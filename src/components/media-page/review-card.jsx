import AppStorage from '@/utils/local-storage';
import { HeartIcon } from '@yamada-ui/lucide';
import {
  Badge,
  Box,
  Flex,
  HStack,
  Rating,
  Text,
  VStack,
} from '@yamada-ui/react';

export default function ReviewCard({ review }) {
  const emotionList = review.emotions ? review.emotions.split(';') : [];

  return (
    <Container>
      <Flex justify="space-between" align="start" mb="2">
        <HStack spacing="2">
          {!['anime', 'manga'].includes(review.subjectType) && (
            <Badge colorScheme="primary" variant="solid">
              {review.subjectType === 'chapter' &&
                `Ch. ${review.chapterNumber}`}
              {review.subjectType === 'episode' &&
                `Ep. ${review.episodeNumber}`}
              {review.subjectType === 'volume' && `Vl. ${review.volume}`}
            </Badge>
          )}
          <Rating readOnly value={5 * (review.rating / 10)} fractions={10} />
        </HStack>

        {review.favourite && <HeartIcon color={'red'} fill={'red'} />}

        {/* <Menu matchWidth={true}>
          <MenuButton
            as={IconButton}
            icon={<EllipsisIcon fontSize={'xl'} />}
            variant="ghost"
          />

          <MenuList>
            <MenuItem icon={<PencilIcon />}>Edit</MenuItem>
            <MenuItem icon={<Trash2Icon />}>Remove</MenuItem>
          </MenuList>
        </Menu> */}
      </Flex>

      <VStack align="start" spacing="2" w="full">
        <Text fontSize="md" fontWeight="medium" wordBreak={'break-word'}>
          {review.reviewText}
        </Text>

        {emotionList.length > 0 && (
          <HStack spacing="1" flexWrap="wrap">
            {emotionList.map((emotion) => (
              <Badge key={emotion} colorScheme="pink" variant="subtle">
                {emotion}
              </Badge>
            ))}
          </HStack>
        )}

        <Text fontSize="xs" color="gray.500" mt="2">
          {Intl.DateTimeFormat(AppStorage.get('locale'), {
            timeZone: AppStorage.get('timezone'),
            timeStyle: 'medium',
            dateStyle: 'long',
          }).format(new Date(review.updatedAt))}
        </Text>
      </VStack>
    </Container>
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
