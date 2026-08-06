export const DEFAULT_STUDENT_FILTERS = {
  search: '',
  status: 'active',
  level: '',
  teacher: '',
  sort: 'name-asc',
};

const FILTER_KEYS = Object.keys(DEFAULT_STUDENT_FILTERS);

export function studentFiltersFromParams(searchParams) {
  return FILTER_KEYS.reduce((filters, key) => ({
    ...filters,
    [key]: searchParams.get(key) || DEFAULT_STUDENT_FILTERS[key],
  }), {});
}

export function studentFiltersToParams(filters) {
  const params = new URLSearchParams();
  FILTER_KEYS.forEach((key) => {
    const value = String(filters[key] ?? '').trim();
    if (value && value !== DEFAULT_STUDENT_FILTERS[key]) params.set(key, value);
  });
  return params;
}

export function studentListHref(filters) {
  const query = studentFiltersToParams(filters).toString();
  return query ? `/students?${query}` : '/students';
}
