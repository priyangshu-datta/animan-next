import { Card, CardBody, CardHeader, Text, Image } from '@yamada-ui/react';
import Link from 'next/link';

export default function CharacterCard({ character }) {
  return (
    <Card>
      <CardHeader justifyContent="center" aspectRatio={4 / 5} width={'full'}>
        <Image
          src={character.image.large}
          objectFit="cover"
          w={'full'}
          h={'full'}
        />
      </CardHeader>

      <CardBody>
        <Link href={`/character?id=${character.id}`}>
          <Text fontSize={'lg'}>{character.name.userPreferred}</Text>
        </Link>
        <Text fontSize="md">
          {character.role
            .toLowerCase()
            .replace(/\b\w/g, (s) => s.toUpperCase())}
        </Text>
      </CardBody>
    </Card>
  );
}
