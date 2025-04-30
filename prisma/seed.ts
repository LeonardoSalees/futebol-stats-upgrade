import { PrismaClient } from '@/src/generated/client'

const prisma = new PrismaClient()

async function main() {
  // Criar jogadores
  const player1 = await prisma.player.create({
    data: {
      name: 'Leonardo',
      team: 'Time A',
    },
  })

  const player2 = await prisma.player.create({
    data: {
      name: 'Carlos',
      team: 'Time B',
    },
  })

  const player3 = await prisma.player.create({
    data: {
      name: 'Julia',
      team: 'Time A',
    },
  })

  const player4 = await prisma.player.create({
    data: {
      name: 'Marcos',
      team: 'Time B',
    },
  })

  // Criar rodada
  const round = await prisma.round.create({
    data: {
      name: 'Rodada 1',
      date: new Date('2025-04-15T00:00:00Z'),
      games: {
        create: [
          {
            date: new Date('2025-04-15T19:30:00Z'),
            homeTeam: 'Time A',
            awayTeam: 'Time B',
            players: {
              connect: [{ id: player1.id }, { id: player2.id }, { id: player3.id }, { id: player4.id }],
            },
            goals: {
              create: [
                {
                  playerId: player1.id,
                  minute: 12,
                },
                {
                  playerId: player3.id,
                  minute: 45,
                },
              ],
            },
            assists: {
              create: [
                {
                  playerId: player2.id,
                  minute: 12,
                },
                {
                  playerId: player4.id,
                  minute: 45,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('🌱 Seed de dados executado com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
