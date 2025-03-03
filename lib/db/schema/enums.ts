import { pgEnum } from 'drizzle-orm/pg-core';

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

export const roleEnum = pgEnum('role_enum', ['supplier', 'customer']);

export const roleTeamEnum = pgEnum('role_team_enum', ['admin', 'member']);

export const invoiceStatusEnum = pgEnum('invoice_status_enum', [
  'draft',
  'sent',
  'paid',
  'partial',
  'overdue',
  'cancelled'
]);

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