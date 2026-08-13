<p align="center">
  <img src="public/EnigmaBlitzLogo.png" alt="EnigmaBlitz Logo" width="140" height="140" />
</p>

<h1 align="center">⚡ EnigmaBlitz</h1>

<p align="center">
  <strong>Flash Context Compiler for Prompt Engineering</strong>
</p>

<p align="center">
  <em>Turn scattered project files into one clean, ready-to-paste context blob in seconds.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4" />
</p>

---

## 🧠 What is EnigmaBlitz?

EnigmaBlitz is a lightweight **local-first context helper** for prompt engineering. Working with an AI like ChatGPT, Claude, Gemini, or DeepSeek and tired of copy-pasting each file one by one? EnigmaBlitz compiles all the files you select into a single, well-formatted `Context.txt` — ready to paste straight into your favorite AI's context window.

Think of it as a **context compiler**: you choose what matters, EnigmaBlitz assembles it, and your AI instantly understands your entire project.

### ✨ Features

- 📂 **Visual directory browser** — navigate your files and folders inside `PROJECT_CONTEXT` with ease.
- 🔎 **Universal whole-project search** — search by file name *anywhere* in the tree, regardless of the folder you're currently viewing.
- 📝 **Reorder your files** — arrange the compilation sequence exactly the way you want it.
- 📁 **Add whole folders** — batch-select every non-ignored file inside a folder in one click.
- 🧹 **Smart ignores** — `node_modules`, `.git`, build outputs, and lock files are filtered out automatically.
- 🚀 **Create Context.txt** — compile everything into a single clean file with copy and download support.
- 🖥️ **100% local** — nothing leaves your machine; all processing happens on your own server.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) **20+**
- [npm](https://www.npmjs.com) (bundled with Node.js)

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. ✅

> **Troubleshooting:** if the server fails to boot, check that port `3000` is free and that `npm install` completed without errors. The app will terminate with a clear message if anything is wrong.

Production build & start:

```bash
npm run build
npm start
```

---

## 🧑‍🍳 How to Use — Step by Step

### 1️⃣ Put your project into `PROJECT_CONTEXT`

EnigmaBlitz only reads files inside a folder named **`PROJECT_CONTEXT`** at the project root.

```text
enigmablitz/
├── PROJECT_CONTEXT/     ← your files go here
│   ├── src/
│   ├── package.json
│   └── README.md
├── app/
├── lib/
└── ...
```

- Copy your real project (or the parts you want to give the AI) into `PROJECT_CONTEXT`.
- The folder is created automatically on first run if it doesn't exist yet.
- ✅ **Success:** you should see your files listed inside the directory browser.
- ❌ **Error:** if nothing appears, make sure the files actually exist under `PROJECT_CONTEXT` and refresh the view with the **Sync** button.

> 💡 **Tip:** `PROJECT_CONTEXT` is ignored by Git, so your data and secrets won't be committed.

### 2️⃣ Navigate and find your files

Use the left panel to browse folders and breadcrumbs. Type in the **search box** to instantly find any file across the whole project — no matter where you are in the tree.

### 3️⃣ Select files (or whole folders)

- Click **Add** on individual files to include them.
- Click **Add Folder** to include every non-ignored file inside a folder at once.
- Reorder your selection with the ⬆️ / ⬇️ arrows to control the output sequence.
- Remove any file with the 🗑️ icon, or **Clear All** to start over.

### 4️⃣ Create the context

Click **Create Context** in the right panel. EnigmaBlitz reads every selected file and bundles them into a single `PROJECT_CONTEXT/Context.txt`.

- ✅ **Success:** a preview modal opens with your compiled context, plus a confirmation message.
- ❌ **Error:** if no file is selected, the button stays disabled. If a selected file is missing or unreadable, it is reported inside the generated file so you always know what happened.

### 5️⃣ Copy, download & use

From the preview modal you can:

- 📋 **Copy** the full context to your clipboard.
- 💾 **Download** it as `Context.txt`.
- Then **paste it into ChatGPT, Claude, Gemini, or DeepSeek** and start prompting with full project context immediately.

---

## 🔌 API Reference

All endpoints return JSON with a `success` boolean and either `data` (on success) or `error` (on failure).

| Method | Endpoint | Description | Success |
| ------ | -------- | ----------- | ------- |
| `GET` | `/api/fs?path=<dir>` | List the contents of a directory | `200` |
| `GET` | `/api/fs?action=scan_folder&path=<dir>` | Recursively scan a folder for files | `200` |
| `GET` | `/api/fs?action=search&query=<term>` | Search the whole project by file name | `200` |
| `POST` | `/api/context` | Generate `Context.txt` from selected paths | `200` |

### Error status codes

| Status | Meaning |
| ------ | ------- |
| `400` | Invalid request — e.g. an empty/malformed JSON body or no file paths provided |
| `404` | Directory not found under `PROJECT_CONTEXT` |
| `500` | Internal server error while reading files or generating the context |

Every error response includes a human-readable `error` message to make debugging straightforward.

---

## 🗂️ Project Structure

```text
enigmablitz/
├── app/
│   ├── api/
│   │   ├── fs/            ← directory listing, folder scan, and search
│   │   └── context/       ← context file generation
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           ← main UI
├── components/
│   ├── FolderExplorer.tsx      ← directory browser + universal search
│   ├── SelectionPanel.tsx      ← selected files & reordering
│   ├── ContextPreviewModal.tsx ← preview / copy / download
│   └── Header.tsx              ← top bar
├── lib/
│   ├── constants.ts        ← shared constants & types
│   └── file-system.ts      ← filesystem & context logic
├── public/
│   └── EnigmaBlitzLogo.png
└── PROJECT_CONTEXT/        ← your data (git-ignored)
```

---

## 🛠️ Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router) with [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)
- **UI** — [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com)
- **Icons** — [lucide-react](https://lucide.dev)
- **Language** — [TypeScript 5](https://www.typescriptlang.org)
- **Storage** — Local filesystem (`PROJECT_CONTEXT` directory)

---

## 📜 Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint across the codebase |

---

## 📄 License

Distributed under the **Tralalero Tralala License**.

<a href="https://youtu.be/1SuppWn-Heg?si=bFAvdPPCz8ksoEEr" target="_blank" rel="noopener noreferrer">Documentation Video 🔗</a>


---

Made by **Richky Abednego**