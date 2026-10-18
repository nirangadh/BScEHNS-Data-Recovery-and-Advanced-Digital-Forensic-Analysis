---
session_code: S18
description: "The coursework workshop and viva preparation: reading a rubric as a reader's checklist, planning the report in the template with a word budget, the coursework block's common pitfalls, what the viva is for and how to prepare, academic integrity, a safe teardown of the AWS environment after the coursework closes, and technique and a revision map for the phase test."
hook: >-
  The drop is analysed and the report is drafted. Before anything leaves the unit, every finding must pass two tests:
  a reader's checklist, and a colleague's question, "how do you know?"
outcomes:
  - "Apply a rubric as a reader's checklist: map each of your findings to the assessment criterion it serves, and justify a self-assessed mark band with evidence from your draft"
  - "Plan the report in the template with a word budget, an executive summary written last, and figures and tables that carry their provenance"
  - "Identify the coursework block's common pitfalls in your own evidence set, timeline and draft, and correct each one from your evidence"
  - "Explain what the viva is for, and prepare to explain and reproduce each step, command and finding with its evidence and its limitations"
  - "Explain what academic integrity requires of your coursework, and how the viva helps to confirm authorship"
  - "Apply a peer-review protocol to a classmate's draft section, giving useful feedback without sharing findings or text"
  - "Apply a safe order to tear down your AWS environment once the coursework is closed"
  - "Apply short-answer and multiple-choice technique, and plan revision from the phase test's stated domains"
before:
  - "Have your AWS environment [ready to specification](../s11/#part-d-verify-every-setting-and-save-the-proof), with the incident run and both of your own logs kept (Session 11)"
  - "Have your evidence collected, sealed and recorded, and know [your own requests in the record](../s12/#3-the-observer-in-the-record) and the [readiness and collection check](../s12/#the-cloud-readiness-and-collection-check) (Session 12)"
  - "Write a [finding, a limitation and a recommendation](../s13/#9-limitations-and-recommendations-two-methods) by the method, in the [report template](../s13/#10-the-report-template) (Session 13)"
  - "Write an [executive summary last](../s16/#7-what-a-forensic-report-is-for-and-who-reads-it), and present [evidence a reader can trust](../s16/#8-evidence-a-reader-can-trust) (Session 16)"
demos:
  - id: S18-D1
    title: "From a finding to a band"
    file: s18-d1-finding-to-band.html
    teaches: "A mark band is decided by which elements of its descriptor the work shows, so adding a named exhibit, a stated clock and a reasoned gap moves one finding up, one element at a time, while extra words move nothing."
  - id: S18-D2
    title: "A word budget under pressure"
    file: s18-d2-word-budget.html
    teaches: "The total length is fixed, so a section that grows must be paid for by another, and the budget shows that trade before you write rather than after."
  - id: S18-D3
    title: "From an excuse to a finding"
    file: s18-d3-excuse-to-finding.html
    teaches: "A limitation written as an excuse is rebuilt, part by part, into what was seen, its effect on a conclusion and the evidence that shows it."
  - id: S18-D4
    title: "How do you know?"
    file: s18-d4-how-do-you-know.html
    teaches: "Each answer in a viva exchange must point one step closer to the evidence, from the claim to the row, the file, its hash value and your own log, and a missing link stops the chain however fluent the answer is."
  - id: S18-D5
    title: "A short answer, marked point by point"
    file: s18-d5-marked-point-by-point.html
    teaches: "A short answer earns whole marks as its mark points appear, so padding earns nothing and an unanswered second demand of the question costs a mark."
slides: s18-capstone-workshop.pptx
evidence: "none from the lab share: you work on your own coursework evidence, notes and draft; today's three forms are on the LMS"
---

Session 17 put the whole case on one clock. Today is about your own case: the cloud drop you built, collected and analysed in Sessions 11 to 13. Three plain statements first.

**Today is a workshop.** Most of the three hours is your own coursework time: checking, writing, a peer review and a viva rehearsal. The sections below give you the method for each part, and section 8 gives the plan for the time. Read sections 1 to 4 before the session if you can.

**The coursework documents are on the LMS, not here.** The brief, its summary rubric, the report template, the policy on tools and every date are on the LMS. This page never repeats them. It teaches how to read and use them, with examples that come from the unit's invented account and the CFReDS case, never from a coursework environment.

**There is nothing new to learn about the cloud.** Every technique today comes from an earlier session, and each one is linked. What is new is the reader's view: how your work looks to the person who marks it, and how it sounds when you explain it aloud.

<div class="box lms" markdown="1">

Open these from the LMS before you start, and keep them open beside this page: the coursework brief, its summary rubric, the report template, the policy on the use of tools, and the three forms for today (`s18-progress-form`, `s18-peer-review-form`, `s18-viva-rehearsal-form`). The LMS also gives the submission date, the viva slots and the mock phase test.

</div>

## 1. Reading a rubric as a reader's checklist

### The idea

A {% include term.html t="rubric" %} is written for the marker. It is a table. Each row is an {% include term.html t="assessment-criterion" %}: one quality of the work that is judged on its own. Each column is a {% include term.html t="mark-band" %}: a range of marks. Each cell holds a {% include term.html t="band-descriptor" %}: the words that say what work in that band shows.

You can read the same table from the other side, as a writer. Then each row becomes a question that the marker will ask of your report, and each descriptor tells you what the answer must show. Read that way, a rubric is a reader's checklist.

Here is an example. It is not from your coursework: it is a practice criterion that the unit uses for its own case reviews, applied to the Session 17 incident summary.

