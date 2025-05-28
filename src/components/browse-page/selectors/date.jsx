import { sentenceCase } from '@/utils/general';
import { DatePicker } from '@yamada-ui/calendar';
import { Flex, FormControl } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { ReactSelectCustom } from '../reusable-components'

export function DateSelector({ name }) {
  const { control } = useFormContext();
  return (
    <FormControl label={`${sentenceCase(name)} Date`}>
      <Flex>
        <Controller
          control={control}
          name={`${name}DateComparator`}
          render={({ field }) => (
            <ReactSelectCustom
              {...field}
              value={{
                label: field.value,
                value: field.value,
              }}
              onChange={(option) => {
                field.onChange(option?.value ?? '');
              }}
              components={{ IndicatorSeparator: null }}
              defaultValue={{
                label: 'is',
                value: 'is',
              }}
              options={[
                { label: 'is', value: 'is' },
                { label: 'before', value: 'before' },
                { label: 'after', value: 'after' },
              ]}
              isClearable
              classNames={{
                control: () => 'w-[9rem] !rounded-r-none',
              }}
            />
          )}
        />
        <Controller
          control={control}
          name={`${name}Date`}
          render={({ field }) => (
            <DatePicker
              {...field}
              placeholder="YYYY/MM/DD"
              fieldProps={{ borderLeftRadius: 'none' }}
            />
          )}
        />
      </Flex>
    </FormControl>
  );
}
