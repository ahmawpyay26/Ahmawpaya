CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`address` text,
	`zone` varchar(100),
	`priceTier` enum('retail','wholesale','vip') NOT NULL DEFAULT 'retail',
	`isRegistered` boolean NOT NULL DEFAULT false,
	`orderCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`staffId` int NOT NULL,
	`deliveryStatus` enum('assigned','in_transit','delivered','failed') NOT NULL DEFAULT 'assigned',
	`truckStockBefore` json,
	`truckStockAfter` json,
	`deliveredAt` timestamp,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`currentStock` int NOT NULL DEFAULT 0,
	`minStockLevel` int NOT NULL DEFAULT 10,
	`lastRestocked` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`type` enum('stock_in','stock_out','adjustment') NOT NULL,
	`quantity` int NOT NULL,
	`note` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`productId` int,
	`productName` varchar(200) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`orderId` int,
	`customerId` int,
	`customerName` varchar(200) NOT NULL,
	`customerPhone` varchar(20),
	`customerAddress` text,
	`subtotal` decimal(12,2) NOT NULL,
	`deliveryFee` decimal(10,2) DEFAULT '0',
	`discount` decimal(10,2) DEFAULT '0',
	`taxRate` decimal(5,2) DEFAULT '0',
	`taxAmount` decimal(10,2) DEFAULT '0',
	`totalAmount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) DEFAULT '0',
	`invoiceStatus` enum('draft','issued','paid','overdue') NOT NULL DEFAULT 'issued',
	`createdBy` int,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`productName` varchar(200) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`customerId` int,
	`customerName` varchar(200) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`customerAddress` text,
	`status` enum('pending','processing','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`totalAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`deliveryFee` decimal(10,2) DEFAULT '0',
	`discount` decimal(10,2) DEFAULT '0',
	`note` text,
	`assignedStaffId` int,
	`isPublicOrder` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameMyanmar` varchar(200),
	`type` enum('20L','1L','0.5L','0.35L','other') NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`shellPrice` decimal(10,2) DEFAULT '0',
	`waterPrice` decimal(10,2) DEFAULT '0',
	`description` text,
	`descriptionMyanmar` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`imageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`invoiceId` int,
	`staffId` int,
	`customerId` int,
	`totalAmount` decimal(12,2) NOT NULL,
	`productType` enum('20L','1L','0.5L','0.35L','other'),
	`quantity` int DEFAULT 0,
	`saleDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`fullName` varchar(200) NOT NULL,
	`phone` varchar(20),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_accounts_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `truck_stock` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `truck_stock_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','staff') NOT NULL DEFAULT 'user';