| Mark band | Band descriptor for "How each finding is supported" |
|---|---|
| Lower | Findings are stated, but their evidence is rarely named. Times are given without the clock they came from. Gaps are not mentioned. |
| Middle | Most findings name their evidence. Times are in UTC. Some gaps are mentioned but not explained. |
| Upper | Every finding names its exhibit, file and value. Every time is in UTC with its source clock. Each gap is stated as a limitation, with its effect on a conclusion. |

Read the three descriptors from left to right and you see the pattern: each band asks for the same elements as the band before, more completely. Nothing in them rewards length, effort or confident words. They reward what the work shows.

### How it works

**Move 1: turn each criterion into a question.** "How each finding is supported" becomes "For each finding, can the marker go from my sentence to the evidence?" Write the question down for every criterion in your own summary rubric. Use the rubric's own words in your question; do not guess what a criterion means from its title alone.

**Move 2: map each finding to the criterion it serves.** List your {% include term.html t="finding" %}s, one per line. Beside each, write the criterion or criteria it serves. A finding may serve more than one: the deletion of a version, for example, is part of your timeline and also evidence for a recommendation. Then read the map the other way, criterion by criterion. A criterion with nothing beside it is a gap in your report, and it is better to find it today than in the marker's feedback.

**Move 3: self-assess honestly.** For each criterion, choose the band whose descriptor your draft *fully* meets, not the one it nearly meets. Write down the evidence for your choice: the section, the paragraph, the table. Then write the one change that would move it up a band. That last line is the useful one, because it turns a mark into a plan.

Watch one finding move through the three bands of the practice criterion, one element at a time.

{% include demo.html id="S18-D1" %}

<div class="box metaphor" markdown="1">

**The comparison.** Reading a rubric before you write is like a learner driver reading the examiner's marking sheet before the test.

**Why it fits.** The sheet lists what the examiner watches, such as mirrors, signals and speed, and what counts at each level. A learner who has read it knows what to show, and when. A writer who has read the rubric knows what each section must make visible.

**Where it breaks.** A driving test is judged mostly by counting faults: the best drive is the one with nothing wrong. A rubric's upper bands are not reached by avoiding faults. They are reached by showing elements: a named exhibit, a stated clock, a reasoned gap. And the examiner watches you drive, while the marker sees only what is on the page and what you say in the viva. Work you did but did not write down cannot earn a band.

**So what.** Write so that the evidence for each descriptor is on the page, where a reader can find it without asking you.

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "A longer section gets a higher band." | "A band is decided by what the section shows." | Descriptors name elements, not word counts. |
| "I worked hard on this, so it is in the upper band." | "The draft shows these elements; this one is still missing." | Effort that is not on the page cannot be marked. |
| "Each criterion is one section of the report." | "A criterion can draw on several sections; my map shows which." | Findings, limitations and method may all serve one criterion. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">Using the practice criterion above, a finding names its exhibit, file and value, and its times are in UTC, but no time says which clock it came from, and one gap is mentioned without its effect. Which band does it fully meet, and what moves it up?</p>
  <ul class="qc-opts">
    <li data-key="a">Upper, because it names the exhibit, file and value</li>
    <li data-key="b">Middle; stating the source clock of each time and the effect of the gap would move it to upper</li>
    <li data-key="c">Lower, because one element is missing</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). It meets every element of the middle band, and the upper band also asks for each source clock and for each gap's effect (not a). One missing upper element does not pull it down to the lower band, whose descriptor it exceeds (c).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How markers use bands</summary>

Most banded rubrics are applied by **best fit**: the marker reads the work against each descriptor and chooses the band that describes it best, then places the mark inside the band by how fully the work meets it. Some rubrics are **analytic**, with a mark for each criterion added up at the end; others are **holistic**, with one judgement for the whole work. Your summary rubric says which kind it is and how its bands work. Read that part as carefully as the descriptors.

Marks inside a band are usually whole marks. Work is often second-marked or moderated: another marker reads a sample against the same rubric, so the descriptors, not one marker's taste, decide the band. That is why the descriptor's words matter more than any guess about what a marker likes.
</details>

<div class="box key" markdown="1">

Read the rubric as the marker's questions. Map every finding to the criterion it serves, choose the band your draft fully meets, and write the change that would move it up.

</div>

## 2. Planning the report in the template

### The idea

You already have the report's shape. Session 13 gave you the {% include term.html t="report-template" %}, with one job for each section, and Session 16 gave you the craft of each part. Today you plan what is left: what goes where, how many words each part can have, which figures and tables you need, and when to write the {% include term.html t="executive-summary" %}.

Planning first is not a delay. A report written without a plan grows where writing is easy, usually the description of what you did, and runs out of room where judgement is needed: the findings and the limitations.

### How it works

**What goes where.** Most of your report's material already exists in your folders. Put each piece in its place before you write a sentence:

| What you already have | Where it goes in the template |
|---|---|
| The Session 11 readiness files and your configuration log | Environment and method: the environment; the log in an appendix |
| Your collection log, the manifests, the custody record and the evidence register | Environment and method: collection and preservation; the records in an appendix |
| Your jq filter file, the helper's hash value and the commands you ran | Environment and method: analysis, so that a stranger could repeat it |
| The joined rows, the lonely rows with their reasons, and your timeline | Findings: the timeline and the correlation of the records |
| The identities, addresses and your network checks | Findings: attribution |
| Your answers to Session 13's six questions of limitation | Limitations |
| Your four-link chains | Response actions and recommendations |

**The word budget.** Your report has a length, given in the coursework documents on the LMS, and those documents say what counts towards it. A {% include term.html t="word-budget" %} shares that length between the sections before you write. It is a planning tool, not a rule: when one section needs more, you decide which other section pays for it, on purpose.

Three habits keep a budget honest. First, set the shares from what each section must show, not from what is easiest to write. Second, check the budget after each draft of a section, not at the end. Third, when you must cut, cut repetition and description, never evidence: a limitation or a named exhibit is the last thing to go.

