---
session_code: S01
description: "How to copy digital evidence so that anyone can check it: forensic images, hash values, chain of custody, and the NIST lifecycles that organise an investigation and an incident response."
hook: >-
  Before the unit accepts the client's case, every analyst must pass one check.
  Can you copy a piece of evidence, and then show a stranger that your copy is exact and has never changed?
outcomes:
  - "Explain what makes digital evidence forensically sound"
  - "Create a forensic image of a small evidence volume and verify it with hash values"
  - "Keep a custody record with no gaps, and judge what a gap would cost"
  - "Identify the four stages of NIST SP 800-86 and place a case activity in the right stage"
  - "Compare the four phases of NIST SP 800-61 Rev 2 with the six CSF 2.0 Functions used by Rev 3"
  - "Compare incident response with disaster recovery, and explain how post-incident activity builds forensic readiness"
before:
  - "Start your three virtual machines and run the verify script ([Session 0](../s00/))"
demos:
  - id: S01-D1
    title: "A file copy and a forensic image of the same card"
    file: s01-d1-copy-vs-image.html
    teaches: "A file copy takes only what the file system lists; a forensic image takes every sector."
  - id: S01-D2
    title: "One bit changes the whole hash value"
    file: s01-d2-one-bit-hash.html
    teaches: "Flipping a single bit gives a completely different SHA-256 value, while the size and the name stay the same."
  - id: S01-D3
    title: "A gap in the custody record"
    file: s01-d3-custody-break.html
    teaches: "A gap at one handover puts every later finding in doubt, while the earlier ones still stand."
  - id: S01-D4
    title: "Four phases become six Functions"
    file: s01-d4-phases-to-functions.html
    teaches: "The same response activities regroup from Rev 2's phases into Rev 3's Functions, and learning loops back into preparation."
slides: s01-forensic-readiness.pptx
evidence: "the lab share, folder `S01` (the lab steps say exactly which file)"
---

This session is the unit's proficiency check. The case itself starts in Session 2. Today you prove that you can handle evidence, and you learn the map that the whole investigation follows. You can read [the case](../../case/) first if you have not met it yet.

The evidence in this module comes from documented public training collections. Today's item is a small memory-card image from the Digital Corpora collection. The methods are real, and you should treat the item as if a court will see your work.

## 1. Forensically sound: evidence that a stranger can check

### The idea

The proficiency check comes with a short practice story. A manager at a company found a memory card in an employee's desk. She was curious, so she put it in her own laptop and opened a few photos. Then she gave it to the unit.

Nothing looks wrong. The photos are still there. But the laptop has written to the card. Some "last opened" times now show her visit, not the employee's. A lawyer for the employee will ask a simple question: what else changed?

{% include term.html t="digital-evidence" text="Digital evidence" %} is easy to change and the change is often invisible. So the unit does not ask you to be careful. It asks you to work in a way that another person can check. That is what {% include term.html t="forensically-sound" %} means.

### How it works

Sound handling rests on four habits. Each one answers a question that a stranger could ask you later.

| The habit | The question it answers |
|---|---|
| Do not change the original. | "Is this what was collected?" |
| Copy everything, then work only on the copy. | "Did you miss anything, or damage anything?" |
| Record every action when you do it: who, what, when, with which tool. | "How do we know what you did?" |
| Use methods that another examiner can repeat. | "Would I get the same result?" |

The rest of this session gives you one tool for each habit. A {% include term.html t="forensic-image" %} is the complete copy. A {% include term.html t="hash-value" %} shows that nothing changed. A {% include term.html t="custody-record" %} holds the history. A published method, NIST SP 800-86, makes the work repeatable.

This is also what separates {% include term.html t="digital-forensics" %} from ordinary data recovery. A technician who gets the files back has succeeded. An examiner has succeeded only when someone else can trust how the files were got back.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">Two analysts find the same deleted spreadsheet. Whose finding can another examiner check?</p>
  <ul class="qc-opts">
    <li data-key="a">The analyst with more years of experience</li>
    <li data-key="b">The analyst whose notes give the tool, its version, the settings and each step</li>
    <li data-key="c">The analyst who found the file faster</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A finding can be checked when another person can repeat the steps and compare the result. Experience and speed are useful, but neither one lets a stranger test the work.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Where these habits are written down</summary>

The four habits are not our invention. In the United Kingdom, the ACPO *Good Practice Guide for Digital Evidence* states four principles. No action should change data that may be relied on in court. A person who must access original data must be competent to do so and able to explain the consequences. An audit trail must exist, so that an independent third party could repeat the process and reach the same result. The person in charge of the investigation is responsible for seeing that this happens.

The international standard ISO/IEC 27037 covers the same ground for the identification, collection, acquisition and preservation of digital evidence. Different countries use different documents, but the four habits appear in all of them.

Sometimes the original must change. A running computer changes every second, and capturing its memory changes it a little more. In that case the examiner makes the smallest possible change, and records exactly what was done and why. You will do this in Session 6.
</details>

<div class="box key" markdown="1">

Forensically sound does not mean "handled carefully". It means "handled so that someone else can check it".

</div>

## 2. The forensic image: copy everything, then work on the copy

### The idea

The memory card in the story holds photos. You could select the photo files and copy them to your computer. You would get the photos.

You would also leave evidence behind. The card has space that no current file uses. That space can hold older data. The card also has its own records of names, dates and positions. A normal copy takes none of this.

