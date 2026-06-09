-- Migration : Empêcher les doublons d'accès au niveau scène pour un même utilisateur
-- (réduit le spam DB et les conditions de course)

create unique index if not exists user_work_access_user_scene_unique_idx
  on public.user_work_access (user_id, scene_id)
  where scene_id is not null;

