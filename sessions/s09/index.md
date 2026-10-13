---
session_code: S09
description: "How a suspicious program is handled safely, and how it is read without running it: hash values and file type, the parts of a Windows program file, strings and FLOSS, packing and unpacking, capabilities with capa, YARA rules, and a verdict with a stated confidence."
hook: >-
  The unit's isolated lab has seven suspicious programs to triage. Without running any of them, what is each file,
  what could it do, how sure can we be, and how would we recognise it again?
outcomes:
  - "Explain why a suspicious program is examined on an isolated machine, with a snapshot before and a revert after, and why it travels in a password-protected archive"
  - "Identify a file by its hash values and its file signature, never by its name"
  - "Identify the parts of a PE file that an analyst reads: the PE header, the PE sections, imports, exports, resources and the compile timestamp"
  - "Justify how far a compile timestamp can be trusted, and check it against other dates"
  - "Compare what strings and FLOSS find, and explain why encoded strings and stack strings need FLOSS"
  - "Identify the signs of packing, and apply UPX to unpack a sample without running it"
  - "Explain what capa reports, and why a capability is neither an action nor proof of intent"
  - "Apply a YARA rule written from a sample's strings and structure, and test it for matches and false positives"
  - "Justify a verdict with a stated confidence, and list the static indicators of compromise"
before:
  - "Explain what a [snapshot](../s00/#step-8-take-the-baseline-snapshots) is and why REMnux sits on an [isolated network](../s00/#step-5-set-the-networks-and-the-shared-folder) (Session 0)"
  - "Calculate a [hash value](../s01/#3-the-hash-value-showing-that-nothing-changed) and use it for verification (Session 1)"
  - "Explain what a [file signature](../s03/#1-carving-finding-a-file-by-its-shape) is, and that the header of a file shows its type (Session 3)"
  - "Explain what [entropy](../s04/#3-no-signature-but-not-nothing-entropy) measures, and what [timestomping](../s04/#6-timestomping-two-sets-of-dates) does to dates (Session 4)"
  - "Say what makes a good [indicator of compromise](../s08/#7-indicators-of-compromise-recognising-the-same-attack-elsewhere), and how to write one safely (Session 8)"
demos:
  - id: S09-D1
    title: "A program file, opened layer by layer"
    file: s09-d1-pe-layer-by-layer.html
    teaches: "A PE file is a map of pointers: the file signature leads to the PE header, the PE header to the PE sections, and a table to the imports, so the structure, not the name, says what the file is."
  - id: S09-D2
    title: "What strings sees, what FLOSS sees"
    file: s09-d2-strings-versus-floss.html
    teaches: "Text that a program builds one character at a time, or keeps in a changed form, never appears whole in the file, so strings misses it and FLOSS, which imitates the code, finds it."
  - id: S09-D3
    title: "Packing, and unpacking"
    file: s09-d3-packing-and-unpacking.html
    teaches: "Packing raises the entropy of one PE section and hides the imports behind two functions, and unpacking brings both back."
  - id: S09-D4
    title: "From functions to a capability"
    file: s09-d4-functions-to-capability.html
    teaches: "A capa rule joins small features, such as calls to functions, with AND and OR, and reports a capability only when the whole pattern is present."
  - id: S09-D5
    title: "One YARA rule, a small set of files"
    file: s09-d5-yara-match-miss-false-positive.html
    teaches: "A YARA rule written from one string matches the target, also matches a different file and misses a file that keeps the string encoded, and a tighter condition fixes the false positive."
slides: s09-malware-static-triage.pptx
evidence: "the lab share, folder `S09`: a read-only disc image that holds the unit's password-protected archive of teaching samples (the lab steps say exactly which files)"
---

On Day 4 you watched an infected computer from the outside, through its traffic. You saw that programs arrived and what the computer did afterwards. You never opened a program. Day 5 opens one, carefully. Today you read suspicious programs without running them. In Session 10 you run one, under strict rules, and watch what it does.

The unit owes you three plain statements first.

**Where today's programs come from.** The program that infected the computer of Session 8 is live malware, and it is never opened in a classroom, so the unit trains this method on samples written for teaching, whose behaviour is documented. Today's programs are not from that computer, and they are not from the suspect.

**What they are.** They are the lab programs of the book *Practical Malware Analysis* by Michael Sikorski and Andrew Honig, which many analysts learned from. The authors wrote them to behave like real malicious programs, and they contain real malicious code. So the unit handles them exactly as it would handle live malware. Their dates and names are their own, and this page shows them as the tools show them.

**What today does not do.** Nobody runs these programs today, on any machine. Everything in this session is reading. Running a program and watching it belongs to Session 10.

The question for today is the first one that any analyst asks of a suspicious file: what is it, and what could it do? By the end of today you can answer it for a program you have never seen, with evidence, and say how sure you are.

## 1. Handle first, read second

### The idea

Before anyone reads a suspicious program, the program must be put somewhere it cannot hurt anything. This order never changes.

A program written to harm a computer, its data or its user is called {% include term.html t="malware" %}. One copy of a suspicious file, kept unchanged for examination, is a {% include term.html t="sample" %}. Today you handle seven samples.

A sample can do nothing while it is only data on a disk. The danger begins the moment something runs it. A careless double-click is enough. So the rules of this section have one aim: to make sure nothing runs the sample, and that if something does, no harm can leave the machine and the machine can be put back.

### How it works

**Rule 1: the right machine.** You examine the samples on the REMnux VM that you built in Session 0. REMnux is a Linux system made for malware analysis. The samples are Windows programs, and a Windows program does not run on Linux by itself. That is a strong first barrier.

It is not a complete barrier. REMnux also carries a tool called Wine, which can run many Windows programs on Linux, and it carries emulators that imitate a Windows computer for one program. Analysts use them on purpose, in Session 10's kind of work. A double-click on a sample in the REMnux file manager can start Wine. So today you work in the terminal only, you never double-click a sample, and you never type `wine`. The rules below protect you even if someone forgets.

**Rule 2: the isolated network.** Session 0 put REMnux on an {% include term.html t="isolated-network" %}: it can talk only to other VMs on the same closed network, and it has no path to the internet. Session 0 also removed the shared folder and the shared clipboard. So if a sample ever ran, it could not reach the internet, your host machine or your other VMs. Today the Windows VM stays off that network. It joins it only in Session 10, for one lab.

**Rule 3: a snapshot before, a revert after.** You take a {% include term.html t="snapshot" %} of the clean REMnux VM before any sample arrives. At the end you return to it. Whatever happened in between, and whatever you missed, disappears. The VM leaves the session exactly as clean as it entered.

**Rule 4: the sample travels closed.** The samples arrive in an archive that is protected by a password, on a disc image that cannot be written. The password stops a virus scanner, or a careless click, from opening the files on the way. The disc image is one-way: it carries files into REMnux, and nothing can be written back onto it.

**Rule 5: never on the host, never on the everyday Windows VM.** Your host machine holds your own files and has the internet. Your Windows VM has a NAT adapter and a shared folder. Either one is exactly what a sample should never reach.

**Rule 6: nothing comes out.** Your findings leave REMnux in one way only: you write them down, on paper or in a file on your host machine that you type yourself. You never copy a file out of REMnux.

**Looking up and uploading are different.** Online services keep the hash values of millions of known files. If you type a sample's {% include term.html t="hash-value" %} into such a service, you ask a question and reveal almost nothing. Uploading the sample itself is different. The file is then shared with the service's partners, and paying users can download it. If the file came from a client, you have just given the client's file away: it may hold the client's names, paths or documents. The attacker may also watch these services to learn that someone has found the file. So a client's sample is never uploaded without the client's permission. A hash value may be looked up.

<div class="box metaphor" markdown="1">

**The comparison.** Handling a sample is like a bomb-disposal team examining a suspicious parcel. They do not open it in the office. They move it, closed, into a sealed room, and they look at it with an X-ray before anyone touches it.

**Why it fits.** The sealed room is the isolated network. The closed transport is the password-protected archive on a disc that cannot be written. The X-ray is static analysis: it shows what is inside without setting anything off. And the team's first question is the same as yours: what is it, before what does it do.

**Where it breaks.** A parcel stays where it is put. A program can copy itself, and it can reach out along any network path that someone left open, which is why the room must have no door to the internet at all. A parcel also cannot be set off by looking at it, but a sample can be run by one wrong click. And a bomb room cannot be put back to its earlier state after an accident. A VM can, which is why the snapshot is taken first.

**So what.** The rules are about removing every path: the path to running, the path out of the machine, and the path to staying changed. Check all three before the first sample arrives.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A colleague says: "REMnux is Linux, so a Windows sample can never run on it. We do not need the snapshot." What is the best answer?</p>
  <ul class="qc-opts">
    <li data-key="a">The colleague is right, but the snapshot costs nothing, so take it anyway</li>
    <li data-key="b">The snapshot is needed only because the samples might damage Linux files by being copied</li>
    <li data-key="c">REMnux carries Wine and emulators that can run Windows programs, so one wrong click can run a sample; the snapshot makes sure the VM can be put back whatever happened</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Linux does not run Windows programs by itself, but REMnux carries tools that can. The snapshot is the barrier that still holds when another one fails. Option (a) accepts a false premise. Option (b) is wrong: copying a file does not run it.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Why the password is often "infected", what a real laboratory adds, and the law</summary>

**The password.** Collections of malware are shared in archives whose password is well known among analysts, often `infected`. The password is not a secret. It is a safety catch: a scanner cannot open the archive, and nobody opens it by accident. The unit's archive uses its own password, which the lecturer gives in class.

**What a real laboratory adds.** Organisations that examine malware every day keep a separate network with no link to their own, dedicated computers that are rebuilt often, and a written procedure for receiving, storing and destroying samples. Some keep a "sample store" where each sample is kept under its hash value, never under its original name. Today's lab is a small version of the same idea.

**The law.** Many countries have laws against making, giving out or using programs for attacks on computers. Possessing samples for defensive analysis is generally accepted, but how a sample is stored and shared matters. Keep samples inside the lab, never send one by mail, and never publish one. Session 17 returns to the law.