A forensic image is different. It does not ask the card what files it has. It reads the card from the first block to the last and copies every one. Making this copy is called {% include term.html t="acquisition" %}.

### How it works

A storage device is a long row of numbered blocks called sectors. The file system is the index that says which sectors belong to which file. A file copy follows the index. An image ignores the index and takes the whole row.

{% include demo.html id="S01-D1" %}

Three things follow from this.

**An image is as large as the device, not as large as the files.** A 32 GB card with 2 GB of photos gives a 32 GB raw image.

**An image holds what the index no longer lists.** In Session 2 you will see why this matters so much. For today, remember only that the unlisted space is copied too.

**An image is a file, so you can copy it again.** The unit keeps the first image safe and makes a {% include term.html t="working-copy" %} for the examination. If a tool damages the working copy, you make a new one. The original item is touched once, and the first image is opened as rarely as possible.

In a lab with physical drives, the examiner connects the drive through a {% include term.html t="write-blocker" %}. This module uses no physical drives. Your evidence arrives as image files, so you protect it in another way: you keep the received file read-only, you work on a copy, and you check hash values.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "I copied the drive." | "I imaged the drive." | In this module a *copy* means files, and an *image* means every sector. |
| "The image is a picture." | "The image is a forensic image." | The word has nothing to do with photographs. It is an exact copy of a device. |
| "A backup is the same thing." | "A backup saves chosen files." | A backup is made to restore work. It skips unused space and it may change dates. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">The unit receives a 32 GB memory card that holds only 2 GB of photos. How large is a raw forensic image of the card?</p>
  <ul class="qc-opts">
    <li data-key="a">About 2 GB, the size of the photos</li>
    <li data-key="b">About 32 GB, the size of the card</li>
    <li data-key="c">It depends on how many photos were deleted</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A raw image copies every sector, used or not. The number of files, present or deleted, does not change the size of the device.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Image formats: raw and E01</summary>

A **raw** image is only the sectors, one after another, with nothing added. Tools give it names ending in `.dd`, `.raw` or `.001`. Every forensic tool can read it. It is as large as the device.

An **E01** image, also called the Expert Witness Format, puts the same sectors inside a container. The container can compress the data, and it stores notes about the case, the examiner and the hash value recorded at acquisition. Today's evidence arrives as an E01 file.

This causes one common confusion. The hash value stored inside an E01 file is the hash of the *sectors*. If you calculate a hash of the E01 *file* itself, you get a different value, because the file also contains the notes and the compression. Both values are correct. They describe different things. You will meet this in the lab.

Other formats exist, such as AFF4. The idea is the same: the sectors, plus information about them.
</details>

<div class="box key" markdown="1">

A file copy follows the index. A forensic image takes every sector, so nothing is left behind.

</div>

## 3. The hash value: showing that nothing changed

### The idea

You now have an image that is millions of bytes long. Next week someone asks: is that still the same image? You cannot compare millions of bytes by eye.

A hash value solves this. It is a short code calculated from the data. Here is the SHA-256 hash value of the three letters `abc`:

```
ba7816bf8f01cfea414140de5dae2223
b00361a396177a9cb410ff61f20015ad
```

The value is one string of 64 characters. It is shown on two lines here only to fit a small screen.

If you calculate it again tomorrow, on any computer, with any correct tool, you get the same 64 characters. If one bit of the data changes, you get 64 completely different characters.

### How it works

A {% include term.html t="hash-algorithm" %} reads the data from start to end and mixes every bit into the result. Three properties make the result useful as a check.

- **Same data, same value.** Always, on every machine.
- **Any change, different value.** A small change does not give a small difference. About half of the output bits flip.
- **One direction.** You cannot rebuild the data from the value.

Try it. Change one bit and watch the value. Notice also what does *not* change.

{% include demo.html id="S01-D2" %}

The hash is calculated from the content only. The file name, the folder and the dates of the file are not part of the content, so changing them does not change the hash. This is useful: a suspect can rename `plan.docx` to `holiday.jpg`, and the hash still matches the client's original.

The size of a file is a much weaker check. In the demo the size stayed the same while the content changed. A matching size tells you almost nothing.

The unit uses hash values in a fixed routine, called {% include term.html t="verification" %}:

1. Calculate the hash value when the evidence is acquired, and write it in the {% include term.html t="evidence-register" %}.
2. Calculate it again after every copy and before every examination.
3. Compare. If the values match, the data is bit-for-bit the same. If they differ, stop and report it.

<div class="box metaphor" markdown="1">

**The comparison.** A hash value is like a tamper-evident seal on an evidence bag.

**Why it fits.** The seal goes on when the bag is closed, as the hash value is taken when the image is made. Anyone can inspect the seal later, as anyone can calculate the hash again. A broken seal tells you that something happened, but not what. A different hash value does the same.

**Where it breaks.** A seal resists opening. A hash value protects nothing: it only detects. A seal is also hard to replace. A hash value is easy to replace, because a person who changes the data can calculate a new value in a second. And one seal belongs to one bag, but every exact copy of an image has the same hash value.

