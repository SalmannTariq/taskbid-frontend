# TaskBid

## Why these rules live in the database

Five bidding and status rules are enforced in Postgres, not in the request handlers:

- A user cannot bid on their own task.
- A bid that would push the user over `max_capacity_hours` is rejected.
- A bid cannot be inserted after bidding is closed, or after the bid deadline.
- A task status can only move one step forward.
- One user can place only one bid on a task.

The database is the last place every write goes through. The API, a script, or a future client all hit the same trigger and the same unique index. Putting the rule only in `placeBid` would leave a direct `INSERT` able to break it. The capacity check also locks the user row inside the trigger, so two bids submitted at the same moment cannot both pass when only one of them fits.

`placeBid` still checks that the ids and hours are well formed, then inserts. Postgres raises the business-rule errors. The API turns those exception strings into 400 or 409 responses. Choosing who to assign when the deadline passes is still a query: it picks the lowest bid that currently fits. That is a decision, not a reject-on-insert rule.

## Trade-offs

The controller no longer shows the full rule. You have to read the bid-insert migration and the status trigger next to the TypeScript. Changing a rule means a new migration, which is slower than editing a function, and the API message has to stay in step with the `RAISE EXCEPTION` text. Triggers are also harder to see in a stack trace than a normal `if` in the controller. What you get back is one definition of the rule that still holds when the application code is bypassed.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
