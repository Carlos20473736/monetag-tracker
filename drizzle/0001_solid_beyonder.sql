CREATE TABLE `ad_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('impression','click') NOT NULL,
	`eventId` varchar(255),
	`userId` int,
	`telegramId` varchar(64),
	`zoneId` varchar(64) NOT NULL,
	`clickId` varchar(255),
	`subId` varchar(255),
	`revenue` varchar(64),
	`currency` varchar(10),
	`userAgent` text,
	`ipAddress` varchar(45),
	`country` varchar(2),
	`rawData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zoneId` varchar(64) NOT NULL,
	`zoneName` varchar(255),
	`zoneType` varchar(64),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_zones_id` PRIMARY KEY(`id`),
	CONSTRAINT `ad_zones_zoneId_unique` UNIQUE(`zoneId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `telegramId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `telegramUsername` varchar(255);