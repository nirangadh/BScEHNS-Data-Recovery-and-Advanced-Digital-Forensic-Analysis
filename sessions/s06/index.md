---
session_code: S06
description: "What a running computer holds only in its memory, why that evidence is collected first, what a live capture costs, and how to read processes, command lines, network connections and signs of injected code from a memory image with Volatility 3."
hook: >-
  The suspect's disk told us what he did on his last morning. What was a computer like his doing at the moment it was seized,
  and what would be lost for ever if someone simply switched it off?
outcomes:
  - "Explain why volatile evidence matters in incident response, and identify what memory holds that the disk does not"
  - "Apply the order of volatility to a scene, and justify what is collected first"
  - "Explain why a live acquisition changes the computer, and what the hash value of a memory image does and does not prove"
  - "Explain why a memory tool needs the symbol table of the exact operating system, and what happens without it"
  - "Compare a process list read from the kernel with one found by a memory scan, and explain a difference between them"
  - "Identify the signs of injected code in a memory image, and justify what a report may say about such a finding"
  - "Apply FTK Imager, winpmem and Volatility 3 to capture and examine memory, and judge each finding against its source"
before:
  - "Explain [acquisition, the hash value and verification](../s01/#3-the-hash-value-showing-that-nothing-changed), and what forensically sound means (Session 1)"
  - "Explain why the [encryption key of an unlocked volume](../s04/#2-encryption-readable-only-with-the-key) is in memory (Session 4)"
  - "Explain what a [prefetch file and UserAssist](../s05/#4-programs-that-ran-prefetch-and-userassist) show about programs that ran (Session 5)"
  - "Explain why times are [normalised to UTC](../s05/#8-one-clock-normalise-every-source-to-utc) (Session 5)"
demos:
  - id: S06-D1
    title: "Pull the plug, or wait: what is lost"
    file: s06-d1-order-of-volatility.html
    teaches: "Each kind of evidence has its own lifetime, so every action and every minute of waiting destroys a different layer, starting with the shortest-lived."
  - id: S06-D2
    title: "The capture changes what it captures"
    file: s06-d2-capture-changes-system.html
    teaches: "A capture tool runs inside the memory that it copies, and memory keeps changing during the copy, so the image holds the tool's own footprint and pages from different moments."
  - id: S06-D3
    title: "The list and the scan"
    file: s06-d3-list-versus-scan.html
    teaches: "The kernel's process list shows only the records that are still linked, while a scan of memory finds every record that still exists, so a process can appear in one view and not in the other."
  - id: S06-D4
    title: "Reading a malfind finding"
    file: s06-d4-reading-malfind.html
    teaches: "A region is reported because of two properties, its protection and its first bytes, and neither property says who put the content there or why."
slides: s06-memory-forensics.pptx
evidence: "the lab share, folder `S06` (the lab steps say exactly which files)"
---

Session 5 read what Windows wrote down. Every record of that session lay on the disk, and the disk kept it for years. Today you read what a computer never writes down.

One correction comes first, because the unit owes you honesty. Session 5 said that the unit captured the suspect's memory when his computer was seized; the case evidence in fact contains no memory capture, so the unit rebuilt his last-morning actions on a current test machine and captured that machine's memory, and the Windows version and the dates that you see today are that machine's own.

So today's exhibit is a reconstruction, and this page calls it that every time. It cannot tell you what was in the suspect's memory in March 2015. It can show you, on real memory, what actions like his leave behind while a computer runs. The method is real. You will also capture the memory of your own Windows VM, so that you have done the seizure yourself.

## 1. What the computer never wrote down

### The idea

Go back to the suspect's last morning. Session 5 found that a wiping tool ran twice, and when it last ran. The {% include term.html t="prefetch-file" %} said so.

Now ask three questions that the disk cannot answer. Which files was the tool told to wipe? Was it still running when the computer was seized? Was the computer sending anything to another computer at that moment?

A running computer knows all three answers. It keeps them in its {% include term.html t="memory" %}, the fast working store that people also call RAM. Memory holds what the computer is doing now. The disk holds what the computer decided to keep.

Memory has one hard property. It needs power. Switch the computer off and its content is gone. Evidence of this kind is called {% include term.html t="volatile-evidence" %}: it exists only while the computer runs.

### How it works

Here is what memory holds that the disk does not, or not in the same form.

| In memory | What it tells the examiner | What the disk has instead |
|---|---|---|
| Every running {% include term.html t="process" %}, with its {% include term.html t="command-line" %} | Which programs are running now, and with which options and file names | Prefetch and UserAssist: that a program ran, and when it last ran. No options |
| Every open {% include term.html t="network-connection" %} | Which process is talking to which address and port at this moment | Sometimes a log. Often nothing |
| Each {% include term.html t="loaded-module" %} of a process | Which code the process brought into its memory | The program file, which may differ from what is running |
| The {% include term.html t="encryption-key" %} of every unlocked volume | A way to read a volume that will lock at switch-off | The encrypted data, unreadable without the key |
| Text that was typed and never saved | A note, a message or a password that exists nowhere else | Nothing |

Session 4 already used one row of this table. It told you to capture memory before you switch off a computer with an unlocked volume, because the key lives there. Today you learn the other rows.

**Why incident response needs it.** In Session 1 you met {% include term.html t="incident-response" %}: the organised work of finding, limiting and removing an attack while it happens. A responder must decide fast. Is this computer attacked now? Is it sending data out now? To which address? These are questions about the present, and memory is the only place that holds the present. Some attacks never write a program file to the disk at all. They live in memory only, and a disk image of that computer shows a clean machine.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The disk image has everything." | "The disk image has everything that was written to the disk." | Running processes, open connections, keys and unsaved text are not written. |
| "We can capture the memory later." | "We capture memory first, while the computer still runs." | A restart or a switch-off empties it. There is no later. |
| "Memory shows what happened." | "Memory shows the state at the moment of capture." | It is one moment. It has little history. The timeline comes from the disk. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A prefetch file shows that an archive program last ran at 10:02 UTC. Which fact could only a memory image add?</p>
  <ul class="qc-opts">
    <li data-key="a">How many times the program has run on this computer</li>
    <li data-key="b">The folder from which the program was started</li>
    <li data-key="c">The options and file names with which a running copy of the program was started</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The command line of a running process is kept in memory and is not stored in the prefetch file. The run count, option (a), is in the prefetch file. The folder, option (b), is part of what the prefetch file's name and content are built from.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Memory that reaches the disk after all, and memory after the power goes</summary>

**The page file.** Windows manages memory in blocks called pages. A {% include term.html t="memory-page" %} is usually 4,096 bytes. When memory is full, Windows moves pages that are not needed at the moment into a file on the disk, the {% include term.html t="page-file" %}, named `pagefile.sys`. So a disk image can hold old pieces of memory. They are pieces, with no order and no date.

**The hibernation file.** When a computer goes into its deep sleep, Windows writes memory into the {% include term.html t="hibernation-file" %}, `hiberfil.sys`, and reads it back when the computer wakes. A laptop that was closed and not switched off may therefore carry an older memory image on its own disk. Session 4 named both files as places where a key may lie.

**After the power goes.** Memory chips do not empty in an instant. Their content fades over seconds, and more slowly when the chips are cold. Researchers have read keys from chips after a restart in this way. It needs physical access and special handling. It is not a method of this module, and it does not change the rule: plan as if switch-off destroys memory.

**A crash dump.** When Windows fails with a blue screen, it can write memory to a file for the maker's engineers. Such a file is also a memory image, made by the system and not by an examiner.
</details>

<div class="box key" markdown="1">

The disk holds what the computer decided to keep. Memory holds what the computer is doing now: processes with their command lines, open connections, loaded modules, keys and unsaved text.

</div>

## 2. The order of volatility: collect first what dies first

### The idea

A responder arrives at a running computer. She can collect several things: the memory, the list of open connections, the disk, last night's backup. She cannot collect them all at the same moment. Which one first?

Think about what each one will look like in ten minutes. The list of open connections will have changed. Memory will have changed a little. The disk will be nearly the same. The backup tape in the cupboard will be exactly the same next week.

So she starts with what changes fastest. This rule has a name that you must know: the {% include term.html t="order-of-volatility" %}. Collect evidence in the order in which it would be lost.

### How it works

The rule is written down in a short public document, **RFC 3227**, *Guidelines for Evidence Collection and Archiving*. It says: when you collect evidence, proceed from the volatile to the less volatile. It then gives an example order for a typical system.

