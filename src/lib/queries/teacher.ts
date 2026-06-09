import { createSupabaseServerClient } from "@/lib/supabase-server";
import type {
  ClassAnnotation,
  ClassAssignment,
  ClassDetail,
  ClassMember,
  ClassShowNote,
  SceneSummary,
  TeacherClass,
  UserRole,
} from "@/types/teacher";

export async function fetchUserRole(userId: string): Promise<UserRole> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle<{ role: UserRole }>();

  if (error) {
    console.error(error);
    return "student";
  }
  return data?.role ?? "student";
}

type CountRow = { count: number }[] | null;

export async function fetchTeacherClasses(userId: string): Promise<
  (TeacherClass & { memberCount: number; sceneCount: number })[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teacher_classes")
    .select("*, class_members(count), class_scenes(count)")
    .eq("teacher_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  type Row = TeacherClass & { class_members: CountRow; class_scenes: CountRow };
  return ((data ?? []) as Row[]).map(({ class_members, class_scenes, ...klass }) => ({
    ...klass,
    memberCount: class_members?.[0]?.count ?? 0,
    sceneCount: class_scenes?.[0]?.count ?? 0,
  }));
}

export async function fetchClassDetail(
  classId: string,
  teacherId: string
): Promise<ClassDetail | null> {
  const supabase = await createSupabaseServerClient();

  const { data: klass, error: classError } = await supabase
    .from("teacher_classes")
    .select("*")
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle<TeacherClass>();

  if (classError || !klass) {
    if (classError) console.error(classError);
    return null;
  }

  const [membersRes, classScenesRes, assignmentsRes, showNotesRes] = await Promise.all([
    supabase
      .from("class_members")
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: true }),
    supabase
      .from("class_scenes")
      .select("scene_id, scenes(id, title, author, characters(id, name), lines(count))")
      .eq("class_id", classId)
      .order("created_at", { ascending: true }),
    supabase
      .from("class_assignments")
      .select("*")
      .eq("class_id", classId),
    supabase
      .from("class_show_notes")
      .select("*")
      .eq("class_id", classId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  for (const res of [membersRes, classScenesRes, assignmentsRes, showNotesRes]) {
    if (res.error) console.error(res.error);
  }

  type SceneRow = {
    id: string;
    title: string;
    author: string | null;
    characters: { id: string; name: string }[] | null;
    lines: CountRow;
  };
  const scenes: SceneSummary[] = ((classScenesRes.data ?? []) as unknown as { scenes: SceneRow | null }[])
    .map((row) => row.scenes)
    .filter((s): s is SceneRow => Boolean(s))
    .map((s) => ({
      id: s.id,
      title: s.title,
      author: s.author ?? null,
      characters: (s.characters ?? []).map((c) => ({ id: c.id, name: c.name })),
      lineCount: s.lines?.[0]?.count ?? 0,
    }));

  return {
    klass,
    members: (membersRes.data ?? []) as ClassMember[],
    scenes,
    assignments: (assignmentsRes.data ?? []) as ClassAssignment[],
    showNotes: (showNotesRes.data ?? []) as ClassShowNote[],
  };
}

export async function fetchClassAnnotations(
  classId: string,
  sceneId: string
): Promise<ClassAnnotation[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("class_annotations")
    .select("*")
    .eq("class_id", classId)
    .eq("scene_id", sceneId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as ClassAnnotation[];
}

// --- Côté élève ---

export type StudentClass = {
  membership: ClassMember;
  klass: TeacherClass;
  assignments: (ClassAssignment & {
    sceneTitle: string | null;
    characterName: string | null;
  })[];
  showNotes: ClassShowNote[];
  members: ClassMember[];
};

export async function fetchStudentClasses(userId: string): Promise<StudentClass[]> {
  const supabase = await createSupabaseServerClient();

  const { data: memberships, error } = await supabase
    .from("class_members")
    .select("*, teacher_classes(*)")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return [];
  }

  type MembershipRow = ClassMember & { teacher_classes: TeacherClass | null };
  const result: StudentClass[] = [];
  for (const m of (memberships ?? []) as MembershipRow[]) {
    const klass = m.teacher_classes;
    if (!klass) continue;

    const [assignmentsRes, showNotesRes, membersRes] = await Promise.all([
      supabase
        .from("class_assignments")
        .select("*, scenes(title), characters(name)")
        .eq("class_id", klass.id)
        .eq("member_id", m.id),
      supabase
        .from("class_show_notes")
        .select("*")
        .eq("class_id", klass.id)
        .order("position", { ascending: true }),
      supabase
        .from("class_members")
        .select("*")
        .eq("class_id", klass.id),
    ]);

    result.push({
      membership: m as unknown as ClassMember,
      klass,
      assignments: (
        (assignmentsRes.data ?? []) as (ClassAssignment & {
          scenes: { title: string } | null;
          characters: { name: string } | null;
        })[]
      ).map(({ scenes, characters, ...a }) => ({
        ...a,
        sceneTitle: scenes?.title ?? null,
        characterName: characters?.name ?? null,
      })),
      showNotes: (showNotesRes.data ?? []) as ClassShowNote[],
      members: (membersRes.data ?? []) as ClassMember[],
    });
  }

  return result;
}

/**
 * Annotations du professeur visibles par l'élève sur une scène donnée
 * (RLS limite déjà la lecture aux classes dont l'utilisateur est membre).
 */
export async function fetchAnnotationsForScene(sceneId: string): Promise<ClassAnnotation[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("class_annotations")
    .select("*")
    .eq("scene_id", sceneId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as ClassAnnotation[];
}

export async function hasClassMembership(userId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("has_class_membership", {
    p_user_id: userId,
  });

  if (error) {
    console.error(error);
    return false;
  }
  return Boolean(data);
}
