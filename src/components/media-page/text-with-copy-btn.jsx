import { CopyCheckIcon, CopyIcon, CopyXIcon } from '@yamada-ui/lucide';
import { Flex, IconButton, Loading, Text } from '@yamada-ui/react';
import { useState } from 'react';

export default function TextWithCopyButton({
  textComponent,
  copyText,
  ...copyBtnOpts
}) {
  const STATES = {
    Copying: <Loading />,
    Copied: <CopyCheckIcon />,
    '!Copied': <CopyXIcon />,
    Copy: <CopyIcon />,
  };
  const [copyState, setCopyState] = useState('Copy');

  function handleCopy() {
    setCopyState('Copying');
    navigator.clipboard.writeText(copyText).then(
      () => {
        setCopyState('Copied');
        new Promise((resolve) => {
          setTimeout(() => {
            resolve();
            setCopyState('Copy');
          }, 3000);
        });
      },
      () => {
        setCopyState('!Copied');
        new Promise((resolve) => {
          setTimeout(() => {
            resolve();
            setCopyState('Copy');
          }, 3000);
        });
      }
    );
  }

  return (
    <Flex gap="2" align={'center'}>
      {textComponent ?? <Text>{copyText}</Text>}
      <IconButton
        disabled={copyState !== 'Copy'}
        icon={STATES[copyState]}
        onClick={handleCopy}
        {...copyBtnOpts}
      />
    </Flex>
  );
}
