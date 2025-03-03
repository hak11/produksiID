import { pgTable, date, text, uuid, varchar, numeric, timestamp,unique } from 'drizzle-orm/pg-core';
import { teams } from './teams';
import { invoiceStatusEnum } from '../enums';

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  invoiceDate: date('invoice_date').notNull(),
  dueDate: date('due_date').notNull(),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  totalAmount: numeric('total_amount').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueInvoiceNumber: unique().on(table.invoiceNumber, table.teamId),
}));

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;