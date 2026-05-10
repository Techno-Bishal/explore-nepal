export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const destination = await prisma.destination.findUnique({
      where: { slug: params?.slug ?? "" },
      select: { id: true },
    });

    if (!destination) {
      return NextResponse.json({ subDestinations: [] });
    }

    const subDestinations = await prisma.subDestination.findMany({
      where: { destinationId: destination.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ subDestinations: subDestinations ?? [] });
  } catch (error: any) {
    console.error("Sub-destinations fetch error:", error);
    return NextResponse.json({ subDestinations: [] });
  }
}
