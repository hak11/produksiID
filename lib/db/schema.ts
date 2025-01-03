import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  date,
  pgEnum,
  unique,
  numeric
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role_enum', ['supplier', 'customer']);

export const deliveryStatusEnum = pgEnum('delivery_status_enum', [
  'pending',    // Pengiriman belum dimulai
  'in_progress', // Pengiriman sedang berlangsung
  'completed',  // Pengiriman selesai
  'canceled',   // Pengiriman dibatalkan
]);

export const deliveryDriverRoleEnum = pgEnum('delivery_driver_role_enum', [
  'main',      // Driver utama
  'assistant', // Driver pendamping
  'backup',    // Driver cadangan
]);

export const invoiceStatusEnum = pgEnum('invoice_status_enum', [
  'draft',
  'sent',
  'paid',
  'partial',
  'overdue',
  'cancelled'
]);

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  price: numeric('price').notNull(),
  unit: varchar('unit'),
  deleted_at: timestamp('deleted_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

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

export const invoiceDeliveryOrders = pgTable('invoice_delivery_orders', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  deliveryOrderId: integer('delivery_order_id').notNull().references(() => deliveryOrders.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const deliveryOrderItems = pgTable('delivery_order_items', {
  id: serial('id').primaryKey(),
  doId: integer('do_id')
    .references(() => deliveryOrders.id)
    .notNull(),
  loadQty: numeric('load_qty').notNull(),
  loadQtyActual: numeric('load_qty_actual'),
  loadPerPrice: numeric('load_per_price').notNull(),
  totalLoadPrice: numeric('total_load_price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address').notNull(),
  picName: varchar('pic_name', { length: 100 }).notNull(),
  picPhone: varchar('pic_phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  registeredDate: date('registered_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const companyRoles = pgTable(
  'company_roles',
  {
    id: serial('id').primaryKey(),
    companyId: integer('company_id').notNull().references(() => companies.id),
    role: roleEnum('role').notNull(), // Gunakan ENUM sebagai tipe data
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [{
    unq: unique().on(table.companyId, table.role),
  }]
);

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

export const deliveryOrderDrivers = pgTable('delivery_order_drivers', {
  id: serial('id').primaryKey(),
  deliveryOrderId: integer('delivery_order_id')
    .references(() => deliveryOrders.id)
    .notNull(),
  driverId: integer('driver_id')
    .references(() => drivers.id)
    .notNull(),
  role: deliveryDriverRoleEnum('role').notNull(), // Gunakan ENUM
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});


export const drivers = pgTable('drivers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }).notNull().unique(),
  dateOfBirth: date('date_of_birth').notNull(),
  contactNumber: varchar('contact_number', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  address: text('address').notNull(),
  hiredDate: date('hired_date'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cars = pgTable('cars', {
  id: serial('id').primaryKey(),
  brand: varchar('brand', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  year: integer('year').notNull(),
  licensePlate: varchar('license_plate', { length: 20 }).notNull().unique(),
  vin: varchar('vin', { length: 17 }).notNull().unique(),
  color: varchar('color', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('available'),
  lastMaintenanceDate: date('last_maintenance_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const driver_car_assignments = pgTable('driver_car_assignments', {
  id: serial('id').primaryKey(),
  carId: integer('car_id')
    .notNull()
    .references(() => cars.id),
  driverId: integer('driver_id')
    .notNull()
    .references(() => drivers.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const invoicesRelations = relations(invoices, ({ many }) => ({
  deliveryOrders: many(invoiceDeliveryOrders),
}));

export const invoiceDeliveryOrdersRelations = relations(invoiceDeliveryOrders, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceDeliveryOrders.invoiceId],
    references: [invoices.id],
  }),
  deliveryOrder: one(deliveryOrders, {
    fields: [invoiceDeliveryOrders.deliveryOrderId],
    references: [deliveryOrders.id],
  }),
}));

export const deliveryOrderItemsRelations = relations(deliveryOrderItems, ({ one }) => ({
  deliveryOrder: one(deliveryOrders, {
    fields: [deliveryOrderItems.doId],
    references: [deliveryOrders.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  roles: many(companyRoles),
}));

export const companyRolesRelations = relations(companyRoles, ({ one }) => ({
  company: one(companies, {
    fields: [companyRoles.companyId],
    references: [companies.id],
  }),
}));

export const deliveryOrdersRelations = relations(deliveryOrders, ({ many, one }) => ({
  drivers: many(deliveryOrderDrivers),
  supplier: one(companies, {
    fields: [deliveryOrders.supplierId],
    references: [companies.id],
  }),
  customer: one(companies, {
    fields: [deliveryOrders.customerId],
    references: [companies.id],
  }),
  car: one(cars, {
    fields: [deliveryOrders.carId],
    references: [cars.id],
  }),
}));

export const deliveryDriversRelations = relations(drivers, ({ many }) => ({
  deliveryOrders: many(deliveryOrderDrivers),
}));

export const deliveryOrderDriversRelations = relations(deliveryOrderDrivers, ({ one }) => ({
  deliveryOrder: one(deliveryOrders, {
    fields: [deliveryOrderDrivers.deliveryOrderId],
    references: [deliveryOrders.id],
  }),
  driver: one(drivers, {
    fields: [deliveryOrderDrivers.driverId],
    references: [drivers.id],
  }),
}));

export const driversRelations = relations(drivers, ({ many }) => ({
  assignments: many(driver_car_assignments)
}));

export const carsRelations = relations(cars, ({ many }) => ({
  assignments: many(driver_car_assignments)
}));

export const driver_car_assignmentsRelations = relations(driver_car_assignments, ({ one }) => ({
  driver: one(drivers, {
    fields: [driver_car_assignments.driverId],
    references: [drivers.id],
  }),
  car: one(cars, {
    fields: [driver_car_assignments.carId],
    references: [cars.id],
  })
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type DeliveryOrder = typeof deliveryOrders.$inferSelect;
export type NewDeliveryOrder = typeof deliveryOrders.$inferInsert;
export type CarDriverAssignment = typeof driver_car_assignments.$inferSelect;
export type NewCarDriverAssignment = typeof driver_car_assignments.$inferInsert;
export type DeliveryOrderItem = typeof deliveryOrderItems.$inferSelect;
export type NewDeliveryOrderItem = typeof deliveryOrderItems.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceDeliveryOrder = typeof invoiceDeliveryOrders.$inferSelect;
export type NewInvoiceDeliveryOrder = typeof invoiceDeliveryOrders.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type DeliveryOrderDetailType = DeliveryOrder & {
  supplierName: string
  customerName: string
  carInfo: string
  items: (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string })[]
}

export type InvoicesDetailType = Invoice & {
  invoiceDetailDO: DeliveryOrder[]
}

export type DetailDOType = DeliveryOrder & {
  supplier: Company
  customer: Company
  car: (Car & { driver: Driver[] })
  items: (DeliveryOrderItem & { loadPerPriceStr: string, totalLoadPriceStr: string, nameItem?: string })[]
}


export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
