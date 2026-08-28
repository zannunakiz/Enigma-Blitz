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
---

## 🐍 Enigma Blitz 2.0: single python version available

No Next.js needed — EnigmaBlitz is also packaged as a **single standalone Python script**, `EB.py`. Drop it into the **root of any project** (right next to your `package.json` or `.env`), run one command, and it compiles the files you pick into a clean, ready-to-paste `EB.txt` context blob — the same format the web UI produces.

Unlike the web version (which reads only `PROJECT_CONTEXT`), the Python CLI scans your **whole project** from wherever `EB.py` sits, so you can grab real source files anywhere in the tree.

### ✅ Requirements

- Python **3.7+** (no third-party packages — pure standard library)

### 🚀 Quick start

```bash
python EB.py --file page.tsx layout.tsx
```

This creates `EB.txt` (in the same folder as `EB.py`) containing the rendered context for both files.

### 🔧 Usage

| Command | Description |
| ------- | ----------- |
| `--file <name-or-path>` | Select one file. Repeatable / space-separated. |
| `--folder <path>` | Select **every** non-ignored file inside a folder, alphabetically ordered. |
| `-h` / `--help` | Show usage documentation. |

Flags can be combined and interleaved in one command:

```bash
python EB.py --file random.txt SelectionPanel.tsx --folder PROJECT_CONTEXT/folderB
```

### 🧠 Smart file resolution

If multiple files share the same **name**, `EB.py` resolves them by these rules:

- **Bare name** → picks the **top-most (shallowest)** match.
  ```bash
  python EB.py --file page.tsx          # resolves app/page.tsx (NOT app/dummy/page.tsx)
  ```
- **Explicit path** → you pick exactly which one, and both can be included together.
  ```bash
  python EB.py --file page.tsx app/dummy/page.tsx   # includes BOTH files
  ```
- **Unique name** → works from anywhere, with or without a path.
  ```bash
  python EB.py --file unique.tsx            # resolves app/dummy/unique.tsx
  python EB.py --file app/dummy/unique.tsx  # same result
  ```

### 🧹 Ignored paths

By default `EB.py` skips gitignore-style entries while scanning — edit the `DEFAULT_IGNORE` list at the top of `EB.py` to customize:

```python
DEFAULT_IGNORE = [
    "node_modules",     # match by name at any depth
    "*.log",            # glob patterns
    "src/legacy",       # exact relative path (and its children)
    "# comments",       # lines starting with # are ignored
]
```

Entries starting with `#` are treated as comments. Folders and files matching these names are not picked up by `--folder` and are not listed as bare-name candidates — so `node_modules`, `.git`, `.next`, etc. are never rendered.

### 📄 Output format

`EB.txt` uses the exact same template as the EnigmaBlitz frontend:

```text
File 1: root/app/page.tsx:
'use client';
...


File 2: root/components/SelectionPanel.tsx:
...


{Context end}
```

Each file gets a `File N: root/<rel-path>:` header followed by its raw content, blocks are separated by a blank line, and the blob closes with `{Context end}`.

### 🖥️ Console output

While running, `EB.py` logs each file it renders and a final summary:

```text
Rendering file: root/app/page.tsx
Rendering file: root/app/dummy/page.tsx
--------------------------------------------------
Compiled 2 file(s) into: C:\...\EB.txt
```