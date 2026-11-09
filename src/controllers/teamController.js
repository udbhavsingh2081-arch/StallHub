import { prisma } from "../db.js";
import { UserModel } from "../models/UserModel.js";
import { AuditLogModel } from "../models/AuditLogModel.js";

export class TeamController {
  static async listMembers(req, res) {
    const members = await prisma.stallMember.findMany({
      where: { stallId: req.stallId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });
    res.json({ members });
  }

  static async inviteStaff(req, res) {
    try {
      const { name, email, password, role, permissions } = req.body;
      if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
        return res.status(400).json({ message: "Name, email, and password of at least 8 characters are required." });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email address already exists." });
      }

      const { user, member } = await UserModel.createStaffMember({
        stallId: req.stallId,
        name,
        email,
        password,
        role: role === "MANAGER" ? "MANAGER" : "STAFF",
        permissions: permissions || {}
      });

      await AuditLogModel.log({
        req,
        action: "STAFF_INVITED",
        entityType: "StallMember",
        entityId: member.id,
        stallId: req.stallId,
        details: { email: user.email, role: member.role }
      });

      res.status(201).json({
        user: UserModel.sanitize(user),
        member
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async updatePermissions(req, res) {
    try {
      const member = await prisma.stallMember.findFirst({
        where: { id: req.params.id, stallId: req.stallId }
      });
      if (!member) return res.status(404).json({ message: "Team member not found." });
      if (member.role === "OWNER") return res.status(400).json({ message: "Owner permissions cannot be altered." });

      const allowed = ["canAddItems", "canEditPrices", "canManageCategories", "canCustomizeMenu"];
      const updateData = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => allowed.includes(k))
      );

      const updated = await prisma.stallMember.update({
        where: { id: member.id },
        data: updateData
      });

      await AuditLogModel.log({
        req,
        action: "STAFF_PERMISSIONS_UPDATED",
        entityType: "StallMember",
        entityId: member.id,
        stallId: req.stallId,
        details: updateData
      });

      res.json({ member: updated });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async removeMember(req, res) {
    try {
      const member = await prisma.stallMember.findFirst({
        where: { id: req.params.id, stallId: req.stallId }
      });
      if (!member) return res.status(404).json({ message: "Team member not found." });
      if (member.role === "OWNER") return res.status(400).json({ message: "Cannot remove stall owner." });

      await prisma.stallMember.delete({ where: { id: member.id } });
      await prisma.user.delete({ where: { id: member.userId } });

      await AuditLogModel.log({
        req,
        action: "STAFF_REMOVED",
        entityType: "StallMember",
        entityId: member.id,
        stallId: req.stallId
      });

      res.json({ message: "Staff member removed successfully." });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default TeamController;
