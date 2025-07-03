import { useMedia } from '@/context/use-media';
import { useUserMedia } from '@/lib/client/hooks/react_query/get/user/media';
import { useUserCustomLists } from '@/lib/client/hooks/react_query/get/user/media/custom-lists';
import { useUpdateUserMedia } from '@/lib/client/hooks/react_query/patch/user/media';
import { useNotice, useSnacks } from '@yamada-ui/react';
import { useForm } from 'react-hook-form';
import { setDefaultFormValues } from './utility';
import { useEffect, useState } from 'react';
import { useDeleteUserMedia } from '@/lib/client/hooks/react_query/delete/user/media';
import { useToggleMediaFavourite } from '@/lib/client/hooks/react_query/patch/user/media/toggle-favourite';
import { SNACK_DURATION } from '@/lib/constants';

export function useEntryEditor({ onEntryEditorClose }) {
  const media = useMedia();

  const mediaEntry = useUserMedia({
    mediaId: media.id,
    mediaType: media.type,
  });

  const { snack, snacks } = useSnacks();

  const notice = useNotice();
  const updateMediaEntry = useUpdateUserMedia({
    handleError: (error) => {
      snack({
        description: error.message,
        status: 'error',
        duration: SNACK_DURATION,
      });
    },
    handleSuccess: () => {
      notice({
        description: `${
          mediaEntry?.data?.data?.Media?.mediaListEntry ? 'Updated' : 'Added'
        } the entry.`,
        status: 'success',
        duration: SNACK_DURATION,
        isClosable: true,
      });

      onEntryEditorClose();
    },
  });

  const toggleFavourite = useToggleMediaFavourite({
    handleError: (error) => {
      snack({
        description: error.message,
        status: 'error',
        duration: SNACK_DURATION,
      });
    },
    handleSuccess: () => {
      notice({
        description: `Toggled favourite.`,
        status: 'success',
        duration: SNACK_DURATION,
        isClosable: true,
      });
    },
  });

  const userCustomLists = useUserCustomLists({ mediaType: media.type });

  const methods = useForm({
    defaultValues: setDefaultFormValues(mediaEntry, userCustomLists),
    criteriaMode: 'all',
    mode: 'all',
  });

  useEffect(() => {
    const defaultValues = setDefaultFormValues(mediaEntry, userCustomLists);
    methods.reset(defaultValues);
  }, [mediaEntry?.data]);

  const [customLists, setCustomLists] = useState([]);

  useEffect(() => {
    setCustomLists(userCustomLists?.data?.data?.customLists);
  }, [userCustomLists?.data]);

  const deleteEntry = useDeleteUserMedia({
    mediaId: media.id,
    mediaType: media.type,
    handleError: (error) => {
      snack({
        status: 'error',
        description: error.message,
        duration: SNACK_DURATION,
        title: error.name,
      });
    },
    handleSuccess: () => {
      notice({
        status: 'success',
        description: 'Media Entry deleted',
        isClosable: true,
      });
      onEntryEditorClose();
    },
  });

  return {
    snack,
    snacks,
    updateMediaEntry,
    toggleFavourite,
    mediaEntry,
    formMethods: methods,
    customLists,
    deleteEntry,
  };
}
