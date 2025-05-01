import { describe, it, expect } from "vitest";
import { GoalSchema } from "@/schemas/goalSchema"; // ajuste o caminho conforme necessário

describe("GoalSchema", () => {
  it("deve validar um gol válido", () => {
    const validGoal = {
      playerId: 1,
      gameId: 2,
      team: "Time A",
      minute: 10,
    };

    const parsed = GoalSchema.parse(validGoal);
    expect(parsed).toEqual(validGoal);
  });

  it("deve permitir o campo opcional 'id'", () => {
    const goalWithId = {
      id: 100,
      playerId: 1,
      gameId: 2,
      team: "Time B",
      minute: 20,
    };

    const parsed = GoalSchema.parse(goalWithId);
    expect(parsed.id).toBe(100);
  });

  it("deve falhar se playerId for negativo", () => {
    const invalidGoal = {
      playerId: -1,
      gameId: 2,
      team: "Time A",
      minute: 15,
    };

    expect(() => GoalSchema.parse(invalidGoal)).toThrowError();
  });

  it("deve falhar se team for string vazia", () => {
    const invalidGoal = {
      playerId: 1,
      gameId: 2,
      team: "",
      minute: 5,
    };

    expect(() => GoalSchema.parse(invalidGoal)).toThrowError();
  });

  it("deve falhar se minute for negativo", () => {
    const invalidGoal = {
      playerId: 1,
      gameId: 2,
      team: "Time A",
      minute: -5,
    };

    expect(() => GoalSchema.parse(invalidGoal)).toThrowError();
  });

  it("deve falhar se gameId estiver ausente", () => {
    const invalidGoal = {
      playerId: 1,
      team: "Time A",
      minute: 12,
    };

    expect(() => GoalSchema.parse(invalidGoal)).toThrowError();
  });
});
