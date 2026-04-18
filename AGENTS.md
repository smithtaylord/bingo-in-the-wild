# AGENTS.md - Coding Agent Guidelines

## Project Overview

This is a monorepo containing:
- **frontend/**: Vue 3 + Ionic Framework + TypeScript + Vite
- **backend/**: Express.js + TypeScript + MongoDB (Mongoose) + Auth0

## Build/Lint/Test Commands

### Frontend (run from `frontend/` directory)

```bash
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Type-check (vue-tsc) then build for production
npm run lint             # Run ESLint on all files
npm run test:unit        # Run Vitest unit tests
npm run test:e2e         # Run Cypress e2e tests (requires dev server running)

# Run a single unit test file:
npm run test:unit -- path/to/test.spec.ts

# Run a single unit test with pattern:
npm run test:unit -- -t "test name pattern"

# Run Cypress e2e tests interactively:
npx cypress open
```

### Backend (run from `backend/` directory)

```bash
npm run dev              # Start dev server with nodemon (port 3000)
npm test                 # Currently not configured (placeholder only)
```

## Testing Philosophy

This is a side project - testing should be lightweight and pragmatic. Only write tests when:
- Fixing a bug (write a test to prevent regression)
- Complex business logic that's easy to get wrong
- Critical paths that must work reliably

Do NOTwrite tests for:
- Simple CRUD operations
- Straightforward UI components
- Code that's likely to change frequently

Keep token usage efficient while ensuring core functionality works.

## Code Style Guidelines

### Indentation & Formatting

- **Frontend**: 2-space indentation
- **Backend**: 4-space indentation
- Prettier is available for formatting: `npx prettier --write .`

### Import Style

Import braces on same line without spacing:

```typescript
// Preferred
import {Thing} from 'module';
import {createApp} from 'vue';

// Avoid
import { Thing } from 'module';
```

Use path alias for frontend src files:

```typescript
import HomePage from '@/views/home/HomePage.vue';
import {isLoggedIn} from '@/services/auth';
```

Group imports logically:
1. External packages (Vue, Ionic, etc.)
2. Internal modules (using `@/` alias)
3. Relative imports

### TypeScript Conventions

- Strict mode is enabled (`strict: true` in tsconfig)
- Prefer interfaces for object shapes:

```typescript
// Preferred
export interface BingoCell {
  label: string;
  isMarked?: boolean;
}

// Avoid for simple object shapes
export type BingoCell = {
  label: string;
};
```

- Use explicit types for function parameters and return types when not inferrable
- Avoid `any`; use `unknown` when type is truly unknown

### Vue Component Conventions

Use Composition API with `<script lang="ts" setup>`:

```vue
<script lang="ts" setup>
import {ref, computed} from 'vue';

const props = defineProps<{id: string}>();
const count = ref<number>(0);
</script>
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | camelCase or kebab-case | `user-service.ts`, `BingoPage.vue` |
| Vue Components | PascalCase | `HomePage.vue`, `BingoPage.vue` |
| Functions/Methods | camelCase | `checkWinner`, `getUser` |
| Classes | PascalCase | `UserService`, `BingoGameAPI` |
| Constants | SCREAMING_SNAKE_CASE | `BINGO_WINNER_POSSIBILITIES` |
| Interfaces/Types | PascalCase | `BingoCell`, `User` |
| Private class members | No prefix | `private userId` not `_userId` |

### Error Handling

Backend: Use try-catch with proper HTTP status codes:

```typescript
try {
  // operation
} catch (err) {
  console.error('Error description:', err);
  if (err instanceof Error) {
    res.status(500).json({message: err.message});
  } else {
    res.status(500).json({message: 'Internal server error'});
  }
}
```

Frontend: Use Ionic's toast/alert controllers for user-facing errors.

### File Organization

Backend structure:
```
backend/src/
├── server.ts          # Express app entry point
├── db.ts              # Database connection
├── middleware/        # Express middleware (auth, etc.)
├── user/              # Feature module
│   ├── user-model.ts
│   ├── user-service.ts
│   └── user-controller.ts
└── board/             # Feature module
    └── ...
```

Frontend structure:
```
frontend/src/
├── main.ts            # App entry point
├── App.vue            # Root component
├── router/index.ts    # Vue Router config
├── services/          # Shared services (auth, API)
├── views/             # Page components
│   ├── home/
│   ├── bingo-game/
│   └── ...
└── theme/             # CSS variables
```

## ESLint Rules

Key rules from `.eslintrc.cjs`:
- `plugin:vue/vue3-essential` + `@vue/typescript/recommended`
- `@typescript-eslint/no-explicit-any`: off
- `no-console`: warn in production
- `no-debugger`: warn in production

## Environment Variables

Frontend requires (in `.env`):
```
VITE_AUTH0_DOMAIN=...
VITE_AUTH0_CLIENT_ID=...
VITE_AUTH0_AUDIENCE=...
```

Backend requires (in `.env`):
```
MONGO_URI=...
AUTH0_DOMAIN=...
AUTH0_AUDIENCE=...
```