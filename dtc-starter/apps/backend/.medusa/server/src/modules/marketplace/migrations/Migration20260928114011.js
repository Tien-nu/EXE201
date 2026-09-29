"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20260928114011 = void 0;
const migrations_1 = require("@medusajs/framework/mikro-orm/migrations");
class Migration20260928114011 extends migrations_1.Migration {
    async up() {
        this.addSql(`alter table if exists "artisan" add column if not exists "pickup_province_name" text null, add column if not exists "pickup_district_id" integer null, add column if not exists "pickup_district_name" text null, add column if not exists "pickup_ward_code" text null, add column if not exists "pickup_ward_name" text null;`);
        this.addSql(`alter table if exists "sub_order" add column if not exists "shipping_fee" numeric null, add column if not exists "expected_delivery_at" timestamptz null, add column if not exists "carrier_status" text null, add column if not exists "raw_shipping_fee" jsonb null;`);
    }
    async down() {
        this.addSql(`alter table if exists "artisan" drop column if exists "pickup_province_name", drop column if exists "pickup_district_id", drop column if exists "pickup_district_name", drop column if exists "pickup_ward_code", drop column if exists "pickup_ward_name";`);
        this.addSql(`alter table if exists "sub_order" drop column if exists "shipping_fee", drop column if exists "expected_delivery_at", drop column if exists "carrier_status", drop column if exists "raw_shipping_fee";`);
    }
}
exports.Migration20260928114011 = Migration20260928114011;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlncmF0aW9uMjAyNjA5MjgxMTQwMTEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tYXJrZXRwbGFjZS9taWdyYXRpb25zL01pZ3JhdGlvbjIwMjYwOTI4MTE0MDExLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlFQUFxRTtBQUVyRSxNQUFhLHVCQUF3QixTQUFRLHNCQUFTO0lBRTNDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpVUFBaVUsQ0FBQyxDQUFDO1FBRS9VLElBQUksQ0FBQyxNQUFNLENBQUMsd1FBQXdRLENBQUMsQ0FBQztJQUN4UixDQUFDO0lBRVEsS0FBSyxDQUFDLElBQUk7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyw2UEFBNlAsQ0FBQyxDQUFDO1FBRTNRLElBQUksQ0FBQyxNQUFNLENBQUMseU1BQXlNLENBQUMsQ0FBQztJQUN6TixDQUFDO0NBRUY7QUFkRCwwREFjQyJ9