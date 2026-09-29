import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260926080924 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "marketplace_order" drop constraint if exists "marketplace_order_order_id_unique";`);
    this.addSql(`alter table if exists "artisan" drop constraint if exists "artisan_email_unique";`);
    this.addSql(`alter table if exists "artisan" drop constraint if exists "artisan_handle_unique";`);
    this.addSql(`create table if not exists "artisan" ("id" text not null, "handle" text not null, "shop_name" text not null, "full_name" text not null, "email" text not null, "phone" text not null, "description" text null, "avatar_url" text null, "pickup_address" text not null, "bank_name" text not null, "bank_account_number" text not null, "bank_account_name" text not null, "status" text check ("status" in ('pending', 'active', 'rejected', 'locked')) not null default 'pending', "status_reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "artisan_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_artisan_handle_unique" ON "artisan" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_artisan_email_unique" ON "artisan" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_artisan_deleted_at" ON "artisan" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "custom_request" ("id" text not null, "customer_id" text not null, "customer_email" text not null, "customer_name" text null, "product_id" text not null, "variant_id" text not null, "product_title" text not null, "thumbnail" text null, "description" text not null, "color" text null, "size" text null, "quantity" integer not null default 1, "status" text check ("status" in ('pending', 'quoted', 'artisan_declined', 'accepted', 'customer_declined', 'ordered')) not null default 'pending', "quoted_price" numeric null, "quoted_lead_days" integer null, "artisan_note" text null, "responded_at" timestamptz null, "decided_at" timestamptz null, "order_id" text null, "artisan_id" text not null, "raw_quoted_price" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "custom_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_custom_request_artisan_id" ON "custom_request" ("artisan_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_custom_request_deleted_at" ON "custom_request" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "marketplace_order" ("id" text not null, "order_id" text not null, "display_id" integer not null, "customer_id" text null, "email" text not null, "currency_code" text not null, "items_total" numeric not null, "payment_method" text check ("payment_method" in ('cod', 'bank_transfer')) not null, "payment_status" text check ("payment_status" in ('cod', 'awaiting_transfer', 'transfer_submitted', 'paid', 'expired', 'rejected')) not null, "payment_deadline" timestamptz null, "transfer_submitted_at" timestamptz null, "paid_at" timestamptz null, "raw_items_total" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "marketplace_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_marketplace_order_order_id_unique" ON "marketplace_order" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_marketplace_order_deleted_at" ON "marketplace_order" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "marketplace_setting" ("id" text not null, "platform_fee_percent" real not null default 0, "admin_email" text null, "bank_name" text null, "bank_code" text null, "bank_account_number" text null, "bank_account_name" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "marketplace_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_marketplace_setting_deleted_at" ON "marketplace_setting" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "payout" ("id" text not null, "period_start" timestamptz not null, "period_end" timestamptz not null, "sub_order_count" integer not null, "gross_amount" numeric not null, "fee_percent" real not null, "fee_amount" numeric not null, "net_amount" numeric not null, "bank_name" text not null, "bank_account_number" text not null, "bank_account_name" text not null, "status" text check ("status" in ('pending', 'paid')) not null default 'pending', "transaction_ref" text null, "paid_at" timestamptz null, "artisan_id" text not null, "raw_gross_amount" jsonb not null, "raw_fee_amount" jsonb not null, "raw_net_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payout_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_artisan_id" ON "payout" ("artisan_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_deleted_at" ON "payout" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "sub_order" ("id" text not null, "code" text not null, "status" text check ("status" in ('pending_payment', 'pending_acceptance', 'processing', 'ready_to_ship', 'shipping', 'delivered', 'completed', 'canceled')) not null, "is_custom" boolean not null default false, "custom_request_id" text null, "made_to_order" boolean not null default false, "lead_days" integer null, "subtotal" numeric not null, "shipping_name" text null, "shipping_phone" text null, "shipping_address" text null, "accept_deadline" timestamptz null, "accepted_at" timestamptz null, "due_date" timestamptz null, "ready_at" timestamptz null, "carrier" text null, "tracking_number" text null, "shipped_at" timestamptz null, "delivered_at" timestamptz null, "complete_at" timestamptz null, "completed_at" timestamptz null, "canceled_at" timestamptz null, "canceled_by" text check ("canceled_by" in ('customer', 'artisan', 'system', 'admin')) null, "cancel_reason" text null, "refund_status" text check ("refund_status" in ('not_required', 'pending', 'refunded')) not null default 'not_required', "refunded_at" timestamptz null, "payout_id" text null, "artisan_id" text not null, "marketplace_order_id" text not null, "raw_subtotal" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "sub_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sub_order_artisan_id" ON "sub_order" ("artisan_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sub_order_marketplace_order_id" ON "sub_order" ("marketplace_order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sub_order_deleted_at" ON "sub_order" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "sub_order_item" ("id" text not null, "line_item_id" text not null, "product_id" text null, "variant_id" text null, "title" text not null, "variant_title" text null, "thumbnail" text null, "made_to_order" boolean not null default false, "quantity" integer not null, "unit_price" numeric not null, "total" numeric not null, "sub_order_id" text not null, "raw_unit_price" jsonb not null, "raw_total" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "sub_order_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sub_order_item_sub_order_id" ON "sub_order_item" ("sub_order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_sub_order_item_deleted_at" ON "sub_order_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "custom_request" add constraint "custom_request_artisan_id_foreign" foreign key ("artisan_id") references "artisan" ("id") on update cascade;`);

    this.addSql(`alter table if exists "payout" add constraint "payout_artisan_id_foreign" foreign key ("artisan_id") references "artisan" ("id") on update cascade;`);

    this.addSql(`alter table if exists "sub_order" add constraint "sub_order_artisan_id_foreign" foreign key ("artisan_id") references "artisan" ("id") on update cascade;`);
    this.addSql(`alter table if exists "sub_order" add constraint "sub_order_marketplace_order_id_foreign" foreign key ("marketplace_order_id") references "marketplace_order" ("id") on update cascade;`);

    this.addSql(`alter table if exists "sub_order_item" add constraint "sub_order_item_sub_order_id_foreign" foreign key ("sub_order_id") references "sub_order" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "custom_request" drop constraint if exists "custom_request_artisan_id_foreign";`);

    this.addSql(`alter table if exists "payout" drop constraint if exists "payout_artisan_id_foreign";`);

    this.addSql(`alter table if exists "sub_order" drop constraint if exists "sub_order_artisan_id_foreign";`);

    this.addSql(`alter table if exists "sub_order" drop constraint if exists "sub_order_marketplace_order_id_foreign";`);

    this.addSql(`alter table if exists "sub_order_item" drop constraint if exists "sub_order_item_sub_order_id_foreign";`);

    this.addSql(`drop table if exists "artisan" cascade;`);

    this.addSql(`drop table if exists "custom_request" cascade;`);

    this.addSql(`drop table if exists "marketplace_order" cascade;`);

    this.addSql(`drop table if exists "marketplace_setting" cascade;`);

    this.addSql(`drop table if exists "payout" cascade;`);

    this.addSql(`drop table if exists "sub_order" cascade;`);

    this.addSql(`drop table if exists "sub_order_item" cascade;`);
  }

}
