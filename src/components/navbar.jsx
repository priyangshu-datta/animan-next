'use client';

import { useUserInfo } from '@/lib/client/hooks/react_query/get/user/info';
import { PUBLIC_PATH } from '@/lib/constants';
import { authStore } from '@/stores/auth-store';
import AppStorage from '@/utils/local-storage';
import {
  CalendarDaysIcon,
  ClockAlertIcon,
  LogOutIcon,
  NotebookIcon,
  SearchIcon,
  Settings2Icon,
  UserRoundIcon,
} from '@yamada-ui/lucide';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuSeparator,
  Snacks,
  Text,
  useColorModeValue,
  useMediaQuery,
  useSnacks,
} from '@yamada-ui/react';
import axios from 'axios';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function NavBar({}) {
  const pathname = usePathname();

  if (PUBLIC_PATH.includes(pathname)) {
    return <></>;
  }

  return <AuthenticatedNavBar />;
}

function AuthenticatedNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const bgColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');

  const { snack, snacks } = useSnacks();

  const userInfo = useUserInfo();

  const userData = userInfo?.data?.data;

  const snackRef = useRef(null);

  useEffect(() => {
    const locale = AppStorage.get('locale');
    const timezone = AppStorage.get('timezone');

    if (
      userData &&
      !(userData?.locale?.length > 0 && userData.timezone.length > 0)
    ) {
      if (snackRef.current) {
        snack.close(snackRef.current);
      }
      snackRef.current = snack({
        status: 'warning',
        component: () => <SnackBarComponent />,
        isClosable: false,
      });
    } else if (!(locale && timezone)) {
      if (userData?.locale?.length > 0 && userData?.timezone?.length > 0) {
        AppStorage.set('locale', userData?.locale);
        AppStorage.set('timezone', userData?.timezone);
      }
    } else {
      snack.closeAll();
    }
  }, [userData, pathname]);

  const [isSmallScreen] = useMediaQuery(['(width < 786px)']);
  function handleLogout() {
    axios
      .delete(`${window.location.origin}/api/auth/logout`, {
        headers: {
          Authorization: `Bearer ${authStore.getState().accessToken}`,
        },
      })
      .catch((error) => {
        if (error.status) {
          authStore.setState({ accessToken: null, userId: null });
          router.push(error.response.data.data.redirect);
        }
      });
  }
  return (
    <>
      <Flex w="full" bgColor={bgColor} p="4" alignItems={'center'} gap="2">
        <Link as={NextLink} href="/home" display={'initial'}>
          <Image src={'/animan-logo.png'} width={'12'} />
        </Link>
        {!isSmallScreen && <Text>AniMan</Text>}
        {!isSmallScreen && (
          <Flex ml="auto" gap="2">
            {pathname !== '/browse' && (
              <Link
                as={NextLink}
                href={'/browse'}
                ml="auto"
                textDecoration={'underline'}
              >
                Browse
              </Link>
            )}
            <Link as={NextLink} href={'/reviews'} textDecoration={'underline'}>
              My Reviews
            </Link>
            {pathname !== '/schedule' && (
              <Link
                as={NextLink}
                href={'/schedule'}
                textDecoration={'underline'}
              >
                Schedule
              </Link>
            )}
          </Flex>
        )}
        <Menu>
          <MenuButton as={Button} variant={'link'} h="full" ml="auto">
            <Avatar name={userData?.username} />
          </MenuButton>

          <MenuList>
            <Flex px="3" py="2" align="center" gap="3">
              <UserRoundIcon
                fontSize={'lg'}
                _dark={{ stroke: 'white' }}
                stroke={'black'}
              />{' '}
              <span>{userData?.username}</span>
            </Flex>

            {isSmallScreen && (
              <>
                <MenuItem
                  as={NextLink}
                  href="/browse"
                  icon={
                    <SearchIcon
                      fontSize={'lg'}
                      _dark={{ stroke: 'white' }}
                      stroke={'black'}
                    />
                  }
                >
                  Browse
                </MenuItem>

                <MenuItem
                  as={NextLink}
                  href="/reviews"
                  icon={
                    <NotebookIcon
                      fontSize={'lg'}
                      _dark={{ stroke: 'white' }}
                      stroke={'black'}
                    />
                  }
                >
                  My Reviews
                </MenuItem>

                <MenuItem
                  as={NextLink}
                  href="/schedule"
                  icon={
                    <CalendarDaysIcon
                      fontSize={'lg'}
                      _dark={{ stroke: 'white' }}
                      stroke={'black'}
                    />
                  }
                >
                  Schedule
                </MenuItem>
              </>
            )}

            <MenuItem
              as={NextLink}
              href="/profile"
              icon={
                <Settings2Icon
                  fontSize={'lg'}
                  _dark={{ stroke: 'white' }}
                  stroke={'black'}
                />
              }
            >
              Settings
            </MenuItem>

            <MenuSeparator />

            <MenuItem
              onClick={() => handleLogout()}
              icon={
                <LogOutIcon
                  fontSize={'lg'}
                  _dark={{ stroke: 'white' }}
                  stroke={'black'}
                />
              }
            >
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      {pathname !== '/profile' && <Snacks snacks={snacks} />}
    </>
  );
}

function SnackBarComponent() {
  return (
    <Box py="2" w="fit-content" m="auto">
      <Flex
        gap="1"
        py="0.5"
        alignItems={'center'}
        p="2"
        px="4"
        bgColor={'#F97415'}
        color="black"
        textShadow={'lg'}
        rounded={'md'}
        fontSize={'lg'}
      >
        <ClockAlertIcon />

        <Text>
          Go to{' '}
          <Link as={NextLink} href={'/profile'} color="white" textShadow={'lg'}>
            <Settings2Icon />
          </Link>{' '}
          to set your locale and timezone.
        </Text>
      </Flex>
    </Box>
  );
}
