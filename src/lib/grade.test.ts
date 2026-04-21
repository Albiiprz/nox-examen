import { describe, expect, it } from "vitest";
import { QUESTION_TYPE } from "./constants";
import { gradeSubmission } from "./grade";

describe("gradeSubmission", () => {
  it("puntúa 10 cuando todas las respuestas únicas son correctas", () => {
    const questions = [
      {
        id: "q1",
        type: QUESTION_TYPE.TEST_UNICA,
        options: [
          { id: "a1", isCorrect: true },
          { id: "a2", isCorrect: false },
        ],
      },
      {
        id: "q2",
        type: QUESTION_TYPE.TEST_UNICA,
        options: [
          { id: "b1", isCorrect: false },
          { id: "b2", isCorrect: true },
        ],
      },
    ];

    const answers = [
      { questionId: "q1", selectedOptionIds: ["a1"] },
      { questionId: "q2", selectedOptionIds: ["b2"] },
    ];

    const result = gradeSubmission(questions, answers);

    expect(result.scoreTest).toBe(10);
    expect(result.scoreFinal).toBe(10);
  });

  it("aplica 0.5 en múltiple cuando hay correctas parciales y sin incorrectas", () => {
    const questions = [
      {
        id: "q1",
        type: QUESTION_TYPE.TEST_MULTIPLE,
        options: [
          { id: "a1", isCorrect: true },
          { id: "a2", isCorrect: true },
          { id: "a3", isCorrect: false },
        ],
      },
    ];

    const answers = [{ questionId: "q1", selectedOptionIds: ["a1"] }];

    const result = gradeSubmission(questions, answers);

    expect(result.scoreTest).toBe(5);
    expect(result.detail[0]?.autoScore).toBe(0.5);
  });

  it("aplica 0 en múltiple cuando se marca una opción incorrecta", () => {
    const questions = [
      {
        id: "q1",
        type: QUESTION_TYPE.TEST_MULTIPLE,
        options: [
          { id: "a1", isCorrect: true },
          { id: "a2", isCorrect: true },
          { id: "a3", isCorrect: false },
        ],
      },
    ];

    const answers = [{ questionId: "q1", selectedOptionIds: ["a1", "a3"] }];

    const result = gradeSubmission(questions, answers);

    expect(result.scoreTest).toBe(0);
    expect(result.detail[0]?.autoScore).toBe(0);
  });

  it("ignora desarrollo para la nota automática", () => {
    const questions = [
      {
        id: "q1",
        type: QUESTION_TYPE.TEST_UNICA,
        options: [
          { id: "a1", isCorrect: true },
          { id: "a2", isCorrect: false },
        ],
      },
      {
        id: "q2",
        type: QUESTION_TYPE.DESARROLLO,
        options: [],
      },
    ];

    const answers = [
      { questionId: "q1", selectedOptionIds: ["a1"] },
      { questionId: "q2", textAnswer: "Mi respuesta" },
    ];

    const result = gradeSubmission(questions, answers);

    expect(result.scoreTest).toBe(10);
    expect(result.detail[1]?.autoScore).toBeNull();
  });
});
