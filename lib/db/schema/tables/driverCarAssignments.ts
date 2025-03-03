import { pgTable, integer, serial, timestamp } from 'drizzle-orm/pg-core';
import { cars } from './cars';
import { drivers } from './drivers';

export const driverCarAssignments = pgTable('driverCarAssignments', {
  id: serial('id').primaryKey(),
  carId: integer('car_id')
    .notNull()
    .references(() => cars.id),
  driverId: integer('driver_id')
    .notNull()
    .references(() => drivers.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type CarDriverAssignment = typeof driverCarAssignments.$inferSelect;
export type NewCarDriverAssignment = typeof driverCarAssignments.$inferInsert;
