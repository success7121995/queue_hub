-- CreateEnum
CREATE TYPE "Title" AS ENUM ('MR', 'MRS', 'MS', 'DR');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'CUSTOMER', 'MERCHANT', 'SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'DEVELOPER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('ZH_HK', 'ZH_TW', 'ZH_CH', 'EN');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MerchantRole" AS ENUM ('OWNER', 'MANAGER', 'FRONTLINE');

-- CreateEnum
CREATE TYPE "QueueEntryStatus" AS ENUM ('WAITING', 'SERVING', 'DONE', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESET_USER_PASSWORD', 'FORCE_LOGOUT_USER', 'CHANGE_USER_ROLE', 'SUSPEND_USER', 'CREATE_MERCHANT', 'UPDATE_MERCHANT', 'DELETE_MERCHANT', 'APPROVE_MERCHANT', 'REJECT_MERCHANT', 'CREATE_QUEUE', 'UPDATE_QUEUE', 'DELETE_QUEUE', 'CLEAR_QUEUE_ENTRIES', 'CREATE_TICKET', 'UPDATE_TICKET', 'CLOSE_TICKET', 'REOPEN_TICKET', 'ASSIGN_TICKET', 'ESCALATE_TICKET', 'MERGE_TICKETS', 'DELETE_TICKET', 'SEND_TICKET_REPLY', 'ADD_INTERNAL_NOTE', 'MARK_TICKET_SPAM', 'ACT_ON_FEEDBACK', 'DELETE_REVIEW', 'RESPOND_TO_FEEDBACK', 'REQUEST_FEEDBACK_REVISION', 'ISSUE_REFUND', 'CANCEL_INVOICE', 'SEND_NOTIFICATION', 'SEND_EMAIL', 'UPDATE_SYSTEM_SETTING', 'CHANGE_SITE_CONTENT', 'EXPORT_DATA', 'IMPORT_DATA', 'LOGIN_ADMIN_PANEL');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PAID', 'UNPAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EmailTemplate" AS ENUM ('RESET_PASSWORD', 'SUPPORT_REPLY', 'RENEWAL_NOTICE', 'VERIFICATION');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'FAILED', 'QUEUED');

-- CreateEnum
CREATE TYPE "AnalyticsType" AS ENUM ('USER', 'MERCHANT', 'QUEUE_SYSTEM');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('AVG_WAIT_TIME', 'TOTAL_SERVED_TIME', 'PEAK_HOUR', 'NO_SHOW_COUNT', 'AVG_SERVICE_DURATION', 'QUEUE_ABANDON_RATE', 'FEEDBACK_SCORE', 'REORDER_ACTIONS_COUNT', 'AVG_QUEUE_LENGTH', 'NEW_CUSTOMERS_COUNT', 'RETURNING_CUSTOMERS_COUNT', 'QUEUES_CREATED', 'TOP_MERCHANTS_MONTHLY', 'TOP_MERCHANTS_WEEKLY', 'TOP_MERCHANTS_DAILY', 'TOP_MERCHANTS_ANNUALLY', 'ERROR_COUNT', 'TOTAL_MERCHANTS', 'DAILY_ACTIVE_USERS', 'ERROR_RATE', 'UPTIME_PERCENTAGE', 'AVG_SUPPORT_RESPONSE_TIME', 'SYSTEM_THROUGHPUT', 'SUPPORT_TICKER_VOLUME', 'MOST_ACTIVE_REGIONS', 'MERCHANT_APPROVAL_RATE', 'AVG_FEEDBACK_SCORE', 'FEEDBACK_COUNT', 'POSTIVE_RATIO', 'FEEDBACK_RESPONSE_RATE', 'TOTAL_ACCOUNT_DELETIN');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('QUEUE', 'MERCHANT');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('LOGO', 'IMAGE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'PUBLIC_HOLIDAY');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'TABLET', 'DESKTOP', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SystemHealthSource" AS ENUM ('SENTRY', 'UPTIME_ROBOT');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'REFUND_POLICY');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "title" "Title" NOT NULL DEFAULT 'MR',
    "username" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
    "registration_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),
    "lang" "Lang" NOT NULL DEFAULT 'EN',

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "oauth_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expiry" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("oauth_id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "merchant_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "business_name" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "subscription_start" TIMESTAMP(3),
    "subscription_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("merchant_id")
);

-- CreateTable
CREATE TABLE "MerchantOpeningHour" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "open_time" TIMESTAMP(3) NOT NULL,
    "close_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantFeature" (
    "feature_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "label" TEXT,
    "is_positive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantFeature_pkey" PRIMARY KEY ("feature_id")
);

-- CreateTable
CREATE TABLE "MerchantImage" (
    "image_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantImage_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "UserMercahnt" (
    "staff_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "role" "MerchantRole" NOT NULL,
    "join_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMercahnt_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "queue_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "queue_name" TEXT NOT NULL,
    "queue_status" "QueueEntryStatus" NOT NULL DEFAULT 'WAITING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("queue_id")
);

-- CreateTable
CREATE TABLE "QueueEntry" (
    "entry_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "queue_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "QueueEntryStatus" NOT NULL DEFAULT 'WAITING',
    "join_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "served_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "QueueEntry_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "FavoriteMercahnt" (
    "favorite_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allow_news_notification" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FavoriteMercahnt_pkey" PRIMARY KEY ("favorite_id")
);

-- CreateTable
CREATE TABLE "QueueReminderOption" (
    "option_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QueueReminderOption_pkey" PRIMARY KEY ("option_key")
);

-- CreateTable
CREATE TABLE "UserQueueReminderReference" (
    "preference_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "option_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQueueReminderReference_pkey" PRIMARY KEY ("preference_id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "log_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "action_type" "AdminActionType" NOT NULL,
    "action_data" JSONB NOT NULL,
    "affected_user_id" TEXT,
    "target_type" "Entity",
    "target_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "AnalyticsLog" (
    "log_id" TEXT NOT NULL,
    "subject_type" "AnalyticsType" NOT NULL,
    "subject_id" TEXT NOT NULL,
    "metric_type" "MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "record_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "SystemHealth" (
    "log_id" TEXT NOT NULL,
    "uptime_percentage" DOUBLE PRECISION NOT NULL,
    "error_count" INTEGER NOT NULL,
    "source" "SystemHealthSource" NOT NULL,
    "source_id" TEXT,
    "source_data" JSONB,
    "monitor_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemHealth_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "reset_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reset_token" TEXT NOT NULL,
    "reset_token_expiry" TIMESTAMP(3) NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("reset_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "email_id" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "sender_id" TEXT,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "template" "EmailTemplate" NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "sent_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failed_reason" TEXT,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("email_id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "invoice_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'HKD',
    "status" "InvoiceStatus" NOT NULL,
    "issued_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_date" TIMESTAMP(3),
    "billing_period_start" TIMESTAMP(3) NOT NULL,
    "billing_period_end" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "auto_renewal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "tag_id" TEXT NOT NULL,
    "tag_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "EntityTag" (
    "id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,

    CONSTRAINT "EntityTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "review_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "reply" TEXT,
    "reply_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "News" (
    "news_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("news_id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "faq_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("faq_id")
);

-- CreateTable
CREATE TABLE "LegalDocuement" (
    "document_id" TEXT NOT NULL,
    "document_type" "LegalDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "language" "Lang" NOT NULL DEFAULT 'EN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocuement_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "payment_method_id" TEXT NOT NULL,
    "payment_method_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("payment_method_id")
);

-- CreateTable
CREATE TABLE "AcceptPayment" (
    "payment_id" TEXT NOT NULL,
    "payment_method_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcceptPayment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "UserDevice" (
    "device_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "platform" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "device_model" TEXT NOT NULL,
    "os_version" TEXT NOT NULL,
    "app_version" TEXT NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "push_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("device_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_tel_key" ON "Merchant"("tel");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOpeningHour" ADD CONSTRAINT "MerchantOpeningHour_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantFeature" ADD CONSTRAINT "MerchantFeature_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantImage" ADD CONSTRAINT "MerchantImage_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMercahnt" ADD CONSTRAINT "UserMercahnt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMercahnt" ADD CONSTRAINT "UserMercahnt_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "Queue"("queue_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMercahnt" ADD CONSTRAINT "FavoriteMercahnt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMercahnt" ADD CONSTRAINT "FavoriteMercahnt_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQueueReminderReference" ADD CONSTRAINT "UserQueueReminderReference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQueueReminderReference" ADD CONSTRAINT "UserQueueReminderReference_option_key_fkey" FOREIGN KEY ("option_key") REFERENCES "QueueReminderOption"("option_key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_affected_user_id_fkey" FOREIGN KEY ("affected_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "Queue"("queue_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Queue"("queue_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityTag" ADD CONSTRAINT "EntityTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("tag_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptPayment" ADD CONSTRAINT "AcceptPayment_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "PaymentMethod"("payment_method_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
