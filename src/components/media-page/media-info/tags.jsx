import { useMedia } from '@/context/use-media';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  Tag,
  Tooltip,
} from '@yamada-ui/react';
import { useState } from 'react';
import NextLink from 'next/link';

export default function MediaTags({ onToggle, open }) {
  const media = useMedia();
  const tags = media.tags ?? [];
  const [showSpoilerTags, setShowSpoilerTags] = useState(false);
  return (
    <>
      {!media.isLoading && (
        <Button variant={'link'} onClick={onToggle}>
          See Tags
        </Button>
      )}
      <Collapse open={open}>
        <Box>
          {tags.some((tag) => tag.isMediaSpoiler) && (
            <Checkbox
              label={'Show spoiler tags'}
              defaultChecked={showSpoilerTags}
              onChange={() => setShowSpoilerTags((prev) => !prev)}
            />
          )}
          <Flex flexWrap={'wrap'} gap={'2'} mt="2">
            {tags
              .filter((tag) => showSpoilerTags || !tag.isMediaSpoiler)
              .map((tag) => (
                <Tooltip key={tag.id} label={tag.description}>
                  <Tag
                    variant={'surface'}
                    colorScheme={tag.isMediaSpoiler ? 'green' : 'purple'}
                    as={NextLink}
                    href={`/browse?mediaType=${media.type}&mediaTagIn=${tag.name}`}
                  >
                    {tag.name}
                  </Tag>
                </Tooltip>
              ))}
          </Flex>
        </Box>
      </Collapse>
    </>
  );
}
