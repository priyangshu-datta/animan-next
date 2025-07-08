import { useMedia } from '@/context/use-media';
import { MEDIA_ENTRY_STATUS } from '@/lib/constants';

export default function MediaEntryStatus() {
  const media = useMedia();

  return (
    <p>
      You{' '}
      {['PAUSED', 'DROPPED', 'COMPLETED'].includes(media.entry.status)
        ? 'have'
        : 'are'}{' '}
      <em>
        {MEDIA_ENTRY_STATUS[media.type.toLowerCase()]
          .find((mes) => mes.value === media.entry.status)
          .label.toLowerCase()}
      </em>
    </p>
  );
}
