-- CreateTable
CREATE TABLE "WorkspaceInvites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceInvites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceInvites_workspaceId_email_key" ON "WorkspaceInvites"("workspaceId", "email");

-- AddForeignKey
ALTER TABLE "WorkspaceInvites" ADD CONSTRAINT "WorkspaceInvites_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
