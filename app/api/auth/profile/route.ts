import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, isAuthResponse } from "@/lib/auth/middleware";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  department: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, phone, department } = result.data;

    const updated = await db.user.update({
      where: { id: authResult.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(department !== undefined && { department: department || null }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { user: { id: updated.id, name: updated.name, email: updated.email } },
      message: "Profile updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
