import bcrypt from "bcryptjs";
import { prisma } from "../db.js";

export class UserModel {
  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        stall: { select: { id: true, name: true, slug: true, status: true } },
        memberships: {
          include: { stall: { select: { id: true, name: true, slug: true, status: true } } }
        }
      }
    });
  }

  static async findByEmail(email) {
    if (!email) return null;
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        stall: true,
        memberships: { include: { stall: true } }
      }
    });
  }

  static async createOwner({ name, email, password, stallId, phone }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "STALL_OWNER",
        phone,
        stallId
      }
    });

    if (stallId) {
      await prisma.stallMember.create({
        data: {
          stallId,
          userId: user.id,
          role: "OWNER",
          canAddItems: true,
          canEditPrices: true,
          canManageCategories: true,
          canCustomizeMenu: true,
          canManageStaff: true
        }
      });
    }

    return user;
  }

  static async createStaffMember({ stallId, name, email, password, role = "STAFF", permissions = {} }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: role === "MANAGER" ? "STALL_MANAGER" : "STALL_STAFF",
        stallId
      }
    });

    const isManager = role === "MANAGER";
    const member = await prisma.stallMember.create({
      data: {
        stallId,
        userId: user.id,
        role: isManager ? "MANAGER" : "STAFF",
        canAddItems: permissions.canAddItems ?? true,
        canEditPrices: isManager ? true : (permissions.canEditPrices ?? false),
        canManageCategories: isManager ? true : (permissions.canManageCategories ?? false),
        canCustomizeMenu: false,
        canManageStaff: false
      }
    });

    return { user, member };
  }

  static async verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  static sanitize(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export default UserModel;
