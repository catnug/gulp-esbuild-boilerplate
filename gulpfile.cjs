const { src, dest, watch, series, parallel } = require('gulp')
const browsersync = require('browser-sync').create()
const pug = require('gulp-pug')
const inject = require('gulp-inject')
const imagemin = require('gulp-imagemin')
const path = require('node:path')
const { rimraf } = require('rimraf')
const gulpif = require('gulp-if')
const esbuild = require('esbuild')
const postcss = require('postcss')
const postcssPresetEnv = require('postcss-preset-env')
const { sassPlugin } = require('esbuild-sass-plugin')
const browserslistToEsbuild = require('browserslist-to-esbuild')

const settings = {
  browsersync: {
    serveFrom: 'public',
  },
}

const paths = {
  html: {
    compiled: `${settings.browsersync.serveFrom}/*.html`,
    dest: `${settings.browsersync.serveFrom}`,
  },
  pug: {
    src: 'src/assets/pug/*.pug',
    dest: `${settings.browsersync.serveFrom}`,
    watch: './src/assets/pug/**/*.pug',
  },
  styles: {
    src: 'src/assets/styles/**/*.scss',
    dest: `${settings.browsersync.serveFrom}/assets/styles`,
    watch: 'src/assets/styles/**/*.scss',
    entry: ['src/assets/styles/style.scss'],
  },
  scripts: {
    src: 'src/assets/scripts/**/*.js',
    dest: `${settings.browsersync.serveFrom}/assets/scripts`,
    watch: 'src/assets/scripts/**/*.js',
    entry: ['src/assets/scripts/index.js'],
  },
  images: {
    src: 'src/assets/images/**/*.+(png|jpg|gif|svg|jpeg)',
    dest: `${settings.browsersync.serveFrom}/assets/images`,
  },
  favicon: {
    src: 'src/favicon*.{ico,png,svg}',
    dest: `${settings.browsersync.serveFrom}`,
  },
}

/*☕💋JS and SASS, build minify, hashing, babel-ish transformation, browser support task*/
function jsSass(type = 'all') {
  if (!['all', 'scripts', 'styles'].includes(type)) {
    return Promise.resolve('not really important')
  }

  return async function jsSassTask() {
    const entryPoints = [
      ...(['all', 'scripts'].includes(type) ? paths.scripts.entry : []),
      ...(['all', 'styles'].includes(type) ? paths.styles.entry : []),
    ]

    return await esbuild.build({
      entryPoints,
      bundle: true,
      minify: true,
      outdir: 'public',
      outbase: 'src',
      entryNames: '[dir]/bundle-[name]-[hash]',
      write: true,
      target: browserslistToEsbuild(),
      plugins: [
        sassPlugin({
          async transform(source, _, filePath) {
            const { css } = await postcss([
              postcssPresetEnv({ autoprefixer: { grid: true } }),
            ]).process(source, { from: filePath })
            return css
          },
        }),
      ],
    })
  }
}

/*🏳️‍🌈HTML files URL injection 🐶PUG files compilation*/
/*📢'pug' this task should run after JS and SCSS tasks, while exporting tasks*/
/*📢'html' this task should run after JS or SCSS tasks, while watching tasks */
function pugHtml(type) {
  if (!['pug', 'html'].includes(type)) {
    return Promise.resolve('not really important')
  }

  return function pugHtmlTask() {
    const urls = src(
      [`${paths.styles.dest}/*.css`, `${paths.scripts.dest}/*.js`],
      { read: false },
    )

    return src(type === 'pug' ? paths.pug.src : paths.html.compiled)
      .pipe(gulpif(type === 'pug', pug({ pretty: true })))
      .pipe(
        inject(urls, {
          ignorePath: settings.browsersync.serveFrom,
          transform: function (filepath) {
            if (path.extname(filepath) === '.js') {
              return `<script src="${filepath}" type="module" defer></script>`
            }
            return inject.transform.apply(inject.transform, arguments)
          },
        }),
      )
      .pipe(dest(type === 'pug' ? paths.pug.dest : paths.html.dest))
  }
}

/*🌍Favicon move task*/
function faviconTask() {
  return src(paths.favicon.src).pipe(dest(paths.favicon.dest))
}

/*📸Images (inc SVG) reduce size and move*/
function imageSvg(mode = 'all') {
  if (!['all', 'onlyMove'].includes(mode)) {
    return Promise.resolve('not really important')
  }

  return function imageSvgTask() {
    return src(paths.images.src)
      .pipe(gulpif(mode === 'all', imagemin()))
      .pipe(dest(paths.images.dest))
  }
}

/*⚒️clear utility wrapper*/
function clear(type = 'all') {
  return function clearTask() {
    if (type === 'all') {
      return rimraf(settings.browsersync.serveFrom)
    } else if (type === 'scripts') {
      return rimraf(paths.scripts.dest)
    } else if (type === 'styles') {
      return rimraf(paths.styles.dest)
    } else if (type === 'html') {
      return rimraf(paths.html.compiled, { glob: true })
    } else if (type === 'images') {
      return rimraf(paths.images.dest)
    }
  }
}

/*🚀BrowserSync initialize*/
function browserSyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: settings.browsersync.serveFrom,
    },
  })
  cb()
}

/*🚀BrowserSync reload*/
function browserSyncReload(cb) {
  browsersync.reload()
  cb()
}

/*👀watch tasks*/
function watchTask() {
  watch(
    paths.styles.watch,
    { delay: 100 },
    series(
      clear('styles'),
      jsSass('styles'),
      pugHtml('html'),
      browserSyncReload,
    ),
  )
  watch(
    paths.scripts.watch,
    { delay: 100 },
    series(
      clear('scripts'),
      jsSass('scripts'),
      pugHtml('html'),
      browserSyncReload,
    ),
  )
  watch(
    paths.pug.watch,
    { delay: 100 },
    series(clear('html'), pugHtml('pug'), browserSyncReload),
  )
  watch(
    paths.images.src,
    { delay: 100 },
    series(clear('images'), imageSvg('onlyMove'), browserSyncReload),
  )
}

/*🏁 exporting tasks*/
exports.default = series(
  clear('all'),
  jsSass('all'),
  pugHtml('pug'),
  parallel(faviconTask, imageSvg()),
  browserSyncServe,
  browserSyncReload,
  watchTask,
)
