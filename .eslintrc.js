module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Error handling
    'no-console': 'warn',
    'no-debugger': 'error',
    
    // Code quality
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'prefer-const': 'warn',
    'no-var': 'warn',
    
    // Async/await
    'no-async-promise-executor': 'error',
    'require-await': 'warn',
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    
    // Chrome Extension specific
    'no-global-assign': 'off', // Allow chrome.* assignments
    
    // Relaxed rules for extension development
    'no-prototype-builtins': 'warn',
    'no-useless-escape': 'warn'
  },
  globals: {
    chrome: 'readonly',
    crypto: 'readonly',
    indexedDB: 'readonly',
    IDBKeyRange: 'readonly'
  }
};

