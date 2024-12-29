CREATE TABLE "cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" varchar(50) NOT NULL,
	"model" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"license_plate" varchar(20) NOT NULL,
	"vin" varchar(17) NOT NULL,
	"color" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"last_maintenance_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cars_license_plate_unique" UNIQUE("license_plate"),
	CONSTRAINT "cars_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE "driver_car_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"car_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"license_number" varchar(50) NOT NULL,
	"date_of_birth" date NOT NULL,
	"contact_number" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"hired_date" date,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_license_number_unique" UNIQUE("license_number"),
	CONSTRAINT "drivers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "driver_car_assignments" ADD CONSTRAINT "driver_car_assignments_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "driver_car_assignments" ADD CONSTRAINT "driver_car_assignments_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;