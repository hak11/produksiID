CREATE TABLE "delivery_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"do_id" integer NOT NULL,
	"load_qty" numeric NOT NULL,
	"load_qty_actual" numeric,
	"load_per_price" numeric NOT NULL,
	"total_load_price" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_orders" ADD COLUMN "order_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_orders" ADD COLUMN "order_number" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_orders" ADD COLUMN "delivery_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_orders" ADD COLUMN "delivery_address_attachment" text;--> statement-breakpoint
ALTER TABLE "delivery_order_items" ADD CONSTRAINT "delivery_order_items_do_id_delivery_orders_id_fk" FOREIGN KEY ("do_id") REFERENCES "public"."delivery_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_orders" ADD CONSTRAINT "delivery_orders_order_number_unique" UNIQUE("order_number");