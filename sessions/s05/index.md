---
session_code: S05
description: "What Windows records about its user without being asked, in the registry, event logs, prefetch files, LNK files, jump lists and shellbags, and how to merge those records into one defensible timeline in UTC."
hook: >-
  The client needs one answer in order of time: on the day the documents left the building, what did the suspect do, and when?
  He wiped what he remembered. What did his own computer write down that he never saw?
outcomes:
  - "Explain what the registry, the event logs, prefetch files, LNK files, jump lists and shellbags each record, and what each one cannot show"
  - "Explain why the last-write time of a registry key cannot say which value changed"
  - "Identify one USB device across several artefacts, and state which question each artefact answers"
  - "Explain why every source is normalised to UTC before events are merged, and apply the time zone offset that the image itself gives"
  - "Identify a source that records local time, and convert its times correctly"
  - "Compare what a super-timeline adds with what it buries"
  - "Apply RegRipper, Eric Zimmerman's tools, Plaso and Timeline Explorer to the lab evidence, and justify each event in a reconstructed timeline by its source"
before:
  - "Describe what one record of the [master file table](../s02/#3-three-file-systems-one-job) holds (Session 2)"
  - "Explain [how deletion really works](../s02/#4-how-deletion-really-works), and what a deleted file leaves behind (Session 2)"
  - "Explain [timestomping](../s04/#6-timestomping-two-sets-of-dates) and the two sets of times that NTFS keeps for a file (Session 4)"
  - "List the traces that the suspect's [anti-forensic tools](../s04/#7-hiding-leaves-its-own-trace) left on his last morning (Session 4)"
  - "Calculate a [hash value](../s01/#3-the-hash-value-showing-that-nothing-changed) and keep a custody record without a gap (Session 1)"
demos:
  - id: S05-D1
    title: "One key, one time: which value changed?"
    file: s05-d1-last-write-time.html
    teaches: "A registry key keeps a single last-write time, so every change to any value moves the same stamp and the time cannot say which value changed."
  - id: S05-D2
    title: "One USB stick, five records"
    file: s05-d2-usb-five-records.html
    teaches: "Each artefact holds one fact about the stick, and only the device serial number joins the facts into one story."
  - id: S05-D3
    title: "Two clocks in one timeline"
    file: s05-d3-normalise-to-utc.html
    teaches: "A source that records local time puts its event hours out of place until every source is normalised to UTC."
  - id: S05-D4
    title: "Merge, sort, filter: what a super-timeline buries"
    file: s05-d4-super-timeline.html
    teaches: "Merging every source gives the order of events and a flood of rows, and the filter that removes the flood can also remove an event that matters."
slides: s05-windows-artefacts-timelining.pptx
evidence: "the lab share, folder `S05` (the lab steps say exactly which files)"
---

Session 4 ended on the suspect's last morning. You saw that a program had run, that a search had been typed and that a file had been renamed, and you took those records on trust. Today you open them.

The unit stays with the client's evidence, the NIST CFReDS Data Leakage Case. The image of the suspect's computer is the same one that you examined in Sessions 2 and 4. The question has changed. Until now you asked what was on the disk. Today you ask what happened, and in which order.

One thing is different from every earlier session: this page shows real dates and clock times. They are the dates inside the evidence, from March 2015, and they are the subject of the lesson. The names in the case belong to the NIST collection.

## 1. The record that nobody asked for

### The idea

On Monday 23 March 2015, from 14:02 by his own clock, the suspect typed more than twenty searches into two browsers. Among them were these three:

```
what is windows system artifacts
windows event logs
external device and forensics
```

So he knew that Windows keeps records. He read about them. Two days later he installed two cleaning tools and ran both. And still, when you finish today's lab, you will have the minute at which he connected his own USB stick, the names he gave to twenty confidential files, and the folder he opened on the stick to check his work.

How is that possible? Windows does not keep one diary that a person can find and burn. It keeps hundreds of small records, each made for an ordinary purpose. One makes programs start faster. One remembers how a folder window looked. One fills the list of recent files. None of them was built to watch the user, and no single screen in Windows shows them all.

A record that a system makes while it works, and that later shows what happened, is called an {% include term.html t="artefact" %}. This session teaches the artefacts of Windows that matter most in this case, in six groups. For each one you learn three things: what it records, which time it holds, and what it cannot show.

<div class="box lens" markdown="1">

**Through another lens: implicit memory.** Psychology separates two kinds of memory. Explicit memory is what you can call to mind and tell: what you did this morning. Implicit memory shows in what you do, with no recall at all. A well-known patient who could form no new memories practised a hard drawing task for several days. Each day he said that he had never seen the task before. Each day he did it better. His hands held a record that he could not report.

The suspect's computer is like those hands. He cleaned what he could recall doing: his mail, a folder, the installers. The records that Windows had made of the same acts were never in his mind, so he could not clean them.

Where the parallel breaks: a human trace of this kind is vague and cannot be dated. The machine's trace carries a time to the second. And the machine has no intention and no understanding. Its record means nothing until an examiner reads it and can explain it.

The question to carry through the session: if the user did not know that a record existed, whose account of the day is more complete, his own or his computer's?

</div>

### How it works

Every artefact in this session can be read with the same three questions.

| The question | Why it matters |
|---|---|
| **What made this record, and for what purpose?** | The purpose tells you what the record covers and what it leaves out. A list built for speed is not complete, and nobody promised that it would be. |
| **What exactly does its time mean?** | "The time of the record" is never enough. It may be the first time, the last time, or the time at which something else was written. |
| **Which clock wrote the time?** | Most Windows artefacts store {% include term.html t="utc" %}, the one world time with no time zone. A few store the time that the clock on the desk showed. Section 8 is about the difference. |

The evidence decides what you can use. The suspect's computer ran Windows 7. Some artefacts that are famous from Windows 10 and 11 do not exist on it, and some that exist hold less. Where a newer Windows differs, this page says so in the deeper layer. You report what this image can show, and nothing else.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A user removes a program from his computer. An examiner later finds a record that the program ran. Which explanation fits best?</p>
  <ul class="qc-opts">
    <li data-key="a">The removal failed, because a removed program leaves no records</li>
    <li data-key="b">Windows made the record for its own purpose, in a place that the program does not own, so removing the program did not touch it</li>
    <li data-key="c">The record was planted, because Windows does not keep such records</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). An uninstall removes the program's own files and settings. A record that Windows made about the program, for example to start it faster next time, belongs to Windows. Option (a) repeats the user's own mistake.</p></div>

</div>

<div class="box key" markdown="1">

Windows keeps many small records for ordinary purposes. For each artefact, ask what made it, what its time means, and which clock wrote that time.

</div>

## 2. The registry: one time for each key

### The idea

Windows and its programs must remember their settings: the name of the computer, the time zone, which devices were connected, what each user typed into the Run box. They keep all of this in one large store, the {% include term.html t="registry" %}.

The registry is not one file. On disk it is a small number of files, and each one is called a {% include term.html t="hive" %}.

| Hive | Where it is on this image | What it holds |
|---|---|---|
| `SYSTEM` | `C:\Windows\System32\config` | The computer: its name, its time zone, its devices, its last shutdown |
| `SOFTWARE` | `C:\Windows\System32\config` | Windows and installed programs: the version of Windows, the list of installed programs |
| `SAM` | `C:\Windows\System32\config` | The user accounts of this computer |
| `NTUSER.DAT` | `C:\Users\informant` | One user: what he ran, typed and opened |
| `UsrClass.dat` | `C:\Users\informant\AppData\Local\Microsoft\Windows` | One user: more of the same, including the folders that he browsed |

The first three describe the machine. The last two belong to one account. That difference matters in a report: a record in `NTUSER.DAT` of the account `informant` ties an act to that account, and a record in `SYSTEM` does not.

Inside a hive, the structure looks like folders and files. A {% include term.html t="registry-key" %} is like a folder: it has a name, and it holds values and more keys. A {% include term.html t="registry-value" %} is like a file in it: one named piece of data.

Here is what the unit read from two keys of the suspect's computer. You will read both yourself in the lab.

```
SOFTWARE\Microsoft\Windows NT\CurrentVersion
    ProductName        Windows 7 Ultimate
    CurrentVersion     6.1
    CurrentBuildNumber 7601
    RegisteredOwner    informant

SYSTEM\ControlSet001\Control\TimeZoneInformation
    TimeZoneKeyName    Eastern Standard Time
    Bias               300
    DaylightBias       -60
    ActiveTimeBias     240
```

The first key tells you which Windows you are reading, and so which artefacts to expect. The second tells you how far the computer's clock was from UTC. Section 8 uses it.

### How it works

Now the part that examiners most often get wrong. Each key carries a time, the {% include term.html t="last-write-time" %}. It is stored in UTC. There is exactly one for each key, and none for a value.

The time moves whenever the key changes: when a value is added, when a value is changed, when a value is removed. It does not say which of these happened, or to which value.

{% include demo.html id="S05-D1" %}

Take a real key from the case. When a user types a command into the Run box, Windows adds it to the key `RunMRU` in that user's `NTUSER.DAT`. On the suspect's computer the key held two commands, value `a` and value `b`, and a value `MRUList` that gives their order, newest first. Value `b` was the address of the company's protected network drive:

```
NTUSER.DAT\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU
    last-write time    2015-03-23 20:23:28 (UTC)
    MRUList            ba
    a                  (an earlier command)
    b                  \\10.11.11.128\secured_drive
```

`MRUList` says that `b` is the newest entry. So the last-write time is the moment at which `b` was typed: 20:23:28 UTC, which was 16:23:28 on the suspect's clock. That is a strong finding. But the key gives no time at all for value `a`. It was typed at some moment before `b`. The registry does not say when.

<div class="box metaphor" markdown="1">

**The comparison.** A registry key is like a drawer in an office filing cabinet that has one stamp on its front: "last opened". The papers inside carry no stamps of their own.

