const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

router.get('/', async (req, res) => {
  let docs = [];
  let docCount = 0;

  if (req.session.userId) {
    docs = await query(
      'SELECT id, title, updated_at, created_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC',
      [req.session.userId]
    );
    docCount = docs.length;
  }

  res.render('index', {
    user: req.session.username || null,
    docs,
    docCount,
  });
});

module.exports = router;
