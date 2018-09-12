module.exports = () => ({
  plugins: {
    autoprefixer: {
      browsers: ['> 1%'],
      remove: false,
    },
    cssnano: {
      preset: 'default',
    },
  },
});
