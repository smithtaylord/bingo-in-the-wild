# Monitoring & Cost Protection Guide

> **Goal:** Keep your Azure deployment free, get alerted before costs spiral, and have an emergency kill switch you can trigger from your phone.
>
> **Current monthly cost target: $0** (ACR is ~$5/mo but covered by Azure free credit)

---

## Your Free Tier Limits

| Service | Free Allowance | What Happens When Exceeded |
|---------|---------------|---------------------------|
| Azure Static Web App | 100GB bandwidth, unlimited requests | Site stops serving (404s) |
| Azure Container Apps | 2M requests/mo, 180K vCPU-sec, 90K GiB-sec | App returns 503, no overage charges |
| GitHub Container Registry | Unlimited private packages | Rate limited on pulls (generous) |
| MongoDB Atlas | 512MB storage, shared cluster | Writes start failing |
| Auth0 | 7,000 MAU | Login failures for new users |
| Application Insights | 5GB log ingestion/mo | Daily cap stops logging (no overage) |
| GitHub Actions | 2,000 min/mo (free tier) | Workflows stop running |

---

## Potential Cost Attacks & Protections

### Attack Vectors (ranked by risk)

#### 1. Request Flooding on Public Endpoints (HIGH RISK)

Someone writes a script to loop `GET /api/board`, `GET /api/board/:id`, or `GET /api/board/code/:code`. These endpoints require **no authentication**.

**Current protection:**
- Rate limiting: 100 requests per 15 minutes per IP on all `/api` routes
- This limits a single IP to ~9,600 requests/day (~288K/month)

**Remaining risk:**
- Attacker rotates IPs (VPNs, botnets) = each IP gets 9,600/day
- 210 IPs hitting simultaneously = 2M requests in ~1 day

**Mitigations to add:**
- [ ] Add authentication to public board endpoints (CRITICAL - see SECURITY_TODO.md)
- [ ] Add stricter rate limit on unauthenticated endpoints (reduce to 30 req/15min per IP)
- [ ] Add a global request count alert (Section 3 below)
- [ ] Consider adding `express-slow-down` to progressively delay responses from abusive IPs

#### 2. MongoDB Storage Exhaustion (MEDIUM RISK)

Spam accounts creating boards with 100 items each. Auth0 free tier limits MAU, but someone could create dummy accounts.

**Current protection:**
- Auth0 requires email verification (depending on your settings)
- Rate limiting on POST endpoints (behind auth)

**Remaining risk:**
- Someone creates many Auth0 accounts programmatically
- Each account creates boards at max capacity (100 items x ~50 chars = ~5KB each)
- 512MB / 5KB = ~100K boards to fill MongoDB

**Mitigations to add:**
- [ ] Add Auth0 rate limiting in the Auth0 dashboard (7,000 MAU hard cap exists)
- [ ] Add a MongoDB Atlas alert when storage exceeds 400MB
- [ ] Consider adding a per-user board limit in the backend (e.g., max 20 boards per user)

#### 3. Cold Start Abuse (LOW RISK)

Sending requests just often enough to keep the container running but not enough to trigger rate limits. Burns vCPU-seconds.

**Impact:** Minimal. At 9,600 req/day, even if each request takes 0.5 vCPU-sec = 4,800 vCPU-sec/day = 144K vCPU-sec/month. Still under 180K limit.

**Mitigation:**
- [ ] Alert when vCPU-seconds exceed 4,000/day (Section 3)

#### 4. Share Code Enumeration (LOW RISK)

Brute-forcing 6-char share codes on `GET /api/board/code/:code`. Character set is ~30 chars, so 30^6 = ~729M combinations. With rate limiting (9,600/day/IP), this is extremely slow.

**Current protection:**
- Rate limiting
- Codes expire after 24 hours
- Only returns board data (no user info)

**Mitigation:**
- [ ] Consider adding a specific rate limit on share code lookups (10 req/15min per IP)
- [ ] Codes already expire after 24 hours (implemented)

#### 5. Large Response Abuse (LOW RISK)