**When a sample may be uploaded.** Some organisations upload samples to public services on purpose, to warn others. That is a decision for the owner of the file, in writing, never for the analyst alone.
</details>

<div class="box key" markdown="1">

A suspicious program is handled before it is read: on an isolated machine that is not built to run it, after a snapshot, in a closed archive that arrives one way, and never on the host or the everyday Windows VM. A hash value may be looked up; a client's sample is never uploaded.

</div>

## 2. Reading without running: what is this file?

### The idea

Examining a program by reading its file, without ever running it, is called {% include term.html t="static-analysis" %}. It is the first stage of malware triage, and it is the safest. Session 10 adds the second stage, running the program and watching it.

The first question of static analysis is the simplest: what is this file? The answer comes in two steps, always in this order. First the hash values, which say exactly which file you hold. Then the type, which comes from the file's own bytes, never from its name.

### How it works

**Hash values first.** You calculate the hash values of every sample before you do anything else, as Session 1 taught for a forensic image. They do three jobs today.

- They prove that the sample you examine is the sample you received, unchanged. You compare them with the evidence register.
- They name the sample. Two analysts who hold the same hash value hold the same file, whatever it is called.
- They are the first indicator of compromise of any triage, as Session 8 said: exact, and short-lived.

Analysts usually give two hash values: MD5, because many older reports and collections use it, and SHA-256, because MD5 is no longer safe against deliberate collisions. You give both.

**The type comes from the bytes.** A file's name is a label that anyone can change. A program can be called `invoice.pdf`. Session 3 taught the honest test: the {% include term.html t="file-signature" %}, the fixed bytes at the start of the file, in its {% include term.html t="header" %}. Every Windows program starts with the two bytes `4D 5A`, the letters `MZ`. Session 6 met the same two letters at the start of a program in memory.

The tool `file` reads those bytes and the structure behind them. For one of today's samples it prints:

```
Lab01-01.exe: PE32 executable (console) Intel 80386, for MS Windows, 3 sections
```

Every word comes from inside the file. "PE32" is the format, "console" is the kind of window, "Intel 80386" is the processor family, and "3 sections" counts the PE sections of the file, which the next part of this page explains. The tool **Detect-It-Easy** goes one step further. Its command-line form, `diec`, also names the program that built the file, and it recognises many tools that hide a program's contents.

<div class="box metaphor" markdown="1">

**The comparison.** Static analysis is like reading a recipe without cooking it.

**Why it fits.** The list of ingredients tells you a lot: flour, eggs and sugar suggest a cake, not a soup. A program's file has the same kind of list: the functions it needs and the texts it carries. You learn what the program could make without lighting the oven, and nothing can burn while you read.

**Where it breaks.** A recipe is written to be read. Malware is often written not to be. Its author can write the recipe in code, which is packing (section 5), or list ingredients that are never used, as a decoy. And a recipe tells you what can be cooked, never what was cooked: a program that can delete files may never delete one.

**So what.** Static analysis gives you hypotheses about the program, quickly and safely. Some of them need running the program to test, and that is Session 10.

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "It is called report.pdf, so it is a document." | "Its first bytes are `4D 5A`, so it is a Windows program, whatever its name." | A name is a label. The bytes are the file. |
| "The two files have the same name, so they are the same sample." | "The two files have the same SHA-256 value, so they are the same file." | Only the hash value identifies the content. |
| "Static analysis proves what the program did." | "Static analysis shows what the program could do." | Reading the file never shows that the code ran. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A sample arrives as <code>holiday-photo.jpg</code>. Its first two bytes are <code>4D 5A</code>. What do you write on the triage sheet?</p>
  <ul class="qc-opts">
    <li data-key="a">A JPEG picture, because of the name</li>
    <li data-key="b">A Windows program with a misleading name, after the hash values</li>
    <li data-key="c">A damaged picture, because a JPEG should begin with <code>FF D8 FF</code></li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The file signature <code>MZ</code> marks a Windows program, and the name is only a label that someone chose. A program disguised as a picture is itself a finding. Option (c) assumes that the name is true and the content is wrong; the content is the evidence.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Fuzzy hashes, and why identical names mislead collections</summary>

**Fuzzy hashes.** A hash value changes completely when one byte changes, so two versions of the same malware share none. Analysts also use "similarity" hashes, such as ssdeep and TLSH, which give similar values for similar files, and an import hash, which is calculated from the list of imports of section 3. They help to group samples. They never replace SHA-256 for identifying one file.

**Names in collections.** Collections often rename samples to their SHA-256 value, so that a name cannot mislead and two copies cannot collide. Today's samples keep the names that the book gave them, because the evidence register and the book's own lists use those names.
</details>

<div class="box key" markdown="1">

Identify a sample in two steps, always in this order: hash values first (MD5 and SHA-256), then the type from the file signature and the structure. The name is never evidence of the type.

</div>

## 3. The PE file, as an analyst reads it

### The idea

Windows programs are stored in one format, the {% include term.html t="pe-file" %}. PE stands for Portable Executable. Programs ending in `.exe` are PE files, and so are files ending in `.dll`.

A PE file is not one long block of code. It is organised like a book: a title page, a table of contents, chapters, and a list of the other books it borrows from. Windows reads that organisation every time it loads a program. You read the same organisation to learn what the program is built to do.

### How it works

**The PE header.** The first bytes are an old header from the time of MS-DOS. It starts with `MZ`, and it usually holds the sentence "This program cannot be run in DOS mode." At a fixed place in it, a number points to the real start of the program's description: the {% include term.html t="pe-header" %}. The PE header begins with the bytes `50 45 00 00`, the letters `PE` and two zero bytes. It tells Windows:

- the type of processor (`0x14C` means a 32-bit Intel processor);
- how many PE sections follow;
- the date and time written when the program was built;
- whether the file is a program or a DLL;
- where the first instruction is, called the entry point.

**The PE sections.** Each {% include term.html t="pe-section" %} is one named block of the file with its own size and its own rights. The usual names are:

| Name | What it usually holds | Usual rights |
|---|---|---|
| `.text` | The program code | Read and run |
| `.rdata` | Data that is only read, such as fixed texts and the import list | Read |
| `.data` | Data that the program changes while it runs | Read and write |
| `.rsrc` | Resources (below) | Read |
| `.reloc` | Information for loading the program at another place in memory | Read |

Every PE section has two sizes: its size in the file, and its size in memory when Windows loads it. They are usually close. A PE section that is empty in the file but large in memory is space that something will fill at run time. Remember that for section 5 of this page.

**Imports.** Most programs do not do everything themselves. They borrow ready-made functions from Windows. Those functions live in a {% include term.html t="dll" %}, a file of program code that other programs load in order to use its functions. A function that a program lists in its own file because it needs it is an {% include term.html t="import" %}. The list names each DLL and each function.

The import list is the most telling page of a program for an analyst, because the functions have plain names:

| Imports like these | Suggest that the program can |
|---|---|
| `socket`, `connect`, `send`, `recv` (from `WS2_32.dll`) | Talk over a network |
| `InternetOpenA`, `InternetOpenUrlA` (from `WININET.dll`) | Fetch something from a web address |
| `CreateServiceA`, `OpenSCManagerA` (from `ADVAPI32.dll`) | Install itself as a Windows service, which starts with Windows |
| `RegSetValueExA` (from `ADVAPI32.dll`) | Write to the registry |
| `CreateProcessA`, `WinExec` | Start other programs |
| `FindResourceA`, `LoadResource` | Read data stored inside its own file |
| `LoadLibraryA`, `GetProcAddress` | Find more functions while it runs, without listing them here |

The last row matters most. A program can load any DLL and find any function while it runs, using only these two imports. Those functions then never appear in the list. A short import list that contains these two is a warning sign, and section 5 of this page explains the commonest reason.

**Exports.** A DLL does the opposite of importing: it offers functions to other programs. A function that a DLL offers and lists by name is an {% include term.html t="export" %}. The names of the exports of a malicious DLL often say what it is for: `ServiceMain` and `Install` suggest a DLL that is run as a Windows service. A DLL with no exports at all is unusual: other programs cannot call it by name, so its code runs mainly through the one function that Windows calls when the DLL is loaded.

**Resources.** A {% include term.html t="resource" %} is data stored inside a program file for the program's own use: an icon, a menu, a piece of text, a version number. A resource can also hold a whole other file. Look at the first bytes of every resource. A resource that begins with `MZ` holds a second Windows program inside the first.

**The compile timestamp.** The PE header holds the date and time written when the program was built, the {% include term.html t="compile-timestamp" %}. It is stored as a number of seconds since 1 January 1970, UTC, and tools show it as a date. On an honest program it tells you when the author built it.

It is not evidence on its own. Anyone who controls the file can change the number with a few keystrokes, as Session 4 showed for the dates of a file system: this is {% include term.html t="timestomping" %} inside the file. Authors of malware set it to zero, to a random date, or to a date that copies a well-known program. Some honest build tools write a fixed value or a code that is not a date at all. So you report the compile timestamp exactly as recorded, and then you judge it against other dates:

- Is it possible? A date in 1970 means the number is zero. A date in the future is impossible.
- Does it agree with dates outside the file? The date when the file was first recorded, in an archive, a log or a collection, must come after it.
- Does it agree with dates inside the file? Some PE files carry dates in other places, and a program stored inside a resource has its own PE header and its own date.

{% include demo.html id="S09-D1" %}

<div class="box metaphor" markdown="1">

**The comparison.** A PE file is like a book: the PE header is the title page and the table of contents, the PE sections are the chapters, and the import list is the bibliography, the list of other books it borrows from.

**Why it fits.** You learn a great deal about a book before reading any chapter. The table of contents shows its shape, and the bibliography shows its subject: a book that cites ten texts on chemistry is probably about chemistry. A program that imports ten network functions is probably built to talk over a network. And the date on the title page says when the book was printed.

**Where it breaks.** A book cannot hide its sources once it is printed. A program can borrow functions while it runs, with `LoadLibraryA` and `GetProcAddress`, so its bibliography can be nearly empty and still be honest about nothing. A program can carry a second book inside one of its chapters, in a resource. And the date on the title page can be printed falsely by anyone who holds the file.

