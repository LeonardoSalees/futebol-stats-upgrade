import { describe, it, expect } from "vitest";
import { playerSchema } from "@/schemas/playerSchema";

describe("playerSchema", () => {
  it("should accept an available player with a team", () => {
    const result = playerSchema.safeParse({
      name: "Lucas",
      isAvailable: true,
      team: "verde",
    });
    expect(result.success).toBe(true);
  });

  it("should reject a player with a team but unavailable", () => {
    const result = playerSchema.safeParse({
      name: "João",
      isAvailable: false,
      team: "vermelho",
    });

    // Verifying if the error is present directly in the test
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("Jogador precisa estar disponível para ser atribuído a um time");
  });

  it("should accept a player without a team", () => {
    const result = playerSchema.safeParse({
      name: "Carlos",
      isAvailable: true,
      team: null,  // or null
    });
    expect(result.success).toBe(true);
  });

  it("should reject a player without a name", () => {
    const result = playerSchema.safeParse({
      name: undefined,
      isAvailable: true,
      team: "azul",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("Required");
  });

  it("should accept a player without a team, even if unavailable", () => {
    const result = playerSchema.safeParse({
      name: "Ana",
      isAvailable: false,
      team: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject a player with a very short name", () => {
    const result = playerSchema.safeParse({
      name: "A",  // very short name
      isAvailable: true,
      team: "azul",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("Nome deve ter pelo menos 3 caracteres");  // Corrected to reflect length validation
  });
  
  it("should reject a player with a very long name", () => {
    const result = playerSchema.safeParse({
      name: "Nome muito longo que excede o limite de 100 caracteresdfdsssssssssssdsssssssssssssssssssssssssssssssssssssssssssssssssssss",
      isAvailable: true,
      team: "azul",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("Nome muito longo");
  });
});
