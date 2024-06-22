import globals from "globals";
import pluginJs from '@eslint/js';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import pluginJson from 'eslint-plugin-json';
import pluginMocha from 'eslint-plugin-mocha';
import pluginPreferArrow from "eslint-plugin-prefer-arrow";


export default [{
  ignores: ["**/.vscode/"],
  }, 
  pluginJs.configs.recommended,
  pluginJsdoc.configs['flat/recommended'],
  pluginMocha.configs.flat.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
        ...globals.mocha,
      },
    },
    plugins: {
      preferArrow: pluginPreferArrow
    },
    rules: {
      'mocha/no-mocha-arrows': 'off',
    },
  },
  {
    files: ['**/*.json'],
    ignores: ['**/.vscode/launch.json'],
    plugins: {
      pluginJson,
    },
    processor: pluginJson.processors['.json'],
    rules: {
      'pluginJson/*': ['error', { allowComments: true }],
    },
  },
];