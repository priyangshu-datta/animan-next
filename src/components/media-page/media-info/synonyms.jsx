import { useMedia } from '@/context/use-media';
import { Box, Button, Collapse, Flex, useDisclosure } from '@yamada-ui/react';
import TextWithCopyButton from '../text-with-copy-btn';

export default function MediaTitleSynonyms() {
  const media = useMedia();
  const synonyms = media.synonyms ?? [];

  const { open, onToggle } = useDisclosure();

  return synonyms.length > 0 ? (
    <>
      <Button variant={'link'} onClick={onToggle}>
        {open ? 'Hide' : 'See'} Synonyms
      </Button>
      <Collapse open={open}>
        <Flex flexWrap={'wrap'} gap={'2'} mt="2">
          {synonyms.map((synonym) => (
            <Box
              borderColor="ActiveBorder"
              borderWidth={'thin'}
              p="2"
              rounded="md"
              key={synonym}
            >
              <TextWithCopyButton copyText={synonym} variant="link" />
            </Box>
          ))}
        </Flex>
      </Collapse>
    </>
  ) : (
    ''
  );
}
