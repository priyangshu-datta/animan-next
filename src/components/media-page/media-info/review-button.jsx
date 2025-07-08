import { useMedia } from '@/context/use-media';
import { REVIEW_CATEGORIES } from '@/lib/constants';
import { ChevronDownIcon } from '@yamada-ui/lucide';
import {
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@yamada-ui/react';

export default function ReviewButtonGroup({
  onReviewEditorOpen,
  setCurrentReviewMetadata,
  disabled,
}) {
  const media = useMedia();
  return (
    <ButtonGroup attached variant="outline">
      <Button
        disabled={disabled}
        onClick={() => {
          setCurrentReviewMetadata({
            subjectType: media.type === 'ANIME' ? 'episode' : 'chapter',
          });
          onReviewEditorOpen();
        }}
        size="sm"
      >
        Review
      </Button>

      <Menu>
        <MenuButton
          as={IconButton}
          icon={<ChevronDownIcon />}
          disabled={disabled}
          size="sm"
        />

        <MenuList>
          {REVIEW_CATEGORIES[media.type.toLowerCase()].map((item) => (
            <MenuItem
              key={item.value}
              onClick={() => {
                setCurrentReviewMetadata({
                  subjectType: item.value,
                });
                onReviewEditorOpen();
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </ButtonGroup>
  );
}
