import { pgTable, date, text, uuid, varchar, timestamp, unique } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { cars } from './cars';
import { teams } from './teams';
import { deliveryStatusEnum } from '../enums';

export const deliveryOrders = pgTable('delivery_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderDate: date('order_date').notNull(),
  supplierId: uuid('supplier_id')
    .references(() => companies.id)
    .notNull(),
  customerId: uuid('customer_id')
    .references(() => companies.id)
    .notNull(),
  carId: uuid('car_id')
    .references(() => cars.id)
    .notNull(),
  deliveryDate: date('delivery_date').notNull(),
  deliveryStatus: deliveryStatusEnum('delivery_status').notNull().default('pending'),
  orderNumber: varchar('order_number', { length: 50 }).notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryAddressAttachment: text('delivery_address_attachment'),
  teamId: uuid('team_id')
        .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueOrderNumber: unique().on(table.orderNumber, table.teamId),
}));

export type DeliveryOrder = typeof deliveryOrders.$inferSelect;
export type NewDeliveryOrder = typeof deliveryOrders.$inferInsert;