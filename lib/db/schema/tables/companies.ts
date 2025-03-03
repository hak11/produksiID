import { pgTable, date, text, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { teams } from './teams';

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address'),
  category: text('cateogry'),
  picName: varchar('pic_name', { length: 100 }),
  picPhone: varchar('pic_phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  registeredDate: date('registered_date').notNull(),
  teamId: uuid('team_id')
        .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueEmail: unique().on(table.email, table.teamId),
}));

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;