import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const name = 'SlideMenu';
const extensions = ['.js', '.ts'];

const plugins = [
  resolve({ extensions }),
  babel({
    extensions,
    include: ['src/**/*'],
  }),
  terser(),
];

if (process.env.dev) {
  plugins.push(
    serve({
      port: 8080,
      open: true,
      contentBase: 'docs',
    }),
  );
}

export default {
  input: './src/SlideMenu.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
    },
    {
      file: pkg.browser,
      format: 'iife',
      name,
    },
    {
      file: 'docs/slide-menu.js',
      format: 'iife',
      name,
    },
  ],
  plugins,
};