Repeatedly requesting `GET /api/board?limit=100` to get maximum-size responses. With compression enabled, this uses less bandwidth than it seems.

**Current protection:**
- `compression()` middleware enabled
- JSON body size limited to 100KB
- Pagination exists (default limit applied by backend)

**Mitigation:**
- [ ] Reduce default page size if needed (currently unspecified)
- [ ] Monitor Static Web App bandwidth in Azure Portal

---

## Section 1: Azure Cost Management Budget & Alerts

### 1.1 Create a Budget Alert

Since all your services are now on free tiers (after migrating from ACR to ghcr.io — see MIGRATE_TO_GHCR.md), any spending is unexpected. Set the budget to $1 so you're alerted the moment anything costs money.

```bash
# Set your subscription ID
SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Create a budget at $1/month with alerts
az consumption budget create \
  --name bingo-monthly-budget \
  --amount 1 \
  --time-grain Monthly \
  --start-date $(date -u +"%Y-%m-01") \
  --end-date $(date -u -d "+12 months" +"%Y-%m-01") \
  --resource-groups bingo-game-rg \
  --notifications \
    key1="Actual_GreaterThan_0.50_Percent_50" \
    key2="Actual_GreaterThan_0.80_Percent_80" \
    key3="Actual_GreaterThan_1.00_Percent_100"
```

> **Note:** If `az consumption budget` doesn't work, use the Azure Portal method below.

### 1.2 Portal Method (if CLI doesn't work)

1. Go to **Azure Portal** → **Cost Management + Billing** → **Cost Management** → **Budgets**
2. Click **+ Create**
3. Set:
   - **Name:** `bingo-monthly-budget`
   - **Amount:** `$1.00`
   - **Time grain:** Monthly
   - **Reset period:** Monthly
4. Under **Alert conditions**, add:
   - **Alert 1:** Actual > 50% ($0.50) → Email you
   - **Alert 2:** Actual > 80% ($0.80) → Email you
   - **Alert 3:** Actual > 100% ($1.00) → Email you + trigger kill switch (Section 5)
5. Under **Alert recipients**, enter your email
6. Click **Create**

### 1.3 Monitor Free Credit

- Azure Portal → **Cost Management + Billing** → **Subscriptions**
- View remaining free credit (starts at $200 for first 30 days)
- After free credit period, only ACR (~$5/mo) should generate cost

---

## Section 2: Application Insights with Daily Cap

### 2.1 Create Application Insights

```bash
# Create App Insights resource
az monitor app-insights component create \
  --app bingo-game-insights \
  --location centralus \
  --resource-group bingo-game-rg \
  --kind web \
  --application-type web
```

### 2.2 Get the Connection String

```bash
az monitor app-insights component show \
  --app bingo-game-insights \
  --resource-group bingo-game-rg \
  --query connectionString \
  --output tsv
```

### 2.3 Set Daily Cap (IMPORTANT - prevents overage charges)

**Portal method:**
1. Azure Portal → **Application Insights** → **bingo-game-insights**
2. Click **Usage and estimated costs** in the left menu
3. Click **Daily cap**
4. Set to **150 MB/day** (~4.5GB/month, safely under 5GB free)
5. Click **Save**

**What happens when the daily cap is reached:**
- Log ingestion STOPS automatically (no overage charges possible)
- Existing logs remain queryable
- Metric collection continues (alerts for failures/slow responses still work)
- Logs resume the next day when the cap resets

### 2.4 Add Application Insights to Container App

```bash
# Get the connection string
CONNECTION_STRING=$(az monitor app-insights component show \
  --app bingo-game-insights \
  --resource-group bingo-game-rg \
  --query connectionString \
  --output tsv)

# Update the container app with App Insights
az containerapp update \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --set-env-vars "APPLICATIONINSIGHTS_CONNECTION_STRING=$CONNECTION_STRING"
```

### 2.5 Install App Insights SDK in Backend

```bash
cd backend
npm install applicationinsights
```

