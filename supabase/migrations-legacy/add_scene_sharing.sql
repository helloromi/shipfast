-- Migration : Permettre le partage de scènes privées entre utilisateurs
-- La table user_work_access et l'enum 'private' existent déjà.
-- On met à jour les politiques RLS pour autoriser l'accès via user_work_access.

-- 1. Scènes : lire si publique, propriétaire, OU accès partagé explicite
drop policy if exists "Read scenes public or owned" on public.scenes;
create policy "Read scenes public or owned" on public.scenes
  for select using (
    (is_private = false)
    or (is_private = true and owner_user_id = auth.uid())
    or exists (
      select 1 from public.user_work_access uwa
      where uwa.scene_id = scenes.id
        and uwa.user_id = auth.uid()
        and uwa.access_type = 'private'
    )
  );

-- 2. Personnages : lire si la scène parente est accessible
drop policy if exists "Read characters from accessible scenes" on public.characters;
create policy "Read characters from accessible scenes" on public.characters
  for select using (
    exists (
      select 1 from public.scenes s
      where s.id = characters.scene_id
        and (
          s.is_private = false
          or (s.is_private = true and s.owner_user_id = auth.uid())
          or exists (
            select 1 from public.user_work_access uwa
            where uwa.scene_id = s.id
              and uwa.user_id = auth.uid()
              and uwa.access_type = 'private'
          )
        )
    )
  );

-- 3. Répliques : lire si la scène parente est accessible
drop policy if exists "Read lines from accessible scenes" on public.lines;
create policy "Read lines from accessible scenes" on public.lines
  for select using (
    exists (
      select 1 from public.scenes s
      where s.id = lines.scene_id
        and (
          s.is_private = false
          or (s.is_private = true and s.owner_user_id = auth.uid())
          or exists (
            select 1 from public.user_work_access uwa
            where uwa.scene_id = s.id
              and uwa.user_id = auth.uid()
              and uwa.access_type = 'private'
          )
        )
    )
  );
