import { pgTable, integer, date, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const cars = pgTable('cars', {
  id: serial('id').primaryKey(),
  brand: varchar('brand', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  year: integer('year').notNull(),
  licensePlate: varchar('license_plate', { length: 20 }).notNull().unique(),
  vin: varchar('vin', { length: 17 }).notNull().unique(),
  color: varchar('color', { length: 20 }),
  status: varchar('status', { length: 20 }).notNull().default('available'),
  lastMaintenanceDate: date('last_maintenance_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;