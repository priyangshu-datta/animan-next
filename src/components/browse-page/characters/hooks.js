import { CHARACTER_SORT } from '@/lib/constants';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function useSearchForm() {
  const searchParams = useSearchParams();
  const methods = useForm({
    defaultValues: {
      query: '',
      isBirthday: 'any',
      characterSort: ['FAVOURITES_DESC'],
    },
  });

  useEffect(() => {
    const { query, characterSort } = Object.fromEntries(searchParams.entries());

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
      characterSort &&
      characterSort
        .split(',')
        .every((csUrl) =>
          CHARACTER_SORT.map((ms) => ms.value).includes(
            csUrl.trim().toUpperCase()
          )
        )
    ) {
      formValues['characterSort'] = characterSort
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
    newSearchParams.set('subject', 'characters');

    window.history.replaceState(
      null,
      '',
      `?${newSearchParams.toString().replaceAll(/=(&)|=$/g, '$1')}`
    );
  }, [methods.watch()]);

  return { methods };
}
