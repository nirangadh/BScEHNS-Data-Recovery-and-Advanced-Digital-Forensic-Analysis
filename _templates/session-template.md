---
# sessions/sNN/index.md - one session page. Replace every placeholder. Remove nothing structural.
# Day, learning outcomes and "Helps with" come from _data/module.yml automatically: do not restate them.
session_code: S01
description: "One sentence for search results and link previews: what this session teaches."
hook: >-
  The question our investigation needs answered today, from the case (04_Case_File.md).
  One or two sentences, in the voice of the unit.
outcomes:
  - "Explain ... (an observable verb: explain, compare, apply, identify, justify)"
  - "Apply ..."
before:
  - "Explain what a [hash value](../s01/) is (Session 1)"
demos:
  - id: S01-D1
    title: "Short title of the demo"
    file: s01-d1-short-name.html
    teaches: "One line: the single mechanism this demo makes visible."
slides: s01-short-name.pptx
evidence: "the lab share, folder S01 (the lab steps say exactly which file)"
---

<!-- Markup rule: leave a blank line after every <div ... markdown="1"> AND before its </div>, or tables and lists inside will not render.
     Page skeleton: concept sections in rising difficulty, then the lab, then check yourself.
     Each concept section: The idea -> How it works -> Going deeper (closed). -->

## 1. First concept, as a plain statement

### The idea

Short sentences, mostly under 20 words. Define each new word the first time with a glossary term:
a {% include term.html t="forensic-image" %} keeps everything on the disk.

### How it works

Explain the mechanism and why it works that way. Put a demo exactly where students usually get confused:

{% include demo.html id="S01-D1" %}

<div class="box metaphor" markdown="1">

**The comparison.** X is like Y.

**Why it fits.** Map each part: X's ... is like Y's ... because ...

**Where it breaks.** Y does ..., but X does not, because ...

**So what.** For the investigation, this means ...

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A question that tests understanding, not memory?</p>
  <ul class="qc-opts">
    <li data-key="a">A plausible wrong answer</li>
    <li data-key="b">The right answer</li>
    <li data-key="c">A plausible wrong answer that targets a common mix-up</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Why it is right, and why the tempting wrong answer is wrong.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The standard behind it</summary>

Standards, edge cases, tool specifics. Full sentences; still plain English.
</details>

<div class="box key" markdown="1">

One sentence students must remember from this section.

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "..." | ... | ... |

</div>

<div class="box lens" markdown="1">

The cross-disciplinary lens from Teaching Plan Section 7: what it is, the parallel, and the question it raises.
Name and paraphrase works; never quote lyrics or show film stills.

</div>

## 2. The lab: a plain statement of the task

<div class="box safety" markdown="1">

Only where needed (malware, live systems): the exact rule.

</div>

1. Do this, in this VM, with this tool.

   <div class="box expect" markdown="1">

   What the screen shows when the step worked: a value, a window, a line of output.

   </div>

   <div class="box trouble" markdown="1">

   If you see ..., then ... because ...

   </div>

2. Next step.

## Check yourself

**1. A question in phase-test style.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
About two sentences. The points that earn marks: ...
</details>

<!-- Day-closing sessions only (module.yml day_closing: true): the end-of-day quiz.
     Five short answers, never copied from or into a phase test. -->
<div class="quiz" markdown="1">

## End-of-day quiz

Write each answer in about two sentences before you open the model answer. Mark yourself on the points you made.

<div class="sa" markdown="1">

**Q1.** Question. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
Model answer. **Points:** (1) ... (2) ... (3) ...
</details>

</div>

</div>

## Coming next

One or two sentences that connect today to the next session.
