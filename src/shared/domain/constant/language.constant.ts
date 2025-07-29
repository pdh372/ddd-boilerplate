export const LANGUAGE_VALUE = {
  VI: 'vi',
  EN: 'en',
} as const;

export type ILanguage = ConstValue<typeof LANGUAGE_VALUE>;
