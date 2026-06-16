# Project TODO - အမောပြေ Water Delivery & Factory Management

## Core Infrastructure
- [x] Database schema design (users, products, orders, invoices, inventory, deliveries)
- [x] Multi-role authentication system (Admin via OAuth, Staff via username/password)
- [x] Role-based access control and protected routes
- [x] Dual-language (Myanmar/English) context provider with toggle

## Public-Facing Pages
- [x] Home page with water product catalog display
- [x] Public order placement form (no login required)
- [x] Order status tracking page (by order number)
- [x] Language toggle on all public pages

## Admin Dashboard
- [x] Overview statistics (daily sales, inventory levels, pending orders)
- [x] Revenue charts and trends
- [x] Low-stock alerts count display
- [x] Staff management (create/list staff accounts)

## Inventory Management
- [x] Product management (20L gallon bottles and small bottles as separate types)
- [x] Stock-in/stock-out operations via inventory adjustment UI
- [x] Current stock levels display
- [x] Restock alerts when inventory is low

## Order Management
- [x] Create new orders (public and admin)
- [x] View all orders with status filtering
- [x] Update order status (pending, processing, delivered, cancelled)
- [x] Order assignment to staff for delivery

## Invoice System
- [x] Auto-numbering invoice generation
- [x] Customer details on invoice
- [x] Itemized billing with calculations
- [x] Export/print invoice as PDF (using browser print)
- [x] Invoice list view

## Staff Interface
- [x] Fix staff auth to use publicProcedure for staff-specific endpoints
- [x] Staff login page and dashboard UI
- [x] View assigned deliveries UI
- [x] Update delivery status UI
- [x] Manage truck stock levels UI

## Sales Records & Reporting
- [x] Sales records with date-range filtering
- [x] CSV export functionality
- [x] Summary statistics (total revenue, quantity, order count)

## Analytics Dashboard
- [x] Revenue trends chart
- [x] Top customers ranking
- [x] Bottle type breakdown chart
- [x] Delivery performance metrics (real data)

## UI/UX
- [x] Responsive design for mobile and desktop
- [x] Professional color scheme and typography
- [x] Loading states and error handling

## Fixes Needed
- [x] Fix staff API endpoints to allow staff auth (publicProcedure with staff token validation)
- [x] Add delivery performance real metrics

## Seed Data & Notifications (New)
- [x] Seed default products (20L gallon bottle, small bottle variants)
- [x] Seed demo staff accounts with credentials
- [x] Add notification when order status changes (notify owner)
- [x] Update tests for new features

## Product Images, Delivery Zones & SMS (New)
- [x] Generate and upload product images for all 4 bottle types
- [x] Update product records with image URLs
- [x] Implement delivery zone mapping with Google Maps
- [x] Add zone assignment to staff and orders
- [x] Implement customer notification system (database-based, SMS-like)
- [x] Add notification history to order tracking page
- [x] Tests pass (16/16)

## Public Ordering Price Lock, Dynamic MOQ, Super Admin & Login Flow
- [x] Lock price field as read-only on public ordering screen
- [x] Customers can only change quantity, not price
- [x] Create system_settings table for dynamic MOQ
- [x] Admin can change MOQ from admin panel
- [x] Create super admin account (admin/admin123) in database
- [x] Create dedicated Admin Login screen with username/password fields
- [x] Implement admin session auth with cookie persistence
- [x] Add "Admin ဝင်ရောက်ပါ" button on Home screen navigating to admin login
- [x] Show error message for incorrect credentials
- [x] Add logout button in Admin Dashboard
- [x] Maintain session across dashboard/invoice tab switches

## Customer Loyalty/Points System & Admin Password Change
- [x] Create loyalty_points table (customer phone, points balance, history)
- [x] Create points_transactions table (earn/redeem history)
- [x] Backend: Auto-earn points on delivered orders
- [x] Backend: Points redemption for discounts
- [x] Admin UI: View customer points, configure points-per-order rate
- [x] Customer-facing: Show points balance on order tracking page
- [x] Admin Settings: Add password change form
- [x] Backend: Verify old password and update to new password
- [x] Tests pass (24/24)

