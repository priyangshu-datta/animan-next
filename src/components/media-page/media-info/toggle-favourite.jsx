import { useMedia } from "@/context/use-media"
import { useOptimisticToggleMediaFavourite } from "@/lib/client/hooks/react_query/patch/user/media/toggle-favourite"
import { HeartIcon } from "@yamada-ui/lucide"
import { Loading, Toggle } from "@yamada-ui/react"

export default function MediaToggleFavourite() {
  const media = useMedia();
  const { mediaIsFavourite, toggleMediaFavourite, togglingMediaFavourite } =
    useOptimisticToggleMediaFavourite({
      mediaIsFavourite: media.isFavourite,
    });
  return (
    <Toggle
      borderRadius={'full'}
      value="favourite"
      selected={mediaIsFavourite}
      colorScheme="red"
      variant={'solid'}
      disabled={togglingMediaFavourite}
      icon={togglingMediaFavourite ? <Loading /> : <HeartIcon />}
      onChange={() => {
        toggleMediaFavourite({
          mediaId: media.id,
          mediaType: media.type,
        });
      }}
    />
  );
}
