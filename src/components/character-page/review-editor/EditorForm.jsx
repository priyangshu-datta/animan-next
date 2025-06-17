import { EMOTIONS } from '@/lib/constants';
import {
  FormControl,
  Input,
  MultiSelect,
  Tag,
  Textarea,
  Toggle,
} from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { AssociatedMedia } from './AssociatedMedia';
import { HeartIcon } from '@yamada-ui/lucide'

export function EditorForm() {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <>
      <AssociatedMedia />
      <Controller
        name="favourite"
        control={control}
        render={({ field }) => (
          <Toggle
            {...field}
            w={'fit-content'}
            py="4"
            borderRadius={'full'}
            value="favourite"
            selected={field.value}
            variant={'unstyled'}
            onChange={(selected) => field.onChange(selected)}
            gap={'2'}
            display={'flex'}
          >
            <HeartIcon
              color={field.value ? 'red' : 'white'}
              fill={field.value ? 'red' : 'white'}
            />{' '}
            this Character review
          </Toggle>
        )}
      />
      <FormControl
        required
        label="Rating"
        invalid={!!errors.rating}
        errorMessage={errors.rating ? errors.rating.message : undefined}
      >
        <Controller
          control={control}
          name="rating"
          rules={{
            min: {
              value: 0,
              message: 'Rating cannot go below 0',
            },
            max: {
              value: 10,
              message: 'Rating cannot go above 10.',
            },
            required: {
              value: true,
              message: 'Rating is required',
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              min={0}
              max={10}
              step={'0.01'}
              onChange={(e) => {
                field.onChange(parseFloat(e.target.value) ?? 0);
              }}
            />
          )}
        />
      </FormControl>
      <FormControl
        label="Emotions"
        invalid={!!errors.emotions}
        errorMessage={errors.emotions ? errors.emotions.message : undefined}
      >
        <Controller
          name="emotions"
          control={control}
          render={({ field }) => (
            <MultiSelect
              {...field}
              omitSelectedValues={true}
              placeholder="Select your emotions"
              component={({ label, onRemove }) => (
                <Tag onClose={onRemove}>{label}</Tag>
              )}
              items={EMOTIONS}
            />
          )}
        />
      </FormControl>
      <FormControl
        required
        label="Review"
        invalid={!!errors.review}
        errorMessage={errors.review ? errors.review.message : undefined}
      >
        <Controller
          control={control}
          name="review"
          rules={{
            minLength: {
              value: 10,
              message: 'Review must atleast have 10 characters',
            },
            required: {
              value: true,
              message: 'Review is required',
            },
          }}
          render={({ field }) => (
            <Textarea {...field} autosize minRows={4} maxRows={10} />
          )}
        />
      </FormControl>
    </>
  );
}
