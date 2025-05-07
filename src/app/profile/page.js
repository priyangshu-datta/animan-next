'use client';

import { initiateAuthPopupFlow } from '@/lib/client/auth/auth-flow-async';
import usePatchUserInfo from '@/lib/client/hooks/react_query/user/use-patch-user-info';
import usePatchUserLinkedAccounts from '@/lib/client/hooks/react_query/user/use-patch-user-linked-accounts';
import useUserInfo from '@/lib/client/hooks/react_query/user/use-user-info';
import useLinkedAccounts from '@/lib/client/hooks/react_query/user/use-user-linked-accounts';
import { sentenceCase } from '@/lib/client/utils';
import { authStore } from '@/stores/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import {
  ComputerIcon,
  Link2Icon,
  Link2OffIcon,
  MoonIcon,
  RefreshCwIcon,
  RefreshCwOffIcon,
  SunIcon,
} from '@yamada-ui/lucide';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Container,
  DataList,
  DataListDescription,
  DataListItem,
  DataListTerm,
  Flex,
  FormControl,
  Grid,
  Heading,
  Input,
  Text,
  Toggle,
  useColorMode,
  VStack,
} from '@yamada-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function ProfilePage() {
  const userInfo = useUserInfo();
  const linkedAccounts = useLinkedAccounts();
  const [oauthAccounts, setOauthAccounts] = useState([]);

  const {
    control,
    reset,
    formState: { errors, isDirty, dirtyFields },
    handleSubmit,
  } = useForm();

  useEffect(() => {
    if (userInfo.isSuccess && linkedAccounts.isSuccess) {
      setOauthAccounts(Object.keys(linkedAccounts.data.data.oauthAccounts));
      reset({
        username: userInfo.data.data.username,
        ...Object.fromEntries(
          Object.entries(linkedAccounts.data.data.oauthAccounts).map(
            ([provider, oauthAccount]) => [
              `sync${sentenceCase(provider)}`,
              oauthAccount.sync,
            ]
          )
        ),
        ...Object.fromEntries(
          Object.entries(linkedAccounts.data.data.oauthAccounts).map(
            ([provider]) => [`unlink${sentenceCase(provider)}`, false]
          )
        ),
      });
    }
  }, [userInfo.data, linkedAccounts.data]);

  const { internalColorMode, changeColorMode } = useColorMode();

  const patchUserInfo = usePatchUserInfo();
  const patchUserLinkedAccounts = usePatchUserLinkedAccounts();

  function onSubmit(data) {
    if ('username' in dirtyFields) {
      const userInformationData = {
        username: data.username,
      };
      patchUserInfo.mutate(userInformationData);
    }
    const unlink = Object.entries(data)
      .filter(([key, value]) => key.startsWith('unlink') && value)
      .map(([k]) => k.replace('unlink', '').toLowerCase());
    const sync = Object.entries(data)
      .filter(
        ([key, value]) => !(key in unlink) && key.startsWith('sync') && value
      )
      .map(([k]) => k.replace('sync', '').toLowerCase());
    const userLinkedAccountsInfo = {
      ...(unlink.length && { unlink }),
      ...(sync.length && { sync }),
    };
    console.log({ userLinkedAccountsInfo });
    if (Object.entries(userLinkedAccountsInfo).length) {
      patchUserLinkedAccounts.mutate(userLinkedAccountsInfo);
    }
  }

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
            defaultValue={userInfo.isLoading && 'Loading'}
            disabled={userInfo.isPending}
            render={({ field }) => {
              return <Input {...field} placeholder="Username" />;
            }}
          />
        </FormControl>
        <FormControl label="Color Scheme">
          <ColorSchemeButtonGroup
            internalColorMode={internalColorMode}
            changeColorMode={changeColorMode}
          />
        </FormControl>
        {linkedAccounts.data && (
          <OAuthCards
            oauthAccounts={oauthAccounts}
            setOauthAccounts={setOauthAccounts}
            control={control}
            errors={errors}
            linkedAccounts={linkedAccounts}
          />
        )}
        <Grid gridTemplateColumns={{ sm: '1fr', base: '1fr 1fr' }} gap="2">
          <Button
            onClick={() => {
              setOauthAccounts(
                Object.keys(linkedAccounts.data.data.oauthAccounts)
              );
              reset({
                username: userInfo.data.data.username,
                ...Object.fromEntries(
                  Object.entries(linkedAccounts.data.data.oauthAccounts).map(
                    ([provider, oauthAccount]) => [
                      `sync${sentenceCase(provider)}`,
                      oauthAccount.sync,
                    ]
                  )
                ),
                ...Object.fromEntries(
                  Object.entries(linkedAccounts.data.data.oauthAccounts).map(
                    ([provider]) => [`unlink${sentenceCase(provider)}`, false]
                  )
                ),
              });
            }}
          >
            Clear
          </Button>
          <Button colorScheme={'primary'} type="submit" disabled={!isDirty}>
            Save
          </Button>
        </Grid>
      </VStack>
    </Container>
  );
}

