---
layout: page
title: How to use this courseware
subtitle: Read this first. It takes about ten minutes.
description: "How the NB6018CEM courseware works: the three layers, comparisons, demos, quick checks, labs and your progress record."
---

## What this site is for

You can learn this module from these pages. Each session page is complete: it explains the ideas, shows how they work, and walks you through the lab. Class time is for practice, questions and labs. The notes do not need the class to make sense, and the class does not replace the notes.

The module is in English, and many technical words are new. The pages are written for that. Sentences are short, every new word is explained the first time it appears, and the same word always means the same thing on every page.

## What is on a session page

Every session page has the same parts, in the same order, so you always know where you are.

| Part | What it gives you |
|---|---|
| The case today | The question our investigation needs answered in this session. Everything on the page helps to answer it. |
| By the end you will be able to | What you should be able to do after the session. Use it to check yourself at the end. |
| Before you start | What you should already know. Each item links back to the session that taught it. |
| The sections | The teaching, in small steps. Each step builds on the one before. |
| Quick checks | Short questions inside the sections. Tap an answer to see if you are right, and why. |
| Demos | Interactive pages that show what happens inside a disk, a network or a log. |
| The lab | Numbered steps for your virtual machines, with what you should see at each step. |
| End-of-day quiz | Five short-answer questions at the end of each day (Days 1 to 8). |
| Everything for this session | All demos and the slides, in one list. |

## The three layers

Each idea is explained in three layers. You do not have to read them all at once.

1. **The idea.** What it is, in plain English. Read this first.
2. **How it works.** Why it works that way. This is where most demos are.
3. **Going deeper.** Standards, special cases and tool details. These sections are closed. Open them when you are ready, and always before the phase test and the coursework.

A good first pass is: read the ideas and do the quick checks. A good second pass is: read how it works, play the demos and do the lab. Use the deeper sections when you revise.

## Comparisons, and why we show where they break

Sometimes a page explains a hard idea by comparing it to something you already know. Every comparison has four parts, and the third part is the most important.

<div class="box metaphor" markdown="1">
**The comparison.** A forensic image is like a photocopy of a book.

**Why it fits.** You study the copy and leave the original untouched.

**Where it breaks.** A photocopy loses things you cannot see, such as words that were rubbed out. A forensic image keeps those too: deleted data and the empty space around files.

**So what.** This is why investigators make an image of the whole disk instead of copying the files. A file copy would miss the deleted evidence.
</div>

When a comparison breaks, it shows you exactly where the real idea is different. Learn the break, not only the comparison. If you can explain where a comparison fails, you understand the real thing.

Some pages also look at an idea **through another lens**: a film, a song, a painting or a discovery from another subject. These are there to make you think. They are never needed to answer a test question.

## Words to know

Words with a dotted underline are in the glossary. Hover over them, tab to them, or tap them on a phone to see the meaning. The [full list of words](../glossary/) shows every word and the session that first teaches it.

## Demos

A demo is a small interactive page. It shows something you cannot see on a screenshot: how a deleted file is found, how a hash changes, how a log builds a timeline. Demos work on a phone or a laptop, need nothing installed, and are safe to play with. Every demo ends with a short panel called **What you just saw**. Read it: it connects what you saw to the idea in the notes.

## Labs and evidence

{% assign p0 = site.pages | where: "session_code", "S00" | first %}Labs run inside your own virtual machines, as set up in {% if p0 %}[Before Day 1](../sessions/s00/){% else %}Before Day 1{% endif %}. The evidence files you examine are **never on this site**. Each lab tells you where to get them: the lab share or the LMS.

Some labs handle malware. Those labs have a **safety rule** box. Follow it exactly, every time.

## Quick checks and the end-of-day quiz

The answers are on the page, so you could look first. Do not. Answer first, then check. The value is in the trying.

For the end-of-day quiz, write your answer in about two sentences before you open the model answer. Then mark yourself on the points you made. A longer answer does not earn more; a correct, relevant point does.

## Your progress record

At the end of each session page there is a **Mark this session as done** button. It saves a tick on this device only. Nobody else can see it, and it does not lock or unlock anything. If you clear your browser data, or change device, the ticks are gone, but the pages are not.

## A routine for studying on your own

1. Before the session: read **The case today** and the ideas.
2. In the session: do the lab and ask your questions.
3. After the session: read **How it works** and play the demos again. Do the quick checks without looking.
4. At the end of each day: do the end-of-day quiz.
5. Each week: go through the [words to know](../glossary/) and say each meaning aloud.

## Printing

Every page prints in grayscale, with all closed sections opened, so nothing is lost on paper.

## Getting help

Ask in class, or email the module lecturer. Announcements, dates and assessment documents are on the LMS.
