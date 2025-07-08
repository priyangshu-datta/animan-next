import { MEDIA_SEASONS } from '@/lib/constants';
import { sentenceCase } from '@/utils/general';
import { FormControl } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { ReactSelectCustom } from '../reusable-components'

export function MediaSeasonSelector() {
  const { control } = useFormContext();
  return (
    <FormControl label={'Season'}>
      <Controller
        name="season"
        control={control}
        render={({ field }) => (
          <ReactSelectCustom
            {...field}
            placeholder="Any"
            isSearchable={false}
            isClearable
            options={MEDIA_SEASONS.map((t) => ({
              label: sentenceCase(t),
              value: t.toLowerCase(),
            }))}
            components={{ IndicatorSeparator: null }}
            value={
              field.value && {
                label: sentenceCase(field?.value),
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
