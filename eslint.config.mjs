import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';

const moduleTypes = [
  'core',
  'ledger',
  'budget',
  'monthly',
  'debts',
  'goals',
  'networth',
  'dashboard',
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app', mode: 'folder' },
        { type: 'lib', pattern: 'src/lib', mode: 'folder' },
        { type: 'components', pattern: 'src/components', mode: 'folder' },
        ...moduleTypes.map((m) => ({
          type: `module-${m}`,
          pattern: `src/modules/${m}`,
          mode: 'folder',
        })),
        {
          type: 'module-internal',
          pattern: 'src/modules/*/*',
          capture: ['moduleName', 'layer'],
          mode: 'folder',
        },
      ],
      'boundaries/include': ['src/**/*'],
      'boundaries/ignore': ['**/*.test.ts', 'src/generated/**'],
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/modules/*/repository/**',
                '@/modules/*/services/**',
                '@/modules/*/validators/**',
              ],
              message:
                'No importes repository/services/validators de otro módulo; usa index.ts o Server Actions.',
            },
          ],
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: ['app'], allow: ['lib', 'components', ...moduleTypes.map((m) => `module-${m}`)] },
            { from: ['lib'], allow: ['lib', 'module-core'] },
            { from: ['components'], allow: ['lib', 'components', ...moduleTypes.map((m) => `module-${m}`)] },
            { from: ['module-core'], allow: ['lib', 'module-core'] },
            { from: ['module-ledger'], allow: ['lib', 'module-core', 'module-ledger'] },
            { from: ['module-budget'], allow: ['lib', 'module-core', 'module-ledger', 'module-budget'] },
            {
              from: ['module-monthly'],
              allow: ['lib', 'module-core', 'module-ledger', 'module-budget', 'module-monthly'],
            },
            { from: ['module-debts'], allow: ['lib', 'module-core', 'module-ledger', 'module-debts'] },
            {
              from: ['module-goals'],
              allow: ['lib', 'module-core', 'module-ledger', 'module-monthly', 'module-goals'],
            },
            {
              from: ['module-networth'],
              allow: ['lib', 'module-core', 'module-ledger', 'module-debts', 'module-networth'],
            },
            {
              from: ['module-dashboard'],
              allow: [
                'lib',
                'module-core',
                'module-ledger',
                'module-budget',
                'module-monthly',
                'module-debts',
                'module-goals',
                'module-networth',
                'module-dashboard',
              ],
            },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/generated/**']),
]);

export default eslintConfig;
