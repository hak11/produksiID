import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { deliveryOrders } from './deliveryOrders';
import { drivers } from './drivers';
import { deliveryDriverRoleEnum } from '../enums';

export const deliveryOrderDrivers = pgTable('do_drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  deliveryOrderId: uuid('do_id')
    .references(() => deliveryOrders.id)
    .notNull(),
  driverId: uuid('driver_id')
    .references(() => drivers.id)
    .notNull(),
  role: deliveryDriverRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});