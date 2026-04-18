# Bingo in the Wild - Security & Performance TODO

> Living checklist for security vulnerabilities and performance issues identified during audit.
> Check off items as they are addressed.

---

## CRITICAL (Fix Before Deploying)

### Authentication & Authorization
- [ ] **Add authentication to public board endpoints**
  - `GET /api/board` (board.routes.ts:9-16)
  - `GET /api/board/user/:userId` (board.routes.ts:18-25)
  - `GET /api/board/:id` (board.routes.ts:27-38)
  - Only boards shared via share codes should be publicly accessible

- [ ] **Fix IDOR on board copy endpoint**
  - `POST /api/board/:id/copy` allows copying any user's private board
  - Should verify ownership before allowing copy

- [ ] **Add rate limiting with `express-rate-limit`**
  - Critical for: `POST /api/user/login`
  - General limit for all API routes (e.g., 100 req/min per IP)

### Security Headers & Error Handling
- [ ] **Install and configure `helmet` middleware**
  - Add to `backend/src/server.ts`
  - Sets CSP, X-Content-Type-Options, X-Frame-Options, HSTS, etc.

- [ ] **Remove error objects from API responses**
  - `board.routes.ts:14-15` — remove `error` from response
  - `board.routes.ts:23-24` — remove `error` from response
  - `board.routes.ts:35-36` — remove `error` from response
  - `share-code.routes.ts:16-17` — remove `error` from response
  - `user-controller.ts` — sanitize `err.message` before sending

### Database Performance
- [ ] **Add MongoDB indexes to BingoBoard schema**
  - Index on `userId` for user's board queries
  - Index on `category` for filtered public board queries
  - Compound index on `{_id, userId}` for share code generation

- [ ] **Add pagination to list endpoints**
  - `GET /api/board` — add `limit`, `skip`, `page` params
  - `GET /api/board/user/:userId` — add `limit`, `skip` params

---

## HIGH

### Cryptography & Tokens
- [ ] **Replace `Math.random()` with `crypto.randomInt()` for share codes**
  - `backend/src/board/utils/share-code.util.ts:10`
  - Use a cryptographically secure PRNG

### Performance Optimizations
- [ ] **Add response compression middleware**
  - Install `compression` package
  - Add to `backend/src/server.ts`

- [ ] **Add field selection (`.select()`) to queries**
  - List endpoints should only return needed fields, not full documents
  - Avoid returning `items` array for list views

- [ ] **Implement route-level code splitting (lazy loading)**
  - `frontend/src/router/index.ts` — change to dynamic imports
  ```typescript
  component: () => import("@/views/home/HomePage.vue")
  ```

### Dependency Security
- [ ] **Run `npm audit fix` in backend**
  - Fix 8 vulnerable dependencies:
    - `jws` (CVE — improperly verifies HMAC signature)
    - `path-to-regexp` (DoS via sequential optional groups)
    - `minimatch` (ReDoS)
    - `picomatch` (ReDoS)
    - `body-parser` (DoS when URL encoding)
    - `brace-expansion` (memory exhaustion)
    - `qs` (DoS via arrayLimit bypass)
    - `diff` (DoS in parsePatch)

### Concurrency
- [ ] **Fix share code race condition**
  - Check-then-save pattern in `share-code.util.ts` + `share-code.service.ts`
  - Use atomic upsert or handle duplicate key error gracefully

---

## MEDIUM

### Input Validation
- [ ] **Add comprehensive input validation for board creation/update**
  - `backend/src/board/middleware/board.validation.ts`
  - Max length for `name` (e.g., 100 chars)
  - Upper bound for `items` array (e.g., max 100 items)
  - Validate individual `items` are non-empty strings
  - Validate `freeSpace` and `category` fields

- [ ] **Use JWT email claim instead of request body**
  - `backend/src/user/user-controller.ts:12`
  - Extract `email` from decoded JWT, not `req.body`

