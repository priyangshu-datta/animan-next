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
  const {
    subject_type,
    episode_number,
    chapter_number,
    rating,
    emotions,
    favourite,
    review_text,
    updated_at,
    volume,
  } = review;

  const emotionList = emotions ? emotions.split(';') : [];
  const score = Math.floor(
    1 / (5 * (rating / 10) - Math.floor(5 * (rating / 10)))
  );
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
      <Flex justify="space-between" align="start" mb="2">
        <HStack spacing="2">
          {!['anime', 'manga'].includes(subject_type) && (
            <Badge colorScheme="primary" variant="solid">
              {subject_type === 'chapter' && `Ch ${chapter_number}`}
              {subject_type === 'episode' && `Ep ${episode_number}`}
              {subject_type === 'volume' && `Vl ${volume}`}
            </Badge>
          )}
          <Rating
            readOnly
            defaultValue={5 * (rating / 10)}
            fractions={score === Infinity ? null : score}
          />
        </HStack>

        {favourite && <HeartIcon color={'red'} fill={'red'} />}

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

      <VStack align="start" spacing="2">
        <Text fontSize="md" fontWeight="medium">
          {review_text}
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
          {new Date(updated_at).toLocaleString()}
        </Text>
      </VStack>
    </Box>
  );
}
