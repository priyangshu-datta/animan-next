import { useCharacter } from '@/context/use-character';
import { Box, Flex, Heading, Image, VStack } from '@yamada-ui/react';

export function Header() {
  const character = useCharacter();
  return (
    <Flex gap={'2'} flexWrap={{ sm: 'wrap', base: 'nowrap' }} pl={'4'} pt={'2'}>
      <Box w={'32'} aspectRatio={5 / 7} minW={'28'}>
        <Image src={character.image.large} w={'full'} height={'full'} />
      </Box>
      <VStack>
        <Heading size={'lg'}>{character.name.userPreferred}</Heading>
      </VStack>
    </Flex>
  );
}
