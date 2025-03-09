import { pgTable, uuid, varchar, timestamp, date, text, unique, numeric } from "drizzle-orm/pg-core";
import { deliveryOrders } from "./deliveryOrders";
import { teams } from "./teams";
import { deliveryNoteStatusEnum } from "../enums";
import { deliveryOrderItems } from "./deliveryOrderItems";

export const deliveryNotes = pgTable('delivery_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => teams.id),
  noteNumber: varchar('note_number', { length: 50 }).notNull(),
  issueDate: date('issue_date').notNull(),
  status: deliveryNoteStatusEnum('status').notNull().default('draft'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueNoteNumber: unique().on(table.noteNumber, table.teamId),
}));

export const deliveryNoteItems = pgTable('delivery_note_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  deliveryNoteId: uuid('delivery_note_id').notNull().references(() => deliveryNotes.id),
  deliveryOrderId: uuid('delivery_order_id').notNull().references(() => deliveryOrders.id),
  deliveryOrderItemId: uuid('delivery_order_item_id').notNull().references(() => deliveryOrderItems.id),
  actualQty: numeric('actual_qty'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


export type DeliveryNotes = typeof deliveryNotes.$inferSelect;
export type NewDeliverNotes = typeof deliveryNotes.$inferInsert;

export type DeliveryNoteItems = typeof deliveryNoteItems.$inferSelect;
export type NewDeliverNoteItems = typeof deliveryNoteItems.$inferInsert;