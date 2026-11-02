// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // Reanimated SharedValues mutate .value by design
      'react-hooks/immutability': 'off',
      // Allow standard Date/random helpers in React Native components & handlers
      'react-hooks/purity': 'off',
    },
  },
]);
