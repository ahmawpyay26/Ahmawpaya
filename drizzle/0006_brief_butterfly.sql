CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffId` int NOT NULL,
	`staffName` varchar(200) NOT NULL,
	`action` enum('create','update','delete') NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`entityLabel` varchar(200),
	`oldData` json,
	`newData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
