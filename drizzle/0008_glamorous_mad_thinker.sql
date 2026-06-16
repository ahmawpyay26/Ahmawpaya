CREATE TABLE `water_quality_inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspectionDate` date NOT NULL,
	`pH` decimal(4,2) NOT NULL,
	`turbidity` decimal(5,2) NOT NULL,
	`chlorineLevel` decimal(5,2) NOT NULL,
	`notes` text,
	`inspectedBy` varchar(200) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `water_quality_inspections_id` PRIMARY KEY(`id`)
);
