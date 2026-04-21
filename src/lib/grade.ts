import { QUESTION_TYPE } from "@/lib/constants";

type QuestionForGrading = {
  id: string;
  type: string;
  options: Array<{ id: string; isCorrect: boolean }>;
};

type IncomingAnswer = {
  questionId: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
};

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function gradeSubmission(
  questions: QuestionForGrading[],
  answers: IncomingAnswer[],
) {
  const answersByQuestion = new Map(answers.map((a) => [a.questionId, a]));
  let totalPoints = 0;

  const detail = questions.map((question) => {
    if (question.type === QUESTION_TYPE.DESARROLLO) {
      const devAnswer = answersByQuestion.get(question.id);
      return {
        questionId: question.id,
        autoScore: null as number | null,
        selectedOptionIds: null as string[] | null,
        textAnswer: devAnswer?.textAnswer?.trim() || null,
      };
    }

    const answer = answersByQuestion.get(question.id);
    const selected = new Set(answer?.selectedOptionIds ?? []);
    const correct = new Set(
      question.options.filter((o) => o.isCorrect).map((o) => o.id),
    );

    let score = 0;

    if (question.type === QUESTION_TYPE.TEST_UNICA) {
      if (selected.size === 1 && correct.size === 1) {
        const picked = [...selected][0];
        const expected = [...correct][0];
        score = picked === expected ? 1 : 0;
      }
    } else {
      const selectedIds = [...selected];
      const hasIncorrectSelection = selectedIds.some((id) => !correct.has(id));
      const selectedCorrectCount = selectedIds.filter((id) => correct.has(id)).length;

      if (selected.size === 0) {
        score = 0;
      } else if (hasIncorrectSelection) {
        score = 0;
      } else if (selectedCorrectCount === correct.size) {
        score = 1;
      } else {
        score = 0.5;
      }
    }

    totalPoints += score;

    return {
      questionId: question.id,
      autoScore: score,
      selectedOptionIds: [...selected],
      textAnswer: null,
    };
  });

  const testQuestions = questions.filter((q) => q.type !== QUESTION_TYPE.DESARROLLO);
  const scoreTest = testQuestions.length > 0 ? round2((totalPoints / testQuestions.length) * 10) : 0;

  return {
    scoreTest,
    scoreFinal: scoreTest,
    detail,
  };
}
