CREATE TABLE `leaderboard_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`activity_type` text NOT NULL,
	`activity_key` text NOT NULL,
	`points` integer NOT NULL,
	`month_key` text NOT NULL,
	`earned_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leaderboard_events_user_activity_unique` ON `leaderboard_events` (`user_id`,`activity_key`);--> statement-breakpoint
CREATE INDEX `leaderboard_events_month_points_idx` ON `leaderboard_events` (`month_key`,`points`);--> statement-breakpoint
CREATE INDEX `leaderboard_events_user_month_idx` ON `leaderboard_events` (`user_id`,`month_key`);