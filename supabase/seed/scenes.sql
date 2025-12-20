-- Exemple de seed: 2 scènes publiques

-- Scène 1 : Roméo et Juliette (balcon)
with s as (
  insert into public.scenes (title, author, summary, chapter)
  values (
    'Scène du balcon',
    'William Shakespeare',
    'Roméo rejoint Juliette en secret ; les deux amants échangent leurs vœux malgré la rivalité des familles.',
    'Acte II'
  )
  returning id
), c as (
  insert into public.characters (scene_id, name)
  select s.id, v.name
  from s
  cross join (values ('Roméo'), ('Juliette')) as v(name)
  returning id, name, scene_id
)
insert into public.lines (scene_id, character_id, "order", text)
select
  s.id,
  (select id from c where name = 'Roméo'),
  1,
  'Elle parle ! Oh ! parle encore, bel ange !'
from s
union all
select
  s.id,
  (select id from c where name = 'Juliette'),
  2,
  'Ô Roméo, Roméo ! Pourquoi es-tu Roméo ?'
from s
union all
select
  s.id,
  (select id from c where name = 'Roméo'),
  3,
  'Je prends ton nom, et désormais je ne suis plus Roméo.'
from s
union all
select
  s.id,
  (select id from c where name = 'Juliette'),
  4,
  'Si ton amour est honnête, envoie-moi demain un message.'
from s;

-- Scène 2 : En attendant Godot
with s as (
  insert into public.scenes (title, author, summary, chapter)
  values (
    'En attendant Godot',
    'Samuel Beckett',
    'Vladimir et Estragon attendent Godot au bord d''une route ; ils tuent le temps en discutant.',
    null
  )
  returning id
), c as (
  insert into public.characters (scene_id, name)
  select s.id, v.name
  from s
  cross join (values ('Vladimir'), ('Estragon')) as v(name)
  returning id, name, scene_id
)
insert into public.lines (scene_id, character_id, "order", text)
select
  s.id,
  (select id from c where name = 'Estragon'),
  1,
  'Rien à faire.'
from s
union all
select
  s.id,
  (select id from c where name = 'Vladimir'),
  2,
  'Je commence à le croire sérieusement.'
from s
union all
select
  s.id,
  (select id from c where name = 'Estragon'),
  3,
  'On attend Godot.'
from s
union all
select
  s.id,
  (select id from c where name = 'Vladimir'),
  4,
  'Ah ! Oui.'
from s;
