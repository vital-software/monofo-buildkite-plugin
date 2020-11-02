module.exports = {
  root: true,
  globals: {
    __dirname: true,
    process: true
  },
  env: {
    commonjs: true,
    es6: true,
    jest: true,
    node: true
  },
  // See: https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project
  extends: [
    'airbnb-typescript/base',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended' // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    project: __dirname + '/tsconfig.json',
    tsconfigRootDir: __dirname, // https://github.com/typescript-eslint/typescript-eslint/issues/251#issuecomment-567365174
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  rules: {
    'import/order': [
      'error',
      { alphabetize: { order: 'asc', caseInsensitive: true }, 'newlines-between': 'never' },
    ],

    // Allow unbound static method references
    '@typescript-eslint/unbound-method': [
      'error',
      {
        'ignoreStatic': true
      }
    ],

    // Soften some errors
    'import/prefer-default-export': 'warn',
    'no-restricted-syntax': ['warn', 'ForInStatement', 'LabeledStatement', 'WithStatement'], // Removes ForOfStatement from extended standards
    'no-return-assign': ['error', 'except-parens'],
    'class-methods-use-this': 'warn',

    // And turn some completely off
    'no-underscore-dangle': 'off',
    'max-classes-per-file': 'off'
  },
  overrides: [
    {
      files: "bin/**/*.js",
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      }
    }
  ]
};