{% include demo.html id="S18-D2" %}

**Figures and tables with their provenance.** Every figure and table needs a number, a caption that says what it shows, and its {% include term.html t="provenance" %}: the exhibit, the file, the tool and its version. Refer to each one in the text before it appears ("Table 2 shows ..."), so it is part of your argument, not decoration. A screenshot is evidence of what a tool showed at one moment: mask your account ID and access key IDs, never show a secret, and say that you masked them. Session 16's six habits are the full list.

**The executive summary, last.** Write it when the findings, limitations and recommendations are finished, and check each of its sentences against a finding. Leave space for it in the budget from the start: it is short, but it is not free.

<div class="box metaphor" markdown="1">

**The comparison.** A word budget is like a monthly household budget.

**Why it fits.** The income is fixed, like the report's length. The money is shared between rent, food and travel before the month begins, like words between sections. When one heading costs more, another must give, and a good budget shows that before the money is spent.

**Where it breaks.** Money is the same everywhere: a rupee saved on travel buys exactly a rupee of food. Words are not. A hundred words cut from the method may cost a stranger the ability to repeat a step, and that cost appears only when someone tries. And spending less than planned is not saving: a section well under its budget may simply be missing something the rubric asks for.

**So what.** Set the shares from what each section must show, revisit them after every draft, and when you cut, cut repetition, never evidence.

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A student's findings section has grown well past its share of the budget. Which change protects the report best?</p>
  <ul class="qc-opts">
    <li data-key="a">Move the full timeline to an appendix, keep the key events in the findings, and cut repeated description of the setup from the method</li>
    <li data-key="b">Delete the limitations section, because the findings are more important</li>
    <li data-key="c">Remove the exhibit references from each finding, because they use many words</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). It keeps every claim and its evidence and cuts only repetition, using the template's own option of a full timeline in an appendix. Deleting limitations (b) hides gaps and weakens every finding. Removing exhibit references (c) removes exactly what lets a reader check a claim.</p></div>

</div>

<div class="box key" markdown="1">

Plan before you write: put every piece of material in its section, share the length with a word budget you revisit after each draft, give every figure its provenance, and write the executive summary last.

</div>

## 3. Common pitfalls, from the coursework block's own lessons

### The idea

Sessions 11 to 13 each warned you about one trap. Collected in one place, those warnings are the pitfalls that most often weaken a cloud forensics report. Each one has the same shape: a claim that goes further than the evidence. And each has the same way out: go back to your own files and write what they show.

### How it works

Read the list with your evidence set and your draft open. For each pitfall, the middle column says how it usually shows in a draft, and the third column says what to do.

| # | The pitfall | How it shows in a draft | The way out, from your evidence | Taught in |
|---|---|---|---|---|
| 1 | Latency read as absence | "The access log has no line for the download, so it did not happen." | Say what had arrived by which collection, and what a later collection found. A missing line is a {% include term.html t="log-delivery-latency" %} question first, and access logs are on {% include term.html t="best-effort-delivery" %}. | Session 12, section 2 |
| 2 | A record asked for more than it can hold | "CloudTrail shows every request to the bucket." | State the {% include term.html t="record-coverage" %} of each record from your selectors and your join, and give each lonely row its reason. | Session 13, section 5 |
| 3 | Your own requests mixed with the incident's | A head request or a download by version ID appears in the incident's timeline. | Tag your requests from your collection log, check each by address and kind, and keep them in every file, labelled. | Session 12, section 3; Session 13, section 6 |
| 4 | A gap in the custody record | A file with no hash value on arrival, a step that is not in the collection log, or a working copy edited in place. | Show every item's hash value at arrival and at analysis, and the {% include term.html t="chain-of-custody" %} for each transfer. Where a step was not recorded, state it as a limitation; never fill it in afterwards. | Session 1, section 4; Session 12, section 4 |
| 5 | A time without its clock | "09:12" with no time standard, or two sources that differ by a fixed number of seconds with no explanation. | Give every time in UTC with the record that wrote it, and explain any constant difference as a clock difference. | Session 5, section 8; Session 13, section 8 |
| 6 | A limitation written as an excuse | "There was not enough time to wait for the logs." "AWS logs are unreliable." | Rewrite it in three parts: what you saw, its effect on a conclusion, and the evidence that shows it. | Session 13, section 9 |
| 7 | A recommendation with no evidence behind it | "Enable more logging." A tool's list of warnings pasted in. | Build each one as four links: the finding, the risk it shows, the change, and the evidence for both. | Session 13, section 9 |
| 8 | An identity or an address treated as a person | "The suspect deleted the file from her home." | Say which identity signed the request and which network the address belongs to, and what neither can show. | Session 7, section 8; Session 13, section 7 |

Pitfall 6 is the hardest to see in your own writing, because an excuse often sounds reasonable. Watch one being rebuilt.

{% include demo.html id="S18-D3" %}

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "I will leave the gap out so the timeline looks complete." | "I will state the gap, its reason and its effect." | A hidden gap weakens every finding once a reader finds it; a stated gap is part of the argument. |
| "A limitation makes my report look weak." | "A limitation shows how far my findings can be relied on." | Stating limits is a sign of method, and the template has a section for it. |
| "My own requests are not part of the incident, so I deleted them." | "My own requests are tagged and set aside, and still in every file." | Deleting rows destroys evidence and hides your method from a stranger. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A draft says: "The server access logs were incomplete, so the analysis may be wrong." Which pitfall is it, and what is the better version?</p>
  <ul class="qc-opts">
    <li data-key="a">Pitfall 2; delete the sentence, because the access logs are not the main record</li>
    <li data-key="b">Pitfall 7; turn it into a recommendation to use another logging service</li>
    <li data-key="c">Pitfall 6; state which requests had no access-log line by which collection, which conclusion therefore rests on CloudTrail alone, and the file that shows it</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The sentence is a limitation written as an excuse: no observation, no specific effect, no evidence. Deleting it (a) hides a real gap. A recommendation (b) can start from it only after it is written as a limitation with a finding behind it.</p></div>

