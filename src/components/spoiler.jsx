import { ChevronDownIcon, ChevronUpIcon } from '@yamada-ui/lucide';
import {
  Box,
  Button,
  Collapse,
  Text,
  useDisclosure,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useRef, useState } from 'react';

export default function Spoiler({ text, startingHeight = 25 }) {
  const { open, onToggle } = useDisclosure();
  const textRef = useRef();

  return (
    <VStack gap={'0'}>
      {startingHeight > textRef.current?.scrollHeight ? (
        <Text
          dangerouslySetInnerHTML={{ __html: text }}
          ref={textRef}
          wordBreak={'break-word'}
        />
      ) : (
        <>
          <Box
            position="relative"
            maxH={open ? 'none' : 'fit-content'}
            overflow="hidden"
          >
            <Collapse
              open={open}
              startingHeight={
                startingHeight > textRef.current?.scrollHeight
                  ? textRef.current.scrollHeight
                  : startingHeight
              }
            >
              <Text
                dangerouslySetInnerHTML={{ __html: text }}
                ref={textRef}
                wordBreak={'break-word'}
              />
            </Collapse>
            {!open && (
              <Box
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                height="15px"
                bgGradient={[
                  'linear(to-t, white, transparent)',
                  'linear(to-t, black, transparent)',
                ]}
                pointerEvents="none"
              />
            )}
          </Box>
          <Button onClick={onToggle} variant={'link'} size="sm" w="fit-content">
            {open ? <ChevronUpIcon /> : <ChevronDownIcon />} Show{' '}
            {open ? 'Less' : 'More'}
          </Button>
        </>
      )}
    </VStack>
  );
}
