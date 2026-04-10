import { build, context } from 'esbuild';
import { readFileSync } from 'fs';

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: !isWatch,
  sourcemap: true,
  outfile: 'dist/cmp.min.js',
  format: 'iife',
  globalName: 'CMP',
  target: ['es2020'],
  loader: { '.css': 'text', '.json': 'json' },
};

if (isWatch) {
  const ctx = await context(config);
  await ctx.watch();
  console.log('Watching...');
} else {
  await build(config);
  const { size } = readFileSync('dist/cmp.min.js');
  console.log(`Build complete: ${(size / 1024).toFixed(1)} kB (${(size / 1024).toFixed(1)} kB raw)`);
}
