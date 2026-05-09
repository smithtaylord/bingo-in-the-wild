# Post-Deployment TODO

> MVP is live! This is the follow-up list for cleanup, security hardening, and improvements.
> Items marked 🔴 should be done soon. Everything else can wait.

---

## 🔴 Do Soon (This Week)

### Security: Rotate MongoDB Password
- [x] Reset MongoDB Atlas admin password (see DEPLOYMENT_TODO.md for steps)
- [x] Update the password in Azure Container App env vars
- [x] Verify the app still connects after rotation

### Cost: Migrate from ACR to GitHub Container Registry — See [MIGRATE_TO_GHCR.md](MIGRATE_TO_GHCR.md)
- [ ] Create GitHub Fine-grained PAT with `read:packages` scope
- [ ] Add `GHCR_PAT` secret to GitHub repo
- [ ] Configure Container App to pull from ghcr.io
- [ ] Deploy to ghcr.io (push a change or trigger workflow)
- [ ] Set ghcr.io package to private
- [ ] Remove `ACR_USERNAME` and `ACR_PASSWORD` from GitHub secrets
- [ ] Delete ACR resource in Azure (**only after confirming ghcr.io works**)
- [ ] Verify total cost is $0/mo in Azure Cost Management

### Bug Fix: Push the auth.ts API_BASE_URL fix (Low Priority)
- [x] Commit and push the `syncUserWithBackend` fix in `frontend/src/services/auth.ts`
- [x] Verify login + user sync works on production after deploy
- **Note:** The app works fine without this fix — Auth0 auth still works, boards can be created/editied/shared. The only impact is that the `users` MongoDB collection won't have records for anyone who logged in on production. Since board data is tied to the Auth0 `sub` claim (not the user record), this is non-blocking. Push this when you push the other changes (MongoDB password rotation, .env.production cleanup).

### Remove .env.production from Git
- [ ] Add `frontend/.env.production` to `.gitignore`
- [ ] Run `git rm --cached frontend/.env.production`
- [ ] Configure VITE_* env vars as Azure SWA app settings or GitHub Actions secrets instead
- [ ] Remove `frontend/.env.production` from repo history if desired

---

## Cleanup (Can Wait)

### Git Repo Cleanup
- [ ] Delete the `docs/` folder from the repo (no longer needed for GitHub Pages)
- [ ] Remove the GitHub Pages deployment workflow if one exists
- [ ] Switch `vite.config.ts` base from `"/"` back to `"/"` (verify it's correct for Azure SWA)
- [ ] Clean up stale branches (V2, 2-10-2026, 3-22-2026, etc.)

### Backend CORS Cleanup
- [ ] Remove or update local/dev CORS origins in `backend/src/server.ts` if not needed in production
- [ ] Verify `CORS_ORIGIN` env var in Azure includes only production domains
- [ ] Delete `backend/CORS_ORIGIN` empty file (accidental, tracked as untracked)

### Frontend Cleanup
- [ ] Remove `frontend/src/views/mock-game-themes/` directory (already deleted in git, verify it's gone)
- [ ] Remove `frontend/src/views/bingo-theme-selector/` directory (already deleted in git, verify it's gone)
- [ ] Consider removing `@vitejs/plugin-legacy` from vite.config.ts (adds build size, may not be needed for Capacitor app)

---

## Security Hardening (From SECURITY_TODO.md — Low Risk for Now)

These are from the existing SECURITY_TODO.md. Since the app is private with few users, these are low priority but should be addressed before any public launch.

### Before Public Launch (Required)
- [ ] Add authentication to public board endpoints (CRITICAL in SECURITY_TODO.md)
- [ ] Fix IDOR on board copy endpoint
- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Install and configure `helmet` middleware
- [ ] Remove error objects from API responses
- [ ] Replace `Math.random()` with `crypto.randomInt()` for share codes
- [ ] Run `npm audit fix` in backend

### Nice to Have (Can Wait Indefinitely)
- [ ] Add MongoDB indexes (userId, category)
- [ ] Add pagination to list endpoints
- [ ] Add response compression middleware
- [ ] Set `trust proxy` in Express for Azure
- [ ] Configure MongoDB connection pool size
- [ ] Add graceful shutdown handlers
- [ ] Lazy load routes in Vue Router
- [ ] Add 401 error handling with token refresh

---

## Monitoring Setup — See [MONITORING.md](MONITORING.md) for full instructions

- [ ] Create Azure Cost Management budget ($1/month with 50/80/100% alerts)
- [ ] Add Application Insights with 150MB/day cap (free under 5GB/mo)
- [ ] Set up Container Apps metric alerts (request spike, replica count, vCPU)
- [ ] Set up MongoDB Atlas alerts (storage > 400MB, connections > 50)
- [ ] Test GitHub Actions kill switch and restart workflows from phone
- [ ] Install GitHub mobile app and enable workflow notifications
- [ ] Create Azure monitoring dashboard
- [ ] Add stricter rate limiting for public board endpoints (30 req/15min)
- [ ] Add per-user board limit (max 20 boards)

---

## Done ✅

- [x] Deploy backend to Azure Container Apps
- [x] Deploy frontend to Azure Static Web Apps
- [x] Configure custom domain (bingo.taylor-smith.xyz)
- [x] Configure Auth0 callback URLs
- [x] Add API_BASE_URL to all frontend fetch calls
- [x] Fix syncUserWithBackend to use API_BASE_URL