| Place in the order | Kind of evidence | It is lost when | How long it lasts |
|---|---|---|---|
| First | Values inside the processor: registers and cache | The processor does its next piece of work | Less than a second |
| | Network state: the routing table and the table of neighbouring devices. The process table. Memory | Connections close, processes end, the power goes | Seconds to minutes, and never past a switch-off |
| | Temporary files | The computer restarts, or a program tidies up | Minutes to days |
| | The disk | Something overwrites it | Months to years |
| | Logs and monitoring data kept on another computer | That system's own storage rules remove them | Months to years |
| | The physical set-up and the plan of the network | Somebody changes the cabling | As long as nothing is moved |
| Last | Archive media, such as backups | The media is destroyed | Years |

Learn the two ends by heart. **Most volatile:** the processor's registers and cache, then network state, running processes and memory. **Least volatile:** the disk, then archive media such as backups. An examiner can do little about registers and cache. So in practice the first thing collected is memory, and with it the network state.

{% include demo.html id="S06-D1" %}

RFC 3227 adds a warning that fits beside the order. Do not switch the computer off until you have finished collecting evidence. Much evidence may be lost, and an attacker may have changed the start-up and shut-down routines so that they destroy evidence.

<div class="box metaphor" markdown="1">

**The comparison.** Collecting evidence in the order of volatility is like recording footprints on a beach while the tide comes in.

**Why it fits.** The footprints nearest the water are the processor's registers and the network state: the next wave removes them. The footprints higher up are memory: they last until the tide reaches them, which is the switch-off. The marks on the rocks above the beach are the disk: they will be there tomorrow. You photograph the ones nearest the water first, although the ones on the rocks may be clearer.

**Where it breaks.** A tide follows a timetable, and you can see it coming. A computer gives no warning. A program can end, a user can pull the plug, an update can restart the machine at any second. And on the beach, your camera changes nothing. On a computer, the act of collecting is itself a step on the sand, as section 3 shows.

**So what.** Do not spend the first minutes on the disk because the disk feels like the real evidence. The disk can wait. Memory cannot.

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">Which list follows the order of volatility, from what is collected first to what is collected last?</p>
  <ul class="qc-opts">
    <li data-key="a">Memory and network state, temporary files, the disk, backups</li>
    <li data-key="b">The disk, memory and network state, backups, temporary files</li>
    <li data-key="c">Backups, the disk, temporary files, memory and network state</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The order runs from what is lost soonest to what lasts longest. Option (b) starts with the disk because it holds the most, which is the common mistake. Option (c) is the order turned round.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Where the rule comes from, and where it sits in the standards you know</summary>

**RFC 3227.** An RFC is one of the public documents in which the internet's engineers record standards and good practice. RFC 3227 was written by Dominique Brezinski and Tom Killalea and published in February 2002 as a guide to best current practice. It is short. Besides the order, it tells the collector to keep a record of every action, to use tools that change the system as little as possible, and to prefer tools that are run from the collector's own media.

**The same idea elsewhere.** NIST SP 800-86, which gave you the four stages in Session 1, makes the same point for its collection stage: volatile data is collected first. The standard ISO/IEC 27037 also asks the collector to weigh how quickly each kind of evidence would be lost.

**It is an order, not a law.** The order is a guide for a decision. If the attack is destroying data on the disk at this moment, the responder may act on that first. What the order demands is that you know what each choice costs, and that you record the choice and the reason.
</details>

<div class="box key" markdown="1">

Order of volatility (RFC 3227): collect from the most volatile to the least. Registers and cache, network state, processes and memory come first. The disk and backups come last.

</div>

## 3. Live acquisition and its cost

### The idea

In Session 1 you made a forensic image of a memory card. The card was not running. You read it, you changed nothing, and you proved that with a {% include term.html t="hash-value" %}.

You cannot treat memory like that. To copy the memory of a running computer, you must run a program on that computer. That program needs memory to run. So the tool changes the thing that it copies. Collecting evidence from a running computer with a tool that runs on it is called {% include term.html t="live-acquisition" %}, and the changes that the tool makes are its {% include term.html t="footprint" %}.

Session 1 said this in one sentence: sometimes the original must change, and then the examiner makes the smallest possible change and records it. Today that sentence becomes something you do with your own hands.

### How it works

Two things happen during a live capture, and you should keep them apart.

**The footprint.** The capture tool starts as a new process. It loads a small helper into the {% include term.html t="kernel" %}, the central part of the operating system, because only the kernel may read all of memory. Both need pages of memory, and Windows may hand them pages that held old data a moment ago. If the tool is started from a USB stick, Windows also records that stick in the registry, as Session 5 showed. All of this is change that the examiner caused.

**The smear.** Copying several gigabytes takes minutes. During those minutes the computer keeps working. A page copied in the first second and a page copied in the last minute come from different moments. A record in an early page may point to a place in a late page that has changed since. These small disagreements inside a {% include term.html t="memory-image" %} are called {% include term.html t="smear" %}. A memory image is therefore not a photograph of one instant. It is a copy made over a period.

{% include demo.html id="S06-D2" %}

**What the hash value means now.** This is the point that students most often get wrong, so read it slowly.

For the memory card of Session 1, the hash value linked three things: the original card, the image, and every working copy. Anyone could image the card again and get the same value.

For memory, there is nothing to compare with. The original changed while you copied it and has changed ever since. Capture the same computer twice, one minute apart, and the two images have two different hash values. Both are correct.

| | Image of a disk that is switched off | Memory image of a running computer |
|---|---|---|
| Can the original be read again, unchanged? | Yes | No. It no longer exists in that state |
| A second acquisition gives | The same hash value | A different hash value |
| The hash value proves | The image matches the original, and has not changed since | Only that the file has not changed since the hash was calculated |
| What supports the content | The match with the original | The examiner's record: the tool, its version, the time, each action |

So the hash value of a memory image proves that the file has not changed since the capture. It does not prove that the file matches the computer. Calculate it at once, the moment the capture ends, because it protects the image only from that moment on. Everything before that moment rests on your {% include term.html t="custody-record" %}.

<div class="box metaphor" markdown="1">

**The comparison.** A live memory capture is like a photograph of a busy street taken with a slow camera, by a photographer who stands in the street.

**Why it fits.** The slow camera needs time, so people who walk during the exposure appear blurred or twice: that is the smear. The photographer's own shadow falls into the picture: that is the footprint. The picture is still real evidence of the street. A careful viewer knows which marks came from the camera and the photographer.

**Where it breaks.** A photographer does not change the street. A capture tool does: it takes memory that held something else, and that something is gone. And a second photograph a minute later shows nearly the same street, while a second capture is a different file with a different hash value.

**So what.** Use a small tool, start it from your own media, write the image to a place outside the computer, and record every action with its time. Then nobody needs to trust that you changed nothing. They can read exactly what you changed.

</div>

**Where the image goes.** Never write the capture to the computer's own disk. First, the file is as large as the memory, and writing it overwrites unallocated space, where Session 2 taught you that deleted files live. Second, you would be saving evidence onto the evidence. Write it to an external drive or a network folder. In the lab, that place is your shared folder.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner captures the memory of a running server and calculates the SHA-256 value of the image file at once. A week later the value is the same. What has she shown?</p>
  <ul class="qc-opts">
    <li data-key="a">That the image is identical to the server's memory at the time of capture</li>
    <li data-key="b">That the image file has not changed since she calculated the first value</li>
    <li data-key="c">That the capture tool made no changes to the server</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The value protects the file from the moment it was calculated. Option (a) cannot be shown by any hash value, because the memory changed during the capture and cannot be read again. Option (c) is false for every live capture: the tool always leaves a footprint.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Capturing from outside, formats, and tools you will hear named</summary>

**A virtual machine can be captured from outside.** Your Windows VM runs inside a hypervisor. The hypervisor can save the VM's memory from the outside, without running anything inside the VM. A snapshot of a running VM stores its memory in this way, and VirtualBox and VMware each have a way to write it to a file. Such a capture has no footprint inside the VM and far less smear, because the VM can be paused. Incident responders use this whenever the attacked system is a VM. Today you capture from the inside on purpose, because many computers in real cases are not VMs.

**Formats.** The simplest memory image is a raw file: byte 0 of the file is byte 0 of memory. Some tools add a header that describes the layout, or compress the file. Volatility reads the common formats. FTK Imager writes a file with the ending `.mem`, and winpmem writes a raw file.

