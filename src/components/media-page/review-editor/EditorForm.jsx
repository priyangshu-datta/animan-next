import { useMedia } from '@/context/use-media';
import { EMOTIONS } from '@/lib/constants';
import { sentenceCase } from '@/utils/general';
import { HeartIcon } from '@yamada-ui/lucide';
import {
  FormControl,
  HStack,
  Input,
  MultiSelect,
  Tag,
  Textarea,
  Toggle,
  VStack,
} from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';

export function EditorForm() {
  const media = useMedia();
  const {
    formState: { errors },
    control,
    watch,
  } = useFormContext();

  const totalEpisodes =
    media?.nextAiringEpisode?.episode - 1 || media?.episodes;
  return (
    <VStack>
      <Controller
        name="favourite"
        control={control}
        render={({ field }) => (
          <Toggle
            {...field}
            w={'fit-content'}
            px="4"
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
              filter={'drop-shadow(0 0 0.75rem crimson)'}
            />{' '}
            {watch('subjectType') === 'volume'
              ? `Volume ${watch('volume')}`
              : watch('unit')
              ? `${sentenceCase(watch('subjectType'))} ${watch('unit')}`
              : `this ${sentenceCase(watch('subjectType'))} review`}
          </Toggle>
        )}
      />
      <HStack>
        {['chapter', 'episode'].includes(watch('subjectType')) && (
          <FormControl
            required
            label={media.type === 'ANIME' ? 'Episode' : 'Chapter'}
            invalid={!!errors.unit}
            errorMessage={errors.unit ? errors.unit.message : undefined}
          >
            <Controller
              name="unit"
              control={control}
              rules={{
                max: {
                  value: totalEpisodes,
                  message: `${
                    media.type === 'ANIME' ? 'Episode' : 'Chapter'
                  } cannot be above than ${totalEpisodes}`,
                },
                min: {
                  value: 1,
                  message: `${
                    media.type === 'ANIME' ? 'Episode' : 'Chapter'
                  } cannot be 0`,
                },
                required: {
                  value: true,
                  message: `${
                    media.type === 'ANIME' ? 'Episode' : 'Chapter'
                  } is required`,
                },
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  // max={maxEpisodes}
                  step={1}
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseInt(e.target.value));
                  }}
                />
              )}
            />
          </FormControl>
        )}
        {watch('subjectType') === 'volume' && (
          <FormControl
            label={'Volume'}
            invalid={!!errors.volume}
            errorMessage={errors.volume ? errors.volume.message : undefined}
          >
            <Controller
              name="volume"
              control={control}
              rules={{
                min: {
                  value: 0,
                  message: `Volume cannot be 0`,
                },
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseInt(e.target.value));
                  }}
                />
              )}
            />
          </FormControl>
        )}
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
      </HStack>

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
              omitSelectedValues={true}
              placeholder="Select your emotions"
              component={({ label, onRemove }) => (
                <Tag onClose={onRemove}>{label}</Tag>
              )}
              items={EMOTIONS}
              {...field}
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
            <Textarea autosize minRows={4} maxRows={10} {...field} />
          )}
        />
      </FormControl>
    </VStack>
  );
}
