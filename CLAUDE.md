# NB6018CEM courseware portal (public repository)

This repository is public, and so is its whole history. Everything committed here is served to students by GitHub Pages within minutes of a push. Instructor material lives in the private sibling repository `BScEHNS-Data-Recovery-and-Advanced-Digital-Forensic-Analysis-Meta`; assessment documents, dates and evidence downloads live on the LMS.

## If you are a session build (an S thread)

- Write only your session's paths: `sessions/sNN/` (page, `demos/`, `slides/`, `img/`) and `_data/glossary/sNN.yml`.
- Never edit shared files: `_config.yml`, `_layouts/`, `_includes/`, `assets/`, `_data/module.yml`, `_templates/`, the module pages (`index.html`, `how-to-use/`, `case/`, `assessment/`, `glossary/`), `README.md`, `CLAUDE.md`, the licence files, or another session's files.
- Never commit keys, ground truths, marking material, mock or phase-test papers, instructor notes, evidence files, archives, PDFs, cohort names or calendar dates. When unsure, it belongs in the private repository.
- Start from `_templates/session-template.md`, `_templates/demo-template.html` and `_templates/glossary-template.yml`.
- Before asking to push, run the gate from the private clone: `python3 -I tools/preflight.py SNN`. Fix every FAIL.
- Wait for the lecturer to reply **push**. Push the private repository first, then this one, to `main`, after `git fetch origin main` and `git rebase origin/main`. Never force-push, never amend a pushed commit.
- The full contract is the project file `06_Courseware_Portal.md`.

## If you are the planning thread

You may change shared files. Run the gate with `--planning` before pushing, and check the live site after the push.