**Why it fits.** The drawer is the key, and the papers are the values. Each time anyone puts a paper in, takes one out or corrects one, the stamp on the front is changed to that moment. If the papers are numbered in order, as `MRUList` numbers them, you know that the stamp belongs to the newest paper. You know nothing about the time of any other paper.

**Where it breaks.** A drawer is opened by a person. A key is very often written by Windows itself, or by a program, with no user near the keyboard. An update, a driver or a service can move the stamp. So a last-write time is the time of a change, and it is not automatically the time of a human act. Also, a clerk remembers which paper he touched. The registry keeps no such memory.

**So what.** Report a last-write time as the time at which the key last changed. Say what you believe changed and why, for example because an order list names the newest value. Never give the same time to every value in the key.

</div>

A second key from the case shows the limit from the other side. Windows keeps the words that a user types into the search box of Explorer in a key named `WordWheelQuery`. On the suspect's computer it holds the word `secret`. Its last-write time is 14:40:17 on 23 March by his clock. The documentation of the case puts the search itself a few minutes earlier, and its answer key warns that the time of the key is only close to the time of the search. The stamp is on the drawer, not on the paper.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The value was written at this time." | "The key last changed at this time, and the order list shows that this value is the newest." | Only the key has a time. The link to one value is your reasoning, and the reader must be able to check it. |
| "The registry shows what the user did." | "This key in the user's own hive shows what was done under his account." | Machine hives describe the computer. Only the user's hives tie a record to an account, and an account is not a person. |
| "It is not in the registry, so it did not happen." | "No record was found in the keys that were examined." | Keys have size limits, programs clean them, and many acts were never recorded there. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A key holds five values, with no list that orders them. Its last-write time is 10:15:00 UTC. What can the examiner report?</p>
  <ul class="qc-opts">
    <li data-key="a">That all five values were written at 10:15:00 UTC</li>
    <li data-key="b">That the first value was written at 10:15:00 UTC</li>
    <li data-key="c">That the key last changed at 10:15:00 UTC, and that the registry does not show which value changed or when the others were written</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). A key has one time. With no order list, nothing connects that time to one value. Option (a) is the most common mistake in reports that use registry times.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Control sets, transaction logs and the tools</summary>

**ControlSet001 and CurrentControlSet.** On a running computer you see a key named `CurrentControlSet`. It is not stored on disk. It is a pointer to one of the numbered sets, and the key `SYSTEM\Select` says which. In an image you read `ControlSet001` or whichever number `Select` names.

**Transaction logs.** Windows does not always write a change into the hive file at once. It first writes it into small log files beside the hive, with names that end in `.LOG1` and `.LOG2`. A hive copied from an image can therefore be slightly behind. Registry Explorer notices this, tells you that the hive is "dirty" and offers to add the logs. Accept, and note it in your custody record, because you are now reading a version that the tool put together.

**Deleted keys.** A deleted key is not wiped. Its space inside the hive is marked free, as a deleted file's clusters are, and tools can often show it again.

**The tools.** RegRipper runs one small plugin for each question and prints text: fast, and easy to keep with your notes. Registry Explorer shows the whole hive as a tree, with the last-write time of every key in a column. You use both in the lab, so that one tool checks the other.

**Windows 10 and 11.** The hives, the keys in this section and the rule of one time for each key are the same. Newer versions add keys that Windows 7 does not have. Section 4 and section 6 name the ones that matter.
</details>

<div class="box key" markdown="1">

A registry key has one last-write time, in UTC. It says when the key last changed, never which value changed.

</div>

## 3. Event logs: the computer's own log book

### The idea

The registry remembers the present state. An {% include term.html t="event-log" %} is different: it is a list that only grows. Each time Windows has something to report, it adds one record with the time in UTC, the source and a number.

That number is the {% include term.html t="event-id" %}. It names the kind of event. You do not need to know hundreds of them. For this case four from the `Security` log and one from the `System` log carry the story.

| Log | Event ID | It means | It answers |
|---|---|---|---|
| Security | 4608 | Windows is starting | When was the computer switched on? |
| Security | 4624 | An account was logged on | Who was logged on, and from when? |
| Security | 4647 | A user started to log off | When did he leave? |
| Security | 1100 | The logging service has shut down | When was the computer shut down? |
| System | 20001 | The driver for a new device was installed | When was a device seen for the first time? |

On this image the logs are files that end in `.evtx`, in `C:\Windows\System32\winevt\Logs`.

### How it works

Read the Security log of the suspect's computer for its last three working days. The times are in UTC, as the log stores them. The last column shows the same moment on the clock in his office, which was four hours behind UTC.

| Day | Windows started (4608) | User logged off (4647) | Logging stopped (1100) | On his clock |
|---|---|---|---|---|
| Mon 23 March | 17:24:23 | 21:02:53 | 21:02:59 | 13:24 to 17:02 |
| Tue 24 March | 13:21:29 | 21:07:25 | 21:07:26 | 09:21 to 17:07 |
| Wed 25 March | 13:05:41 | 15:30:57 | 15:31:00 | 09:05 to 11:31 |

Three things can be read from that small table.

1. **The frame of each day.** Nothing that the user did on 24 March can be earlier than 13:21:29 UTC or later than 21:07:26 UTC. Every other artefact of that day must fit inside this frame. If one does not, either its clock is different or something is wrong. Remember this for section 8.
2. **A rule was broken.** The company allowed work on confidential files only between 10:00 and 16:00. On 23 and 24 March the computer was in use until after 17:00.
3. **Two sources agree.** The registry key `SYSTEM\ControlSet001\Control\Windows` holds a value `ShutdownTime`. It gives 15:31:05 UTC on 25 March. The event log gives 15:31:00. Two records, made by different parts of Windows, differ by five seconds. Agreement like this is what makes a timeline strong.

Be careful with event 4624. The answer key lists ten of them on 25 March alone. The suspect did not sit down ten times. Windows records a logon whenever an account starts a session, and services and system accounts do that all day. Each 4624 record carries the account name and a logon type, and you must read both before you call it a person.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "He logged on ten times that morning." | "The log holds ten logon events. The account name and the logon type of each show which of them are a person." | Services and the system itself log on too. The logon type and the account name separate them. |
| "The log shows that the suspect was at the computer." | "The log shows that the account `informant` was logged on." | An event log knows accounts, not people. |
| "Nothing was logged, so nothing happened." | "No event of this kind was found in the log, which covers these dates." | Logs have a size limit and overwrite their oldest records. Many kinds of event are not logged unless a setting is switched on. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">An examiner finds an artefact which says that a file was opened on the suspect's computer at 11:40:00 on 24 March. The Security log shows that Windows started at 13:21:29 UTC on that day. What is the most useful first thought?</p>
  <ul class="qc-opts">
    <li data-key="a">The two times may come from different clocks, so check which clock the artefact uses before anything else</li>
    <li data-key="b">The file was opened by another person before the suspect arrived</li>
    <li data-key="c">The event log was changed, because it disagrees with the artefact</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). A computer that is switched off opens no files. An event outside the frame of the day is first of all a sign that two clocks are being compared. Options (b) and (c) are possible in theory, and both are large claims that need far more than one odd time.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Logon types, missing logs and newer versions of Windows</summary>

**Logon types.** A 4624 record carries a number for the kind of logon. Type 2 is a logon at the keyboard and screen. Type 3 is a logon over the network. Type 5 is a service. Type 7 is the unlocking of a locked screen. For "when was a person at the desk", types 2 and 7 are the ones to read.

**4634 and 4647.** Event 4647 is written when a user chooses to log off. Event 4634 is written when a logon session ends for any reason, so there are many more of them. For the end of a person's working day, 4647 is the clearer record.

**A cleared log is an event.** When someone clears the Security log, Windows writes event 1102 into the new, empty log. A log that begins with 1102 has told you something. The suspect in this case did not clear his logs.

**What decides whether an event exists.** Many Security events are written only if the audit policy of the computer asks for them. Before you report that an event is absent, check that this computer would have recorded it.

**Windows 10 and 11.** The files, the format and the event IDs in this section are the same. Newer versions add more logs. One of them records details of each storage device that is connected, and it does not exist on Windows 7. You will not find it in this image.

**The tool.** EvtxECmd reads every `.evtx` file in a folder and writes one CSV file, with the time in UTC, the event ID and a short description from a map that is supplied with the tool.
</details>

<div class="box key" markdown="1">

An event log gives each event an ID and a time in UTC. The start-up and shutdown events frame the day, and every other record must fit inside that frame.

</div>

## 4. Programs that ran: prefetch and UserAssist

### The idea

In Session 4 you found files in `C:\Windows\Prefetch` with names such as `ERASER.EXE-` followed by eight characters, and you were told that the name and the place were enough for that day. Here is what is inside.

When a program starts, Windows watches for about ten seconds which files it loads. It writes the list into a {% include term.html t="prefetch-file" %}, so that the next start is faster. The purpose is speed. The by-product is evidence: the file also holds the name of the program, how many times it has run, and when it last ran.

A second record sits in the user's own hive. The key `UserAssist` in `NTUSER.DAT` counts the programs that this user started through the Windows desktop, and keeps the time of the last start. Windows uses it to fill the list of frequent programs in the Start menu.

### How it works

Read the two records side by side for the suspect's last morning, Wednesday 25 March. All times are UTC.

| Program | Prefetch: last run | Prefetch: run count | UserAssist: last run | UserAssist: count |
|---|---|---|---|---|
| `ERASER 6.2.0.2962.EXE` (the installer) | 14:50:14 | 1 | 14:50:14 | 1 |
| `CCSETUP504.EXE` (the installer) | 14:57:56 | 1 | 14:57:56 | 1 |
| `ERASER.EXE` | 15:13:30 | 2 | 15:12:28 | 1 |
| `CCLEANER64.EXE` | 15:15:50 | 2 | 15:15:50 | 1 |
| `UNINST.EXE` (removes CCleaner) | 15:18:29 | 1 | no record | |