function OAuthCards({
  oauthAccounts,
  setOauthAccounts,
  control,
  errors,
  linkedAccounts,
}) {
  return (
    <Grid gridTemplateColumns={{ md: '1fr', base: '1fr 1fr 1fr' }} gap={'2'}>
      <OAuthCard
        oauthAccounts={oauthAccounts}
        setOauthAccounts={setOauthAccounts}
        control={control}
        errors={errors}
        provider={'anilist'}
        providerUserId={
          linkedAccounts.data.data.oauthAccounts?.anilist?.providerUserId
        }
      />
      <OAuthCard
        oauthAccounts={oauthAccounts}
        setOauthAccounts={setOauthAccounts}
        control={control}
        errors={errors}
        provider={'mal'}
        providerUserId={
          linkedAccounts.data.data.oauthAccounts?.mal?.providerUserId
        }
      />
      <OAuthCard
        oauthAccounts={oauthAccounts}
        setOauthAccounts={setOauthAccounts}
        control={control}
        errors={errors}
        provider={'kitsu'}
        providerUserId={
          linkedAccounts.data.data.oauthAccounts?.kitsu?.providerUserId
        }
      />
    </Grid>
  );
}

function ColorSchemeButtonGroup({ internalColorMode, changeColorMode }) {
  return (
    <ButtonGroup
      w="full"
      display={'grid'}
      gridTemplateColumns={{ sm: '1fr', base: '1fr 1fr 1fr' }}
      gap="2"
    >
      <Button
        disabled={internalColorMode === 'dark'}
        startIcon={<MoonIcon />}
        onClick={() => changeColorMode('dark')}
      >
        Dark
      </Button>
      <Button
        disabled={internalColorMode === 'system'}
        startIcon={<ComputerIcon />}
        onClick={() => changeColorMode('system')}
      >
        System
      </Button>
      <Button
        disabled={internalColorMode === 'light'}
        startIcon={<SunIcon />}
        onClick={() => changeColorMode('light')}
      >
        Light
      </Button>
    </ButtonGroup>
  );
}

function OAuthCard({
  provider,
  providerUserId,
  control,
  errors,
  oauthAccounts,
  setOauthAccounts,
}) {
  const queryClient = useQueryClient();

  return (
    <Card variant={'outline'} h={'full'}>
      <CardHeader>
        <Flex justifyContent={'space-between'} alignItems={'center'} w="full">
          <Text fontSize={'lg'}>{sentenceCase(provider)}</Text>

          {providerUserId ? (
            <Controller
              name={`unlink${sentenceCase(provider)}`}
              control={control}
              render={({ field }) => {
                return (
                  <Toggle
                    {...field}
                    onChange={(selected) => field.onChange(selected)}
                    selected={field.value}
                    icon={
                      field.value ? (
                        <Link2OffIcon color={'orange'} />
                      ) : (
                        <Link2OffIcon color={'red'} />
                      )
                    }
                    variant={'unstyled'}
                    minW={0}
                    minH={0}
                    m={0}
                    p={0}
                    disabled={
                      oauthAccounts.length <= 1 &&
                      oauthAccounts.includes(provider)
                    }
                    onClick={() => {
                      if (oauthAccounts.includes(provider)) {
                        setOauthAccounts((prev) =>
                          prev.filter((account) => account !== provider)
                        );
                      } else {
                        setOauthAccounts((prev) => [...prev, provider]);
                      }
                    }}
                  />
                );
              }}
            />
          ) : (
            <Button
              // disabled={!providerUserId}
              variant={'link'}
              onClick={() => {
                axios
                  .post('/api/auth/link-oauth', null, {
                    headers: {
                      Authorization: `Bearer ${
                        authStore.getState().accessToken
                      }`,
                    },
                  })
                  .then(() => {
                    initiateAuthPopupFlow(provider).then((data) => {
                      if ('mal' in data) {
                        queryClient.invalidateQueries([
                          'me',
                          'linked-accounts',
                        ]);
                        setOauthAccounts((count) => count + 1);
                      }
                    });
                  });
              }}
            >
              <Link2Icon />
            </Button>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        {providerUserId && (
          <DataList gap="1" fontSize={'md'} col={2} w={'full'}>
            <DataListItem>
              <DataListTerm>UserID</DataListTerm>
              <DataListDescription>{providerUserId}</DataListDescription>
            </DataListItem>
            <DataListItem>
              <DataListTerm>Sync</DataListTerm>
              <DataListDescription>
                <FormControl
                  invalid={!!errors[`sync${sentenceCase(provider)}`]}
                  errorMessage={
                    errors[`sync${sentenceCase(provider)}`]
                      ? errors[`sync${sentenceCase(provider)}`].message
                      : undefined
                  }
                >
                  <Controller
                    name={`sync${sentenceCase(provider)}`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Toggle
                          {...field}
                          onChange={(selected) => field.onChange(selected)}
                          selected={field.value}
                          icon={
                            field.value ? (
                              <RefreshCwIcon color={'green.400'} />
                            ) : (
                              <RefreshCwOffIcon color={'red.400'} />
                            )
                          }
                          variant={'unstyled'}
                          minW={0}
                          minH={0}
                          m={0}
                          p={0}
                        />
                      );
                    }}
                  />
                </FormControl>
              </DataListDescription>
            </DataListItem>
          </DataList>
        )}
      </CardBody>
    </Card>
  );
}
