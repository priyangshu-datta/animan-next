import { RangeDatePicker } from '@yamada-ui/calendar';
import { FormControl } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export default function EntryStartEndDate() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      invalid={!!errors.startEndDate}
      label="Star and End Date"
      errorMessage={
        errors.startEndDate ? errors.startEndDate.message : undefined
      }
    >
      <Controller
        name="startEndDate"
        control={control}
        render={({ field }) => (
          <RangeDatePicker
            {...field}
            today
            placeholder="YYYY/MM/DD"
            firstDayOfWeek="sunday"
            amountOfMonths={2}
            // weekendDays={[0]} // maybe add in user settings to control
          />
        )}
      />
    </FormControl>
  );
}
