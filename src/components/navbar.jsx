'use client';

import { useUserInfo } from '@/lib/client/hooks/react_query/get/user/info';
import { authStore } from '@/stores/auth-store';
import AppStorage from '@/utils/local-storage';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuSeparator,
  Snacks,
  Text,
  useColorModeValue,
  useSnacks,
  Link,
  Image,
  useMediaQuery,
} from '@yamada-ui/react';
import axios from 'axios';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function NavBar({}) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname.includes('/login')) {
    return;
  }

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
      snackRef.current = snack({
        status: 'warning',
        description: (
          <Flex gap="1" p="1" alignItems={'center'}>
            Go to{' '}
            <Link as={NextLink} href={'/profile'}>
              <Text>settings</Text>
            </Link>{' '}
            to set your locale and timezone.
          </Flex>
        ),
        isClosable: false,
        variant: 'solid',
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

  return (
    <>
      <Flex
        w="full"
        bgColor={bgColor}
        p="4"
        mb="4"
        alignItems={'center'}
        gap="2"
      >
        <Link as={NextLink} href="/" display={'initial'}>
          <Image src={'/animan-logo.png'} width={'12'} />
        </Link>
        {!isSmallScreen && <Text>AniMan</Text>}
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
            <Link as={NextLink} href={'/schedule'} textDecoration={'underline'}>
              Schedule
            </Link>
          )}
        </Flex>
        <Menu>
          <MenuButton as={Button} variant={'link'} h="full" ml="auto">
            <Avatar name={userData?.username} />
          </MenuButton>

          <MenuList>
            <Box px="3" py="2">
              User: {userData?.username}
            </Box>
            <MenuItem as={NextLink} href="/profile">
              Profile Settings
            </MenuItem>

            <MenuSeparator />

            <MenuItem onClick={() => handleLogout()}>Sign out</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      {pathname !== '/profile' && (
        <Box px={'4'}>
          <Snacks snacks={snacks} mb="4" />
        </Box>
      )}
    </>
  );

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
}
