import { pgTable, varchar, text, date, timestamp, uuid, unique } from 'drizzle-orm/pg-core';
import { teams } from './teams';

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  contactNumber: varchar('contact_number', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  address: text('address').notNull(),
  hiredDate: date('hired_date'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  teamId: uuid('team_id')
        .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueLicenseNumber: unique().on(table.licenseNumber, table.teamId),
  uniqueEmail: unique().on(table.email, table.teamId),
}));

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;