**So what.** Read the import list as a strong clue, and its absence as a clue too. Treat the compile timestamp as a claim to check, never as a fact.

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A sample's PE header gives a compile timestamp three years after the date on which the sample was first stored in a collection. What is the best reading?</p>
  <ul class="qc-opts">
    <li data-key="a">The compile timestamp cannot be true, because a program cannot be stored before it is built; it was changed or written falsely</li>
    <li data-key="b">The collection's date is wrong, because the PE header is written by the compiler</li>
    <li data-key="c">The program was built twice, so both dates are right</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The date outside the file sets a limit: the program existed by then, so it was built before then. The compiler writes the value, but anyone who controls the file can change it afterwards. Option (c) would give a different file with a different hash value, and the collection holds this exact file.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The headers in detail, the Rich header, and where other dates hide</summary>

**Two headers, one file.** The MS-DOS header has a value called `e_lfanew` at offset `0x3C`. It holds the offset of the PE header. Between the two sits a tiny MS-DOS program that prints the "cannot be run in DOS mode" sentence. After the signature `PE` come the file header (processor, number of PE sections, compile timestamp, flags) and the optional header (entry point, the address where the program prefers to be loaded, the subsystem such as console or graphical window, and a table of sixteen directories that point to the import table, the export table, the resources and more). The optional header is not optional for programs; the name is historical.

**Addresses and offsets.** A position in the file is an offset. A position in memory after loading is a relative virtual address. The PE section table translates between the two. Tools do this for you, but it explains why a value in a tool can look different from the place where you find it in a hex view.

**The Rich header.** Programs built with Microsoft's tools usually carry a hidden record, between the MS-DOS part and the PE header, of the tools and versions that built them. Detect-It-Easy reads it to name the compiler. Authors of malware sometimes copy it from another program to mislead.

**More dates.** The export table, the resource directory and the debug directory each have a field for a date. Many tools leave them at zero. When they are filled, they can be compared with the compile timestamp. Microsoft's linker, when asked for reproducible builds, writes a code calculated from the content in place of a date, so a modern honest program can show a "date" that is nonsense.

**Signatures.** A PE file can carry a digital signature of its publisher. A valid signature from a known publisher is evidence of origin. A missing signature proves nothing, and signatures have been stolen.
</details>

<div class="box key" markdown="1">

A PE file is read in layers: the file signature `MZ`, the PE header, the PE sections with their names and sizes, the imports and exports, the resources, and the compile timestamp. The imports say most about what the program is built to do. The compile timestamp is a claim to be checked against other dates.

</div>

## 4. Strings, and what FLOSS finds that strings misses

### The idea

A program carries texts: messages, file names, registry paths, web addresses, the names of the functions it imports. They are often the fastest clue to what it does. The classic tool `strings` lists every run of readable characters in a file, four or more in a row by default.

But a program that does not want to be read can keep its important texts out of sight. It can store a text in a changed form and change it back only while it runs. Or it can build the text one character at a time while it runs, so the whole text never sits in the file. `strings` cannot see either.

### How it works

**What strings finds.** `strings` does not understand the file. It reads the bytes from start to end and prints every run of printable characters. You get the real texts mixed with noise: short runs that happen to be printable, pieces of code, the names of the imports. On a normal program that is already useful: you search the list for web addresses, file names, registry paths and words like "password" or "service".

**Two ways to hide a text.**

1. An {% include term.html t="encoded-string" %} is a text stored in a changed form, so that it cannot be read until the program changes it back. A common way is to combine each byte with a key using an operation called XOR, which turns readable letters into unreadable bytes. The program runs the same operation again when it needs the text.
2. A {% include term.html t="stack-string" %} is a text that the program puts together one character at a time while it runs. The code says, in effect: put `w` here, put `w` next, put `w` next, put `.` next. Each letter sits in a separate instruction, so no run of readable characters exists in the file.

**What FLOSS adds.** **FLOSS**, a free tool from the company Mandiant, does what `strings` does first, and then it goes further. It finds the functions of the program that build or decode texts and imitates them, step by step, without running the program. Imitating code in this way is called emulation. What the imitated code produces, FLOSS prints. Its report has four parts:

| FLOSS part | What it finds |
|---|---|
| Static strings | The same readable runs that `strings` finds |
| Stack strings | Texts built one character at a time in one function |
| Tight strings | Stack strings that are also decoded in a small loop |
| Decoded strings | Texts that a decoding function produces from encoded data |

Emulation is not running the program. FLOSS imitates a few small functions in a closed copy of the code. The program never starts, never touches the network, and never reaches Windows. That is why FLOSS is a tool of static analysis.

{% include demo.html id="S09-D2" %}

**What the hiding tells you.** A program that hides its texts is telling you something by hiding them. Honest programs rarely build their file names character by character. So when FLOSS finds stack strings or decoded strings, two things go on the triage sheet: the texts themselves, and the fact that they were hidden.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "strings found no web address, so the program contacts no server." | "strings found no readable web address. FLOSS or a run of the program may still show one." | A text can be encoded or built at run time. |
| "FLOSS ran the program." | "FLOSS imitated a few of the program's functions." | Emulation never starts the program or touches the network. |
| "Every text that FLOSS prints is evidence." | "The static strings include noise and the names of imports. Read them for meaning." | Any run of four printable bytes is printed. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q"><code>strings</code> finds 156 texts in a sample. FLOSS finds the same 156 static strings, plus 2 stack strings and 3 decoded strings. Which statement is right?</p>
  <ul class="qc-opts">
    <li data-key="a">FLOSS found 5 false positives, because they are not in the file</li>
    <li data-key="b">The 5 extra texts were added by FLOSS from its own list of known malware texts</li>
    <li data-key="c">The 5 texts exist only when the program's code puts them together or decodes them, and the hiding itself is worth recording</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The texts are produced by the program's own code, which FLOSS imitated, so they are real but hidden. Option (a) confuses "not readable in the file" with "not there". Option (b) is wrong: FLOSS reports only what the code of this file produces.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Wide strings, how FLOSS chooses functions, and its limits</summary>

**Wide strings.** Windows often stores text in UTF-16, with two bytes for each character: `w`, zero, `w`, zero. The default `strings` misses these. `strings -e l` finds them, and FLOSS looks for both forms by itself.

**How FLOSS chooses.** FLOSS first maps the functions of the program. It scores each function by features that decoding routines tend to have, such as loops with XOR, and emulates the most likely ones with many different inputs. For stack strings, it watches the stack of every function while it imitates it.

**Its limits.** FLOSS can miss decoding that depends on something outside the program: a key downloaded from a server, the name of the computer, or the date. It can also stop on code that is packed, because the code it should imitate is not there yet. A packed sample needs unpacking first, which is section 5 of this page.

**Other tools.** REMnux carries Didier Stevens's `xorsearch.py`, which searches for texts hidden with simple XOR and similar operations, and `base64dump.py`, which finds and decodes Base64.
</details>

<div class="box key" markdown="1">

strings lists readable runs of bytes. FLOSS lists the same and also imitates the program's own code to recover encoded strings and stack strings, without running the program. A hidden text is a finding twice: for what it says, and because it was hidden.

</div>

## 5. Packing: when a program hides its own contents

### The idea

Some programs arrive wrapped. Their real code and data have been compressed or encrypted into one block, and a small piece of new code has been added at the front. When the program runs, that small piece restores the original in memory and then hands over to it. On the disk, only the wrapping is visible.

A program that does this wrapping is a {% include term.html t="packer" %}. Getting the original program back is {% include term.html t="unpacking" %}. Packing has honest uses: it makes a file smaller. Authors of malware use it for another reason. It hides the very things that sections 3 and 4 read: the imports, the texts and the code.

### How it works

**What packing changes.** Compare one program before and after packing.

| | Before packing | After packing |
|---|---|---|
| PE sections | `.text`, `.rdata`, `.data`, with ordinary names | Fewer, often with unusual names, such as `UPX0` and `UPX1`, or empty names |
| Entropy | Moderate, as for code and text | One PE section close to 8, because compressed or encrypted data uses all byte values evenly |
| Sizes | Each PE section about as large in the file as in memory | One PE section empty in the file but large in memory: the space where the original will be restored |
| Imports | Dozens of functions that show what the program does | A handful: `LoadLibraryA` and `GetProcAddress`, functions to reserve and protect memory, and often one function from each DLL that the original needs |
| Readable strings | Many | Few |
| Entry point | In `.text`, the program's own code | In the small piece of code that unpacks |

Each sign alone has an innocent explanation. Together they make a strong case.

**One figure hides the parts.** Session 4 taught {% include term.html t="entropy" %} and warned that one figure for a whole file hides its parts. Packed programs show why. One of today's samples has an entropy of 5.25 for the whole file, which looks ordinary. Its PE section `UPX1` has 7.07, and its PE section `UPX0` has no bytes in the file at all. Always read the entropy of each PE section, not only of the whole file.

**Recognising the packer.** Detect-It-Easy carries thousands of descriptions of packers, compilers and other tools, and names the one it recognises. For the sample above it prints `Packer: UPX(3.04)[NRV, best]`. With the option `-e` it prints the entropy of each part of the file and marks parts that look packed.

**Unpacking UPX without running it.** UPX is a free, open-source packer. Its own program can reverse what it did, with the option `-d`, because the format is published. This is unpacking without running anything: UPX reads the packed data, restores the original program and writes it as a new file. You always unpack a **copy**, and you record the hash values of both files, because the unpacked file is a new item with its own hash value. After unpacking, the imports and the strings come back, and you read them as in sections 3 and 4.

**When unpacking fails.** Most packers are not UPX, and many are written to resist unpacking. For them there is no single tool. Analysts let the program unpack itself in memory, under watch, and then copy the restored code out of memory. That needs running the program, so it belongs to Session 10's kind of work, and beyond this module to specialised courses. For today, a sample that you cannot unpack gets an honest line on the triage sheet: packed with a packer that was not identified or not reversible, so its imports, strings and capabilities are not visible statically.

{% include demo.html id="S09-D3" %}

<div class="box metaphor" markdown="1">

**The comparison.** A packed program is like a document sent as a compressed archive with its own small unzipping program attached, which opens automatically when you click on it.

