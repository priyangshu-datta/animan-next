import Spoiler from '@/components/spoiler'
import { Trash2Icon } from '@yamada-ui/lucide'
import {
  Card,
  CardBody,
  Flex,
  Grid,
  IconButton,
  Text,
  VStack
} from '@yamada-ui/react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function DraftPanel({ drafts, setDrafts, changeTab }) {
  const { setValue: setFormValue } = useFormContext();
  if (drafts.length < 1) {
    return 'No Drafts';
  }

  drafts = drafts.sort(([_1, a], [_2, b]) => b.lastUpdated - a.lastUpdated);

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
    const { lastUpdated, ...draftObj } = draft;
    for (const [key, value] of Object.entries(draftObj)) {
      setFormValue(key, value, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
    }
  } catch (err) {
    console.warn(err);
  }
}
