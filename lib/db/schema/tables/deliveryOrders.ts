import { pgTable, integer, date, text, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { cars } from './cars';
import { deliveryStatusEnum } from '../enums';

export const deliveryOrders = pgTable('delivery_orders', {
  id: serial('id').primaryKey(),
  orderDate: date('order_date').notNull(),
  supplierId: integer('supplier_id')
    .references(() => companies.id)
    .notNull(),
  customerId: integer('customer_id')
    .references(() => companies.id)
    .notNull(),
  carId: integer('car_id')
    .references(() => cars.id)
    .notNull(),
  deliveryDate: date('delivery_date').notNull(),
  deliveryStatus: deliveryStatusEnum('delivery_status').notNull().default('pending'),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryAddressAttachment: text('delivery_address_attachment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type DeliveryOrder = typeof deliveryOrders.$inferSelect;
export type NewDeliveryOrder = typeof deliveryOrders.$inferInsert;