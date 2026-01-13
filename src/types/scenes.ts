export type Work = {
  id: string;
  title: string;
  author: string | null;
  summary: string | null;
  is_public_domain?: boolean;
  total_lines_count?: number | null;
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
  source_scene_id?: string | null;
  owner_user_id?: string | null;
  is_private?: boolean;
};

export type AccessType = "free_slot" | "purchased" | "private";

export type UserWorkAccess = {
  id: string;
  user_id: string;
  work_id: string | null;
  scene_id: string | null;
  access_type: AccessType;
  purchase_id: string | null;
  created_at: string;
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
  work?: Pick<Work, "id" | "title"> | null;
};

export type UserLineFeedback = {
  id: string;
  user_id: string;
  line_id: string;
  score: number;
  created_at: string;
};

export type UserLineNote = {
  id: string;
  user_id: string;
  line_id: string;
  note: string;
  created_at: string;
  updated_at: string;
};
