import { COUNTRY_OF_ORIGIN } from '@/lib/constants';
import { FormControl } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { ReactSelectCustom } from '../reusable-components';

export function CountryOfOriginSelector() {
  const { control } = useFormContext();
  return (
    <FormControl label={'Country of Origin'}>
      <Controller
        control={control}
        name="countryOfOrigin"
        render={({ field }) => (
          <ReactSelectCustom
            {...field}
            isSearchable={false}
            options={[...COUNTRY_OF_ORIGIN, { label: 'Any', value: 'all' }]}
            components={{ IndicatorSeparator: null }}
            value={
              field.value && {
                label: [
                  ...COUNTRY_OF_ORIGIN,
                  { label: 'Any', value: 'all' },
                ].find(({ value }) => value === field.value)['label'],
                value: field.value,
              }
            }
            onChange={(option) => {
              field.onChange(option?.value ?? '');
            }}
          />
        )}
      />
    </FormControl>
  );
}
