import { useEffect, useState } from 'react';
import { useBaseMutation } from './base/use-base-mutation';
import { useNotice } from '@yamada-ui/react';
import { useQueryClient } from '@tanstack/react-query';

const TOGGLE_FAVOURITE_QUERY = (_strings, subjectTypeExp) => {
  const subjectType =
    subjectTypeExp + (subjectTypeExp === 'character' ? 's' : '');

  return `mutation ToggleFavourite($subjectId: Int) {
  ToggleFavourite(${subjectTypeExp}Id: $subjectId) {
    ${subjectType} {
      nodes {
        id
      }
    }
  }
}
`;
};

export function useToggleFavourite({ subjectType, isFavourite: _isFavourite }) {
  const queryClient = useQueryClient();

  const toggleFavourite = useBaseMutation({
    query: TOGGLE_FAVOURITE_QUERY`${subjectType.toLowerCase()}`,
    onSuccess: (_data, variables) => {
      if (subjectType !== 'character') {
        queryClient.invalidateQueries({
          key: ['mediaListEntry', variables.subjectId],
        });
      }
    },
  });

  const [isFavourite, setIsFavourite] = useState(_isFavourite);

  const notice = useNotice();

  useEffect(() => {
    if (toggleFavourite.isSuccess) {
      console.log(toggleFavourite.data);
      setIsFavourite((prev) => !prev);
      notice({
        title: 'Success',
        description: `${!_isFavourite ? 'F' : 'Unf'}avourited!`,
        status: 'success',
      });
    }

    if (toggleFavourite.isError) {
      notice({
        title: 'Error',
        description: toggleFavourite.error.message,
        status: 'error',
      });
    }
  }, [
    toggleFavourite.isSuccess,
    toggleFavourite.isError,
    toggleFavourite.error,
    notice,
  ]);

  return {
    isFavourite,
    toggleFavourite: toggleFavourite.mutate,
    togglingFavourite: toggleFavourite.isPending,
  };
}

const UPDATE_MEDIA_PROGRESS_QUERY = `mutation UpdateMediaListEntry($mediaId: Int, $progress: Int) {
  SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
    id
  }
}
`;

export function useUpdateMediaProgress({ progress: listEntryProgress }) {
  const queryClient = useQueryClient();
  const updateMediaProgress = useBaseMutation({
    query: UPDATE_MEDIA_PROGRESS_QUERY,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        key: ['mediaListEntry', variables.mediaId],
      });
    },
  });

  const [progress, setProgress] = useState(listEntryProgress);

  const notice = useNotice();

  useEffect(() => {
    setProgress(listEntryProgress);
  }, [listEntryProgress]);

  useEffect(() => {
    if (updateMediaProgress.isSuccess) {
      notice({
        title: 'Update',
        description: `Progress updated: +1`,
        status: 'success',
      });
      setProgress((progress) => progress + 1);
    }

    if (updateMediaProgress.isError) {
      notice({
        title: 'Error',
        description: updateMediaProgress.error.message,
        status: 'error',
      });
    }
  }, [
    updateMediaProgress.isError,
    updateMediaProgress.isSuccess,
    updateMediaProgress.error,
    notice,
  ]);

  return {
    progress,
    updateMediaProgress: updateMediaProgress.mutate,
    updatingMediaProgress: updateMediaProgress.isPending,
  };
}