Add to `backend/src/server.ts` at the **very top** (before any other imports):

```typescript
import applicationinsights from 'applicationinsights';
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    applicationinsights
        .setup()
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setSendLiveMetrics(false)
        .start();
}
```

### 2.6 Create Alert Rules in App Insights

**Portal method (easiest):**
1. Azure Portal → **Monitor** → **Alerts** → **+ Create** → **Alert rule**
2. Set scope to `bingo-game-insights`

**Alert 1: Failed Requests**
- **Condition:** Custom log search → `requests | where success == false | summarize count()`
- **Threshold:** Count > 5 in 5 minutes
- **Action:** Email you

**Alert 2: Slow Response Time**
- **Condition:** Custom log search → `requests | where duration > 5000 | summarize count()`
- **Threshold:** Count > 3 in 5 minutes
- **Action:** Email you

**Alert 3: Exception Spike**
- **Condition:** Custom log search → `exceptions | summarize count()`
- **Threshold:** Count > 5 in 5 minutes
- **Action:** Email you

> **NOTE:** These alerts use the Application Insights daily cap-protected log data. If the daily cap is hit, alerts stop firing for that day but you also stop paying for logs.

---

## Section 3: Container Apps Metric Alerts

These are FREE alerts based on Azure Monitor metrics (not log-based, so they always work regardless of App Insights caps).

### 3.1 Create Alert Rules via Portal

1. Azure Portal → **Monitor** → **Alerts** → **+ Create** → **Alert rule**
2. Set scope to `bingo-api` (Container App)

**Alert 1: Request Count Spike**
- **Signal:** Total Requests
- **Condition:** Greater than 50,000 over 1 day
- **Action:** Email you
- **Why:** At 50K/day, you're on pace for 1.5M/month (75% of free tier). Gives you 2+ weeks to react.
- **Note:** 50,000 is a safe threshold. Normal usage with 10-20 users would be < 5,000/day.

**Alert 2: Replica Count Spike**
- **Signal:** Replicas
- **Condition:** Greater than 3 sustained for 15 minutes
- **Action:** Email you
- **Why:** Your app should rarely need more than 1 replica. 3+ sustained replicas = unusual traffic.

**Alert 3: vCPU-seconds Daily Accumulation**
- **Signal:** CPU Usage (total)
- **Condition:** Greater than 4,000 vCPU-seconds in 1 day
- **Action:** Email you
- **Why:** 4,000 vCPU-sec/day = ~120K vCPU-sec/month. At 180K limit, this gives you a month of buffer.

### 3.2 Using Azure CLI for Alerts (Alternative)

```bash
# Create action group (email notifications)
az monitor action-group create \
  --name bingo-alerts \
  --resource-group bingo-game-rg \
  --short-name bingoalerts \
  --email-receiver name=you email_address=your-email@example.com

# Create metric alert for request count
az monitor metrics-alert create \
  --name "bingo-request-spike" \
  --resource-group bingo-game-rg \
  --scopes $(az containerapp show --name bingo-api --resource-group bingo-game-rg --query id --output tsv) \
  --condition "TOTAL_REQUESTS > 50000" \
  --window-size 1d \
  --evaluation-frequency 1h \
  --action-groups $(az monitor action-group show --name bingo-alerts --resource-group bingo-game-rg --query id --output tsv)
```

---

## Section 4: MongoDB Atlas Alerts

MongoDB Atlas has built-in alerting on its free tier.

### 4.1 Set Up Atlas Alerts

1. Log in to **MongoDB Atlas** → **Your Project** → **Alerts** in the left menu
2. Click **+ Add Alert**

**Alert 1: Disk Storage Approaching Limit**
- **Condition:** Disk space used > 400MB (of 512MB free)
- **Notification:** Email
- **Why:** Gives you time to clean up before writes start failing

**Alert 2: Connection Count Spike**
- **Condition:** Connections > 50 concurrent
- **Why:** Free cluster allows 500 connections. A spike could indicate an attack.

