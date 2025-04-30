import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const ranking = await prisma.player.findMany({
    include: { goals: true },
  });

  const sorted = ranking
    .map(player => ({
      id: player.id,
      name: player.name,
      goals: player.goals.length,
    }))
    .sort((a, b) => b.goals - a.goals);

  return NextResponse.json(sorted);
}