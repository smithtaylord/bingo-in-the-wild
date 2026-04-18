  # Deployment Guide: Bingo in the Wild

> **Goal:** Deploy frontend to Azure Static Web App (free) and backend to Azure Container Apps (free tier) using Docker and GitHub Actions.
>
> **Architecture:**
> - Frontend: Azure Static Web App → bingo.taylor-smith.xyz
> - Backend: Azure Container Apps (Docker) → bingo-api.azurecontainerapps.io
> - Database: MongoDB Atlas (existing)
> - Auth: Auth0 (existing)

---

## Cost Overview

| Service | Cost | Notes |
|---------|------|-------|
| Azure Static Web App | **FREE** | 100GB bandwidth, custom domains included |
| Azure Container Apps | **FREE** | 2M requests/month, 2GB memory, 1 vCPU |
| Azure Container Registry | **~$5/mo** | Basic tier (covered by $200 free credit) |
| MongoDB Atlas | **FREE** | Existing (512MB, shared cluster) |
| Auth0 | **FREE** | Existing (7,000 MAU) |
| **Total** | **~$5/mo** | **FREE for first 15 months with Azure credit!** |

---

## Table of Contents

1. [Prerequisites & Setup](#phase-1-prerequisites--setup)
2. [Docker Fundamentals](#phase-2-docker-fundamentals)
3. [Containerize the Backend](#phase-3-containerize-the-backend)
4. [Azure Account & Resources](#phase-4-azure-account--resources)
5. [Deploy Backend to Azure Container Apps](#phase-5-deploy-backend-to-azure-container-apps)
6. [Deploy Frontend to Azure Static Web App](#phase-6-deploy-frontend-to-azure-static-web-app)
7. [Custom Domain Setup](#phase-7-custom-domain-setup)
8. [GitHub Actions CI/CD](#phase-8-github-actions-ci-cd)
9. [Testing & Verification](#phase-9-testing--verification)
10. [Troubleshooting](#troubleshooting)

---

## Phase 1: Prerequisites & Setup

### 1.1 Install Required Tools

- [ ] **Docker Desktop** - Container runtime
  - Download: https://www.docker.com/products/docker-desktop
  - After install, verify: `docker --version`
  - Expected output: `Docker version 24.x.x` or higher

- [ ] **Azure CLI** - Command-line tool for Azure
  - Download: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
  - After install, verify: `az --version`
  - Expected output: List of Azure CLI modules

- [ ] **Install Azure Container Apps extension:**
  ```bash
  az extension add --name containerapp
  az extension add --name containerapp
  ```

- [ ] **Git** - Version control (you likely have this)
  - Verify: `git --version`

### 1.2 Create Accounts

- [ ] **Azure Account** (with free credit)
  - Go to: https://azure.microsoft.com/free/
  - Sign up with your Microsoft account
  - You'll receive:
    - $200 credit for first 30 days
    - 12 months of free services
  - **Important:** Don't create any resources yet!

- [ ] **Docker Hub Account** (optional, for storing images)
  - Go to: https://hub.docker.com/
  - Create free account
  - This is where we'll push images (alternative to Azure Container Registry)

### 1.3 Understand the Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│   User's Browser                                                 │
│   https://bingo.taylor-smith.xyz                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Loads HTML/JS/CSS
             ▼
┌─────────────────────────────────────────────────────────────────┐
│   Azure Static Web App (Free Tier)                              │
│   - Hosts frontend static files                                 │
│   - Serves Vue/Ionic app                                         │
│   - Custom domain with SSL                                       │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ API calls to backend
             ▼
┌─────────────────────────────────────────────────────────────────┐
│   Azure Container Apps (Free Tier)                              │
│   https://bingo-api.azurecontainerapps.io                        │
│   - Runs Express.js backend in Docker                            │
│   - Serverless (scales to zero when idle)                        │
│   - Handles authentication validation                            │
│   - Processes game logic                                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Database queries
             ▼
┌─────────────────────────────────────────────────────────────────┐
│   MongoDB Atlas (Free Tier - Existing)                          │
│   - Stores bingo boards                                          │
│   - Stores user data                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 What is Azure Container Apps?

**Azure Container Apps** is a serverless container platform - think of it as "Azure Functions but for Docker containers."

**Key benefits:**
- **Serverless:** Scales automatically, including to zero (no idle costs!)
- **Free tier:** 2 million requests/month, 2GB memory, 1 vCPU
- **Docker-based:** Use any container
- **Simple:** Easier than managing Kubernetes

**Comparison:**
| Feature | App Service B1 | Container Apps |
|---------|----------------|----------------|
| Cost | ~$13/mo | FREE (up to limits) |
| Idle costs | Always running | Scales to zero |
| Docker support | Yes | Yes (native) |
| Custom domain | Included | Included |
| Scaling | Manual | Automatic |

---

## Phase 2: Docker Fundamentals

### 2.1 What is Docker?

**Think of Docker like this:**

- **Traditional deployment:** "It works on my machine" → Different Node versions, different OS, different libraries
- **Docker deployment:** "It works everywhere" → Exact same environment packaged in a container

**Analogy:**
- **Container** = A shipping container (standardized, portable, self-contained)
- **Image** = The blueprint for the container (like a recipe)
- **Dockerfile** = Instructions to build the image (like the recipe card)
- **Registry** = Where images are stored (like a warehouse)

### 2.2 Key Docker Commands

Create a file `docker/notes.md` in your project and document these commands:

```bash
# Build an image from Dockerfile
docker build -t my-app:latest .

# Run a container from an image
docker run -p 3000:3000 my-app:latest

# List running containers
docker ps

# List all images
docker images

# Stop a container
docker stop <container-id>

# View container logs
docker logs <container-id>

# Remove a container
docker rm <container-id>

# Remove an image
docker rmi my-app:latest
```

### 2.3 Dockerfile Structure

A Dockerfile has this basic structure:

```dockerfile
# 1. Choose a base image (the OS + runtime)
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy dependency files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy application code
COPY . .

# 6. Define the command to run
CMD ["npm", "start"]
```

**Key concepts:**
- Each `RUN` command creates a new "layer" (cached for speed)
- Order matters: put frequently changing files last
- `.dockerignore` file excludes unnecessary files (like `.git`)

### 2.4 Practice: Run a Simple Container

- [ ] Test Docker is working:
  ```bash
  docker run hello-world
  ```
  Expected: Downloads and runs a test container, prints "Hello from Docker!"

- [ ] Run a Node container interactively:
  ```bash
  docker run -it node:18-alpine sh
  ```
  This opens a shell inside the container. Type `exit` to leave.

---

## Phase 3: Containerize the Backend

### 3.1 Create .dockerignore

Create `backend/.dockerignore`:

```gitignore
# What to exclude from the Docker build context
node_modules
npm-debug.log
dist
.env
.env.local
.git
.gitignore
*.md
.DS_Store
coverage
.nyc_output
```

**Why?** This reduces build time and image size by excluding unnecessary files.

- [ ] Create `backend/.dockerignore` with the content above

### 3.2 Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Stage 1: Build the TypeScript code
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
```

**Understanding the Dockerfile:**

1. **Multi-stage build:** We use two stages:
   - `builder`: Has all tools needed to compile TypeScript
   - Production: Only has what's needed to run the app

2. **Why multi-stage?** The final image is smaller (no TypeScript compiler, no dev dependencies)

3. **Layer caching:** By copying `package*.json` separately, Docker caches the `npm ci` step if dependencies don't change

- [ ] Create `backend/Dockerfile` with the content above

### 3.3 Build and Test Locally

- [ ] Build the Docker image:
  ```bash
  cd backend
  docker build -t bingo-backend:latest .
  ```
  Expected: Builds successfully, ends with "Successfully tagged bingo-backend:latest"

- [ ] Run the container locally:
  ```bash
  docker run -p 3000:3000 \
    -e MONGO_URI="your-mongodb-uri" \
    -e AUTH0_DOMAIN="your-auth0-domain" \
    -e AUTH0_AUDIENCE="your-auth0-audience" \
    -e CORS_ORIGIN="http://localhost:5173" \
    bingo-backend:latest
  ```
  Replace the environment variables with your actual values.

- [ ] Test the running container:
  ```bash
  curl http://localhost:3000/api/board
  ```
  Expected: Returns JSON array of bingo boards

- [ ] Stop the container:
  ```bash
  docker ps  # Find the container ID
  docker stop <container-id>
  ```

### 3.4 Update Backend CORS Configuration

The backend needs to accept requests from your frontend domain.

- [ ] Update `backend/src/server.ts` CORS configuration:

```typescript
// Find the cors configuration and update it:
app.use(cors({
    origin: [
        'http://localhost:5173',      // Local development (Vite)
        'http://localhost:8100',      // Ionic dev server
        'http://localhost:3000',      // Local backend (if testing)
        'https://bingo.taylor-smith.xyz',  // Production frontend
        'https://bingo-in-the-wild.github.io', // GitHub Pages (if used)
    ].concat(process.env.CORS_ORIGIN?.split(',') || []),
    credentials: true,
}));
```

**Note:** The `.concat()` allows adding more origins via environment variable.

---

## Phase 4: Azure Account & Resources

### 4.1 Login to Azure

- [ ] Login via CLI:
  ```bash
  az login
  ```
  This opens a browser for authentication.

- [ ] Set your default subscription:
  ```bash
  az account list --output table
  ```
  Note the subscription ID.

  ```bash
  az account set --subscription "<your-subscription-id>"
  ```

### 4.2 Create Resource Group

A resource group is a logical container for all your Azure resources.

- [ ] Create resource group:
  ```bash
  az group create \
    --name bingo-game-rg \
    --location centralus
  ```
  **Why centralus?** Good middle-ground for Boise, Minneapolis, and East Coast users.

- [ ] Verify creation:
  ```bash
  az group show --name bingo-game-rg
  ```

### 4.3 Create Azure Container Registry (ACR)

ACR stores your Docker images securely.

- [ ] Create ACR:
  ```bash
  az acr create \
    --resource-group bingo-game-rg \
    --name bingogameregistry \
    --sku Basic \
    --admin-enabled true
  ```
  **Note:** The name must be globally unique. If `bingogameregistry` is taken, try `bingogame<your-initials>registry`.

- [ ] Get ACR login credentials:
  ```bash
  az acr credential show --name bingogameregistry
  ```
  Save the `username` and `password` for later.

- [ ] Login to ACR:
  ```bash
  az acr login --name bingogameregistry
  ```

### 4.4 Create Container Apps Environment

The Container Apps Environment is a logical grouping for your container apps.

- [ ] Register the Container Apps provider (if not already done):
  ```bash
  az provider register --namespace Microsoft.App
  ```

- [ ] Create the Container Apps environment:
  ```bash
  az containerapp env create \
    --name bingo-game-env \
    --resource-group bingo-game-rg \
    --location centralus
  ```

**Understanding the environment:**
- All container apps in the same environment share the same network
- Free tier includes 1 environment
- Environments are regional (choose same region as your users)

---

## Phase 5: Deploy Backend to Azure Container Apps

### 5.1 Tag and Push Docker Image to ACR

- [ ] Tag your local image for ACR:
  ```bash
  docker tag bingo-backend:latest bingogameregistry.azurecr.io/bingo-backend:latest
  ```

- [ ] Push the image to ACR:
  ```bash
  docker push bingogameregistry.azurecr.io/bingo-backend:latest
  ```
  Expected: Uploads layers, ends with "latest: digest: sha256:..."

### 5.2 Create the Container App

- [ ] Create the container app:
  ```bash
  az containerapp create \
    --name bingo-api \
    --resource-group bingo-game-rg \
    --environment bingo-game-env \
    --image bingogameregistry.azurecr.io/bingo-backend:latest \
    --registry-server bingogameregistry.azurecr.io \
    --registry-username <acr-username> \
    --registry-password <acr-password> \
    --target-port 3000 \
    --ingress external \
    --env-vars \
      "MONGO_URI=<your-mongodb-uri>" \
      "AUTH0_DOMAIN=<your-auth0-domain>" \
      "AUTH0_AUDIENCE=<your-auth0-audience>" \
      "CORS_ORIGIN=https://bingo.taylor-smith.xyz,http://localhost:5173" \
      "NODE_ENV=production"
  ```
  Replace all `<...>` values with your actual credentials.

**Understanding the command:**
- `--ingress external`: Makes the app publicly accessible
- `--target-port 3000`: The port your app listens on
- `--env-vars`: Environment variables passed to the container

### 5.3 Get the Container App URL

- [ ] Get your app's URL:
  ```bash
  az containerapp show \
    --name bingo-api \
    --resource-group bingo-game-rg \
    --query properties.configuration.ingress.fqdn \
    --output tsv
  ```
  Expected output: `bingo-api.<random-id>.centralus.azurecontainerapps.io`

### 5.4 Test the Deployed Backend

- [ ] Test the health endpoint:
  ```bash
  curl https://bingo-api.<random-id>.centralus.azurecontainerapps.io/
  ```
  Expected: "Public route is working!"

- [ ] Test the API:
  ```bash
  curl https://bingo-api.<random-id>.centralus.azurecontainerapps.io/api/board
  ```
  Expected: JSON array of bingo boards

- [ ] Check logs if there are issues:
  ```bash
  az containerapp logs show \
    --name bingo-api \
    --resource-group bingo-game-rg \
    --follow
  ```

### 5.5 Understanding Container Apps Scaling

Container Apps automatically scales based on traffic:

```
┌─────────────────────────────────────────────────────────────────┐
│   Request comes in                                               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│   Is there an active replica?                                    │
│   ├─ YES → Route to existing replica                             │
│   └─ NO  → Start a new replica (cold start, ~5-10 seconds)       │
└─────────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│   After period of inactivity (configurable)                       │
│   → Scale to zero (no cost!)                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Free tier limits:**
- 2 million requests/month
- 180,000 vCPU-seconds/month
- 90,000 GiB-seconds/month
- 1 million requests/month for scale-to-zero

**For your use case (10-20 users):** You'll likely use < 100,000 requests/month - well within free tier!

---

## Phase 6: Deploy Frontend to Azure Static Web App

### 6.1 Install Azure Static Web Apps CLI (Optional but helpful)

- [ ] Install SWA CLI:
  ```bash
  npm install -g @azure/static-web-apps-cli
  ```

### 6.2 Create Static Web App via Azure Portal

- [ ] Go to Azure Portal: https://portal.azure.com
- [ ] Search for "Static Web Apps" and click "Create"
- [ ] Fill in the form:
  - **Resource Group:** bingo-game-rg
  - **Name:** bingo-frontend
  - **Region:** Central US
  - **Deployment Source:** GitHub
  - **GitHub Account:** Authorize and select your repository
  - **Repository:** Select your bingo-in-the-wild repo
  - **Branch:** main
  - **Build Presets:** Custom
  - **App location:** /frontend
  - **Api location:** Leave empty (we have separate backend)
  - **Output location:** dist
- [ ] Click "Review + create" then "Create"

### 6.3 Configure Frontend Environment Variables

The frontend needs to know the backend API URL.

- [ ] Create `frontend/.env.production`:
  ```bash
  VITE_API_URL=https://bingo-api.<random-id>.centralus.azurecontainerapps.io
  VITE_AUTH0_DOMAIN=your-auth0-domain
  VITE_AUTH0_CLIENT_ID=your-auth0-client-id
  VITE_AUTH0_AUDIENCE=your-auth0-audience
  ```

- [ ] Update your API service to use the environment variable:

  In `frontend/src/views/start-game-modal/BingoBoardAPI.ts`, find all `fetch()` calls and update them:

  ```typescript
  // At the top of the file, add:
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  // Update all fetch calls from:
  const response = await fetch('api/board');

  // To:
  const response = await fetch(`${API_BASE_URL}/api/board`);
  ```

  Do this for all API endpoints in the file.

- [ ] Also update `frontend/src/views/bingo-game/bingoGameAPI.ts`:
  ```typescript
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  // Update:
  const response = await fetch(`api/board/${id}`);
  // To:
  const response = await fetch(`${API_BASE_URL}/api/board/${id}`);
  ```

### 6.4 Update Auth0 Configuration

- [ ] Go to Auth0 Dashboard: https://manage.auth0.com
- [ ] Navigate to your Application → Settings
- [ ] Update these fields:

  **Allowed Callback URLs:**
  ```
  http://localhost:5173/callback,
  http://localhost:8100/callback,
  https://bingo.taylor-smith.xyz/callback,
  https://<your-static-web-app-name>.azurestaticapps.net/callback
  ```

  **Allowed Web Origins:**
  ```
  http://localhost:5173,
  http://localhost:8100,
  https://bingo.taylor-smith.xyz,
  https://<your-static-web-app-name>.azurestaticapps.net
  ```

  **Allowed Logout URLs:**
  ```
  http://localhost:5173,
  http://localhost:8100,
  https://bingo.taylor-smith.xyz,
  https://<your-static-web-app-name>.azurestaticapps.net
  ```

- [ ] Click "Save Changes"

### 6.5 Trigger Deployment

- [ ] The Static Web App will automatically deploy when you push to GitHub
- [ ] Push your changes:
  ```bash
  git add .
  git commit -m "Configure frontend for Azure deployment"
  git push origin main
  ```

- [ ] Monitor deployment in Azure Portal → Static Web Apps → bingo-frontend → Deployments

---

## Phase 7: Custom Domain Setup

### 7.1 Add Custom Domain to Static Web App

- [ ] Go to Azure Portal → Static Web Apps → bingo-frontend
- [ ] Click "Custom domains" in the left menu
- [ ] Click "Add"
- [ ] Enter: `bingo.taylor-smith.xyz`
- [ ] Choose "CNAME" validation method

### 7.2 Configure DNS

- [ ] Go to your DNS provider (where you bought the domain)
- [ ] Add a CNAME record:
  - **Name/Host:** `bingo`
  - **Target/Points to:** `<your-static-web-app-name>.azurestaticapps.net`
  - **TTL:** 3600 (or default)

- [ ] Wait for DNS propagation (can take up to 48 hours, usually 5-30 minutes)
- [ ] Verify DNS:
  ```bash
  nslookup bingo.taylor-smith.xyz
  ```
  Expected: Returns Azure Static Web Apps IP or CNAME

### 7.3 Validate Domain in Azure

- [ ] Go back to Azure Portal → Static Web Apps → Custom domains
- [ ] Click "Validate" next to your domain
- [ ] Once validated, SSL certificate is automatically provisioned (free!)

### 7.4 Add Custom Domain to Backend API (Optional)

If you want `bingo-api.taylor-smith.xyz` instead of the Azure default:

- [ ] Go to Azure Portal → Container Apps → bingo-api
- [ ] Click "Custom domains" → "Add"
- [ ] Add your custom domain
- [ ] Update DNS with CNAME record pointing to your container app

---

## Phase 8: GitHub Actions CI/CD

### 8.1 Understanding GitHub Actions

GitHub Actions automates your deployment pipeline:

```
Push to GitHub → GitHub Actions builds & tests → Deploys to Azure
```

**Key concepts:**
- **Workflow:** Automated process (defined in YAML)
- **Job:** A set of steps executed on a runner
- **Step:** Individual task (run commands, use actions)
- **Action:** Reusable unit of work
- **Runner:** Server that executes jobs (GitHub-hosted or self-hosted)

### 8.2 Create Backend Deployment Workflow

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Azure Container Apps

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch:

env:
  CONTAINER_APP_NAME: bingo-api
  ACR_NAME: bingogameregistry
  IMAGE_NAME: bingo-backend
  RESOURCE_GROUP: bingo-game-rg

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Login to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Login to ACR
      uses: azure/docker-login@v1
      with:
        login-server: ${{ env.ACR_NAME }}.azurecr.io
        username: ${{ secrets.ACR_USERNAME }}
        password: ${{ secrets.ACR_PASSWORD }}

    - name: Build and push Docker image
      run: |
        cd backend
        docker build -t ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }} .
        docker push ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
        docker tag ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }} ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:latest
        docker push ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:latest

    - name: Deploy to Azure Container Apps
      uses: azure/CLI@v1
      with:
        inlineScript: |
          az containerapp update \
            --name ${{ env.CONTAINER_APP_NAME }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

**Understanding the workflow:**

1. **Triggers:** Runs on push to main branch (only when backend files change) or manually
2. **Environment variables:** Define reusable values
3. **Steps:**
   - Checkout: Gets your code
   - Login to Azure: Authenticates with Azure
   - Login to ACR: Authenticates with container registry
   - Build and push: Creates Docker image and pushes to ACR
   - Deploy: Updates the container app to use the new image

- [ ] Create `.github/workflows/deploy-backend.yml` with the content above

### 8.3 Create Frontend Deployment Workflow

Azure Static Web Apps automatically creates a workflow, but let's customize it.

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend to Azure Static Web Apps

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json

    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci

    - name: Build
      working-directory: ./frontend
      run: npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        VITE_AUTH0_DOMAIN: ${{ secrets.AUTH0_DOMAIN }}
        VITE_AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
        VITE_AUTH0_AUDIENCE: ${{ secrets.AUTH0_AUDIENCE }}

    - name: Deploy to Static Web App
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "frontend/dist"
        skip_app_build: true
```

- [ ] Create `.github/workflows/deploy-frontend.yml` with the content above

### 8.4 Add GitHub Secrets

You need to add secrets to your GitHub repository for the workflows to work.

- [ ] Go to your GitHub repository → Settings → Secrets and variables → Actions
- [ ] Click "New repository secret" for each of these:

  **Azure Credentials:**
  - Name: `AZURE_CREDENTIALS`
  - Value: Create a service principal:
    ```bash
    az ad sp create-for-rbac \
      --name "bingo-game-github-actions" \
      --role contributor \
      --scopes /subscriptions/<your-subscription-id>/resourceGroups/bingo-game-rg \
      --sdk-auth
    ```
    Copy the entire JSON output as the value.

  **ACR Credentials:**
  - Name: `ACR_USERNAME`
  - Value: Get from `az acr credential show --name bingogameregistry`

  - Name: `ACR_PASSWORD`
  - Value: Get from `az acr credential show --name bingogameregistry`

  **Auth0 Secrets:**
  - Name: `AUTH0_DOMAIN`
  - Value: Your Auth0 domain

  - Name: `AUTH0_CLIENT_ID`
  - Value: Your Auth0 client ID

  - Name: `AUTH0_AUDIENCE`
  - Value: Your Auth0 audience

  **API URL:**
  - Name: `VITE_API_URL`
  - Value: `https://bingo-api.<random-id>.centralus.azurecontainerapps.io`

  **Azure Static Web Apps Token:**
  - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
  - Value: Get from Azure Portal → Static Web Apps → bingo-frontend → Manage deployment token

### 8.5 Test the Workflows

- [ ] Make a small change to the backend:
  ```bash
  echo "# Test" >> backend/README.md
  git add .
  git commit -m "Test backend deployment"
  git push
  ```

- [ ] Go to GitHub → Actions tab to see the workflow running

- [ ] Make a small change to the frontend:
  ```bash
  echo "// Test" >> frontend/src/main.ts
  git add .
  git commit -m "Test frontend deployment"
  git push
  ```

- [ ] Monitor the workflow in GitHub Actions

---

## Phase 9: Testing & Verification

### 9.1 Test the Complete Flow

- [ ] **Test frontend loads:**
  - Visit: https://bingo.taylor-smith.xyz
  - Expected: App loads, shows home page

- [ ] **Test public boards:**
  - Click on Sports/Social/Location tabs
  - Expected: Boards load from backend

- [ ] **Test authentication:**
  - Click "Log In"
  - Expected: Redirects to Auth0 login
  - After login: Returns to app, shows "My Games" tab

- [ ] **Test game creation:**
  - Create a new board
  - Expected: Board saves to MongoDB

- [ ] **Test game play:**
  - Start a game
  - Mark some cells
  - Expected: Game state persists

- [ ] **Test share code:**
  - Generate a share code
  - Open in incognito window
  - Expected: Game loads with shared board

### 9.2 Test Performance

- [ ] **Test from different locations:**
  - Use a tool like https://www.webpagetest.org/
  - Test from Boise, Minneapolis, East Coast
  - Expected: Reasonable load times (< 3 seconds)

- [ ] **Test concurrent users:**
  - Have 2-3 friends play simultaneously
  - Expected: No errors, smooth gameplay

- [ ] **Test cold start:**
  - Wait 10-15 minutes (for container to scale to zero)
  - Make a request
  - Expected: First request takes 5-10 seconds (cold start), subsequent requests are fast

### 9.3 Monitor Logs

- [ ] **Backend logs:**
  ```bash
  az containerapp logs show \
    --name bingo-api \
    --resource-group bingo-game-rg \
    --follow
  ```

- [ ] **Frontend logs:**
  - Azure Portal → Static Web Apps → bingo-frontend → Functions (if any)
  - Browser console (F12)

---

## Phase 10: Documentation & Maintenance

### 10.1 Document Your Setup

- [ ] Create a `docs/deployment.md` file documenting:
  - Architecture diagram
  - Environment variables needed
  - How to deploy updates
  - Common issues and solutions

### 10.2 Set Up Monitoring

- [ ] Enable Application Insights (optional, may incur costs):
  ```bash
  az monitor app-insights component create \
    --app bingo-game-insights \
    --location centralus \
    --resource-group bingo-game-rg
  ```

### 10.3 Set Up Alerts

- [ ] Create an alert for when your app is down:
  - Azure Portal → Monitor → Alerts → Create
  - Condition: "Availability test failed"
  - Action: Send email

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Docker build fails

**Symptoms:** `npm ci` fails, "package-lock.json not found"

**Solution:**
```bash
# Make sure package-lock.json exists
cd backend
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
```

#### Issue: Container won't start

**Symptoms:** "Container failed to start" in Azure logs

**Solution:**
1. Check environment variables are set correctly
2. Check the port is correct (should be 3000)
3. Check logs:
   ```bash
   az containerapp logs show --name bingo-api --resource-group bingo-game-rg --follow
   ```

#### Issue: Cold start takes too long

**Symptoms:** First request takes > 30 seconds

**Solution:**
1. This is normal for serverless containers (5-10 seconds)
2. If too slow, consider using `--min-replicas 1` (but this costs more)
3. Or use Azure App Service B1 instead (always running)

#### Issue: CORS errors

**Symptoms:** Browser console shows "CORS policy" errors

**Solution:**
1. Verify CORS_ORIGIN environment variable includes your frontend domain
2. Check backend CORS configuration includes the domain
3. Restart the container app after changes:
   ```bash
   az containerapp revision restart --name bingo-api --resource-group bingo-game-rg
   ```

#### Issue: Auth0 login fails

**Symptoms:** "Callback URL mismatch" error

**Solution:**
1. Verify callback URLs in Auth0 dashboard
2. Make sure the URL matches exactly (including http/https)
3. Check that VITE_AUTH0_* environment variables are correct

#### Issue: MongoDB connection fails

**Symptoms:** "Connection timeout" or "Authentication failed"

**Solution:**
1. Check MongoDB Atlas IP whitelist (add Azure outbound IPs or 0.0.0.0/0 for testing)
2. Verify connection string is correct
3. Check MongoDB Atlas cluster is running

#### Issue: Frontend can't reach backend

**Symptoms:** Network errors in browser console

**Solution:**
1. Verify VITE_API_URL is set correctly
2. Check backend is running:
   ```bash
   curl https://bingo-api.<random-id>.centralus.azurecontainerapps.io/
   ```
3. Check CORS configuration

#### Issue: GitHub Actions fails

**Symptoms:** Workflow shows red X in GitHub Actions

**Solution:**
1. Click the failed workflow to see logs
2. Check that all secrets are set correctly
3. Verify Azure credentials are valid

#### Issue: Free tier limits exceeded

**Symptoms:** App stops responding, Azure shows quota exceeded

**Solution:**
1. Check usage in Azure Portal → Cost Management
2. Container Apps free tier: 2M requests/month
3. If exceeded, consider upgrading or optimizing

---

## Quick Reference Commands

```bash
# View backend logs
az containerapp logs show --name bingo-api --resource-group bingo-game-rg --follow

# Restart backend
az containerapp revision restart --name bingo-api --resource-group bingo-game-rg

# Update environment variables
az containerapp update \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --set-env-vars KEY=VALUE

# Get app URL
az containerapp show \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv

# View all resources
az resource list --resource-group bingo-game-rg --output table

# Delete everything (CAREFUL!)
az group delete --name bingo-game-rg
```

---

## Cost Monitoring

- [ ] Set up Azure Cost Management alerts:
  - Azure Portal → Cost Management + Billing → Cost Management → Budgets
  - Create a budget for $10/month
  - Set alert at 50%, 80%, 100%

- [ ] Monitor your free credit:
  - Azure Portal → Cost Management + Billing → Subscriptions
  - View remaining credit

- [ ] Monitor Container Apps usage:
  - Azure Portal → Container Apps → bingo-api → Metrics
  - Watch for request count, replica count

---

## Next Steps After Deployment

1. **Mobile App Development:**
   - Add Capacitor for native mobile builds
   - Test on iOS/Android devices
   - Prepare for App Store submission

2. **Performance Optimization:**
   - Add caching (Redis)
   - Implement CDN for static assets
   - Optimize database queries

3. **Security Hardening:**
   - Review MongoDB Atlas security settings
   - Implement rate limiting
   - Add input validation

4. **Feature Development:**
   - Add more game modes
   - Implement leaderboards
   - Add social features

---

## Resources for Learning

- **Docker:** https://docs.docker.com/get-started/
- **Azure Container Apps:** https://docs.microsoft.com/en-us/azure/container-apps/
- **Azure Static Web Apps:** https://docs.microsoft.com/en-us/azure/static-web-apps/
- **GitHub Actions:** https://docs.github.com/en/actions
- **Capacitor:** https://capacitorjs.com/docs

---

## Checklist Summary

### Phase 1: Prerequisites
- [ ] Install Docker Desktop
- [ ] Install Azure CLI
- [ ] Install Container Apps extension
- [ ] Create Azure account
- [ ] Create Docker Hub account (optional)

### Phase 2: Docker Fundamentals
- [ ] Understand Docker concepts
- [ ] Learn key Docker commands
- [ ] Practice running containers

### Phase 3: Containerize Backend
- [ ] Create .dockerignore
- [ ] Create Dockerfile
- [ ] Build and test locally

### Phase 4: Azure Setup
- [ ] Login to Azure CLI
- [ ] Create resource group
- [ ] Create ACR
- [ ] Create Container Apps environment

### Phase 5: Deploy Backend
- [ ] Push image to ACR
- [ ] Create container app
- [ ] Set environment variables
- [ ] Test deployed backend

### Phase 6: Deploy Frontend
- [ ] Create Static Web App
- [ ] Configure environment variables
- [ ] Update Auth0 settings
- [ ] Trigger deployment

### Phase 7: Custom Domain
- [ ] Add custom domain to Static Web App
- [ ] Configure DNS
- [ ] Validate domain
- [ ] Verify SSL certificate

### Phase 8: GitHub Actions
- [ ] Create backend workflow
- [ ] Create frontend workflow
- [ ] Add GitHub secrets
- [ ] Test workflows

### Phase 9: Testing
- [ ] Test complete flow
- [ ] Test performance
- [ ] Test cold start
- [ ] Monitor logs

### Phase 10: Maintenance
- [ ] Document setup
- [ ] Set up monitoring
- [ ] Set up alerts

---

## Security: Rotate Your MongoDB Password

If you exposed your MongoDB password in commands or logs during deployment, follow these steps to rotate it:

### 1. Reset Password in MongoDB Atlas
1. Log in to MongoDB Atlas: https://cloud.mongodb.com
2. Go to **Database** → **Deployments** → **Database Access**
3. Find your `admin` user (or the user you used for `MONGO_URI`)
4. Click **Edit** → **Reset Password**
5. Generate a new random password (use a password generator, 20+ characters)
6. Copy the new password

### 2. Update Azure Container App Environment Variable
```bash
az containerapp update \
  --name bingo-api \
  --resource-group bingo-game-rg \
  --set-env-vars 'MONGO_URI=mongodb+srv://admin:<new-password>@cluster.mongodb.net/bingoapp?retryWrites=true&w=majority'
```

### 3. Update GitHub Secrets (if stored)
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Find `MONGO_URI` (if you added it as a secret)
3. Update it with the new password

### 4. Verify the Connection
```bash
curl https://bingo-api.<your-id>.centralus.azurecontainerapps.io/api/board
```
Expected: Returns JSON array (not an error)

---

**Congratulations!** Once you complete this guide, you'll have:
- ✅ A fully deployed application on Azure (FREE!)
- ✅ Docker containerization skills
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Custom domain with SSL
- ✅ Understanding of serverless containers
- ✅ Foundation for mobile app development

**Estimated Time:** 4-6 hours (spread across multiple sessions)

**Questions?** Refer to the Troubleshooting section or Azure documentation.
