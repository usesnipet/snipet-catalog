/*
  Warnings:

  - You are about to drop the column `background` on the `plugin_versions` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `plugin_versions` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `plugin_versions` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `plugin_versions` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `plugin_versions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[latestPluginVersionId]` on the table `plugins` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `background` to the `plugins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `plugins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `plugins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `plugins` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "plugin_versions" DROP CONSTRAINT "plugin_versions_pluginId_fkey";

-- AlterTable
ALTER TABLE "plugin_versions" DROP COLUMN "background",
DROP COLUMN "description",
DROP COLUMN "icon",
DROP COLUMN "name",
DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "plugins" ADD COLUMN     "background" VARCHAR(255) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "icon" VARCHAR(255) NOT NULL,
ADD COLUMN     "latestPluginVersionId" UUID,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "tags" VARCHAR(255)[];

-- CreateIndex
CREATE UNIQUE INDEX "plugins_latestPluginVersionId_key" ON "plugins"("latestPluginVersionId");

-- AddForeignKey
ALTER TABLE "plugins" ADD CONSTRAINT "plugins_latestPluginVersionId_fkey" FOREIGN KEY ("latestPluginVersionId") REFERENCES "plugin_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_versions" ADD CONSTRAINT "plugin_versions_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