The first two rows agree to the second. The third row does not, and that is the lesson of this section. Prefetch says that Eraser ran twice, the last time at 15:13:30. UserAssist says once, at 15:12:28.

Neither is wrong. They count different things.

| | Prefetch file | UserAssist |
|---|---|---|
| Where it is | `C:\Windows\Prefetch`, one file for each program | The user's `NTUSER.DAT` |
| What it counts | Every start of the program, whoever or whatever started it | Starts by this user through the desktop: a double click, the Start menu |
| Whose record | The computer's. It names no account | One account's |
| The time, on Windows 7 | One: the last run | One: the last run |
| Clock | UTC | UTC |

So the most likely reading is this: the user started Eraser once from the desktop at 15:12:28, and the program was started once more, a minute later, in a way that the desktop did not count. A program can start a second copy of itself, and an installer can start the program that it has just installed. The answer key of the case gives the same warning: run counts may not be exact.

Together the two records say more than either one alone. Prefetch proves that the program ran on this computer. UserAssist ties a start to the account `informant`.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "Prefetch shows that the suspect ran Eraser." | "Prefetch shows that Eraser ran on this computer. UserAssist shows a start under the account `informant`." | A prefetch file names no account. |
| "Eraser ran at 15:13:30." | "Eraser last ran at 15:13:30 UTC, and had run twice in all." | On Windows 7 the file holds only the last run. The time of the first run is not in it. |
| "There is no prefetch file, so the program never ran." | "No prefetch file for this program was found." | Windows 7 keeps only a limited number of prefetch files and removes old ones. A cleaning tool can delete them. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">On a Windows 7 image, the prefetch file of a program shows a run count of 6 and a last run at 09:15:00 UTC on Friday. What does the file tell you about the other five runs?</p>
  <ul class="qc-opts">
    <li data-key="a">That they also happened on Friday</li>
    <li data-key="b">That they happened, at times which the file does not record</li>
    <li data-key="c">Nothing can be said: the count is unreliable, so perhaps there was only one run</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). On Windows 7 the file stores the count and one time, the last. The earlier runs are real and undated. Option (c) goes too far: a count can be a little wrong, but it is still evidence of repeated use.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Inside the file, other records of programs, and newer versions of Windows</summary>

**The name of the file.** The eight characters after the program's name are calculated from the full path of the program. The same program started from two different folders gives two prefetch files. A second file for a well-known program name is therefore worth a look: it shows that a copy ran from an unusual place.

**The list inside.** The file lists the files and folders that the program touched in its first ten seconds. For a wiping tool or an archive program, that list can name the folder it was pointed at.

**The file's own dates.** The prefetch file is itself a file in NTFS, with the times that Session 4 taught. Its created time is close to the first run of the program, and its modified time is close to the last run. Each prefetch file is written about ten seconds after the program starts, so these file times are a few seconds later than the run times inside.

**A third record: the compatibility cache.** Windows keeps a list of programs that it has checked for compatibility, in a registry key named `AppCompatCache`. Tools call it Shimcache. The answer key of the case uses it. Read it with care: the time that it stores for each program is the modified time of the program's file, not the time at which the program ran.

**Windows 8 and later.** The prefetch file stores the last eight run times, not one, and Windows keeps many more files. This is the largest difference from the image in this case.

**Windows 10 and 11.** Prefetch files are compressed. PECmd can read them only when it runs on Windows 8 or later, which your Windows VM is. Newer versions also add records that Windows 7 does not have, among them a registry key that notes the last run of each program for each user, and a database of how much each program used the network. They are valuable, and this image cannot show them.

**The tool.** PECmd reads one prefetch file or a whole folder and writes a CSV file with the program's name, the run count and the last run in UTC.
</details>

<div class="box key" markdown="1">

A prefetch file proves that a program ran on the computer, how often, and when it last ran. UserAssist ties a start to one account. They count different things, so their numbers can differ.

</div>

## 5. Files and folders opened: LNK files, jump lists and shellbags

### The idea

The last section answered "which programs ran". This one answers "which files and folders did the user open". Three artefacts do it, and all three exist because Windows tries to be helpful.

**The LNK file.** When a user opens a document, Windows makes a small shortcut to it in the user's `Recent` folder, so that the document can appear in a list of recent items. This shortcut is an {% include term.html t="lnk-file" %}. The user never asked for it and usually never sees it.

**The jump list.** Right-click a program on the taskbar of Windows 7 and a list of its recent files appears. That is a {% include term.html t="jump-list" %}. Windows keeps one file for each program, and inside it one entry for each document.

**The shellbag.** When a user opens a folder in Explorer, Windows remembers how the window looked: its size, its position, the kind of view. It stores this in the user's hive, one record for each folder. Such a record is a {% include term.html t="shellbag" %}.

### How it works

All three have one property that makes them precious in a leak case: **they stay when the thing they point to has gone.** The document may be deleted. The USB stick may be unplugged, formatted and taken away. The LNK file, the jump list entry and the shellbag are on the computer's own disk, and they stay there.

Follow the suspect on the morning of Tuesday 24 March. He has just connected his own USB stick, which Windows named drive `E:`. Times are UTC.

| Time (UTC) | Artefact | What it holds |
|---|---|---|
| 14:00:19 | Shellbag | The folder `E:\Secret Project Data` was opened in Explorer |
| 14:01:11 to 14:01:17 | Shellbags | Four folders inside it were opened, one after another: `technical review`, `proposal`, `progress`, `pricing decision` |
| 14:01:23 | Jump list | An entry for `E:\Secret Project Data\design\winter_whether_advisory.zip` |
| 14:01:29 | Jump list | An entry for a folder inside that same file |

Read the story in those rows. Two minutes after he connected the stick, he walked through the folders on it, one every few seconds. Then he opened one file. It carries the innocent name of a ZIP archive about the weather. But Windows recorded a folder inside it, and its real content is a presentation that he had renamed about ten minutes before. He was checking that the renamed files still opened.

In Session 2 you recovered those folders from that stick after he had given it a quick format. Today you find the same folder names on the computer, written before the format. Two exhibits now tell one story.

| | LNK file | Jump list | Shellbag |
|---|---|---|---|
| Records | A file that was opened | A file that was opened with one program | A folder that was opened in Explorer |
| Where | `C:\Users\informant\AppData\Roaming\Microsoft\Windows\Recent` | The folder `AutomaticDestinations` inside `Recent` | `UsrClass.dat` and `NTUSER.DAT` |
| Also holds | The full path of the target, its size, its times, and the name and serial number of the volume it was on | The same, for each entry | The name of the folder, and the times of the folder as Windows saw them |
| Tied to an account | Yes, it is in the user's profile | Yes | Yes |
| Does it prove that a file was copied? | No | No | No |

The last row matters. None of the three records a copy. A shellbag shows that a folder window was opened. A LNK file shows that a file was opened. That a file was copied to the stick is a conclusion that you build from several records: the folder names on the stick, the names in the {% include term.html t="change-journal" %} of the computer, and what you recovered from the stick itself.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A shellbag in a user's hive names the folder <code>F:\Tender 2015\Prices</code>. No drive <code>F:</code> exists on the computer today. What may the examiner report?</p>
  <ul class="qc-opts">
    <li data-key="a">That the user copied the folder to a removable drive</li>
    <li data-key="b">Nothing, because the folder cannot be examined</li>
    <li data-key="c">That a folder with this name, on a volume that was drive <code>F:</code> at the time, was opened in Explorer under this account</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The shellbag records that the folder window was opened, and it stays after the drive has gone. It does not record a copy, so (a) claims too much. Option (b) throws away a record that exists exactly because the device is no longer there.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Reading the times, and newer versions of Windows</summary>

**The two sets of times in a LNK file.** A LNK file is a file, so NTFS keeps times for it. As a rule, its created time is the first time the target was opened, and its modified time is the last time. Inside the LNK file there is a second set: the times of the target itself, as they were when it was last opened. Say in your report which set you mean.

**The volume serial number.** A LNK file stores the serial number of the volume that held the target. This is the number that the file system writes when a volume is formatted. It is not the serial number of the device, which section 6 teaches. A quick format gives the same stick a new volume serial number.

**The time of a shellbag.** Shellbags are registry data, so the rule of section 2 applies: the time that a tool shows as "first opened" or "last opened" is worked out from the last-write time of a key, and one key can cover several folders. Tools do this work well, and you should still treat a single shellbag time as close, not exact.

**Jump lists were new in Windows 7.** The image in this case is old enough that this artefact was only a few years old when the suspect used it. Each entry in a jump list is itself a complete LNK record.

**Two kinds of jump list.** The folder `AutomaticDestinations` holds the lists that Windows fills by itself. A second folder, `CustomDestinations`, holds lists that a program fills in its own way, such as the "most visited" pages of a browser.

**Windows 10 and 11.** All three artefacts exist and work in the same way. Windows 10 also added a database of the user's activity for a feature named Timeline. Windows 7 has nothing like it, and it is not in this image.

**The tools.** Eric Zimmerman's tools include LECmd for LNK files, JLECmd for jump lists and SBECmd for shellbags. In today's lab Plaso reads all three for you and puts them straight into the timeline.
</details>

<div class="box key" markdown="1">

LNK files, jump lists and shellbags record the files and folders that a user opened, and they stay when the file or the device has gone. They show that something was opened, never that it was copied.

</div>

## 6. One USB stick, several records

### The idea

The central question of a leak case is simple to ask: was a storage device that does not belong to the company connected to this computer, and when?

No single artefact answers it. Windows needs to do several jobs when a stick is plugged in: find a driver, give the stick a drive letter, show it to the user. Each job leaves its own record in its own place. Each record holds one piece of the answer.

The piece that joins them is the {% include term.html t="device-serial-number" %}: a number that the maker gives to one single device. The case has two sticks of exactly the same make and model. Read their numbers slowly.

