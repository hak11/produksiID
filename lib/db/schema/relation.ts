import { relations } from 'drizzle-orm';
import { users } from './tables/users';
import { teams } from './tables/teams';
import { cars } from './tables/cars';
import { drivers } from './tables/drivers';
import { teamMembers } from './tables/teamMembers';
import { activityLogs } from './tables/activityLogs';
import { invitations } from './tables/invitations';
import { deliveryOrders } from './tables/deliveryOrders';
import { deliveryNoteItems, deliveryNotes } from './tables/deliveryNotes';
import { invoiceDeliveryNotes } from './tables/invoiceDeliveryNotes';
import { invoices } from './tables/invoices';
import { deliveryOrderItems } from './tables/deliveryOrderItems';
import { deliveryOrderDrivers } from './tables/deliveryOrderDrivers';
import { companies } from './tables/companies';
import { companyRoles } from './tables/companyRoles';
import { driverCarAssignments } from './tables/driverCarAssignments';

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
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


export const invoicesRelations = relations(invoices, ({ many }) => ({
  invoiceDeliveryNotes: many(invoiceDeliveryNotes),
}));

export const invoiceDeliveryNotesRelations = relations(invoiceDeliveryNotes, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceDeliveryNotes.invoiceId],
    references: [invoices.id],
  }),
  deliveryNoteItems: one(deliveryNoteItems, {
    fields: [invoiceDeliveryNotes.deliveryNoteItemId],
    references: [deliveryNoteItems.id],
  }),
}));

export const deliveryNoteRelations = relations(deliveryNotes, ({ many }) => ({
  deliveryNoteItems: many(deliveryNoteItems),
}));

export const deliveryNoteItemsRelations = relations(deliveryNoteItems, ({ one }) => ({
  deliveryNote: one(deliveryNotes, {
    fields: [deliveryNoteItems.deliveryNoteId],
    references: [deliveryNotes.id],
  }),
  deliveryOrderItems: one(deliveryOrderItems, {
    fields: [deliveryNoteItems.deliveryOrderItemId],
    references: [deliveryOrderItems.id],
  }),
  invoiceItem: one(invoiceDeliveryNotes, {
    fields: [deliveryNoteItems.id],
    references: [invoiceDeliveryNotes.deliveryNoteItemId],
  })
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
  assignments: many(driverCarAssignments)
}));

export const carsRelations = relations(cars, ({ many }) => ({
  assignments: many(driverCarAssignments)
}));

export const driverCarAssignmentsRelations = relations(driverCarAssignments, ({ one }) => ({
  driver: one(drivers, {
    fields: [driverCarAssignments.driverId],
    references: [drivers.id],
  }),
  car: one(cars, {
    fields: [driverCarAssignments.carId],
    references: [cars.id],
  })
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