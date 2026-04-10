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
  target: ['es2020'],
  loader: { '.css': 'text', '.json': 'json' },
};

if (isWatch) {
  const ctx = await context(config);
  await ctx.watch();
  console.log('Watching...');
} else {
  await build(config);
  const buf = readFileSync('dist/cmp.min.js');
  const size = buf.length;
  console.log(`Build complete: ${(size / 1024).toFixed(1)} kB (${(size / 1024).toFixed(1)} kB raw)`);
}
