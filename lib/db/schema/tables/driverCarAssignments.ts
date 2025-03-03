import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { cars } from './cars';
import { drivers } from './drivers';

export const driverCarAssignments = pgTable('driverCarAssignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  carId: uuid('car_id')
    .notNull()
    .references(() => cars.id),
  driverId: uuid('driver_id')
    .notNull()
    .references(() => drivers.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type CarDriverAssignment = typeof driverCarAssignments.$inferSelect;
export type NewCarDriverAssignment = typeof driverCarAssignments.$inferInsert;
