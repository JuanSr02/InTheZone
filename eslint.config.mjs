import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',

      '@typescript-eslint/no-unused-vars': 'warn', // Variables no usadas solo avisan, no rompen
      'react/no-unescaped-entities': 'off', // Permite escribir "don't" sin escapar comillas
      '@next/next/no-img-element': 'off', // Permite usar <img> normal si no quieres usar <Image> siempre
    },
  },
  prettierConfig,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/*.js',
  ]),
]);

export default eslintConfig;