**So what.** A hash value is only worth something if the first value was written down where nobody can quietly change it. That place is the custody record and the evidence register. The hash and the record need each other.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An analyst renames <code>card.dd</code> to <code>exhibit-07.dd</code> and moves it to another folder. What happens to its SHA-256 hash value?</p>
  <ul class="qc-opts">
    <li data-key="a">It changes completely, because the file has changed</li>
    <li data-key="b">It stays the same, because the content has not changed</li>
    <li data-key="c">Only the last few characters change</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The hash is calculated from the bytes inside the file. The name and the folder are kept by the file system, outside the content. Option (c) is never true: a hash value either matches fully or differs everywhere.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>MD5, SHA-1 and SHA-256, and what a match really proves</summary>

| Algorithm | Length of the value | Status |
|---|---|---|
| MD5 | 32 hexadecimal characters (128 bits) | Old. Two different files with the same value can be built on purpose. |
| SHA-1 | 40 characters (160 bits) | Old. The same weakness has been shown in practice. |
| SHA-256 | 64 characters (256 bits) | Current. Use this when you have a choice. |

Two different inputs with the same hash value are called a collision. For MD5 and SHA-1, researchers can construct collisions deliberately. This does not mean that an image can change by accident and keep its MD5 value. It means that MD5 alone is weak against a person who prepares two files in advance. Many forensic tools still report MD5 and SHA-1 together. FTK Imager does this. Recording both, or adding SHA-256, removes the practical concern.

Be exact about what a match proves. A match proves that the data now is identical to the data that was hashed then. It does not prove where the data came from, who handled it, or that it was true in the first place. An exact copy of a forged document has a perfect hash match.
</details>

<div class="box key" markdown="1">

A matching hash value shows that the content is unchanged since the value was recorded. It says nothing about the name, the source or the handler.

</div>

## 4. Chain of custody: the record that holds the evidence together

### The idea

The hash shows that the image did not change. It cannot show who had the image, or where it was kept, or why someone opened it. A different tool answers those questions.

The {% include term.html t="chain-of-custody" %} is the full history of an item of evidence: who held it, when, where and for what purpose, from the moment it was collected to the moment a court sees it. The history is kept in a {% include term.html t="custody-record" %}. Every time the item changes hands, or is opened, or is put into storage, the people involved write a new entry at that moment.

### How it works

A custody record is a simple table. What makes it strong is discipline, not design.

| Entry | Released by | Received by | Purpose | Where kept | Hash checked |
|---|---|---|---|---|---|
| 1 | Company manager | Analyst A | Card collected from the employee's desk | Sealed bag 014 | Not yet imaged |
| 2 | Analyst A | Analyst A | Imaged with FTK Imager | Evidence locker 2 | Recorded in the register |
| 3 | Analyst A | Analyst B | Working copy for examination | Lab workstation 3 | Matches the register |

A real record also carries the date and time of each entry and a signature. Each entry is written when the action happens, not at the end of the day from memory.

Now remove one entry and see what happens to the findings that depend on it.

{% include demo.html id="S01-D3" %}

<div class="box lens" markdown="1">

**Memento.** In this film, a man called Leonard cannot form new memories. He is trying to solve a crime, so he keeps an outside record: photographs with a line of handwriting, and facts tattooed on his skin. Each morning he trusts the record completely, because he has nothing else.

The film shows the weakness. A note is only as honest as the moment and the hand that wrote it. One note written later, or written in anger, sends him after the wrong man, and he has no way to notice.

An investigation is in Leonard's position. Months later, nobody remembers who carried the card on a Tuesday afternoon. Only the record remains. Ask what Leonard's notes would need before you could trust them: the time of writing, the writer, and proof that nothing was changed afterwards. Those are the columns of a custody record.

</div>

<div class="box key" markdown="1">

An evidence chain is only as strong as its weakest link; one break can void everything after it.

</div>

That sentence is itself a comparison, so test it like one.

<div class="box metaphor" markdown="1">

**The comparison.** Custody is a chain, and a gap is a broken link.

**Why it fits.** Each entry connects the one before it to the one after it. The load, which is the trust of the court, passes through every link. One weak link is enough, however strong the others are.

**Where it breaks.** A broken metal chain fails at once, and everyone sees it. A custody gap is silent. Nobody notices until an opponent reads the record. A metal chain is also broken or whole. A custody gap is a matter of degree. It does not prove that anyone changed the evidence. It removes your ability to show that nobody did, and the court then decides how much weight the evidence keeps.

**So what.** You cannot repair a gap afterwards. An entry written later is exactly what the record exists to prevent. The only protection is to write each entry when the action happens.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">When should a custody entry be written?</p>
  <ul class="qc-opts">
    <li data-key="a">At the end of each day, from the analyst's notes</li>
    <li data-key="b">At the moment of each handover or action, by the people involved</li>
    <li data-key="c">Only when the item leaves the building</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). An entry made at the moment needs no memory. Option (a) is Leonard's mistake: a note written later depends on what the writer remembers or wants. Option (c) leaves every movement inside the building unrecorded.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Custody for a file that can be copied perfectly</summary>

Custody rules were written for physical objects. One knife exists, in one bag, in one locker. A forensic image breaks that picture, because ten identical copies can exist at once.

Units handle this in two ways together. The record follows each *container*: the original item, the first image and each working copy get their own identifier and their own entries. The hash value ties the containers together: every copy must match the value in the register.

So the two tools cover each other's weak side. The hash shows *what* the data is, but not who held it. The record shows *who* held it, but cannot show that the content stayed the same. An examiner needs both, every time.
</details>

