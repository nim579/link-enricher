import typescript from '@rollup/plugin-typescript';

export default {
  input: './lib/index.ts',
  plugins: [
    typescript(),
  ],
  external: [
    'node:url',
    'cheerio',
    'content-disposition',
    'got',
    'lodash',
    'mime',
  ],
  output: [{
    file: './dist/link-enricher.es.js',
    format: 'es',
    sourcemap: true
  }, {
    file: './dist/link-enricher.cjs.js',
    format: 'cjs',
    sourcemap: true
  }],
  watch: {
    chokidar: true
  }
};