## Staff CRUD, Product Pricing, Order Deletion, Button Text & Validation
- [x] Staff Account CRUD in Admin Panel (create/edit/delete)
- [x] Product & Pricing Management - Admin can change unit prices dynamically
- [x] Order Deletion - individual delete and "Delete All Orders" option
- [x] Change Home button text from "အော်ဒါတင်ပါ" to "ပစ္စည်းမှာရန်"
- [x] Strict validation - lock quantity until customer info is filled
- [x] No order is created until final confirmation button is clicked (loyalty check is intentional pre-submit UX)

## Admin Auth Fix (OAuth → Cookie-based)
- [x] Remove OAuth auth guards from all admin pages (AdminDashboard, AdminAnalytics, AdminCustomers, AdminInventory, AdminInvoices, AdminReports, AdminZones)
- [x] AdminLayout handles auth centrally via useAdminAuth hook
- [x] Admin login flow: /admin-login → cookie-based auth → /admin dashboard
- [x] All 24 tests passing, TypeScript clean
- [x] Docker deployment configuration included

## Quantity Input Bug Fix & Product Price Management
- [x] Fix locked quantity input on Invoice/Order screen - users cannot edit quantity value
- [x] Handle empty quantity gracefully (default to 1 on blur if empty)
- [x] Real-time total price calculation as quantity changes
- [x] Create Admin Product Price Management UI (editable price per product)
- [x] Save Prices button updates database prices
- [x] Public ordering and staff invoice screens read prices dynamically from DB (not hardcoded)
- [x] Fix invoices procedures to use cookie-based admin auth (not OAuth protectedProcedure)

## Logo Integration & Android APK Build
- [x] Upload official အမောပြေ logo to webdev storage
- [x] Replace generic logo on Home Screen with official logo
- [x] Replace generic logo on Admin Dashboard sidebar with official logo
- [x] Set logo as favicon/app icon (PWA manifest + favicon)
- [x] Generate branded product bottle images with logo overlay (4 sizes: 20L, 1L, 0.5L, 0.35L)
- [x] Update product cards to use branded images (database updated)
- [x] Build Android APK (WebView wrapper) with official logo as app icon
- [x] Provide downloadable APK link

## Strict RBAC (Role-Based Access Control) Implementation
- [x] Admin Login (/admin-login): ONLY admin/admin123 allowed — staff accounts blocked
- [x] Staff Login (/staff-login): separate screen for staff accounts only (not admin)
- [x] Data isolation: each staff sees ONLY their own data (own sales, own invoices, own profile)
- [x] Staff CANNOT delete or edit orders (read-only order view)
- [x] Staff CAN create, save, and edit invoices (with audit logging)
- [x] Audit log table in database (staffId, action, entityType, entityId, oldData, newData, timestamp)
- [x] Auto-create audit log entry when staff modifies any invoice
- [x] Notify Super Admin when staff modifies an invoice (via notifyOwner)
- [x] Admin Audit Logs page: view which staff modified which invoice + timestamp
- [x] Staff Dashboard with isolated data (own profile, own sales logs, own expenses)
- [x] Staff Orders page (read-only, no delete/edit buttons)
- [x] Staff Invoices page (create/edit invoices)
- [x] Update StaffLayout navigation with new pages
- [x] All UI supports Myanmar language (bilingual)
- [x] Tests for RBAC enforcement (9 tests passing)

## Admin Product Management (Edit/Delete)
- [x] Backend: products.delete procedure with admin-only access
- [x] Backend: deleteProduct db helper function
- [x] Frontend: Edit Product dialog with all fields (name, nameMyanmar, type, prices, description)
- [x] Frontend: Delete button with confirmation dialog
- [x] Frontend: Product table with Edit/Delete action buttons
- [x] Frontend: Bilingual UI (Myanmar + English)
- [x] Tests: 6 product CRUD tests passing

