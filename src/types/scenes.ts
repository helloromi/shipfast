export type Work = {
  id: string;
  title: string;
  author: string | null;
  summary: string | null;
};

export type WorkWithScenes = Work & {
  scenes: Scene[];
};

export type Scene = {
  id: string;
  work_id: string | null;
  title: string;
  author: string | null;
  summary: string | null;
  chapter: string | null;
};

export type Character = {
  id: string;
  scene_id: string;
  name: string;
};

export type Line = {
  id: string;
  scene_id: string;
  character_id: string;
  order: number;
  text: string;
};

export type LineWithCharacter = Line & {
  characters: Character | null;
};

export type SceneWithRelations = Scene & {
  characters: Character[];
  lines: LineWithCharacter[];
};

export type UserLineFeedback = {
  id: string;
  user_id: string;
  line_id: string;
  score: number;
  created_at: string;
};
