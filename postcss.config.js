module.exports = () => ({
  plugins: {
    autoprefixer: {
      remove: false,
    },
    cssnano: {
      preset: 'default',
    },
  },
});
