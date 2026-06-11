import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db/prisma";
import { createToken, setAuthCookie } from "@/lib/auth/jwt";
import type { SessionUser } from "@/types";
import { loginSchema } from "@/lib/validations/schemas";
import { createAuditLog } from "@/lib/utils/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as SessionUser["role"],
      department: user.department,
    };

    const token = await createToken(sessionUser);
    await setAuthCookie(token);

    await createAuditLog({
      userId: user.id,
      action: "USER_LOGIN",
      details: `User logged in: ${user.email}`,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      success: true,
      data: { user: sessionUser },
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
