-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESET_USER_PASSWORD', 'FORCE_LOGOUT_USER', 'LOGIN_USER', 'LOGOUT_USER', 'VIEW_PROFILE', 'CHANGE_USER_ROLE', 'CHANGE_PASSWORD', 'SUSPEND_USER', 'CREATE_STAFF_USER', 'UPDATE_STAFF_USER', 'DELETE_STAFF_USER', 'RESET_STAFF_USER_PASSWORD', 'FORCE_LOGOUT_STAFF_USER', 'CHANGE_STAFF_USER_ROLE', 'SUSPEND_STAFF_USER', 'CREATE_MERCHANT', 'UPDATE_MERCHANT', 'DELETE_MERCHANT', 'CREATE_BRANCH', 'UPDATE_BRANCH', 'DELETE_BRANCH', 'APPROVE_MERCHANT', 'REJECT_MERCHANT', 'CREATE_QUEUE', 'UPDATE_QUEUE', 'DELETE_QUEUE', 'CLEAR_QUEUE_ENTRIES', 'CREATE_TICKET', 'UPDATE_TICKET', 'CLOSE_TICKET', 'REOPEN_TICKET', 'ASSIGN_TICKET', 'ESCALATE_TICKET', 'MERGE_TICKETS', 'DELETE_TICKET', 'SEND_TICKET_REPLY', 'ADD_INTERNAL_NOTE', 'MARK_TICKET_SPAM', 'ACT_ON_FEEDBACK', 'DELETE_REVIEW', 'RESPOND_TO_FEEDBACK', 'REQUEST_FEEDBACK_REVISION', 'ISSUE_REFUND', 'CANCEL_INVOICE', 'SEND_NOTIFICATION', 'SEND_EMAIL', 'UPDATE_SYSTEM_SETTING', 'CHANGE_SITE_CONTENT', 'EXPORT_DATA', 'IMPORT_DATA', 'LOGIN_ADMIN_PANEL', 'VERIFY_EMAIL', 'OPEN_OR_CLOSE_QUEUE');

-- CreateEnum
CREATE TYPE "AnalyticsType" AS ENUM ('USER', 'MERCHANT', 'QUEUE_SYSTEM');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'PUBLIC_HOLIDAY');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'TABLET', 'DESKTOP', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'FAILED', 'QUEUED');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('RESET_PASSWORD', 'SUPPORT_REPLY', 'RENEWAL_NOTICE', 'VERIFICATION');

