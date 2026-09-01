# UFL E-Commerce API (Backend)

## Features
- Supabase Integration (Product, Orders, Stats)
- Node.js + TypeScript
- Vercel-ready Deployment
- Rapid Order Processing

## Database Schema
The latest database schema is located at `SUPABASE_SCHEMA.sql`.

## Getting Started
1. `cd backend`
2. `npm install`
3. `npm run dev` or `vercel dev`

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PORT` (default 5000)

## Payment and email configuration

Set these variables in the backend environment for Opay payments and admin notifications:

- `OPAY_MERCHANT_ID`
- `OPAY_PUBLIC_KEY`
- `OPAY_SECRET_KEY`
- `OPAY_BASE_URL` (use Opay sandbox or production API URL)
- `FRONTEND_URL` (the deployed storefront URL)
- `RESEND_API_KEY`
- `RESEND_FROM` (a verified Resend sender, for example `UAC Foods <orders@example.com>`)
- `ADMIN_EMAIL` (the address that receives new-order and payment-success alerts)

When an Opay payment is confirmed, either by the Opay webhook or redirect verification, the order is marked `paid`, the customer and admin receive an email, and an in-app admin notification is created. The payment confirmation is idempotent, so the two Opay callbacks do not send duplicate alerts.