**Why a memory image can be larger than the memory.** A computer reserves some ranges of addresses for its devices. A raw image keeps the position of every byte, so it fills those ranges with zeros. A machine with 4 GB of memory can give an image somewhat larger than 4 GB.

**Paid tools.** Commercial products for memory capture and analysis exist, and you will meet their names in job descriptions, among them Magnet's capture tools and Belkasoft's. Everything in this module is done with free tools.
</details>

<div class="box key" markdown="1">

A live capture changes the computer and takes time. The hash value of a memory image proves that the file has not changed since capture. It cannot prove that the file matches the computer. Your record does that work.

</div>

## 4. From bytes to structures: why the tool needs symbols

### The idea

A memory image is one large file of bytes. It has no folders and no file names. Open it in a viewer and you see numbers.

The operating system knew what the numbers meant. It kept records in memory: one record for each process, one for each connection, one for each open file. Each record has a fixed layout. In one version of Windows, the name of a process may sit 1,104 bytes after the start of its record. In another version, the same field sits somewhere else.

To read a memory image, a tool must know these layouts. A description of the layouts for one exact version of an operating system is called a {% include term.html t="symbol-table" %}. Without the right symbol table, the tool cannot find a single process.

### How it works

The tool of this session is **Volatility 3**. It is free and open-source, and it is the standard tool of the field. Each of its commands is called a {% include term.html t="plugin" %}, and each plugin reads one kind of record.

When Volatility opens a Windows image, it works in three steps.

1. **It finds the kernel.** It searches the image for the kernel's own program code. Inside that code is a short identifier of the exact build: a long number that Microsoft gives to every build of the kernel.
2. **It gets the symbol table for that identifier.** Microsoft publishes the layouts for each build of Windows. Volatility downloads the one that matches, converts it and stores it in a folder on your computer, its symbol cache. The next time, it reads the cache.
3. **It reads the records.** Now the tool knows where the kernel keeps its lists and how each record is laid out. Every plugin builds on this.

Step 2 needs the internet, and it is slow the first time. A lab of thirty-five computers that all download at once, or a lab with no internet, stops here. So the unit did step 2 once, for the exhibit, and put the result on the lab share. You copy the symbol cache into place and run Volatility with the option `--offline`. Nothing is fetched from the internet.

<div class="box metaphor" markdown="1">

**The comparison.** A symbol table is like the legend of a map.

**Why it fits.** A map is lines, colours and small signs. The legend says what each sign means: this line is a river, that sign is a bridge. The bytes of a memory image are the signs, and the symbol table says which bytes are a process name, which are a process ID and which point to the next record. Every map series has its own legend, and every build of Windows has its own symbol table.

**Where it breaks.** If you read a map with the wrong legend, you soon notice: the river runs uphill. A memory tool with a wrong or partly wrong symbol table may give no warning. It can print a tidy table of processes with wrong names, or miss half of them. And a map does not change while you read it, while a memory image carries smear.

**So what.** Write down the version of the tool and the symbol table that it used. When a result looks strange, check the symbols before you blame the suspect.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An analyst runs Volatility 3 on a memory image in a room with no internet, and the tool stops with a message about symbols. What is the most likely cause?</p>
  <ul class="qc-opts">
    <li data-key="a">The image is damaged, so no tool can read it</li>
    <li data-key="b">The symbol table for that exact build of Windows is not in the tool's cache, and the tool cannot download it</li>
    <li data-key="c">The hash value of the image was not checked first</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The tool needs the layouts of that exact build. With no cache and no internet it has no way to get them. Option (a) is possible but far less likely. Option (c) is a fault in the examiner's method, and it does not stop the tool.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What the identifier looks like, and why old images are a problem</summary>

**The identifier.** The kernel's code names its own debugging file, `ntkrnlmp.pdb`, together with a 32-character number and an age. Microsoft's symbol server holds one file for each such number. Volatility turns that file into its own format and stores it under `symbols/windows/ntkrnlmp.pdb/`, in a file named after the number. Some plugins need a second symbol table, for example the one of the network driver.

**Why this module does not use older training images.** The older tool, Volatility 2, shipped with fixed profiles for each version of Windows. Volatility 3 dropped that system in favour of symbol tables, and it does not support Windows XP or Vista. Many public training images come from those years. This is one reason why the unit made its own exhibit.

**A new build of Windows.** After a Windows update the kernel is a new build with a new identifier. A symbol cache made last month will not fit a capture made today. You will meet this in the stretch task, when you open the capture of your own VM.
</details>

<div class="box key" markdown="1">

A memory image is bytes. The symbol table of the exact build turns the bytes into records. No symbols, no analysis. Wrong symbols, wrong analysis.

</div>

## 5. Two ways to find a process: the list and the scan

### The idea

Open the Task Manager on a Windows computer and you see the running processes. Where does that list come from?

The kernel keeps one record for each process. Each record points to the next one and to the one before it, like people standing in a chain and holding hands. This chain is the {% include term.html t="process-list" %}. Task Manager walks along the chain. So does the Volatility plugin `windows.pslist`.

There is a second way. Forget the chain. Search the whole image, byte by byte, for anything that has the shape of a process record. This is a {% include term.html t="memory-scan" %}, and the plugin is `windows.psscan`.

Most of the time the two ways find the same processes. The interesting cases are the ones where they do not.

### How it works

A process can be in the scan and not in the list for two reasons.

**It has ended.** When a process ends, the kernel takes its record out of the chain. The bytes of the record stay where they are until Windows uses that piece of memory for something else. A scan still finds the record, often with its name, its {% include term.html t="process-id" %}, its start time and its exit time. So a scan can show a program that ran and ended shortly before the capture.

**It was hidden.** Malicious software that runs inside the kernel can take a record out of the chain while the process keeps running. The two neighbours in the chain are made to hold hands with each other, and the process in the middle disappears from Task Manager and from every tool that walks the chain. The record itself must stay in memory, because the process still needs it. The scan finds it.

{% include demo.html id="S06-D3" %}

The same record may also be in the list with an exit time. That happens when the process has ended and another process still holds a reference to it, so the kernel has not removed the record yet.

| A process is found by | Most likely meaning | What to check next |
|---|---|---|
| The list and the scan, no exit time | It was running at capture | Its parent, its command line, its start time |
| The list and the scan, with an exit time | It had ended, and something still referred to it | Which process is its parent |
| The scan only, with an exit time | It had ended, and its record had not been overwritten yet | The exit time: how long before the capture? |
| The scan only, with no exit time and with live threads | It may have been hidden from the list | Everything. This needs a second analyst and a second tool |
| The scan only, with nonsense in its fields | A {% include term.html t="false-positive" %}: old bytes that look like a record | Nothing. Note it and move on |

<div class="box metaphor" markdown="1">

**The comparison.** The list is the hotel's register at the front desk. The scan is knocking on every door.

**Why it fits.** The register shows the guests whom the hotel knows about, in the order of the book. Walking along the corridors and knocking on each door takes far longer, and it does not depend on the book. A guest whose line was removed from the register is still in the room. A guest who checked out an hour ago has left a suitcase label and an unmade bed.

**Where it breaks.** A room is a room, and somebody is in it or not. A scan finds patterns of bytes, and some are only the remains of a record, half overwritten, with a believable name and a false time. The hotel also has a fixed number of doors, while memory is reused all the time: a record that the scan finds now may be gone a second later.

**So what.** Run both. Report a process from the scan alone only with the fields that make sense, and say that it came from a scan. A difference between the two views is a question to answer. It is not yet a finding.

</div>

Volatility prints every time in {% include term.html t="utc" %}. Session 5 taught you why that matters: you can put a process start time from memory straight into a {% include term.html t="timeline" %} beside the times from the disk.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">In a memory image, <code>windows.psscan</code> shows a process named <code>copyjob.exe</code> with a start time and an exit time twenty seconds before the capture. <code>windows.pslist</code> does not show it. What is the best reading?</p>
  <ul class="qc-opts">
    <li data-key="a">A rootkit hid the process from the list</li>
    <li data-key="b">The process ran and ended shortly before the capture, and its record had not been overwritten</li>
    <li data-key="c">The scan is wrong, because the list is the kernel's own record</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). An exit time and a short-lived program point to an ordinary ended process. Option (a) would need a process that is still alive. Option (c) forgets that the kernel removes ended processes from its list on purpose.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The record, the pool and other cross-checks</summary>

