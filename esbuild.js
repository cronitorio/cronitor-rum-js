const esbuild = require('esbuild');
const browserslist = require('browserslist');
const { resolveToEsbuildTarget } = require('esbuild-plugin-browserslist');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

// Build browser target
esbuild
  .build({
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
  })
  .then((res) => console.log(esbuild.analyzeMetafileSync(res.metafile)))
  .catch(() => process.exit(1));

// Build browser-compatible IIFE bundle (for testing NPM import path in a real browser)
esbuild
  .build({
    platform: 'browser',
    entryPoints: {
      'index.browser': 'src/index.ts',
    },
    outdir: 'dist',
    bundle: true,
    treeShaking: true,
    minify: true,
    sourcemap: false,
    color: true,
    format: 'iife',
    globalName: 'CronitorRUM',
    target: resolveToEsbuildTarget(browserslist('> 0.25% and not dead'), {
      printUnknownTargets: false,
    }),
  })
  .catch(() => process.exit(1));

// Build NPM module target
esbuild
  .build({
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
    format: 'cjs',
    plugins: [nodeExternalsPlugin()],
  })
  .then((res) => console.log(esbuild.analyzeMetafileSync(res.metafile)))
  .catch(() => process.exit(1));