**Why it fits.** The archive is the high-entropy PE section: dense, unreadable, every byte value used. The attached unzipping program is the small piece of code at the entry point, and it needs only a few functions, which is why the import list shrinks. The real document, like the real program, exists in readable form only after it is opened.

**Where it breaks.** An ordinary archive can be opened by any unzipping tool. A packer can encrypt, use its own secret format, or even translate the original code into a new invented language, so no general tool opens it. A packed program also opens itself in memory, never on the disk, so its readable form may never exist as a file. And many honest programs are packed, so the wrapping alone does not make the content malicious.

**So what.** Treat packing as a reason for suspicion and as a limit on what static analysis can see. Unpack when the packer is known and reversible. When it is not, say so, and hand the sample to behavioural analysis.

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "It is packed, so it is malware." | "It is packed, which hides its contents and is common in malware. The contents decide." | Honest programs are packed too. |
| "upx -d failed, so it is not packed." | "It is not packed with a UPX format that upx can reverse. The other signs still decide." | Most packers are not UPX, and some imitate it. |
| "The whole file has entropy 5.2, so it is not packed." | "One PE section has entropy 7.1, so part of it is packed or encrypted." | One figure for a whole file hides its parts. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A sample imports only <code>LoadLibraryA</code> and <code>GetProcAddress</code>. One PE section has entropy 7.4 and three bytes of readable text. <code>upx -d</code> reports that the file is not packed by UPX. What goes on the triage sheet?</p>
  <ul class="qc-opts">
    <li data-key="a">Not packed, because UPX says so</li>
    <li data-key="b">Packed with a packer that was not reversed, with the three signs; imports, strings and capabilities are not visible statically</li>
    <li data-key="c">Encrypted data file, not a program, because it has no real imports</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Few imports with the two functions for finding more, and one PE section close to 8, are the signs of packing. UPX can only reverse its own format. Option (c) ignores the file signature and the PE structure, which make it a program.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Modified UPX, protectors, and unpacking in a debugger</summary>

**Modified UPX.** UPX writes a small marker, the letters `UPX!`, and some information that it needs to unpack. Authors of malware sometimes change those bytes or the PE section names, so that the file still runs but `upx -d` refuses it. Repairing the marker by hand can make `upx -d` work again. It is a well-known exercise, and it changes a copy, never the sample.

**Protectors.** Some tools go beyond packing. They check whether they are being debugged, encrypt code in layers, or translate the original code into a private language that their own small interpreter runs. These are often called protectors. Commercial software uses some of them against copying.

**Unpacking in a debugger.** The general method is to run the sample in a debugger on an isolated Windows machine, stop it when the unpacking code jumps to the restored code (the "original entry point"), copy the memory to a file and rebuild its import list. Tools for it include x64dbg with the Scylla plugin. Disassemblers such as Ghidra are then used to read the restored code. All of this runs the sample, and it is beyond this module.
</details>

<div class="box key" markdown="1">

A packer compresses or encrypts a program and adds code that restores it in memory. The signs are a PE section with entropy close to 8, a PE section empty in the file but large in memory, few imports with `LoadLibraryA` and `GetProcAddress`, unusual PE section names and few strings. UPX can be unpacked without running the sample; most other packers cannot.

</div>

## 6. Capabilities: what the code can do

### The idea

Imports and strings are clues one at a time. An analyst wants a sentence: this program can create a service, can contact a web address, can read its own resources and write them to disk. Each such statement is a {% include term.html t="capability" %}: something the code is able to do, whether or not it ever does it.

The free tool **capa**, also from Mandiant, writes those sentences for you. It reads the program's code and compares it with hundreds of written descriptions, and it reports the capabilities that it finds.

### How it works

**What capa reads.** capa finds the program's functions and collects small features in each one: the functions of Windows that it calls, fixed numbers, texts, and structural facts such as "this file contains a second PE file". Each {% include term.html t="capa-rule" %} describes one capability as a pattern of such features, joined with AND and OR. A capa rule for "create a service" may say: within one function, a call to `OpenSCManager` AND a call to `CreateService`. When the whole pattern is present, capa reports the capability.

{% include demo.html id="S09-D4" %}

**What capa prints.** For one of today's samples, after unpacking, capa prints among others:

```
ATT&CK Tactic         ATT&CK Technique
EXECUTION             System Services::Service Execution [T1569.002]
PERSISTENCE           Create or Modify System Process::Windows Service [T1543.003]

Capability                      Namespace
create service                  host-interaction/service/create
persist via Windows service     persistence/service
connect to URL                  communication/http/client
```

The output is shortened here. Read it in three parts.

- **The capability and its namespace.** "create service" is the plain statement. The namespace, `host-interaction/service/create`, places it in a tree of kinds of capability.
- **ATT&CK.** {% include term.html t="mitre-attack" %} is a public catalogue of the methods that attackers use, kept by the organisation MITRE. A tactic is the attacker's aim, such as persistence: staying on the computer after a restart. A technique is a way to reach that aim, with a number, here T1543.003, "Windows Service". capa adds these numbers so that your report speaks the language that other analysts and other tools use.
- **MBC.** The {% include term.html t="mbc" %}, the Malware Behavior Catalog, lists what malware does in the same style, with numbers such as C0002.004 for opening a web address. Where ATT&CK describes attackers, MBC describes malicious programs.

**What a capability is not.** This is the most important paragraph of the section.

1. **It is not an action.** capa reports that the code to do something is present. It does not report that the code ran. A program may check the date or the name of the computer and stop long before it reaches that code. Only Session 10's method can show what ran.
2. **It is not proof of intent.** Honest programs create services, contact web addresses and read their own resources every day. A backup program reads every file on a disk. A capability says what the code can do; why it was written comes from all the evidence together.
3. **It is not complete.** capa sees only what its capa rules describe, and only code that it can read. On a packed sample it warns that its results may be incomplete, and on some packed samples it prints "no capabilities found". No capability found is not evidence of an honest program.

<div class="box lens" markdown="1">

**Through another lens: theory of mind.** Psychologists use the name theory of mind for our ability to think about what another person wants, believes or plans. A classic test for young children uses two dolls: one puts a marble in a basket and leaves the room, the other moves the marble into a box. Where will the first doll look for it? A child who answers "in the basket" understands that another mind holds a belief that differs from the truth. Adults use the same ability all day, from little evidence. A stranger near a locked gate at night with rope, gloves and a crowbar makes us infer a plan. Criminal profilers do the same, more carefully, from what an offender left behind.

Static analysis is theory of mind for a program. From what the code carries, its imports, its strings, its resources and its capabilities, you infer what its author wanted it to do. That is why a list of capabilities feels like an answer.

**Where it breaks.** Carrying is not doing: the crowbar may never be used, and a capability may never run. Things can be carried to mislead: a decoy text, a copied date, a capability that the author left in on purpose to send you the wrong way. And a closed bag shows nothing: packing hides exactly the evidence that the inference needs.

**The question it raises.** When you write "this program is designed to stay on the computer and contact a server", which parts did you read in the file, and which parts did you infer about a mind you have never met?

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "capa says it creates a service, so it created a service." | "capa found code that can create a service." | Static analysis never sees the code run. |
| "capa found nothing, so the file is harmless." | "capa found no capability that its capa rules describe, in code that it could read." | Packing and unknown code hide capabilities. |
| "T1543.003 means the attacker achieved persistence." | "The code can use the technique T1543.003." | The number names a method, not an event. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">capa reports "persist via Windows service" for a sample. In Session 10 the sample runs and no new service appears. Which statement is consistent with both results?</p>
  <ul class="qc-opts">
    <li data-key="a">The code to create a service is present, and something stopped the program before it reached that code, or the service was created and later removed</li>
    <li data-key="b">capa was wrong, because a capability that does not happen is a false positive</li>
    <li data-key="c">The monitoring tools of Session 10 failed, because capa is static and therefore certain</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). A capability is what the code can do; the run shows what it did this time. Both can be true. Option (b) treats a capability as a prediction of an action. Option (c) treats a static finding as stronger than an observation, when each answers a different question.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How a capa rule is written, scopes, and the version of the rules</summary>

**A capa rule is a text file.** Each one has a name, a namespace, its ATT&CK and MBC numbers, a scope, and the pattern. The pattern can combine features with `and`, `or`, `not`, and counts such as "at least two of". The capa rules are published openly, so anyone can read why a capability was reported.

**Scopes.** A pattern can be required within one basic block (a run of instructions with no jumps), within one function, or anywhere in the file. "Within one function" is the usual choice: two calls in the same function are much more likely to belong to one action than two calls at opposite ends of the program.

**The version matters.** capa's results depend on the version of the program and of its rules. The REMnux version of capa carries its rules inside the program, so it works without the internet. A newer version may report a capability that an older one did not. Write the version on your triage sheet, as you wrote the ruleset of Session 8.

**Beyond capa.** Analysts read the code itself with a disassembler, which turns machine code back into instructions, or a decompiler, which tries to rebuild a high-level language. Ghidra, a free tool from the US National Security Agency, does both. Reading code in this way is the next step after triage and is beyond this module.
</details>

<div class="box key" markdown="1">

capa reports capabilities: what the code can do, named in plain words, in a namespace, and with ATT&CK and MBC numbers. A capability is not an action, not proof of intent, and never a complete list.

</div>

## 7. YARA rules: describing a sample so it can be found again

### The idea

At the end of a triage, the client asks Session 8's question again: is it anywhere else? A hash value finds only exact copies. Analysts need a description that also finds near-copies of the same program, in a whole folder or a whole disk.

A {% include term.html t="yara-rule" %} is that description. It is a short text that lists the strings and other features of a group of files, and a condition that says how many of them must be present. The free tool **YARA** reads YARA rules and reports every file that matches. YARA only reads and reports. It never changes or runs a file.

### How it works

**The parts of a YARA rule.** Here is a YARA rule for a made-up training sample.

```
rule unit_training_sample_x
{
    meta:
        description = "Recognises the unit's made-up training sample X"
        author = "NB6018 unit"
    strings:
        $name = "unit-helper.exe" ascii
        $site = "files.example.net" ascii wide nocase
        $path = "\\Temp\\unit-cache\\" ascii
    condition:
        uint16(0) == 0x5A4D and filesize < 200KB and 2 of ($name, $site, $path)
}
```