## 5. The four stages of a forensic investigation

### The idea

Here are four things that analysts in the unit will do in this case:

- image the suspect's computer;
- run a tool that lists every document opened in the suspect's last week;
- decide that the suspect copied confidential documents to a USB drive;
- write this for the client's lawyer.

These are four different kinds of work. They need different skills and they produce different things. NIST Special Publication 800-86 gives them names: {% include term.html t="collection" %}, {% include term.html t="examination" %}, {% include term.html t="analysis" %} and {% include term.html t="reporting" %}.

### How it works

Each stage takes what the stage before it produced and turns it into something more useful.

| Stage | What you do | What goes in | What comes out |
|---|---|---|---|
| 1. Collection | Find, label and acquire the data. Keep it unchanged. Start the custody record. | Devices and accounts | Data: verified images |
| 2. Examination | Process the data with tools. Pull out what matters to the case. | Images | Extracted items: files, records, log lines |
| 3. Analysis | Study the extracted items. Connect them. Answer the questions of the case. | Extracted items | Findings and conclusions |
| 4. Reporting | Present the findings, the methods and their limits. | Findings | A report that a reader can act on |

The stages run in this order, because each one needs the output of the one before. But an investigation often goes back. Analysis may show that a second device exists, and then collection starts again for that device.

The hardest line to see is between stage 2 and stage 3. Examination ends with *things*: "these 14 documents were opened from a USB drive". Analysis ends with *meaning*: "the suspect copied confidential documents to a drive that he took away". A tool can do most of an examination. Only a person can do the analysis.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "I analysed the image with Autopsy." | "I examined the image with Autopsy, then analysed the results." | The tool extracts. You interpret. |
| "Collection is just copying." | "Collection includes labelling, hashing and starting custody." | A copy without these cannot be used as evidence. |
| "The report comes at the end, so it can wait." | "Notes for the report start at collection." | You cannot report a step that you did not record. |

</div>

### How this case will run

The module follows the same four stages, several times, on different kinds of evidence.

| Stage | Where you practise it |
|---|---|
| Collection | Today (imaging), Session 6 (memory), Session 12 (cloud) |
| Examination | Sessions 2 to 4 (disk), Session 7 (network), Session 9 (suspicious program), Session 15 (phone) |
| Analysis | Session 5 (timeline), Session 8 (linking sources), Session 13 (cloud timeline), Session 17 (whole case) |
| Reporting | Sessions 13 and 16 (report writing), Session 18 (coursework) |

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An analyst runs a tool over the image. It lists every photo and keeps only those taken in the suspect's last week at work. Which stage is this?</p>
  <ul class="qc-opts">
    <li data-key="a">Collection</li>
    <li data-key="b">Examination</li>
    <li data-key="c">Analysis</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The analyst is pulling the relevant items out of the collected data. Analysis starts with the next question: what do these photos show about what the suspect did?</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The standard behind it</summary>

NIST SP 800-86 is the *Guide to Integrating Forensic Techniques into Incident Response*. It describes the process as a change in the material itself: media become data, data become information, and information becomes evidence. Collection turns media into data. Examination turns data into information. Analysis turns information into evidence. Reporting presents it.

The guide also asks the report to include more than findings. It should describe the actions taken, explain how tools and procedures were chosen, state what else needs to be done, and recommend improvements. That last part connects forensics to incident response, which is the next section.

Other process models exist, with more stages or other names. They all separate the same four kinds of work.

Reference: Kent, K., Chevalier, S., Grance, T. and Dang, H. (2006) *Guide to Integrating Forensic Techniques into Incident Response*. NIST Special Publication 800-86.
</details>

<div class="box key" markdown="1">

Each stage of SP 800-86 needs the output of the stage before it. Tools examine; people analyse.

</div>

## 6. Responding to an incident: four phases and six Functions

### The idea

So far you have looked at the case as an investigator. The client sees it differently. For the client, the leak is an {% include term.html t="incident" %}: something is going wrong now, and it must be stopped.

The organised work of handling an incident is called {% include term.html t="incident-response" %}. An investigation asks "what happened?". A response also asks "how do we stop it, and how do we return to normal?". Doing both together is called {% include term.html t="dfir" %}.

NIST describes incident response in Special Publication 800-61. You must know two revisions of it, because both are in use.

### How it works

**Revision 2** describes a lifecycle of four phases.

| Rev 2 phase | What happens | In our case |
|---|---|---|
| 1. Preparation | Build the ability to respond before anything happens: people, tools, a {% include term.html t="playbook" %} for each type of incident, logging. | The client decides who to call and what its computers record. |
| 2. Detection and Analysis | Notice that something is wrong, confirm it, and understand its size. | Confidential documents are seen outside the company. Staff confirm that they are real. |
| 3. Containment, Eradication and Recovery | {% include term.html t="containment" %}: stop the damage. {% include term.html t="eradication" %}: remove the cause. {% include term.html t="system-recovery" %}: return to normal operation. | The suspect's accounts are locked. His access is removed everywhere. Systems are checked and returned to use. |
| 4. Post-Incident Activity | Review what happened and improve. | The client changes its rules for removable media. |

The phases form a loop. What is learned in phase 4 improves phase 1.

**Revision 3** replaces Revision 2. It does not draw four phases. It organises incident response around the six Functions of the NIST Cybersecurity Framework 2.0. Each one is a {% include term.html t="csf-function" %}: Govern, Identify, Protect, Detect, Respond and Recover.