</div>

<div class="box key" markdown="1">

Every pitfall is a claim that goes further than the evidence. The way out is always the same: go back to your own files and write what they show, including what they cannot show.

</div>

## 4. The viva: explaining your own work aloud

### The idea

After you submit, you explain your work in a short spoken examination: a {% include term.html t="viva" %}. Its purpose is simple. It confirms that the work is your own and that you understand it. The marker has read your report; the viva lets them hear you explain it.

Three facts about how the viva counts. It is **required**: the coursework is not complete without it. It carries **no marks of its own**. But it can **change the marks** you were given: where you cannot explain or justify part of your work, the marker adjusts the mark for the criterion that part serves, through the rubric, and records why. So the viva does not add to your work; it confirms it, criterion by criterion. The length of the viva and your slot are on the LMS.

What follows from that is the whole of your preparation: be ready to show that every part of your report is yours and understood.

### How it works

**The reproduce test.** For every step in your method, you should be able to say what you ran, why you ran it, what it showed, and where the evidence of it is. Go through your method section line by line, with your folders open, and test yourself on each:

- **Each command.** What does each part of it do? What would have happened without that part? Could you type it again now?
- **Each finding.** Which rows, files and values support it? Can you open them in a minute or two? Which limitation touches it?
- **Each choice.** Why this filter, this join, this way of setting your own requests aside? What else could you have done?
- **Each limitation.** What did you see, what does it change, and what would remove it?

A finding passes the test when you can walk back from the sentence in your report to the evidence on your disk, one step at a time, and say each step aloud. Watch that walk, and watch where it stops.

{% include demo.html id="S18-D4" %}

**How to answer.** Answer the question you were asked, briefly, then point to the evidence. If you do not know, say so, and say how you would find out: "I did not check that; I would compare the request IDs in the two files." That answer shows method. A confident guess shows the opposite, and a wrong guess about your own work costs more than an honest gap. If you realise during the viva that something in your report is wrong, say so and correct it: an analyst who finds their own error is doing the job.

**Practise aloud.** Reading your report silently is not preparation for speaking about it. Explain one finding to a classmate in three minutes, and let them ask "how do you know?" after every claim. Section 8 does this in the workshop.

### Your finding, aloud

<div class="box lens" markdown="1">

**Through another lens: the night before Challenger, spoken.** In Session 16 you met the space shuttle Challenger, which broke apart shortly after launch in January 1986, killing its crew of seven, because a seal failed in the cold. You met Edward Tufte's argument that the engineers' charts never made the danger legible. Today, look at the same night as a spoken argument.

On the evening before the launch, the engineers of the company that built the rocket boosters argued their case on a telephone conference with NASA. They recommended not launching until the seals were at least 53 degrees Fahrenheit, about 12 °C. They understood their finding: cold seals let hot gas past. But when NASA challenged it, their evidence did not hold up under the question: the damage on earlier flights did not line up clearly with temperature in what they had brought. After a break in the call, the company's managers reversed the recommendation. Their new position, as the record of the call puts it, was that the effect of temperature was inconclusive, and that the company therefore recommended launching.

The lesson for you is the first one: a finding is not yours until you can explain it aloud and tie it, step by step, to its evidence, under questions. The engineers held the right finding and could not carry it through "how do you know?".

**Where it breaks.** The sentence that won that night was the managers'. It was calm, fluent and short, and it was wrong: "inconclusive, therefore safe" treated a lack of proof of danger as proof of safety, the {% include term.html t="absence-of-evidence" %} mistake of Session 17. Fluency is not proof. A confident explanation of a wrong finding still fails, in a viva as anywhere else. And a viva is not that night: no one is deciding against you, and the examiner's questions are a chance to show the chain, not a trap. So explanation must stay tied to evidence, sentence by sentence.

**The question it raises.** For each finding in your report, could you carry it through three "how do you know?" questions in a row, and would each answer point at a file?

</div>

<div class="box key" markdown="1">

**The pivotal idea.** A finding no one understands is not a finding, including when the one who must understand it is you, in the viva. And understanding is shown by the path to the evidence, not by fluent words.

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "I will learn my report by heart." | "I will practise walking from each claim to its evidence." | The questions follow your answers, so a memorised text runs out at the first follow-up. |
| "If I sound confident, the viva will go well." | "If each answer points to evidence, the viva will go well." | Fluency is not proof; a confident wrong answer still fails. |
| "If I do not know, I should guess." | "If I do not know, I say so and say how I would find out." | An honest gap shows method; a wrong guess about your own work shows the opposite. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">In a viva, the examiner asks how a student knows that one download in her timeline was part of the incident and not her own collection. Which answer is strongest?</p>
  <ul class="qc-opts">
    <li data-key="a">"I am sure it was the incident, because I remember running part 2 of the incident from CloudShell."</li>
    <li data-key="b">"It falls outside both collection windows in my collection log, it came from the CloudShell address recorded in my part 2 log, and it is a whole-prefix download, a kind of request my collection never made; the rows are in my joined file."</li>
    <li data-key="c">"The timeline was produced by the helper tool, so it is correct."</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Each part points to a record: the windows, the address, the kind of request and the file. Memory (a) is not evidence a stranger can check, and a tool's output (c) is only as good as the method around it.</p></div>

</div>

<div class="box key" markdown="1">

