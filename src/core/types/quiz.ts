export interface QuizAnswer {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface QuizQuestion {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  answers: QuizAnswer[];
}

export interface QuizState {
  skinType?: string;
  skinConcern?: string;
  preferredProduct?: string;
  ageGroup?: string;
}
