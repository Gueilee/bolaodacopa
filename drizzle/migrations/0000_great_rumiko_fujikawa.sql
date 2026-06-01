CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`phase` text NOT NULL,
	`group_name` text,
	`match_number` integer NOT NULL,
	`home_team` text NOT NULL,
	`away_team` text NOT NULL,
	`home_flag` text,
	`away_flag` text,
	`home_score` integer,
	`away_score` integer,
	`match_result` text,
	`match_date` integer NOT NULL,
	`venue` text,
	`city` text,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`elapsed` integer,
	`is_scored` integer DEFAULT false NOT NULL,
	`api_fixture_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `matches_status_idx` ON `matches` (`status`);--> statement-breakpoint
CREATE INDEX `matches_date_idx` ON `matches` (`match_date`);--> statement-breakpoint
CREATE INDEX `matches_api_fixture_idx` ON `matches` (`api_fixture_id`);--> statement-breakpoint
CREATE TABLE `notifications_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`match_id` text,
	`type` text NOT NULL,
	`phone` text NOT NULL,
	`message` text NOT NULL,
	`status` text NOT NULL,
	`error` text,
	`sent_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `notif_user_idx` ON `notifications_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `notif_type_idx` ON `notifications_log` (`type`);--> statement-breakpoint
CREATE INDEX `notif_sent_idx` ON `notifications_log` (`sent_at`);--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`match_id` text NOT NULL,
	`home_score` integer NOT NULL,
	`away_score` integer NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`points_breakdown` text,
	`is_scored` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `predictions_user_match_idx` ON `predictions` (`user_id`,`match_id`);--> statement-breakpoint
CREATE INDEX `predictions_user_idx` ON `predictions` (`user_id`);--> statement-breakpoint
CREATE INDEX `predictions_match_idx` ON `predictions` (`match_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text,
	`label` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tournament_predictions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`champion` text NOT NULL,
	`runner_up` text NOT NULL,
	`top_scorer` text NOT NULL,
	`bonus_points` integer DEFAULT 0 NOT NULL,
	`is_scored` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tournament_predictions_user_id_unique` ON `tournament_predictions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`avatar_url` text,
	`department` text,
	`phone` text,
	`whatsapp_opt_in` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`total_points` integer DEFAULT 0 NOT NULL,
	`is_prediction_locked` integer DEFAULT false NOT NULL,
	`predictions_locked_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);