CREATE TABLE `customer_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`customerPhone` varchar(20) NOT NULL,
	`customerName` varchar(200),
	`notificationType` enum('order_placed','status_change','delivery_assigned','delivery_complete') NOT NULL,
	`title` varchar(500) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_notifications_id` PRIMARY KEY(`id`)
);