| | The company's stick (exhibit RM#1) | The suspect's stick (exhibit RM#2) |
|---|---|---|
| Make and model | SanDisk Cruzer Fit | SanDisk Cruzer Fit |
| Device serial number | `4C530012450531101593` | `4C530012550531106501` |
| Name of the volume | `Authorized USB` | `IAMAN $_@` |

The two numbers begin with the same eight characters. They differ first at the ninth. An examiner who compares only the beginning will report one device where there were two.

### How it works

Here are the records that the suspect's stick left on the computer, with the question that each one answers.

| Record | Where | The question it answers | Clock |
|---|---|---|---|
| The key `USBSTOR` | `SYSTEM` hive, under `ControlSet001\Enum` | Which make, model and device serial number? | UTC |
| The file `setupapi.dev.log` | `C:\Windows\inf` | When was this device connected to this computer for the first time? | **Local time** |
| The key `MountedDevices` | `SYSTEM` hive | Which drive letter did the volume receive? | UTC |
| The key `MountPoints2` | The user's `NTUSER.DAT` | Under which account was the volume in use? | UTC |
| Event 20001 | `System` event log | When was the driver installed? | UTC |

{% include demo.html id="S05-D2" %}

Put together, they give one sentence that no single record could give: a SanDisk Cruzer Fit with the serial number `4C530012550531106501`, which is not the company's stick, was connected to this computer for the first time on Tuesday 24 March 2015, received the drive letter `E:`, and was in use under the account `informant`.

Look at the last column of the table once more. Four of the five records store UTC. One does not. The file `setupapi.dev.log` is a plain text file in which Windows notes each installation of a driver, and it writes the time that the clock of the computer showed. For the suspect's stick it reads:

```
>>>  Section start 2015/03/24 09:58:32
```

That is 09:58:32 by the clock in his office. Every other time on this page so far was in UTC. If you put this line into your timeline as it stands, the stick is connected at 09:58, more than three hours before Windows started at 13:21. Section 8 repairs this. The record is correct. It only speaks in a different clock.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The USB history shows the stick." | Name each record: "`USBSTOR` gives the serial number, `setupapi.dev.log` gives the first connection." | "USB history" is not one artefact. A reader must know which record gave which fact. |
| "The serial number in the LNK file" | "The volume serial number in the LNK file" | A device serial number names the stick. A volume serial number names one formatting of it. They are different numbers. |
| "The stick was removed at this time." | "The last record that involves the stick is at this time." | Windows 7 keeps no clear record of the moment at which a device was removed. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner has the make, model and device serial number of a stick from the key <code>USBSTOR</code>. Which other record must she read to say under which user account the stick was used?</p>
  <ul class="qc-opts">
    <li data-key="a">The file <code>setupapi.dev.log</code></li>
    <li data-key="b">The key <code>MountPoints2</code> in the hive of each user</li>
    <li data-key="c">The key <code>MountedDevices</code> in the <code>SYSTEM</code> hive</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). <code>USBSTOR</code>, <code>MountedDevices</code> and <code>setupapi.dev.log</code> all belong to the computer and name no account. Only a record in a user's own hive ties the volume to an account.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Limits on Windows 7, devices without a serial number, and newer versions</summary>

**First connection, and not much more.** `setupapi.dev.log` records the installation of the driver, which happens the first time a device is seen. Later connections of the same stick install nothing and write nothing there. For later connections on Windows 7 you depend on the last-write times of keys, with all the limits of section 2, and on the traces of use: shellbags, LNK files and jump lists that name the drive letter.

**Devices without a serial number.** Some cheap devices carry no serial number. Windows then makes one up. You can recognise it: its second character is `&`. Such a number is different on every computer, so it cannot be used to match the device to another machine.

**The same drive letter, different devices.** A drive letter is given to whatever is connected at the time. On this computer the letter `E:` was not reserved for one stick. Join records by the serial number or by the volume, never by the letter alone.

**Other places that name the volume.** The answer key of the case also uses a key of Windows Search that noted the volume name `IAMAN $_@` for drive `E:` two seconds after the connection, and a second device event, 20003.

**Windows 8 and later.** The key of each device holds extra values with the exact times of the last connection and the last removal. They answer directly what Windows 7 can only suggest. They are commonly taught as absent on Windows 7, so do not expect them in this image.

**Windows 10 and 11.** A further event log records each connection of a storage device, with details of its partitions. It does not exist on Windows 7.

**The stick's own file system.** The suspect's stick was formatted with FAT32. Session 2 taught that file system. FAT stores its file times in local time too, with no note of the zone. So the times that you recovered from the stick in Session 2 need the same care as `setupapi.dev.log`.
</details>

<div class="box key" markdown="1">

No single artefact gives the history of a USB device. Each record answers one question, and the device serial number joins them. One of them, `setupapi.dev.log`, records local time.

</div>

## 7. Browser, mail and cloud traces as sources of time

### The idea

Programs keep their own records too. This section treats them in one way only: as sources of dated events for the timeline. What the suspect and his contact wrote to each other, and how to read the technical header of an e-mail, belong to Session 14.

### How it works

| Program on the suspect's computer | The file that holds its records | What each record gives the timeline |
|---|---|---|
| Internet Explorer 11 | A database named `WebCacheV01.dat` in the user's profile | An address, and the time of the visit |
| Google Chrome | A database named `History` in the user's profile | An address, the title of the page, the time of the visit, and a separate list of downloads |
| Microsoft Outlook 2013 | One mail file for the account, with a name that ends in `.ost` | Each message with the time at which it was sent or received |
| Google Drive, the program for Windows | A text log and two small databases in the user's profile | Which files the program sent to the cloud or removed from it |

Three points make these records useful.

**A search is a visit.** When a user types words into a search engine, the words become part of an address, and the browser stores that address with the time. This is how you could read the suspect's searches in section 1, and why Autopsy listed them under **Web Search** in Session 4.

**Deleted is not gone, once more.** The answer key shows that the suspect deleted mail before he left. Some of those messages were still in the folder of deleted items, and one was recovered from unused space inside the mail file. The mail file behaves like a small file system of its own, and the lesson of Session 2 holds inside it.

**Every program chooses its own clock.** The two browsers store their times in UTC. A text log that a program writes for its own support staff often uses local time, as `setupapi.dev.log` does. You cannot know from the look of a time which clock wrote it. You find out from the documentation of the format, or by comparing one known event with a source whose clock you know.

Here is the end of the suspect's working day on Tuesday 24 March, from three programs and Windows itself. Times are UTC.

| Time (UTC) | Source | Event |
|---|---|---|
| 21:05:09 | Outlook mail file | A message with the subject `Done` was sent |
| 21:05:38 | Prefetch | `CHROME.EXE` started, for the last time on this computer |
| 21:06:50 | Chrome `History` | A search for `security checkpoint cd-r` |
| 21:07:25 | Security event log | The user logged off (4647) |

Four records, from four different makers, inside two and a half minutes. He reports that the job is done, opens the browser, and asks the internet whether a CD will pass the security check at the door. Then he goes home. No single source tells that. The order does.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A program writes a text log on a Windows computer. Each line begins with a time such as <code>2015-03-23 16:32:10</code>, with no zone. How does an examiner decide which clock wrote it?</p>
  <ul class="qc-opts">
    <li data-key="a">From the documentation of the log, or by comparing one known event in it with a source whose clock is known</li>
    <li data-key="b">It is UTC, because Windows stores all times in UTC</li>
    <li data-key="c">It is local time, because a person is meant to read it</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Options (b) and (c) are both guesses, and each is right for some logs and wrong for others. A time with no zone has to be tested, and the report says how it was tested.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How the browsers count time, chat programs, and what belongs to Session 14</summary>

**Different starting points.** Chrome stores a time as the number of microseconds since the first day of the year 1601, in UTC. Many other programs count seconds from the first day of 1970. Windows itself counts steps of one ten-millionth of a second from 1601. Your tools convert all of these. You need to know only that a raw number in a database is not a mistake: it is a count from some starting day.

**Private browsing and cleaning.** A private window writes no history. A cleaning tool can empty the history. Neither removes the other artefacts of this session, which is why a prefetch file can show that a browser ran at a time for which the history is empty.

**Chat programs.** The part of the case's answer key that the unit has read shows no chat program on this computer, so this page teaches none. Where one exists, treat it exactly as the programs above: find the file that holds its records, usually a small database in the user's profile, and find out which clock it uses. Session 15 meets chat records again on the suspect's phone.

**The cloud program.** The log of the Google Drive program is a text file. Test its clock before you merge it, as the third point above says. What reached the cloud, and what can be found there, is the subject of Sessions 11 to 13.

**What Session 14 adds.** The header of an e-mail holds times that mail servers wrote, on clocks that the suspect could not touch. They let you test whether the clock of his computer was right. That check belongs to Session 14.
</details>

<div class="box key" markdown="1">

Browsers, mail and cloud programs give the timeline dated events of their own. Each program chooses its clock, so test it before you merge.

</div>

## 8. One clock: normalise every source to UTC

### The idea

You now have times from the registry, the event logs, prefetch files, shellbags, jump lists, a text log and two browsers. To see the order of events you must put them into one list. Before you may do that, they must all speak in the same clock.

Try it without that step. Take four records from the morning of 24 March, exactly as their sources give them, and sort them.

| Time as recorded | Source | Event |
|---|---|---|
| 09:58:32 | `setupapi.dev.log` | The suspect's USB stick is connected for the first time |
| 13:21:29 | Security event log | Windows starts |
| 13:56:20 | Change journal | The last of twenty confidential files is renamed |
| 14:00:19 | Shellbag | The folder `E:\Secret Project Data` is opened |

This list says that the stick was connected three hours before the computer was switched on, and four hours before the folder on it was opened. It also says that he connected the stick long before he had prepared the files. Each of these is impossible or absurd. A defence lawyer needs to find only one such line to make a court doubt the whole timeline.

