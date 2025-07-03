import { VenetianMaskIcon } from "@yamada-ui/lucide"
import { CheckboxCardGroup, FormControl, HStack, Text } from "@yamada-ui/react"
import { Controller, useFormContext } from "react-hook-form"

export default function Entry_Private_HiddenFromStatusLists_CheckBoxes() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <FormControl
      invalid={!!errors.options}
      errorMessage={errors.options ? errors.options.message : undefined}
    >
      <Controller
        name="options"
        control={control}
        render={({ field }) => (
          <CheckboxCardGroup
            {...field}
            onChange={(options) => field.onChange(options.sort())}
            w="full"
            flexWrap={'wrap'}
            withIcon={false}
            items={[
              {
                label: (
                  <HStack gap="sm">
                    <VenetianMaskIcon color="muted" fontSize="2xl" />
                    <Text>Private</Text>
                  </HStack>
                ),
                value: 'private',
              },
              {
                label: (
                  <HStack gap="sm" w="max-content">
                    <VenetianMaskIcon color="muted" fontSize="2xl" />
                    <Text flexShrink={0}>Hidden from status lists</Text>
                  </HStack>
                ),
                value: 'hiddenFromStatusLists',
              },
            ]}
          />
        )}
      />
    </FormControl>
  );
}
