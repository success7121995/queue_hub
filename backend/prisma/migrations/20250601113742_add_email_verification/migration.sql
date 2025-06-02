/*
  Warnings:

  - The values [ACTIVE] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `tel` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the `AdminActionLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verification_token]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESET_USER_PASSWORD', 'FORCE_LOGOUT_USER', 'CHANGE_USER_ROLE', 'SUSPEND_USER', 'CREATE_MERCHANT', 'UPDATE_MERCHANT', 'DELETE_MERCHANT', 'APPROVE_MERCHANT', 'REJECT_MERCHANT', 'CREATE_QUEUE', 'UPDATE_QUEUE', 'DELETE_QUEUE', 'CLEAR_QUEUE_ENTRIES', 'CREATE_TICKET', 'UPDATE_TICKET', 'CLOSE_TICKET', 'REOPEN_TICKET', 'ASSIGN_TICKET', 'ESCALATE_TICKET', 'MERGE_TICKETS', 'DELETE_TICKET', 'SEND_TICKET_REPLY', 'ADD_INTERNAL_NOTE', 'MARK_TICKET_SPAM', 'ACT_ON_FEEDBACK', 'DELETE_REVIEW', 'RESPOND_TO_FEEDBACK', 'REQUEST_FEEDBACK_REVISION', 'ISSUE_REFUND', 'CANCEL_INVOICE', 'SEND_NOTIFICATION', 'SEND_EMAIL', 'UPDATE_SYSTEM_SETTING', 'CHANGE_SITE_CONTENT', 'EXPORT_DATA', 'IMPORT_DATA', 'LOGIN_ADMIN_PANEL', 'VERIFY_EMAIL');

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('TRIAL', 'ESSENTIAL', 'GROWTH', 'EXPIRED', 'CANCELLED');
ALTER TABLE "Merchant" ALTER COLUMN "subscription_status" DROP DEFAULT;
ALTER TABLE "Merchant" ALTER COLUMN "subscription_status" TYPE "SubscriptionStatus_new" USING ("subscription_status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "SubscriptionStatus_old";
ALTER TABLE "Merchant" ALTER COLUMN "subscription_status" SET DEFAULT 'TRIAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "AdminActionLog" DROP CONSTRAINT "AdminActionLog_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "AdminActionLog" DROP CONSTRAINT "AdminActionLog_affected_user_id_fkey";

-- DropForeignKey
ALTER TABLE "AdminActionLog" DROP CONSTRAINT "AdminActionLog_target_id_fkey";

-- DropIndex
DROP INDEX "Merchant_tel_key";

-- AlterTable
ALTER TABLE "Merchant" DROP COLUMN "address",
DROP COLUMN "tel",
ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_token" TEXT;

-- DropTable
DROP TABLE "AdminActionLog";

-- DropEnum
DROP TYPE "AdminActionType";

-- CreateTable
CREATE TABLE "MerchantAddress" (
    "address_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "save_address" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MerchantAddress_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "MerchantCard" (
    "card_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "card_name" TEXT NOT NULL,
    "card_number" TEXT NOT NULL,
    "expiry_date" TEXT NOT NULL,
    "cvv" TEXT NOT NULL,
    "save_card" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MerchantCard_pkey" PRIMARY KEY ("card_id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "log_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "ActivityType" NOT NULL,
    "action_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_phone_key" ON "Merchant"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_verification_token_key" ON "User"("verification_token");

-- AddForeignKey
ALTER TABLE "MerchantAddress" ADD CONSTRAINT "MerchantAddress_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCard" ADD CONSTRAINT "MerchantCard_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
