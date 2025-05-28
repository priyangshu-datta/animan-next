import { MEDIA_SOURCE } from '@/lib/constants';
import { sentenceCase } from '@/utils/general';
import { FormControl } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { ReactSelectCustom } from '../reusable-components'

export function MediaSourceSelector({}) {
  const { control, watch } = useFormContext();
  return (
    <FormControl label={'Media Source'}>
      <Controller
        control={control}
        name={'mediaSource'}
        render={({ field }) => (
          <ReactSelectCustom
            {...field}
            value={field.value.map((fv) => ({
              label: sentenceCase(fv.replaceAll('_', ' ')),
              value: fv,
            }))}
            onChange={(options) => {
              field.onChange(options.map((opt) => opt.value));
            }}
            isMulti
            closeMenuOnSelect={false}
            options={MEDIA_SOURCE.map((m) => ({
              label: sentenceCase(m.replaceAll('_', ' ')),
              value: m,
            }))}
            className="w-full"
          />
        )}
      />
    </FormControl>
  );
}
