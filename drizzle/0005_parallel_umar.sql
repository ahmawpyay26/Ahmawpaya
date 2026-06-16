CREATE TABLE `loyalty_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`customerName` varchar(200),
	`totalPoints` int NOT NULL DEFAULT 0,
	`redeemedPoints` int NOT NULL DEFAULT 0,
	`availablePoints` int NOT NULL DEFAULT 0,
	`tier` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyalty_points_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyalty_points_customerPhone_unique` UNIQUE(`customerPhone`)
);
--> statement-breakpoint
CREATE TABLE `points_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`transactionType` enum('earn','redeem','bonus','expire') NOT NULL,
	`points` int NOT NULL,
	`orderId` int,
	`orderNumber` varchar(50),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_transactions_id` PRIMARY KEY(`id`)
);
