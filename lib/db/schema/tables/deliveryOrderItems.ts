import { pgTable, uuid, numeric, timestamp } from 'drizzle-orm/pg-core';
import { deliveryOrders } from './deliveryOrders';

export const deliveryOrderItems = pgTable('delivery_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  doId: uuid('do_id')
    .references(() => deliveryOrders.id)
    .notNull(),
  loadQty: numeric('load_qty').notNull(),
  loadQtyActual: numeric('load_qty_actual'),
  loadPerPrice: numeric('load_per_price').notNull(),
  totalLoadPrice: numeric('total_load_price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type DeliveryOrderItem = typeof deliveryOrderItems.$inferSelect;
export type NewDeliveryOrderItem = typeof deliveryOrderItems.$inferInsert;