- **The name** after `rule` identifies the YARA rule in every match that YARA prints.
- **`meta`** holds notes for people: what it detects, who wrote it, where the sample came from. YARA does not test them.
- **`strings`** lists what to look for. Each string has a name that starts with `$`. `ascii` looks for one byte for each character, `wide` for the two-byte form of Windows, and `nocase` ignores capital letters. A string can also be bytes, written in hexadecimal between braces, such as `{ 4D 5A 90 00 }`. Inside quotes, a backslash is written twice.
- **`condition`** says when the YARA rule matches. `uint16(0) == 0x5A4D` reads the first two bytes of the file and checks for `MZ`. Note the order: the value `0x5A4D` is the two bytes `4D 5A` read as one number in the way Intel processors store numbers. `filesize < 200KB` keeps the YARA rule away from large files. `2 of (...)` asks for any two of the three strings.

**Writing one from a sample.** Choose features that this sample has and other files are unlikely to have.

- Good: unusual file names, paths, service names and web addresses that the sample carries; a text that only this program would contain; a combination of two or three of them.
- Poor: the names of common imports, such as `CreateFileA`, which thousands of honest programs carry; the sentence "This program cannot be run in DOS mode", which every Windows program carries; a single short string.
- Add structure: the `MZ` check and a size limit cost nothing and remove whole kinds of false matches.

**Testing it.** A YARA rule is only as good as its tests. Run it over the sample: it must match. Run it over every other file you have: it should match none of them. A match on a file that the YARA rule was not written for is a {% include term.html t="false-positive" %} for that YARA rule's purpose, even when the other file is also malware. A miss on a near-copy of your sample is a {% include term.html t="false-negative" %}. Analysts in organisations also run new YARA rules over a large collection of honest files before they use them.

{% include demo.html id="S09-D5" %}

**YARA rules and IDS rules.** Session 8 read rules for an intrusion detection system. The two kinds are related, and the differences matter.

| | IDS rule (Session 8) | YARA rule (today) |
|---|---|---|
| Reads | Network traffic, packet by packet | Files, or the memory of processes |
| Describes | A pattern in traffic | A pattern in the bytes of a file |
| When it acts | While the traffic passes, or over a capture | Whenever someone scans a folder, a disk or memory |
| Result | An alert | A list of matching files, with the strings that matched |
| Is a match proof? | No, a hypothesis to check | No, a hypothesis to check |

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "My YARA rule matched, so it is the same malware." | "My YARA rule matched, so the file carries the features I described. I check what else it shares." | A YARA rule describes features, not identity. |
| "It matched only my sample, so it is a good YARA rule." | "It matched my sample and nothing else in the set I tested. It may still match honest files elsewhere." | The test is only as wide as the set. |
| "A string with the domain name is enough." | "The domain name together with a second feature and the MZ check." | One string can sit in many files, or be encoded in the next version. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A YARA rule with one string, a web address, matches the sample it was written for and one other sample of the set. A third sample contacts the same address in Session 10 but does not match. What happened?</p>
  <ul class="qc-opts">
    <li data-key="a">Two errors of YARA, which should be reported to its authors</li>
    <li data-key="b">The third sample is not related, because it does not match</li>
    <li data-key="c">A false positive, because another program carries the same address, and a false negative, because the third program keeps the address encoded or builds it at run time</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). YARA did exactly what the YARA rule said. One string is too wide for the first job and too narrow for the second. Option (b) forgets section 4: a text can be in a program without being readable in its file.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Modules, YARA-X, and where YARA rules are used</summary>

**Modules.** YARA has modules that read the structure of a file. With `import "pe"` at the top of a file of YARA rules, a condition can test the PE header directly: the number of PE sections, an import by name, the compile timestamp, or a resource. YARA rules written this way are more precise than strings alone.

**YARA-X.** The authors of YARA, at VirusTotal, have rewritten it as YARA-X, which reads almost all existing YARA rules and is faster. REMnux carries both. The YARA rules of this session work in both.

**Where YARA rules are used.** Security products scan files and memory with collections of YARA rules. Analysts share YARA rules with the indicators of a report, because a good YARA rule outlives a hash value: it still matches after the attacker changes one byte. REMnux carries public collections, which you can try with `yara-rules FILE`.
</details>

<div class="box key" markdown="1">

A YARA rule names strings and other features of a sample and a condition over them. Write it from features that are specific to the sample, add the MZ check and a size limit, and test it over every file you have: it must match the sample and nothing else.

</div>

## 8. The verdict, and the static indicators

### The idea

Triage ends with a decision that someone can act on. Is this file malicious? How sure are we? What should others search for? A verdict without its evidence is an opinion, and a verdict without a confidence hides how much is still unknown.

The unit uses three verdicts for static triage: **malicious**, **suspicious**, and **not shown**. "Not shown" never means clean. It means that static reading showed nothing harmful, which is a statement about the reading, not about the file.

### How it works

**The three verdicts.**

| Verdict | When | Example of the evidence |
|---|---|---|
| Malicious | The file carries capabilities or content that do harm and have no honest explanation together | Code to install a service plus a hidden web address plus a second program in a resource |
| Suspicious | The file shows signs that need more evidence, but no harmful capability is visible | Packed with an unknown packer, two imports, no readable strings |
| Not shown | Static reading showed nothing harmful | An ordinary program with ordinary imports, readable strings and a believable compile timestamp |

**The confidence.** State it as high, medium or low, and give the reason. Confidence rises when several independent pieces of evidence agree: imports, strings, capabilities and a resource all point the same way. It falls when packing hides part of the file, when the evidence could be a decoy, or when the verdict rests on one feature only.

**The sentence for the report.** Write the verdict in one sentence, then the evidence as a short numbered list, then what static analysis could not establish. For example, for a made-up sample: "Malicious, high confidence. (1) It imports the functions to create a Windows service and to open a web address, and capa reports both capabilities. (2) FLOSS recovers a web address that the file keeps encoded. (3) Its resource holds a second Windows program. Not established statically: whether it runs on current Windows, and what the second program does when it runs."

**The static indicators of compromise.** Session 8 built an {% include term.html t="indicator-of-compromise" %} list from traffic. Static analysis adds indicators from the file itself:

| Kind | Where it comes from |
|---|---|
| Hash values of the sample, and of any unpacked copy or embedded program | Your hashing |
| File names and paths that the program carries | strings, FLOSS |
| Names of services, mutexes and registry keys | strings, FLOSS, capa |
| Domain names, web addresses and IP addresses | strings, FLOSS, the strings of a resource |
| The YARA rule | Your own writing, tested |

Two cautions. A static indicator shows what the file **carries**, not what it did: a web address in the strings was never seen in traffic today. Mark the source of each indicator. And write indicators safely in running text, as Session 8 taught: `hxxp://`, and square brackets around the dots, as in `files[.]example[.]net`.

<div class="box key" markdown="1">

**The pivotal idea.** Malware is intent encoded. Analysis reverse-reads its author's goals, and static reading gives hypotheses that behaviour must test.

</div>

That sentence is the bridge to Session 10. Every capability on your triage sheet is a question for the next session: does the program really do this, on this computer, now?

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "Not shown, so it is clean." | "Not shown by static analysis." | Packing, decoys and unknown code can hide everything. |
| "Malicious." | "Malicious, high confidence, because of (1), (2) and (3)." | A verdict without evidence and confidence cannot be checked. |
| "The sample contacted this domain." | "The sample carries this domain in its strings." | Static analysis never saw traffic. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A sample is packed with an unknown packer. It imports two functions, has no readable strings, and capa finds nothing. Which verdict is best?</p>
  <ul class="qc-opts">
    <li data-key="a">Not shown, high confidence, because no capability was found</li>
    <li data-key="b">Suspicious, low confidence about its purpose, because the packing hides the evidence; recommend behavioural analysis</li>
    <li data-key="c">Malicious, high confidence, because only malware is packed</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The signs call for more evidence, and the packing explains why static reading found nothing. Option (a) treats a blind spot as a result. Option (c) forgets that honest programs are packed too.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Verdict scales in organisations, and reporting standards</summary>

**Other scales.** Organisations use their own scales, such as "malicious, suspicious, potentially unwanted, clean, unknown". Some add a numeric score. What matters is that the scale is written down, that every verdict carries its evidence, and that "clean" is never claimed from a static reading alone.

**Estimative language.** Intelligence analysts tie words of confidence to rough probabilities, so that "likely" means the same to every reader. The unit's high, medium and low are a simple version: high when independent evidence agrees and nothing important is hidden; medium when the evidence agrees but part of the file is hidden or one source carries most of the weight; low when the verdict rests on one sign.

**Sharing.** Indicators and YARA rules from triage are shared in formats such as STIX, which Session 8 named. A YARA rule is shared as text, never with the sample.
</details>

## 9. The lab: triage seven samples without running one

Your task in one line: on the isolated REMnux VM, receive the unit's seven teaching samples, identify each one, read their structure, strings, packing and capabilities, write one YARA rule for the checkpoint sample, and give it a verdict, without running anything.

You work in the REMnux VM only, in the terminal. The Windows VM and Kali stay off. Allow about two hours.

<div class="box safety" markdown="1">

**These samples contain real malicious code. Seven rules, with no exceptions.**

1. **REMnux only.** The samples go into the REMnux VM and nowhere else: not your host machine, not the Windows VM, not Kali.
2. **Isolation first.** The verify script of Session 0 must show `PASS` for isolation before the disc is attached. If it does not, stop.
3. **Snapshot first, revert at the end.** You take the snapshot `s09-clean` before the disc is attached, and you return to it at the end.
4. **Terminal only, nothing runs.** Never double-click a sample or a folder of samples. Never type `wine`, and never start a sample in any way. Every tool of this lab reads files and writes text.
5. **Nothing comes out.** You write your findings by hand or type them into a file on your host machine. You never copy a file out of REMnux, and the disc image is read-only, so nothing can be written back onto it.
6. **Never upload.** You may look up a hash value on your host machine. You never upload a sample, an unpacked copy or the archive anywhere.
7. **Do not switch any protection off.** A virus scanner on your host machine may warn about the disc image. That is the scanner doing its job. Write down its message and tell the lecturer, who gives you the image again in a way that reaches REMnux. Never disable the scanner or add an exception yourself.

