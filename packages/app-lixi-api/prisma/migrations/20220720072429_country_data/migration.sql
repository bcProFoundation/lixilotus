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

-- CreateIndex
CREATE INDEX "idx_158799_country_region" ON "state"("country_id");

-- CreateIndex
CREATE INDEX "idx_158778_cities_test_ibfk_1" ON "city"("state_id");

-- CreateIndex
CREATE INDEX "idx_158778_cities_test_ibfk_2" ON "city"("country_id");

-- AddForeignKey
ALTER TABLE "state" ADD CONSTRAINT "country_region_final" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "cities_ibfk_2" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "cities_ibfk_1" FOREIGN KEY ("state_id") REFERENCES "state"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
