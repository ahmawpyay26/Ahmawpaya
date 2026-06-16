-- ============================================
-- Database Initialization Script
-- အမောပြေ (Ah-Maw-Pyay) Water Delivery App
-- ============================================

-- Users table (for OAuth/Admin users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `users_id` PRIMARY KEY(`id`),
  CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

-- Staff Accounts
CREATE TABLE IF NOT EXISTS `staff_accounts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `username` varchar(100) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `fullName` varchar(200) NOT NULL,
  `phone` varchar(20),
  `role` enum('driver','warehouse','manager') NOT NULL DEFAULT 'driver',
  `isActive` tinyint NOT NULL DEFAULT 1,
  `zoneId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `staff_accounts_id` PRIMARY KEY(`id`),
  CONSTRAINT `staff_accounts_username_unique` UNIQUE(`username`)
);

-- Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(200) NOT NULL,
  `nameMm` varchar(200),
  `type` enum('20L','1L','0.5L','0.35L') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `imageUrl` text,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `products_id` PRIMARY KEY(`id`)
);

-- Inventory
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int AUTO_INCREMENT NOT NULL,
  `productId` int NOT NULL,
  `currentStock` int NOT NULL DEFAULT 0,
  `minStockLevel` int NOT NULL DEFAULT 10,
  `warehouseLocation` varchar(100),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);

-- Inventory Transactions
CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `productId` int NOT NULL,
  `type` enum('stock_in','stock_out','adjustment') NOT NULL,
  `quantity` int NOT NULL,
  `note` text,
  `performedBy` varchar(100),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `inventory_transactions_id` PRIMARY KEY(`id`)
);

-- Customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(200) NOT NULL,
  `phone` varchar(20),
  `address` text,
  `email` varchar(320),
  `totalOrders` int NOT NULL DEFAULT 0,
  `totalSpent` decimal(12,2) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);

-- Orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderNumber` varchar(50) NOT NULL,
  `customerId` int,
  `customerName` varchar(200) NOT NULL,
  `customerPhone` varchar(20),
  `customerAddress` text,
  `status` enum('pending','processing','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `totalAmount` decimal(12,2) NOT NULL DEFAULT 0,
  `note` text,
  `assignedStaffId` int,
  `isPublicOrder` tinyint NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `orders_id` PRIMARY KEY(`id`),
  CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);

-- Order Items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderId` int NOT NULL,
  `productName` varchar(200) NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);

-- Invoices
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int AUTO_INCREMENT NOT NULL,
  `invoiceNumber` varchar(50) NOT NULL,
  `orderId` int,
  `customerId` int,
  `customerName` varchar(200) NOT NULL,
  `customerPhone` varchar(20),
  `customerAddress` text,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0,
  `tax` decimal(12,2) NOT NULL DEFAULT 0,
  `totalAmount` decimal(12,2) NOT NULL DEFAULT 0,
  `status` enum('draft','sent','paid','overdue') NOT NULL DEFAULT 'draft',
  `dueDate` timestamp,
  `paidAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
  CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` int AUTO_INCREMENT NOT NULL,
  `invoiceId` int NOT NULL,
  `description` varchar(500) NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);

-- Deliveries
CREATE TABLE IF NOT EXISTS `deliveries` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderId` int NOT NULL,
  `staffId` int NOT NULL,
  `status` enum('assigned','in_transit','delivered','failed') NOT NULL DEFAULT 'assigned',
  `deliveryNote` text,
  `deliveredAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `deliveries_id` PRIMARY KEY(`id`)
);

-- Truck Stock
CREATE TABLE IF NOT EXISTS `truck_stock` (
  `id` int AUTO_INCREMENT NOT NULL,
  `staffId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `loadedAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `truck_stock_id` PRIMARY KEY(`id`)
);

-- Sales Records
CREATE TABLE IF NOT EXISTS `sales_records` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderId` int,
  `productName` varchar(200) NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `totalPrice` decimal(12,2) NOT NULL,
  `customerName` varchar(200),
  `staffName` varchar(200),
  `saleDate` timestamp NOT NULL DEFAULT (now()),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `sales_records_id` PRIMARY KEY(`id`)
);

-- Customer Notifications
CREATE TABLE IF NOT EXISTS `customer_notifications` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderId` int NOT NULL,
  `orderNumber` varchar(50) NOT NULL,
  `customerPhone` varchar(20),
  `message` text NOT NULL,
  `messageMm` text,
  `type` enum('order_placed','status_changed','delivery_update') NOT NULL DEFAULT 'order_placed',
  `isRead` tinyint NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `customer_notifications_id` PRIMARY KEY(`id`)
);

-- Delivery Zones
CREATE TABLE IF NOT EXISTS `delivery_zones` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(200) NOT NULL,
  `nameMyanmar` varchar(200),
  `color` varchar(20) NOT NULL DEFAULT '#0ea5e9',
  `centerLat` decimal(10,7),
  `centerLng` decimal(10,7),
  `assignedStaffId` int,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`)
);

-- ============================================
-- Seed Data: Default Products
-- ============================================
INSERT INTO `products` (`name`, `nameMm`, `type`, `price`, `description`, `isActive`) VALUES
('20L Gallon Bottle', '၂၀ လီတာ ဂါလံဘူး', '20L', 1500.00, 'Premium purified 20-liter gallon bottle for home and office use', 1),
('1L Bottle', '၁ လီတာ ဘူး', '1L', 500.00, 'Convenient 1-liter purified water bottle', 1),
('0.5L Bottle', '၀.၅ လီတာ ဘူး', '0.5L', 300.00, 'Portable half-liter purified water bottle', 1),
('0.35L Bottle', '၀.၃၅ လီတာ ဘူး', '0.35L', 200.00, 'Compact 350ml purified water bottle', 1);

-- Seed inventory for products
INSERT INTO `inventory` (`productId`, `currentStock`, `minStockLevel`, `warehouseLocation`) VALUES
(1, 500, 50, 'Main Warehouse - Section A'),
(2, 2000, 200, 'Main Warehouse - Section B'),
(3, 3000, 300, 'Main Warehouse - Section B'),
(4, 5000, 500, 'Main Warehouse - Section C');

-- Seed Staff Accounts (password: staff123 for staff1, staff456 for staff2)
INSERT INTO `staff_accounts` (`username`, `passwordHash`, `fullName`, `phone`, `role`, `isActive`) VALUES
('staff1', '$2a$10$LxQz8kYFqVK0Qm7HJqOZUe6YVxLqJzGfH1V7Qj6X8K9L2M3N4O5P6', 'Aung Kyaw', '09-123456789', 'driver', 1),
('staff2', '$2a$10$MxRz9kYGqWK1Rm8IJrPAVf7ZWyMrKzHgI2W8Rk7Y9L3N5P6Q7R8S9', 'Min Thu', '09-987654321', 'driver', 1);
