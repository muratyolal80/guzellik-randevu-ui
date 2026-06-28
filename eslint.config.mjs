import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      '.tmp/**',
      '.tmp-claude-skills/**',
      'tmp/**',
      'claude-skills/**',
      'public/**',
      'initdb/**',
      'docs/**',
      'scripts/**',
      'supabase-project/**',
      'sentry.*.config.ts',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '*.config.ts',
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // JSX içindeki tek tırnak/çift tırnak Türkçe metinlerde sık — bug değil, sadece stil
      'react/no-unescaped-entities': 'off',
      // <img> yerine next/image: optimization önerisi, hard error değil
      '@next/next/no-img-element': 'warn',
      // React Compiler immutability — useEffect içinde setState cascade ve TDZ uyarıları;
      // bug ama refactor gerektiriyor (chore/react-compiler-cleanup branch'inde toparlanacak)
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];