-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('QUEUE', 'MERCHANT');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('LOGO', 'IMAGE', 'FEATURE_IMAGE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PAID', 'UNPAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('ZH', 'ZH_CH', 'EN');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('PRIVACY_POLICY', 'TERMS_OF_SERVICE', 'REFUND_POLICY');

-- CreateEnum
CREATE TYPE "MerchantRole" AS ENUM ('OWNER', 'MANAGER', 'FRONTLINE');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('AVG_WAIT_TIME', 'TOTAL_SERVED_TIME', 'PEAK_HOUR', 'NO_SHOW_COUNT', 'AVG_SERVICE_DURATION', 'QUEUE_ABANDON_RATE', 'FEEDBACK_SCORE', 'REORDER_ACTIONS_COUNT', 'AVG_QUEUE_LENGTH', 'NEW_CUSTOMERS_COUNT', 'RETURNING_CUSTOMERS_COUNT', 'QUEUES_CREATED', 'TOP_MERCHANTS_MONTHLY', 'TOP_MERCHANTS_WEEKLY', 'TOP_MERCHANTS_DAILY', 'TOP_MERCHANTS_ANNUALLY', 'ERROR_COUNT', 'TOTAL_MERCHANTS', 'DAILY_ACTIVE_USERS', 'ERROR_RATE', 'UPTIME_PERCENTAGE', 'AVG_SUPPORT_RESPONSE_TIME', 'SYSTEM_THROUGHPUT', 'SUPPORT_TICKER_VOLUME', 'MOST_ACTIVE_REGIONS', 'MERCHANT_APPROVAL_RATE', 'AVG_FEEDBACK_SCORE', 'FEEDBACK_COUNT', 'POSTIVE_RATIO', 'FEEDBACK_RESPONSE_RATE', 'TOTAL_ACCOUNT_DELETIN');

-- CreateEnum
CREATE TYPE "PreferenceType" AS ENUM ('QUEUE_ENTRY', 'MESSAGE', 'FEEDBACK');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "QueueEntryStatus" AS ENUM ('WAITING', 'SERVING', 'DONE', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ESSENTIAL', 'GROWTH', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SystemHealthSource" AS ENUM ('SENTRY', 'UPTIME_ROBOT');

-- CreateEnum
CREATE TYPE "TagEntity" AS ENUM ('MERCHANT', 'QUEUE', 'BRANCH');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'CUSTOMER', 'MERCHANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_AGENT', 'DEVELOPER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'RESOLVED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "AcceptPayment" (
    "payment_id" TEXT NOT NULL,
    "payment_method_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcceptPayment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "APILog" (
    "log_id" TEXT NOT NULL,
    "user_id" TEXT,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "response_time" DOUBLE PRECISION NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APILog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "log_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "ActivityType" NOT NULL,
    "action_data" JSONB NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "status" INTEGER NOT NULL DEFAULT 200,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "Address" (
    "address_id" TEXT NOT NULL,
    "merchant_id" TEXT,
    "branch_id" TEXT,
    "street" TEXT NOT NULL,
    "unit" TEXT,
    "floor" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("address_id")
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
CREATE TABLE "Attachment" (
    "attachment_id" TEXT NOT NULL,
    "ticket_id" TEXT,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message_id" TEXT,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "image_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "branch_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "contact_person_id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("branch_id")
);

-- CreateTable
CREATE TABLE "BranchFeature" (
    "feature_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "is_positive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchFeature_pkey" PRIMARY KEY ("feature_id")
);

-- CreateTable
CREATE TABLE "BranchImage" (
    "image_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_type" "ImageType" NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BranchImage_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "BranchOpeningHour" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "open_time" TIMESTAMP(3) NOT NULL,
    "close_time" TIMESTAMP(3) NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "email_id" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "sender_id" TEXT,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "sent_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failed_reason" TEXT,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("email_id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "template_id" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "template_content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("template_id")
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
CREATE TABLE "FavoriteMercahnt" (
    "favorite_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allow_news_notification" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FavoriteMercahnt_pkey" PRIMARY KEY ("favorite_id")
);

-- CreateTable
CREATE TABLE "HiddenChat" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "other_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiddenChat_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Logo" (
    "logo_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logo_pkey" PRIMARY KEY ("logo_id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "merchant_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "business_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "subscription_start" TIMESTAMP(3),
    "subscription_end" TIMESTAMP(3),
    "auto_renewal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("merchant_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
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
CREATE TABLE "Notification" (
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "redirect_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
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
CREATE TABLE "PasswordReset" (
    "reset_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reset_token" TEXT NOT NULL,
    "reset_token_expiry" TIMESTAMP(3) NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("reset_id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "payment_method_id" TEXT NOT NULL,
    "payment_method_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("payment_method_id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "preference_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "allow_email_notification" BOOLEAN NOT NULL DEFAULT true,
    "allow_inbox_notification" BOOLEAN NOT NULL DEFAULT true,
    "preference_type" "PreferenceType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("preference_id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "queue_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "queue_name" TEXT NOT NULL,
    "queue_status" "QueueStatus" NOT NULL DEFAULT 'CLOSED',
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
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Tag" (
    "tag_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_type" "TagEntity" NOT NULL,
    "tag_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assigned_at" TIMESTAMP(3),
    "assigned_to" TEXT,
    "closed_at" TIMESTAMP(3),
    "closed_by" TEXT,
    "content" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "TicketFollowUp" (
    "follow_up_id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketFollowUp_pkey" PRIMARY KEY ("follow_up_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),
    "lang" "Lang" NOT NULL DEFAULT 'EN',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "UserAdmin" (
    "admin_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "position" TEXT NOT NULL,
    "join_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supervisor_id" TEXT,

    CONSTRAINT "UserAdmin_pkey" PRIMARY KEY ("admin_id")
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

-- CreateTable
CREATE TABLE "UserMerchant" (
    "staff_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "role" "MerchantRole" NOT NULL,
    "join_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selected_branch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMerchant_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "UserMerchantOnBranch" (
    "staff_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMerchantOnBranch_pkey" PRIMARY KEY ("staff_id","branch_id")
);

-- CreateTable
CREATE TABLE "_AttachmentToTicketFollowUp" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AttachmentToTicketFollowUp_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_merchant_id_key" ON "Address"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Address_branch_id_key" ON "Address"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_user_id_key" ON "Avatar"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "HiddenChat_user_id_other_user_id_key" ON "HiddenChat"("user_id", "other_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "Logo_merchant_id_key" ON "Logo"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_owner_id_key" ON "Merchant"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_phone_key" ON "Merchant"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE INDEX "Message_sender_id_created_at_idx" ON "Message"("sender_id", "created_at");

-- CreateIndex
CREATE INDEX "Message_receiver_id_created_at_idx" ON "Message"("receiver_id", "created_at");

-- CreateIndex
CREATE INDEX "Message_sender_id_receiver_id_created_at_idx" ON "Message"("sender_id", "receiver_id", "created_at");

-- CreateIndex
CREATE INDEX "Message_is_read_idx" ON "Message"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "Preference_user_id_key" ON "Preference"("user_id");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_verification_token_key" ON "User"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "UserAdmin_user_id_key" ON "UserAdmin"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_user_id_key" ON "UserDevice"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserMerchant_user_id_key" ON "UserMerchant"("user_id");

-- CreateIndex
CREATE INDEX "_AttachmentToTicketFollowUp_B_index" ON "_AttachmentToTicketFollowUp"("B");

-- AddForeignKey
ALTER TABLE "AcceptPayment" ADD CONSTRAINT "AcceptPayment_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "PaymentMethod"("payment_method_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APILog" ADD CONSTRAINT "APILog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_contact_person_id_fkey" FOREIGN KEY ("contact_person_id") REFERENCES "UserMerchant"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchFeature" ADD CONSTRAINT "BranchFeature_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchImage" ADD CONSTRAINT "BranchImage_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchOpeningHour" ADD CONSTRAINT "BranchOpeningHour_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMercahnt" ADD CONSTRAINT "FavoriteMercahnt_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMercahnt" ADD CONSTRAINT "FavoriteMercahnt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenChat" ADD CONSTRAINT "HiddenChat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "Queue"("queue_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketFollowUp" ADD CONSTRAINT "TicketFollowUp_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdmin" ADD CONSTRAINT "UserAdmin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMerchant" ADD CONSTRAINT "UserMerchant_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("merchant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMerchant" ADD CONSTRAINT "UserMerchant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMerchantOnBranch" ADD CONSTRAINT "UserMerchantOnBranch_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("branch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMerchantOnBranch" ADD CONSTRAINT "UserMerchantOnBranch_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "UserMerchant"("staff_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToTicketFollowUp" ADD CONSTRAINT "_AttachmentToTicketFollowUp_A_fkey" FOREIGN KEY ("A") REFERENCES "Attachment"("attachment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToTicketFollowUp" ADD CONSTRAINT "_AttachmentToTicketFollowUp_B_fkey" FOREIGN KEY ("B") REFERENCES "TicketFollowUp"("follow_up_id") ON DELETE CASCADE ON UPDATE CASCADE;