Prepare for the viva by testing every step, command, finding and limitation in your report: can you say what it is, why it is there, and where its evidence is, aloud?

</div>

## 5. Academic integrity: your work, your evidence, your words

### The idea

{% include term.html t="academic-integrity" %} means two things for your coursework. The work is your own, and you show clearly where anything in it came from.

Your coursework makes the first part unusually concrete. Your environment, your bucket, your times, your request IDs and your addresses exist only in your account. A finding copied from someone else will not match your own records, and the viva asks you to walk from each claim to those records.

### How it works

**Your own work.** You build, collect, analyse and write yourself. You may discuss methods with classmates, as you have all module; you never share findings, rows, timelines, text or screenshots, and you never use someone else's environment or evidence.

**Honest use of sources.** Cite every outside source you rely on, in one {% include term.html t="citation-style" %}, as Session 16 showed: AWS's documentation, a standard, a tool with its version. Never present someone else's words or ideas as your own. When you quote, quote exactly and cite.

**Tools.** The LMS states the coursework's policy on the use of tools, including writing and AI tools: what is allowed, and how any use must be declared. Read it before you write. This page does not restate it, so that there is only one version of the rule.

**The viva confirms authorship.** It is one of the ways the module checks that the work is yours. That is not a reason to fear it: if you did the work, the viva is where you show it.

<div class="box lms" markdown="1">

The policy on the use of tools and the declaration you sign are in the coursework documents on the LMS. If anything in them is unclear for your situation, ask the lecturer through the LMS before you submit, not after.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">Two students discuss why their access logs arrived at different times, and then one sends the other her limitations paragraph "to show the wording". What is acceptable?</p>
  <ul class="qc-opts">
    <li data-key="a">Both: the evidence is similar, so sharing the paragraph is fine</li>
    <li data-key="b">Neither: students may not talk about the coursework at all</li>
    <li data-key="c">The discussion of the method is fine; sending the paragraph is not, because the text and the finding must be each student's own</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Talking about how best-effort delivery works is discussing a method. A paragraph of findings or limitations is the work itself, written from one student's evidence, so sharing it breaks integrity (a). Banning all discussion (b) is not the rule.</p></div>

</div>

<div class="box key" markdown="1">

Your evidence is unique to your account, so your findings and words must be too. Cite every outside source, follow the LMS policy on tools, and treat the viva as the place to show your work is yours.

</div>

## 6. After submission: keep, then tear down

### The idea

Your AWS environment is evidence until the coursework is completely finished. The viva may ask you to show it, and a resubmission would need it. So you keep it, unchanged, until the LMS shows that the coursework is closed, **including any resubmission**. Then you take it apart in a safe order and close or secure the account, so that nothing keeps running, costs money or stays open to misuse.

<div class="box safety" markdown="1">

**Do not start the teardown early.** Until the LMS shows that the coursework, including any resubmission, is closed, keep everything exactly as Session 11's rules said: never suspend versioning, delete versions, empty a bucket, delete the trail or stop logging. Every one of those steps destroys evidence and cannot be undone. Keep the budget alarm on, and keep checking the e-mail it would send.

</div>

### How it works

The order matters for one reason: each step should remove something only after nothing still writes to it or needs it. So the recorder stops first, then the buckets it wrote to are emptied, and the identity you work with goes last, when no step needs it any more.

1. **Check that it is time, and keep your own copy.** Confirm on the LMS that the coursework is closed. Check that your folders `~/nb6018-cw/` on Kali, with the sealed collections, the logs and your report, are kept where the LMS asks you to keep your work. Add a line to your configuration log: teardown started, with the time in UTC.

   <div class="box expect" markdown="1">

   Your sealed collections still match their manifests, as in Session 13's Part A, step 2, and a new line in your configuration log.

   </div>

2. **Stop the recorder: the trail.** In the console, signed in as `nb6018-analyst` with the Region Mumbai, open **CloudTrail**, then **Trails**, and choose `nb6018-trail`. Choose **Stop logging**, then **Delete**, and confirm. A trail is not removed when an account is closed, so it must be deleted by you.

   <div class="box expect" markdown="1">

   The trail list no longer shows `nb6018-trail`.

   </div>

3. **Stop the second record: server access logging.** In **S3**, open the case bucket, the **Properties** tab, **Server access logging**, **Edit**, then **Disable**, and save.

4. **Empty and delete the case bucket.** In the list of general purpose buckets, select the case bucket and choose **Empty**. Type what the page asks for to confirm, and choose **Empty**. AWS states that emptying a bucket with versioning enabled deletes every version of every object; the delete markers go too. Then select the bucket again, choose **Delete**, type its name, and confirm.

   <div class="box trouble" markdown="1">

   If deleting says the bucket is not empty, run **Empty** again: a log line or an object may have arrived after the first run. Do not use `aws s3 rm --recursive` on this bucket: on a versioned bucket it only adds delete markers and removes nothing.

   </div>

5. **Empty and delete the two log buckets.** First the access-log bucket, then the trail bucket, each with **Empty** and then **Delete**, as in step 4. Both are safe to remove now, because nothing writes to them any more.

6. **Clear CloudShell.** Open **CloudShell** in Mumbai, open its **Actions** menu, choose the option that deletes the home directory, and confirm. If you do nothing, AWS deletes a Region's CloudShell storage about 120 days after your last session there, but deleting it now leaves nothing behind.

7. **Remove the working identity.** On Kali, remove the access key from `~/.aws/credentials`. Then sign in to the console as the **root user**. In **IAM**, open `nb6018-analyst`, the **Security credentials** tab: **Deactivate** the access key, then **Delete** it. Then delete the user itself.

   <div class="box expect" markdown="1">

   IAM lists no users, and the root user still has its MFA device and no access keys.

   </div>

