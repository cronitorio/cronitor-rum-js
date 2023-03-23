const esbuild = require('esbuild');
const browserslist = require('browserslist');
const { resolveToEsbuildTarget } = require('esbuild-plugin-browserslist');

// Build browser target
const browserTarget = esbuild.buildSync({
  platform: 'browser',
  entryPoints: {
    rumscript: 'src/rumscript.ts',
  },
  outdir: 'dist',
  metafile: true,
  bundle: true,
  treeShaking: true,
  minify: true,
  sourcemap: false,
  color: true,
  target: resolveToEsbuildTarget(browserslist('> 0.25% and not dead'), {
    printUnknownTargets: false,
  }),
});

console.log(esbuild.analyzeMetafileSync(browserTarget.metafile));

// Build NPM module target
const packageTarget = esbuild.buildSync({
  platform: 'node',
  entryPoints: {
    index: 'src/index.ts',
  },
  outdir: 'dist',
  metafile: true,
  bundle: true,
  treeShaking: true,
  minify: true,
  sourcemap: false,
  color: true,
  target: 'node14',
  tsconfig: "tsconfig.json",
});

console.log(esbuild.analyzeMetafileSync(packageTarget.metafile));
