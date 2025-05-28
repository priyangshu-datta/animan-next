import { MEDIA_SORT } from '@/lib/constants';
import { FormControl } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { ReactSelectCustom } from '../reusable-components'

export function MediaSortMethodSelector({}) {
  const { control } = useFormContext;
  return (
    <FormControl label={'Media Sort'}>
      <Controller
        control={control}
        name={'mediaSort'}
        render={({ field }) => (
          <ReactSelectCustom
            {...field}
            value={field.value.map((fv) => ({
              label: MEDIA_SORT.find((sort) => sort.value === fv).label,
              value: fv,
            }))}
            onChange={(options) => {
              field.onChange(options.map((opt) => opt.value));
            }}
            isMulti
            closeMenuOnSelect={false}
            options={MEDIA_SORT}
            className="w-full"
          />
        )}
      />
    </FormControl>
  );
}
