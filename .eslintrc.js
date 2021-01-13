module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'prettier',
    'prettier/react',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: ['jest', 'react', 'react-native'],
  rules: {
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],
    'react/no-unescaped-entities': 0,
    'react/display-name': 0,
    'react-native/no-unused-styles': 0,
    'react-native/sort-styles': 0,
    'react-native/no-raw-text': 0,
    'no-inner-declarations': 0,
    'object-curly-spacing': ['error', 'always'],
  },
};
