import { useForm } from 'react-hook-form';
import {
  formControlValuesToSearchParams,
  searchParamsToFormControlValues,
} from './utils';
import { useGenreCollection } from '@/lib/client/hooks/react_query/get/media/genre-collection';
import { useTagCollection } from '@/lib/client/hooks/react_query/get/media/tag-collection';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export const defaultFormValues = {
  query: '',
  mediaType: 'ANIME',
  season: '',
  seasonYear: null,
  countryOfOrigin: 'all',
  mediaSource: [],
  mediaSort: ['TRENDING_DESC', 'POPULARITY_DESC'],
  mediaFormat: [],
  mediaFormatInclusion: true,
  mediaStatus: [],
  mediaStatusInclusion: true,
  genres: [],
  genresInclusion: true,
  mediaTag: [],
  mediaTagInclusion: true,
  mediaTagCategory: [],
  mediaTagCategoryInclusion: true,
  episodesLesser: '',
  chaptersLesser: '',
  volumesLesser: '',
  scoreLesser: '',
  popularityLesser: '',
  durationLesser: '',
  episodesGreater: '',
  chaptersGreater: '',
  volumesGreater: '',
  scoreGreater: '',
  popularityGreater: '',
  durationGreater: '',
  startDateComparator: '',
  startDate: null,
  endDateComparator: '',
  endDate: null,
  checkboxes: [],
  onList: 'all',
};

export function useSearchForm() {
  const searchParams = useSearchParams();

  const genresInfo = useGenreCollection();
  const tagsInfo = useTagCollection();

  const tagCategories = useMemo(
    () =>
      Array.from(
        new Set((tagsInfo.data?.data ?? []).flatMap((t) => t.category))
      ),
    [tagsInfo.data]
  );

  const methods = useForm({ defaultValues: defaultFormValues });

  useEffect(() => {
    const formValues = searchParamsToFormControlValues(
      searchParams,
      tagsInfo.data?.data,
      tagCategories,
      genresInfo.data?.data
    );

    methods.reset({ ...methods.formState.defaultValues, ...formValues });
  }, [tagsInfo.data, genresInfo.data, tagCategories]);

  useEffect(() => {
    const searchOptions = formControlValuesToSearchParams(methods.getValues());

    const newSearchParams = new URLSearchParams();
    for (const key in searchOptions) {
      const value = searchOptions[key];
      newSearchParams.set(key, value);
    }
    newSearchParams.set('subject', 'media');

    window.history.replaceState(
      null,
      '',
      `?${newSearchParams.toString().replaceAll(/=(&)|=$/g, '$1')}`
    );
  }, [methods.watch()]);

  return { methods, tagCategories, tagsInfo, genresInfo, searchParams };
}
