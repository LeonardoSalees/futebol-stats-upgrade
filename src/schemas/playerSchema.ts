import { z } from "zod";

export const playerSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })  // Mensagem para nome muito curto
    .max(100, { message: "Nome muito longo" }),
  isAvailable: z.boolean().default(false),
  team: z.string().nullable(),
  tenantId: z.string().min(1, {
    message: "O tenantId é obrigatório",
  }).optional(),
  goals: z.array(z.object({
    playerId: z.number(),
    gameId: z.number(),
    team: z.string(),
    minute: z.number().int(),
  })).optional(),
  assists: z.array(z.object({
    playerId: z.number(),
    gameId: z.number(),
    minute: z.number().int(),
    team: z.string(),
  })).optional(),
}).refine((data) => {
  return !(data.team && !data.isAvailable);
}, {
  message: "Jogador precisa estar disponível para ser atribuído a um time",
  path: ["team"], // Foca o erro no campo correto
})