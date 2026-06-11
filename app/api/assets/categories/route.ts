import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, requireAdmin, isAuthResponse } from "@/lib/auth/middleware";
import { createCategorySchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  const categories = await db.category.findMany({
    include: {
      _count: { select: { assets: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, data: { categories } });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const body = await request.json();
  const result = createCategorySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const category = await db.category.create({ data: result.data });
    return NextResponse.json(
      { success: true, data: { category } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Category name already exists" },
      { status: 409 }
    );
  }
}
