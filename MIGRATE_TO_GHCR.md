# Migrate from Azure Container Registry to GitHub Container Registry

> **Goal:** Eliminate the ~$5/mo ACR charge by switching to GitHub Container Registry (ghcr.io), which is free for private repositories. This brings your total monthly Azure cost to **$0**.

---

## How the Change Works

```
BEFORE (with ACR):                         AFTER (with ghcr.io):
                                           
  GitHub Actions                           GitHub Actions
      │                                        │
      ▼                                        ▼
  Build Docker image                       Build Docker image
      │                                        │
      ▼                                        ▼
  Push to bingogameregistry.azurecr.io     Push to ghcr.io/owner/bingo-backend
      │                                        │
      ▼                                        ▼
  ACR stores the image                     GitHub Packages stores the image
  (~$5/mo)                                 (FREE - unlimited private packages)
      │                                        │
      ▼                                        ▼
  Container App pulls from ACR             Container App pulls from ghcr.io
  (fast - same Azure network)              (slightly slower cold start, then cached)
```

**Cold start impact:** ~2-5 seconds slower on the first pull only. After that, the image is cached on the node and subsequent starts are the same speed.

---

## Step 1: Create a GitHub Personal Access Token (PAT)

Container Apps needs credentials to pull private images from ghcr.io. You'll create a PAT with `read:packages` scope.

