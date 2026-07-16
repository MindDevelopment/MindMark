const express = require('express');
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('');
const DOMPurify = require('dompurify')(window);
const { marked } = require('marked');
const hljs = require('highlight.js');
const router = express.Router();
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (_) {}
    }
    return code;
  },
  breaks: true,
  gfm: true,
});

router.get('/editor', requireAuth, async (req, res) => {
  const docId = req.query.id;
  let doc = { title: 'Untitled', content: '' };
  if (docId) {
    const docs = await query(
      'SELECT id, title, content FROM documents WHERE id = ? AND user_id = ?',
      [docId, req.session.userId]
    );
    if (docs.length > 0) doc = docs[0];
  }
  const docs = await query(
    'SELECT id, title, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC',
    [req.session.userId]
  );
  res.render('editor', {
    user: req.session.username,
    doc,
    docs,
    preview: '',
  });
});

router.post('/editor/preview', requireAuth, async (req, res) => {
  const raw = req.body.content || '';
  const html = await marked.parse(raw);
  const clean = DOMPurify.sanitize(html);
  res.json({ html: clean });
});

router.post('/editor/save', requireAuth, async (req, res) => {
  const { id, title, content } = req.body;
  try {
    if (id) {
      await query(
        'UPDATE documents SET title = ?, content = ? WHERE id = ? AND user_id = ?',
        [title, content, id, req.session.userId]
      );
      res.json({ id: parseInt(id) });
    } else {
      const result = await query(
        'INSERT INTO documents (user_id, title, content) VALUES (?, ?, ?)',
        [req.session.userId, title, content]
      );
      res.json({ id: Number(result.insertId) });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Save failed' });
  }
});

router.delete('/editor/:id', requireAuth, async (req, res) => {
  try {
    await query(
      'DELETE FROM documents WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
