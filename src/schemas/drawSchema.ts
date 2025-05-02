import { z } from 'zod';

// Definindo o schema para os dados de entrada
export const teamSchema = z.object({
  name: z.string().min(1, "O nome do time é obrigatório."),
  players: z.array(z.number().int().positive("O ID do jogador deve ser um número positivo.")),
  tenantId: z.string().min(1, {
    message: "O tenantId é obrigatório",
  }).optional(),
});

export const drawSchema = z.object({
  roundId: z.number().int().positive("O ID da rodada deve ser um número positivo."),
  teams: z.array(teamSchema).nonempty("Deve haver pelo menos um time."),
  tenantId: z.string().min(1, {
    message: "O tenantId é obrigatório",
  }).optional(),
});