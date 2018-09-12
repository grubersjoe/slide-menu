module.exports = () => ({
  plugins: {
    autoprefixer: {
      browsers: ['last 2 versions', 'Firefox ESR', 'not dead', 'not ie > 0'],
      remove: false,
    },
    cssnano: {
      preset: 'default',
    },
  },
});
