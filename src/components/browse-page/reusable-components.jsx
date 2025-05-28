import { sentenceCase, snakeToCamel } from '@/utils/general';
import { MinusIcon, PlusIcon } from '@yamada-ui/lucide';
import {
  Airy,
  FormControl,
  InputGroup,
  InputLeftAddon,
  useColorMode,
  useColorModeValue,
} from '@yamada-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import ReactSelect from 'react-select';

/**
 *
 * @param {import('react-select').Props & {label: string}} props
 * @returns {import('react').ReactElement}
 */
export function InclusionToggleMultiSelector(props) {
  const { control } = useFormContext();
  const label = snakeToCamel(props.label.replaceAll(' ', '_'));
  return (
    <FormControl label={sentenceCase(props.label)}>
      <InputGroup>
        <InputLeftAddon p="0" minH={'38px'}>
          <Controller
            control={control}
            name={`${label}Inclusion`}
            render={({ field }) => (
              <Airy
                px="3"
                w="full"
                h="full"
                from={<PlusIcon color="green.500" />}
                to={<MinusIcon color="red.500" />}
                value={field.value ? 'from' : 'to'}
                onChange={(state) => {
                  field.onChange(state === 'from');
                }}
              />
            )}
          />
        </InputLeftAddon>
        <Controller
          control={control}
          name={label}
          render={({ field }) =>
            props.Selector ? (
              props.Selector({ field })
            ) : (
              <ReactSelectCustom
                {...field}
                value={field.value.map((fv) => ({
                  label: sentenceCase(fv),
                  value: fv,
                }))}
                onChange={(options) => {
                  field.onChange(options.map((opt) => opt.value));
                }}
                isMulti
                closeMenuOnSelect={false}
                options={props.items}
                className="w-full"
                classNames={{ control: () => '!rounded-l-none' }}
              />
            )
          }
        />
      </InputGroup>
    </FormControl>
  );
}

/**
 *
 * @param {import('react-select').Props} props
 * @returns {import('react').ReactElement}
 */
export function ReactSelectCustom(props) {
  const { colorMode } = useColorMode();
  const colorModeStyles = useColorModeValue(
    { control: {} },
    {
      control: {
        backgroundColor: '#141414',
        borderColor: '#434248',
        ':hover': {
          borderColor: '#4c4c4c',
        },
        ':focus-within:not(:hover)': {
          borderColor: '#0070f0',
        },
        borderRadius: '0.375rem',
      },
      input: {
        color: 'white',
      },
      menu: {
        backgroundColor: 'ThreeDDarkShadow',
      },
      singleValue: {
        color: 'white',
      },
      multiValue: { backgroundColor: 'GrayText' },
      multiValueLabel: {
        backgroundColor: 'GrayText',
        color: 'white',
      },
      multiValueRemove: {
        backgroundColor: 'GrayText',
      },
    }
  );
  return (
    <ReactSelect
      {...props}
      styles={{
        control: (styles) => ({
          ...styles,
          ...colorModeStyles.control,
          minWidth: '95px',
          minHeight: '40px',
        }),
        option: (styles) => ({ ...styles, marginBlock: '5px' }),
        input: (styles) => ({ ...styles, ...colorModeStyles.input }),
        menu: (styles) => ({ ...styles, ...colorModeStyles.menu }),
        singleValue: (styles) => ({
          ...styles,
          ...colorModeStyles.singleValue,
        }),
        multiValue: (styles) => ({
          ...styles,
          ...colorModeStyles.multiValue,
        }),
        multiValueLabel: (styles) => ({
          ...styles,
          ...colorModeStyles.multiValueLabel,
        }),
        multiValueRemove: (styles) => ({
          ...styles,
          ...colorModeStyles.multiValueRemove,
        }),
      }}
      theme={(theme) =>
        colorMode === 'dark'
          ? {
              ...theme,
              colors: {
                ...theme.colors,
                primary25: '#7bb3fd',
              },
            }
          : { ...theme }
      }
    />
  );
}
