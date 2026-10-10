# NB6018CEM courseware portal (public repository)

This repository is public, and so is its whole history, on every branch. GitHub Pages serves the `main` branch to students; work arrives on `dev`, and only the lecturer merges `dev` into `main`. Instructor material lives in the private sibling repository `BScEHNS-Data-Recovery-and-Advanced-Digital-Forensic-Analysis-Meta`; assessment documents, dates and evidence downloads live on the LMS.

## If you are a session build (an S thread)

- Write only your session's paths: `sessions/sNN/` (page, `demos/`, `slides/`, `img/`) and `_data/glossary/sNN.yml`.
- Never edit shared files: `_config.yml`, `_layouts/`, `_includes/`, `assets/`, `_data/module.yml`, `_templates/`, the module pages (`index.html`, `how-to-use/`, `case/`, `assessment/`, `glossary/`), `README.md`, `CLAUDE.md`, the licence files, or another session's files.
- Never commit keys, ground truths, marking material, mock or phase-test papers, instructor notes, evidence files, archives, PDFs, cohort names or schedule dates (classes, deadlines, tests). Dates and times recorded in the evidence are shown as recorded (D43). When unsure, it belongs in the private repository.
- Start from `_templates/session-template.md`, `_templates/demo-template.html` and `_templates/glossary-template.yml`.
- Work on `dev` (a shallow clone needs `git remote set-branches origin '*'`, `git fetch origin`, `git checkout -B dev origin/dev`). Before pushing, run the gate from the private clone: `python3 -I tools/preflight.py SNN`. Fix every FAIL.
- Push the private repository first, then this one to `dev`, after `git fetch origin` and `git rebase origin/dev`. Never push to `main`, never force-push, never amend a pushed commit. `dev` is public too, so the gate runs before every push.
- The full contract is the project file `06_Courseware_Portal.md`.

## If you are the planning thread

You may change shared files. Run the gate with `--planning` before pushing, push to `dev` like a session build, and check the live site after the lecturer merges.
