export interface Team {
  id: string;
  name: string;
  createdAt: string;
  coachId?: string; // For future coach association
}

export interface Player {
  id: string;
  name: string;
  email: string;
  teamId: string;
  registeredAt: string;
}

export interface Practice {
  id: string;
  teamId: string;
  name: string;
  date: string;
  time: string;
  createdAt: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  order: number;
}

export interface PracticeResponse {
  id: string;
  practiceId: string;
  playerId: string;
  responses: {
    questionId: string;
    answer: string;
  }[];
  submittedAt: string;
}

export interface PracticeSummary {
  practiceId: string;
  summary: string;
  generatedAt: string;
}

// API Request Types
export interface CreateTeamRequest {
  name: string;
}

export interface CreatePlayerRequest {
  name: string;
  email: string;
  teamId: string;
}

export interface CreatePracticeRequest {
  teamId: string;
  name: string;
  date: string;
  time: string;
}

export interface SubmitResponsesRequest {
  practiceId: string;
  playerId: string;
  responses: {
    questionId: string;
    answer: string;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type TeamResponse = Team;

export type PlayerResponse = Player;

export type PracticeResponseType = Practice;

export interface PracticeWithQuestions extends Practice {
  questions: PracticeQuestion[];
}

export interface PracticeResponsesResponse {
  practice: Practice;
  responses: PracticeResponse[];
}

export type PracticeSummaryResponse = PracticeSummary;