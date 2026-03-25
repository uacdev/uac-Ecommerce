# UFL E-Commerce Platform — Implementation Plan

## Phase 1: Infrastructure & Backend Setup
- [ ] **Monorepo Structure**
  - Create `/backend` for the API (Node.js/Express)
  - Organize `/frontend` for the Vite application
- [ ] **Database Schema Design**
  - Implement `products` table with Best Seller tagging and SKU formats
  - Implement `orders` table with separate tracking for product price vs delivery fee
  - Implement `order_items` for multi-product support
  - Implement `delivery_locations` for dynamic pricing
- [ ] **API Core**
  - Express server setup with TypeScript
  - Supabase/PostgreSQL integration
  - Middleware for error handling and logging

## Phase 2: Product & Category Management
- [ ] **Admin Product Portal**
  - Add/Edit products with category and "Best Seller" tags
  - Inventory management (stock count per SKU)
  - Pickup location and delivery timeframe settings
- [ ] **Public Catalogue**
  - Landing page featuring "Best Sellers" first
  - Full product listing by categories (Gala, Swan, Supreme, etc.)
  - Search and filter by category/SKU format

## Phase 3: Checkout & Payments
- [ ] **Shopping Cart**
  - Multi-item cart functionality
  - Delivery fee calculation based on location
- [ ] **Payment Integration**
  - Monnify/OPay integration setup
  - Webhook for transaction verification
  - SAP-compliant reconciliation logic (Product vs Delivery fee separation)
- [ ] **Order Confirmation**
  - Post-payment success screen
  - Email receipt generation (SMTP)

## Phase 4: Order Management & Tracking
- [ ] **Admin Order Dashboard**
  - Real-time order list with status updates
  - Financial summary (Revenue trends, Fulfillment rates)
- [ ] **Customer Tracking (Phase 2 Requirement)**
  - Public tracking page using Order ID + Email
  - Email notifications for delivery milestones

## Phase 5: Analytics & CRM
- [ ] **Admin Reports**
  - Customer acquisition and value reports
  - Top-selling products analytics
  - Exportable data for CRM usage
