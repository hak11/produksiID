CREATE TYPE "public"."driver_role_enum" AS ENUM('main', 'assistant', 'backup');--> statement-breakpoint
CREATE TYPE "public"."dn_status_enum" AS ENUM('draft', 'printed', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."delivery_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."invoice_status_enum" AS ENUM('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('supplier', 'customer');--> statement-breakpoint
CREATE TYPE "public"."role_team_enum" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"team_id" uuid,
	"price" numeric NOT NULL,
	"unit" varchar,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "items_name_team_id_unique" UNIQUE("name","team_id")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"invoice_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" "invoice_status_enum" DEFAULT 'draft' NOT NULL,
	"total_amount" numeric NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_team_id_unique" UNIQUE("invoice_number","team_id")
);
--> statement-breakpoint
CREATE TABLE "do" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_date" date NOT NULL,
	"supplier_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"car_id" uuid NOT NULL,
	"delivery_date" date NOT NULL,
	"delivery_status" "delivery_status_enum" DEFAULT 'pending' NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"delivery_address" text NOT NULL,
	"delivery_address_attachment" text,
	"team_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "do_order_number_team_id_unique" UNIQUE("order_number","team_id")
);
--> statement-breakpoint
CREATE TABLE "do_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"do_id" uuid NOT NULL,
	"name" varchar DEFAULT 'space',
	"load_qty" numeric NOT NULL,
	"load_per_price" numeric NOT NULL,
	"total_load_price" numeric NOT NULL,
	"item_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"address" text,
	"cateogry" text,
	"pic_name" varchar(100),
	"pic_phone" varchar(20),
	"email" varchar(255),
	"registered_date" date NOT NULL,
	"team_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_email_team_id_unique" UNIQUE("email","team_id")
);
--> statement-breakpoint
CREATE TABLE "company_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"role" "role_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100),
	"phone" varchar(15),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role_team_enum" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_product_id" text,
	"plan_name" varchar(50),
	"subscription_status" varchar(20),
	CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"role" "role_team_enum" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" varchar(50) NOT NULL,
	"model" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"license_plate" varchar(20) NOT NULL,
	"vin" varchar(17) NOT NULL,
	"color" varchar(20),
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"last_maintenance_date" date,
	"team_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cars_license_plate_team_id_unique" UNIQUE("license_plate","team_id"),
	CONSTRAINT "cars_vin_team_id_unique" UNIQUE("vin","team_id")
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"license_number" varchar(50) NOT NULL,
	"date_of_birth" date NOT NULL,
	"contact_number" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"hired_date" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"team_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_license_number_team_id_unique" UNIQUE("license_number","team_id"),
	CONSTRAINT "drivers_email_team_id_unique" UNIQUE("email","team_id")
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"team_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"invited_by" uuid NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_dn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"dn_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "do_drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"do_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"role" "driver_role_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dn_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dn_id" uuid NOT NULL,
	"do_id" uuid NOT NULL,
	"do_item_id" uuid NOT NULL,
	"actual_qty" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"note_number" varchar(50) NOT NULL,
	"issue_date" date NOT NULL,
	"status" "dn_status_enum" DEFAULT 'draft' NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dn_note_number_team_id_unique" UNIQUE("note_number","team_id")
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do" ADD CONSTRAINT "do_supplier_id_companies_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do" ADD CONSTRAINT "do_customer_id_companies_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do" ADD CONSTRAINT "do_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do" ADD CONSTRAINT "do_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do_items" ADD CONSTRAINT "do_items_do_id_do_id_fk" FOREIGN KEY ("do_id") REFERENCES "public"."do"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do_items" ADD CONSTRAINT "do_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_roles" ADD CONSTRAINT "company_roles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_dn" ADD CONSTRAINT "invoice_dn_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_dn" ADD CONSTRAINT "invoice_dn_dn_id_dn_items_id_fk" FOREIGN KEY ("dn_id") REFERENCES "public"."dn_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do_drivers" ADD CONSTRAINT "do_drivers_do_id_do_id_fk" FOREIGN KEY ("do_id") REFERENCES "public"."do"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do_drivers" ADD CONSTRAINT "do_drivers_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dn_items" ADD CONSTRAINT "dn_items_dn_id_dn_id_fk" FOREIGN KEY ("dn_id") REFERENCES "public"."dn"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dn_items" ADD CONSTRAINT "dn_items_do_id_do_id_fk" FOREIGN KEY ("do_id") REFERENCES "public"."do"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dn_items" ADD CONSTRAINT "dn_items_do_item_id_do_items_id_fk" FOREIGN KEY ("do_item_id") REFERENCES "public"."do_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dn" ADD CONSTRAINT "dn_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;