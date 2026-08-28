#!/usr/bin/env python3
"""
EnigmaBlitz 2.0 - single python version available.

A lightweight, local-first context compiler for prompt engineering.
Drop this EB.py file into the root of any project (same folder as your
package.json / .env) and compile the files you care about into a single
clean, ready-to-paste EB.txt blob.

Usage:
    python EB.py --file page.tsx layout.tsx
    python EB.py --file page.tsx app/dummy/page.tsx
    python EB.py --file unique.tsx
    python EB.py --file random.txt SelectionPanel.tsx --folder PROJECT_CONTEXT/folderB

Exact output format matches the EnigmaBlitz Next.js frontend:
    File N: root/<rel_path>:
    <content>
    ...blocks joined by a blank line...
    {Context end}
"""

from __future__ import annotations

import fnmatch
import os
import sys


# --------------------------------------------------------------------------- #
#  Configuration  (edit these to suit your project)
# --------------------------------------------------------------------------- #
ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE_NAME = "EB.txt"

# These names/paths are skipped while scanning the project, gitignore-style.
# - "name"        -> matches any file/folder with that name at any depth
# - "*.ext"       -> matches any file/folder matching that glob
# - "some/path"   -> matches that exact relative path (or its deeper children)
# - "#..."        -> comment line
DEFAULT_IGNORE = [
    "# General",
    "node_modules",
    ".git",
    ".next",
    ".vercel",
    "dist",
    "build",
    "out",
    "coverage",
    ".DS_Store",
    ".env*",
    "*.log",

    "# Lock files",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",

    "# Editors",
    ".vscode",
    ".idea",

    "# EnigmaBlitz itself (avoid self-inclusion)",
    "Context.txt",
    "EB.txt",
    "EB.py",
]
# --------------------------------------------------------------------------- #
#  Ignore helpers
# --------------------------------------------------------------------------- #
class IgnoreRules:
    """Holds the project ignore list and tells whether a rel path is ignored."""

    def __init__(self, patterns):
        self._exact = set()
        self._globs = []
        self._prefixes = []

        for raw in patterns:
            pattern = raw.strip().replace("\\", "/").lower()
            if not pattern or pattern.startswith("#"):
                continue
            if pattern.startswith("!"):
                # Negations are not supported; we keep them out to avoid surprise.
                continue
            if any(ch in pattern for ch in "*?["):
                self._globs.append(pattern)
            elif "/" in pattern:
                self._prefixes.append(pattern.rstrip("/"))
            else:
                self._exact.add(pattern)

    def ignored(self, rel_path):
        rel = rel_path.replace("\\", "/").lower()
        name = rel.split("/")[-1]

        if name in self._exact:
            return True
        for prefix in self._prefixes:
            if rel == prefix or rel.startswith(prefix + "/"):
                return True
        for glob in self._globs:
            if fnmatch.fnmatch(rel, glob) or fnmatch.fnmatch(name, glob):
                return True
        return False


# --------------------------------------------------------------------------- #
#  Project scan
# --------------------------------------------------------------------------- #
def scan_project(ignore_rules):
    """Return a dict: basename -> list of non-ignored rel paths (sorted).

    Lists are ordered so the *shallowest* (most-top) match comes first,
    which drives the bare-basename resolution rule.
    """
    by_name = {}

    for dirpath, dirnames, filenames in os.walk(ROOT):
        # Prune ignored directories in-place so os.walk does not descend.
        dirnames[:] = [
            d for d in dirnames
            if not ignore_rules.ignored(os.path.join(dirpath, d))
        ]

        for filename in filenames:
            full = os.path.join(dirpath, filename)
            rel = os.path.relpath(full, ROOT).replace("\\", "/")
            if ignore_rules.ignored(rel):
                continue
            by_name.setdefault(filename, []).append(rel)

    # Depth = number of path segments; tie-break lexicographically.
    for name in by_name:
        by_name[name] = sorted(
            by_name[name], key=lambda rel: (rel.count("/"), rel)
        )
    return by_name


def resolve_bare_name(name, by_name):
    """Resolve a bare file name to the top-most (shallowest) match.

    e.g. "page.tsx" -> "app/page.tsx" (not "app/dummy/page.tsx").
    """
    matches = by_name.get(name)
    if not matches:
        return None
    return matches[0]


