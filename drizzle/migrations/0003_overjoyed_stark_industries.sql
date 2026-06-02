CREATE TABLE `user_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`type` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_tokens_token_idx` ON `user_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `user_tokens_user_idx` ON `user_tokens` (`user_id`);--> statement-breakpoint
ALTER TABLE `users` ADD `first_access_at` integer;