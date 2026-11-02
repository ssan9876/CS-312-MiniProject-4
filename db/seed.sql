
INSERT INTO users (user_id, password, name) VALUES
  -- alice / alice123
  ('2bd806c97f0e00af1a1fc3328fa763a9269723c8db8fac4f93af71db186d6e90',
   'd792363faa96efb7900f0cc490d6718c:491d6a98dc51b66a1c88730b16dce9c23fbe94d6430a37d8355bf76d514f915f9b852e5fbc655e648dd9f2c771d9190018b35de781d3b520c759e0a07031d1f4',
   'Alice Johnson'),
  -- bmartin / bpass456
  ('e8366749e8c4d0a39fd185febd3b8d2a6f6cfe1fd1580cfaf99367cf56cc5e37',
   '383443397f025044513ee215c75cf9fa:5a722e882c0113e982765c3e843dc6a763baf8805ac0b17104de7910314c56595b811dd73d10dbe748370fbe0ba84fe95a887be530ad9318292682c833774dee',
   'Ben Martin'),
  -- carla_r / carla789
  ('465c8e9597abaf28120e0e8fe2c58af17d7274384c8040dc2e29ab1c5dfd9795',
   '5bbe1f2ff0ff9a6b84f6db16bbfe2dbd:40c4c749e098b493254f719d49a8c7d6f3326db85bae4d5e36d9bfc41d1c99952cdbffc451eb38a616bc10701d4422fdcbc130f043033fbd9da612cead5f1ece',
   'Carla Reyes');

INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES
  ('Alice Johnson', encode(sha256('alice'::bytea), 'hex'),
   'Getting Started with Node.js',
   'Node.js lets you run JavaScript on the server. I started by building a tiny HTTP server, then moved to Express once routing got messy. The event loop took a while to click, but once it did, async code started to feel natural.',
   '2026-09-14 09:12:00'),

  ('Ben Martin', encode(sha256('bmartin'::bytea), 'hex'),
   'Why I Switched to PostgreSQL',
   'After a semester of storing everything in JSON files, I finally moved my side project to PostgreSQL. Foreign keys caught two bugs on the first day, and being able to write a JOIN instead of looping in JavaScript was a huge relief.',
   '2026-09-18 14:30:00'),

  ('Carla Reyes', encode(sha256('carla_r'::bytea), 'hex'),
   'A Weekend Hike at Mount Rainier',
   'We left Seattle at 5 a.m. and reached Paradise just as the fog lifted. The Skyline Trail loop is about 5.5 miles with steady elevation gain, and the wildflowers in the meadows were still hanging on. Bring layers: it was 40 degrees at the top.',
   '2026-09-21 18:05:00'),

  ('Alice Johnson', encode(sha256('alice'::bytea), 'hex'),
   'EJS Templates in Five Minutes',
   'EJS is plain HTML with special tags for output and logic. Use the escaped output tag for anything a user typed so their text can never turn into HTML on your page, and keep your logic small so templates stay easy to read.',
   '2026-09-27 11:45:00'),

  ('Ben Martin', encode(sha256('bmartin'::bytea), 'hex'),
   'Study Tips for Finals Week',
   'Block your time in 50-minute sessions with 10-minute breaks, and do practice problems instead of re-reading notes. Explaining a concept out loud to a friend is the fastest way to find out what you do not actually understand yet.',
   '2026-10-02 20:20:00'),

  ('Carla Reyes', encode(sha256('carla_r'::bytea), 'hex'),
   'My Favorite Budget Recipes',
   'A big pot of black bean chili costs about eight dollars and covers four dinners. Add roasted sweet potatoes and a squeeze of lime to keep it from getting boring by day three.',
   '2026-10-06 12:00:00');
