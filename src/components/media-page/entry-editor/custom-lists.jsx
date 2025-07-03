import { CheckboxCardGroup, FormControl } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export default function EntryCustomLists({ customLists }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      invalid={!!errors.customLists}
      label="Custom Lists"
      errorMessage={errors.customLists ? errors.customLists.message : undefined}
    >
      <Controller
        name="customLists"
        control={control}
        render={({ field }) => (
          <CheckboxCardGroup
            {...field}
            onChange={(listNames) => field.onChange(listNames.sort())}
            flexWrap={'wrap'}
            items={customLists.map((listName) => ({
              label: listName,
              value: listName,
            }))}
          />
        )}
      />
    </FormControl>
  );
}
