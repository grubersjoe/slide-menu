module.exports = () => ({
  plugins: {
    autoprefixer: {
      browsers: ['> 1%', 'last 2 versions'],
      remove: false,
    },
    cssnano: {
      preset: 'default',
    },
  },
});
