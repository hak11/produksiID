CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"price" numeric NOT NULL,
	"unit" varchar,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."invoice_type_enum";