Rev 3 groups the six Functions into two layers.

- **Govern, Identify and Protect** are the preparation layer. They run all the time, not only for incidents.
- **Detect, Respond and Recover** are the incident layer. They act on each incident.
- **Improvement**, which is part of Identify, takes lessons from every activity and feeds all six Functions.

The activities are the same. The grouping is different. Use the demo to move each Rev 2 phase into its Functions.

{% include demo.html id="S01-D4" %}

| Rev 2 phase | Where the work sits in Rev 3 |
|---|---|
| Preparation | Govern, Identify, Protect |
| Detection and Analysis | Detect, and the first part of Respond |
| Containment, Eradication and Recovery | Respond, then Recover |
| Post-Incident Activity | Identify (Improvement), feeding all Functions |

<div class="box metaphor" markdown="1">

**The comparison.** Rev 2 and Rev 3 are two maps of the same city.

**Why it fits.** Rev 2 is a route map. It shows a journey in order: first this, then that. Rev 3 is a map of the city's departments, which are all at work at the same time. Both maps show the same streets. A response team can find its work on either one.

**Where it breaks.** Two maps of one city do not change the city. Rev 3 does change it. It adds Govern, which gives management a named duty. It treats incident response as one part of managing risk, not as a separate process. And it moves learning from the end of the journey to every point on it.

**So what.** The two revisions are not two names for one thing. When you write "the NIST incident response lifecycle", say which revision you mean. Four phases belong to Rev 2. Six Functions belong to Rev 3.

</div>

Where does your forensic work sit? In Rev 2, it starts in Detection and Analysis and continues until the incident is closed. In Rev 3, it sits mainly in Respond, which includes collecting incident data and protecting its integrity. The custody record and the hash values from sections 3 and 4 are that protection.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The NIST lifecycle has four phases." | "SP 800-61 Rev 2 has four phases." | Rev 3 is current and has no four-phase lifecycle. |
| "Analysis" for everything | "Detection and Analysis" is a Rev 2 response phase. "Analysis" alone is the third forensic stage of SP 800-86. | Two documents use the same word for different work. |
| "Recovery" for getting files back | "System recovery" returns systems to normal after an incident. "Data recovery" gets data back from storage, from Session 2. | This module uses both, so we always say which. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A company trains its staff, writes playbooks and switches on logging before any incident happens. In Rev 3, which Functions hold this work?</p>
  <ul class="qc-opts">
    <li data-key="a">Detect and Respond</li>
    <li data-key="b">Govern, Identify and Protect</li>
    <li data-key="c">Recover only</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). These three Functions are the preparation layer in Rev 3. Rev 2 would call the same work the Preparation phase. Detect and Respond act on an incident that is happening.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Why NIST changed the model</summary>

Rev 3 explains its own change. When the four-phase model was written, incidents were rarer and smaller, and a team could treat each one as a separate event with a clear end. Today incidents are frequent, they do more damage, and recovery can take weeks or months. Waiting for the end before learning anything is too slow. So Rev 3 makes improvement continuous.

Rev 3 is also a different kind of document. Its full title calls it a *CSF 2.0 Community Profile*: a list of recommendations placed under each Function and Category of the framework. It gives less step-by-step instruction than Rev 2 did, and points to other resources for technique.

Two parts of the Respond Function describe forensic duties directly. One says that the actions performed during an investigation are recorded, and that the integrity and provenance of those records are preserved (RS.AN-06). The other says that incident data and metadata are collected, and that their integrity and provenance are preserved (RS.AN-07). A custody record and a recorded hash value are how an examiner meets them.

References: Cichonski, P., Millar, T., Grance, T. and Scarfone, K. (2012) *Computer Security Incident Handling Guide*. NIST Special Publication 800-61 Revision 2 (withdrawn). Nelson, A., Rekhi, S., Souppaya, M. and Scarfone, K. (2025) *Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile*. NIST Special Publication 800-61 Revision 3.
</details>

<div class="box key" markdown="1">

Rev 2: four phases in a loop. Rev 3: six Functions, with preparation and improvement running all the time. Always name the revision.

</div>

## 7. Response, recovery and learning

### The idea

Two things happen at the client company in the same month. First, staff discover that an employee has been taking confidential files. Second, a water pipe bursts above the server room and destroys the file server.

Both are bad days. Both need a plan. But they need different plans, with different people and different goals.

### How it works

The leak is a security incident, so incident response handles it. The flood is a disruption with no attacker, so {% include term.html t="disaster-recovery" %} handles it.

| | Incident response | Disaster recovery |
|---|---|---|
| Starts when | Someone or something threatens security: an intruder, malware, an insider | IT services are lost, for any reason: fire, flood, hardware failure, or an attack |
| Main question | What is happening, how do we stop it, and what did it do? | How do we get services running again? |
| Measured by | The threat is removed and understood | Services are back within the agreed time |
| Treats the affected systems as | A place to protect and study | Equipment to replace or restore |

The two plans meet when an attack also destroys services. Ransomware is the usual example. Then both teams want the same servers at the same time, for opposite reasons.

<div class="box metaphor" markdown="1">

**The comparison.** After a house fire, two crews arrive. The fire crew and the fire investigator are incident response. The builders are disaster recovery.

