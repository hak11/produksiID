import { pgTable, uuid,timestamp } from 'drizzle-orm/pg-core';
import { invoices} from './invoices';
import { deliveryNoteItems } from './deliveryNotes';

export const invoiceDeliveryNotes = pgTable('invoice_dn', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  deliveryNoteItemId: uuid('dn_id').notNull().references(() => deliveryNoteItems.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type InvoiceDeliveryOrder = typeof invoiceDeliveryNotes.$inferSelect;
export type NewInvoiceDeliveryOrder = typeof invoiceDeliveryNotes.$inferInsert;
