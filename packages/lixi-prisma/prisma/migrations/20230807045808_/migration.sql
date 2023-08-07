/*
  Warnings:

  - You are about to drop the column `lotus_burn_down` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_score` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_up` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_down` on the `hashtag` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_score` on the `hashtag` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_up` on the `hashtag` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_down` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_score` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_up` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_down` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_score` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_up` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_down` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_score` on the `token` table. All the data in the column will be lost.
  - You are about to drop the column `lotus_burn_up` on the `token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comment" DROP COLUMN "lotus_burn_down",
DROP COLUMN "lotus_burn_score",
DROP COLUMN "lotus_burn_up",
ADD COLUMN     "dana_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "hashtag" DROP COLUMN "lotus_burn_down",
DROP COLUMN "lotus_burn_score",
DROP COLUMN "lotus_burn_up",
ADD COLUMN     "dana_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "page" DROP COLUMN "lotus_burn_down",
DROP COLUMN "lotus_burn_score",
DROP COLUMN "lotus_burn_up",
ADD COLUMN     "dana_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "post" DROP COLUMN "lotus_burn_down",
DROP COLUMN "lotus_burn_score",
DROP COLUMN "lotus_burn_up",
ADD COLUMN     "dana_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "token" DROP COLUMN "lotus_burn_down",
DROP COLUMN "lotus_burn_score",
DROP COLUMN "lotus_burn_up",
ADD COLUMN     "dana_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dana_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
