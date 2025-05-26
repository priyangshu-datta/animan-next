'use client';

import { useUserInfo } from '@/lib/client/hooks/react_query/get/user/info';
import { useUpdateUserInfo } from '@/lib/client/hooks/react_query/patch/user/info';

import AnilistIcon from '@/components/icons/anilist';
import { useCheckUsername } from '@/lib/client/hooks/react_query/get/user/check-username';
import { SNACK_DURATION } from '@/lib/constants';
import { debounce, fuzzyRegexMatch, sentenceCase } from '@/utils/general';
import {
  CheckIcon,
  ComputerIcon,
  MoonIcon,
  SunIcon,
  XIcon,
} from '@yamada-ui/lucide';
import {
  Button,
  ButtonGroup,
  Container,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  FormControl,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Loading,
  Text,
  useColorMode,
  useNotice,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactSelect from 'react-select';

export default function ProfilePage() {
  const userInfo = useUserInfo();

  const {
    control,
    reset,
    formState: { errors, isDirty, dirtyFields, defaultValues },
    handleSubmit,
    watch,
    setValue,
    resetField,
  } = useForm({
    defaultValues: {
      username: userInfo.data?.data?.username,
      locale: userInfo.data?.data?.locale ?? '',
      timezone: userInfo.data?.data?.timezone ?? '',
      colorScheme: userInfo.data?.data?.colorScheme,
    },
  });

  const notice = useNotice();
  const {
    mutate,
    data: isUsernameExists,
    isPending: checkingUsername,
    isSuccess: checkedUsername,
    reset: resetCheckUsername,
  } = useCheckUsername();
  const patchUserInfo = useUpdateUserInfo({
    handleError: (error) => {
      notice({
        status: 'error',
        description: error.message,
        duration: SNACK_DURATION,
      });
    },
    handleSuccess: ({ variables }) => {
      notice({
        status: 'success',
        description: 'Updated successfully',
        duration: SNACK_DURATION,
      });
      localStorage.setItem('animan-locale', watch('locale'));
      localStorage.setItem('animan-timezone', watch('timezone'));

      reset({ ...watch() });
      resetCheckUsername();
    },
  });

  const { internalColorMode, changeColorMode, colorMode } = useColorMode();

  useEffect(() => {
    if (userInfo.data?.data?.colorScheme) {
      changeColorMode(userInfo.data?.data?.colorScheme);
    }
  }, [userInfo.data, changeColorMode]);

  function onSubmit(data) {
    if (isDirty) {
      if (
        isUsernameExists?.data?.exists !== false &&
        'username' in dirtyFields
      ) {
        notice({
          status: 'warning',
          description: 'Username already exists. Choose something different.',
          duration: SNACK_DURATION,
        });
        return;
      }
      patchUserInfo.mutate(
        Object.fromEntries(Object.entries(data).filter(([k]) => dirtyFields[k]))
      );
    } else {
      notice({
        status: 'info',
        description: 'No changes are made',
        duration: SNACK_DURATION,
      });
    }
  }

  const timeZones = useMemo(() => Intl.supportedValuesOf('timeZone'), []);

  const [validLocale, setValidLocale] = useState(true);

  const checkUsername = useMemo(() => debounce(mutate), []);

  useEffect(() => {
    if (watch('username') && isDirty) {
      checkUsername({ username: watch('username') });
    }
  }, [watch('username'), checkUsername]);

  return (
    <Container maxW={'min(80%, 1200px)'} minW={{ md: 'full' }} m={'auto'}>
      <Heading>Profile</Heading>
      <VStack as={'form'} onSubmit={handleSubmit(onSubmit)}>
        <FormControl
          label="Username"
          invalid={!!errors.username}
          errorMessage={errors.username ? errors.username.message : undefined}
        >
          <Controller
            name="username"
            control={control}
            render={({ field }) => {
              return (
                <InputGroup>
                  <Input {...field} placeholder="Username" />
                  <InputRightElement>
                    {checkingUsername ? (
                      <Loading />
                    ) : checkedUsername ? (
                      isUsernameExists?.data?.exists ? (
                        <XIcon color="red.500" />
                      ) : (
                        <CheckIcon color="green.500" />
                      )
                    ) : (
                      ''
                    )}
                  </InputRightElement>
                </InputGroup>
              );
            }}
          />
        </FormControl>
        <FormControl
          label="Color Scheme"
          invalid={!!errors.colorScheme}
          errorMessage={
            errors.colorScheme ? errors.colorScheme.message : undefined
          }
        >
          <Controller
            name="colorScheme"
            control={control}
            render={({ field }) => <Input {...field} hidden />}
          />
          <ColorSchemeButtonGroup
            setFormControlValue={setValue}
            internalColorMode={internalColorMode}
            changeColorMode={changeColorMode}
          />
        </FormControl>
        <Flex gap="4">
          <FormControl
            label="Locale"
            invalid={!!errors.locale}
            errorMessage={errors.locale ? errors.locale.message : undefined}
          >
            <InputGroup>
              <Controller
                name="locale"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onInput={(ev) => {
                      const inputLocale = ev.currentTarget.value;
                      if (inputLocale.length > 0) {
                        try {
                          Intl.getCanonicalLocales(inputLocale);
                          setValidLocale(true);
                        } catch {
                          setValidLocale(false);
                        }
                      } else {
                        setValidLocale(false);
                      }
                    }}
                    onBlur={() => {
                      field.onBlur();
                      if (!validLocale) {
                        resetField('locale');
                        setValidLocale(true);
                      }
                    }}
                  />
                )}
              />
              <InputRightElement>
                {validLocale ? (
                  <CheckIcon color="green.500" />
                ) : (
                  <XIcon color="red.500" />
                )}
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl
            label="Timezone"
            invalid={!!errors.timezone}
            errorMessage={errors.timezone ? errors.timezone.message : undefined}
          >
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <ReactSelect
                  {...field}
                  styles={
                    colorMode === 'dark' && {
                      control: (styles) => ({
                        ...styles,
                        backgroundColor: '#141414',
                        borderColor: '#434248',
                        ':hover': {
                          borderColor: '#4c4c4c',
                        },
                        ':focus-within:not(:hover)': {
                          borderColor: '#0070f0',
                        },
                        borderRadius: '0.375rem',
                      }),
                      input: (styles) => ({
                        ...styles,
                        padding: '2.6px',
                        color: 'white',
                      }),
                      menu: (styles) => ({
                        ...styles,
                        backgroundColor: 'ThreeDDarkShadow',
                      }),
                      option: (styles) => ({
                        ...styles,
                      }),
                      singleValue: (styles) => ({ ...styles, color: 'white' }),
                    }
                  }
                  theme={(theme) =>
                    colorMode === 'dark'
                      ? {
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: '#4c9aff',
                          },
                        }
                      : { ...theme }
                  }
                  options={timeZones.map((tz) => ({
                    label: tz,
                    value: tz,
                  }))}
                  filterOption={({ value }, input) => {
                    return fuzzyRegexMatch(input, value);
                  }}
                  noOptionsMessage={() => 'No Timezone found'}
                  value={{
                    label: field.value,
                    value: field.value,
                  }}
                  onChange={({ value }) => {
                    field.onChange(value);
                  }}
                />
              )}
            />
          </FormControl>
        </Flex>
        <Flex w={'full'} gap="4">
          <Button
            type="submit"
            flexGrow={1}
            colorScheme={'primary'}
            disabled={!isDirty}
          >
            Save
          </Button>
          <Button
            disabled={!isDirty}
            flexGrow={1}
            onClick={() => {
              reset();
              resetCheckUsername();
            }}
            variant={'outline'}
          >
            Rest
          </Button>
        </Flex>
      </VStack>
      <Heading size={'md'} as={'h2'}>
        Provider Information
      </Heading>
      <DataList size={'md'} col={2} w="full" variant={'grid'}>
        <DataListItem>
          <DataListTerm>Signed in using</DataListTerm>
          <DataListDescription>
            <Flex alignItems={'center'} gap="4">
              <AnilistIcon />
              <Text>
                {sentenceCase(userInfo.data?.data?.providerName ?? '')}
              </Text>
            </Flex>
          </DataListDescription>
        </DataListItem>
        <DataListItem>
          <DataListTerm>User ID</DataListTerm>
          <DataListDescription>
            <Text>
              {sentenceCase(userInfo.data?.data?.providerUserId ?? '')}
            </Text>
          </DataListDescription>
        </DataListItem>
        <DataListItem>
          <DataListTerm>Memeber since</DataListTerm>
          <DataListDescription>
            {Intl.DateTimeFormat(
              validLocale
                ? watch('locale').length < 2
                  ? undefined
                  : watch('locale')
                : defaultValues.locale.length < 2
                ? undefined
                : defaultValues.locale,
              {
                timeZone:
                  watch('timezone').length < 2 ? undefined : watch('timezone'),
                dateStyle: 'full',
                timeStyle: 'long',
              }
            ).format(Date.parse(userInfo.data?.data?.createdAt ?? 0))}
          </DataListDescription>
        </DataListItem>
      </DataList>
    </Container>
  );
}

function ColorSchemeButtonGroup({
  setFormControlValue,
  internalColorMode,
  changeColorMode,
}) {
  return (
    <ButtonGroup
      w="full"
      display={'grid'}
      gridTemplateColumns={{ sm: '1fr', base: '1fr 1fr 1fr' }}
      gap="2"
    >
      <Button
        type="button"
        disabled={internalColorMode === 'dark'}
        startIcon={<MoonIcon />}
        onClick={() => {
          changeColorMode('dark');
          setFormControlValue('colorScheme', 'dark', {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }}
      >
        Dark
      </Button>
      <Button
        type="button"
        disabled={internalColorMode === 'system'}
        startIcon={<ComputerIcon />}
        onClick={() => {
          changeColorMode('system');
          setFormControlValue('colorScheme', 'system', {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }}
      >
        System
      </Button>
      <Button
        type="button"
        disabled={internalColorMode === 'light'}
        startIcon={<SunIcon />}
        onClick={() => {
          changeColorMode('light');
          setFormControlValue('colorScheme', 'light', {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }}
      >
        Light
      </Button>
    </ButtonGroup>
  );
}
