module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    mocha: true
  },
  extends: [
    'eslint:recommended',
    'plugin:mocha/recommended',
    'plugin:chai-expect/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  plugins: [
    'prefer-arrow'
  ],
  rules: {
    'mocha/no-mocha-arrows': 'off'
  }
};
