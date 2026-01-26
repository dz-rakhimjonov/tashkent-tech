export const server = done => {
  app.plugins.browsersync.init({
    server: {
      baseDir: `${app.path.build.html}`,
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    reloadDebounce: 500,
    reloadDelay: 300,
    notify: false,
    port: 3000,
    open: false
  })
}
