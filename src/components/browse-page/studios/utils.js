export function setSearchOptionOnSubmit(data) {
  const searchOptions = Object.fromEntries([
    ...Object.entries({
      ...data,
    }).filter(
      ([_, value]) =>
        value !== '' &&
        value !== 0 &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(value) &&
        (Array.isArray(value) ? value.length > 0 : true)
    ),
  ]);

  return searchOptions;
}
