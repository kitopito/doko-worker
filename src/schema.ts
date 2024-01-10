/*
  DO NOT RENAME THIS FILE FOR DRIZZLE-ORM TO WORK
*/
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
});
export const teacher = sqliteTable('teacher', {
  id: integer('id').primaryKey({autoIncrement: true}).notNull(),
  name: text('name').notNull(),
  updatedAt: integer('updated_at').notNull(),
  statusId: integer('status_id').notNull().references(() => status.id),
  deviceAddress: integer('device_address').notNull(),
});

// Statusテーブル
export const status = sqliteTable('status', {
  id: integer('id').primaryKey({autoIncrement: true}).notNull(),
  status: text('status').notNull(),
});

// SensorValueテーブル
export const sensor = sqliteTable('sensor', {
  id: integer('id').primaryKey({autoIncrement: true}).notNull(),
  teacherId: integer('teacher_id').notNull().references(() => teacher.id),
  value: integer('value').notNull(),
});

// Configテーブル
export const config = sqliteTable('config', {
  teacherId: integer('teacher_id').notNull().references(() =>  teacher.id),
  statusId: integer('status_id').notNull().references(() => status.id),
  sensorId: integer('sensor_id').notNull().references(() => sensor.id),
  configValue: integer('config_value').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.teacherId, table.statusId, table.sensorId] }),
  };
});

// logテーブル
export const log = sqliteTable('log', {
  id: integer('id').primaryKey({autoIncrement: true}).notNull(),
  isValidData: integer("is_valid_data").notNull(),
  deviceAddress: integer('device_address'),
  log: text('log').notNull(),
  timeStamp: integer('time_stamp').notNull(),
});