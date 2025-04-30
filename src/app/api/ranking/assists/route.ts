import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const ranking = await prisma.player.findMany({
    include: { assists: true },
  });

  const sorted = ranking
    .map(player => ({
      id: player.id,
      name: player.name,
      assists: player.assists.length,
    }))
    .sort((a, b) => b.assists - a.assists);

  return NextResponse.json(sorted);
}