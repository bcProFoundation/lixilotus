-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "state_id" INTEGER NOT NULL,
    "state_code" VARCHAR(255) NOT NULL,
    "country_id" INTEGER NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "flag" BOOLEAN NOT NULL DEFAULT true,
    "wikidataid" VARCHAR(255),

    CONSTRAINT "idx_158778_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "iso3" CHAR(3),
    "numeric_code" CHAR(3),
    "iso2" CHAR(2),
    "phonecode" VARCHAR(255),
    "capital" VARCHAR(255),
    "currency" VARCHAR(255),
    "currency_name" VARCHAR(255),
    "currency_symbol" VARCHAR(255),
    "tld" VARCHAR(255),
    "native" VARCHAR(255),
    "region" VARCHAR(255),
    "subregion" VARCHAR(255),
    "timezones" TEXT,
    "translations" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "emoji" VARCHAR(191),
    "emojiu" VARCHAR(191),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flag" BOOLEAN NOT NULL DEFAULT true,
    "wikidataid" VARCHAR(255),

    CONSTRAINT "idx_158788_primary" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country_id" INTEGER NOT NULL,
    "country_code" CHAR(2) NOT NULL,
    "fips_code" VARCHAR(255),
    "iso2" VARCHAR(255),
    "type" VARCHAR(191),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flag" BOOLEAN NOT NULL DEFAULT true,
    "wikidataid" VARCHAR(255),

    CONSTRAINT "idx_158799_primary" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_158778_cities_test_ibfk_1" ON "cities"("state_id");

-- CreateIndex
CREATE INDEX "idx_158778_cities_test_ibfk_2" ON "cities"("country_id");

-- CreateIndex
CREATE INDEX "idx_158799_country_region" ON "states"("country_id");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_ibfk_2" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_ibfk_1" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "country_region_final" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
