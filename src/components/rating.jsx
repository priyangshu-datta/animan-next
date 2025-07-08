import AppStorage from '@/utils/local-storage';
import { Rating as YamadaRating, Tooltip } from '@yamada-ui/react';
import { useEffect } from 'react';

export default function Rating({
  score,
  stars = 5,
  maxScore = 10,
  label = '',
}) {
  const normalizedScore = (stars * score) / maxScore;
  let locale;
  useEffect(() => {
    locale = AppStorage.get('locale');
  }, []);
  return (
    <Tooltip
      label={`${label}${new Intl.NumberFormat(locale, {
        style: 'percent',
      }).format(normalizedScore / stars)}`}
    >
      <YamadaRating
        readOnly
        value={normalizedScore}
        fractions={maxScore}
        items={stars}
      />
    </Tooltip>
  );
}
