import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer'
import groupCssMediaQueries from 'gulp-group-css-media-queries'
import rename from 'gulp-rename'
import cleanCss from 'gulp-clean-css'

const sass = gulpSass(dartSass)

export const scss = () => {
  return app.gulp
    .src(app.path.src.scss, { sourcemap: true })
    .pipe(
      sass({
        outputStyle: 'compressed'
        // Use 'sourcemap' instead of 'sourcemaps'
      })
    )
    .pipe(app.gulp.dest(app.path.build.css))
    .pipe(groupCssMediaQueries())
    .pipe(
      autoprefixer({
        grid: false,
        overrideBrowserslist: ['last 3 versions'],
        cascade: true
      })
    )
    .pipe(cleanCss())
    .pipe(
      rename({
        extname: '.min.css'
      })
    )
    .pipe(app.plugins.replace(/@\//g, '../'))
    .pipe(app.gulp.dest(app.path.build.css), { sourcemaps: '.' })
    .pipe(app.plugins.browsersync.stream())
}
