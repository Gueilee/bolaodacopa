CREATE TABLE `match_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`player_name` text NOT NULL,
	`country` text NOT NULL,
	`is_own_goal` integer DEFAULT false NOT NULL,
	`minute` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `match_goals_match_idx` ON `match_goals` (`match_id`);