**Why it fits.** The fire crew stops the damage, as containment does. The investigator finds the cause, as forensics does. The builders make the house usable again, and they are judged on how soon the family can return.

**Where it breaks.** A fire is visible and it ends. An intruder is hidden and may still be inside when the builders start. A fire also does not return because the house was rebuilt. An attacker can return if the rebuilt system has the same weakness, or if the backup that was restored already contained the attacker's access. And builders clear the site. On a computer, clearing the site means wiping disks and restoring backups, which destroys what the investigator needs.

**So what.** Preserve first, then restore. The order must be agreed before the incident, because on the day the pressure to restore is very strong.

</div>

### Learning from the incident

When the incident is closed, the team holds a review. Rev 2 calls this {% include term.html t="post-incident-activity" %}. Its purpose is to learn: what happened, why it could happen, what the response did well and what it did badly.

A review that produces only a meeting has failed. It should produce things that change the next response. For our client, those could be a written {% include term.html t="lessons-learned" %} report with named actions, a new rule for removable media, a new alert for large copies to USB storage, and a playbook for the day an employee leaves the company. The evidence itself is also an output: the team decides what to keep, for how long, and under whose custody.

### Forensic readiness

Follow those outputs forward. Every one of them is preparation for the next incident. This is where the loop closes.

One part of preparation matters most to an examiner. {% include term.html t="forensic-readiness" %} is the organisation's ability to collect trustworthy evidence quickly and cheaply when something happens. An examiner can only find what the organisation recorded and kept.

Think about our client before the leak. Did staff computers record when a USB drive was connected? Were logs kept for months, or deleted after a week? Did the clocks on different systems agree? Did anyone know how to keep the suspect's computer safe without switching it on to look?

Each "yes" is evidence that you will find in Sessions 2 to 5. Each "no" is a hole in your timeline that no skill can fill later. In Session 11 you will build readiness yourself, in a cloud account, before the incident happens. It is the first thing your coursework is marked on.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A burst pipe destroys the client's file server. Nobody suspects an attack. Which plan leads?</p>
  <ul class="qc-opts">
    <li data-key="a">Incident response</li>
    <li data-key="b">Disaster recovery</li>
    <li data-key="c">Neither, because no crime took place</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). There is no security incident to contain or investigate. The goal is to restore the service, and that is disaster recovery. If the server had been destroyed by an attacker, incident response would lead, and the restore would wait until the evidence was preserved.</p></div>

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">The review of the leak finds that staff computers kept no record of USB drives. The client switches that record on. Where does this action belong?</p>
  <ul class="qc-opts">
    <li data-key="a">Containment, because it limits the damage of the leak</li>
    <li data-key="b">Eradication, because it removes the cause</li>
    <li data-key="c">Preparation for the next incident</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The leak is over, so nothing is being contained or removed. The review has produced a change that makes the next investigation possible. In Rev 3 terms, an improvement has fed the Protect and Detect Functions.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>When the two plans share one event</summary>

Disaster recovery belongs to a wider plan called business continuity, which keeps the whole organisation working, not only its IT. Disaster recovery plans use two targets. The recovery time objective is how long a service may be down. The recovery point objective is how much recent data may be lost.

In Rev 3, restoring systems after an incident is the Recover Function. So a ransomware attack starts the incident response plan and the disaster recovery plan together. Good organisations decide in advance who has authority over an affected system at each point. A common rule is that the response lead releases a system to the recovery team only after its evidence is preserved.

You will make this decision yourself in Session 17, for a compromised web server.
</details>

<div class="box key" markdown="1">

Incident response deals with a threat. Disaster recovery restores a service. Post-incident activity turns one incident into readiness for the next.

</div>

## 8. The lab: image, verify and record

Your task: receive one item of evidence, make a verified working copy of it, and keep a custody record with no gaps.

You work in the Windows VM with FTK Imager. Allow about two hours.

<div class="box lms" markdown="1">

The evidence file, the evidence register and a blank custody record are in folder `S01` on the lab share. If you are studying away from the lab, the LMS explains how to get the same files.

</div>

**The item.** `nps-2009-canon2-gen1.E01` is an image of a camera memory card. It was created at the Naval Postgraduate School and is published by Digital Corpora for teaching and research. Keep its name exactly as it is. In the case, it is the unit's proficiency item, exhibit `S01-001`.

### Part A: check your environment