**Alert 3: Oplog Window**
- **Condition:** Oplog window < 1 hour
- **Why:** Sign of heavy write load, unusual for a small app

### 4.2 Atlas Free Tier Monitoring

- Go to **MongoDB Atlas** → **Metrics** tab
- Check weekly for: Document count, Data size, Connection count
- Free cluster provides basic metrics with 24-hour granularity

---

## Section 5: Emergency Kill Switch (GitHub Actions)

This is your "pull the plug" button. If something is wrong and you're away from your computer, you can shut down your entire backend from your phone.

### 5.1 How the Kill Switch Works

```
You (phone) ──► GitHub Actions ──► Azure CLI ──► Scales Container App to 0 replicas
                                                      │
                                                      ▼
                                               All API traffic gets 503 errors
                                               No compute charges
                                               No request processing
```

### 5.2 Triggering the Kill Switch

The workflow is at `.github/workflows/emergency-kill-switch.yml`.

**From your phone:**
1. Open the **GitHub** app (iOS/Android)
2. Navigate to your `bingo-in-the-wild` repository
3. Tap the **Actions** tab (lightning bolt icon)
4. Tap **"Emergency - Kill Switch"**
5. Tap **"Run workflow"** → **"Run workflow"** button
6. Confirm when prompted

**From your computer:**
1. Go to your repo → **Actions** tab → **Emergency - Kill Switch** in the left sidebar
2. Click **"Run workflow"** → **"Run workflow"** button

### 5.3 Restarting the Backend

The workflow is at `.github/workflows/emergency-restart.yml`.

**From your phone:**
1. Same steps as above, but select **"Emergency - Restart Backend"**
2. Tap **"Run workflow"**
3. The workflow also runs a health check after restarting

**From your computer:**
1. Go to your repo → **Actions** tab → **Emergency - Restart Backend**
2. Click **"Run workflow"**

### 5.4 What Happens When You Kill the Backend

| Component | Status After Kill Switch |
|-----------|--------------------------|
| Both components | **OFFLINE** (Container App scaled to 0) |
| Frontend (Static Web App) | **Still running** (static HTML, no cost) |
| Users visiting the site | **See the app but API calls fail** |
| MongoDB Atlas | **Unaffected** (not accessible externally) |
| GitHub Container Registry | **Unaffected** (just stores the image, always free) |
| Auth0 | **Unaffected** (still running) |

**When you re-enable:**
- First request has a cold start (~5-10 seconds)
- Everything returns to normal state
- No data loss, no config changes

### 5.5 Prerequisites

The kill switch and restart workflows require the same `AZURE_CREDENTIALS` secret that your deploy workflow uses. You should already have this set up from deployment. If not, see **DEPLOYMENT_TODO.md** Section 8.4.

Verify the secret exists:
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Confirm `AZURE_CREDENTIALS` exists with the correct value

---

## Section 6: Setting Up GitHub Mobile App

### 6.1 Install the App

1. **iOS:** Download "GitHub" from the App Store
2. **Android:** Download "GitHub" from Google Play Store
3. Sign in with your GitHub account

### 6.2 Enable Push Notifications

1. Open the GitHub app → **Profile** → **Settings** → **Notifications**
2. Enable **Push notifications**
3. Under **Customize**, turn on:
   - **Workflow runs** (for kill switch confirmations)
   - **Actions** (for deployment notifications)

### 6.3 Add Quick Access to Your Repo

1. Open the GitHub app
2. Search for `bingo-in-the-wild`
3. Tap the **★** (star) to add it to favorites
4. On the home screen, it will now appear under "Starred"

### 6.4 Practice Using the Kill Switch

1. Open the GitHub app
2. Go to **bingo-in-the-wild** → **Actions** tab
3. Find **"Emergency - Kill Switch"** in the left sidebar
4. Tap **"Run workflow"**
5. Watch the workflow run (takes ~1-2 minutes)
6. Verify your API is down: visit `https://bingo-api.<your-id>.azurecontainerapps.io/` — should return 503
7. Now run **"Emergency - Restart Backend"**
8. Wait 30-60 seconds, then verify API is back up