Nothing in the evidence is wrong. Three sources recorded UTC, and one recorded the {% include term.html t="local-time" %} of the office. Changing every time to one common clock before events are compared is called {% include term.html t="normalisation" %}. In digital forensics the common clock is UTC. The rule has a name that you must know: **normalise every source to UTC before you merge.**

### How it works

**Step 1. Read the time zone from the image itself.** Do not take it from the address of the company, from the case notes or from your own computer. The suspect's computer says how its clock was set, in the key that section 2 showed:

```
SYSTEM\ControlSet001\Control\TimeZoneInformation
    TimeZoneKeyName    Eastern Standard Time
    Bias               300
    DaylightBias       -60
    ActiveTimeBias     240
```

The numbers are minutes, and Windows defines them with one line: **UTC = local time + bias.** `Bias` is the normal difference: 300 minutes, five hours. `DaylightBias` is the change during {% include term.html t="daylight-saving-time" %}: minus 60 minutes. `ActiveTimeBias` is the one in force when the hive was last written: 240 minutes, four hours.

So in the last days of March 2015 the clock of this computer was four hours behind UTC. The {% include term.html t="time-zone-offset" %} is written UTC-4.

**Step 2. Find the sources that do not record UTC.** In this session there is one in the lab evidence: `setupapi.dev.log`. Section 6 marked it, and section 7 told you how to test any other.

**Step 3. Convert those sources, and only those.**

```
local time      2015-03-24 09:58:32   (UTC-4)
add the bias    + 4 hours
UTC             2015-03-24 13:58:32
```

**Step 4. Merge and sort.**

| Time (UTC) | Source | Event |
|---|---|---|
| 13:21:29 | Security event log | Windows starts |
| 13:56:20 | Change journal | The last of twenty confidential files is renamed |
| 13:58:32 | `setupapi.dev.log`, converted from local time | The suspect's USB stick is connected for the first time |
| 14:00:19 | Shellbag | The folder `E:\Secret Project Data` is opened |

{% include demo.html id="S05-D3" %}

Now the list tells a story that a person could really have lived. He finishes the renaming. Two minutes later he connects his own stick. Two minutes after that he is looking at the folder on it. The timeline became believable at the moment when all four times shared a clock.

<div class="box metaphor" markdown="1">

**The comparison.** Merging sources with different clocks is like taking statements from witnesses who phoned in from different cities. One says "I saw him at ten", another "at two in the afternoon". Both looked at an honest watch. You cannot put their statements in order until you have changed every time to the time of one city.

**Why it fits.** Each witness is a source. Each watch is the clock that the source uses. The time of one chosen city is UTC. The change you make is the time zone offset. And as with witnesses, the correction does not touch what they saw. It only makes their statements comparable.

**Where it breaks.** A witness can tell you which city she was in. A time in a file usually carries no zone at all: `09:58:32` looks the same in every clock, and you must find the zone from another record. Also, people's watches are a few minutes apart at most. A computer's clock can be wrong by hours or years, by accident or on purpose. Normalising corrects the zone. It does not prove that the clock was right.

**So what.** Before you merge, write down for every source which clock it uses and how you know. Convert the local sources with the offset that the image gives. Keep the original time beside the converted one, so that anyone can check your arithmetic.

</div>

**How to write a time in a report.** Give UTC first and say so. Add the local time in brackets when it helps the reader, with the offset: "13:58:32 UTC (09:58:32 local time, UTC-4)". Give the source of the time. A time without a zone and without a source cannot be checked, and a careful reader will not accept it.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "At 09:58 the stick was connected." | "At 13:58:32 UTC (09:58:32 local time, UTC-4), according to `setupapi.dev.log`" | A time needs its zone and its source. |
| "The computer was in the Eastern time zone, so I subtracted five hours." | "The image gives an active bias of 240 minutes for these dates, so the offset is UTC-4." | The normal offset of that zone is five hours. In late March daylight saving time was in force. The image tells you which applies. |
| "I converted all the times to UTC." | "I converted the one local-time source. The others were already in UTC." | Converting a source that is already in UTC moves its events by hours, in the wrong direction. This mistake is as common as forgetting to convert. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A text log on a computer records local time. The registry of the same computer gives an active bias of -330 minutes. The log shows an event at 14:00:00. What is the time in UTC?</p>
  <ul class="qc-opts">
    <li data-key="a">19:30:00, because 330 minutes are added</li>
    <li data-key="b">14:00:00, because the log is already in UTC</li>
    <li data-key="c">08:30:00, because UTC is the local time plus the bias, and the bias is negative</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). UTC = local time + bias = 14:00 + (-5 hours 30 minutes) = 08:30. A negative bias means that the clock is ahead of UTC, as it is in Colombo (UTC+5:30). Option (a) has the right size and the wrong direction, which is the mistake that this section warns about.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Daylight saving, wrong clocks and other local-time sources</summary>

**The offset can change inside one case.** In 2015, daylight saving time in the eastern United States began on 8 March. All the events of this case fall after that day, so one offset, UTC-4, serves for all of them. In a case that runs across such a day, the same computer has two offsets, and each local time must be converted with the one that was in force on its own date. `ActiveTimeBias` shows only the offset at the last write of the hive.

**The setting can be changed.** A user can change the time zone of a computer, and the key keeps only the present setting. Its last-write time tells you when the setting last changed. Check it.

**Was the clock right?** Normalising assumes that the clock showed the correct time for its zone. Test that against a clock the user did not control: the time that a mail server wrote into a message, or the time that a web server sent with a page. Session 14 does this with the suspect's mail. If the clock was wrong by a fixed amount, say so in the report and give both the recorded time and the corrected one.

**When the clock was changed on purpose.** Windows can record a change of the system time as event 4616 in the Security log, with the old and the new time. A person who sets the clock back to give a file a false date leaves that event, and records around it that run backwards.

**Other local-time sources you will meet.** FAT file systems, and so most small USB sticks and memory cards. Many text logs of programs. Times that a person typed. Text that a program shows to its user, such as the "sent at 3:19 PM" line that a mail program copies into a reply.

**Tools make the same choice for you.** Session 4 noted that `istat` prints times in the zone of your VM unless you ask for UTC. Timeline Explorer, Autopsy and spreadsheets each have a setting. A tool that quietly shows you local time, on a VM whose own clock is set to yet another zone, produces the mixed list at the top of this section. Set every tool to UTC and leave it there.
</details>

<div class="box key" markdown="1">

Normalise every source to UTC before you merge. Read the time zone offset from the image itself, convert only the sources that record local time, and keep the original time beside the converted one.

</div>

## 9. The super-timeline: what it adds and what it buries

### The idea

So far you have picked your records by hand: this key, that prefetch file, those four shellbags. There is another way. A tool can read every kind of record that it understands on the whole system, normalise each time to UTC, and write all of it into one list. That list is a {% include term.html t="super-timeline" %}.

The tool in this module is Plaso. Its first program, `log2timeline`, reads the evidence and stores every event that it finds. Its second, `psort`, sorts the events and writes them out. In Kali each command carries the prefix `plaso-`. For one office computer the result has hundreds of thousands of rows, and often millions.

<div class="box key" markdown="1">

A system records far more than its user intends. The timeline is the machine's testimony.

</div>

Read that sentence as a lawyer would. Testimony is what a witness says about what happened. It is valuable, and it is never accepted without questions. Who is speaking? What exactly did they see? Could they be mistaken? The same questions apply to every row.

### How it works

{% include demo.html id="S05-D4" %}

**What a super-timeline adds.**

| It adds | Example from the case |
|---|---|
| **Order across sources.** Events that no single artefact holds together appear side by side | The mail, the browser, the search and the logoff at the end of 24 March, in section 7 |
| **Agreement.** Two independent records of the same moment | The shutdown on 25 March, in the registry and in the event log, five seconds apart |
| **What you did not think to look for.** You asked about USB sticks. The rows around your answer show what else happened in those minutes | The renames in the minutes before the stick was connected |
| **Gaps.** A stretch with no events at all, in the middle of a busy day, is a question | A cleaned history, or a computer that was switched off |

**What it buries.**

| It buries | What that means for you |
|---|---|
| **The few rows that matter, under the many that do not.** Windows itself is the busiest user of any computer | You must filter, and every filter is a decision that you must be able to defend |
| **The meaning of each time.** In one sorted column, a "last run", a "key last changed" and a "file created" look the same | Read the column that says what each time means, on every row that you use |
| **What the tool could not read.** A source that the tool does not understand gives no rows and no warning | "Nothing in the timeline" is not "nothing happened" |
| **The parts of the evidence that were not collected.** A timeline of a small collection is silent about everything outside it | Know what your collection holds before you trust a gap |

The last row is today's lab in one line. A full image of the suspect's computer takes far too long to process in a lab session. So the unit prepared a {% include term.html t="triage-collection" %}: a small, chosen set of files copied from the image, namely the hives, the event logs, the prefetch folder, the user's recent items, the browser databases and a few system files. You build your own super-timeline from that set, and you compare it with the one that the unit built from the whole image.

<div class="box metaphor" markdown="1">

**The comparison.** A super-timeline is like playing the recordings of every security camera in a building on one screen, in the order of their time stamps.

**Why it fits.** Each camera is a source that watches one place: the door, the corridor, the car park. Alone, each shows a fragment. In one sequence you can follow a person from the door to the office and out again, and you notice the camera on which he should have appeared and did not. Most of the footage shows empty corridors, as most rows show Windows at work.

**Where it breaks.** A camera records all the time, so an empty picture proves that nobody was there. An artefact records only when its own trigger fires: a program starts, a key changes, a folder window opens. Silence in a timeline proves nothing. And a camera shows what happened, while a row shows what one program wrote down about it, in its own words and for its own purpose.

**So what.** Use the super-timeline to find the order and the surprises. Then go back to the artefact behind each row that you rely on, and confirm it with the tool made for that artefact. In your report, cite the artefact, not "the timeline".

</div>

**A working method.** Experienced examiners do not read a super-timeline from the top.