1. Go to **GitHub.com** → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Click **Generate new token**
3. Fill in:
   - **Token name:** `bingo-api-container-pull`
   - **Expiration:** 90 days (you'll need to rotate this — set a calendar reminder)
   - **Repository access:** Select **Only select repositories** → choose `bingo-in-the-wild`
   - **Permissions** → **Packages** → Set to **Read-only**
4. Click **Generate token**
5. **Copy the token value** (you won't see it again)
6. Save it somewhere secure (like a password manager) — you'll need it in Steps 2 and 3

> **Why Fine-grained instead of Classic?** Fine-grained tokens are scoped to specific repos and have limited permissions, so if compromised, the blast radius is minimal.

> ** PAT Rotation:** Fine-grained PATs can last up to 1 year. Set a calendar reminder for 30 days before expiration to rotate it. When you rotate, repeat Steps 2 and 3 with the new token.

---

## Step 2: Add the PAT as a GitHub Actions Secret

1. Go to your **bingo-in-the-wild** repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GHCR_PAT`
4. Value: Paste the PAT you copied in Step 1
5. Click **Add secret**
6. Verify it appears in your secrets list

> **Note:** The `GITHUB_TOKEN` is already available automatically in GitHub Actions and is used for pushing images. The PAT is only needed if you want your Container App to pull private images. If you make the package public (Step 4, Option B), you don't need this PAT at all.

---

## Step 3: Configure Container App to Pull from ghcr.io

Run these commands in your terminal (you need Azure CLI installed and logged in):

### Option A: Private package (recommended — more secure)

```bash
# Log in to Azure
az login

# Add ghcr.io as a registry for your Container App
az containerapp registry set \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --server ghcr.io \
  --username <YOUR_GITHUB_USERNAME> \
  --password <YOUR_PAT_FROM_STEP_1>

# Verify the registry was added
az containerapp show \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --query properties.configuration.registries

# Test by pulling and running the current image from ghcr.io
# (this only works after Step 5 — first deployment to ghcr.io)
```

### Option B: Public package (simpler — no PAT needed)

If you make your ghcr.io package public, you can skip the registry credential step entirely. Your Docker image contains no secrets (they're in environment variables), so a public image is safe.

```bash
# No registry credentials needed for public images!
# Just update the Container App image reference after first deployment
```

---

## Step 4: Update the GitHub Actions Workflow

**This step is already done!** The file `.github/workflows/deploy-backend.yml` has been updated to push to ghcr.io instead of ACR.

What changed:
- Removed `ACR_NAME` environment variable
- Replaced `azure/docker-login` with `docker/login-action` for ghcr.io
- Changed image tags from `acr-name.azurecr.io/image` to `ghcr.io/owner/image`
- Added `permissions: packages: write` for GitHub Package Registry access
- Uses `GITHUB_TOKEN` (automatic) instead of `ACR_USERNAME`/`ACR_PASSWORD` secrets

---

## Step 5: Deploy to ghcr.io for the First Time

You need to trigger a deployment to push the image to ghcr.io before you can switch the Container App.

1. Make a small change to the backend (or just trigger the workflow manually):
   ```bash
   # Option A: Make a trivial change and push
   cd backend
   echo "# ghcr.io migration" >> README.md
   git add .
   git commit -m "Migrate from ACR to ghcr.io"
   git push origin master

   # Option B: Trigger manually from GitHub
   # Go to Actions tab → "Deploy Backend to Azure Container Apps" → "Run workflow"
   ```

2. Watch the workflow in GitHub Actions to make sure it completes successfully
3. If it fails, check the logs — the most common issue is the `packages:write` permission

### If the deployment fails with a permissions error:

Go to your repo → **Settings** → **Actions** → **General** → scroll to **Workflow permissions**:
- Make sure **Read and write permissions** is selected
- Check **Allow GitHub Actions to create and approve pull requests** if needed

---

## Step 6: Make the ghcr.io Package Private (Option A only)

If you chose Option A (private package):

1. Go to **GitHub.com** → **Packages** (in your profile)
2. Find the `bingo-backend` package
3. Click on it → **Package settings**
4. Under **Danger Zone** → **Change visibility** → select **Private**
5. Confirm

If you chose Option B (public package), skip this step.

---

## Step 7: Remove ACR Secrets from GitHub

You no longer need ACR credentials as GitHub Actions secrets:

1. Go to repo → **Settings** → **Secrets and variables** → **Actions**
2. Find these secrets and delete them:
   - `ACR_USERNAME`
   - `ACR_PASSWORD`
3. Keep `AZURE_CREDENTIALS` (still needed for deploying to Container Apps)

---

## Step 8: Delete Azure Container Registry

**Only do this AFTER confirming the ghcr.io deployment is working!**

### 8.1 Verify the Container App is running from ghcr.io

```bash
# Check which image the Container App is using
az containerapp show \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --query properties.template.containers[0].image \
  --output tsv
```

Expected output should start with `ghcr.io/` — NOT `bingogameregistry.azurecr.io/`

### 8.2 Test the API is still working

```bash
# Get the API URL
API_URL=$(az containerapp show \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

# Test it
curl "https://$API_URL/"
```

Expected: "Public route is working!" or similar response

### 8.3 Verify in Azure Portal

1. Go to **Azure Portal** → **Container Apps** → **bingo-api**
2. Click **Revisions and replicas** in the left menu
3. Verify the active revision is pulling from `ghcr.io`
4. Click **Containers** → verify the image URL starts with `ghcr.io`

### 8.4 Delete the ACR resource

**Only after confirming everything works:**

```bash
# Delete the Azure Container Registry
az acr delete \
  --name bingogameregistry \
  --resource-group bingo-game-rg \
  --yes

# Verify it's gone
az acr list --resource-group bingo-game-rg --output table
```

Expected: Empty output (no registries listed)

### 8.5 Verify in Azure Portal

1. Go to **Azure Portal** → **Resource groups** → **bingo-game-rg**
2. Verify `bingogameregistry` is no longer listed
3. Check **Cost Management** to confirm ACR charges will stop

---

## Step 9: Verify Your Monthly Cost is $0

After deleting ACR, your only Azure resources should be:

```bash
# List all resources in your resource group
az resource list --resource-group bingo-game-rg --output table
```

Expected output:
| Name | Type |
|------|------|
| bingo-api | Microsoft.App/containerApps |
| bingo-game-env | Microsoft.App/managedEnvironments |
| bingo-frontend | Microsoft.Web/staticSites |
| (bingo-game-insights - after App Insights setup) | Microsoft.Insights/components |

**No ACR resource should remain.**

### Check Cost Management

1. Go to **Azure Portal** → **Cost Management + Billing** → **Cost Analysis**
2. Set the time range to the current month
3. Filter by resource group `bingo-game-rg`
4. Verify: ACR charges should show as $0 (or stop accumulating after deletion)
5. Your only projected cost should be **$0/mo** (all free-tier services)

---

## Troubleshooting

### Workflow fails with "denied: permission_denied"

- Go to repo → **Settings** → **Actions** → **General** → **Workflow permissions**
- Make sure **Read and write permissions** is selected
- Try re-running the workflow

### Container App can't pull from ghcr.io

- Verify the registry credentials were set correctly (Step 3)
- Make sure the PAT has `read:packages` scope
- Check that the package visibility matches (private needs credentials, public doesn't)
- Try manually setting the image:
  ```bash
  az containerapp update \
    --name bingo-api \
    --resource-group bingo-game-rg \
    --image ghcr.io/<your-username>/bingo-backend:latest
  ```

### ghcr.io package not showing up

- Packages are created on the first push
- Check your GitHub profile → **Packages** tab
- Make sure the workflow completed successfully

### Cold starts are too slow

- First cold start from ghcr.io may be 5-12 seconds (vs 5-10 from ACR)
- Subsequent starts are the same speed (image is cached)
- If cold starts are unacceptable, you can set `--min-replicas 1` but this uses compute resources (still free tier though):
  ```bash
  az containerapp update \
    --name bingo-api \
    --resource-group bingo-game-rg \
    --min-replicas 1
  ```

---

## After Migration — Your New Cost Breakdown

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Azure Static Web App | **$0** | Free tier (100GB bandwidth) |
| Azure Container Apps | **$0** | Free tier (2M requests/mo) |
| GitHub Container Registry | **$0** | Free for private repos |
| Application Insights | **$0** | Free tier (5GB/mo with daily cap) |
| Azure Monitor alerts | **$0** | Free tier |
| MongoDB Atlas | **$0** | Free tier (512MB) |
| Auth0 | **$0** | Free tier (7,000 MAU) |
| GitHub Actions | **$0** | Free tier (2,000 min/mo) |
| **TOTAL** | **$0/mo** | After ACR is deleted |

**${{\bf \color{green} You\ just\ eliminated\ your\ only\ recurring\ cost!}}$**

---

## Checklist Summary

- [ ] Step 1: Create GitHub Fine-grained PAT with `read:packages` scope
- [ ] Step 2: Add `GHCR_PAT` secret to GitHub repo (or skip if using public packages)
- [ ] Step 3: Configure Container App registry credentials (or skip if public)
- [ ] Step 4: Workflow already updated — review `.github/workflows/deploy-backend.yml`
- [ ] Step 5: Deploy to ghcr.io (push a change or trigger manually)
- [ ] Step 6: Set ghcr.io package to private (if Option A)
- [ ] Step 7: Remove `ACR_USERNAME` and `ACR_PASSWORD` from GitHub secrets
- [ ] Step 8: Delete ACR resource in Azure (**only after confirming ghcr.io works**)
- [ ] Step 9: Verify cost is $0 in Azure Cost Management