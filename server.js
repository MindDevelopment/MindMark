require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDb } = require('./src/config/db');

const indexRoutes = require('./src/routes/index');
const authRoutes = require('./src/routes/auth');
const editorRoutes = require('./src/routes/editor');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', editorRoutes);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MindMark running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
