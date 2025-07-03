import { Flex, Separator } from "@yamada-ui/react"

export function computeProgressString(progress, total, latest) {
  if (latest) {
    return (
      <Flex gap={'2'}>
        {progress}
        <Separator h="5.5" orientation="vertical" variant={'solid'} />
        {latest}
        {total && (
          <>
            <Separator h="5.5" orientation="vertical" variant={'solid'} />
            {total}
          </>
        )}
      </Flex>
    );
  }
  return (
    <Flex gap={'2'}>
      {progress} <Separator h="5.5" orientation="vertical" variant={'solid'} />{' '}
      {total}
    </Flex>
  );
}
