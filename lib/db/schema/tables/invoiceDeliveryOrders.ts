import { pgTable, uuid,timestamp } from 'drizzle-orm/pg-core';
import { invoices} from './invoices';
import { deliveryOrders } from './deliveryOrders';

export const invoiceDeliveryOrders = pgTable('invoice_delivery_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  deliveryOrderId: uuid('delivery_order_id').notNull().references(() => deliveryOrders.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type InvoiceDeliveryOrder = typeof invoiceDeliveryOrders.$inferSelect;
export type NewInvoiceDeliveryOrder = typeof invoiceDeliveryOrders.$inferInsert;