### CORS & Proxies
- [ ] **Validate CORS_ORIGIN environment variable**
  - Ensure production explicitly sets the frontend domain
  - Consider an allowlist approach if multiple origins needed

- [ ] **Configure `trust proxy` setting**
  - Add `app.set('trust proxy', 1)` to `backend/src/server.ts`
  - Required for correct `req.ip` behind reverse proxy

### Frontend Performance
- [ ] **Remove deep watcher on board state**
  - `frontend/src/views/bingo-game/BingoPage.vue:338-344`
  - Call `checkWinner()` directly in `toggleCell()` instead

- [ ] **Add category filtering to API, remove client-side filtering**
  - `frontend/src/views/start-game-modal/StartGameModal.vue:279-288`
  - Backend should support `?category=sports` filtering

- [ ] **Add 401 error handling with token refresh**
  - Handle expired tokens in API calls
  - Redirect to login or auto-refresh token

### Caching
- [ ] **Add HTTP caching headers**
  - `Cache-Control` for public board listings
  - ETags for board resources

- [ ] **Consider short-lived caching for share code lookups**
  - Share code data changes infrequently

### Database Connection
- [ ] **Configure explicit connection pool size**
  - `backend/src/db.ts` — add `maxPoolSize` option
  - Consider 10-20 for small app

---

## LOW

### Code Quality
- [ ] **Remove unused `express-jwt` dependency**
  - `backend/package.json`
  - App uses `express-oauth2-jwt-bearer` instead

- [ ] **Deduplicate shuffle function**
  - `frontend/src/views/bingo-game/bingoGameAPI.ts:4-11`
  - Import from shared `frontend/src/views/common/functions/shuffle.ts`

- [ ] **Lazy load JSConfetti**
  - `frontend/src/views/bingo-game/BingoPage.vue:126`
  - Only instantiate when user wins

### Server Configuration
- [ ] **Add graceful shutdown handlers**
  - `backend/src/server.ts`
  - Handle `SIGTERM`/`SIGINT` to close DB connections

- [ ] **Add explicit request body size limit**
  - `express.json({ limit: '100kb' })` — already default, make explicit

- [ ] **Remove unused asset**
  - `frontend/public/monstera.png` (~47KB) — verify not used, remove if unnecessary

- [ ] **Consider removing `@vitejs/plugin-legacy`**
  - `frontend/vite.config.ts:11`
  - Capacitor app may not need legacy browser bundle

### Security (Low Priority)
- [ ] **Validate localStorage data on parse**
  - `frontend/src/views/bingo-game/bingoGameService.ts:119`
  - Add type/shape validation after `JSON.parse()`

- [ ] **Audit Auth0 SDK version**
  - Update `@auth0/auth0-spa-js` if newer version available

- [ ] **Move share code expiry check to MongoDB query**
  - `backend/src/board/services/share-code.service.ts:34-44`
  - Use `$or` with `$gt` filter instead of app-level check

---

## NOTES

### Secrets Management
- [ ] **Rotate MongoDB credentials** that were in `.env` file
  - The credentials in `backend/.env` may have been exposed
  - Rotate password immediately for production

### Environment Variables (Production)
Ensure these are set in production:
```
# Backend
MONGO_URI=<secret>
AUTH0_DOMAIN=<public>
AUTH0_AUDIENCE=<public>
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend (these are intentionally public)
VITE_AUTH0_DOMAIN=<public>
VITE_AUTH0_CLIENT_ID=<public>
VITE_AUTH0_AUDIENCE=<public>
```

---

## QUICK WINS (Can fix in ~30 min each)

1. `npm audit fix` in backend — fixes 8 vulnerable packages
2. Add `helmet` to backend — one line in server.ts
3. Remove `error` from 4 catch blocks in board routes
4. Change router to lazy-loaded dynamic imports
5. Remove deep watcher, call checkWinner in toggleCell
6. Add `trust proxy` and `compression` to Express
