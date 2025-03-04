CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL,
	`priority` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE INDEX `priority_idx` ON `tasks` (`priority`);