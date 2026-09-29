import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260928114011 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "artisan" add column if not exists "pickup_province_name" text null, add column if not exists "pickup_district_id" integer null, add column if not exists "pickup_district_name" text null, add column if not exists "pickup_ward_code" text null, add column if not exists "pickup_ward_name" text null;`);

    this.addSql(`alter table if exists "sub_order" add column if not exists "shipping_fee" numeric null, add column if not exists "expected_delivery_at" timestamptz null, add column if not exists "carrier_status" text null, add column if not exists "raw_shipping_fee" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "artisan" drop column if exists "pickup_province_name", drop column if exists "pickup_district_id", drop column if exists "pickup_district_name", drop column if exists "pickup_ward_code", drop column if exists "pickup_ward_name";`);

    this.addSql(`alter table if exists "sub_order" drop column if exists "shipping_fee", drop column if exists "expected_delivery_at", drop column if exists "carrier_status", drop column if exists "raw_shipping_fee";`);
  }

}
