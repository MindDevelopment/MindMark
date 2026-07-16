<div align="center">

# <img alt="MindMark" src="https://img.shields.io/badge/MindMark-Markdown%20Editor-58A6FF?style=for-the-badge&logo=markdown&logoColor=white&labelColor=161B22" />

### A self-hosted markdown viewer and editor with a clean dark interface, live preview and user accounts.

[![License: MIT](https://img.shields.io/badge/License-MIT-58A6FF?style=flat-square)](https://opensource.org/licenses/MIT) [![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/) [![MariaDB](https://img.shields.io/badge/MariaDB-10%2B-003545?style=flat-square&logo=mariadb&logoColor=white)](https://mariadb.org/)
[![EJS](https://img.shields.io/badge/EJS-Template-8B5CF6?style=flat-square&logo=ejs&logoColor=white)](https://ejs.co/)

<p>
  <a href="#-features">✨ Features</a> •
  <a href="#-screenshots">📸 Screenshots</a> •
  <a href="#-quick-start">🚀 Quick Start</a> •
  <a href="#-installation">📦 Installation</a> •
  <a href="#-configuration">⚙️ Configuration</a> •
  <a href="#-project-structure">📁 Structure</a> •
  <a href="#-api">📡 API</a> •
  <a href="#-license">📄 License</a>
</p>

</div>

---

## ✨ Features

- ✍️ **Rich editor** — toolbar with bold, italic, headings, code blocks, tables, lists, blockquotes, and more
- 👁️ **Live preview** — resizable side-by-side preview that updates in real time as you type
- 💾 **User accounts** — register and log in to save documents and access them later
- 🗂️ **Document management** — dashboard overview with all documents, sorted by last updated
- 🔍 **Syntax highlighting** — code blocks rendered with highlight.js (dark theme)
- 🌙 **Dark theme** — Dark inspired theme
- ⌨️ **Keyboard shortcuts** — Ctrl+S to save, Ctrl+B/I for bold/italic
- 🔄 **Auto-save** — documents are saved automatically after 5 seconds of inactivity
- 📏 **Resizable panes** — drag the divider between editor and preview to your preferred ratio
- 📊 **Status bar** — live word count, line count and character count
- 🚀 **Quick setup** — one `npm install` and the database tables are created automatically

---

## 📸 Screenshots

> The interface is fully dark-themed. Add your own screenshots by placing images in the repo and referencing them below.

| Landing Page | Dashboard |
| --- | --- |
| ![Landing](https://media.discordapp.net/attachments/1502276789412561020/1527409367325085797/landing.png?ex=6a5a8e53&is=6a593cd3&hm=95669c54f3e4e2b845755c62573a1cc8f900a94d5b776242eb759cee06bc12a2&=&format=webp&quality=lossless&width=878&height=806) | ![Dashboard](https://media.discordapp.net/attachments/1502276789412561020/1527409379320795330/dashboard.png?ex=6a5a8e55&is=6a593cd5&hm=6e99b63cce8d21467560e9758241f9317b29d008644f22a23ed341edb132d7aa&=&format=webp&quality=lossless&width=828&height=806) |

| Editor / Preview |
| --- |
| ![Editor](https://media.discordapp.net/attachments/1502276789412561020/1527409818103713922/editor.png?ex=6a5a8ebe&is=6a593d3e&hm=be8c74c6263c5eb18febc0149809ad86e2baf6f77040cea7605cc32d5b276508&=&format=webp&quality=lossless&width=1521&height=572) |

---

## 🚀 Quick Start

The fastest way to get MindMark running locally:

```bash
# 1. Navigate to the project folder
cd MindMark

# 2. Install dependencies
npm install

# 3. Create and configure the .env file
cp .env.example .env
# Edit .env with your MariaDB credentials

# 4. Start the server
npm start
```

Then open [http://localhost:3010](http://localhost:3010), create an account and start writing.

---

## 📦 Installation

### Prerequisites

| Tool | Version | Required |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 18+ | ✅ |
| [MariaDB](https://mariadb.org/) or [MySQL](https://mysql.com/) | 10+ / 5.7+ | ✅ |

### Step-by-step

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create the database**
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS MindMark;"
   mysql -u root -p -e "CREATE USER IF NOT EXISTS 'MindMark'@'localhost' IDENTIFIED BY 'MindMark1998!';"
   mysql -u root -p -e "GRANT ALL PRIVILEGES ON MindMark.* TO 'MindMark'@'localhost'; FLUSH PRIVILEGES;"
   ```

3. **Configure the environment**
   ```bash
   cp .env.example .env
   ```
   Adjust `PORT`, `DB_*` and `SESSION_SECRET` if desired.

4. **Start the server**
   ```bash
   # Production
   npm start

   # Development (with auto-reload)
   npm run dev
   ```

5. **Open the web interface**

   Go to `http://localhost:3000` (or the port from your `.env`), register an account and start creating documents.

> The database tables (`users`, `documents`) are created automatically on first startup.

---

## ⚙️ Configuration

All configuration lives in `.env`. Copy `.env.example` to `.env` and adjust.

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | The port the server listens on | `3010` |
| `DB_HOST` | MariaDB host | `localhost` |
| `DB_PORT` | MariaDB port | `3306` |
| `DB_USER` | MariaDB user | `Database username` |
| `DB_PASSWORD` | MariaDB password | `Database password` |
| `DB_NAME` | MariaDB database name | `MindMark` |
| `SESSION_SECRET` | Long random string used to sign session cookies | `change-this-to-a-random-secret` |

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

---

## 📡 API

MindMark exposes a session-authenticated JSON API.

### Preview

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/editor/preview` | `{ content }` | Render markdown to HTML |

### Documents

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/editor/save` | `{ id?, title, content }` | Create or update a document |
| `DELETE` | `/editor/:id` | — | Delete a document |

### Auth

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | `{ username, email, password }` | Create a new account |
| `POST` | `/login` | `{ username, password }` | Log in |
| `GET` | `/logout` | — | Log out |

---

## 📁 Project Structure

```
MindMark/
├── server.js                # Express server + session config
├── package.json             # Dependencies and scripts
├── .env                     # Configuration (git-ignored)
├── .env.example             # Configuration template
├── .gitignore
├── README.md                # This file
│
├── src/
│   ├── config/
│   │   └── db.js            # MariaDB connection pool + schema init
│   │
│   ├── middleware/
│   │   └── auth.js          # requireAuth middleware
│   │
│   ├── routes/
│   │   ├── index.js         # Dashboard / landing page
│   │   ├── auth.js          # Login, register, logout
│   │   └── editor.js        # Editor, save, preview, delete
│   │
│   ├── views/
│   │   ├── partials/        # header.ejs, footer.ejs
│   │   ├── index.ejs        # Landing page + dashboard
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   └── editor.ejs       # Split editor with sidebar + toolbar
│   │
│   └── public/
│       ├── css/
│       │   └── style.css    # Dark theme styles
│       ├── js/
│       │   └── editor.js    # Editor logic, live preview, resize
│       └── images/
│           └── logo.png     # Project logo
│
└── dev/                     # Development files (git-ignored)
    └── database.md          # Local database credentials
```

---

## 📄 License

Released under the [MIT License](LICENSE).

<div align="center">

---

<p>
  <sub>Built by <a href="https://github.com/MindOfDaanNL">@MindOfDaanNL</a> — Made with some love for the community.
</p>

</div>
