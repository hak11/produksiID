import { pgTable, numeric, timestamp, varchar,uuid } from 'drizzle-orm/pg-core';
import { deliveryOrders } from './deliveryOrders';
import { items } from './items';

export const deliveryOrderItems = pgTable('delivery_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  doId: uuid('do_id')
    .references(() => deliveryOrders.id)
    .notNull(),
  name: varchar('name').default('space'),
  loadQty: numeric('load_qty').notNull(),
  loadPerPrice: numeric('load_per_price').notNull(),
  totalLoadPrice: numeric('total_load_price').notNull(),
  itemId: uuid('item_id')
    .references(() => items.id)
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type DeliveryOrderItem = typeof deliveryOrderItems.$inferSelect;
export type NewDeliveryOrderItem = typeof deliveryOrderItems.$inferInsert;