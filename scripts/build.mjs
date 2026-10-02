import { build, context } from 'esbuild';
import { mkdir, cp, copyFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Relative asset URLs work both at / and at GitHub Pages' /repository/ path.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const output = path.resolve(root, 'docs');
if (path.dirname(output) !== root || path.basename(output) !== 'docs') throw new Error('Invalid build output directory');
await rm(output, { recursive: true, force: true });
await mkdir('docs/assets', { recursive: true });
await cp('public', 'docs', { recursive: true });
await copyFile('index.html', 'docs/index.html');
await writeFile('docs/.nojekyll', '');
const options = {
  entryPoints: ['src/app.js'],
  bundle: true,
  splitting: true,
  format: 'esm',
  outdir: 'docs/assets',
  chunkNames: 'chunks/[name]-[hash]',
  target: ['es2022'],
  minify: true,
  external: ['./fonts/*'],
  sourcemap: false,
  legalComments: 'linked',
  metafile: true,
  logLevel: 'info',
};
if (process.argv.includes('--serve')) {
  const ctx = await context(options);
  await ctx.watch();
  const server = await ctx.serve({ servedir: 'docs', host: '127.0.0.1', port: 4173 });
  console.log(`Preview: http://${server.host}:${server.port}`);
  console.log('JS and CSS changes rebuild automatically. Restart after HTML or public asset changes.');
} else {
  const result = await build(options);
  await writeFile('build-meta.json', JSON.stringify(result.metafile, null, 2));
}
