'use client';

import { STAFF_SORT } from '@/lib/constants';
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

export default function StaffsSearchPageComponent() {
  const { methods } = useSearchForm();

  const [searchOptions, setSearchOptions] = useState();

  function onSubmit() {
    methods.reset(methods.getValues());
  }

  useEffect(() => {
    setSearchOptions({
      searchSubject: 'staffs',
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
          <FormControl label="Birthday Today">
            <Controller
              name="isBirthday"
              control={methods.control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  direction="row"
                  alignItems={'center'}
                  _dark={{
                    boxShadow: '0px 0px 0px 0px rgba(255,255,255,1) inset',
                  }}
                >
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                  <Radio value="any">Any</Radio>
                </RadioGroup>
              )}
            />
          </FormControl>

          <FormControl label={'Staff Sort'}>
            <Controller
              control={methods.control}
              name={'staffSort'}
              render={({ field }) => (
                <ReactSelectCustom
                  {...field}
                  value={field.value.map((fv) => ({
                    label: STAFF_SORT.find((sort) => sort.value === fv).label,
                    value: fv,
                  }))}
                  onChange={(options) => {
                    field.onChange(options.map((opt) => opt.value));
                  }}
                  isMulti
                  closeMenuOnSelect={false}
                  options={STAFF_SORT}
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
