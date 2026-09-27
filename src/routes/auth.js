const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('login', { error: null });
});

router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.render('register', { error: 'All fields are required' });
  }
  try {
    const existing = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.render('register', { error: 'Username or email already taken' });
    }
    const hash = await bcrypt.hash(password, 10);
    await query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('login', { error: 'All fields are required' });
  }
  try {
    const users = await query(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );
    if (users.length === 0) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Login failed' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

router.get('/settings', requireAuth, async (req, res) => {
  const { query } = require('../config/db');
  const users = await query('SELECT theme FROM users WHERE id = ?', [req.session.userId]);
  const userTheme = users.length > 0 ? users[0].theme : 'dark';
  res.render('settings', {
    user: req.session.username,
    userTheme,
    error: null,
    success: null
  });
});

router.post('/settings', requireAuth, async (req, res) => {
  const { query } = require('../config/db');
  const { theme } = req.body;
  const validThemes = ['dark', 'light', 'blue', 'green', 'purple'];
  if (!validThemes.includes(theme)) {
    const users = await query('SELECT theme FROM users WHERE id = ?', [req.session.userId]);
    const userTheme = users.length > 0 ? users[0].theme : 'dark';
    return res.render('settings', {
      user: req.session.username,
      userTheme,
      error: 'Invalid theme selected',
      success: null
    });
  }
  try {
    await query('UPDATE users SET theme = ? WHERE id = ?', [theme, req.session.userId]);
    const users = await query('SELECT theme FROM users WHERE id = ?', [req.session.userId]);
    const userTheme = users.length > 0 ? users[0].theme : 'dark';
    res.render('settings', {
      user: req.session.username,
      userTheme,
      error: null,
      success: 'Theme updated successfully'
    });
  } catch (err) {
    console.error(err);
    const users = await query('SELECT theme FROM users WHERE id = ?', [req.session.userId]);
    const userTheme = users.length > 0 ? users[0].theme : 'dark';
    res.render('settings', {
      user: req.session.username,
      userTheme,
      error: 'Failed to update theme',
      success: null
    });
  }
});

module.exports = router;
