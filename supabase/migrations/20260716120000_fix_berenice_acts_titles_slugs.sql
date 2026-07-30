-- Bérénice : acte, titre et slug.
--
-- Import du 14/07 via une page Wikisource portant la pièce entière : le
-- fetcher ne retenait que les entêtes « Scène N » et jetait les « ACTE N »,
-- puis préfixait avec le titre de page. D'où 23 scènes titrées « Bérénice
-- (éditions Didot, 1854), Scène II » (5 homonymes) et chapter = null.
--
-- L'acte de chaque ligne a été retrouvé en re-parsant la source (lecture
-- seule) et vérifié réplique par réplique : la 1re réplique de chaque scène
-- en base correspond à celle de la scène source de même rang. Aucun texte
-- n'est touché, aucune ligne supprimée.
--
-- Source : https://fr.wikisource.org/wiki/Bérénice_(éditions_Didot,_1854)

update works set slug = 'berenice' where title = 'Bérénice' and slug is null;

update scenes set chapter = 'Acte I', title = 'Acte I, Scène première', slug = 'acte-i-scene-premiere-3'
 where id = '843ae2e6-6563-4567-a73a-a6cb894cb363' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte I', title = 'Acte I, Scène III', slug = 'acte-i-scene-iii-2'
 where id = '4486b4a7-c796-4899-8161-e87e1261d00c' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte I', title = 'Acte I, Scène IV', slug = 'acte-i-scene-iv-5'
 where id = '116d220c-36ef-44c2-a4f5-e226a51e33ea' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte I', title = 'Acte I, Scène V', slug = 'acte-i-scene-v-2'
 where id = '524576cd-56ad-45e0-82b0-75f1ebb03686' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte II', title = 'Acte II, Scène première', slug = 'acte-ii-scene-premiere'
 where id = '42b71a61-83a2-4a3c-849b-40c36d328ecc' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte II', title = 'Acte II, Scène II', slug = 'acte-ii-scene-ii-3'
 where id = '07edfd36-39d7-4d1d-ab23-0b044a216e1d' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte II', title = 'Acte II, Scène III', slug = 'acte-ii-scene-iii'
 where id = '47ca2782-0edc-4577-9902-e4293c0458ab' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte II', title = 'Acte II, Scène IV', slug = 'acte-ii-scene-iv-2'
 where id = '270b6a6d-f0f3-4155-89f5-64af7e202b84' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte II', title = 'Acte II, Scène V', slug = 'acte-ii-scene-v-3'
 where id = 'f6e0b490-0abf-4963-a298-5be71b9c1ae1' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte III', title = 'Acte III, Scène première', slug = 'acte-iii-scene-premiere'
 where id = 'dfdde863-9ea7-40a5-9066-ad0639604a93' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte III', title = 'Acte III, Scène II', slug = 'acte-iii-scene-ii-2'
 where id = '7bda9356-1c15-4e1c-82f3-abb047adbf00' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte III', title = 'Acte III, Scène III', slug = 'acte-iii-scene-iii-4'
 where id = '452111ac-b48a-4213-83cd-b579d4f4d20e' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte III', title = 'Acte III, Scène IV', slug = 'acte-iii-scene-iv-2'
 where id = '5c5f3a1e-c19a-49aa-b89e-f24d01edc95c' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte IV', title = 'Acte IV, Scène II', slug = 'acte-iv-scene-ii'
 where id = 'fa8fca2b-3548-4068-bcc6-820b5b05856b' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte IV', title = 'Acte IV, Scène III', slug = 'acte-iv-scene-iii-3'
 where id = 'bcf9a166-8fc7-482b-a5bf-91ff49b3b787' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte IV', title = 'Acte IV, Scène V', slug = 'acte-iv-scene-v-3'
 where id = 'f3fff48a-080b-428c-a7bd-1d1e06f35cc5' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte IV', title = 'Acte IV, Scène VI', slug = 'acte-iv-scene-vi-2'
 where id = '1e3cfb9a-021c-480f-8f72-93b06cf42e9c' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte IV', title = 'Acte IV, Scène VII', slug = 'acte-iv-scene-vii'
 where id = '852f5e34-4dc4-4edf-b59f-6f7896171ced' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte IV', title = 'Acte IV, Scène VIII', slug = 'acte-iv-scene-viii'
 where id = 'c2f896f9-53a2-4b6d-9a1a-f52adb01edfc' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte V', title = 'Acte V, Scène II', slug = 'acte-v-scene-ii'
 where id = 'e76537dd-5c6f-47a0-aa9e-9ba85a0375c5' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte V', title = 'Acte V, Scène V', slug = 'acte-v-scene-v'
 where id = 'f69c2fcd-96f7-44a3-a0e9-e2c1c08d3683' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte V', title = 'Acte V, Scène VI', slug = 'acte-v-scene-vi-2'
 where id = 'a1bc5e12-97b5-42e4-95f0-a5b3be41d755' and title like 'Bérénice (éditions Didot, 1854),%';

update scenes set chapter = 'Acte V', title = 'Acte V, Scène VII', slug = 'acte-v-scene-vii-2'
 where id = 'e07c76d8-c64f-4c3c-91d4-c347c2b8342d' and title like 'Bérénice (éditions Didot, 1854),%';
