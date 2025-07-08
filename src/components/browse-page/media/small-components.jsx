import { MEDIA_FORMAT, MEDIA_STATUS } from '@/lib/constants';
import { sentenceCase } from '@/utils/general';
import { YearPicker } from '@yamada-ui/calendar';
import {
  Checkbox,
  CheckboxGroup,
  FormControl,
  Radio,
  RadioGroup,
} from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  InclusionToggleMultiSelector,
  ReactSelectCustom,
} from './reusable-components';

export function GenreSelector({ genres }) {
  return (
    <InclusionToggleMultiSelector
      label="Genres"
      items={genres.map((m) => ({
        label: sentenceCase(m.replaceAll('_', ' ')),
        value: m,
      }))}
    />
  );
}

export function MediaStatusSelector() {
  const { watch } = useFormContext();
  return (
    <InclusionToggleMultiSelector
      label={'Media Status'}
      items={MEDIA_STATUS[watch('mediaType').toLowerCase()]}
    />
  );
}

export function MediaFormatSelector() {
  const { watch } = useFormContext();
  return (
    <InclusionToggleMultiSelector
      label={'Media Format'}
      items={MEDIA_FORMAT[watch('mediaType').toLowerCase()]}
    />
  );
}

export function MediaTagSelector({ tagCategories, tags }) {
  return (
    <InclusionToggleMultiSelector
      label={'Media Tag'}
      Selector={({ field }) => {
        return (
          <ReactSelectCustom
            {...field}
            placeholder="Any"
            value={field.value.map((tagName) => ({
              label: tagName,
              value: tagName,
            }))}
            onChange={(options) => {
              field.onChange(options.map((opt) => opt.value));
            }}
            isMulti
            closeMenuOnSelect={false}
            options={(tagCategories ?? []).map((tc) => ({
              label: tc,
              options: tags
                .filter((t) => t.category === tc)
                .map((t) => ({ label: t.name, value: t.name })),
            }))}
            className="w-full"
            classNames={{ control: () => '!rounded-l-none' }}
          />
        );
      }}
    />
  );
}

export function MediaTagCategorySelector({ tagCategories }) {
  return (
    <InclusionToggleMultiSelector
      label={'Media Tag Category'}
      Selector={({ field }) => {
        return (
          <ReactSelectCustom
            {...field}
            placeholder="Any"
            value={field.value.map((tagCategory) => ({
              label: tagCategory,
              value: tagCategory,
            }))}
            onChange={(options) => {
              field.onChange(options.map((opt) => opt.value));
            }}
            isMulti
            closeMenuOnSelect={false}
            options={(tagCategories ?? []).map((tc) => ({
              label: tc,
              value: tc,
            }))}
            className="w-full"
            classNames={{ control: () => '!rounded-l-none' }}
          />
        );
      }}
    />
  );
}

export function SeasonYearSelector() {
  const { control } = useFormContext();
  return (
    <FormControl label="Season Year">
      <Controller
        control={control}
        name="seasonYear"
        render={({ field }) => <YearPicker {...field} placeholder="YYYY" />}
      />
    </FormControl>
  );
}

export function CheckBoxes() {
  const { control } = useFormContext();

  return (
    <Controller
      name="checkboxes"
      control={control}
      render={({ field }) => (
        <CheckboxGroup {...field} direction="row" alignItems={'center'}>
          <Checkbox value="isAdult">Adult</Checkbox>
          <Checkbox value="isLicensed">Licensed</Checkbox>
        </CheckboxGroup>
      )}
    />
  );
}

export function OnListRadio() {
  const { control } = useFormContext();

  return (
    <Controller
      name="onList"
      control={control}
      render={({ field }) => (
        <RadioGroup {...field} direction="row" alignItems={'center'}>
          <Radio value="inList">In List</Radio>
          <Radio value="notInList">Not in List</Radio>
          <Radio value="all">All</Radio>
        </RadioGroup>
      )}
    />
  );
}
