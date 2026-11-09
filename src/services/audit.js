import { prisma } from "../db.js";

export async function writeAudit({ req, action, entityType, entityId = null, shopId = null, details = {} }) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      shopId,
      actorId: req.user?.id ?? null,
      details
    }
  });
}