# --------------------------------------------------------------------------- #
#  Argument collection
# --------------------------------------------------------------------------- #
def parse_args(argv):
    """Parse --file/--folder tokens into mode-tagged entries, preserving order.

    Bare tokens before any flag are treated as --file entries. Flags may be
    interleaved, e.g. --file a --folder X --file b.
    """
    entries = []
    mode = "file"  # default until a flag is seen

    for arg in argv:
        if arg in ("--file", "--folder"):
            mode = "file" if arg == "--file" else "folder"
        elif arg in ("-h", "--help"):
            return None  # caller prints help
        else:
            entries.append((mode, arg))
    return entries


# --------------------------------------------------------------------------- #
#  Rendering
# --------------------------------------------------------------------------- #
def render_block(index, rel_path):
    full = os.path.join(ROOT, rel_path)
    display = "root/" + rel_path.replace("\\", "/")

    try:
        if os.path.isfile(full):
            with open(full, "r", encoding="utf-8", errors="replace") as fh:
                content = fh.read()
        else:
            content = "File not found or unreadable: " + rel_path
    except Exception as exc:  # noqa: BLE001
        content = "Error reading file: {}".format(exc)

    print("Rendering file: {}".format(display))
    return "File {}: {}:\n{}".format(index, display, content)


def folder_contents(folder_rel, ignore_rules):
    """Return every non-ignored file under folder_rel, sorted alphabetically."""
    folder_abs = os.path.join(ROOT, folder_rel.replace("/", os.sep))
    found = []

    if os.path.isdir(folder_abs):
        for dirpath, dirnames, filenames in os.walk(folder_abs):
            dirnames[:] = [
                d for d in dirnames
                if not ignore_rules.ignored(os.path.join(dirpath, d))
            ]
            for filename in filenames:
                rel = os.path.relpath(os.path.join(dirpath, filename), ROOT)
                rel = rel.replace("\\", "/")
                if ignore_rules.ignored(rel):
                    continue
                found.append(rel)

    found.sort(key=lambda rel: (rel.count("/"), rel.lower()))
    return found


# --------------------------------------------------------------------------- #
#  Main
# --------------------------------------------------------------------------- #
def main(argv):
    if "-h" in argv or "--help" in argv:
        print(__doc__)
        return 0

    entries = parse_args(argv)
    if entries is None:
        print(__doc__)
        return 0
    if not entries:
        print("Error: no files requested.")
        print(__doc__)
        return 1

    ignore_rules = IgnoreRules(DEFAULT_IGNORE)
    by_name = scan_project(ignore_rules)

    resolved = []
    seen = set()

    def add(rel_path):
        if rel_path not in seen:
            seen.add(rel_path)
            resolved.append(rel_path)

    for mode, token in entries:
        token_normalized = token.replace("\\", "/").strip("/")

        if mode == "folder":
            if not os.path.isdir(os.path.join(ROOT, token_normalized.replace("/", os.sep))):
                print("Warning: folder not found: {}".format(token))
                continue
            for rel in folder_contents(token_normalized, ignore_rules):
                add(rel)
            continue

        # --file mode
        if "/" in token_normalized:
            # Explicit path -> user intent wins, even if parent is ignored.
            if not os.path.isfile(os.path.join(ROOT, token_normalized.replace("/", os.sep))):
                print("Warning: file not found: {}".format(token))
                continue
            add(token_normalized)
        else:
            rel = resolve_bare_name(token_normalized, by_name)
            if rel is None:
                print("Warning: file not found: {}".format(token))
                continue
            add(rel)

    if not resolved:
        print("No files rendered. Nothing written to {}.".format(OUTPUT_FILE_NAME))
        return 1

    blocks = [
        render_block(i + 1, rel)
        for i, rel in enumerate(resolved)
    ]
    final_output = "\n\n".join(blocks) + "\n\n{Context end}"

    output_path = os.path.join(ROOT, OUTPUT_FILE_NAME)
    with open(output_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(final_output)

    print("-" * 50)
    print("Compiled {} file(s) into: {}".format(len(resolved), output_path))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
