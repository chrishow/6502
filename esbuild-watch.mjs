#!/usr/bin/env node

import * as esbuild from 'esbuild'
import { lessLoader } from 'esbuild-plugin-less';


const minify = false;
const target = [
    'es2016'
  ];


// Build less to CSS
let styles = await esbuild.context({
  entryPoints: ['htdocs/less/styles.less'],
  bundle: true,
  external: ["*.woff", "*.woff2", "*.eot", "*.ttf"],
  minify: minify,
  outfile: 'htdocs/css/styles.css',
  sourcemap: true,
  // sourcesContent: true,
  plugins: [lessLoader()],
  loader: {},
});

// Build JS
let scripts = await esbuild.context({
    entryPoints: ['htdocs/js/scripts.js'],
    target: target,
    bundle: true,
    minify: minify,
    sourcemap: true,
    sourcesContent: true,
    outfile: 'htdocs/js/scripts-dist.js',     
  });
  

await styles.watch();
await scripts.watch();