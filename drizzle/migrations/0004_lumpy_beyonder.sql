CREATE TABLE `social_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `social_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `social_comments_post_idx` ON `social_comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `social_comments_user_idx` ON `social_comments` (`user_id`);--> statement-breakpoint
ALTER TABLE `social_posts` ADD `comments_count` integer DEFAULT 0 NOT NULL;