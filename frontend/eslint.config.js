import js from '@eslint/js'
import globals from 'globals'

// ESLint plugin to enforce rules of Hooks in React
import reactHooks from 'eslint-plugin-react-hooks'

// ESLint plugin that works with Vite's React Fast Refresh (hot reloading)
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    // Ignore files/folders from linting — here, ignore the 'dist' build folder
    ignores: ['dist'],
  },
  {
    // Apply these linting rules to all JavaScript/JSX files
    files: ['**/*.{js,jsx}'],

    // Language settings for parsing the files
    languageOptions: {
      // ECMAScript version to support (2020 = includes features like optional chaining)
      ecmaVersion: 2020,

      // Define browser-specific globals (window, document, etc.)
      globals: globals.browser,

      // Parser settings
      parserOptions: {
        // Support the latest ECMAScript features
        ecmaVersion: 'latest',

        // Enable JSX support for React components
        ecmaFeatures: { jsx: true },

        // Indicates you're using ES modules (import/export)
        sourceType: 'module',
      },
    },

    // Register plugins to extend ESLint functionality
    plugins: {
      'react-hooks': reactHooks,      // Enables hook-specific rules for React
      'react-refresh': reactRefresh,  // Helps with Vite React Fast Refresh
    },

    // Define custom rules or extend from recommended ones
    rules: {
      // Start with ESLint's recommended rules
      ...js.configs.recommended.rules,

      // Add React Hooks recommended rules (e.g., enforce rules of Hooks)
      ...reactHooks.configs.recommended.rules,

      // Throw an error for unused variables, but allow ignoring variables that start with an uppercase letter or underscore (like _id or MyComponent)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // Warn if you export anything from a component file other than components 
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }, // Allow exporting constants (e.g., config objects)
      ],

      // Disable prop-types enforcement (common when using TypeScript or prop validation isn't needed)
      "react/propt-types": "off",
    },
  },
]
