import { FormControl, Input } from "@yamada-ui/react"
import { Controller, useFormContext } from "react-hook-form"

export default function EntryRating() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      label="Score"
      invalid={!!errors.score}
      errorMessage={errors.score ? errors.score.message : undefined}
    >
      <Controller
        control={control}
        name="score"
        rules={{
          min: {
            value: 0,
            message: 'Score cannot go below 0',
          },
          max: {
            value: 10,
            message: 'Score cannot go above 10.',
          },
        }}
        render={({ field }) => (
          <Input
            type="number"
            min={0}
            max={10}
            step={'0.01'}
            {...field}
            onChange={(e) => {
              field.onChange(parseFloat(e.target.value));
            }}
          />
        )}
      />
    </FormControl>
  );
}
