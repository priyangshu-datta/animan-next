import { Card, CardBody, CardHeader, Text, Image } from '@yamada-ui/react';

export default function CharacterCard(props) {
  const { image, name } = props;
  return (
    <Card>
      <CardHeader justifyContent="center" aspectRatio={4 / 5} width={'full'}>
        <Image src={image} objectFit="cover" w={'full'} h={'full'} />
      </CardHeader>

      <CardBody>
        <Text size="md">{name}</Text>
      </CardBody>
    </Card>
  );
}
