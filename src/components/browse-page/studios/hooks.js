import { STUDIO_SORT } from '@/lib/constants';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function useSearchForm() {
  const searchParams = useSearchParams();
  const methods = useForm({
    defaultValues: {
      query: '',
      isBirthday: 'any',
      studioSort: ['FAVOURITES_DESC'],
    },
  });

  useEffect(() => {
    const { query, studioSort } = Object.fromEntries(searchParams.entries());

    const formValues = {};

    if (query) {
      formValues['query'] = query;
    }

    if (searchParams.has('isBirthday')) {
      formValues['isBirthday'] = 'yes';
    }
    if (searchParams.has('notBirthday')) {
      formValues['isBirthday'] = 'no';
    }

    if (
      studioSort &&
      studioSort
        .split(',')
        .every((ssUrl) =>
          STUDIO_SORT.map((ss) => ss.value).includes(ssUrl.trim().toUpperCase())
        )
    ) {
      formValues['studioSort'] = studioSort
        .split(',')
        .map((csUrl) => csUrl.trim().toUpperCase());
    }

    methods.reset({ ...methods.formState.defaultValues, ...formValues });
  }, []);

  useEffect(() => {
    const { isBirthday, ...rest } = methods.getValues();

    const searchParams = Object.fromEntries([
      ...Object.entries({ ...rest }).filter(
        ([_, value]) =>
          value !== '' &&
          value !== 0 &&
          value !== null &&
          value !== undefined &&
          !Number.isNaN(value) &&
          (Array.isArray(value) ? value.length > 0 : true)
      ),
      ...(isBirthday === 'yes'
        ? [['isBirthday', '']]
        : isBirthday === 'no'
        ? [['notBirthday', '']]
        : [[]]
      ).filter(([_, v]) => v !== undefined),
    ]);

    const newSearchParams = new URLSearchParams();
    for (const key in searchParams) {
      const value = searchParams[key];
      newSearchParams.set(key, value);
    }
    newSearchParams.set('subject', 'studios');

    window.history.replaceState(
      null,
      '',
      `?${newSearchParams.toString().replaceAll(/=(&)|=$/g, '$1')}`
    );
  }, [methods.watch()]);

  return { methods };
}
