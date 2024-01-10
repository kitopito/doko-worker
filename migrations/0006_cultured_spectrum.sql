CREATE TABLE `log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`isValidData` integer NOT NULL,
	`device_address` integer,
	`log` text NOT NULL,
	`time_stamp` integer NOT NULL
);
