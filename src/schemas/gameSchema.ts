// src/schemas/gameSchema.ts
import { z } from 'zod';

export const gameSchema = z.object({
  roundId: z.number(),
  date: z.coerce.date().optional(), // opcional, pois há default no banco
  homeTeam: z.string().min(1, "Nome do time da casa é obrigatório"),
  awayTeam: z.string().min(1, "Nome do time visitante é obrigatório"),
  homeScore: z.number().min(0).default(0),
  awayScore: z.number().min(0).default(0),
  finished: z.boolean().default(false),
  started: z.boolean().default(false),
  startedAt: z.coerce.date().optional().nullable(),
  time: z.number().min(0).default(0),

  // Relacionamentos por ID
  goalIds: z.array(z.number()).optional(),      // ID dos gols relacionados
  assistIds: z.array(z.number()).optional(),    // ID das assistências
  playerIds: z.array(z.number()).optional(),    // Jogadores que participaram
  gameStatPlayerIds: z.array(z.number()).optional(), // Jogadores com estatísticas
  tenantId: z.string().min(1, {
    message: "O tenantId é obrigatório",
  }).optional(),
});
