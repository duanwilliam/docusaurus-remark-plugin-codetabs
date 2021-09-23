import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        plugins: [terser({ compress: true, mangle: true, format: { comments: false } })],
      },
      {
        file: pkg.module,
        format: 'esm',
        plugins: [terser({ compress: true, mangle: true, format: { comments: false } })],
      },
    ],
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [
      del({ targets: 'dist/*', runOnce: true }),
      resolve(),
      typescript({ useTsconfigDeclarationDir: true }),
    ],
  },
]