CREATE TABLE `delivery_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameMyanmar` varchar(200),
	`color` varchar(20) NOT NULL DEFAULT '#0ea5e9',
	`centerLat` decimal(10,7),
	`centerLng` decimal(10,7),
	`assignedStaffId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `staff_accounts` ADD `zoneId` int;