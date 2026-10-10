# NB6018CEM Data Recovery and Advanced Digital Forensic Analysis: courseware portal

Public courseware for a Level 6 module of the NIBM BSc (Hons) Ethical Hacking and Network Security, served with GitHub Pages:
https://nirangadh.github.io/BScEHNS-Data-Recovery-and-Advanced-Digital-Forensic-Analysis/

## This repository is public

Everything here, including its history, is public. Instructor material lives in a separate private repository. Assessment documents, dates and evidence files are on the LMS or the lab share. Never commit lecture notes, answer keys, ground truths, marking material, phase tests or evidence files here.

## Layout

| Path | What it is | Who edits it |
|---|---|---|
| `_config.yml`, `_layouts/`, `_includes/`, `assets/` | Site structure and style | The planning thread only |
| `_data/module.yml` | Sessions, days, learning outcomes | The planning thread only |
| `index.html`, `how-to-use/`, `case/`, `assessment/`, `glossary/` | Module-level pages | The planning thread only |
| `sessions/sNN/index.md` | One session page | That session's build |
| `sessions/sNN/demos/` | That session's HTML demos | That session's build |
| `sessions/sNN/slides/` | That session's slide deck | That session's build |
| `sessions/sNN/img/` | That session's images | That session's build |
| `_data/glossary/sNN.yml` | That session's new terms | That session's build |
| `_templates/` | Templates for session builds (not published) | The planning thread only |
| `CLAUDE.md` | Rules for Claude threads working in this repository (not published) | The planning thread only |

A session build never edits a shared file. It writes only its own paths, passes the pre-push gate kept in the private repository, and pushes to the `dev` branch. The lecturer merges `dev` into `main` (a merge commit or fast-forward, never a squash), and GitHub Pages publishes `main`. The home page finds each published session by itself. `CLAUDE.md` holds the rules for any Claude thread working here.

## Licences

Content: CC BY-NC-SA 4.0 (`LICENSE-CONTENT.md`). Code: MIT (`LICENSE-CODE.md`). Open Sans: SIL Open Font Licence 1.1 (`assets/fonts/OFL.txt`). Datasets are not part of this repository and keep their own licences.
