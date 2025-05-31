'use client';

import { useUserInfo } from '@/lib/client/hooks/react_query/get/user/info';
import { useUpdateUserInfo } from '@/lib/client/hooks/react_query/patch/user/info';

import AnilistIcon from '@/components/icons/anilist';
import { useCheckUsername } from '@/lib/client/hooks/react_query/get/user/check-username';
import { SNACK_DURATION, TIMEZONES } from '@/lib/constants';
import { debounce, fuzzyRegexMatch, sentenceCase } from '@/utils/general';
import {
  CheckIcon,
  ComputerIcon,
  MoonIcon,
  SunIcon,
  XIcon,
} from '@yamada-ui/lucide';
import {
  Box,
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
  useAnimation,
  useColorMode,
  useColorModeValue,
  useNotice,
  VStack,
} from '@yamada-ui/react';
import { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';
import ReactSelect from 'react-select';
import AppStorage from '@/utils/local-storage';

/*

  saving things temporarily, indicator for unsaved changes

*/

export default function ProfilePage() {
  const userInfo = useUserInfo();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userInfo.data) {
      setIsLoading(false);
    }
  }, [userInfo.data]);

  const methods = useForm({
    defaultValues: {
      username: '',
      locale: '',
      timezone: '',
      colorScheme: '',
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
    handleSuccess: () => {
      notice({
        status: 'success',
        description: 'Updated successfully',
        duration: SNACK_DURATION,
      });
      AppStorage.get('locale', methods.watch('locale'));
      AppStorage.get('timezone', methods.watch('timezone'));

      methods.reset({ ...methods.watch() });
      resetCheckUsername();
    },
  });

  const { internalColorMode, changeColorMode } = useColorMode();

  useEffect(() => {
    if (userInfo.data?.data?.colorScheme) {
      methods.reset({
        username: userInfo.data?.data?.username,
        locale: userInfo.data?.data?.locale ?? '',
        timezone: userInfo.data?.data?.timezone ?? '',
        colorScheme: userInfo.data?.data?.colorScheme,
      });
    }
    methods.setValue('colorScheme', internalColorMode, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [userInfo.data, changeColorMode]);

  function onSubmit(data) {
    if (methods.formState.isDirty) {
      if (
        isUsernameExists?.data?.exists !== false &&
        'username' in methods.formState.dirtyFields
      ) {
        notice({
          status: 'warning',
          description: 'Username already exists. Choose something different.',
          duration: SNACK_DURATION,
        });
        return;
      }
      patchUserInfo.mutate(
        Object.fromEntries(
          Object.entries(data).filter(([k]) => methods.formState.dirtyFields[k])
        )
      );
    } else {
      notice({
        status: 'info',
        description: 'No changes are made',
        duration: SNACK_DURATION,
      });
    }
  }
  const [validLocale, setValidLocale] = useState(true);

  const checkUsername = useMemo(() => debounce(mutate), []);

  useEffect(() => {
    if ('username' in methods.formState.dirtyFields) {
      checkUsername({ username: methods.watch('username') });
    } else {
      resetCheckUsername();
    }
  }, [methods.watch('username'), checkUsername]);

  const animation = useAnimation({
    keyframes: {
      '0%': {
        opacity: 0.2 /* Fully visible */,
      },
      '50%': {
        opacity: 1 /* Fully transparent */,
      },
      '100%': {
        opacity: 0.2 /* Fully visible again, completes one cycle */,
      },
    },
    iterationCount: 'infinite',
    duration: '1.4s',
  });

  return (
    <Container maxW={'min(80%, 1200px)'} minW={{ md: 'full' }} m={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Heading>Profile</Heading>
        {isLoading && (
          <Flex>
            <Text>Fetching from Server</Text>
            <Text animation={animation} animationDelay={'0s'}>
              .
            </Text>
            <Text animation={animation} animationDelay={'0.43s'}>
              .
            </Text>
            <Text animation={animation} animationDelay={'0.93s'}>
              .
            </Text>
          </Flex>
        )}
      </Flex>
      <FormProvider {...methods}>
        <VStack as={'form'} onSubmit={methods.handleSubmit(onSubmit)}>
          <Username
            checkedUsername={checkedUsername}
            checkingUsername={checkingUsername}
            isUsernameExists={isUsernameExists}
            isLoading={isLoading}
          />

          <ColorScheme isLoading={isLoading} />

          <Flex gap="4">
            <LocaleSelector
              setValidLocale={setValidLocale}
              validLocale={validLocale}
              isLoading={isLoading}
            />

            <TimezoneSelector isLoading={isLoading} />
          </Flex>

          <FormButtons
            resetCheckUsername={resetCheckUsername}
            isLoading={isLoading}
          />
        </VStack>
        <UserDetails
          userInfo={userInfo}
          validLocale={validLocale}
          isLoading={isLoading}
        />
      </FormProvider>
    </Container>
  );
}

function ColorSchemeButtonGroup({ setFormControlValue, isLoading }) {
  const { internalColorMode, changeColorMode } = useColorMode();
  return (
    <ButtonGroup
      w="full"
      display={'grid'}
      gridTemplateColumns={{ sm: '1fr', base: '1fr 1fr 1fr' }}
      gap="2"
    >
      <Button
        type="button"
        disabled={internalColorMode === 'dark' || isLoading}
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
        disabled={internalColorMode === 'system' || isLoading}
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
        disabled={internalColorMode === 'light' || isLoading}
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

function UserDetails({ userInfo, validLocale, isLoading }) {
  const {
    formState: { defaultValues },
    watch,
  } = useFormContext();

  const loadingBg = useColorModeValue(
    {
      backgroundColor: 'rgba(243, 243, 243, 0.8)', // Light grey, slightly opaque
      backdropFilter: 'blur(2px) saturate(0.9) brightness(1.05)',
      backgroundImage:
        'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.02))',
    },
    {
      backgroundColor: 'rgba(29, 29, 29, 0.8)', // Dark grey, slightly opaque
      backdropFilter: 'blur(12px) saturate(1.2) brightness(0.85)',
      backgroundImage:
        'linear-gradient(to bottom right, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.05))',
    }
  );

  return (
    <>
      <Heading size={'md'} as={'h2'}>
        Provider Information
      </Heading>
      {isLoading ? (
        <Box position="relative">
          <Flex
            position={'absolute'}
            w="full"
            h="full"
            {...loadingBg}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Loading fontSize={'5xl'} />
          </Flex>
          <DataList size={'md'} col={2} w="full" variant={'grid'}>
            <DataListItem>
              <DataListTerm>Signed in using</DataListTerm>
              <DataListDescription>
                <Flex alignItems={'center'} gap="4">
                  <Text></Text>
                </Flex>
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>User ID</DataListTerm>
              <DataListDescription>
                <Text></Text>
              </DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>Member since</DataListTerm>
              <DataListDescription></DataListDescription>
            </DataListItem>
          </DataList>
        </Box>
      ) : (
        <DataList size={'md'} col={2} w="full" variant={'grid'}>
          <DataListItem>
            <DataListTerm>Signed in using</DataListTerm>
            <DataListDescription>
              <Flex alignItems={'center'} gap="4">
                {userInfo.data?.data?.providerName === 'anilist' && (
                  <AnilistIcon />
                )}
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
            <DataListTerm>Member since</DataListTerm>
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
                    watch('timezone').length < 2
                      ? undefined
                      : watch('timezone'),
                  dateStyle: 'full',
                  timeStyle: 'long',
                }
              ).format(Date.parse(userInfo.data?.data?.createdAt ?? 0))}
            </DataListDescription>
          </DataListItem>
        </DataList>
      )}
    </>
  );
}

function FormButtons({ isLoading, resetCheckUsername }) {
  const {
    formState: { isDirty },
    reset,
  } = useFormContext();
  return (
    <Flex w={'full'} gap="4">
      <Button
        type="submit"
        flexGrow={1}
        colorScheme={'primary'}
        disabled={!isDirty || isLoading}
      >
        Save
      </Button>
      <Button
        disabled={!isDirty || isLoading}
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
  );
}

function Username({
  isLoading,
  checkedUsername,
  checkingUsername,
  isUsernameExists,
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
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
              <Input {...field} placeholder="Username" disabled={isLoading} />
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
  );
}

function ColorScheme({ isLoading }) {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext();
  const { changeColorMode, internalColorMode } = useColorMode();
  return (
    <FormControl
      label="Color Scheme"
      invalid={!!errors.colorScheme}
      errorMessage={errors.colorScheme ? errors.colorScheme.message : undefined}
    >
      <Controller
        name="colorScheme"
        control={control}
        render={({ field }) => <Input {...field} hidden disabled={isLoading} />}
      />
      <ColorSchemeButtonGroup
        isLoading={isLoading}
        setFormControlValue={setValue}
        internalColorMode={internalColorMode}
        changeColorMode={changeColorMode}
      />
    </FormControl>
  );
}

function LocaleSelector({ isLoading, setValidLocale, validLocale }) {
  const {
    control,
    formState: { errors },
    resetField,
  } = useFormContext();
  return (
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
              disabled={isLoading}
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
          {isLoading ? (
            <Loading />
          ) : validLocale ? (
            <CheckIcon color="green.500" />
          ) : (
            <XIcon color="red.500" />
          )}
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
}

function TimezoneSelector({ isLoading }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { colorMode } = useColorMode();

  // const timezones = useMemo(() => Intl.supportedValuesOf('timeZone'), []);

  return (
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
            isDisabled={isLoading}
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
            options={TIMEZONES.map((tz) => ({
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
  );
}
