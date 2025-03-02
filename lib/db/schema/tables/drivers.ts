import { pgTable, serial, varchar, text, date, timestamp } from 'drizzle-orm/pg-core';

export const drivers = pgTable('drivers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }).notNull().unique(),
  dateOfBirth: date('date_of_birth').notNull(),
  contactNumber: varchar('contact_number', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  address: text('address').notNull(),
  hiredDate: date('hired_date'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;