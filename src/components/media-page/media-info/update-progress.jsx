import { useMedia } from '@/context/use-media';
import { PlusIcon } from '@yamada-ui/lucide';
import { IconButton, Loading } from '@yamada-ui/react';

export default function UpdateMediaProgress({ isPending, mutate }) {
  const media = useMedia();

  return (
    <IconButton
      variant={'outline'}
      icon={isPending ? <Loading /> : <PlusIcon />}
      onClick={() => {
        mutate({
          mediaId: media.id,
          mediaType: media.type,
          progress: media.entry?.progress + 1,
        });
      }}
      disabled={isPending}
    />
  );
}
