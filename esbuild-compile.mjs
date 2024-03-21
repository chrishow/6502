#!/usr/bin/env node

import * as esbuild from 'esbuild'
import { lessLoader } from 'esbuild-plugin-less';


const minify = true;

const target = [
  'es2016'
];


// Build less to CSS
let result = await esbuild.build({
  entryPoints: ['htdocs/less/styles.less'],
  bundle: true,
  external: ["*.woff", "*.woff2", "*.eot", "*.ttf"],
  minify: minify,
  sourcemap: true,
  outfile: 'htdocs/css/styles.css',
  plugins: [lessLoader()],
  loader: {},
});

// Build JS
let result2 = await esbuild.build({
  entryPoints: ['htdocs/js/scripts.js'],
  target: target,
  bundle: true,
  minify: minify,
  sourcemap: true,
  sourcesContent: true,
  outfile: 'htdocs/js/scripts-dist.js',
});
