import { Card, CardBody, CardHeader, Text, Image } from '@yamada-ui/react';
import Link from 'next/link';

export default function CharacterCard(props) {
  const { id, image, name, role } = props;
  return (
    <Card>
      <CardHeader justifyContent="center" aspectRatio={4 / 5} width={'full'}>
        <Image src={image} objectFit="cover" w={'full'} h={'full'} />
      </CardHeader>

      <CardBody>
        <Link href={`/character/${id}`} size="md">
          {name}
        </Link>
        <Text size="xs" as={'sub'}>
          {role.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase())}
        </Text>
      </CardBody>
    </Card>
  );
}
