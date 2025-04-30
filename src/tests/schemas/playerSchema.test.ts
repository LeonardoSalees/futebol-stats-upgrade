import { describe, it, expect } from "vitest";
import { playerSchema } from "@/schemas/playerSchema";

describe("playerSchema", () => {
  it("deve aceitar um jogador disponível com time", () => {
    const result = playerSchema.safeParse({
      name: "Lucas",
      isAvailable: true,
      team: "verde",
    });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar jogador com time mas indisponível", () => {
    const result = playerSchema.safeParse({
      name: "João",
      isAvailable: false,
      team: "vermelho",
    });

    // Verificando se o erro está presente diretamente no teste
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("Jogador precisa estar disponível para ser atribuído a um time");
  });

  it("deve aceitar um jogador sem time", () => {
    const result = playerSchema.safeParse({
      name: "Carlos",
      isAvailable: true,
      team: undefined,  // ou null
    });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar jogador sem nome", () => {
    const result = playerSchema.safeParse({
      name: undefined,
      isAvailable: true,
      team: "azul",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("Required");
  });

  it("deve aceitar jogador sem time, mesmo que esteja indisponível", () => {
    const result = playerSchema.safeParse({
      name: "Ana",
      isAvailable: false,
      team: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar jogador com nome muito curto", () => {
    const result = playerSchema.safeParse({
      name: "A",  // nome muito curto
      isAvailable: true,
      team: "azul",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("Nome deve ter pelo menos 3 caracteres");  // Corrigido para refletir a validação de comprimento
  });
  
  it("deve rejeitar jogador com nome muito longo", () => {
    const result = playerSchema.safeParse({
      name: "Nome muito longo que excede o limite de 100 caracteresdfdsssssssssssdsssssssssssssssssssssssssssssssssssssssssssssssssssss",
      isAvailable: true,
      team: "azul",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("Nome muito longo");
  });
});
