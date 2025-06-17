CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"housing_id" integer NOT NULL,
	"housing_name" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"check_in" varchar(50) NOT NULL,
	"check_out" varchar(50) NOT NULL,
	"booking_date" timestamp DEFAULT now(),
	"booking_number" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"guest_name" varchar(255) NOT NULL,
	"guest_phone" varchar(50) NOT NULL,
	"guest_count" integer NOT NULL,
	"special_needs" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
--> statement-breakpoint
CREATE TABLE "housings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"images" text[],
	"location" varchar(255) NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"distance" integer NOT NULL,
	"rooms" integer NOT NULL,
	"capacity" integer NOT NULL,
	"availability" varchar(50) DEFAULT 'available' NOT NULL,
	"available_from" varchar(50) NOT NULL,
	"amenities" text[],
	"support" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"sender_name" varchar(255) NOT NULL,
	"sender_role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"is_read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"password" varchar(255) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_housing_id_housings_id_fk" FOREIGN KEY ("housing_id") REFERENCES "public"."housings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;