**The record.** Windows calls the record of a process `EPROCESS`. The field that links it to its neighbours is `ActiveProcessLinks`, and the kernel keeps the head of the chain in a variable named `PsActiveProcessHead`. Removing a record from the chain by writing to kernel memory is known as direct kernel object manipulation.

**The pool.** The kernel takes the memory for its records from an area called the pool, and it labels each piece with a short tag. Process records carry the tag `Proc`. The scan looks for that tag and then tests whether the bytes behind it look like a real record.

**The name is short.** The record keeps only the first fourteen characters of the program's file name. A program called `unit-marker.exe` appears in both plugins as `unit-marker.ex`. The full path is in the command line, which section 6 reads.

**More views.** A process can also be found through its threads, through the windows it owns and through other kernel tables. Volatility has a plugin that sets several of these views side by side. Two views are enough to learn the principle.

**The same pair exists for the network.** `windows.netstat` walks the kernel's live tables of connections. `windows.netscan` scans memory for connection records, and so it also finds connections that have closed.
</details>

<div class="box key" markdown="1">

The list shows what the kernel still links. The scan shows what still exists in memory. A process in the scan only has usually ended. Sometimes it was hidden.

</div>

## 6. What a running process carries

### The idea

Session 5 could say that a program ran. Memory can say what the program was doing. Each process record leads to four things that matter in a case: where the process came from, how it was started, what code it loaded, and whom it was talking to.

### How it works

**The family tree.** Every process was started by another one, its {% include term.html t="parent-process" %}. A program that the user starts from the desktop has the parent `explorer.exe`, which is the desktop itself. The plugin `windows.pstree` prints processes as a tree. Read it for what does not fit. A command window whose parent is a mail program or a document reader is a question. A program whose parent has ended, so that the tree shows a PID with no name, is a smaller question.

**The command line.** The plugin `windows.cmdline` prints the full text with which each process was started. Compare two records of one program on a practice machine:

| Source | What it says |
|---|---|
| Prefetch file, from the disk | `ROBOCOPY.EXE` ran on this computer 3 times, the last time at 09:41:07 UTC |
| Command line, from memory | `robocopy.exe D:\Projects\Tender E:\out /E /R:0`, running now, started at 09:41:07 UTC |

The first row tells you that a copy tool ran. The second tells you what was copied, from where, to where, and that it was still going on. This is the gain of memory over Session 5.

**Loaded modules.** A process brings files of code into its memory, mostly DLL files. The plugin `windows.dlllist` lists them with their paths. A module loaded from a user's download folder into a system process does not fit, and section 7 builds on that idea.

**Network connections.** The plugins `windows.netscan` and `windows.netstat` list connections with the local address and port, the remote address and port, the state, and the PID and name of the owning process. This is the only place in the whole case where a remote address is tied directly to a process. A network capture, which you meet in Session 7, shows that the computer talked to an address. Memory shows which program did the talking.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The command line shows what the user typed." | "The command line shows how the process was started." | Most processes are started by other programs, with nobody at the keyboard. |
| "The process was started by `informant`." | "The process ran in a session of the account `informant`." | Memory ties a process to an account. Tying the account to a person is other work. |
| "No connection in the list, so the program never used the network." | "No connection was open, or left a record, at the moment of capture." | A connection that closed earlier may have left no trace in memory. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An examiner reads the command line of a process from a memory image. Which caution belongs in the report?</p>
  <ul class="qc-opts">
    <li data-key="a">None: the command line is stored by the kernel and cannot be wrong</li>
    <li data-key="b">The command line shows only the last eight starts of the program</li>
    <li data-key="c">The command line is kept in the process's own memory, so the process can change it, and for an ended process it is often unreadable</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Windows keeps the command line in a part of memory that belongs to the process. A process may overwrite it, and when a process ends that memory is given back. Option (b) mixes this up with the prefetch file of newer versions of Windows.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Where the command line lives, handles, and files in memory</summary>

**The process environment block.** Each process has a small area in its own memory in which Windows keeps its start-up details, among them the command line and the path of the program. Volatility reads the command line from there. Because the area belongs to the process, malicious software sometimes rewrites it after starting, so that the text no longer matches what really ran.

**Handles.** A process reaches a file, a registry key or another process through a handle. The plugin `windows.handles` lists them. A file that a process holds open appears there with its path, even when the file has since been deleted from the folder.

**Files in memory.** Windows keeps recently used parts of files in memory so that it need not read the disk again. `windows.filescan` finds the records of files, and `windows.dumpfiles` writes out whatever content is still in memory. The result may be the whole file, a part of it, or nothing. A file recovered this way is a file "as far as memory held it", and the report should say so.

**MemProcFS.** Another free tool, MemProcFS, shows a memory image as folders and files: a folder for each process, with its command line, its modules and its memory as files that you open in the usual way. Many analysts use it beside Volatility. The lab offers it as an option.
</details>

<div class="box key" markdown="1">

Prefetch says that a program ran. Memory says that it is running now, who started it, with which command line, with which modules, and to which address it is connected.

</div>

## 7. Signs of injected code: what the finding means

### The idea

A program normally runs code that came from its own file on the disk. Some malicious software works differently. It places its code directly into the memory of a process, often a harmless process that is already running, and runs it there. Nothing is written to the disk. This is {% include term.html t="injected-code" %}.

You will not analyse malicious software today. Sessions 9 and 10 do that, in the closed lab. Today you learn one thing: how a memory tool points to a region that might hold injected code, and what that pointer does and does not mean.

### How it works

Windows gives every region of a process's memory a {% include term.html t="memory-protection" %}: a set of rights. Three rights matter here.

| Right | Meaning | Normal use |
|---|---|---|
| Read | The process may read the region | Almost everything |
| Write | The process may change the region | Data that the program works on |
| Execute | The processor may run the region as code | Code loaded from a program file |

Ordinary code is readable and executable, and not writable. Ordinary data is readable and writable, and not executable. A region that is **writable and executable at once** is unusual: something can write new code into it and run that code immediately. Windows names this protection `PAGE_EXECUTE_READWRITE`.

The plugin `windows.malware.malfind` looks for regions with three properties:

1. the region is writable and executable;
2. the region is private to the process, which means that it was not loaded from a file on the disk;
3. the region is in use.

For each such region it prints the process, the start and end addresses, the protection, and the first bytes. If the first bytes are `4d 5a`, the letters `MZ`, the region begins with the {% include term.html t="header" %} of a Windows program. `MZ` is the {% include term.html t="file-signature" %} of every Windows executable file, as Session 3 taught for other file types. A whole program sitting in private, writable, executable memory, with no file behind it, is the classic sign.

```
PID   Process        Start VPN   End VPN     Protection               Notes
4120  practice.exe   0x1f0000    0x1f0fff    PAGE_EXECUTE_READWRITE   MZ header

4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00   MZ..............
```

{% include demo.html id="S06-D4" %}

**What the finding means.** Read the three properties again. None of them says who put the content there, or why. The plugin reports a state of memory. It does not report an attack.

Harmless programs produce the same state every day. Web browsers and the programs behind PowerShell and .NET translate code into machine instructions while they run, and they need writable, executable memory to do it. Some security products do the same. On a healthy Windows computer, `malfind` usually prints several regions, and none of them is malicious.

So a `malfind` line is a lead. The work begins after it: which process is it, what is its parent, what is its command line, which modules did it load, is it connected to anything, and what do the bytes in the region turn out to be?

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "malfind found malware in PowerShell." | "The process `powershell.exe` holds private memory that is writable and executable. This is normal for that program." | The protection alone is not a sign of an attack. |
| "The region has an MZ header, so a program was injected." | "The region begins with the bytes `4d 5a` and is not backed by a file. The content needs examination." | Two bytes are a pattern. Any process can write those two bytes into its own memory. |
| "malfind found nothing, so the computer is clean." | "No private region with that protection was found." | Careful malicious software changes the protection back after writing its code. |

</div>

The unit put this to the test in its reconstruction. One small program on the test machine is the unit's own **control sample**. It asks Windows for a writable, executable region in its own memory, writes the two letters `MZ` and a line of text into it, and then waits. It touches no other process and it does nothing else. It is not part of the suspect's story, and the unit says so openly. It is there so that you can see a real `malfind` line whose cause is known, beside the lines that Windows produces by itself.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q"><code>windows.malware.malfind</code> prints a region in a web browser's process: private, <code>PAGE_EXECUTE_READWRITE</code>, first bytes not <code>MZ</code>. What may the report say?</p>
  <ul class="qc-opts">
    <li data-key="a">That code was injected into the browser</li>
    <li data-key="b">Nothing, because a finding without an MZ header is always a false positive</li>
    <li data-key="c">That the browser held private writable and executable memory, which browsers create in normal work, and that nothing further pointed to injected code</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). It states what was seen and how it was judged. Option (a) turns a state of memory into an accusation. Option (b) goes too far the other way: injected code need not begin with a program header.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How Windows records the regions, and the ways code gets into a process</summary>