8. **Check the bill.** Open **Billing and Cost Management** and the current month's bill. Expect nothing to pay beyond the small charges the credits covered. Keep the budget alarm until the account is closed.

9. **Close the account, or secure it.** To close it, stay signed in as root, open the account menu at the top right, choose **Account**, then **Close account**, type the account ID and confirm. AWS keeps a closed account for a 90-day post-closure period, during which it can be reopened; keep your MFA device for that time. The e-mail address cannot be used for a new AWS account afterwards. If you choose to keep the account, leave it with root MFA, no IAM users and no access keys.

<details class="deeper" markdown="1">
<summary>Why this order, and what AWS's documents say</summary>

**Recorder first.** CloudTrail writes into the trail bucket, and S3 writes access-log lines into the access-log bucket. If you emptied those buckets first, new files would arrive while you worked, and the delete would fail. AWS's guide to emptying a bucket says the same about trails that write into a bucket being emptied: stop them first.

**Versions.** In a versioned bucket, every object has every version you uploaded, and a delete only added a delete marker. The bucket can be deleted only when all versions and all delete markers are gone. The console's Empty does that; the plain `aws s3 rm` does not.

**Identity last.** You use `nb6018-analyst` for the steps before step 7, so it goes only when nothing needs it. Deleting the root user's own access is never a step: the root user is how you close the account.

**Closing.** You can close a standalone account only as the root user, and only in the console. You remain responsible for any charges for use before closure. After the post-closure period AWS deletes the account's remaining content, except CloudTrail trails, which is why step 2 deletes the trail by hand. Console names change from time to time; the names here were checked when this page was written.
</details>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">Why is the trail deleted before the trail bucket is emptied?</p>
  <ul class="qc-opts">
    <li data-key="a">Because the trail keeps writing log files into that bucket, so emptying it first would leave new files arriving and the bucket could not be deleted</li>
    <li data-key="b">Because AWS charges more for an empty bucket</li>
    <li data-key="c">Because the trail holds the only copy of the evidence</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The order stops each writer before emptying what it writes to. Empty buckets cost nothing (b). By the time of the teardown, your evidence copies are on Kali, sealed (c).</p></div>

</div>

<div class="box key" markdown="1">

Keep everything until the LMS shows the coursework closed, including any resubmission. Then stop each writer before emptying what it writes to, remove the identity last, and close or secure the account.

</div>

## 7. The exam-preparation hour: technique and a revision map

### The idea

The hour after this session belongs to the phase test. It opens with a mock paper, shorter than the real one, issued through the LMS. The rest of the hour is technique and review. This section gives the technique and a map for revision. It gives no practice questions: the module's practice items are already on its pages, and the map points to them.

<div class="box lms" markdown="1">

The mock paper, its instructions, the format of the phase test and its date are on the LMS. The model answers for the mock are released there after it is sat.

</div>

### How it works

**Short answers.** A short answer is about two sentences. It is marked on the points it makes, not on its length, and each {% include term.html t="mark-point" %} earns one whole mark: there are no half marks. So a three-mark question asks for about three distinct ideas, stated clearly. Four habits help:

1. **Read the {% include term.html t="command-word" %} first.** It tells you what kind of answer earns the marks.
2. **Count the demands.** Many questions ask two things: "explain how ... and what ...". An answer to only one demand cannot earn every mark.
3. **Plan the points before you write.** Note them in a few words, then write them as sentences.
4. **Use the module's terms exactly.** One term, one meaning: "unallocated space", not "empty space".

| Command word | What earns the marks |
|---|---|
| State, Name, Give | The fact or term itself, correctly; no reason is needed |
| Identify | Pick out the right item from the situation given, and name it |
| Describe | What it is or what happens, in order, without reasons |
| Explain | What happens **and why**: the reason or the mechanism, not only the fact |
| Compare | Points of difference, and of likeness where they matter, on both sides |
| Justify | A choice, with the reasons and evidence that support it over the alternatives |

Watch an answer to a published question from Session 2's quiz earn its marks one point at a time.

{% include demo.html id="S18-D5" %}

**Multiple-choice items, where a paper has them.** Your phase test's format is on the LMS. If it includes multiple-choice items: read the whole question and decide your answer before you read the options; then find the option that matches; rule out the others one by one, saying why each is wrong. Read words such as "always", "never" and "only" with care, because they are often what makes an option wrong. Choose one option for each item. The quick checks on every page of this portal are practice in exactly this form.

**Revising by retrieval.** The strongest revision is to answer before you look. Close the notes, answer a quick check or a "Check yourself" question, then open the model answer and mark yourself on its points. Return to the ones you missed a few days later. Rereading feels productive; answering is what you will do in the test.

**The revision map.** The phase test's stated domains are four. Each row below gives the sessions that teach them, with links to their practice items: the quick checks inside each section, "Check yourself" at the end, and the end-of-day quizzes.

