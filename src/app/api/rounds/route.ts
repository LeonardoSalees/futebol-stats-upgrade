import  { PrismaClient } from '@prisma/client'; // Assumindo que você tenha um arquivo de inicialização do Prisma
const prisma = new PrismaClient ()


// Método POST - Criar nova rodada
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Verificar se já existe uma rodada no dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingRoundToday = await prisma.round.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingRoundToday) {
      return new Response(JSON.stringify({ 
        existingRound: true,
        round: existingRoundToday
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Busca a última rodada para determinar o próximo número
    const lastRound = await prisma.round.findFirst({
      orderBy: {
        id: 'desc'
      }
    });

    const nextRoundNumber = lastRound ? lastRound.id + 1 : 1;

    // Verificar se já existe uma rodada com o mesmo número
    const existingRoundWithSameNumber = await prisma.round.findUnique({
      where: {
        id: nextRoundNumber
      }
    });

    if (existingRoundWithSameNumber) {
      return new Response(JSON.stringify({ 
        error: `Já existe uma rodada com o número ${nextRoundNumber}.`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const currentDate = new Date();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const roundName = `Rodada ${nextRoundNumber} - ${monthNames[currentDate.getMonth()]}`;

    const round = await prisma.round.create({
      data: {
        name: roundName,
        date: currentDate
      },
    });

    return new Response(JSON.stringify(round), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao criar a rodada:', error);
    return new Response(JSON.stringify({ error: 'Erro ao criar a rodada.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Método GET - Listar todas as rodadas
export async function GET(req: Request) {
  try {
    const rounds = await prisma.round.findMany({
      include:{
        games: {
          include: {
            goals: true,
            assists: true,
            players: {
              include: {
                player: true
              }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    console.log('Rodadas encontradas:', rounds.map(r => ({ id: r.id, name: r.name, finished: r.finished }))); // Adicionando log para debug

    return new Response(JSON.stringify(rounds), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar rodadas:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar rodadas.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Método PUT - Atualizar rodada
export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id || !name) {
      return new Response(JSON.stringify({ error: 'ID e nome são obrigatórios.' }), {
        status: 400,
      });
    }

    const round = await prisma.round.update({
      where: { id },
      data: { name },
    });

    return new Response(JSON.stringify(round), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao atualizar a rodada.' }), {
      status: 500,
    });
  }
}

// Método DELETE - Excluir rodada
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID é obrigatório.' }), {
        status: 400,
      });
    }

    const round = await prisma.round.delete({
      where: { id },
    });

    return new Response(JSON.stringify(round), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro ao excluir a rodada.' }), {
      status: 500,
    });
  }
}
