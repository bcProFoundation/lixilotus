-- CreateEnum
CREATE TYPE "notification_level" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "user_two_factor_type" AS ENUM ('email', 'sms', 'authenticator');

-- CreateTable
CREATE TABLE "handle" (
    "id" TEXT NOT NULL,
    "handle" VARCHAR(150) NOT NULL,
    "handle_number" OID NOT NULL,

    CONSTRAINT "handle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page" (
    "id" TEXT NOT NULL,
    "page_account_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT '',
    "title" VARCHAR(255) NOT NULL DEFAULT '',
    "description" VARCHAR(1000) NOT NULL DEFAULT '',
    "parent_id" TEXT,
    "website" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "encrypted_mnemonic" TEXT NOT NULL,
    "encrypted_secret" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mnemonic_hash" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'en',
    "public_key" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lixi" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "max_claim" INTEGER NOT NULL DEFAULT 0,
    "claimed_num" INTEGER NOT NULL DEFAULT 0,
    "claim_type" INTEGER NOT NULL DEFAULT 0,
    "lixi_type" INTEGER NOT NULL DEFAULT 0,
    "min_value" DOUBLE PRECISION NOT NULL,
    "max_value" DOUBLE PRECISION NOT NULL,
    "fixed_value" DOUBLE PRECISION NOT NULL,
    "divided_value" INTEGER NOT NULL DEFAULT 1,
    "encrypted_xpriv" TEXT NOT NULL,
    "encrypted_claim_code" TEXT NOT NULL,
    "total_claim" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "min_staking" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expiry_at" TIMESTAMPTZ,
    "activation_at" TIMESTAMPTZ,
    "country" TEXT,
    "is_family_friendly" BOOLEAN NOT NULL,
    "join_lottery_program" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "previous_status" TEXT NOT NULL DEFAULT 'active',
    "invetory_status" TEXT NOT NULL DEFAULT 'initialized',
    "account_id" INTEGER NOT NULL,
    "derivation_index" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sub_lixi_value" INTEGER,
    "parent_id" INTEGER,
    "envelope_id" INTEGER,
    "envelope_message" TEXT NOT NULL DEFAULT '',
    "check_claim" BOOLEAN DEFAULT false,
    "is_nft_enabled" BOOLEAN NOT NULL DEFAULT false,
    "number_lixi_per_package" INTEGER,
    "package_id" INTEGER,
    "upload_detail_id" TEXT,
    "network_type" TEXT NOT NULL DEFAULT 'single-ip',

    CONSTRAINT "lixi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claim_address" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "lixi_id" INTEGER NOT NULL,
    "nft_token_id" TEXT,
    "nft_token_url" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envelope" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "envelope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lixi_distribution" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lixiId" INTEGER NOT NULL,

    CONSTRAINT "lixi_distribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_type_translation" (
    "id" SERIAL NOT NULL,
    "notification_type_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "is_default" BOOLEAN,
    "template" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_type_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "readAt" TIMESTAMPTZ,
    "deletedAt" TIMESTAMPTZ,
    "sender_id" INTEGER,
    "additional_data" JSONB,
    "type_id" INTEGER NOT NULL,
    "level" "notification_level" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "recipient_id" INTEGER,
    "url" TEXT,
    "action" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload" (
    "id" TEXT NOT NULL,
    "original_filename" VARCHAR NOT NULL,
    "file_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "url" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "sha" TEXT,
    "extension" VARCHAR(10),
    "thumbnail_width" INTEGER,
    "thumbnail_height" INTEGER,
    "type" VARCHAR(15),

    CONSTRAINT "upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template_translation" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL DEFAULT '',
    "email_template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL,
    "is_default" BOOLEAN,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_template_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "iso3" CHAR(3),
    "iso2" CHAR(2),
    "numeric_code" CHAR(3),
    "phone_code" VARCHAR(255),
    "capital" VARCHAR(255),
    "currency" VARCHAR(255),
    "currency_name" VARCHAR(255),
    "currency_symbol" VARCHAR(255),
    "tld" VARCHAR(255),
    "native" VARCHAR(255),
    "region" VARCHAR(255),
    "sub_region" VARCHAR(255),
    "timezones" TEXT,
    "translations" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "emoji" VARCHAR(191),
    "emoji_u" VARCHAR(191),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flag" BOOLEAN NOT NULL DEFAULT true,
    "wiki_data_id" VARCHAR(255),

    CONSTRAINT "idx_158788_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "state" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "fips_code" VARCHAR(255),
    "iso2" VARCHAR(255),
    "type" VARCHAR(191),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flag" BOOLEAN NOT NULL DEFAULT true,
    "wiki_data_id" VARCHAR(255),
    "country_id" INTEGER NOT NULL,

    CONSTRAINT "idx_158799_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "state_code" VARCHAR(255) NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "flag" BOOLEAN NOT NULL DEFAULT true,
    "wiki_data_id" VARCHAR(255),
    "country_id" INTEGER NOT NULL,
    "state_id" INTEGER NOT NULL,

    CONSTRAINT "idx_158778_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_detail" (
    "id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
    "upload_id" TEXT NOT NULL,
    "lixi_id" INTEGER,
    "page_cover_id" TEXT,
    "page_avatar_id" TEXT,

    CONSTRAINT "upload_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "handle_handle_handle_number_key" ON "handle"("handle", "handle_number");

-- CreateIndex
CREATE UNIQUE INDEX "page_page_account_id_key" ON "page"("page_account_id");

-- CreateIndex
CREATE INDEX "account_mnemonic_hash_idx" ON "account" USING HASH ("mnemonic_hash");

-- CreateIndex
CREATE UNIQUE INDEX "upload_sha_key" ON "upload"("sha");

-- CreateIndex
CREATE INDEX "idx_158799_country_region" ON "state"("country_id");

-- CreateIndex
CREATE INDEX "idx_158778_cities_test_ibfk_1" ON "city"("state_id");

-- CreateIndex
CREATE INDEX "idx_158778_cities_test_ibfk_2" ON "city"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_upload_id_key" ON "upload_detail"("upload_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_lixi_id_key" ON "upload_detail"("lixi_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_page_cover_id_key" ON "upload_detail"("page_cover_id");

-- CreateIndex
CREATE UNIQUE INDEX "upload_detail_page_avatar_id_key" ON "upload_detail"("page_avatar_id");

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_page_account_id_fkey" FOREIGN KEY ("page_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lixi" ADD CONSTRAINT "lixi_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lixi" ADD CONSTRAINT "lixi_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lixi" ADD CONSTRAINT "lixi_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "envelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lixi" ADD CONSTRAINT "lixi_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_lixi_id_fkey" FOREIGN KEY ("lixi_id") REFERENCES "lixi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lixi_distribution" ADD CONSTRAINT "lixi_distribution_lixiId_fkey" FOREIGN KEY ("lixiId") REFERENCES "lixi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_type_translation" ADD CONSTRAINT "notification_type_translation_notification_type_id_fkey" FOREIGN KEY ("notification_type_id") REFERENCES "notification_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "notification_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_translation" ADD CONSTRAINT "email_template_translation_email_template_id_fkey" FOREIGN KEY ("email_template_id") REFERENCES "email_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "state" ADD CONSTRAINT "country_region_final" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "cities_ibfk_2" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "cities_ibfk_1" FOREIGN KEY ("state_id") REFERENCES "state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_lixi_id_fkey" FOREIGN KEY ("lixi_id") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_page_cover_id_fkey" FOREIGN KEY ("page_cover_id") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_detail" ADD CONSTRAINT "upload_detail_page_avatar_id_fkey" FOREIGN KEY ("page_avatar_id") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

