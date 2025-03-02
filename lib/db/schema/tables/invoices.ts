import { pgTable, integer, date, text, serial, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';
import { companies} from './companies';
import { invoiceStatusEnum } from '../enums';

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  invoiceDate: date('invoice_date').notNull(),
  dueDate: date('due_date').notNull(),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  totalAmount: numeric('total_amount').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;