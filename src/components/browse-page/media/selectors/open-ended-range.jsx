import { sentenceCase } from '@/utils/general';
import { ChevronLeftIcon } from '@yamada-ui/lucide';
import { Flex, Input, Text, useColorMode } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export function OpenEndedRange({ label }) {
  const { colorMode } = useColorMode();
  const { control } = useFormContext();

  return (
    <Flex alignItems={'center'} gap="2">
      <Controller
        control={control}
        name={`${label}Lesser`}
        render={({ field }) => (
          <Input
            {...field}
            onChange={(ev) => {
              field.onChange(ev.target.value);
            }}
            type="number"
            borderRightRadius={'none'}
          />
        )}
      />
      <ChevronLeftIcon />
      <Text
        color={colorMode === 'dark' ? 'whiteAlpha.900' : 'blackAlpha.900'}
        py={'8px'}
        minW={'80px'}
        textAlign={'center'}
      >
        {sentenceCase(label)}
      </Text>
      <ChevronLeftIcon />
      <Controller
        control={control}
        name={`${label}Greater`}
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            onChange={(ev) => {
              field.onChange(ev.target.value);
            }}
            borderLeftRadius={'none'}
          />
        )}
      />
    </Flex>
  );
}
