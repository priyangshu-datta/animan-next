import { sentenceCase } from '@/lib/client/utils';
import {
  Card,
  CardBody,
  CardHeader,
  Text,
  Image,
  Tooltip,
  Box,
  VStack,
  Collapse,
  useDisclosure,
  Button,
} from '@yamada-ui/react';
import Link from 'next/link';

export default function MediaCard(props) {
  const { media, style, setAssociatedMedia } = props;
  const { open, onToggle } = useDisclosure();
  return (
    <Card>
      {style !== 'list' && (
        <CardHeader justifyContent="center" aspectRatio={4 / 5} width={'full'}>
          <Image
            src={media.coverImage.extraLarge}
            objectFit="cover"
            w={'full'}
            h={'full'}
          />
        </CardHeader>
      )}
      <CardBody display={'flex'} flexDir={'row'}>
        {style == 'list' && (
          <Box
            justifyContent="center"
            aspectRatio={style === 'list' ? 2 / 3 : 4 / 5}
            w={'32'}
          >
            <Image
              src={media.coverImage.extraLarge}
              objectFit="cover"
              w={'full'}
              h={'full'}
            />
          </Box>
        )}
        <VStack>
          <Tooltip label={style !== 'list' && media.title.userPreferred}>
            {style === 'list' ? (
              <Text
                size="md"
                lineClamp={1}
                onClick={() => setAssociatedMedia(media)}
              >
                {media.title.userPreferred}
              </Text>
            ) : (
              <Link href={`/media/${media.id}`} passHref>
                <Text size="md" lineClamp={1}>
                  {media.title.userPreferred}
                </Text>
              </Link>
            )}
          </Tooltip>
          <Text>ROLE: {sentenceCase(media.characterRole)}</Text>
          {style === 'list' && (
            <VStack gap={'0'}>
              <Box
                position="relative"
                maxH={open ? 'none' : 'fit-content'}
                overflow="hidden"
              >
                <Collapse open={open} startingHeight={42}>
                  <Text
                    dangerouslySetInnerHTML={{ __html: media.description }}
                  />
                </Collapse>
                {!open && (
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    height="40px"
                    bgGradient={[
                      'linear(to-t, white, transparent)',
                      'linear(to-t, black, transparent)',
                    ]}
                    pointerEvents="none"
                  />
                )}
              </Box>
              <Button onClick={onToggle} variant={'unstyled'}>
                Show More
              </Button>
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
