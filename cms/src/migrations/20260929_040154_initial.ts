import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`unit_types_info_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`unit_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`unit_types_info_rows_order_idx\` ON \`unit_types_info_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_info_rows_parent_id_idx\` ON \`unit_types_info_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`unit_types_parts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`key\` text NOT NULL,
  	\`frame\` numeric NOT NULL,
  	\`text\` text NOT NULL,
  	\`floor_plan\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`unit_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`unit_types_parts_order_idx\` ON \`unit_types_parts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_parts_parent_id_idx\` ON \`unit_types_parts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`unit_types_floor_plans\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`unit_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`unit_types_floor_plans_order_idx\` ON \`unit_types_floor_plans\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_floor_plans_parent_id_idx\` ON \`unit_types_floor_plans\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_floor_plans_image_idx\` ON \`unit_types_floor_plans\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`unit_types\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`placeholder\` integer DEFAULT false,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`card_image_id\` integer NOT NULL,
  	\`land_area\` numeric NOT NULL,
  	\`building_area\` numeric NOT NULL,
  	\`floors\` numeric DEFAULT 2 NOT NULL,
  	\`bedrooms\` numeric NOT NULL,
  	\`bathrooms\` numeric NOT NULL,
  	\`intro\` text NOT NULL,
  	\`sequence_id\` integer NOT NULL,
  	\`vr_url\` text,
  	\`vr_mode\` text DEFAULT 'embedded',
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`card_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`sequence_id\`) REFERENCES \`packages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`unit_types_slug_idx\` ON \`unit_types\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_card_image_idx\` ON \`unit_types\` (\`card_image_id\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_sequence_idx\` ON \`unit_types\` (\`sequence_id\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_updated_at_idx\` ON \`unit_types\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_created_at_idx\` ON \`unit_types\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`unit_types_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`unit_types\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`unit_types_rels_order_idx\` ON \`unit_types_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_rels_parent_idx\` ON \`unit_types_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_rels_path_idx\` ON \`unit_types_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`unit_types_rels_media_id_idx\` ON \`unit_types_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`units\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`unit_id\` text NOT NULL,
  	\`status\` text DEFAULT 'available' NOT NULL,
  	\`block\` text,
  	\`x\` numeric NOT NULL,
  	\`y\` numeric NOT NULL,
  	\`type_id\` integer,
  	\`note\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`type_id\`) REFERENCES \`unit_types\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`units_unit_id_idx\` ON \`units\` (\`unit_id\`);`)
  await db.run(sql`CREATE INDEX \`units_status_idx\` ON \`units\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`units_block_idx\` ON \`units\` (\`block\`);`)
  await db.run(sql`CREATE INDEX \`units_type_idx\` ON \`units\` (\`type_id\`);`)
  await db.run(sql`CREATE INDEX \`units_updated_at_idx\` ON \`units\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`units_created_at_idx\` ON \`units\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`facilities\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`placeholder\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`facilities_image_idx\` ON \`facilities\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`facilities_updated_at_idx\` ON \`facilities\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`facilities_created_at_idx\` ON \`facilities\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`packages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`kind\` text NOT NULL,
  	\`path\` text NOT NULL,
  	\`frames\` numeric NOT NULL,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`poster\` text,
  	\`first_image\` numeric DEFAULT 0,
  	\`start_frame\` numeric DEFAULT 0,
  	\`placeholder\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`packages_updated_at_idx\` ON \`packages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`packages_created_at_idx\` ON \`packages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`packages_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`packages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`packages_texts_order_parent\` ON \`packages_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text DEFAULT 'editor' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`exports\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`format\` text DEFAULT 'csv' NOT NULL,
  	\`limit\` numeric,
  	\`page\` numeric DEFAULT 1,
  	\`sort\` text,
  	\`sort_order\` text,
  	\`drafts\` text DEFAULT 'yes',
  	\`collection_slug\` text DEFAULT 'units' NOT NULL,
  	\`where\` text DEFAULT '{}',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`exports_updated_at_idx\` ON \`exports\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`exports_created_at_idx\` ON \`exports\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`exports_filename_idx\` ON \`exports\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`exports_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`exports\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`exports_texts_order_parent\` ON \`exports_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`imports\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`collection_slug\` text DEFAULT 'units' NOT NULL,
  	\`import_mode\` text,
  	\`match_field\` text DEFAULT 'id',
  	\`status\` text DEFAULT 'pending',
  	\`summary_imported\` numeric,
  	\`summary_updated\` numeric,
  	\`summary_total\` numeric,
  	\`summary_issues\` numeric,
  	\`summary_issue_details\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`imports_updated_at_idx\` ON \`imports\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`imports_created_at_idx\` ON \`imports\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`imports_filename_idx\` ON \`imports\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs_log\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`executed_at\` text NOT NULL,
  	\`completed_at\` text NOT NULL,
  	\`task_slug\` text NOT NULL,
  	\`task_i_d\` text NOT NULL,
  	\`input\` text,
  	\`output\` text,
  	\`state\` text NOT NULL,
  	\`error\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_order_idx\` ON \`payload_jobs_log\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_parent_id_idx\` ON \`payload_jobs_log\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`input\` text,
  	\`completed_at\` text,
  	\`total_tried\` numeric DEFAULT 0,
  	\`has_error\` integer DEFAULT false,
  	\`error\` text,
  	\`task_slug\` text,
  	\`queue\` text DEFAULT 'default',
  	\`wait_until\` text,
  	\`processing\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_completed_at_idx\` ON \`payload_jobs\` (\`completed_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_total_tried_idx\` ON \`payload_jobs\` (\`total_tried\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_has_error_idx\` ON \`payload_jobs\` (\`has_error\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_task_slug_idx\` ON \`payload_jobs\` (\`task_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_queue_idx\` ON \`payload_jobs\` (\`queue\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_wait_until_idx\` ON \`payload_jobs\` (\`wait_until\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_processing_idx\` ON \`payload_jobs\` (\`processing\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_updated_at_idx\` ON \`payload_jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_created_at_idx\` ON \`payload_jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`unit_types_id\` integer,
  	\`units_id\` integer,
  	\`facilities_id\` integer,
  	\`media_id\` integer,
  	\`packages_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`unit_types_id\`) REFERENCES \`unit_types\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`units_id\`) REFERENCES \`units\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`facilities_id\`) REFERENCES \`facilities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`packages_id\`) REFERENCES \`packages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_unit_types_id_idx\` ON \`payload_locked_documents_rels\` (\`unit_types_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_units_id_idx\` ON \`payload_locked_documents_rels\` (\`units_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_facilities_id_idx\` ON \`payload_locked_documents_rels\` (\`facilities_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_packages_id_idx\` ON \`payload_locked_documents_rels\` (\`packages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`homepage_kawasan_hotspots\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`short_label\` text,
  	\`key\` text NOT NULL,
  	\`text\` text NOT NULL,
  	\`landmark\` text NOT NULL,
  	\`default_frame\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_kawasan_hotspots_order_idx\` ON \`homepage_kawasan_hotspots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_kawasan_hotspots_parent_id_idx\` ON \`homepage_kawasan_hotspots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_cluster_hotspots\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`short_label\` text,
  	\`key\` text NOT NULL,
  	\`text\` text NOT NULL,
  	\`landmark\` text NOT NULL,
  	\`default_frame\` numeric NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_cluster_hotspots_order_idx\` ON \`homepage_cluster_hotspots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_cluster_hotspots_parent_id_idx\` ON \`homepage_cluster_hotspots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_eyebrow\` text,
  	\`hero_title\` text NOT NULL,
  	\`hero_loop_video_id\` integer NOT NULL,
  	\`hero_cover_id\` integer NOT NULL,
  	\`hero_full_video_id\` integer NOT NULL,
  	\`hero_play_label\` text DEFAULT 'Play Full Video' NOT NULL,
  	\`hero_scroll_cue\` text DEFAULT 'Gulir',
  	\`kawasan_title\` text NOT NULL,
  	\`kawasan_intro\` text NOT NULL,
  	\`kawasan_scene_id\` integer NOT NULL,
  	\`kawasan_back_label\` text NOT NULL,
  	\`lokasi_title\` text NOT NULL,
  	\`lokasi_intro\` text,
  	\`lokasi_map_id\` integer NOT NULL,
  	\`lokasi_placeholder\` integer DEFAULT false,
  	\`cluster_title\` text NOT NULL,
  	\`cluster_intro\` text NOT NULL,
  	\`cluster_scene_id\` integer NOT NULL,
  	\`cluster_back_label\` text NOT NULL,
  	\`fasilitas_title\` text NOT NULL,
  	\`fasilitas_intro\` text,
  	\`tipe_title\` text NOT NULL,
  	\`tipe_intro\` text,
  	\`unit_update_title\` text NOT NULL,
  	\`unit_update_intro\` text,
  	\`unit_update_siteplan_id\` integer NOT NULL,
  	\`unit_update_placeholder\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_loop_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_full_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`kawasan_scene_id\`) REFERENCES \`packages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`lokasi_map_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cluster_scene_id\`) REFERENCES \`packages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`unit_update_siteplan_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_hero_hero_loop_video_idx\` ON \`homepage\` (\`hero_loop_video_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_hero_hero_cover_idx\` ON \`homepage\` (\`hero_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_hero_hero_full_video_idx\` ON \`homepage\` (\`hero_full_video_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_kawasan_kawasan_scene_idx\` ON \`homepage\` (\`kawasan_scene_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_lokasi_lokasi_map_idx\` ON \`homepage\` (\`lokasi_map_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_cluster_cluster_scene_idx\` ON \`homepage\` (\`cluster_scene_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_unit_update_unit_update_siteplan_idx\` ON \`homepage\` (\`unit_update_siteplan_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`facilities_id\` integer,
  	\`unit_types_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`facilities_id\`) REFERENCES \`facilities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`unit_types_id\`) REFERENCES \`unit_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_rels_order_idx\` ON \`homepage_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_parent_idx\` ON \`homepage_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_path_idx\` ON \`homepage_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_facilities_id_idx\` ON \`homepage_rels\` (\`facilities_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_unit_types_id_idx\` ON \`homepage_rels\` (\`unit_types_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_nav\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`section\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_nav_order_idx\` ON \`site_settings_nav\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_parent_id_idx\` ON \`site_settings_nav\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`full_name\` text NOT NULL,
  	\`logo_id\` integer,
  	\`logo_on_dark_id\` integer,
  	\`favicon_id\` integer,
  	\`language\` text DEFAULT 'id' NOT NULL,
  	\`seo_description\` text NOT NULL,
  	\`seo_share_image_id\` integer,
  	\`status_labels_available\` text NOT NULL,
  	\`status_labels_reserved\` text NOT NULL,
  	\`status_labels_sold\` text NOT NULL,
  	\`footer_copyright\` text DEFAULT '© {year} {fullName}',
  	\`theme_accent\` text DEFAULT '#34425e' NOT NULL,
  	\`theme_available\` text DEFAULT '#1f9a57' NOT NULL,
  	\`theme_reserved\` text DEFAULT '#f0b400' NOT NULL,
  	\`theme_sold\` text DEFAULT '#e0442e' NOT NULL,
  	\`dev_show_placeholder_badges\` integer DEFAULT false,
  	\`dev_analytics_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`logo_on_dark_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_share_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_on_dark_idx\` ON \`site_settings\` (\`logo_on_dark_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_seo_seo_share_image_idx\` ON \`site_settings\` (\`seo_share_image_id\`);`)
  await db.run(sql`CREATE TABLE \`labels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`header_home_link\` text DEFAULT '{fullName} — beranda' NOT NULL,
  	\`header_nav_label\` text DEFAULT 'Bagian halaman' NOT NULL,
  	\`header_back_to_units\` text DEFAULT 'Kembali ke Unit Update' NOT NULL,
  	\`scene_prev_location\` text DEFAULT 'Lokasi sebelumnya' NOT NULL,
  	\`scene_next_location\` text DEFAULT 'Lokasi berikutnya' NOT NULL,
  	\`facilities_list_label\` text DEFAULT 'Galeri fasilitas' NOT NULL,
  	\`facilities_prev\` text DEFAULT 'Fasilitas sebelumnya' NOT NULL,
  	\`facilities_next\` text DEFAULT 'Fasilitas berikutnya' NOT NULL,
  	\`specs_area_unit\` text DEFAULT 'm²' NOT NULL,
  	\`specs_card_land_area\` text DEFAULT 'LT' NOT NULL,
  	\`specs_card_building_area\` text DEFAULT 'LB' NOT NULL,
  	\`specs_card_bedrooms\` text DEFAULT 'K. tidur' NOT NULL,
  	\`specs_card_bathrooms\` text DEFAULT 'K. mandi' NOT NULL,
  	\`specs_fact_land_area\` text DEFAULT 'LT' NOT NULL,
  	\`specs_fact_building_area\` text DEFAULT 'LB' NOT NULL,
  	\`specs_fact_bedrooms\` text DEFAULT 'KT' NOT NULL,
  	\`specs_fact_bathrooms\` text DEFAULT 'KM' NOT NULL,
  	\`specs_row_land_area\` text DEFAULT 'Luas tanah' NOT NULL,
  	\`specs_row_building_area\` text DEFAULT 'Luas bangunan' NOT NULL,
  	\`specs_row_floors\` text DEFAULT 'Jumlah lantai' NOT NULL,
  	\`specs_row_bedrooms\` text DEFAULT 'Kamar tidur' NOT NULL,
  	\`specs_row_bathrooms\` text DEFAULT 'Kamar mandi' NOT NULL,
  	\`type_page_gallery_button\` text DEFAULT 'Gallery' NOT NULL,
  	\`type_page_vr_button\` text DEFAULT 'VR' NOT NULL,
  	\`type_page_gallery_title\` text DEFAULT '{name} — Galeri' NOT NULL,
  	\`type_page_floor_plan_title\` text DEFAULT '{name} — Denah' NOT NULL,
  	\`type_page_vr_title\` text DEFAULT '{name} — Tur VR' NOT NULL,
  	\`type_page_floor_plan_caption\` text DEFAULT 'Denah {label}' NOT NULL,
  	\`type_page_open_floor_plan\` text DEFAULT 'Buka denah {label}' NOT NULL,
  	\`type_page_floor_plans_label\` text DEFAULT 'Denah' NOT NULL,
  	\`type_page_parts_label\` text DEFAULT 'Bagian' NOT NULL,
  	\`type_page_info_label\` text DEFAULT 'Informasi {name}' NOT NULL,
  	\`type_page_dock_label\` text DEFAULT '{name} ringkas' NOT NULL,
  	\`type_page_viewer_label\` text DEFAULT '{name}, fasad dan lantai' NOT NULL,
  	\`type_page_default_description\` text DEFAULT '{name}: fasad dan setiap lantai dalam 360°, denah, galeri, dan tur VR.' NOT NULL,
  	\`turntable_role_description\` text DEFAULT 'penampil 360°' NOT NULL,
  	\`turntable_rotate_left\` text DEFAULT 'Putar ke kiri' NOT NULL,
  	\`turntable_rotate_right\` text DEFAULT 'Putar ke kanan' NOT NULL,
  	\`turntable_viewer_hint\` text DEFAULT '{label}, tampilan 360°. Gunakan panah kiri dan kanan untuk memutar.' NOT NULL,
  	\`turntable_license_notice\` text DEFAULT 'Tampilan 360° ini aktif setelah lisensi WebRotate 360 PRO dipasang. Versi gratis hanya memuat satu viewer per halaman.' NOT NULL,
  	\`units_siteplan_label\` text DEFAULT 'Status unit' NOT NULL,
  	\`overlay_close\` text DEFAULT 'Tutup' NOT NULL,
  	\`overlay_prev\` text DEFAULT 'Sebelumnya' NOT NULL,
  	\`overlay_next\` text DEFAULT 'Berikutnya' NOT NULL,
  	\`overlay_open_in_new_tab\` text DEFAULT 'Buka di tab baru' NOT NULL,
  	\`badges_sequence\` text DEFAULT 'Sekuens contoh' NOT NULL,
  	\`badges_map\` text DEFAULT 'Peta contoh' NOT NULL,
  	\`badges_image\` text DEFAULT 'Gambar contoh' NOT NULL,
  	\`badges_data\` text DEFAULT 'Data contoh' NOT NULL,
  	\`badges_siteplan\` text DEFAULT 'Siteplan contoh' NOT NULL,
  	\`not_found_title\` text DEFAULT 'Halaman tidak ditemukan' NOT NULL,
  	\`not_found_text\` text DEFAULT 'Alamat ini tidak ada atau sudah dipindahkan.' NOT NULL,
  	\`not_found_button\` text DEFAULT 'Kembali ke beranda' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`unit_types_info_rows\`;`)
  await db.run(sql`DROP TABLE \`unit_types_parts\`;`)
  await db.run(sql`DROP TABLE \`unit_types_floor_plans\`;`)
  await db.run(sql`DROP TABLE \`unit_types\`;`)
  await db.run(sql`DROP TABLE \`unit_types_rels\`;`)
  await db.run(sql`DROP TABLE \`units\`;`)
  await db.run(sql`DROP TABLE \`facilities\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`packages\`;`)
  await db.run(sql`DROP TABLE \`packages_texts\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`exports\`;`)
  await db.run(sql`DROP TABLE \`exports_texts\`;`)
  await db.run(sql`DROP TABLE \`imports\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`homepage_kawasan_hotspots\`;`)
  await db.run(sql`DROP TABLE \`homepage_cluster_hotspots\`;`)
  await db.run(sql`DROP TABLE \`homepage\`;`)
  await db.run(sql`DROP TABLE \`homepage_rels\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`labels\`;`)
}