### 6.5 Create a Homescreen Shortcut (iOS)

1. Open Safari → go to `github.com/your-username/bingo-in-the-wild/actions`
2. Tap the **Share** button → **Add to Home Screen**
3. Name it "Bingo Kill Switch"
4. This gives you one-tap access to the Actions page

### 6.6 Create a Homescreen Shortcut (Android)

1. Open Chrome → go to `github.com/your-username/bingo-in-the-wild/actions`
2. Tap the **⋮** menu → **Add to Home screen**
3. Name it "Bingo Actions"

---

## Section 7: Security Hardening for Cost Protection

### 7.1 Add Authentication to Public Endpoints (CRITICAL)

This is already flagged in your `SECURITY_TODO.md` but it's the #1 thing you can do to protect against cost attacks.

Endpoints currently without authentication:
- `GET /api/board` — List all public boards
- `GET /api/board/:id` — Get any board by ID
- `GET /api/board/code/:code` — Look up share codes

**Recommended approach:**
1. Add optional auth (don't reject unauthenticated users, but track them differently)
2. Apply stricter rate limiting to unauthenticated requests
3. Log IP addresses for anomaly detection via App Insights

### 7.2 Add Stricter Rate Limiting for Unauthenticated Endpoints

Current general rate limit is 100 req/15min. For public endpoints, consider:

```typescript
// Add to server.ts after the general limiter
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {message: 'Too many requests from this IP, please try again later'},
});
app.use('/api/board', publicLimiter);  // Stricter for public board endpoints
```

This stacks with the general limiter, so public endpoints get 30 req/15min while authenticated endpoints keep 100 req/15min.

### 7.3 Add Per-User Board Limits

Prevent database exhaustion by limiting boards per user:

```typescript
// In board.service.ts, before creating a board
const existingBoardCount = await BingoBoard.countDocuments({ userId });
if (existingBoardCount >= 20) {
    throw new Error('Maximum number of boards reached (20)');
}
```

### 7.4 Add Share Code Rate Limiting

Prevent brute-forcing of share codes:

```typescript
const shareCodeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {message: 'Too many share code lookups, please try again later'},
});
app.use('/api/board/code', shareCodeLimiter);
```

---

## Section 8: Monitoring Dashboard Setup

### 8.1 Create an Azure Dashboard

1. Azure Portal → **Dashboard** → **+ New dashboard**
2. Add these tiles (drag from the tile gallery):

| Tile | Metric | Resource |
|------|--------|----------|
| Requests (Line chart) | Total Requests | bingo-api |
| CPU Usage (Line chart) | CPU Usage | bingo-api |
| Memory Usage (Line chart) | Memory Usage | bingo-api |
| Replica Count (Line chart) | Replicas | bingo-api |
| Cost (Number) | Actual Cost | bingo-game-rg |
| Failed Requests (Number) | Failed Requests | bingo-game-insights |

3. Save as **"Bingo Game - Operations Dashboard"**

### 8.2 Weekly Check List

- [ ] Check Azure cost management dashboard (should be ~$5/mo for ACR only)
- [ ] Verify Container Apps request count (should be well under 2M)
- [ ] Check Application Insights for exceptions (should be 0 or very few)
- [ ] Verify MongoDB Atlas storage (should be well under 400MB)
- [ ] Check Auth0 dashboard for unusual MAU patterns
- [ ] Review GitHub Actions for any unexpected workflow runs

---

## Section 9: Alert Response Playbook

### If you receive a budget alert (spending > $0.50):

1. **Check what's causing it:** Azure Portal → Cost Management → Cost Analysis
2. **Look for:** Unexpected resource creation, data transfer costs, or any non-free-tier usage
3. **Verify ACR is deleted** — if you see ACR charges, it wasn't fully removed (see MIGRATE_TO_GHCR.md)
4. **Most likely cause with $0 expected spend:** Someone created a new resource, or a paid tier was accidentally selected

### If you receive a request spike alert (> 50K requests/day):

1. **Don't panic** — could be legitimate traffic
2. **Check App Insights:** Are requests coming from many different IPs or a few?
3. **Check response codes:** Are they 200s (normal) or 429s (rate limited)?
4. **Check the client IPs:** Azure Portal → App Insights → Logs → run:
   ```
   requests
   | summarize count() by client_IP
   | order by count_ desc
   | limit 20
   ```
5. **If it looks like an attack:** Run the **Emergency - Kill Switch** workflow from your phone
6. **After killing the backend:** Investigate, add IP blocks if needed, then restart

### If you receive a replica spike alert (> 3 replicas sustained):

1. **Check App Insights:** What endpoints are being hit?
2. **Look at request patterns:** Is it one endpoint or many?
3. **If attack-like:** Kill switch, investigate, restart when ready
4. **If legitimate traffic:** Consider whether you need to adjust your app's scaling

### If MongoDB Atlas sends a storage alert (> 400MB):

1. **Check data size:** MongoDB Atlas → Metrics → Data Size
2. **Look for spam boards:** Check document count and largest documents
3. **Clean up:** Delete obvious spam if found
4. **Consider:** Adding per-user board limits (Section 7.3)

### If the kill switch was triggered (by you or automatically):

1. **Investigate the cause** before restarting
2. **Check logs:** App Insights → Logs → run:
   ```
   requests
   | where timestamp > ago(1h)
   | summarize count() by client_IP, resultCode
   | order by count_ desc
   ```
3. **Fix the issue** (add IP blocks, fix a bug, etc.)
4. **Restart:** Run the **Emergency - Restart Backend** workflow
5. **Monitor:** Watch requests for the next hour to confirm the issue is resolved

---

## Section 10: Quick Reference Commands

```bash
# KILL SWITCH: Scale backend to zero (emergency)
az containerapp update \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --min-replicas 0 \
  --max-replicas 0

# RESTART: Scale backend back up
az containerapp update \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --min-replicas 0 \
  --max-replicas 3

# Check current replica count
az containerapp show \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --query properties.template.scale \
  --output json

# View backend logs (follow mode)
az containerapp logs show \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --follow

# Check current costs
az consumption usage list \
  --resource-group bingo-game-rg \
  --top 10

# View Application Insights logs
az monitor app-insights component show \
  --app bingo-game-insights \
  --resource-group bingo-game-rg
```

---

## Checklist Summary

### Cost Alerts
- [ ] Create Azure Cost Management budget ($1/mo with 50/80/100% alerts)
- [ ] Confirm email notifications are working

### Application Insights
- [ ] Create App Insights resource
- [ ] Set daily cap to 150MB/day
- [ ] Add connection string to Container App env vars
- [ ] Install `applicationinsights` npm package
- [ ] Add SDK initialization to `server.ts`
- [ ] Create alert rules (failed requests, slow responses, exceptions)

### Container Apps Alerts
- [ ] Create action group for email notifications
- [ ] Alert: Request count > 50,000/day
- [ ] Alert: Replica count > 3 sustained
- [ ] Alert: vCPU-seconds > 4,000/day

### MongoDB Atlas
- [ ] Alert: Disk storage > 400MB
- [ ] Alert: Connection count > 50

### Kill Switch Setup
- [ ] Verify `AZURE_CREDENTIALS` secret exists in GitHub
- [ ] Test kill switch workflow (takes backend offline)
- [ ] Test restart workflow (brings backend back online)
- [ ] Install GitHub mobile app
- [ ] Enable push notifications for workflow runs
- [ ] Practice kill/restart from phone

### Security Hardening
- [ ] Add authentication to public board endpoints
- [ ] Add stricter rate limiting for public endpoints (30 req/15min)
- [ ] Add share code rate limiting (10 req/15min)
- [ ] Add per-user board limit (max 20)
- [ ] Run `npm audit fix` in backend

### Dashboard
- [ ] Create Azure Dashboard with key metrics
- [ ] Bookmark dashboard for weekly review