import { assocMedia } from '@/stores/assoc-media';
import { sentenceCase } from '@/utils/general';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Image,
  Text,
  Tooltip,
  VStack,
} from '@yamada-ui/react';
import Link from 'next/link';
import Spoiler from '../spoiler';

export default function MediaCard({ media, style }) {
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
          <Box justifyContent="center" aspectRatio={2 / 3} w={'32'}>
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
                onClick={() => {
                  assocMedia.setState({
                    id: media.id,
                    type: media.type,
                    title: media.title.userPreferred,
                    coverImage: media.coverImage.extraLarge,
                    role: media.characterRole,
                  });
                }}
              >
                {media.title.userPreferred}
              </Text>
            ) : (
              <Link href={`/media?id=${media.id}&type=${media.type}`} passHref>
                <Text size="md" lineClamp={1}>
                  {media.title.userPreferred}
                </Text>
              </Link>
            )}
          </Tooltip>
          <Text>ROLE: {sentenceCase(media.characterRole)}</Text>
          {style === 'list' && <Spoiler text={media.description} />}
        </VStack>
      </CardBody>
    </Card>
  );
}