**Why so strict?** These programs were written to behave like real malware, and they can damage a Windows computer and contact the internet. While they sit in REMnux as files that nothing runs, they can do nothing. The rules keep them in that state, and the snapshot undoes any mistake.

</div>

<div class="box lms" markdown="1">

Folder `S09` on the lab share holds the read-only disc image, the evidence register, the triage sheet and a blank custody record. Copy the folder into `nb6018-share` on your host machine before you start. The disc image is attached to REMnux as a virtual disc; it is never opened on the host. The lecturer gives you the password of the archive in class. If you are studying away from the lab, the LMS explains how to get the same files and what to do if your host's scanner blocks them. The samples are for this module only: never share or upload them.

</div>

**The items.** Keep every file name exactly as it is.

| Exhibit | File | What it is |
|---|---|---|
| `S09-001` | `s09-static-set.iso` | The unit's read-only disc image. It holds exhibit `S09-002` and a copy of the evidence register |
| `S09-002` | `s09-static-set.7z` | The unit's password-protected archive of the seven samples. Even the names inside are hidden until the password is given |
| `S09-003` | `Lab01-01.exe` | Sample, from the archive |
| `S09-004` | `Lab01-01.dll` | Sample, from the archive |
| `S09-005` | `Lab01-02.exe` | Sample, from the archive |
| `S09-006` | `Lab01-03.exe` | Sample, from the archive |
| `S09-007` | `Lab01-04.exe` | Sample, from the archive. **The checkpoint sample** |
| `S09-008` | `Lab03-01.exe` | Sample, from the archive |
| `S09-009` | `Lab09-02.exe` | Sample, from the archive |

The evidence register gives the size, MD5 and SHA-256 of every item. The triage sheet, `s09-triage-sheet.md`, has one page for the checkpoint sample and one short row for each of the other six.

### Part A: isolate, and take the snapshot

1. Check that REMnux has a virtual disc drive. With the REMnux VM shut down, open its **Settings**, then **Storage**. You need one optical drive, which VirtualBox shows as a small disc icon under a controller, usually empty.

   <div class="box expect" markdown="1">

   An optical drive marked **Empty** under one of the controllers. While you are in the settings, look at **Network** and **Shared Folders** once more: adapter 1 is attached to the internal network `nb6018-isolated`, no other adapter is on, and the list of shared folders is empty.

   </div>

   <div class="box trouble" markdown="1">

   If there is no optical drive, select the controller, choose the small button to add an optical drive, and choose **Leave empty**. If any adapter is NAT or bridged, or a shared folder is listed, repeat Step 5 of Session 0 before you go on.

   </div>

2. Verify the copy on your host machine. In folder `nb6018-share/S09` on your host, calculate the SHA-256 of `s09-static-set.iso` and compare it with the evidence register. On Windows use PowerShell; on macOS or Linux use the terminal:

   ```powershell
   Get-FileHash -Algorithm SHA256 .\s09-static-set.iso
   ```

   ```bash
   shasum -a 256 s09-static-set.iso
   ```

   <div class="box expect" markdown="1">

   One SHA-256 value, equal to the value for `S09-001` in the register. Start your custody record: received, and verified on receipt. Do not open the image on the host. Your host may offer to open it when you double-click it: do not.

   </div>

   <div class="box trouble" markdown="1">

   If the value differs, copy the image again from the lab share. If the file is missing or the scanner warns, read rule 7 of the safety box. On Linux, use `sha256sum` if `shasum` is not found.

   </div>

3. Start REMnux, log in, open a terminal and run the verify script of Session 0:

   ```bash
   bash ~/verify-lab.sh remnux
   ```

   <div class="box expect" markdown="1">

   `PASS` on the line `Isolation`, with "no path to the internet"; `PASS` on the line `Shared folder`, with "none (correct for this VM)"; a line for each tool that Session 0 listed for Session 9 (`yara`, `capa`, `floss`), and `RESULT: READY`. Then write the versions of the tools into your notes:

   ```bash
   capa --version; floss --version; diec --version; yara --version; upx --version | head -1
   ```

   </div>

   <div class="box trouble" markdown="1">

   `FAIL Isolation` means this VM can reach the internet: shut it down and repeat Step 5 of Session 0. Do not continue until the line says `PASS`. If a tool is reported as not found, tell the lecturer now: the unit's computed results in the key were made with the versions that REMnux carries, and you will compare against them.

   </div>

4. Take the snapshot. In the VirtualBox window of REMnux, choose **Machine**, then **Take Snapshot**. Name it `s09-clean`.

   <div class="box expect" markdown="1">

   In the main VirtualBox window, the snapshot list of REMnux shows `s09-clean` under `baseline-clean`, with **Current State** below it. Write the time into your custody record.

   </div>

   <div class="box trouble" markdown="1">

   If your VirtualBox asks to pause the VM while it saves, let it. If the snapshot fails for lack of disk space, free space on the host and try again: do not continue without it.

   </div>

### Part B: receive, verify and hash

{:start="5"}
5. Attach the disc image. In the VirtualBox window of REMnux choose **Devices**, **Optical Drives**, then **Choose a disk file**, and select `s09-static-set.iso` in `nb6018-share/S09`. Then mount it read-only and list it:

   ```bash
   sudo mkdir -p /mnt/s09
   sudo mount -o ro /dev/sr0 /mnt/s09
   ls -l /mnt/s09
   ```

   <div class="box expect" markdown="1">

   Two files: `s09-static-set.7z` and `s09-evidence-register.md`. The mount is read-only twice over: by the disc format and by `-o ro`.

   </div>

   <div class="box trouble" markdown="1">

   If `mount` says that the device is already mounted, REMnux mounted it by itself. Run `findmnt /dev/sr0` to see where, and use that folder in place of `/mnt/s09` in the next steps. If `/dev/sr0` does not exist, the image is not attached: repeat the menu step. If a file window opens by itself, close it without opening anything.

   </div>

6. Copy the archive into a working folder, verify it, and unpack the samples into their own folder:

   ```bash
   mkdir -p ~/s09/work ~/s09/samples
   cp /mnt/s09/s09-static-set.7z ~/s09/work/
   sha256sum ~/s09/work/s09-static-set.7z
   less /mnt/s09/s09-evidence-register.md
   cd ~/s09/samples
   7z x ~/s09/work/s09-static-set.7z
   ```

   <div class="box expect" markdown="1">

   The SHA-256 of the archive equals the value for `S09-002` in the register. `7z` asks for the password and then reports seven files extracted, with no errors.

   </div>

   <div class="box trouble" markdown="1">

   If the password is refused, check for a space at its end and for capital letters. If `7z` says "Wrong password" for every attempt, ask the lecturer: do not try to open the archive on your host machine "to see whether it works".

   </div>

7. Before anything else, protect the samples and hash every one:

   ```bash
   cd ~/s09/samples
   chmod a-wx *
   ls -l --time-style=full-iso
   md5sum *
   sha256sum * | tee ~/s09/work/s09-hashes.txt
   ```

   <div class="box expect" markdown="1">

   Seven files, all with the rights `-r--r--r--`, which means that nobody may change them and nothing may run them as programs. Their sizes run from 3,072 bytes to 163,840 bytes. Every MD5 and SHA-256 value equals the register. The `ls` list also shows, for each file, the date and time that the archive recorded for it. Copy those dates into your notes: you will need them in Part I.

   </div>

   <div class="box trouble" markdown="1">

   If a value differs, delete the folder `~/s09/samples`, unpack the archive again and hash again. If it still differs, stop and tell the lecturer: a sample that does not match the register is not the unit's sample.

   </div>

### Part C: identify every sample

{:start="8"}
8. Read the type of each file from its bytes, then let Detect-It-Easy name the tools behind it:

   ```bash
   cd ~/s09/samples
   file *
   for f in *; do echo "== $f"; diec "$f"; done
   ```

   <div class="box expect" markdown="1">

   `file` calls all seven `PE32 executable`, and it adds `(DLL)` for one of them and `UPX compressed` for another. Detect-It-Easy names a Microsoft linker and compiler for most files, `Packer: UPX(3.04)[NRV, best]` for one, and `Unknown: Unknown` for one. Fill the column "type" of the triage sheet for all seven.

   </div>

   <div class="box trouble" markdown="1">

   If your `diec` prints slightly different version numbers, write what it prints: its descriptions are updated often. If it prints nothing at all, try `diec -d "$f"`, which looks deeper.

   </div>

9. Read the entropy of each part of each file:

   ```bash
   for f in *; do echo "== $f"; diec -e "$f"; done | less
   ```

   <div class="box expect" markdown="1">

   For each file, a line `Total` and one line for each part. In `Lab01-02.exe` the total is about 5.25, marked `not packed`, while the part `UPX1` is about 7.07, marked `packed`. One other file has a part close to 7.4 marked `packed`. This is section 5's warning in real output: the figure for the whole file hides its parts. Press `q` to leave `less`.

   </div>

   <div class="box trouble" markdown="1">

   If every line says `not packed`, check that you used `-e`. Write the figures with two decimals.

   </div>

### Part D: read the structure of a pair

{:start="10"}
10. `Lab01-01.exe` and `Lab01-01.dll` arrived together. Read the PE sections, the compile timestamp and the imports of each:

    ```bash
    pecheck.py -o s Lab01-01.exe
    pecheck.py Lab01-01.exe | grep -m1 TimeDateStamp
    pecheck.py Lab01-01.exe | grep -E '^[A-Za-z0-9_]+\.(dll|DLL)\.'
    pecheck.py -o s Lab01-01.dll
    pecheck.py Lab01-01.dll | grep -m1 TimeDateStamp
    pecheck.py Lab01-01.dll | grep -E '^[A-Za-z0-9_]+\.(dll|DLL)\.'
    pecheck.py Lab01-01.dll | grep -c 'IMAGE_EXPORT_DIRECTORY\]'
    ```

    <div class="box expect" markdown="1">

    Ordinary PE section names (`.text`, `.rdata`, `.data`, and `.reloc` in the DLL), none with entropy above 5. Two compile timestamps on the same day, nineteen seconds apart: two programs built together, which makes both dates more believable. The program imports functions that search for files, map them into memory and copy them. The DLL imports network functions from `WS2_32.dll` together with `CreateProcessA` and `CreateMutexA`. The last command prints `0`: the DLL exports nothing.

    </div>

    <div class="box trouble" markdown="1">

    If `pecheck.py` is not found, try `pecheck`. If the import lines scroll away, add `| less`. A line such as `KERNEL32.dll.CreateFileA Hint[...]` is one import: the DLL, then the function.

    </div>

