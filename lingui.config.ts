import type { LinguiConfig } from '@lingui/conf';
import { formatter } from "@lingui/format-json";

const config: LinguiConfig = {
  locales: ['en', 'zh'],
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en'
  },
  catalogs: [
    {
      path: 'src/locales/{locale}',
      include: ['src/']
    }
  ],
  format: formatter({ style: "lingui" }),
};

export default config;