**The tree of regions.** For each process, the kernel keeps a tree of records that describe its regions of memory: where each begins and ends, its protection, and whether a file lies behind it. The records are called virtual address descriptors. `malfind` walks this tree. The addresses that it prints are page numbers in the process's own address space.

**Protection can change.** The tree records the protection that a region was given when it was created. A program can change the protection of pages later. So a region may be executable now although the tree says otherwise, and a tool that reads only the tree will miss it. Newer plugins compare several sources for this reason.

**Ways in.** Code reaches a foreign process by several routes: one process writes into another and starts a thread there; a process is started in a paused state and its content is replaced before it runs; or a module is loaded by hand, without the system's loader, so that it appears in no list of modules. You do not need the details today. Sessions 9 and 10 return to what such code does, on training samples and under isolation.

**Why a control sample.** Testing a tool on material whose content you know is ordinary laboratory practice. Session 3 did the same with a carving image whose files were known in advance.
</details>

<div class="box lens" markdown="1">

**Through another lens: Blade Runner.** In this film, a company builds artificial people called replicants. They are made as adults and live only four years. Near the end, one of them is dying. He tells the man who hunted him about the extraordinary things that he has seen, and says that all of it will be lost when he is gone. Another replicant, Rachael, learns that her memories of childhood were placed in her by her makers. They are vivid, and they feel real to her. They did not happen to her.

Two ideas from the film fit this session. The first is the dying replicant's point: what exists only in a living memory ends with its holder. Nobody recorded it, so it is lost at the last moment. That is memory at switch-off.

The second is Rachael's. Her memories are really in her mind, and they still do not show where they came from. A region of memory with a program header is really there, and it does not show who wrote it. And our exhibit is itself a kind of replicant: a machine built to carry the memory of a morning that it never lived. What it holds is real. It is not the suspect's.

Psychology has a plainer version of the first idea. Working memory is what you hold in mind while you use it, such as a phone number that you repeat until you dial. It is small and it fades in seconds. Long-term memory is what was written down in the brain, and it lasts. Working memory is to long-term memory as RAM is to the disk.

Where the parallels break: a person forgets slowly and in pieces, and can sometimes be reminded. Memory in a computer goes almost at once and nearly completely. And a person may misremember, while a memory image is an exact copy of bytes whose meaning the examiner must still explain.

The question to carry into the lab: when you find something in memory, what do you know about how it got there?

</div>

<div class="box key" markdown="1">

Volatile evidence exists only while the power is on. Observe it now or lose it. And what you observe is a state: it shows what is present, not how it came to be there.

</div>

## 8. The lab: capture your own memory, then read the unit's reconstruction

Your task has two halves. First you capture the memory of your own Windows VM while it runs, and protect the capture with a hash value. Then you examine the unit's reference memory image with Volatility 3 and hand in a sheet of ten findings.

You work first in the Windows VM, then in the Kali VM. If your host machine can run only one VM at a time, finish Parts A and B, shut Windows down, and then start Kali. Allow about two hours.

<div class="box safety" markdown="1">

**You are capturing a live system: plan before you click.**

- The capture file is as large as the memory of your VM, and often a little larger. For a VM with 4,096 MB that is 4 to 5 GB. Check that the drive of your host machine that holds `nb6018-share` has at least 9 GB free before you start: about 5 GB for your capture, 2 GB for the reference image, and room to work.
- Write the capture to the shared folder. Never write it to the `C:` drive of the VM.
- A memory image of your own VM can hold your own passwords and open documents. Close everything personal before you capture, and delete the capture when the session is over.
- Capture only computers that are yours or that you have written permission to examine.
- If Windows blocks a tool, record what it said. Do not switch off any protection of Windows unless the lecturer tells you to.

</div>

<div class="box lms" markdown="1">

The reference memory image, its symbol cache, the helper script, the findings sheet, the evidence register and a blank custody record are in folder `S06` on the lab share. Copy that folder into `nb6018-share` on your host machine before you start. If you are studying away from the lab, the LMS explains how to get the same files. The reference image is about 2 GB.

</div>

**The items.** Keep every file name exactly as it is.

| Exhibit | File | What it is |
|---|---|---|
| `S06-001` | `s06-reference-memory.raw` | The unit's reconstruction: the memory of a Windows 10 test machine on which the unit replayed actions of the kind the suspect took on his last morning. Captured with winpmem. It is not from the suspect's computer |
| `S06-002` | `s06-own-capture.mem` | The memory of your own Windows VM. You create this exhibit today |

**What the unit replayed on the test machine.** A letter open in Notepad. A note typed into a second Notepad window and never saved. A small script that reports to another computer of the unit over the network and keeps a log file open. A copy job that had finished before the capture. And the unit's control sample from section 7. The other computer is the unit's own listener on a closed lab network, standing in for an outside address.

**Three more files from the unit.**

- `symbols/` is the symbol cache for exhibit `S06-001`.
- `s06-tools.py` runs in Kali. It compares two process tables, and it checks the form of your findings sheet.
- `s06-findings.csv` is the sheet for your ten findings.

### Part A: capture your own memory, in Windows

1. Start the Windows VM and log in. Open one Notepad window, type a line that you will recognise, such as your initials and the word `volatile`, and do not save it. Leave the window open.

   <div class="box expect" markdown="1">

   A Notepad window with your line and no file name in its title. You have just placed a small piece of volatile evidence in your own memory.

   </div>

   <div class="box trouble" markdown="1">

   If Windows 11 opens Notepad with an old document in it, open a new tab and type there.

   </div>

2. Check the space. Open File Explorer, type `\\VBOXSVR\nb6018` into the address bar and press Enter. Then open PowerShell and run:

   ```powershell
   (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB
   Get-Date -Format "yyyy-MM-dd HH:mm:ss K"
   ```

   <div class="box expect" markdown="1">

   The shared folder opens and shows the folder `S06`. The first command prints a number close to 4, the memory of your VM in gigabytes. The second prints the date, the time and the offset of your VM's clock. Write both into your notes, and write entry 1 of the custody record: the computer, its memory size, the time, and that you are about to capture its memory with FTK Imager.

   </div>

   <div class="box trouble" markdown="1">

   If `\\VBOXSVR\nb6018` does not open, the shared folder is not set up: repeat the last part of Step 5 in Session 0. If you use VMware or KVM, use the path of your own shared folder in every step that follows.

   </div>

3. Start FTK Imager from the Start menu, and answer Yes when Windows asks whether the program may make changes. Read its version under **Help**, **About**, and write it into the custody record. Then choose **File**, **Capture Memory...**.

   <div class="box expect" markdown="1">

   A small window named Memory Capture, with a box for the destination path, a box for the file name, and two tick boxes.

   </div>

   <div class="box trouble" markdown="1">

   If the menu item is grey, FTK Imager was not started with administrator rights. Close it, right-click its icon and choose **Run as administrator**.

   </div>

