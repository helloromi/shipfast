export type LearningSession = {
  id: string;
  user_id: string;
  scene_id: string;
  character_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  total_lines: number;
  completed_lines: number;
  average_score: number | null;
};

export type TimeSeriesDataPoint = {
  date: string;
  value: number;
  label?: string;
};

export type SceneStats = {
  sceneId: string;
  totalSessions: number;
  totalTimeMinutes: number;
  totalLinesLearned: number;
  averageScore: number;
  scoreEvolution: TimeSeriesDataPoint[];
  recentSessions: Array<{
    date: string;
    durationMinutes: number;
    score: number;
    characterName: string;
  }>;
};

export type UserStatsSummary = {
  totalSessions: number;
  totalTimeMinutes: number;
  totalScenesWorked: number;
  averageScore: number;
  currentStreak: number;
  lastActivityDate: string | null;
};

export type LineMasteryPoint = {
  lineId: string;
  order: number;
  text: string;
  mastery: number; // 0..3
  attempts: number;
};




