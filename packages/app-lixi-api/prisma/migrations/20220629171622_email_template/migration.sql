-- CreateTable
CREATE TABLE "email_template" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT E'',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template_translation" (
    "id" TEXT NOT NULL,
    "email_template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "body" TEXT NOT NULL DEFAULT E'',
    "subject" TEXT NOT NULL DEFAULT E'',
    "language" TEXT NOT NULL,
    "is_default" BOOLEAN,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_template_translation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "email_template_translation" ADD CONSTRAINT "email_template_translation_email_template_id_fkey" FOREIGN KEY ("email_template_id") REFERENCES "email_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