4. In **Destination path**, type `\\VBOXSVR\nb6018`. In **Destination filename**, type `s06-own-capture.mem`. Leave **Include pagefile** and **Create AD1 file** without a tick. Note the time, then click **Capture Memory**.

   <div class="box expect" markdown="1">

   A progress bar that runs for several minutes. It ends with the words "Memory capture finished successfully". While it runs, do not use the VM: every click changes memory. Write the start time and the end time into your notes.

   </div>

   <div class="box trouble" markdown="1">

   If FTK Imager does not accept the path, click **Browse** and choose the shared folder under **Network**. If it is not listed, open a Command Prompt as administrator, run `net use Z: \\VBOXSVR\nb6018`, and use `Z:\` as the destination. If the capture stops with an error about space, your host drive is full: free space and start again. If Windows reports that it blocked a driver, write down the exact message and go to Part B.

   </div>

5. Hash the capture at once. In PowerShell:

   ```powershell
   Get-FileHash -Algorithm SHA256 \\VBOXSVR\nb6018\s06-own-capture.mem
   Get-Item \\VBOXSVR\nb6018\s06-own-capture.mem | Select-Object Length, LastWriteTimeUtc
   ```

   <div class="box expect" markdown="1">

   One SHA-256 value, the size of the file in bytes and the time at which it was last written, in UTC. The size is 4 GB or a little more. Write all three into the custody record as entry 2: exhibit `S06-002`, created by you, from which computer, with which tool and version, start and end time, and the hash value. From this moment the value protects the file.

   </div>

   <div class="box trouble" markdown="1">

   If the command takes more than a few minutes, wait: the file is large and the shared folder is slower than a disk. If the size is far below the memory of your VM, the capture did not finish: delete the file and repeat step 4.

   </div>

6. Answer two questions in your notes, in one sentence each. What did your capture change on the VM? What would the hash value of a second capture be?

   <div class="box expect" markdown="1">

   Your first answer names at least the process of FTK Imager, its helper in the kernel and the memory that both used. Your second answer says that it would be a different value, and that neither value would be wrong.

   </div>

   <div class="box trouble" markdown="1">

   If you wrote "nothing" for the first question, read section 3 again before you go on.

   </div>

### Part B: the command-line alternative, winpmem

Do this part if FTK Imager failed in Part A, or if your host drive has another 5 GB free. If not, read the steps and compare notes with a neighbour who did it.

{:start="7"}
7. Open a Command Prompt as administrator and run the unit's copy of winpmem, with the name of the output file as its only option:

   ```
   C:\Tools\winpmem_mini_x64_rc2.exe \\VBOXSVR\nb6018\s06-own-capture-winpmem.raw
   ```

   <div class="box expect" markdown="1">

   The program prints that it loaded its driver, then the ranges of memory that it will copy, then a progress count, and at the end that the driver was unloaded. A file of 4 to 5 GB appears in the shared folder. winpmem writes a raw image, with no header.

   </div>

   <div class="box trouble" markdown="1">

   If Windows says that the driver cannot load, or that it was blocked, Windows refused the helper that winpmem needs in the kernel. Newer versions of Windows block some older drivers. If Windows Security removes the program, it has judged the tool by what it can do. In both cases write the exact message and the time into your notes: a tool that fails at the scene is a fact of the case, and it is the reason why an examiner carries a second tool. Tell the lecturer, and continue with your FTK Imager capture. If the file in `C:\Tools` has a different name, use the name that begins with `winpmem`.

   </div>

8. Hash the second capture, and compare:

   ```powershell
   Get-FileHash -Algorithm SHA256 \\VBOXSVR\nb6018\s06-own-capture-winpmem.raw
   ```

   <div class="box expect" markdown="1">

   A SHA-256 value that differs from the one in step 5. Two captures of one computer, a few minutes apart, are two different files. Add the capture to the custody record with its own entry. Then shut the Windows VM down if your host can run only one VM.

   </div>

   <div class="box trouble" markdown="1">

   If the two values are the same, you hashed the same file twice: check the names.

   </div>

### Part C: receive the unit's image and make the tool ready, in Kali

{:start="9"}
9. In the Kali VM, open a terminal. Create two folders, copy the files and verify the image against the evidence register:

   ```bash
   mkdir -p ~/evidence/s06 ~/cases/s06
   cp -r /media/sf_nb6018/S06/* ~/evidence/s06/
   cd ~/evidence/s06
   sha256sum s06-reference-memory.raw
   chmod a-w s06-reference-memory.raw
   ```

   <div class="box expect" markdown="1">

   The copy takes a few minutes. One SHA-256 value appears. It equals the value for exhibit `S06-001` in `s06-evidence-register.md`. Write the entries in the custody record: received, and verified on receipt. Remember what this match proves: your copy is the file that the unit hashed after its capture.

   </div>

   <div class="box trouble" markdown="1">

   If Kali says "Permission denied" for `/media/sf_nb6018`, repeat the last part of Step 5 in Session 0. If Kali reports that no space is left, your Kali disk is full: delete the working files of earlier sessions that you no longer need, and keep your notes. If the value does not match, copy the file again. If it still differs, tell the lecturer and do not continue.

   </div>

10. Put the symbol cache in place, and check the tool:

    ```bash
    mkdir -p ~/.cache/volatility3/symbols
    cp -r ~/evidence/s06/symbols/windows ~/.cache/volatility3/symbols/
    ls ~/.cache/volatility3/symbols/windows
    vol -h | head -n 1
    ```

    <div class="box expect" markdown="1">

    The `ls` command shows at least the folder `ntkrnlmp.pdb`. The last command prints `Volatility 3 Framework` and a version number. Write the version into the custody record.

    </div>

    <div class="box trouble" markdown="1">

    If Kali says that `vol` is not found, install the tool with `sudo apt install volatility3` and tell the lecturer, because that step needs the internet. Run `vol` as your normal user and never with `sudo`: with `sudo` the tool looks for its cache in another home folder and does not find the symbols.

    </div>

11. Give the image a short name for this terminal, and ask Volatility what it is looking at:

    ```bash
    cd ~/cases/s06
    IMG=~/evidence/s06/s06-reference-memory.raw
    vol -q --offline -f $IMG windows.info | tee info.txt
    ```

    <div class="box expect" markdown="1">

    After a short wait, a table of two columns. The line `Symbols` names a file under `ntkrnlmp.pdb` in your cache: the tool found the symbol table without the internet. `Is64Bit` is `True`. `NtMajorVersion` is `10`. The line `Major/Minor` gives the build of Windows, and `SystemTime` gives the clock of the test machine at the capture, in UTC. These are the machine's own values. They are a current Windows 10 and a recent date, not Windows 7 and not March 2015, and that is correct for a reconstruction.

    </div>

    <div class="box trouble" markdown="1">

    If the tool stops with a message that it cannot find or satisfy symbols, the cache is not where the tool looks: repeat step 10 and check the folder names letter by letter. If you opened a new terminal, type the line that begins with `IMG=` again. The first run may take a minute while the tool reads the cache.

    </div>

### Part D: processes, their tree, and the scan

{:start="12"}
12. Read the kernel's process list:

    ```bash
    vol -q --offline -f $IMG windows.pslist | tee pslist.txt
    ```

    <div class="box expect" markdown="1">

    A table with one row for each process: `PID`, `PPID` (the PID of the parent), the name, the number of threads, the start time in the column `CreateTime` and, for a process that has ended, an `ExitTime`. You see the usual processes of Windows, among them `System`, `explorer.exe` and several named `svchost.exe`, and the programs of the unit's replay: `notepad.exe` twice, `powershell.exe`, and a name that begins with `unit-marker`.

    </div>

    <div class="box trouble" markdown="1">

    If the name of the control sample seems to be cut off, it is: the process record keeps only the first fourteen characters of a name. If the table is empty, the symbols are wrong: go back to step 11.

    </div>

13. Read the same processes as a tree:

    ```bash
    vol -q --offline -f $IMG windows.pstree | tee pstree.txt
    ```

    <div class="box expect" markdown="1">

    The same processes, with stars or indentation that show which process started which. Find `explorer.exe` and read its children. Find the parent of each `notepad.exe` and of the control sample. Write them into your notes.

    </div>

    <div class="box trouble" markdown="1">

    If the lines are too wide to read, make the terminal window wider, or open `pstree.txt` in a text editor with line wrapping switched off.

    </div>

14. Now scan the image for process records, without the list:

    ```bash
    vol -q --offline -f $IMG windows.psscan | tee psscan.txt
    ```

    <div class="box expect" markdown="1">

    A table with the same columns. This plugin takes longer, because it reads every byte of the image. It shows more rows than step 12.

    </div>

    <div class="box trouble" markdown="1">

    If the scan shows fewer rows than the list, you are comparing the wrong files: check the two names.

    </div>

15. Compare the two views with the unit's helper:

    ```bash
    python3 ~/evidence/s06/s06-tools.py compare pslist.txt psscan.txt
    ```

    <div class="box expect" markdown="1">

    The script prints three short lists: processes in both views, processes in the scan only, and processes that have an exit time. At least one process of the unit's replay had ended before the capture. Find it. Write its name, its PID, its start time and its exit time into your notes, and work out how many seconds before the capture it ended, using `SystemTime` from step 11. Decide which row of the table in section 5 it belongs to.

    </div>

    <div class="box trouble" markdown="1">

    If the scan-only list holds rows with strange names or times many years away, they are false positives: old bytes that look like a record. Leave them out and say so in your notes. If the script says that it cannot read a file, you gave it something other than the two saved tables.

    </div>

### Part E: command lines

{:start="16"}
16. Print the command line of every process:

    ```bash
    vol -q --offline -f $IMG windows.cmdline | tee cmdline.txt
    grep -i -E "notepad|powershell|unit-marker|cmd.exe" cmdline.txt
    ```

    <div class="box expect" markdown="1">

    For each process, its PID, its name and the full text with which it was started. One `notepad.exe` was started with the path of a document. The other has no file on its command line. The `powershell.exe` of the replay was started with a script file and options that name an address and a port. The control sample shows its full name and folder. For some processes the tool prints that the memory could not be read: that is usual for a process that has ended.

    </div>

    <div class="box trouble" markdown="1">

    If `grep` prints nothing, check the spelling. If you see more than one `powershell.exe`, read their parents in `pstree.txt` to tell them apart.

    </div>

### Part F: network connections

{:start="17"}
17. List the connections that memory holds:

    ```bash
    vol -q --offline -f $IMG windows.netscan | tee netscan.txt
    grep -i -E "ESTABLISHED|CLOSED" netscan.txt
    ```

    <div class="box expect" markdown="1">

    Many rows, most of them ports on which Windows itself is listening. Among the rows with the state `ESTABLISHED` is one whose owner is the `powershell.exe` of the replay. Read its local address and port, its remote address and port, its PID and its `Created` time. The remote address is the unit's listener on the closed lab network. Check that the address and the port agree with the command line from step 16: two sources, one fact.

    </div>

    <div class="box trouble" markdown="1">

    If the tool asks for symbols again and stops, this plugin needs a second symbol table, the one of the network driver: check that the folder from step 10 was copied completely, and tell the lecturer. If no row is `ESTABLISHED`, run `vol -q --offline -f $IMG windows.netstat` and read its rows.

    </div>

18. Run the second network plugin and compare:

    ```bash
    vol -q --offline -f $IMG windows.netstat | tee netstat.txt
    ```

    <div class="box expect" markdown="1">

    Fewer rows. This plugin walks the kernel's live tables, as `pslist` does for processes. The connection of step 17 is in both outputs. Note any connection that is in `netscan.txt` only, and say in one sentence why that can happen.

    </div>

    <div class="box trouble" markdown="1">

    If this plugin prints an error on this image, record the message and work with `netscan.txt`. Different builds of Windows are supported to different degrees, and that is a fact to record, not a fault of yours.

    </div>

### Part G: the malfind finding

{:start="19"}
19. Ask for regions that are private, writable and executable:

    ```bash
    vol -q --offline -f $IMG windows.malware.malfind | tee malfind.txt
    grep -c "PAGE_EXECUTE_READWRITE" malfind.txt
    ```

    <div class="box expect" markdown="1">

    Several findings, each with a process, a start and an end address, the protection, a block of bytes in hexadecimal with their text beside them, and the same bytes shown as machine instructions. The number that `grep` prints is the number of regions. More than one process is named.

    </div>

    <div class="box trouble" markdown="1">

    If Volatility says that it does not know this plugin, your version is older and uses the earlier name: run `windows.malfind` in its place. If your version prints a warning that `windows.malfind` is old, that is the same change seen from the other side.

    </div>

20. Judge each finding. Open `malfind.txt` in a text editor. For each region, write one line in your notes: the process, its PID, the start address, the first two bytes, and your judgement with a reason.

    <div class="box expect" markdown="1">

    One region begins with `4d 5a`, and the text beside the bytes shows `MZ` followed by a line that names the unit's control sample. Its process is the control sample from step 12. The other regions belong to programs that create such memory in normal work, and they do not begin with `MZ`. Your notes say for the control sample what was seen and that its cause is known and harmless, and for the others that the protection alone is normal for that program.

    </div>

    <div class="box trouble" markdown="1">

    If you are unsure about a process, use what you already have: its parent in `pstree.txt` and its command line in `cmdline.txt`. That is the method of section 7. If your notes use the word "malware", read the mix-ups box of section 7 again: nothing on this test machine is malicious.

    </div>

### Part H: text that was never saved, and a file held open

{:start="21"}
21. Search the whole image for the unsaved note. Windows keeps typed text with two bytes for each character, and the option `-e l` tells `strings` to look for that form:

    ```bash
    strings -e l $IMG | grep -i "unsaved note" | sort -u | tee note.txt
    ```

    <div class="box expect" markdown="1">

    After about a minute, at least one line that begins with the words `UNSAVED NOTE` and continues with a sentence. This text was typed into Notepad and never saved. No file on the test machine's disk holds it.

    </div>

    <div class="box trouble" markdown="1">

    If nothing is printed, check that you typed `-e l` with the letter l, not the digit 1.

    </div>

22. You found the text in the image. You have not yet shown which process held it. Write out the memory of the `notepad.exe` that has no file on its command line, using its PID from step 16 in place of `PID`, and search there:

    ```bash
    mkdir -p notepad-mem
    vol -q --offline -f $IMG -o notepad-mem windows.memmap --pid PID --dump > memmap.txt
    strings -e l notepad-mem/pid.*.dmp | grep -i "unsaved note" | sort -u
    ```

    <div class="box expect" markdown="1">

    A file named `pid.` with the number and `.dmp` appears in the folder `notepad-mem`, and the same line of text is found inside it. Now you may write: the text was in the memory of this process.

    </div>

    <div class="box trouble" markdown="1">

    If the text is not in this process, you chose the other `notepad.exe`: try its PID. If the dump is very large and your disk is nearly full, delete it when you have your answer.

    </div>

23. Recover the log file that the script held open:

    ```bash
    mkdir -p files
    vol -q --offline -f $IMG -o files windows.dumpfiles --filter "sent-list" --ignore-case | tee dumpfiles.txt
    ls -l files
    cat files/*sent-list* | head -n 20
    ```

    <div class="box expect" markdown="1">

    The table names a file object for `sent-list.txt` and the result of writing it out. A file appears in the folder `files`, and its first line says that it is the log of the unit's reconstruction. It lists what the script copied and where it reported. Hash the recovered file with `sha256sum` and record it as an item that you created from exhibit `S06-001`.

    </div>

    <div class="box trouble" markdown="1">

    If the table is empty or the folder holds no file, the content was not in memory in a form that the tool could write out. That is a result, not a failure: record it, and say what you tried. Memory holds a file only as far as Windows was using it.

    </div>

### Part I: the findings sheet

{:start="24"}
24. Copy `~/evidence/s06/s06-findings.csv` to `~/cases/s06`, make the copy writable with `chmod u+w`, and open it in a text editor. It has ten rows, `F1` to `F10`, each with a question. Fill the columns `answer` and `source` for each row. The source is the plugin or command that gave you the answer.

    | Row | The question |
    |---|---|
    | `F1` | The build of Windows on the test machine, from the line `Major/Minor` |
    | `F2` | The time of the capture in UTC, from `SystemTime` |
    | `F3` | The PID of the `notepad.exe` that was started with a document |
    | `F4` | The full path of that document |
    | `F5` | The PID of the control sample, and the name of its parent |
    | `F6` | The name and PID of the process of the replay that had ended before the capture |
    | `F7` | The name and PID of the process that owns the connection to the unit's listener |
    | `F8` | The remote address and port of that connection |
    | `F9` | The start address of the region that begins with `MZ` |
    | `F10` | The sentence that follows the words `UNSAVED NOTE` |

    <div class="box expect" markdown="1">

    Ten filled rows. An answer with two parts is written with a space between them, for example a name and then a PID. Times are written as Volatility prints them.

    </div>

    <div class="box trouble" markdown="1">

    If an answer needs a comma, put the whole answer inside double quotes.

    </div>

25. Check the form of the sheet, copy it to the shared folder and close the custody record:

    ```bash
    python3 ~/evidence/s06/s06-tools.py check s06-findings.csv
    cp s06-findings.csv /media/sf_nb6018/
    sha256sum s06-findings.csv
    ```

    <div class="box expect" markdown="1">

    The script says that the sheet has ten rows and that each has an answer and a source. It checks the form only. It does not know the right answers. Your custody record lists exhibit `S06-002` with its hash value, exhibit `S06-001` as received and verified, each tool with its version, and each file that you created.

    </div>

    <div class="box trouble" markdown="1">

    If the script prints a line that begins with `PROBLEM`, it names the row and what is missing. Correct the sheet and run the script again.

    </div>

### Checkpoint

Hand in `s06-findings.csv`, your notes and your custody record. Your work passes when all five of these are true:

1. Your custody record shows exhibit `S06-002`: the computer, the tool and its version, the start and end time of the capture, the place where the file was written, and a SHA-256 value calculated at once. The file was not written to the VM's own disk.
2. Your notes state what the capture changed on the VM, and what the hash value of a memory image proves and does not prove.
3. At least eight of your ten findings agree with the unit's key. `F7` and `F8`, the owner and the remote end of the connection, must be among them.
4. Every finding names the plugin or command that it came from.
5. Your notes on the `malfind` regions state what was seen, and do not call any region malicious.

The lecturer judges the sheet against the key that the unit recorded when it built and captured the test machine. Each answer is a value in the image, so each row is right or wrong, not a matter of opinion.

This checkpoint helps with the coursework and the phase test. In the coursework you will again collect evidence that changes while you collect it, in the cloud, and the same two habits apply: collect the short-lived evidence first, and record what your own actions changed.

### If you have time

**Open your own capture.** If your Kali VM has an internet connection, run `vol -q -f /media/sf_nb6018/s06-own-capture.mem windows.info`, without `--offline`. Your VM runs a different build of Windows from the test machine, so the tool must fetch a new symbol table, and the first run is slow. This is section 4, seen for yourself. Then run `windows.pslist` and find the capture tool in your own image: that is its footprint. Find your Notepad line from step 1 with `strings -e l`.

**Browse memory as folders, with MemProcFS.** The lecturer shows this from the front, or you can try it if the tool is in your `Tools` folder. MemProcFS presents the reference image as a drive with a folder for each process. Open the folder of one `notepad.exe` and compare what you find with your Volatility output. The tool fetches symbols in its own way, so in a room without internet it shows less.

**Practise on MemLabs.** MemLabs is a set of free practice challenges in memory forensics, published under the MIT licence, with images from Windows 7 that Volatility 3 can read. If the lecturer has placed an image on the lab share, start with Lab 0, which is a worked example. The challenges are games with hidden flags. They are not part of the case and not part of the checkpoint.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. State the principle of the order of volatility, name the document that sets it out, and give one example from each end of the order.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Evidence is collected in the order in which it would be lost, from the most volatile to the least, as set out in RFC 3227. The processor's registers and cache, network state and memory are at the volatile end, and the disk and archive media such as backups are at the other end. The points that earn marks: (1) collect the shortest-lived evidence first; (2) RFC 3227; (3) one correct example from each end.
</details>

**2. An examiner captures the memory of a running laptop and saves the image to the laptop's own desktop. Give two reasons why this is wrong.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The image is as large as the memory, so writing it to the laptop's disk overwrites unallocated space, which may hold deleted files that could have been recovered. It also stores the evidence on the evidence, so that the image changes the very disk that will be imaged next. The points that earn marks: (1) it overwrites recoverable data on the disk; (2) it changes the original more than necessary, or mixes new evidence into old; (3) the image belongs on external media or a network folder.
</details>

**3. Explain why Volatility 3 needs a symbol table for the exact build of Windows, and what an examiner should record about it.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A memory image is bytes without structure, and the layout of the kernel's records differs from one build of Windows to the next, so the tool needs the description of that build to find and read them. The examiner records the version of the tool and the symbol table that it used, because wrong symbols can give wrong results without a warning. The points that earn marks: (1) the layouts differ between builds; (2) without the right symbols the tool finds nothing or reads wrongly; (3) record the tool version and the symbols.
</details>

**4. A process appears in the output of a memory scan and not in the kernel's process list. Give two explanations, and say what in the record helps to choose between them.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The process may have ended, so that the kernel removed it from the list while its record was still in memory, or it may still be running and have been removed from the list on purpose in order to hide it. An exit time points to an ended process, while a record with no exit time and live threads needs further examination. The points that earn marks: (1) an ended process whose record has not been overwritten; (2) a hidden process; (3) the exit time, or the threads, decides.
</details>

**5. A memory tool reports a private region with the protection `PAGE_EXECUTE_READWRITE` in a PowerShell process. Write the sentence that belongs in the report, and say what would be needed before the word "injected" could be used.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The report says that the process held private memory that was writable and executable, and that this is normal for PowerShell, which translates code while it runs. Before the word "injected" could be used, the examiner would need more: content in the region that is shown to be foreign code, together with supporting signs such as an unexpected parent, command line, module or connection. The points that earn marks: (1) state what was seen, not a conclusion; (2) the protection is normal for that program; (3) further evidence about the content and the process is needed.
</details>

**6. The exhibit of this session is a reconstruction on a test machine. State one thing that it can support in the unit's report on the suspect, and one thing that it cannot.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
It can support a statement about method: that actions of the kind found on the suspect's disk leave particular traces in memory, and that the unit's tools find those traces. It cannot support any statement about what was in the memory of the suspect's computer, because that memory was never captured and the test machine has its own Windows version, clock and history. The points that earn marks: (1) it shows what such actions leave, or tests the method; (2) it is not evidence of the suspect's memory; (3) the report must name it as a reconstruction.
</details>

<div class="quiz" markdown="1">

## End-of-day quiz

This quiz closes Day 3 and covers Sessions 5 and 6. Write each answer in about two sentences before you open the model answer. Mark yourself on the points you made.

<div class="sa" markdown="1">

**Q1.** Two USB sticks of the same make and model were connected to one Windows computer. Explain how an examiner keeps their records apart, and why no single artefact gives the full history of either stick. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
Each stick has its own device serial number, and the examiner reads it in full and follows it through every record, because two serial numbers of one model can differ in a single character. Each artefact answers only one question, such as the model, the first connection, the drive letter or the account, so the history must be joined from several records by that number. **Points:** (1) the device serial number, read in full; (2) each artefact holds one fact; (3) the serial number joins the facts into one history.
</details>

</div>

<div class="sa" markdown="1">

**Q2.** A log file on a seized computer records an event at 16:45:10 and stores local time. The registry of the image gives an active bias of -330 minutes. Calculate the time in UTC, and say how the event should be written in the timeline. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
UTC is the local time plus the bias, so 16:45:10 minus 5 hours 30 minutes gives 11:15:10 UTC. The timeline shows the event at 11:15:10 UTC and notes that the source recorded local time at UTC+5:30, so that another examiner can repeat the conversion. **Points:** (1) the bias is added, and a negative bias means a clock ahead of UTC; (2) 11:15:10 UTC; (3) the original clock of the source is recorded beside the converted time.
</details>

</div>

<div class="sa" markdown="1">

**Q3.** A first responder finds a running desktop computer with a user logged in, and pulls the power cable at once "to freeze the evidence". Name two kinds of evidence that this destroyed and one kind that survived, and say what should have been done first. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
Pulling the cable destroyed the contents of memory, for example the running processes with their command lines, the open network connections, unsaved text and the keys of any unlocked volume, while the files on the disk survived. Following the order of volatility, the responder should first have captured the memory to external media and recorded the action, and only then dealt with the disk. **Points:** (1) two correct volatile items; (2) the disk survives; (3) capture memory first, to external media, with a record.
</details>

</div>

<div class="sa" markdown="1">

**Q4.** An analyst captures the memory of the same computer twice, ten minutes apart, and the two images have different hash values. A colleague says that one capture must be faulty. Explain why the colleague is wrong, and what each hash value is good for. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
Memory changes all the time, and each capture itself changes it, so two captures are two different sets of bytes and must have different hash values. Each value proves only that its own image file has not changed since the value was calculated, and it cannot show that the image matches the computer. **Points:** (1) memory changes between and during captures; (2) different values are expected and neither is faulty; (3) the value protects the file from the moment of hashing, not its match with the original.
</details>

</div>

<div class="sa" markdown="1">

**Q5.** For one program, an examiner has a prefetch file from the disk and a row in the process list of a memory image. State what each record can show that the other cannot. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The prefetch file shows history: that the program ran on the computer, how many times, and when it last ran, even if it is no longer running and the memory was never captured. The process list shows the present: that the program was running at the moment of capture, with its parent, its start time and, through its command line, the options and files it was given. **Points:** (1) prefetch gives the run count and the last run, and survives a switch-off; (2) memory gives the running state, the parent and the command line; (3) each is silent where the other speaks, so they are used together.
</details>

</div>

</div>

## Coming next

Today you saw one end of a network connection: a process on one computer, and an address and a port on another. Memory could tell you which program was talking. It could not tell you what was said. In Session 7 you move to the wire itself: where traffic can be captured, what a capture holds, and how to find the files that left the building inside it.
