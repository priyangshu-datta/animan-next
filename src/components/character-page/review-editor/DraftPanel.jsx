import Spoiler from '@/components/spoiler'
import { useMediaBasicDetailsByIds } from '@/lib/client/hooks/react_query/get/media/info/basic/by-ids'
import { assocMedia } from '@/stores/assoc-media'
import { Trash2Icon } from '@yamada-ui/lucide'
import {
  Box,
  Card,
  CardBody,
  Flex,
  Grid,
  IconButton,
  Image,
  Skeleton,
  Text,
  VStack,
} from '@yamada-ui/react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function DraftPanel({ drafts, setDrafts, changeTab }) {
  const { setValue: setFormValue } = useFormContext();
  if (drafts.length < 1) {
    return 'No Drafts';
  }

  const basicAnimeDetails = useMediaBasicDetailsByIds({
    mediaIds: drafts
      .filter(
        ([_, draft]) =>
          !!draft.associatedMediaId && draft.associatedMediaType === 'ANIME'
      )
      .map(([_, draft]) => draft.associatedMediaId),
    mediaType: 'ANIME',
  });

  const basicMangaDetails = useMediaBasicDetailsByIds({
    mediaIds: drafts
      .filter(
        ([_, draft]) =>
          !!draft.associatedMediaId && draft.associatedMediaType === 'MANGA'
      )
      .map(([_, draft]) => draft.associatedMediaId),
    mediaType: 'MANGA',
  });

  const allMedia = [
    ...(basicAnimeDetails.data?.data ?? []),
    ...(basicMangaDetails.data?.data ?? []),
  ];

  drafts = drafts
    .map(([key, draft]) => {
      return [
        key,
        {
          ...draft,
          ...(draft.associatedMediaId && {
            media: allMedia.find((m) => m.id === draft.associatedMediaId),
          }),
        },
      ];
    })
    .sort(([_1, a], [_2, b]) => b.lastUpdated - a.lastUpdated);

  const [workingDraft, setWorkingDraft] = useState(null);

  return (
    <Grid gap={'2'}>
      {drafts.map(([key, draft]) => (
        <Card
          key={key}
          onClick={() => {
            setWorkingDraft(key);
            draftClickHandler(draft, setFormValue);
            changeTab(1);
          }}
          variant={workingDraft === key ? 'solid' : 'elevated'}
        >
          <CardBody>
            <Flex gap={'3'} align={'start'} w={'full'}>
              {draft.associatedMediaId ? (
                draft.media ? (
                  <Box justifyContent="center" aspectRatio={2 / 3} w={'24'}>
                    <Image
                      src={draft.media.coverImage.extraLarge}
                      objectFit="cover"
                      w={'full'}
                      h={'full'}
                    />
                  </Box>
                ) : (
                  <Skeleton>
                    <Box justifyContent="center" aspectRatio={2 / 3} w={'24'}>
                      <Image objectFit="cover" w={'full'} h={'full'} />
                    </Box>
                  </Skeleton>
                )
              ) : (
                ''
              )}
              <VStack gap={'2'}>
                {draft.media && (
                  <Text fontSize={'lg'}>{draft.media.title.userPreferred}</Text>
                )}
                <VStack gap={'1'}>
                  <Spoiler text={`Review: ${draft.review}`} />
                  <Text fontSize={'md'}>Rating: {draft.rating}</Text>
                </VStack>
                <Text fontSize={'sm'}>
                  Last updated:{' '}
                  {draft.lastUpdated &&
                    new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'full',
                      timeStyle: 'long',
                      timeZone:
                        Intl.DateTimeFormat().resolvedOptions().timeZone,
                    }).format(new Date(draft.lastUpdated))}
                </Text>
              </VStack>
              <IconButton
                icon={<Trash2Icon />}
                variant={'ghost'}
                colorScheme={'red'}
                onClick={(ev) => {
                  ev.stopPropagation();
                  localStorage.removeItem(key);
                  setDrafts((prev) => prev.filter(([k, v]) => k != key));
                }}
              />
            </Flex>
          </CardBody>
        </Card>
      ))}
    </Grid>
  );
}

function draftClickHandler(draft, setFormValue) {
  try {
    const { media, lastUpdated, ...draftObj } = draft;
    for (const [key, value] of Object.entries(draftObj)) {
      setFormValue(key, value, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
    }
    if (media) {
      assocMedia.setState({
        id: media.id,
        role: draft.role,
        type: media.type,
        coverImage: media.coverImage.extraLarge,
        title: media.title.userPreferred,
      });
    } else {
      assocMedia.getState().reset();
    }
  } catch (err) {
    console.warn(err);
  }
}