1. **Start from an anchor.** One event that you trust and understand: here, the first connection of the suspect's stick.
2. **Open a window around it.** A few minutes before and after. Read every row.
3. **Follow the leads.** A file name, a folder, a program in that window becomes the next thing to search for.
4. **Write down each filter** that you used, so that another examiner can repeat your steps and so that you know what you chose not to see.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner filters a super-timeline for rows that contain the word "Secret" and reads the 40 rows that remain. Her report says that the timeline shows no connection of a USB device. What is wrong?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing: if a device had been connected, the timeline would show it</li>
    <li data-key="b">The row for the connection names a device, not a folder, so her own filter removed it</li>
    <li data-key="c">A super-timeline cannot contain USB records</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A filter shows what matches and hides everything else without saying so. The row from <code>setupapi.dev.log</code> holds the make and the serial number of the stick and does not contain the word "Secret". She reported the result of her filter as if it were the result of the evidence.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Plaso's parts, its time zone option, and other tools</summary>

**Parsers.** Plaso reads each kind of record with a small part named a parser. You can choose a set of them. The set `win7` covers the artefacts of this session. A larger set, `win7_slow`, also reads every record of the master file table and takes much longer. That is one reason why the full-image timeline was built before the session.

**The time zone option.** Plaso stores every time in UTC. For a source that records local time, it must know the zone. When it reads a whole image, it finds the zone in the registry by itself. When it reads a folder of collected files, you give the zone with the option `--timezone`. In the lab you will see the same line of `setupapi.dev.log` come out four hours apart, with and without that option. A tool that normalises for you still needs the right offset from you.

**The times of collected files.** A file copied out of an image has new file-system times: those of the copying. The lab switches off the parser that would put those times into the timeline, because they describe the unit's work and not the suspect's.

**What the storage file is.** `log2timeline` writes its events into one file with a name that ends in `.plaso`. It is a database. The program `pinfo` prints what is in it: how many events each parser found, and any warnings.

**Timeline Explorer.** A viewer for large CSV files from Eric Zimmerman's tools. It sorts, filters and groups by any column, and it does not change the file.

**Timesketch.** A web application in which a team can search, tag and comment on timelines together. It needs a server and more memory than a student laptop has, so the lecturer shows it from the front.

**The change journal.** Session 4 named `$UsnJrnl` as a third witness inside NTFS. In today's lab it gives you the twenty renames, each with its old name, its new name and its time in UTC. You read it with MFTECmd, the tool that Session 4 promised.
</details>

## 10. The lab: the day the documents left

Your task: read the time zone from the image, build a super-timeline from a triage collection of the suspect's computer, examine the main artefacts with the tool made for each, and hand in a timeline of the exfiltration day, Tuesday 24 March 2015, in UTC.

You work first in the Kali VM, then in the Windows VM. Steps 1 to 4 are done at the start of the session, before the concept sections, because step 4 starts a long job that runs while you learn. Allow about one hour and forty minutes for the rest. If your host machine can run only one VM at a time, finish Parts A and B in Kali, shut it down, and then start Windows.

<div class="box lms" markdown="1">

The triage collection, the unit's full timeline, the two helper scripts, the form for your key events, the evidence register and a blank custody record are in folder `S05` on the lab share. The installer of the .NET 9 Desktop Runtime is in the `Tools` folder. If you are studying away from the lab, the LMS explains how to get the same files.

</div>

**The items.** Keep every file name exactly as it is.

| Exhibit | Files | What it is |
|---|---|---|
| `S05-001` | `cfreds_2015_data_leakage_pc.E01` to `.E04` | The image of the suspect's computer, from the NIST CFReDS Data Leakage Case. The same evidence as exhibit `S02-001`. You do not open it today |
| `S05-002` | `s05-triage.zip` | The unit's triage collection: files copied out of exhibit `S05-001`, in their original folders under `s05-triage/C` |
| `S05-003` | `s05-full-image.plaso` and `s05-full-timeline.csv` | The super-timeline that the unit built from the whole of exhibit `S05-001`, as a Plaso storage file and as a CSV file of the days of the case |

**Three more files from the unit.**

- `s05-tools.py` runs in Kali. It converts one local time to UTC, and it changes the CSV file that Plaso writes into the unit's timeline format.
- `s05-finish.ps1` runs in Windows. It adds your key events to the timeline and writes the final file.
- `s05-key-events.csv` is the form for the events that you find yourself.

**The unit's timeline format.** Every timeline that leaves this lab has the same seven columns. Session 8 will read your file, so the names and the order are fixed.

| Column | Content | Example |
|---|---|---|
| `timestamp_utc` | The time in UTC, always in this form, ending in `Z` | `2015-03-24T13:58:32Z` |
| `timestamp_desc` | What the time means | `First connection` |
| `source` | The evidence file that holds the record | `C/Windows/inf/setupapi.dev.log` |
| `artefact` | The kind of record | `setupapi log` |
| `description` | What happened, in one line | `SanDisk Cruzer Fit, serial 4C530012550531106501, driver installed` |
| `original_zone` | The clock that the source used: `UTC`, or `local (UTC-4)` | `local (UTC-4)` |
| `tag` | A mark of your own. It may be empty | `key-event` |

### Part A: at the start of the session, in Kali

1. In the Kali VM, open a terminal. Create two folders, copy the files from the lab share, and verify the triage collection against the evidence register:

   ```bash
   mkdir -p ~/evidence/s05 ~/cases/s05
   cp /media/sf_nb6018/S05/* ~/evidence/s05/
   cd ~/evidence/s05
   sha256sum s05-triage.zip
   ```

   <div class="box expect" markdown="1">

   One SHA-256 value. It equals the value for exhibit `S05-002` in `s05-evidence-register.md`. Write entry 1 and entry 2 in the custody record: received, and verified on receipt.

   </div>

   <div class="box trouble" markdown="1">

   If Kali says "Permission denied" for `/media/sf_nb6018`, the shared folder is not set up for your user: repeat the last part of Step 5 in Session 0. If the value does not match, copy the file again. If it still differs, tell the lecturer and do not continue.

   </div>

2. Unpack the collection and protect it:

   ```bash
   unzip -q s05-triage.zip
   chmod -R a-w s05-triage
   ls s05-triage/C s05-triage/C/Windows/System32/config
   ```

   <div class="box expect" markdown="1">

   Under `s05-triage/C` you see folders such as `Windows` and `Users`, and files whose names begin with `$`, among them `$MFT`. The folder `config` holds the hives `SYSTEM`, `SOFTWARE`, `SAM` and `SECURITY`.

   </div>

   <div class="box trouble" markdown="1">

   If `unzip` reports that a file already exists, you unpacked before. Answer `N`. To start again, run `chmod -R u+w s05-triage`, delete the folder `s05-triage`, and unpack once more.

   </div>

3. Read the time zone from the image itself. RegRipper runs one plugin against one hive:

   ```bash
   cd ~/cases/s05
   regripper -r ~/evidence/s05/s05-triage/C/Windows/System32/config/SYSTEM -p timezone | tee timezone.txt
   ```

   <div class="box expect" markdown="1">

   The output names the key `TimeZoneInformation` with its last-write time, and lists `TimeZoneKeyName`, `Bias`, `DaylightBias` and `ActiveTimeBias`. Read the active bias. It is 240 minutes, which is four hours. Write into your notes: "Offset in force: UTC-4. Source: `SYSTEM` hive, key `TimeZoneInformation`."

   </div>

   <div class="box trouble" markdown="1">

   If Kali says that `regripper` is not found, install it with `sudo apt install regripper`. If the plugin prints a bias in hours and not in minutes, the meaning is the same. If your value is not four hours, stop and tell the lecturer before you go on: every later step depends on it.

   </div>

4. Start the long job. Plaso reads the whole collection and stores every event that it finds. Give it the time zone that you have just read:

   ```bash
   plaso-log2timeline --unattended --parsers 'win7,!filestat' --timezone America/New_York \
     --storage_file triage.plaso ~/evidence/s05/s05-triage
   ```

   <div class="box expect" markdown="1">

   A status display appears, with one line for each worker and a number of events that grows. Leave the terminal open and do not close the VM. The job runs while the lecturer teaches the concept sections. It ends with the words `Processing completed`.

   </div>

   <div class="box trouble" markdown="1">

   If Kali says that `plaso-log2timeline` is not found, install Plaso with `sudo apt install plaso`. If Plaso says that the storage file already exists, delete `triage.plaso` and start again. `America/New_York` is the name that Plaso uses for the zone that Windows calls Eastern Standard Time, with its daylight saving rule.

   </div>

### Part B: the timeline, in Kali

{:start="5"}
5. When the job has ended, ask Plaso what it found:

   ```bash
   plaso-pinfo triage.plaso | less
   ```

   <div class="box expect" markdown="1">

   A report. Find the table "Events generated per parser". It lists, among others, `winevtx` for the event logs, `prefetch`, `lnk`, and the names of several registry plugins, such as `bagmru` and `userassist`. Write the total number of events into your notes. Press `q` to leave.

   </div>

   <div class="box trouble" markdown="1">

   If the report shows warnings, read them. A warning names a file that a parser could not read completely. That is normal for one or two files, and it is exactly the third row of "what it buries" in section 9.

   </div>

6. Write the events out as one sorted CSV file:

   ```bash
   plaso-psort -o dynamic -w triage-timeline.csv triage.plaso
   head -3 triage-timeline.csv
   wc -l triage-timeline.csv
   ```

   <div class="box expect" markdown="1">

   The first line is the header, with eight column names:

   ```
   datetime,timestamp_desc,source,source_long,message,parser,display_name,tag
   ```

   Every time ends in `+00:00`, which means UTC. The number of lines is the number of events plus one.

   </div>

   <div class="box trouble" markdown="1">

   If the first rows show dates that are clearly wrong, such as the year 1601 or 1970, do not worry. Some records hold an empty time, and Plaso shows the starting day of the count. Step 9 leaves these rows out.

   </div>

