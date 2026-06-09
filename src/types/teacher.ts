export type UserRole = "student" | "teacher";

export type TeacherClass = {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  invite_code: string;
  show_title: string | null;
  show_date: string | null;
  show_venue: string | null;
  created_at: string;
  updated_at: string;
};

export type ClassMember = {
  id: string;
  class_id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  joined_at: string | null;
  created_at: string;
};

export type ClassScene = {
  class_id: string;
  scene_id: string;
  created_at: string;
  scene?: {
    id: string;
    title: string;
    author: string | null;
  };
};

export type ClassAssignment = {
  id: string;
  class_id: string;
  member_id: string;
  scene_id: string;
  character_id: string | null;
  note: string | null;
  due_date: string | null;
  created_at: string;
};

export type ClassAnnotation = {
  id: string;
  class_id: string;
  scene_id: string;
  line_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ShowNoteCategory =
  | "mise_en_scene"
  | "costumes"
  | "decors"
  | "accessoires"
  | "technique"
  | "autre";

export type ShowNoteStatus = "todo" | "in_progress" | "done";

export type ClassShowNote = {
  id: string;
  class_id: string;
  scene_id: string | null;
  member_id: string | null;
  category: ShowNoteCategory;
  title: string;
  content: string | null;
  status: ShowNoteStatus;
  position: number;
  created_at: string;
  updated_at: string;
};

export type SceneSummary = {
  id: string;
  title: string;
  author: string | null;
  characters: { id: string; name: string }[];
  lineCount: number;
};

export type ClassDetail = {
  klass: TeacherClass;
  members: ClassMember[];
  scenes: SceneSummary[];
  assignments: ClassAssignment[];
  showNotes: ClassShowNote[];
};
