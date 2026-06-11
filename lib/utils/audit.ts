import db from "@/lib/db/prisma";
import type { AuditAction } from "@/types";

interface CreateAuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // Don't let audit log failures break the main flow
    console.error("Failed to create audit log:", error);
  }
}

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || "info",
        link: params.link,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
