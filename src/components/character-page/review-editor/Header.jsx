import { useCharacter } from '@/context/use-character';
import { Box, Flex, Heading, Image, VStack } from '@yamada-ui/react';

export function Header() {
  const character = useCharacter();
  return (
    <Flex gap={'2'} flexWrap={{ sm: 'wrap', base: 'nowrap' }}>
      <Box aspectRatio={0.61805} w={{ sm: "14", md: '20', base: '24' }}>
        <Image src={character.image.large} w={'full'} height={'full'} />
      </Box>
      <Heading size={{ base: 'lg', sm: 'md' }}>
        {character.name.userPreferred}
      </Heading>
    </Flex>
  );
}
