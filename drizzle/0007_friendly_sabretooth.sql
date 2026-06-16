CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffId` int NOT NULL,
	`staffName` varchar(200) NOT NULL,
	`date` date NOT NULL,
	`category` enum('fuel','meals','transport','maintenance','supplies','other') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`receiptUrl` varchar(500),
	`isApproved` boolean NOT NULL DEFAULT false,
	`approvedBy` int,
	`approvedByName` varchar(200),
	`approvalDate` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
