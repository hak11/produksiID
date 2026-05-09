// Re-export types from Supabase for backward compatibility
export type {
  Profile,
  Team,
  TeamMember,
  Driver,
  CustomerSupplier,
  DeliveryNote,
  DeliveryItem,
  Order,
  Invoice,
  InvoiceItem,
  ActivityLog,
  Invitation,
  User,
  TeamDataWithMembers,
  Database,
} from '@/lib/supabase/types';

// Alias types for backward compatibility with existing code
export type {
  Profile as NewUser,
  Team as NewTeam,
  TeamMember as NewTeamMember,
  ActivityLog as NewActivityLog,
  Driver as NewDriver,
  CustomerSupplier as NewCompany,
  DeliveryNote as NewDeliveryNote,
  DeliveryItem as NewDeliveryItem,
  Order as NewOrder,
  Invoice as NewInvoice,
  InvoiceItem as NewInvoiceItem,
  Invitation as NewInvitation,
} from '@/lib/supabase/types';

// Activity type enum
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

// Status enums
export const DeliveryStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
} as const;

export type DeliveryStatusType = typeof DeliveryStatus[keyof typeof DeliveryStatus];

export const DeliveryNoteStatus = {
  DRAFT: 'draft',
  PRINTED: 'printed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type DeliveryNoteStatusType = typeof DeliveryNoteStatus[keyof typeof DeliveryNoteStatus];

export const InvoiceStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export type InvoiceStatusType = typeof InvoiceStatus[keyof typeof InvoiceStatus];

export const Role = {
  SUPPLIER: 'supplier',
  CUSTOMER: 'customer',
} as const;

export type RoleType = typeof Role[keyof typeof Role];

export const TeamRole = {
  ADMIN: 'admin',
  MEMBER: 'member',
  OWNER: 'owner',
} as const;

export type TeamRoleType = typeof TeamRole[keyof typeof TeamRole];

export const DriverRole = {
  MAIN: 'main',
  ASSISTANT: 'assistant',
  BACKUP: 'backup',
} as const;

export type DriverRoleType = typeof DriverRole[keyof typeof DriverRole];

// Tables placeholders for compatibility (not used with Supabase client)
export const users = {} as any;
export const teams = {} as any;
export const teamMembers = {} as any;
export const activityLogs = {} as any;
export const companies = {} as any;
export const drivers = {} as any;
export const deliveryNotes = {} as any;
export const deliveryItems = {} as any;
export const orders = {} as any;
export const invoices = {} as any;
export const invoiceItems = {} as any;
export const invitations = {} as any;
export const teamInvitations = {} as any;
export const items = {} as any;
export const cars = {} as any;
export const deliveryOrders = {} as any;
export const deliveryOrderItems = {} as any;
export const deliveryOrderDrivers = {} as any;
export const driverCarAssignments = {} as any;
export const invoiceDeliveryNotes = {} as any;
export const companyRoles = {} as any;
