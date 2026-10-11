-- No collaboration: a workspace belongs to its single user, roles are no longer needed.
-- AlterTable
ALTER TABLE "UserWorkspace" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";
