export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const destination = await prisma.destination.findUnique({
      where: { slug: params.slug },
      include: { categories: { include: { category: true } } },
    });
    if (!destination) {
      return NextResponse.json({ destinations: [] });
    }
    const catIds = destination.categories.map((c: any) => c.categoryId);
    const related = await prisma.destination.findMany({
      where: {
        id: { not: destination.id },
        categories: { some: { categoryId: { in: catIds } } },
      },
      include: { categories: { include: { category: true } } },
      take: 4,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ destinations: related });
  } catch (e: any) {
    console.error("Related destinations error:", e);
    return NextResponse.json({ destinations: [] });
  }
}