7. Now see section 8 with your own eyes. Run Plaso once more, on the one folder that holds `setupapi.dev.log`, and this time give it no time zone:

   ```bash
   plaso-log2timeline --unattended --parsers text/setupapi \
     --storage_file setupapi-no-zone.plaso ~/evidence/s05/s05-triage/C/Windows/inf
   plaso-psort -o dynamic -w setupapi-no-zone.csv setupapi-no-zone.plaso
   grep -h 4C530012550531106501 setupapi-no-zone.csv triage-timeline.csv | cut -c1-110
   ```

   <div class="box expect" markdown="1">

   The same lines of the log appear twice, for the suspect's stick. From the file without a zone, the first connection is at `2015-03-24T09:58:32`. From your timeline it is at `2015-03-24T13:58:32`. Both end in `+00:00`. The first is wrong by four hours: Plaso had no zone, so it treated a local time as UTC. Write both values into your notes, with one sentence that says which is right and why.

   </div>

   <div class="box trouble" markdown="1">

   If `grep` prints nothing, check the serial number: it has twenty characters and its ninth is `5`. If it prints lines from one file only, look for the serial number of the stick with `grep -i cruzer` and compare.

   </div>

8. Read the USB records in the registry with RegRipper, and the programs that the user started:

   ```bash
   regripper -r ~/evidence/s05/s05-triage/C/Windows/System32/config/SYSTEM -p usbstor | tee usbstor.txt
   regripper -r ~/evidence/s05/s05-triage/C/Windows/System32/config/SYSTEM -p mountdev | tee mountdev.txt
   regripper -r ~/evidence/s05/s05-triage/C/Users/informant/NTUSER.DAT -p userassist | tee userassist.txt
   ```

   <div class="box expect" markdown="1">

   `usbstor.txt` names the SanDisk Cruzer Fit twice, with two serial numbers that differ at the ninth character. `mountdev.txt` lists the drive letters and the volumes behind them. `userassist.txt` lists programs with a count and a last run in UTC, newest first. Near the top are the programs of the suspect's last morning, among them Eraser.

   </div>

   <div class="box trouble" markdown="1">

   If a plugin prints nothing, check the path of the hive: the first two commands read `SYSTEM`, the third reads the user's own `NTUSER.DAT`. If RegRipper labels a time for the USB device as "last arrival" or "last removal" and shows no value, that is expected on Windows 7. Section 6, deeper layer, says why.

   </div>

9. Change your timeline into the unit's format, keep the days of the case, and write the result to the shared folder:

   ```bash
   python3 ~/evidence/s05/s05-tools.py convert triage-timeline.csv /media/sf_nb6018/s05-timeline-utc.csv
   python3 ~/evidence/s05/s05-tools.py check /media/sf_nb6018/s05-timeline-utc.csv
   ```

   <div class="box expect" markdown="1">

   The first command prints how many rows it wrote, how many fell outside the days from 22 to 25 March 2015, and a count for each artefact. It also prints how many rows come from a source that records local time: these are the rows of `setupapi.dev.log`. The second command ends with "the file has the unit's timeline format". Write a custody entry: you created `triage.plaso`, `triage-timeline.csv` and `s05-timeline-utc.csv` from exhibit `S05-002`, with the tool and its version from `plaso-log2timeline --version`.

   </div>

   <div class="box trouble" markdown="1">

   If the script says that a column is missing, you ran `plaso-psort` with other options: repeat step 6 exactly. If Kali cannot write to `/media/sf_nb6018`, write the file to `~/cases/s05` and copy it across through your host machine.

   </div>

   If your host machine can run only one VM, shut Kali down now.

### Part C: one tool for each artefact, in Windows

{:start="10"}
10. Start the Windows VM. Create `C:\Evidence\S05` and `C:\Cases\S05`. Copy everything from `\\VBOXSVR\nb6018\S05` into `C:\Evidence\S05`, extract `s05-triage.zip` there, and set the extracted folder to read-only. Then install the .NET 9 Desktop Runtime from `C:\Tools` with the default choices.

    <div class="box expect" markdown="1">

    `C:\Evidence\S05\s05-triage\C` holds the same folders as in Kali. The installer ends with "Installation was successful". Eric Zimmerman's programs with a window, Registry Explorer and Timeline Explorer, need this runtime, and they do not start without it.

    </div>

    <div class="box trouble" markdown="1">

    If Windows cannot find `\\VBOXSVR`, see Step 5 of Session 0. If a tool later says that it needs ".NET Desktop Runtime", this installation did not finish: run the installer again. If the folder `C:\Tools\EZTools` is missing, copy the `Tools` folder from the lab share again.

    </div>

11. In the folder `C:\Tools\EZTools\RegistryExplorer`, start `RegistryExplorer.exe`. Choose **File**, **Load hive**. Go to `C:\Evidence\S05\s05-triage\C`, then to `Windows\System32\config`, and open the hive `SYSTEM`. In the tree, go to `ControlSet001`, `Control`, `TimeZoneInformation`. Then load the hive `NTUSER.DAT` from the folder `Users\informant` of the collection, and go to `Software`, `Microsoft`, `Windows`, `CurrentVersion`, `Explorer`, `RunMRU`.

    <div class="box expect" markdown="1">

    For the first key you see the same four values that RegRipper printed in step 3, and one last-write time for the whole key. Two tools now agree on the offset. For `RunMRU` you see the values `a`, `b` and `MRUList`, and again one last-write time: `2015-03-23 20:23:28`. Write into your notes which value that time belongs to, and what the key cannot tell you about the other one.

    </div>

    <div class="box trouble" markdown="1">

    If Registry Explorer says that the hive is "dirty" and offers to add the transaction logs, accept, and save the updated hive into `C:\Cases\S05` when it asks. Section 2, deeper layer, explains why. Note it in your custody record. If the time is shown in another zone, open **Options** and set the display to UTC.

    </div>

12. Open PowerShell and read every prefetch file with PECmd:

    ```powershell
    cd C:\Tools\EZTools
    .\PECmd.exe -d C:\Evidence\S05\s05-triage\C\Windows\Prefetch --csv C:\Cases\S05 --csvf prefetch.csv
    ```

    In the folder `C:\Tools\EZTools\TimelineExplorer`, start `TimelineExplorer.exe` and open `C:\Cases\S05\prefetch.csv`. Type `eraser` into the filter line under the column `ExecutableName`.

    <div class="box expect" markdown="1">

    Two rows: the installer, with a run count of 1, and `ERASER.EXE`, with a run count of 2 and a last run of `2015-03-25 15:13:30`. Compare with `userassist.txt` from step 8, which gives a count of 1 and a last run one minute earlier. You have now read both columns of the table in section 4 from the evidence yourself.

    </div>

    <div class="box trouble" markdown="1">

    If PECmd writes two CSV files, open the one whose name ends in `prefetch.csv` and not the one with `_Timeline` in its name. If the columns named `PreviousRun` are empty, that is correct: Windows 7 stores only the last run.

    </div>

