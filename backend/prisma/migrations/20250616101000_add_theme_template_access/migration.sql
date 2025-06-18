-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('PERSONAL', 'BUSINESS', 'EDUCATION', 'HEALTH', 'OTHER');

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "TemplateAccess" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,

    CONSTRAINT "TemplateAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateAccess_userId_templateId_key" ON "TemplateAccess"("userId", "templateId");

-- AddForeignKey
ALTER TABLE "TemplateAccess" ADD CONSTRAINT "TemplateAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TemplateAccess" ADD CONSTRAINT "TemplateAccess_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
