import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';
import { cars } from './cars';
import { teams } from './teams';
import { drivers } from './drivers';

export const driverCarAssignments = pgTable('driverCarAssignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  carId: uuid('car_id')
    .notNull()
    .references(() => cars.id),
  driverId: uuid('driver_id')
    .notNull()
    .references(() => drivers.id),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  teamId: uuid('team_id')
        .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type CarDriverAssignment = typeof driverCarAssignments.$inferSelect;
export type NewCarDriverAssignment = typeof driverCarAssignments.$inferInsert;
