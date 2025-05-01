import { describe, it, expect } from "vitest";
import { roundSchema } from "@/schemas/roundSchema";

describe("roundSchema", () => {
  it("deve validar um objeto completo e válido", () => {
    const input = {
      id: 1,
      date: new Date("2025-05-01T00:00:00Z"),
      finished: true,
      games: [],
      teams: [],
    };

    const parsed = roundSchema.parse(input);

    expect(parsed).toEqual(input);
  });

  it("deve aplicar valores padrão se campos forem omitidos", () => {
    const parsed = roundSchema.parse({});

    expect(parsed.finished).toBe(false);
    expect(parsed.date).toBeInstanceOf(Date);
  });

  it("deve converter string para Date automaticamente", () => {
    const parsed = roundSchema.parse({ date: "2025-05-01T10:00:00Z" });

    expect(parsed.date).toBeInstanceOf(Date);
    expect(parsed.date.toISOString()).toBe("2025-05-01T10:00:00.000Z");
  });

  it("deve lançar erro se 'date' for inválido", () => {
    expect(() => roundSchema.parse({ date: "not-a-date" })).toThrow();
  });

  it("deve lançar erro se 'finished' não for booleano", () => {
    expect(() => roundSchema.parse({ finished: "yes" })).toThrow();
  });

  it("deve aceitar arrays em 'games' e 'teams'", () => {
    const parsed = roundSchema.parse({
      games: [{ mock: true }],
      teams: [{ name: "Time A" }],
    });

    expect(Array.isArray(parsed.games)).toBe(true);
    expect(Array.isArray(parsed.teams)).toBe(true);
  });
});
