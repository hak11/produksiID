import { pgTable, integer, date, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { teams } from './teams';

export const cars = pgTable('cars', {
  id: uuid('id').primaryKey().defaultRandom(),
  brand: varchar('brand', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  year: integer('year').notNull(),
  licensePlate: varchar('license_plate', { length: 20 }).notNull(),
  vin: varchar('vin', { length: 17 }).notNull(),
  color: varchar('color', { length: 20 }),
  status: varchar('status', { length: 20 }).notNull().default('available'),
  lastMaintenanceDate: date('last_maintenance_date'),
  teamId: uuid('team_id')
        .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueLicensePlate: unique().on(table.licensePlate, table.teamId),
  uniqueVin: unique().on(table.vin, table.teamId),
}));

export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;