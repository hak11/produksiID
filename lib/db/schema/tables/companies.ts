import { pgTable, date, text, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address'),
  category: text('cateogry'),
  picName: varchar('pic_name', { length: 100 }),
  picPhone: varchar('pic_phone', { length: 20 }),
  email: varchar('email', { length: 255 }).unique(),
  registeredDate: date('registered_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;