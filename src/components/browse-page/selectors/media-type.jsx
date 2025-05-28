import { MEDIA_TYPES } from '@/lib/constants';
import { sentenceCase } from '@/utils/general';
import { Controller, useFormContext } from 'react-hook-form';
import { ReactSelectCustom } from '../reusable-components'

export function MediaTypeSelector() {
  const { control } = useFormContext();
  return (
    <Controller
      name="mediaType"
      control={control}
      render={({ field }) => (
        <ReactSelectCustom
          {...field}
          className="w-full"
          components={{
            IndicatorSeparator: null,
            DropdownIndicator: null,
          }}
          isSearchable={false}
          options={MEDIA_TYPES.map((t) => ({
            label: sentenceCase(t),
            value: t,
          }))}
          value={{
            label: sentenceCase(field.value),
            value: field.value,
          }}
          onChange={({ value }) => {
            field.onChange(value);
          }}
        />
      )}
    />
  );
}