13. Read the event logs with EvtxECmd, and find the frame of the exfiltration day:

    ```powershell
    .\EvtxECmd\EvtxECmd.exe -d C:\Evidence\S05\s05-triage\C\Windows\System32\winevt\Logs --csv C:\Cases\S05 --csvf eventlogs.csv
    ```

    Open `eventlogs.csv` in Timeline Explorer. In the column `Channel` filter for `Security`. In the column `EventId` choose 4608, 4647 and 1100. Sort by `TimeCreated` and find 24 March 2015.

    <div class="box expect" markdown="1">

    On 24 March: one start of Windows at `13:21:29`, one logoff by the user at `21:07:25`, and the end of logging one second later. The start and the end of logging are the frame. Every key event that you report for this day must lie between them.

    </div>

    <div class="box trouble" markdown="1">

    If EvtxECmd is in `C:\Tools\EZTools` directly and not in a folder of its own, leave out `EvtxECmd\` in the command. The tool takes several minutes: it reads every log in the folder. If you add 4624 to the filter, you will see many more rows. Read the account name and the logon type of each before you count it as a person.

    </div>

14. Read the change journal with MFTECmd. The file name begins with a dollar sign, so the path stands in single quotes:

    ```powershell
    .\MFTECmd.exe -f 'C:\Evidence\S05\s05-triage\C\$Extend\$J' --csv C:\Cases\S05 --csvf usnjrnl.csv
    ```

    Open `usnjrnl.csv` in Timeline Explorer. In the column `UpdateReasons` filter for `Rename`. Sort by `UpdateTimestamp` and go to 24 March 2015, between 13:49 and 13:57.

    <div class="box expect" markdown="1">

    Pairs of rows, each pair one second apart or less: one with the reason `RenameOldName` and the name of a confidential document, the next with `RenameNewName` and an innocent name. The first pair of that morning turns a presentation into `winter_whether_advisory.zip` at `13:49:51`. The last is at `13:56:20`. Count the pairs that give a new name to a document under `Secret Project Data`: there are twenty. Other rows with a rename in that period belong to Windows and to programs. In Session 2 you saw the new names on the stick. Here is the minute at which each was given.

    </div>

    <div class="box trouble" markdown="1">

    If PowerShell says that the path was not found, check that you used single quotes, not double quotes: inside double quotes PowerShell reads `$J` as a variable. If the journal shows no renames for that morning, clear the other filters first.

    </div>

### Part D: read the super-timeline

{:start="15"}
15. In Timeline Explorer, open your own timeline, `\\VBOXSVR\nb6018\s05-timeline-utc.csv`. Type `2015-03-24T14:0` into the filter line of the column `timestamp_utc`, so that you see the minutes from 14:00 to 14:09. Then type `shellbag` into the filter of the column `artefact`.

    <div class="box expect" markdown="1">

    A short list of folders on drive `E:`, opened one after another from `14:00:19`: `Secret Project Data`, and the folders inside it. This is the table of section 5, from your own timeline. Clear the filter on `artefact` and read every row of those ten minutes. Note any row that is not a shellbag and that names drive `E:`.

    </div>

    <div class="box trouble" markdown="1">

    If the list is empty, check that the filter on the time has no space in it. If you see shellbags but the descriptions are long, widen the column `description` or move the mouse over a cell.

    </div>

16. Use the anchor method of section 9. Clear all filters. In the column `artefact` filter for `setupapi log`, and find the first connection of the suspect's stick. Note its time. Clear the filter, and show only the window from five minutes before that time to five minutes after it.

    <div class="box expect" markdown="1">

    The anchor is at `2015-03-24T13:58:32Z`, and its column `original_zone` says `local (UTC-4)`: your timeline remembers that this time was converted. The window around it holds rows from several artefacts. Which artefacts appear depends on what the collection holds: write down which ones you see, and which you expected and do not see.

    </div>

    <div class="box trouble" markdown="1">

    Timeline Explorer filters text, so a window of time is easiest in two steps: filter `timestamp_utc` for `2015-03-24T13:5`, read, then filter for `2015-03-24T14:0`.

    </div>

17. Open the unit's full timeline, `C:\Evidence\S05\s05-full-timeline.csv`, in a second tab. Compare the number of rows with your own. Then apply the same window as in step 16.

    <div class="box expect" markdown="1">

    The full timeline has many times more rows than yours, because it was built from the whole image with a larger set of parsers. In the same ten minutes it shows rows that your collection could not give, above all the records of the master file table for the files themselves. Write two sentences into your notes: one thing that the full timeline added, and one way in which it made the window harder to read.

    </div>

    <div class="box trouble" markdown="1">

    If the file opens slowly, wait: it is large. If your VM runs out of memory, close the other tabs of Timeline Explorer first.

    </div>

### Part E: the timeline of the exfiltration day

{:start="18"}
18. Copy `C:\Evidence\S05\s05-key-events.csv` to `C:\Cases\S05`, remove its read-only mark, and open it in Notepad. It holds the header row and one example. Replace the example with your own findings: at least ten events of Tuesday 24 March 2015, one line for each, in the seven columns of the unit's format. Leave the column `tag` empty.

    Your events must include all of these:

    - the start of Windows and the logoff of the user, from the event log;
    - the first and the last of the twenty renames, from the change journal;
    - the first connection of the suspect's stick, from `setupapi.dev.log`, converted to UTC and marked `local (UTC-4)`;
    - the opening of the folder on the stick, from a shellbag;
    - the opening of a file on the stick, from a jump list;
    - the last run of a program that day, from a prefetch file.

    Find the rest yourself, in your timeline or with the tools of Part C.

    <div class="box expect" markdown="1">

    A line of your file looks like this, with commas between the columns and no spaces around them:

    ```
    2015-03-24T13:58:32Z,First connection,C/Windows/inf/setupapi.dev.log,setupapi log,SanDisk Cruzer Fit serial 4C530012550531106501 driver installed,local (UTC-4),
    ```

    Every time lies inside the frame from step 13. Every `source` names a file of the collection, so that another examiner can find your record again.

    </div>

    <div class="box trouble" markdown="1">

    If a description needs a comma, put the whole description inside double quotes. If one of your times lies outside the frame of the day, do not delete it: find out which clock wrote it. That is the question of section 8.

    </div>

19. Add your key events to the timeline and write the final file:

    ```powershell
    powershell -ExecutionPolicy Bypass -File C:\Evidence\S05\s05-finish.ps1
    ```

    <div class="box expect" markdown="1">

    The script prints the number of rows from Plaso, the number of your key events, and the SHA-256 value of the final file. It writes `s05-timeline-utc.csv` to the shared folder and a copy to `C:\Cases\S05`. Your rows are now in the timeline, sorted into place, with the tag `key-event`.

    </div>

    <div class="box trouble" markdown="1">

    If the script prints lines that begin with `PROBLEM`, it wrote nothing. Each line names the line of your file and what is wrong, most often a time without the `Z` at the end or a zone that is not written as `UTC` or `local (UTC-4)`. Correct the file and run the script again. You can run it as often as you need.

    </div>

20. Close the custody record. Add an entry for each tool that you used, with its version, and for each file that you created. Record the SHA-256 value of the final file from step 19.

    <div class="box expect" markdown="1">

    The record lists the two Plaso storage files, the CSV files that Plaso wrote, the text files of RegRipper, the three CSV files from Part C, your key events file and the final timeline, each as a file made by you from exhibit `S05-002`. It has no gap.

    </div>

    <div class="box trouble" markdown="1">

    If you find an action with no entry, add it at the end, mark it as a late entry and give the reason.

    </div>

<div class="box key" markdown="1">

**Keep the final file.** `s05-timeline-utc.csv` stays in your shared folder. In Session 8 you will set network alerts beside this timeline, so do not rename it, move it or change its columns.

</div>

### Checkpoint

Hand in `s05-timeline-utc.csv`, your notes and your custody record. Your work passes when all five of these are true:

1. The file has the unit's timeline format, with at least ten rows tagged `key-event` on 24 March 2015.
2. The eight required events of step 18 are among them, and each agrees with the answer key of the case to within one minute.
3. Every time is in UTC. The connection of the stick is marked `local (UTC-4)` and stands at its converted time, inside the frame of the day.
4. Every key event names the evidence file and the artefact that it came from.
5. Your notes state the offset with its source in the registry, and the two values from step 7 with the reason why one is wrong. Your custody record has no gap.

The lecturer judges the timeline against the answer key that NIST publishes with the case. Each event has a known time from a known artefact, so each row is right or wrong, not a matter of opinion.

This checkpoint helps with the phase test and the coursework. In the coursework you will build a timeline of your own incident in the cloud, and the same rule applies there: one clock, and a source for every row.

### If you have time

**Watch the lecturer's demonstration of Timesketch.** The same timeline, in a web application that a team can search and tag together. It is shown from the front because it needs a server and more memory than a student VM has. Nothing in the checkpoint depends on it.

**Ask the full timeline about the storage file.** In Kali, run `plaso-pinfo ~/evidence/s05/s05-full-image.plaso` and compare the table of parsers with the one from step 5. Which parsers found events in the full image and none in your collection? What does each of them read?

**Compare the two sets of times, as Session 4 taught.** In Windows, run MFTECmd on `C:\Evidence\S05\s05-triage\C\$MFT` in the same way as in step 14, with the output file `mft.csv`. Find the suspect's resignation letter, and compare the created times in the columns that end in `0x10` and `0x30`. Session 4 told you that they agree. Now you have checked it.

**Find the search that started it.** Filter your timeline for the artefact `browser` on 23 March and find the three searches from section 1. State each time in UTC and in the suspect's local time.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. A registry key holds three values. A report says that all three were written at the key's last-write time. Explain what is wrong with that statement.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A registry key keeps one last-write time for the whole key, and it moves whenever any value is added, changed or removed. It therefore shows when the key last changed, and it cannot show which value changed or when the other values were written. The points that earn marks: (1) one time for each key, none for a value; (2) any change to the key moves it; (3) the time can be tied to one value only by other reasoning, such as an order list.
</details>

**2. The prefetch file of a program on a Windows 7 computer shows a run count of 2, and the UserAssist record of the same program shows a count of 1. Explain how both can be correct.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The two records count different things. A prefetch file counts every start of the program on the computer, whatever started it, while UserAssist counts only the starts that one user made through the desktop. The points that earn marks: (1) prefetch belongs to the computer and counts all starts; (2) UserAssist belongs to one account and counts starts through the desktop; (3) a second start by another program or by the program itself explains the difference.
</details>

**3. A USB stick has been formatted and taken away. Name two artefacts on the computer that can still show which folders on the stick the user opened, and say what they do not prove.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Shellbags in the user's hive record each folder that was opened in Explorer, and LNK files or jump list entries record files that were opened, each with the full path on the stick. They are stored on the computer, so they stay when the device has gone, but they show only that something was opened and do not prove that anything was copied. The points that earn marks: (1) two correct artefacts; (2) they are on the computer's own disk and tied to the account; (3) opening is not copying.
</details>

**4. Explain what "normalise every source to UTC" means, and why it must be done before events from different sources are merged.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
It means changing the time of every record to UTC, using the time zone offset of the computer, so that all sources use one clock. Most artefacts already store UTC and a few store local time, so without this step the merged list puts some events hours out of place and shows an order that never happened. The points that earn marks: (1) all times changed to one clock, UTC; (2) sources differ, some record local time; (3) a merged list with two clocks gives a false order.
</details>

**5. An examiner needs the time zone offset of a seized computer. State where she should take it from, and why not from the address of the office.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
She reads it from the image itself, in the key `TimeZoneInformation` of the `SYSTEM` hive, which gives the bias that was in force. The setting of a computer need not match the place where it stands, and daylight saving time changes the offset during the year, so only the computer's own record shows what its clock was doing. The points that earn marks: (1) the registry of the image, the time zone key; (2) the setting can differ from the location; (3) daylight saving time or a changed setting alters the offset.
</details>

**6. Give one thing that a super-timeline adds to an investigation and one thing that it buries.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
It adds the order of events across sources, so that records from the registry, the logs and the programs can be read as one sequence and can confirm each other. It buries the few important rows under a very large number of rows from the system's own activity, so the examiner must filter, and a filter can hide an event without any warning. The points that earn marks: (1) a correct gain, such as order across sources, agreement or the discovery of gaps; (2) a correct loss, such as volume, the meaning of each time, or silence about what was not collected or not understood; (3) a consequence for the examiner, such as recording each filter or confirming rows in the original artefact.
</details>

## Coming next

Everything today came from the disk: records that Windows wrote down and left behind. But a computer also holds things that it never writes down. Running programs, open network connections and keys live only in its memory, and they vanish when the power goes. When the suspect's computer was seized, the unit captured its memory first. In Session 6 you open that capture, and you practise taking one yourself.