| Domain | Sessions, with their practice |
|---|---|
| Data recovery and data protection | Session 1 ([check yourself](../s01/#check-yourself)); Session 2 ([check yourself](../s02/#check-yourself), [quiz](../s02/#end-of-day-quiz)); Session 3 ([check yourself](../s03/#check-yourself)); Session 4 ([check yourself](../s04/#check-yourself), [quiz](../s04/#end-of-day-quiz)); Session 12, section 7 ([check yourself](../s12/#check-yourself), [quiz](../s12/#end-of-day-quiz)); Session 16 ([check yourself](../s16/#check-yourself), [quiz](../s16/#end-of-day-quiz)) |
| Network and malware analysis | Session 7 ([check yourself](../s07/#check-yourself)); Session 8 ([check yourself](../s08/#check-yourself), [quiz](../s08/#end-of-day-quiz)); Session 9 ([check yourself](../s09/#check-yourself)); Session 14 ([check yourself](../s14/#check-yourself), [quiz](../s14/#end-of-day-quiz)) |
| Mobile file systems and artefacts | Session 15 ([check yourself](../s15/#check-yourself)); Session 16 ([check yourself](../s16/#check-yourself), [quiz](../s16/#end-of-day-quiz)) |
| Forensic methodology | Session 1 ([check yourself](../s01/#check-yourself)); Session 5 ([check yourself](../s05/#check-yourself)); Session 6 ([check yourself](../s06/#check-yourself), [quiz](../s06/#end-of-day-quiz)); Session 14, section 8 ([check yourself](../s14/#check-yourself)); Session 17 ([check yourself](../s17/#check-yourself)) |

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "A longer answer gets more marks." | "Each distinct point earns a mark." | Short answers are marked on points made, not length. |
| "I answered the question, so I get full marks." | "I answered every demand, with the reason where the command word asks for one." | "Explain" needs the why; a two-part question needs both parts. |
| "I have read all my notes twice." | "I have answered every check without looking, and redone the ones I missed." | Answering is what the test asks for, and it shows what you do not yet know. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A question says: "Explain why a second collection of the server access logs can hold more lines than the first." An answer says: "The second collection holds more lines. It was made later." How many of three marks is it likely to earn, and why?</p>
  <ul class="qc-opts">
    <li data-key="a">Three, because it answers the question directly</li>
    <li data-key="b">None or one, because it mostly repeats the question and gives no mechanism, and "explain" asks why</li>
    <li data-key="c">Two, because it has two sentences</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). "Later" points at the answer but never says why time matters. An "explain" answer earns marks for the mechanism: the logs are delivered on a best-effort basis, so lines arrive hours after their requests, and some may arrive only after the first collection. Two sentences (c) earn nothing on their own.</p></div>

</div>

<div class="box key" markdown="1">

Read the command word, count the demands, plan one point for each mark, and revise by answering before you look.

</div>

## 8. The workshop: check, write, review, rehearse

Your task in one line: in three hours, check your evidence and draft against the rubric and the pitfalls, write, give and receive one peer review, rehearse the viva for one finding, and record your progress on the form.

You need your Kali VM with your folders `~/nb6018-cw/s11/` to `~/nb6018-cw/s13/`, your draft in the report template, and from the LMS the brief, its summary rubric and today's three forms. The Windows VM and REMnux stay off. You make no request to AWS today.

<div class="box safety" markdown="1">

**Four rules for today.**

1. **Your evidence stays sealed.** Read from your working copies only, as in Session 13.
2. **No requests to AWS.** The environment stays exactly as it is until the coursework closes.
3. **Nothing of yours leaves with someone else.** In the peer review, your partner reads and returns; no copies, photos or files change hands.
4. **Your words stay yours.** Feedback describes and asks; it never supplies sentences.

</div>

| Time | Part | What you do | What you record |
|---|---|---|---|
| 0:00 to 0:15 | A | Rubric walkthrough, with the lecturer | Progress form, part A: the criteria as questions |
| 0:15 to 0:45 | B | Self-check against the pitfalls | Progress form, part B |
| 0:45 to 1:45 | C | Supported writing time, with a short break | Your draft |
| 1:45 to 2:15 | D | Peer review of one section | Peer-review form |
| 2:15 to 2:45 | E | Viva rehearsal in pairs | Viva-rehearsal form |
| 2:45 to 3:00 | F | Record your progress and plan the time left | Progress form, part C |

### Part A: the rubric walkthrough (15 minutes)

1. **Open the summary rubric on the LMS beside this page.** The lecturer walks through it criterion by criterion. For each criterion, write it on the progress form as a question, in the rubric's own words, as section 1 showed.

   <div class="box expect" markdown="1">

   One question on the form for every criterion in the summary rubric, and any word you are unsure of marked for the lecturer.

   </div>

   <div class="box trouble" markdown="1">

   If a criterion's meaning is unclear, ask now, in the room. Never decide what it means from its title alone.

   </div>

### Part B: the self-check (30 minutes)

{: start="2"}
2. **Check that your evidence is still sealed.** Run Session 13's manifest check (Part A, step 2) over every collection.

   <div class="box expect" markdown="1">

   One `every file matches` line for each collection.

   </div>

   <div class="box trouble" markdown="1">

   If a file fails, stop and tell the lecturer. Do not repair it.

   </div>

3. **Go through the eight pitfalls of section 3 against your timeline and draft.** For each one, write on the progress form: "clear", with where you checked, or "found", with where and what you will change.

   <div class="box expect" markdown="1">

   Eight lines on the form, each with a place in your own files or draft.

   </div>

   <div class="box trouble" markdown="1">

   If you cannot tell whether a pitfall applies, that is itself a finding for the form: write the question, and ask during Part C.

   </div>

4. **Map your findings to the criteria.** List your findings on the form, with the criteria each serves, and mark any criterion with nothing beside it.

### Part C: supported writing time (60 minutes)

{: start="5"}
5. **Work on the section your map and self-check show is weakest.** Use the word budget of section 2, and check every sentence you write against the pitfalls. The lecturer moves round the room: bring a specific question, with the file or paragraph open.

   <div class="box expect" markdown="1">

   At least one section improved, and the progress form updated for it.

   </div>

### Part D: the peer review (30 minutes)

{% include term.html t="peer-review" %} works only when both readers know what they are looking for, how to say it, and what not to share. Pair with someone the lecturer names, and use the peer-review form.

{: start="6"}
6. **Choose and swap (5 minutes).** Each author chooses one section of their draft, ideally limitations or one finding, and shows it on their own screen or on paper. The reader reads it there. Nothing is sent, copied or photographed.

7. **Read with the rubric beside you (15 minutes).** The reader asks five questions of the section, and notes the answers on the form:

   | Question | Look for |
   |---|---|
   | Can I go from each claim to its evidence? | An exhibit, file, row or value named in the sentence |
   | Does every time say which clock it came from? | UTC, and the record that wrote it |
   | Is each limitation in three parts? | What was seen, its effect, its evidence |
   | Is each recommendation tied to a finding? | All four links |
   | Does any pitfall from section 3 appear? | The number of the pitfall and the sentence |

8. **Say it well (10 minutes).** The reader gives one strength and two changes, each in the same order: what you observed, a question, a suggestion. For example: "In the second paragraph I could not find the file for the deletion. Which file shows it? You could name it in the sentence." Talk about the text, not the person, and never write the author's sentences for them. The author listens, asks, and notes what they will change.

   <div class="box expect" markdown="1">

   A peer-review form with one strength and two changes for each of you, in your own words.

   </div>

   <div class="box trouble" markdown="1">

   **What you never share.** Your findings, rows, times, request IDs, addresses, timelines, screenshots or text. Do not compare values with your partner: each environment's evidence is its own, so different values are expected and say nothing about who is right. If your partner offers you their wording, decline it.

   </div>

### Part E: the viva rehearsal (30 minutes)

{: start="9"}
9. **Explain one finding in three minutes.** Each of you chooses one finding from your own report. Explain it to your partner as you would in the viva: the claim, the evidence, and its limitation.

10. **Answer "how do you know?".** After each claim, your partner asks "how do you know?" until you reach a file on your disk, or until you cannot go further. Then swap.

    <div class="box expect" markdown="1">

    On the viva-rehearsal form: the finding, each step you walked through, and the first step where you hesitated or could not point to a file.

    </div>

    <div class="box trouble" markdown="1">

    If the chain stops, that is the most useful result of the session. The place where it stopped is what you prepare next: the file to find, the command to understand, or the limitation to state.

    </div>

### Part F: record and plan (15 minutes)

{: start="11"}
11. **Complete the progress form.** Record the band you now fully meet for each criterion with its evidence, the peer feedback you received and what you will change, and the step where your viva chain stopped. End with your plan for the time left before submission, in order.

**The checkpoint and how it is judged.** This is a formative checkpoint. It is complete when every part of your progress form has an entry that points to a place in your own files or draft, the peer-review form is filled for the section you shared, and the viva-rehearsal form names the step where your chain stopped, or says that it reached a file. Keep the three forms with your coursework notes: they are your plan, and they are not handed in.

**If you have time.** Rehearse a second finding, ideally one that rests on a limitation. Or draft your executive summary now and test each of its sentences against a finding, then put it away: you will write the final one last.

## If you missed Session 18

1. **Read sections 1 to 7 and run the five demos.** Allow about an hour and a half.
2. **Download the three forms from the LMS** and do Parts A, B and F on your own, with the summary rubric beside you.
3. **Arrange a peer review and a viva rehearsal** with a classmate, following Parts D and E exactly, including what you never share.
4. **If you are blocked**, write to the lecturer through the LMS with the criterion or pitfall you are unsure of, never with your findings or text attached unless you are asked.

## Check yourself

**1. Explain how you would use a rubric's band descriptors to self-assess one criterion of your own report.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Read the descriptors from the lowest band upwards and choose the band whose descriptor your draft fully meets, pointing to the paragraph or table that shows each element. Then write the element of the next band that your draft does not yet show, as the change to make. The points that earn marks: (1) choose the band fully met, not nearly met; (2) evidence from the draft for that choice; (3) the specific change that would move it up.
</details>

**2. A draft's limitations section says: "There was not enough time to collect the logs properly." Rewrite the idea as a limitation by the method, and explain what changed.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
"The last collection was made a few hours after the incident, and the server access logs held no line for one of the downloads by then; that download therefore rests on CloudTrail alone, as the CloudTrail-only list and the collection time show." The excuse became an observation with its time, a specific effect on one conclusion, and the evidence that shows it. The points that earn marks: (1) what was seen, with when; (2) its effect on a conclusion; (3) the evidence named.
</details>

**3. Explain what the viva is for and how it can affect the coursework mark.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The viva confirms that the work is the student's own and that they understand it. It carries no marks of its own, but where a student cannot explain or justify part of the work, the marker adjusts the mark of the criterion that part serves, through the rubric, and records why. The points that earn marks: (1) authorship and understanding; (2) no marks of its own; (3) criterion marks can change through the rubric.
</details>

**4. Give two things a reader in a peer review must never take or share, and explain why.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The reader must never copy the author's text or findings, and must not compare values such as times, request IDs or addresses from their own evidence. Each environment's evidence is unique and the report must be each student's own work, so copying breaks academic integrity and comparing values says nothing about who is right. The points that earn marks: (1) one correct item; (2) a second correct item; (3) the reason: unique evidence and own work.
</details>

**5. Explain why the CloudTrail trail is deleted before the trail bucket is emptied when you tear down your environment, and when the teardown may start.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The trail keeps writing log files into its bucket, so it must stop first, or new files would arrive while the bucket is emptied and it could not be deleted. The teardown may start only when the LMS shows that the coursework, including any resubmission, is closed, because until then the environment is evidence. The points that earn marks: (1) the trail writes into the bucket; (2) stop the writer before emptying; (3) only after the coursework, including any resubmission, is closed.
</details>

## Coming next

This is the last session of the module. Day 9 closes with the exam-preparation hour: the mock phase test, issued through the LMS, then technique and review. After that come your submission, your viva and the phase test, each on the date the LMS gives. You have the whole method; what remains is to show it, on the page and aloud.
