import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db/prisma";
import { createToken, setAuthCookie } from "@/lib/auth/jwt";
import type { SessionUser } from "@/types";
import { registerSchema } from "@/lib/validations/schemas";
import { createAuditLog } from "@/lib/utils/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0].message,
          fieldErrors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, rollNumber, department, phone } = result.data;

    // Check if email is already registered
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "This email is already registered." },
        { status: 409 }
      );
    }

    // Check roll number uniqueness
    if (rollNumber) {
      const existingRoll = await db.user.findUnique({
        where: { rollNumber },
      });
      if (existingRoll) {
        return NextResponse.json(
          { success: false, error: "This roll number is already registered." },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        rollNumber: rollNumber || null,
        department: department || null,
        phone: phone || null,
        role: "USER",
      },
    });

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
      action: "USER_REGISTERED",
      details: `New user registered: ${user.email}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: { user: sessionUser },
        message: "Account created successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
