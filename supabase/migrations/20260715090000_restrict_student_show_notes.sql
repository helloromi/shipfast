-- Cloisonne les éléments de production (« Coulisses ») côté élève.
--
-- Avant : "Read class show notes" laissait tout membre d'une classe lire TOUTES
-- les lignes de class_show_notes, y compris celles visant nommément un autre
-- élève (member_id d'un camarade). /mes-cours les affichait, avec l'email du
-- camarade en repli quand display_name était nul.
--
-- Après : le prof lit tout ; l'élève ne lit que les éléments collectifs
-- (member_id is null) et ceux qui le visent.
--
-- Note : l'élève n'a toujours aucun droit d'écriture — "Teacher write class
-- show notes" reste inchangée.

-- Helper security definer : indispensable pour interroger class_members depuis
-- une policy sans déclencher la RLS de class_members (même raison que les
-- helpers de 20260609120000_add_teacher_spaces.sql).
create or replace function public.is_own_class_member(p_member_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members m
    where m.id = p_member_id and m.user_id = p_user_id
  );
$$;

drop policy if exists "Read class show notes" on public.class_show_notes;
create policy "Read class show notes" on public.class_show_notes
  for select using (
    public.is_class_teacher(class_id, auth.uid())
    or (
      public.is_class_member(class_id, auth.uid())
      and (
        member_id is null
        or public.is_own_class_member(member_id, auth.uid())
      )
    )
  );
