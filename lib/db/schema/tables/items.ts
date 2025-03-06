import { pgTable, uuid, varchar, numeric, timestamp, unique } from 'drizzle-orm/pg-core';
import { teams } from './teams';

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  teamId: uuid('team_id')
        .references(() => teams.id),
  price: numeric('price').notNull(),
  unit: varchar('unit'),
  deleted_at: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueTeamName: unique().on(table.name, table.teamId),
}));

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;