1. Start the Windows VM and run the verify script from [Session 0](../s00/#step-7-run-the-verify-script). Then do the same in the Kali VM. If your host machine has 8 GB of memory, run one VM at a time.

   <div class="box expect" markdown="1">

   The last line reads `RESULT: READY` in each VM.

   </div>

   <div class="box trouble" markdown="1">

   If a line shows `FAIL`, read the hint beside it and fix that one item. If a VM does not start at all, do not rebuild it now. Use the rescue route in Session 0, or work on a lab machine today and repair your own VM afterwards.

   </div>

### Part B: receive the evidence

{:start="2"}
2. In the Windows VM, create two folders: `C:\Evidence\S01` and `C:\Cases\S01`. Copy the three files from the lab share into `C:\Evidence\S01`.

   <div class="box expect" markdown="1">

   The folder holds `nps-2009-canon2-gen1.E01`, the evidence register and the blank custody record.

   </div>

   <div class="box trouble" markdown="1">

   If the Windows VM cannot open the lab share, copy the files to your host machine first, put them in your `nb6018-share` folder, and take them from `\\VBOXSVR\nb6018` inside the VM.

   </div>

3. Right-click the E01 file, choose **Properties**, tick **Read-only** and choose **OK**.

   <div class="box expect" markdown="1">

   The Read-only box stays ticked when you open Properties again. This is your replacement for a write blocker today.

   </div>

   <div class="box trouble" markdown="1">

   If the box shows a square and not a tick, you opened the properties of the folder. Open the properties of the E01 file itself.

   </div>

4. Open the custody record. Write entry 1: you received exhibit `S01-001` from the lab share, with the date and time, your name, the purpose "proficiency check" and the place `C:\Evidence\S01`.

   <div class="box expect" markdown="1">

   Entry 1 is complete before you open the evidence in any tool. "Hash checked" says "not yet".

   </div>

   <div class="box trouble" markdown="1">

   If you already opened the file in a tool, do not hide it. Write the entry now and state the true order of events. An honest late entry is a small weakness. A false one destroys the record.

   </div>

### Part C: verify what you received

{:start="5"}
5. Start FTK Imager. Choose **File**, then **Add Evidence Item**, then **Image File**. Select the E01 file in `C:\Evidence\S01` and choose **Finish**.

   <div class="box expect" markdown="1">

   The Evidence Tree on the left shows the image. You can open it to see a file system and folders.

   </div>

   <div class="box trouble" markdown="1">

   If FTK Imager reports that it cannot open the file, check that the file finished copying and that its size matches the size on the lab share.

   </div>

6. In the Evidence Tree, right-click the image name and choose **Verify Drive/Image**. Wait for the progress bar to finish.

   <div class="box expect" markdown="1">

   A results window shows an MD5 hash and a SHA1 hash. It shows the value it computed, the value stored inside the E01 file where the file holds one, and the word **Match**.

   </div>

   <div class="box trouble" markdown="1">

   If the result is a mismatch, stop. Do not continue with this file. Copy it again from the lab share and verify again. If it still differs, tell the lecturer: you have just found the reason this step exists.

   </div>

7. Compare the computed values with the values in the evidence register, character by character. Write both values in your notes. Add entry 2 to the custody record: "verified on receipt, values match the register".

   <div class="box expect" markdown="1">

   Three sources agree: the register, the value stored in the E01 file, and the value you computed.

   </div>

   <div class="box trouble" markdown="1">

   If your value matches the stored value but not the register, do not correct anything yourself. Tell the lecturer. A register with a wrong value is a finding, and it must be recorded, not repaired quietly.

   </div>

### Part D: make the working copy

{:start="8"}
8. Right-click the image name again and choose **Export Disk Image**. Then:
   - choose **Add** and select **Raw (dd)** as the image type;
   - fill in the evidence item information: case number `NB6018-S01`, evidence number `S01-001-WC1`, a short description, and your name as examiner;
   - set the destination folder to `C:\Cases\S01` and the file name to `S01-001-WC1`;
   - set the fragment size to `0`, so that the image is one file, and choose **Finish**;
   - tick **Verify images after they are created**, then choose **Start**.

   <div class="box expect" markdown="1">

   When it finishes, a results window shows the computed hash values and a verify result of **Match**. The folder `C:\Cases\S01` holds `S01-001-WC1.001` and a text file with the same name that ends in `.txt`.

   </div>

   <div class="box trouble" markdown="1">

   If the folder holds many files ending in `.001`, `.002` and so on, the fragment size was not `0`. Delete them and repeat this step.

   </div>

9. Open the text file. Compare its MD5 and SHA1 values with the values from step 7.

   <div class="box expect" markdown="1">

   They are identical. Your working copy holds exactly the same sectors as the item you received.

   </div>

   <div class="box trouble" markdown="1">

   If they differ, the export did not complete or it used another source. Delete the working copy, repeat step 8, and record what happened in your notes.

   </div>

### Part E: check with a second tool

{:start="10"}
10. Open PowerShell and run these commands on the working copy:

    ```powershell
    cd C:\Cases\S01
    Get-FileHash .\S01-001-WC1.001 -Algorithm MD5
    Get-FileHash .\S01-001-WC1.001 -Algorithm SHA256
    ```

    <div class="box expect" markdown="1">

    The MD5 value is the same as FTK Imager's value, although PowerShell shows it in capital letters. Two independent tools agree. Write the SHA-256 value in your notes and in the custody record.

    </div>

    <div class="box trouble" markdown="1">

    If PowerShell cannot find the file, run `dir` and check the name. If the MD5 value differs from FTK Imager's, check that you hashed the file ending in `.001` and not the text file beside it.

    </div>

11. Now run the same command on the E01 file that you received:

    ```powershell
    Get-FileHash C:\Evidence\S01\nps-2009-canon2-gen1.E01 -Algorithm MD5
    ```

    <div class="box expect" markdown="1">

    This value is different from all the others. Nothing is wrong. Here PowerShell hashed the container file, with its compression and its notes. FTK Imager hashed the sectors inside it. Write one sentence in your notes that explains the difference.

    </div>

    <div class="box trouble" markdown="1">

    If this value is the same as the value from step 10, you hashed the working copy again. Check the path in the command.

    </div>

### Part F: see a change being caught

{:start="12"}
12. Make a scratch copy of the working copy, and change one bit of the scratch copy:

    ```powershell
    Copy-Item .\S01-001-WC1.001 .\SCRATCH-not-evidence.001
    $p = (Resolve-Path .\SCRATCH-not-evidence.001).Path
    $f = [System.IO.File]::Open($p, 'Open', 'ReadWrite')
    $f.Position = 5000
    $b = $f.ReadByte()
    $f.Position = 5000
    $f.WriteByte($b -bxor 1)
    $f.Close()
    Get-FileHash .\SCRATCH-not-evidence.001 -Algorithm SHA256
    (Get-Item .\S01-001-WC1.001).Length
    (Get-Item .\SCRATCH-not-evidence.001).Length
    ```

    <div class="box expect" markdown="1">

    The SHA-256 value of the scratch copy has nothing in common with the value from step 10. The two lengths are the same number. One bit out of millions changed, the size did not, and the hash caught it.

    </div>

    <div class="box trouble" markdown="1">

    If PowerShell says that the file is being used by another process, close FTK Imager and run the commands again.

    </div>

    <div class="box safety" markdown="1">

    You change a scratch copy only, and its name says so. Never run these commands on the received file or on the working copy. Delete the scratch copy now: `Remove-Item .\SCRATCH-not-evidence.001`

    </div>

13. Hash the working copy one more time with `Get-FileHash .\S01-001-WC1.001 -Algorithm SHA256`, to show that your experiment did not touch it. Add the result to your notes.

    <div class="box expect" markdown="1">

    The value is the same as in step 10.

    </div>

    <div class="box trouble" markdown="1">

    If the value differs, you changed the working copy by mistake. Do not hide it. Record it, delete the working copy and make a new one from step 8. This is exactly what verification is for.

    </div>

### Part G: close the record

{:start="14"}
14. Add the final entries to the custody record: the working copy `S01-001-WC1` was created, by you, with FTK Imager and its version number, verified, and stored in `C:\Cases\S01`. Record that the scratch copy was created for a demonstration and deleted.

    <div class="box expect" markdown="1">

    Every action from step 2 to step 13 that touched the evidence has an entry. Each entry has a date and time, a person, a purpose, a place and a hash status.

    </div>

    <div class="box trouble" markdown="1">

    If you find an action with no entry, do not slip it in between the others. Add it at the end, mark it as a late entry and give the reason.

    </div>

### Checkpoint

Hand in your custody record and your notes. Your work passes when all three of these are true:

1. The hash values you computed for the received item match the evidence register.
2. The hash values of your working copy match the received item, and two tools agree.
3. Your custody record has no gap: a reader could say where the item and the working copy were, and who had them, at every point of the lab.

This checkpoint helps with the coursework and the phase test. In the coursework you will collect cloud evidence and must show its integrity and custody in the same way.

### If you have time

Do the same job in the Kali VM, on the command line.

1. Copy the E01 file into Kali. Run `ewfverify nps-2009-canon2-gen1.E01`. It reads the stored hash value and computes it again.
2. Run `ewfexport -u -t S01-001-WC2 -f raw nps-2009-canon2-gen1.E01`. It writes a raw working copy.
3. Run `sha256sum S01-001-WC2.raw` and compare the value with step 10.

Guymager is the graphical imaging tool on Kali. It is built to image devices, so to use it here you first present the E01 file as a device with `ewfmount`, and then add that device in Guymager with **Devices**, **Add special device**. Try it only when the three commands above have worked.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. An analyst runs `Get-FileHash` on an E01 file and gets a value that differs from the hash value FTK Imager reported for the same image. Explain why both tools can be right.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
FTK Imager reports the hash of the sectors stored inside the E01 container, which is the hash of the original device. `Get-FileHash` hashes the container file itself, which also holds compression and case notes, so the value is different. The points that earn marks: (1) one value describes the data inside the container; (2) the other describes the container file; (3) to compare them fairly, hash the same thing, for example by verifying inside the tool or by exporting a raw image.
</details>

**2. A colleague says: "The hash values match, so the evidence is genuine." Explain what a matching hash value shows, and what it does not show.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A match shows that the data is identical, bit for bit, to the data that was hashed when the value was recorded. It does not show where the data came from or who has handled it, and it cannot show that the data was unaltered before the first hash was taken. The points that earn marks: (1) a match means identical content since the recorded value; (2) it says nothing about source or handling; (3) the custody record supplies that part.
</details>

**3. Use one example from the case to explain the difference between examination and analysis in NIST SP 800-86.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Examination pulls the relevant items out of the collected data, for example listing the documents that were opened from a USB drive on the suspect's computer. Analysis interprets those items to answer the case question, for example concluding that the suspect copied confidential documents to a drive that he took away. The points that earn marks: (1) examination extracts relevant data; (2) analysis interprets it and reaches conclusions; (3) a suitable example of each.
</details>

**4. A team says it "does lessons learned at the end of an incident". Explain how NIST SP 800-61 Rev 3 treats the same activity.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Rev 3 does not keep learning for a final phase. It places improvement inside the Identify Function and treats it as continuous, so lessons from every activity feed all six Functions while the work is still going on. The points that earn marks: (1) improvement is continuous, not a last step; (2) it sits in Identify (Improvement); (3) it feeds every Function, including preparation.
</details>

## Coming next

You can now copy evidence and show that the copy is exact. In Session 2 the case opens: you receive the image of the suspect's computer, and you find out what the unlisted space on a disk still holds.
