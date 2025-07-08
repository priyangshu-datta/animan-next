export function setSearchOptionOnSubmit(data) {
  const { isBirthday, ...rest } = data;

  const searchOptions = Object.fromEntries([
    ...Object.entries({
      ...rest,
      ...(isBirthday === 'yes'
        ? { isBirthday: true }
        : isBirthday === 'no'
        ? { isBirthday: false }
        : {}),
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
