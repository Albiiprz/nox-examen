export const EXAM_STATUS = {
  BORRADOR: "BORRADOR",
  PUBLICADO: "PUBLICADO",
  CERRADO: "CERRADO",
} as const;

export const QUESTION_TYPE = {
  TEST_UNICA: "TEST_UNICA",
  TEST_MULTIPLE: "TEST_MULTIPLE",
  DESARROLLO: "DESARROLLO",
} as const;

export const SUBMISSION_STATUS = {
  ENVIADO: "ENVIADO",
  CORREGIDO: "CORREGIDO",
} as const;

export type ExamStatus = (typeof EXAM_STATUS)[keyof typeof EXAM_STATUS];
export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];
export type SubmissionStatus =
  (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS];
