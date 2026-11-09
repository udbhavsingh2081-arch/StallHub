import { prisma } from "../db.js";

export class AuditLogModel {
  static async log({ req, action, entityType, entityId, stallId, details }) {
    const actorId = req?.user?.id || null;
    return prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        stallId: stallId || req?.stallId || req?.user?.stallId || null,
        actorId,
        details: details || {}
      }
    }).catch(err => {
      console.error("AUDIT_LOG_ERROR:", err.message);
    });
  }

  static async list({ stallId, limit = 100 } = {}) {
    const where = stallId ? { stallId } : {};
    return prisma.auditLog.findMany({
      where,
      take: Number(limit) || 100,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
        stall: { select: { id: true, name: true, slug: true } }
      }
    });
  }
}

export default AuditLogModel;
