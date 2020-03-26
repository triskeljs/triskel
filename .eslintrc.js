module.exports = {
  'env': {
    es6: true,
  },
  'parserOptions': {
    ecmaVersion: 9,
    sourceType: 'module',
  },
  'extends': [
    'eslint:recommended',
  ],
  'rules': {
    'no-console': ['warn'],
    'no-unexpected-multiline': 'error',
    'no-irregular-whitespace': 'off',
    'comma-dangle': ['warn', 'always-multiline'],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    'semi': [
      'error',
      'never'
    ],
    'no-unused-vars': [
      'error',
      {
          'args': 'after-used',
          'argsIgnorePattern': '^_\\w+'
      }
    ],
  },
  'overrides': [
    {
      files: ['loader/{,**/}*.js'],
      'env': {
        es6: true,
        node: true,
      },
    },
    {
      files: ['{app,con-text,parser,render,stringify,tinyhtml}/{,**/}*.js'],
      excludedFiles: ['{,**/}*.test{,_}.js'],
      'env': {
        es6: true,
        browser: true,
      },
    },
    {
      files: ['{,**/}*.test{,_}.js'],
      'globals': {
        console: true,
        process: true,
        describe: true,
        it: true,
        beforeEach: true,
        afterEacf: true,
        __filename: true,
        __dirname: true,
      }
    }
  ],
};
