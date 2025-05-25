import {
  Box,
  Button,
  Collapse,
  Text,
  useDisclosure,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useRef, useState } from 'react';

export default function Spoiler({ text }) {
  const { open, onToggle } = useDisclosure();
  const [isOneLine, setIsOneLine] = useState(true);
  const textRef = useRef();
  useEffect(() => {
    if (textRef.current.scrollHeight > 25) {
      setIsOneLine(false);
    }
  }, []);
  return (
    <VStack gap={'0'}>
      {isOneLine ? (
        <Text dangerouslySetInnerHTML={{ __html: text }} ref={textRef} />
      ) : (
        <>
          <Box
            position="relative"
            maxH={open ? 'none' : 'fit-content'}
            overflow="hidden"
          >
            <Collapse open={open} startingHeight={42}>
              <Text dangerouslySetInnerHTML={{ __html: text }} ref={textRef} />
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
        </>
      )}
    </VStack>
  );
}
