# Environment Configuration

This directory contains environment-specific configuration files for deploying ChyeapFlights to different environments.

## Directory Structure

```
config/
├── environments/
│   ├── staging.json          # Staging environment config
│   ├── production.json       # Production environment config
│   ├── .env.staging.example  # Staging env vars template
│   └── .env.production.example # Production env vars template
└── README.md                 # This file
```

## Environments

### Staging
- **Purpose**: Pre-production testing and QA
- **URL**: `https://staging.chyeap.com` (or Azure staging URL)
- **Stripe**: Test mode keys
- **Amadeus**: Test environment
- **Debug**: Enabled

### Production
- **Purpose**: Live customer-facing application
- **URL**: `https://chyeap.com`
- **Stripe**: Live mode keys
- **Amadeus**: Production environment
- **Debug**: Disabled

## Setup Instructions

### 1. Configure GitHub Secrets

For each environment, add the following secrets to your GitHub repository:

#### Staging Secrets
- `AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING`
- `VITE_SUPABASE_URL_STAGING`
- `VITE_SUPABASE_PUBLISHABLE_KEY_STAGING`
- `VITE_SUPABASE_PROJECT_ID_STAGING`

#### Production Secrets
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### 2. Configure Azure Static Web Apps

For each environment in Azure Portal:

1. Navigate to your Static Web App
2. Go to **Configuration** → **Application settings**
3. Add all required environment variables from the `.env.*.example` files

### 3. Backend Secrets (Supabase Edge Functions)

Configure these in Supabase Dashboard → Settings → Edge Functions → Secrets:

| Secret | Staging | Production |
|--------|---------|------------|
| `STRIPE_SECRET_KEY` | Test key | Live key |
| `STRIPE_WEBHOOK_SECRET` | Test webhook | Live webhook |
| `AMADEUS_API_KEY` | Test key | Live key |
| `AMADEUS_API_SECRET` | Test secret | Live secret |
| `SMTP_*` | Mailtrap | SendGrid/Production |

## Deployment

### Automatic Deployment

- **Staging**: Push to `develop` branch
- **Production**: Push to `main` branch

### Manual Deployment

```bash
# Build for staging
npm run build -- --mode staging

# Build for production
npm run build -- --mode production
```

## Security Checklist

- [ ] Never commit actual secrets to version control
- [ ] Use different API keys for staging vs production
- [ ] Stripe: Use test keys in staging, live keys in production
- [ ] Enable HTTPS enforcement in both environments
- [ ] Configure proper CORS settings per environment
- [ ] Review CSP headers before production deployment

## Feature Flags

| Flag | Staging | Production |
|------|---------|------------|
| `debugMode` | `true` | `false` |
| `analyticsEnabled` | `false` | `true` |
| `maintenanceMode` | `false` | `false` |

## Troubleshooting

### Environment Variables Not Loading
1. Verify variables are set in Azure Portal → Configuration
2. Restart the Static Web App
3. Check GitHub Actions logs for build-time variable injection

### API Connection Issues
1. Verify CORS settings in Supabase
2. Check CSP headers allow required domains
3. Confirm API base URLs are correct for the environment

### Stripe Webhook Failures
1. Verify webhook secret matches environment
2. Check webhook endpoint URL is correct
3. Review Stripe Dashboard webhook logs
