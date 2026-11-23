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

## SAP integration

When an order is paid, the backend creates a sales order in SAP and sends a signed payment notification (see `src/lib/sap.ts`). Progress is shown in the admin Orders tab (SAP column, with Retry). Failed sends retry automatically every 10 minutes.

| Variable | Value / purpose |
|---|---|
| `SAP_ENABLED` | `true` to send orders to SAP. Leave `false` anywhere that shouldn't post to SAP. |
| `SAP_API_BASE_URL` | SAP API Management URL (QAS: `https://uacnplc.test01.apimanagement.eu20.hana.ondemand.com`) |
| `SAP_API_KEY` | Sales order API key (from the SAP team) |
| `SAP_SOLD_TO_PARTY` | One-time customer (QAS: `40000000`) |
| `SAP_PAYMENT_ACCOUNT_REF` | Company 4000 + customer (QAS: `400040000000`) |
| `SAP_PAYMENT_SECRET` | Shared secret for the `eCommerce-signature` HMAC |
| `SAP_CALLBACK_TOKEN` | Token SAP sends in `x-sap-callback-token` when calling `POST /api/sap/payment-callback` |
| `SAP_REGION_CODES` | Optional JSON of extra state → SAP region codes, e.g. `{"Ogun":"28"}` (Lagos `25` is built in) |

Fixed defaults (override only if SAP changes them): `SAP_SALES_ORDER_TYPE=ZUOR`, `SAP_SALES_ORGANIZATION=4000`, `SAP_DISTRIBUTION_CHANNEL=15`, `SAP_DIVISION=99`, `SAP_PARTNER_FUNCTION=SP`. Plants come from each product's location (Ojota 4000, Oregun 4001, Kerang 4051).

SAP only accepts calls from whitelisted server IPs. To test the key and whitelist without creating anything, sign in to the admin and open `GET /api/sap/connection-check`.

Material codes: `npm run seed:sap-codes` previews which products get a code from UFL's list; add `-- --apply` to save. Codes can also be edited per product in the admin.