## Staff Expense Tracking
- [x] Database: expenses table (staffId, date, category, amount, description, receiptUrl, isApproved, approvedBy, approvedDate)
- [x] Backend: db helpers for expense CRUD
- [x] Backend: procedures for expense create/list/update/delete (staff-scoped)
- [x] Backend: procedure for admin to approve/reject expenses
- [x] Frontend: Staff Expenses page (list own expenses)
- [x] Frontend: Create Expense dialog (date, category, amount, description, receipt upload)
- [x] Frontend: Edit Expense page (only if not approved)
- [x] Frontend: Admin Expense Approvals page (view all staff expenses, approve/reject)
- [x] Frontend: Bilingual UI (Myanmar + English)
- [x] Tests: expense CRUD operations

## Invoice PDF Export
- [x] Backend: PDF generation helper using docx library
- [x] Backend: invoices.exportPDF procedure (staff-scoped)
- [x] Frontend: Download PDF button on Staff Invoices page
- [x] Frontend: PDF export with base64 encoding and auto-download
- [x] Frontend: Bilingual support in PDF (Myanmar + English)
- [x] Tests: PDF generation (4 tests passing)

## Real-time Notifications (Audit Logs)
- [x] Backend: Audit log creation on invoice modifications
- [x] Backend: Admin notifications via notifyOwner()
- [x] Frontend: Admin Audit Logs page with audit trail
- [x] Frontend: Toast notifications on invoice changes
- [x] Frontend: Bilingual audit log display
- [x] Tests: RBAC + audit log flow (9 tests passing)

## Real-time Notifications (WebSocket/Polling)
- [x] Backend: WebSocket server setup for audit log streaming (ws package)
- [x] Backend: auditLogs.subscribe procedure (admin-only, real-time)
- [x] Frontend: WebSocket client connection in AdminAuditLogs page
- [x] Frontend: Polling fallback if WebSocket unavailable (3-second refresh)
- [x] Frontend: Toast notification when new audit log arrives
- [x] Frontend: Auto-refresh audit logs without page reload
- [x] Tests: WebSocket/polling functionality (9 tests passing)

## Mobile App (PWA)
- [x] Add PWA manifest.json with app icons and metadata
- [x] Implement service worker for offline support
- [x] Make all pages mobile-responsive (tested on 320px-480px screens)
- [x] Add "Install App" prompt for PWA installation
- [x] Optimize images for mobile (lazy loading)
- [x] Test on mobile browsers (iOS Safari, Android Chrome)
- [x] Add mobile-specific navigation (bottom tab bar or hamburger menu)

## Invoice Email
- [x] Backend: Email service integration (nodemailer)
- [x] Backend: invoices.sendEmail procedure (staff-scoped)
- [x] Backend: Generate PDF, attach to email, send to customer
- [x] Frontend: "Email Invoice" button on Staff Invoices page
- [x] Frontend: Email input dialog (customer email)
- [x] Frontend: Confirmation toast after email sent
- [x] Tests: Email sending functionality (9 tests passing)

## Water Quality Inspection Feature
- [x] Database: water_quality_inspections table (date, pH, turbidity, chlorine, notes, inspectedBy)
- [x] Backend: db helpers for inspection CRUD
- [x] Backend: procedures for inspection create/read/update/delete (admin-only)
- [x] Frontend: Admin Water Quality Inspection form (date, pH, turbidity, chlorine, notes)
- [x] Frontend: Water Quality results list page (latest inspections)
- [x] Frontend: Home Dashboard Overview card showing latest inspection result
- [x] Frontend: Bilingual UI (Myanmar + English)
- [x] Tests: Water Quality Inspection CRUD operations (6 tests passing)

## Offline Capabilities (PWA + Service Worker)
- [x] Enhanced Service Worker with cache strategies (cache-first, network-first, stale-while-revalidate)
- [x] Cache all frontend assets (JS, CSS, images, fonts)
- [x] Cache all routes and pages (/admin/water-quality, /staff/*, etc)
- [x] Offline state management (localStorage for recent data)
- [x] Local data persistence (recent orders, invoices, expenses)
- [x] Offline UI indicators (banner, icon, status)
- [x] Fallback pages for offline mode
- [x] Graceful error handling when network unavailable
- [x] Background sync for pending mutations
- [x] Tests for offline functionality (23 tests passing)
