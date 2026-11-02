const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const db = require('./db');
const { hashUserId, hashPassword, verifyPassword } = require('./hash');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-only-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));

function publicUser(user) {
  return user ? { user_id: user.user_id, login: user.login, name: user.name } : null;
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Please sign in first.' });
  }
  next();
}

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

app.get('/api/me', (req, res) => {
  res.json({ user: publicUser(req.session.user) });
});

app.post('/api/signup', wrap(async (req, res) => {
  const userId = String(req.body.user_id || '').trim();
  const name = String(req.body.name || '').trim();
  const password = String(req.body.password || '');

  if (!userId || !name || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const hashedId = hashUserId(userId);
  const existing = await db.query('SELECT 1 FROM users WHERE user_id = $1', [hashedId]);
  if (existing.rowCount > 0) {
    return res.status(409).json({
      error: `The user ID "${userId}" is already taken. Please choose a different one.`,
    });
  }

  await db.query(
    'INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)',
    [hashedId, await hashPassword(password), name]
  );

  res.status(201).json({ message: 'Account created! Please sign in.' });
}));

app.post('/api/signin', wrap(async (req, res, next) => {
  const userId = String(req.body.user_id || '').trim();
  const password = String(req.body.password || '');

  const result = await db.query(
    'SELECT user_id, password, name FROM users WHERE user_id = $1',
    [hashUserId(userId)]
  );
  const row = result.rows[0];

  if (!row || !(await verifyPassword(password, row.password))) {
    return res.status(401).json({ error: 'Incorrect user ID or password. Please try again.' });
  }

  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.user = { user_id: row.user_id, login: userId, name: row.name };
    res.json({ user: publicUser(req.session.user) });
  });
}));

app.post('/api/signout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Signed out.' });
  });
});

app.put('/api/account', requireAuth, wrap(async (req, res) => {
  const newUserId = String(req.body.user_id || '').trim();
  const newPassword = String(req.body.new_password || '');
  const currentPassword = String(req.body.current_password || '');

  if (!newUserId) {
    return res.status(400).json({ error: 'User ID cannot be empty.' });
  }

  const current = await db.query('SELECT password FROM users WHERE user_id = $1', [req.session.user.user_id]);
  if (current.rowCount === 0 || !(await verifyPassword(currentPassword, current.rows[0].password))) {
    return res.status(400).json({ error: 'Your current password is incorrect.' });
  }

  const taken = `The user ID "${newUserId}" is already taken. Please choose a different one.`;
  const newHashedId = hashUserId(newUserId);
  if (newHashedId !== req.session.user.user_id) {
    const exists = await db.query('SELECT 1 FROM users WHERE user_id = $1', [newHashedId]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: taken });
    }
  }

  const passwordHash = newPassword ? await hashPassword(newPassword) : current.rows[0].password;

  try {
    await db.query(
      'UPDATE users SET user_id = $1, password = $2 WHERE user_id = $3',
      [newHashedId, passwordHash, req.session.user.user_id]
    );
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: taken });
    }
    throw err;
  }

  req.session.user = { ...req.session.user, user_id: newHashedId, login: newUserId };
  res.json({ message: 'Your account has been updated.', user: publicUser(req.session.user) });
}));

const POST_COLUMNS = 'blog_id, creator_name, creator_user_id, title, body, date_created, date_updated';

app.get('/api/blogs', requireAuth, wrap(async (req, res) => {
  const result = await db.query(`SELECT ${POST_COLUMNS} FROM blogs ORDER BY date_created DESC`);
  res.json({ posts: result.rows });
}));

app.post('/api/blogs', requireAuth, wrap(async (req, res) => {
  const title = String(req.body.title || '').trim();
  const body = String(req.body.body || '').trim();

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and post are both required.' });
  }

  const result = await db.query(
    `INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     RETURNING ${POST_COLUMNS}`,
    [req.session.user.name, req.session.user.user_id, title, body]
  );
  res.status(201).json({ post: result.rows[0] });
}));

async function findOwnPost(req, res) {
  const blogId = Number(req.params.id);
  if (!Number.isInteger(blogId)) {
    res.status(400).json({ error: 'Invalid post ID.' });
    return null;
  }

  const result = await db.query('SELECT * FROM blogs WHERE blog_id = $1', [blogId]);
  const post = result.rows[0];
  if (!post) {
    res.status(404).json({ error: 'That post no longer exists.' });
    return null;
  }
  if (post.creator_user_id !== req.session.user.user_id) {
    res.status(403).json({ error: 'You can only edit or delete posts that you created.' });
    return null;
  }
  return post;
}

app.get('/api/blogs/:id', requireAuth, wrap(async (req, res) => {
  const post = await findOwnPost(req, res);
  if (post) res.json({ post });
}));

app.put('/api/blogs/:id', requireAuth, wrap(async (req, res) => {
  const post = await findOwnPost(req, res);
  if (!post) return;

  const title = String(req.body.title || '').trim();
  const body = String(req.body.body || '').trim();
  if (!title || !body) {
    return res.status(400).json({ error: 'Title and post are both required.' });
  }

  const result = await db.query(
    `UPDATE blogs
        SET title = $1, body = $2, date_updated = CURRENT_TIMESTAMP
      WHERE blog_id = $3 AND creator_user_id = $4
      RETURNING ${POST_COLUMNS}`,
    [title, body, post.blog_id, req.session.user.user_id]
  );
  res.json({ post: result.rows[0] });
}));

app.delete('/api/blogs/:id', requireAuth, wrap(async (req, res) => {
  const post = await findOwnPost(req, res);
  if (!post) return;

  await db.query(
    'DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2',
    [post.blog_id, req.session.user.user_id]
  );
  res.json({ deleted: post.blog_id });
}));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Something went wrong talking to the database. Check that PostgreSQL is running and your .env settings are correct.',
  });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
