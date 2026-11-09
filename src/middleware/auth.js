import { prisma } from "../db.js";

export function requireAuth(req, res, next) {
  if (!req.isAuthenticated?.() || !req.user?.isActive) {
    return res.status(401).json({ error: "unauthorized", message: "Please sign in to continue." });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "unauthorized", message: "Please sign in." });
    }

    // Map legacy SHOP_ADMIN to STALL_OWNER
    const userRole = req.user.role === "SHOP_ADMIN" ? "STALL_OWNER" : req.user.role;
    const normalizedRoles = roles.map(r => r === "SHOP_ADMIN" ? "STALL_OWNER" : r);

    if (!normalizedRoles.includes(userRole) && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "forbidden", message: "You do not have permission to perform this action." });
    }
    next();
  };
}

export async function requireStallAccess(req, res, next) {
  // Super Admin can access any stall or specified stall via query/body
  if (req.user?.role === "SUPER_ADMIN") {
    const targetStallId = req.params.stallId || req.query.stallId || req.query.shopId || req.body?.stallId || req.body?.shopId || req.user.stallId;
    if (targetStallId) {
      req.stallId = targetStallId;
      req.shopId = targetStallId;
    }
    return next();
  }

  // Tenant Isolation for Stall Owners & Staff
  const userStallId = req.user?.stallId;
  if (!userStallId) {
    return res.status(403).json({ error: "stall_not_assigned", message: "No food stall is assigned to this account." });
  }

  const stall = await prisma.stall.findUnique({
    where: { id: userStallId },
    select: { id: true, status: true, name: true }
  });

  if (!stall || stall.status !== "ACTIVE") {
    return res.status(403).json({
      error: "stall_unavailable",
      message: "This stall is temporarily suspended or inactive. Please contact the platform administrator."
    });
  }

  req.stallId = stall.id;
  req.shopId = stall.id; // alias for backward compatibility
  next();
}

// Backward-compatibility alias
export const requireShopAccess = requireStallAccess;

export function requirePermission(permissionKey) {
  return async (req, res, next) => {
    if (req.user?.role === "SUPER_ADMIN" || req.user?.role === "STALL_OWNER" || req.user?.role === "SHOP_ADMIN") {
      return next();
    }

    const membership = await prisma.stallMember.findUnique({
      where: {
        stallId_userId: {
          stallId: req.stallId,
          userId: req.user.id
        }
      }
    });

    if (!membership || !membership[permissionKey]) {
      return res.status(403).json({
        error: "insufficient_permission",
        message: `Your account role does not have permission to: ${permissionKey}.`
      });
    }

    next();
  };
}