11. Read the strings of the pair:

    ```bash
    strings -n 6 Lab01-01.exe | less
    strings -n 6 Lab01-01.dll | less
    ```

    <div class="box expect" markdown="1">

    In the program, the name of a DLL that imitates the Windows file `kernel32.dll` with the digit `1` in place of the letter `l`, a full path to that look-alike file in the Windows system folder, and the name of the sample's own DLL. In the DLL, an IP address and a few short words. Put the pair together in one sentence in your notes: what could the program do with the DLL, and what could the DLL do once it runs? This is a hypothesis for Session 10, not a finding.

    </div>

    <div class="box trouble" markdown="1">

    `-n 6` hides runs shorter than six characters, which removes most noise. If you see too little, try `-n 4`.

    </div>

12. Look for resources in every file:

    ```bash
    for f in *; do echo "== $f"; pecheck.py -o r "$f"; done
    ```

    <div class="box expect" markdown="1">

    Six files print nothing under their names: they carry no resources. One file prints one resource, of the type `BIN`, about 16 KB, whose first bytes are `4d5a9000`, shown as `MZ`. Write down which file, and what `MZ` at the start of a resource means, from section 3.

    </div>

    <div class="box trouble" markdown="1">

    If the loop prints errors for every file, check the spelling of `-o r`.

    </div>

### Part E: strings against FLOSS

{:start="13"}
13. Compare what `strings` and FLOSS find in `Lab09-02.exe`:

    ```bash
    strings -a Lab09-02.exe | wc -l
    floss Lab09-02.exe > ~/s09/work/floss-lab09-02.txt
    less ~/s09/work/floss-lab09-02.txt
    ```

    <div class="box expect" markdown="1">

    `strings` counts 156 lines. FLOSS takes up to a minute while it imitates the program's functions. Its summary table shows 156 static strings, 2 stack strings, 0 tight strings and 3 decoded strings. Search the FLOSS report for the parts `STACK STRINGS` and `DECODED STRINGS` (type `/STACK` in `less`). One text is a file name ending in `.exe`, one looks like a password made of keyboard keys, and one is a domain name. Now prove that `strings` could not see them: run `strings -a Lab09-02.exe | grep -i` followed by a few letters of each text. Each search prints nothing.

    </div>

    <div class="box trouble" markdown="1">

    If FLOSS prints many lines of progress, that is normal: the report is in the file. If it stops with an error about memory, close other programs on the host, or run `floss --only stack decoded -- Lab09-02.exe`, which skips the other parts.

    </div>

### Part F: packing, unpacking, and mixed signs

{:start="14"}
14. Read the signs of packing in `Lab01-02.exe`, then unpack a copy with UPX and read it again:

    ```bash
    pecheck.py -o s Lab01-02.exe
    pecheck.py Lab01-02.exe | grep -c -E '^[A-Za-z0-9_]+\.(dll|DLL)\.'
    cp Lab01-02.exe ~/s09/work/Lab01-02-unpacked.exe
    chmod u+w ~/s09/work/Lab01-02-unpacked.exe
    upx -d ~/s09/work/Lab01-02-unpacked.exe
    chmod a-wx ~/s09/work/Lab01-02-unpacked.exe
    sha256sum ~/s09/work/Lab01-02-unpacked.exe
    pecheck.py -o s ~/s09/work/Lab01-02-unpacked.exe
    pecheck.py ~/s09/work/Lab01-02-unpacked.exe | grep -c -E '^[A-Za-z0-9_]+\.(dll|DLL)\.'
    strings -n 6 ~/s09/work/Lab01-02-unpacked.exe | less
    ```

    <div class="box expect" markdown="1">

    Before: the PE sections `UPX0` with 0 bytes in the file, `UPX1` with entropy about 7.07, and `UPX2`. 9 imports. UPX reports `16384 <- 3072` and `Unpacked 1 file`. After: ordinary names (`.text`, `.rdata`, `.data`), no entropy above 1.4, and 27 imports, now including `CreateServiceA` and `InternetOpenUrlA`. The strings now show a web address, two spellings of a service name, and the name of a web browser that the program uses as a label. Record the unpacked copy in your custody record as a new item, with its SHA-256 value.

    </div>

    <div class="box trouble" markdown="1">

    If `upx` refuses to write, you forgot the `chmod u+w` on the copy. Never unpack the sample in `~/s09/samples` itself. Your SHA-256 value for the unpacked copy may differ from a classmate's if your UPX version differs: the imports and strings are what you compare.

    </div>

15. Try the same on `Lab01-03.exe`, which UPX did not name:

    ```bash
    pecheck.py -o s Lab01-03.exe
    pecheck.py Lab01-03.exe | grep -E '^[A-Za-z0-9_]+\.(dll|DLL)\.'
    pecheck.py Lab01-03.exe | grep -m1 TimeDateStamp
    cp Lab01-03.exe ~/s09/work/Lab01-03-try.exe && chmod u+w ~/s09/work/Lab01-03-try.exe
    upx -d ~/s09/work/Lab01-03-try.exe
    rm ~/s09/work/Lab01-03-try.exe
    ```

    <div class="box expect" markdown="1">

    Three PE sections whose names are not readable words, one with 0 bytes in the file and one with entropy about 7.36. Two imports only: `LoadLibraryA` and `GetProcAddress`. A compile timestamp of `Thu Jan  1 00:00:00 1970 UTC`, which means the value is zero. UPX answers `NotPackedException: not packed by UPX`. Write the honest line from section 5: packed with a packer that was not identified or not reversed; imports, strings and capabilities not visible statically.

    </div>

    <div class="box trouble" markdown="1">

    If `upx` reports "unpacked", you used the wrong file: check the name.

    </div>

16. Read the mixed signs of `Lab03-01.exe`:

    ```bash
    pecheck.py -o s Lab03-01.exe
    pecheck.py Lab03-01.exe | grep -E '^[A-Za-z0-9_]+\.(dll|DLL)\.'
    strings -n 6 Lab03-01.exe | less
    diec -u Lab03-01.exe
    ```

    <div class="box expect" markdown="1">

    Two PE sections, `.data` with entropy about 6.4, and one import only, `ExitProcess`. Yet the strings are readable, and they include a registry path that Windows uses to start programs at log-on, a domain name and a file name. Detect-It-Easy's guessing option `-u` adds lines marked `(Heur)`, one of which names a well-known family of malware. That name is a guess by pattern, a hypothesis like an alert in Session 8, and the evidence you read decides. Write a verdict with a confidence for this sample and its reasons.

    </div>

    <div class="box trouble" markdown="1">

    If you find the import list too short to believe, you are reading it correctly: a program with one import must find its other functions some other way while it runs.

    </div>

### Part G: capabilities

{:start="17"}
17. Run capa on the packed sample, then on its unpacked copy, then on two more:

    ```bash
    capa Lab01-02.exe
    capa ~/s09/work/Lab01-02-unpacked.exe
    capa Lab01-03.exe
    capa Lab09-02.exe
    ```

    <div class="box expect" markdown="1">

    On `Lab01-02.exe`, a warning that the sample appears to be packed, and only two capabilities, both about packing. On the unpacked copy, about ten capabilities, among them `create service`, `persist via Windows service` and `connect to URL`, with the ATT&CK techniques T1543.003 and T1569.002. On `Lab01-03.exe`, `no capabilities found`: the packing hides everything. On `Lab09-02.exe`, about a dozen, including network capabilities, `create process on Windows` and `contain obfuscated stackstrings`, the last of which agrees with FLOSS. Each run takes from a few seconds to a minute.

    </div>

    <div class="box trouble" markdown="1">

    If your capa reports a few more or fewer capabilities, compare its version with the one you wrote in step 3: results depend on the version of the capa rules. If capa says that it cannot find its rules, tell the lecturer: the REMnux version carries them inside the program.

    </div>

The lecturer now shows **PEStudio** on an isolated Windows machine. PEStudio is a free Windows tool that puts most of today's reading into one window: hash values, the PE header, the PE sections with their entropy, the imports with a mark on the ones that are often misused, the strings and the resources. It runs only on Windows, so you watch it and do not install it today. You do not put a sample on your Windows VM in this session.

### Part H: the checkpoint sample, in full

{:start="18"}
18. Triage `Lab01-04.exe` (exhibit `S09-007`) with every tool of today, and fill its page of the triage sheet as you go. Use the commands of the earlier steps on this file:

    ```bash
    file Lab01-04.exe; diec Lab01-04.exe; diec -e Lab01-04.exe
    pecheck.py -o s Lab01-04.exe
    pecheck.py Lab01-04.exe | grep -m1 TimeDateStamp
    pecheck.py Lab01-04.exe | grep -E '^[A-Za-z0-9_]+\.(dll|DLL)\.'
    pecheck.py -o r Lab01-04.exe
    strings -n 6 Lab01-04.exe | less
    floss Lab01-04.exe > ~/s09/work/floss-lab01-04.txt
    capa Lab01-04.exe
    ```

    Then read the program inside the resource without saving it as a file. `pecheck.py -l P` lists every Windows program found inside the bytes of a file, with its position:

    ```bash
    pecheck.py -l P Lab01-04.exe
    pecheck.py -l 2 Lab01-04.exe | grep -m1 TimeDateStamp
    pecheck.py -l 2 Lab01-04.exe | grep -E '^[A-Za-z0-9_]+\.(dll|DLL)\.'
    ```

    <div class="box expect" markdown="1">

    `pecheck.py -l P` lists two programs: the file itself at position 0, and a second one further in, which is the resource. With `-l 2`, `pecheck.py` reads the second program in place, and you get its own compile timestamp and its own imports. Every page of the sheet now has a value or a reason why not. In particular: the compile timestamp of the sample exactly as recorded; the compile timestamp of the program in its resource; the date that the archive recorded for the file in step 7; and your judgement of how far the sample's compile timestamp can be trusted, with the comparison that supports it.

    </div>

    <div class="box trouble" markdown="1">

    If `-l 2` prints an error, run `pecheck.py -l P Lab01-04.exe` again and use the number that it gives in the first column for the second program. If a field of the sheet stays empty, write why: "not visible statically" is an answer when you can say what hid it.

    </div>

