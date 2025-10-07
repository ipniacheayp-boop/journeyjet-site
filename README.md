# TravelBooking - Online Travel Agency Platform

Complete OTA with Amadeus API (Flights, Hotels, Cars) + Stripe payments.

## Project info

**URL**: https://lovable.dev/projects/90c45cf3-b510-44bd-8288-5493fd44a82e

## 🚀 Features

- **Real-time search**: Flights, Hotels, Cars via Amadeus API
- **Stripe payments**: Secure checkout with webhooks
- **Admin dashboard**: Manage bookings, view analytics at `/admin`
- **Responsive design**: Mobile-first, accessible UI

## 🧪 Testing (Sandbox Mode)

**Amadeus Test Data:**
- Flights: BOM → DEL, 2025-10-25
- Hotels: DEL, 2025-10-20 to 2025-10-22
- Cars: DEL airport, 2025-10-20 to 2025-10-22

**Stripe Test Card:** 4242 4242 4242 4242

## 📁 Structure

- `/` - Homepage with search widget
- `/search-results` - Live API results
- `/booking/:type` - Checkout with Stripe
- `/admin` - Admin dashboard
- `/payment-success` - Post-payment confirmation

## 🔐 Production Setup

1. **Amadeus**: Replace test credentials, change URL to `api.amadeus.com`
2. **Stripe**: Update to live keys, configure webhook endpoint

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/90c45cf3-b510-44bd-8288-5493fd44a82e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/90c45cf3-b510-44bd-8288-5493fd44a82e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
