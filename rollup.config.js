import typescript from '@rollup/plugin-typescript';

export function emitCommonPackageFile() {
  return {
    generateBundle() {
      this.emitFile({ fileName: 'package.json', source: '{"type": "commonjs"}', type: 'asset' });
    },
    name: 'emit-common-package-file'
  };
}

const name = 'link-enricher';

const sharedConfig = {
  input: {
    [name]: './lib/index.ts',
  },
  external: [
    'node:url',
    'cheerio',
    'content-disposition',
    'got',
    'lodash',
    'mime',
  ],
  watch: {
    chokidar: true
  }
};

const sharedOutput = {
  entryFileNames: '[name].js',
  chunkFileNames: '[name].js',
  freeze: false,
  exports: 'auto',
  generatedCode: 'es2015',
  minifyInternalExports: false,
  sourcemap: true
};

export default [
  {
    ...sharedConfig,

    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
        rootDir: './lib'
      }),
    ],
    output: {
      ...sharedOutput,
      format: 'es',
      dir: 'dist',
    }
  },
  {
    ...sharedConfig,

    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/cjs/types',
        rootDir: './lib'
      }),
      emitCommonPackageFile()
    ],
    output: {
      ...sharedOutput,
      format: 'cjs',
      dir: 'dist/cjs',
    }
  }
];