### Part I: one YARA rule, tested

{:start="19"}
19. Write a YARA rule that matches `Lab01-04.exe` and no other file of the set. Open a new file in the editor:

    ```bash
    nano ~/s09/work/s09-rule.yar
    ```

    Start from this skeleton. Replace each text in angle brackets with your own choices from your triage of the checkpoint sample, and keep the rest:

    ```
    rule s09_checkpoint_sample
    {
        meta:
            description = "<what this YARA rule recognises>"
            author = "<your name>"
        strings:
            $s1 = "<a string from the sample>" ascii
            $s2 = "<a second string from the sample>" ascii
            $s3 = "<a third string from the sample>" ascii
        condition:
            uint16(0) == 0x5A4D and filesize < 200KB and 2 of ($s1, $s2, $s3)
    }
    ```

    Save with `Ctrl+O` and `Enter`, and leave with `Ctrl+X`. Test it over the samples and over your working folder:

    ```bash
    yara -s ~/s09/work/s09-rule.yar ~/s09/samples/
    yara ~/s09/work/s09-rule.yar ~/s09/work/
    ```

    <div class="box expect" markdown="1">

    The first command prints one match, `s09_checkpoint_sample` followed by the path of `Lab01-04.exe`, and under it the strings that matched with their positions. The second command prints nothing: no file in your working folder matches. Copy your YARA rule by hand onto the triage sheet, exactly.

    </div>

    <div class="box trouble" markdown="1">

    If it matches two files, you have a false positive: one of your strings is shared, often a domain name or a common DLL name. Replace it with a string only the checkpoint sample carries, or ask for more strings. If it matches nothing, check the backslashes (each one written twice inside quotes), the exact spelling and capital letters, or add `nocase`. If YARA prints a line number and "syntax error", read that line for a missing quote or brace. If the second command matches `floss-lab01-04.txt` or the YARA rule file itself, you removed the `MZ` check: those text files contain your strings too, which is exactly why the check is there.

    </div>

### Part J: verdicts, the sheet, and the revert

{:start="20"}
20. Finish the triage sheet. For every sample, a verdict (malicious, suspicious or not shown) with a confidence and its reasons. For the checkpoint sample, the full page, including the static indicators of compromise written safely. Write on paper or type into the sheet on your host machine. Do not copy anything out of REMnux.

    <div class="box expect" markdown="1">

    Seven verdicts, each with a confidence and at least one reason. On the checkpoint page, every field filled. Your custody record lists: the image and the archive as verified, the seven samples as hashed, the unpacked copy as created, and each tool with its version.

    </div>

    <div class="box trouble" markdown="1">

    If you are unsure between two verdicts, write the lower one and the reason: "suspicious, because the packing hides the code" is better than an unsupported "malicious".

    </div>

21. Detach the disc and return to the clean state:

    ```bash
    cd ~
    sudo umount /mnt/s09
    ```

    Then, in the VirtualBox window, choose **Devices**, **Optical Drives**, **Remove disk from virtual drive**. Shut REMnux down. In the main VirtualBox window, select the snapshot `s09-clean` and choose **Restore**. If VirtualBox offers to take a snapshot of the current state first, decline.

    <div class="box expect" markdown="1">

    The snapshot list shows **Current State** directly below `s09-clean` again. Start REMnux once: the folder `~/s09` no longer exists. Close the custody record with one entry: samples handled in REMnux only, nothing copied out, disc removed, VM restored to `s09-clean`, with the time.

    </div>

    <div class="box trouble" markdown="1">

    If `umount` says that the target is busy, a terminal is still inside `/mnt/s09`: run `cd ~` and try again. If **Restore** is greyed out, the VM is still running: shut it down first.

    </div>

### Checkpoint

Hand in your triage sheet and your custody record. Your work passes when all six of these are true:

1. **Identity.** The MD5 and SHA-256 of `S09-007` are right, its type is given from its bytes, and the custody record shows the image and the archive verified on receipt.
2. **Structure and packing.** You state whether it is packed, with at least two pieces of evidence from the PE sections, the entropy or the imports, and you name its resource and what the first bytes of that resource mean.
3. **Imports, strings and capabilities.** You list at least four notable imports or strings, and at least three capabilities from capa, each with its namespace or its ATT&CK or MBC number, written as capabilities, not as actions.
4. **The compile timestamp.** You give the value exactly as recorded, judge how far it can be trusted, and support the judgement with at least one comparison from the evidence of this lab.
5. **The verdict and the indicators.** You give a verdict with a confidence and at least three reasons, list at least five static indicators of compromise, each with its source, written safely, and say at least one thing that static analysis could not establish.
6. **The YARA rule.** Run by the lecturer over the whole set, it matches `S09-007` and nothing else.

The lecturer judges the sheet against the key that the unit recorded when it ran the same tools on the same files. Hash values, PE section names, entropy figures, imports and dates are values in the files, so those are right or wrong. Your reasons, your verdict and your judgement of the compile timestamp are judged by reading.

This checkpoint helps with the phase test. Short answers ask you to explain what a file's structure shows, why a date or a capability is not proof, and what a verdict rests on. The habit of writing a claim with its evidence and its limit is the same.

### If you have time

**Read the hidden texts of the checkpoint sample.** Did FLOSS find any stack strings or decoded strings in `Lab01-04.exe`? Compare with `Lab09-02.exe`, and write one sentence on what the difference says about each author.

**Try a public collection of YARA rules.** Run `yara-rules Lab01-02.exe` and `yara-rules ~/s09/work/Lab01-02-unpacked.exe`. Which YARA rules fire on the packed file, which on the unpacked copy, and why do they differ?

**Write a YARA rule for the pair.** Write one YARA rule that matches both `Lab01-01.exe` and `Lab01-01.dll` and nothing else. What do the two files share that the other five do not?

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. Explain why a suspicious Windows program is examined on a Linux VM on an isolated network, and why a snapshot is still needed there.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A Windows program does not run on Linux by itself, and the isolated network means that nothing that does run can reach the internet or other machines. The snapshot is still needed because tools such as Wine can run Windows programs on Linux by mistake, and returning to it removes whatever happened. The points that earn marks: (1) Linux does not run Windows programs by itself; (2) isolation removes the path out; (3) the snapshot covers mistakes, including tools that can run the sample.
</details>

**2. An analyst wants to know whether a client's suspicious file is already known. Explain why she may search for its hash value but should not upload the file to a public service.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Searching for a hash value asks whether the file is known and reveals almost nothing about the client. Uploading shares the file itself with the service and its partners, which can disclose the client's data inside it and warn the attacker that the file was found. The points that earn marks: (1) a hash lookup reveals little; (2) an upload discloses the client's file; (3) one consequence: data exposure, the attacker warned, or permission needed.
</details>

**3. A program's import list holds only `LoadLibraryA`, `GetProcAddress` and `ExitProcess`. Give two explanations, and one check that tells them apart.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The program may be packed, so the real imports are hidden inside compressed data and the small unpacking code needs only these functions; or it may find its functions while it runs on purpose, to hide them. The entropy of each PE section tells them apart: a PE section close to 8, or one empty in the file but large in memory, points to packing. The points that earn marks: (1) packing; (2) finding functions at run time on purpose; (3) a correct check, such as entropy, PE section sizes or a packer named by Detect-It-Easy.
</details>

**4. A sample's compile timestamp reads a date in 2019. Explain why this is not enough to say when the sample was built, and name one way to test it.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The compile timestamp is a value in the PE header that anyone who controls the file can change, like timestomping inside the file. It can be tested against other dates: the date when the file was first recorded in an archive or a collection, which must come later, or the dates of programs stored inside it. The points that earn marks: (1) the value can be changed or written falsely; (2) one comparison with an outside date; (3) or one comparison with a date inside the file.
</details>

**5. Explain why FLOSS can report a domain name that `strings` cannot find in the same file.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The program keeps the domain name encoded, or builds it one character at a time while it runs, so no readable run of characters exists in the file for `strings` to find. FLOSS imitates the program's own functions without running the program, and prints the texts that those functions produce. The points that earn marks: (1) the text is encoded or built at run time; (2) strings reads only readable runs; (3) FLOSS emulates the code, which is not running the program.
</details>

**6. capa reports "persist via Windows service" for a sample. State what this finding means and two things it does not mean.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
It means that the program's code contains the pattern of functions that can install it as a Windows service, which starts with Windows. It does not mean that the program ever created a service, and it does not prove that the author meant harm, because honest programs create services too. The points that earn marks: (1) the code can do it; (2) not that it happened; (3) not proof of intent.
</details>

**7. A YARA rule built on one web address matches the target sample and one other sample in the set, and misses a third that later contacts the same address. Describe both errors and one improvement.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The match on the other sample is a false positive for this YARA rule's purpose, because a second program carries the same address. The miss is a false negative, because the third program keeps the address encoded or builds it at run time. Requiring two or more strings that only the target carries, with the MZ check, removes the false positive. The points that earn marks: (1) the false positive and its cause; (2) the false negative and its cause; (3) a sensible improvement.
</details>

## Coming next

Today you read seven programs and ran none. Your triage sheet ends with capabilities and hypotheses: this program can create a service, that one carries a hidden address. Session 10 tests them. It switches the Windows VM onto the isolated network beside REMnux, under a posture with its own snapshot, runs one teaching sample while tools watch what it does, and lets REMnux play the internet that the sample tries to reach. Session 10 also closes Day 5 with its end-of-day quiz, which covers today as well.
