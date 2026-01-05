# Azure Static Web Apps Deployment Guide

This guide covers deploying the ChyeapFlights OTA to Azure Static Web Apps.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed (`az --version`)
- Node.js 18+ installed
- GitHub repository access (for CI/CD)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure Static Web Apps                     │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   Frontend      │    │   API (Azure Functions)       │   │
│  │   (React/Vite)  │───▶│   (Optional - for custom      │   │
│  │                 │    │    backend logic)             │   │
│  └─────────────────┘    └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Supabase    │  │   Stripe     │  │  Amadeus     │      │
│  │  (Database)  │  │  (Payments)  │  │  (Flights)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Export Code from Lovable

1. Go to your Lovable project settings
2. Navigate to **GitHub** connector
3. Connect your GitHub account
4. Push code to a GitHub repository

## Step 2: Build the Frontend Locally (Test)

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview locally
npm run preview
```

The build output will be in the `dist/` folder.

## Step 3: Create Azure Static Web App

### Option A: Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → **Static Web App**
3. Configure:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `chyeapflights-app`
   - **Plan type**: Free (for testing) or Standard (for production)
   - **Region**: Choose closest to your users
   - **Source**: GitHub
   - **Organization**: Your GitHub org
   - **Repository**: Your repo name
   - **Branch**: `main`
4. Build Details:
   - **Build Preset**: Custom
   - **App location**: `/`
   - **Api location**: (leave empty - using Supabase edge functions)
   - **Output location**: `dist`
5. Click **Review + Create** → **Create**

### Option B: Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name chyeapflights-rg --location eastus

# Create Static Web App
az staticwebapp create \
  --name chyeapflights-app \
  --resource-group chyeapflights-rg \
  --source https://github.com/YOUR_ORG/YOUR_REPO \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

## Step 4: Configure Environment Variables

In Azure Portal → Your Static Web App → **Configuration** → **Application settings**:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | `eyJhbGci...` |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | `xxxxxxxxxxxx` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_...` |

### Backend Secrets (for Edge Functions - remain in Supabase)

These stay configured in your Supabase project secrets:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AMADEUS_API_KEY`
- `AMADEUS_API_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`
- `FX_API_KEY`

> **Note**: Backend logic (edge functions) continues to run on Supabase. Only the frontend is hosted on Azure.

## Step 5: Configure Custom Domain

1. Go to Azure Portal → Your Static Web App → **Custom domains**
2. Click **+ Add**
3. Enter your domain: `chyeapflights.com`
4. Choose validation method (CNAME or TXT)
5. Add DNS records at your registrar:

   ```
   Type: CNAME
   Name: www
   Value: <your-app>.azurestaticapps.net
   
   Type: A (for apex domain)
   Name: @
   Value: Use Azure's provided IP
   ```

6. Wait for DNS propagation (up to 48 hours)
7. Azure automatically provisions SSL certificate

## Step 6: GitHub Actions Workflow

Azure automatically creates `.github/workflows/azure-static-web-apps-<name>.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist"
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
          VITE_SUPABASE_PROJECT_ID: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### Add GitHub Secrets

In GitHub → Repository → **Settings** → **Secrets and variables** → **Actions**:

- `AZURE_STATIC_WEB_APPS_API_TOKEN` (auto-added by Azure)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Step 7: Verify Deployment

After deployment, check:

- [ ] Homepage loads correctly
- [ ] Flight search works
- [ ] Hotel search works
- [ ] Car search works
- [ ] User login/signup works
- [ ] Booking flow completes
- [ ] Admin dashboard accessible at `/admin`
- [ ] Agent dashboard accessible at `/agent-dashboard`
- [ ] No console errors
- [ ] No CORS errors

## Step 8: Update Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add new endpoint: `https://qgmhqhejoilexhgwdujl.supabase.co/functions/v1/stripe-webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`, etc.
4. Copy webhook secret and update in Supabase secrets

## Troubleshooting

### SPA Routing Issues

The `staticwebapp.config.json` handles SPA routing. If routes don't work:

1. Verify the config file is in the root directory
2. Check that `navigationFallback` is properly configured

### CORS Errors

If API calls fail with CORS:

1. Verify Supabase edge functions have CORS headers
2. Check that your Azure domain is not blocked

### Build Failures

```bash
# Check build locally first
npm run build

# Common issues:
# - TypeScript errors
# - Missing dependencies
# - Environment variables not set
```

### Environment Variables Not Loading

1. Ensure variables are prefixed with `VITE_` for frontend access
2. Redeploy after adding/changing variables
3. Check GitHub Actions logs for build-time injection

## Cost Estimation

| Service | Free Tier | Standard |
|---------|-----------|----------|
| Azure Static Web Apps | 100GB bandwidth/month | $9/app/month |
| Custom Domain | Included | Included |
| SSL Certificate | Included | Included |

Backend costs remain with Supabase (your current setup).

## Rollback Procedure

If issues occur:

1. Go to Azure Portal → Your Static Web App → **Environments**
2. Click on the problematic deployment
3. Use **Redeploy** on a previous successful deployment

Or via GitHub:

```bash
git revert HEAD
git push origin main
```

## Support Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase + Azure Integration](https://supabase.com/docs/guides/hosting/azure)
