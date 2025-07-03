import { useMedia } from '@/context/use-media';
import { FormControl, Input } from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export default function EntryProgress() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const media = useMedia();

  const totalEpisodes =
    media?.nextAiringEpisode?.episode - 1 || media?.episodes;

  return (
    <FormControl
      label="Progress"
      invalid={!!errors.progress}
      errorMessage={errors.progress ? errors.progress.message : undefined}
    >
      <Controller
        name="progress"
        control={control}
        rules={{
          max: {
            value: totalEpisodes,
            message: `You cannot progress above ${totalEpisodes}`,
          },
          min: {
            value: 0,
            message: 'Progress cannot be negative',
          },
        }}
        render={({ field }) => (
          <Input
            type="number"
            step={1}
            min={0}
            max={totalEpisodes}
            {...field}
            onChange={(e) => {
              field.onChange(parseInt(e.target.value));
            }}
          />
        )}
      />
    </FormControl>
  );
}
