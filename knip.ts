import type { KnipConfig } from 'knip';

// @ts-ignore
const isProductionMode = process.argv.includes('--production');

const productionEntryPoints = [
  'src/router.tsx',
  'src/providers.tsx',
  'src/routes/**/*.{ts,tsx}',
  'src/env/*.ts',
  'prisma/seed/*.ts',
  'src/features/build-info/script-to-generate-json.ts',
];

const testingEntryPoints = [
  'src/**/*.unit.{test,spec}.?(c|m)[jt]s?(x)',
  'src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)',
];

const storybookEntryPoints = ['src/**/*.stories.{ts,tsx}'];

const e2eEntryPoints = ['e2e/**/*.spec.ts', 'e2e/setup/**/*.ts'];

const config: KnipConfig = {
  entry: [
    ...productionEntryPoints.map((entry) => `${entry}!`),
    ...testingEntryPoints,
    ...storybookEntryPoints,
    ...e2eEntryPoints,
  ],
  project: [
    'src/**/*.{ts,tsx}',
    'prisma/**/*.ts',
    'e2e/**/*.ts',
    // Exclude test helpers from production analysis
    '!src/**/*{t,T}estUtils*.{ts,tsx}!',
  ],
  // In production mode, ignore exports only used within the same file
  ignoreExportsUsedInFile: isProductionMode,
  ignore: [
    'src/components/ui/**', // shadcn components — kept as a library, not all parts are used
  ],
  paths: {
    'e2e/*': ['./e2e/*'],
  },
  ignoreDependencies: [
    'resize-observer-polyfill', // used in test setup
    'tailwindcss', // used via CSS @import
    'tw-animate-css', // used via CSS @import
    // semantic-release plugins loaded via .releaserc
    '@semantic-release/commit-analyzer',
    '@semantic-release/github',
    '@semantic-release/release-notes-generator',
  ],
  storybook: {
    config: ['.storybook/main.ts'],
    entry: storybookEntryPoints,
  },
  playwright: {
    config: ['playwright.config.ts'],
    entry: e2eEntryPoints,
  },
  vitest: {
    config: ['vitest.config.ts'],
    entry: testingEntryPoints,
  },
};

export default config;
