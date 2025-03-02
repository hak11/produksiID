import { pgTable, serial, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { roleEnum } from '../enums';

export const companyRoles = pgTable(
  'company_roles',
  {
    id: serial('id').primaryKey(),
    companyId: integer('company_id').notNull().references(() => companies.id),
    role: roleEnum('role').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [{
    unq: unique().on(table.companyId, table.role),
  }]
);