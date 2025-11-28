import path from 'path';

const buildEslintCommand = (filenames) =>
  `eslint --cache --cache-location node_modules/.cache/.eslintcache --fix --no-warn-ignored ${filenames
    .map((f) => `"${path.relative(process.cwd(), f)}"`)
    .join(' ')}`;

/** @type {import('lint-staged').Configuration} */
export default {
  '*.{ts,tsx}': [() => 'tsc --noEmit', buildEslintCommand, 'prettier --write'],
  '*.{js,jsx,mjs,cjs}': [buildEslintCommand, 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.css': ['prettier --write'],
};
