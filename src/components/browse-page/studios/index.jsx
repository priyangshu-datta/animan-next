'use client';

import { STUDIO_SORT } from '@/lib/constants';
import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Radio,
  RadioGroup,
} from '@yamada-ui/react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider } from 'react-hook-form';
import { ReactSelectCustom } from '../media/reusable-components';
import { useSearchForm } from './hooks';
import SearchResults from './search-results';
import { setSearchOptionOnSubmit } from './utils';

export default function StudiosSearchPageComponent() {
  const { methods } = useSearchForm();

  const [searchOptions, setSearchOptions] = useState();

  function onSubmit() {
    methods.reset(methods.getValues());
  }

  useEffect(() => {
    setSearchOptions({
      searchSubject: 'studios',
      searchVariables: setSearchOptionOnSubmit(methods.formState.defaultValues),
    });
  }, [methods.formState.defaultValues]);

  return (
    <Box w="full" as="form" onSubmit={methods.handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <Flex
          gap="2"
          alignItems={'flex-start'}
          flexWrap={{ base: 'nowrap', md: 'wrap' }}
        >
          <Controller
            name="query"
            render={({ field }) => <Input {...field} type="search" autoFocus />}
          />
          <Button
            type="submit"
            colorScheme={'primary'}
            variant={'outline'}
            w={{ base: 'max-content', md: 'full' }}
          >
            Search {methods.formState.isDirty ? '*' : ''}
          </Button>
        </Flex>
        <Flex
          alignItems={'center'}
          wrap={{ md: 'wrap', base: 'nowrap' }}
          boxShadow={'inner'}
          _dark={{ boxShadow: '0px 0px 0px 0px rgba(255,255,255,1) inset' }}
          bgColor={'whiteAlpha.100'}
          p="4"
          mt="4"
        >
          <FormControl label={'Studio Sort'}>
            <Controller
              control={methods.control}
              name={'studioSort'}
              render={({ field }) => (
                <ReactSelectCustom
                  {...field}
                  value={field.value.map((fv) => ({
                    label: STUDIO_SORT.find((sort) => sort.value === fv).label,
                    value: fv,
                  }))}
                  onChange={(options) => {
                    field.onChange(options.map((opt) => opt.value));
                  }}
                  isMulti
                  closeMenuOnSelect={false}
                  options={STUDIO_SORT}
                  className="w-full"
                />
              )}
            />
          </FormControl>
        </Flex>
      </FormProvider>
      {searchOptions && <SearchResults searchOptions={searchOptions} />}
    </Box>
  );
}
