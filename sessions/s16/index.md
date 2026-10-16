---
session_code: S16
description: "Inside a SQLite database: pages, B-trees and cells, what deletion leaves behind and what destroys it, the rollback journal and the write-ahead log, handling a database without changing it, recovering deleted records and checking them; then the forensic report's second pass: its reader, the executive summary, evidence presented with its source and clock, reproducible method and one citation style."
hook: >-
  The suspect's Google Drive program deleted its two small databases when it signed out.
  Can the unit still read them, and recover the records of the two files that left for the cloud?
  Then: how do you write what you found so that someone who was not in the room can trust it?
outcomes:
  - "Explain how a SQLite database stores its rows in database pages, B-trees and cells, and how a row is found"
  - "Explain what deleting a row leaves in a database page, and how vacuum, auto-vacuum, secure delete and reuse destroy it"
  - "Compare the rollback journal and the write-ahead log, and explain why an older or newer version of a row can survive in the write-ahead log until a checkpoint"
  - "Apply a handling method that keeps a database and its companion files unchanged: copy, hash, open read-only, never checkpoint"
  - "Apply a recovery tool to recover deleted records, and justify each recovered record by checking its fields and its source page"
  - "Identify what a forensic report needs for its reader: an executive summary written last, findings with their evidence, clocks, fact apart from opinion, confidence, limitations, reproducible method and consistent citations"
before:
  - "Explain why [deleting a file](../s02/#4-how-deletion-really-works) removes the pointer, not the data, and what unallocated space and file slack are (Session 2)"
  - "Explain what [file carving](../s03/#1-carving-finding-a-file-by-its-shape) finds in raw data, and what a header and a file signature are (Session 3)"
  - "Write a [finding](../s13/#9-limitations-and-recommendations-two-methods), a limitation and a recommendation by the method, into the [report template](../s13/#10-the-report-template) (Session 13)"
  - "Find an app's [SQLite database](../s15/#6-how-apps-keep-their-records) in its app sandbox, with its companion files, and check a parser's line in it read-only (Session 15)"
demos:
  - id: S16-D1
    title: "A page, a row deleted"
    file: s16-d1-page-and-cells.html
    teaches: "Deleting a row removes its entry from the page's list of cells, but its bytes stay on the page as a freeblock until they are reused, or until secure delete fills them with zeros."
  - id: S16-D2
    title: "The log and the checkpoint"
    file: s16-d2-wal-checkpoint.html
    teaches: "Each change adds a new version of a whole page to the write-ahead log, and a checkpoint copies only the newest version into the database, so an older version of a row survives in the log only until the log is reused."
  - id: S16-D3
    title: "Three ways to open one database"
    file: s16-d3-opening-the-set.html
    teaches: "On the test phone's own files, a normal open checkpoints the log and deletes it, a read-only open keeps the database and the log but changes the shm file, and an open that ignores the log shows no tables at all."
  - id: S16-D4
    title: "From a technical paragraph to an executive summary"
    file: s16-d4-executive-summary.html
    teaches: "A technical paragraph becomes an executive summary by keeping what happened, how sure the writer is and what should change, and moving the field names, commands and offsets to the findings."
  - id: S16-D5
    title: "One finding, two figures"
    file: s16-d5-two-figures.html
    teaches: "A clean figure can hide a gap in the evidence, and the honest figure shows the same data with the gap and its cause drawn in."
slides: s16-sqlite-and-reporting.pptx
evidence: "the S16 set (the Google Drive databases from the suspect's computer and three apps' files from the test phone), its evidence register and the unit's recovery output, in folder S16 on the lab share (the lab steps say exactly which files)"
---

Session 15 opened app databases only to read them. Today you go inside them, on the test phone and on the suspect's computer, and then you write what you find as a report section that someone else can trust.

**Two halves, both assessed.** The first half is data recovery: how a SQLite database stores its records, what deleting a record leaves behind, and how to get it back. That is the same idea as Session 2, at a smaller scale, and it is examined. The second half is the report. Session 13 gave you the template and the method for findings, limitations and recommendations. Today is the second pass: the craft that makes a report trustworthy, which is what your coursework is marked on.

**Two sources of evidence.** The case example is the suspect's computer. Session 14 found that the Google Drive program on it uploaded two renamed client documents and deleted them from Drive ten minutes later. Two days after, the program deleted its own two databases when it signed out. Session 14 also said that matching the two links in the mail `It's me` to the two files needs one of those databases. Today you recover it. The mobile material is the unit's documented test phone from Session 15, with its own owner, accounts and dates, shown as recorded. Nothing on that phone belongs to the insider case.

## 1. Inside a SQLite database: pages, trees and cells

### The idea

In Session 15, a {% include term.html t="sqlite-database" %} was a whole database in one ordinary file. Today you open that file up.

A SQLite file is not one long list of rows. It is cut into equal blocks, like a book cut into pages. Each block is a {% include term.html t="database-page" %}. Pages are numbered from 1, and in most databases every page is 4,096 bytes. A database of 49,152 bytes, such as the calculator vault's `note_contact.db` on the test phone, has exactly 12 pages.

The first page starts with the database's {% include term.html t="header" %}: its first 100 bytes. You met headers in Session 3. This one begins with the file signature `SQLite format 3`. Then it records facts about the whole file: the page size, the number of pages, whether the database uses a write-ahead log, and where the list of free pages starts. A tool that reads these 100 bytes knows the shape of the whole file before it reads a single row.

### How it works

**Each table is a tree of pages.** SQLite keeps every table, and every index, as a {% include term.html t="b-tree" %}. At the top is a root page. If the table is small, the root page holds all of its rows. If it is large, the root page holds signposts that point down to other pages, and the rows sit at the bottom, on leaf pages. A table with a million rows needs only three or four steps from the root to any row.

**Each row is a cell.** On a leaf page, every row is stored as a {% include term.html t="cell" %}. A cell holds the row's number, called its rowid, and a record: a short list that says what type and length each column has, followed by the column values themselves.

**A page has a fixed layout.** Look at one leaf page from the top:

| Part of the page | What it holds |
|---|---|
| Page header (8 bytes on a leaf page) | The page's type, how many cells it has, where its cell content starts, and where its first freeblock is |
| Cell pointer list | Two bytes per cell: the position of each cell on the page, in the order of their rowids |
| Free space | Nothing in use. New cells and new pointers grow into it from both sides |
| Cell content area | The cells themselves, written from the bottom of the page upwards |

The pointer list is the page's own small index. It is the only thing that says where a live cell is. Remember that, because section 2 is about what happens when an entry in it disappears.

**How a row is found.** To read row 1 of the calculator vault's `Hide` table, SQLite reads the schema to learn that the table's root page is page 8. It reads page 8's header, then its pointer list, finds the pointer for rowid 1, and jumps to that position. There it reads the record: the hidden file's name, `0_DiwGeKS.jpeg`, and the path it was hidden from. Every tool that "opens" a database does this for you. A recovery tool does something different: it reads the bytes of the page that no pointer leads to.

<div class="box metaphor" markdown="1">

**The comparison.** A database page is like a hotel floor with a guest list at the reception desk of that floor. The list says which guest is in which room. The rooms are filled from the end of the corridor.

**Why it fits.** The guest list is the cell pointer list: it is the only record of where each guest, each cell, is. The rooms are the cell content area. Finding a guest means reading the list first, then walking to the room, exactly as SQLite reads the pointer and then jumps to the cell.

**Where it breaks.** A hotel has the same number of rooms every night. A page's cells have different sizes, so a long row takes a big room and a short row a small one, and the rooms are not numbered. And a hotel never moves its guests between floors in the night. SQLite does: when a page is full, it splits the page, and when pages become too empty, it merges them, moving cells to other pages.

**So what.** A cell's position on a page tells you nothing about when the row was written, and a row can move. When you report where a record was found, name the page and the offset, and treat them as where it was at the moment of the copy, not where it always was.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A database file is 81,920 bytes and its header gives a page size of 4,096 bytes. A tool reports a row "on page 21". What can you conclude?</p>
  <ul class="qc-opts">
    <li data-key="a">The row is in the twenty-first table of the database</li>
    <li data-key="b">The tool is wrong or is not reading this file as it is: 81,920 bytes at 4,096 bytes per page is 20 pages, so there is no page 21</li>
    <li data-key="c">The row is the twenty-first row of its table</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). 81,920 divided by 4,096 is 20, and pages are numbered from 1. A page number is a position in the file, not a table (a) or a row number (c). Check a tool's page numbers against the file's size and page size, as you checked a parser's line in Session 15. A likely cause: the tool counted a page from the write-ahead log, which section 3 explains.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The header's fields, page types and overflow pages</summary>

**Header fields an examiner reads.** Offset 0: the 16-byte signature. Offset 16: the page size (two bytes; the value 1 means 65,536). Offsets 18 and 19: the write and read versions, 1 for a rollback journal and 2 for a write-ahead log. Offset 28: the number of pages. Offset 32: the first trunk page of the freelist, and offset 36: the number of freelist pages. Offset 52: the largest root page when auto-vacuum is on, and zero when it is off; offset 64 says whether auto-vacuum is incremental. Offset 56: the text encoding, 1 for UTF-8.

**Four page types.** The first byte of a B-tree page's header gives its type: 13 for a table leaf, 5 for a table interior page, 10 for an index leaf and 2 for an index interior page. Interior headers are 12 bytes, because they also hold the pointer to the rightmost child page.

**Overflow pages.** A row too large for one page keeps its start in its cell and continues on overflow pages, chained one to the next. A deleted large row can leave its overflow pages behind as free pages, which is one reason recovery tools follow the freelist as well as the leaf pages.

**Index pages.** An index is a B-tree of its own, holding a copy of the indexed column and the rowid. A deleted row can leave its index entry behind on an index page even when its table cell is gone, which gives a second, partial copy of the deleted value.
</details>

<div class="box key" markdown="1">

A SQLite file is a set of numbered database pages. Each table is a B-tree of pages, each row a cell, and a page's cell pointer list is the only record of where its live cells are.

</div>

## 2. What deletion does, and what destroys it

### The idea

Session 2 taught the most important idea of data recovery: deletion removes the pointer, not the data. A file system marks the file's clusters as free and forgets where the file was, but the bytes stay until something overwrites them.

SQLite does the same thing at a smaller scale. When a row is deleted, SQLite removes its entry from the page's cell pointer list. The cell's bytes are not cleaned. They stay on the page, now part of the page's free space, until a new cell is written over them. So a deleted row can often be read again, by a tool that looks at the bytes no pointer leads to.

But not always. SQLite also has settings that clean deleted bytes, and a phone is a place where those settings are usually on. This section explains both: what survives, and what destroys it.

### How it works

**Three places deleted bytes go.**

1. **A freeblock.** When a deleted cell sits among live cells, its space becomes a {% include term.html t="freeblock" %}. SQLite writes a 4-byte note at the start of the space, saying where the next freeblock is and how big this one is. The rest of the old bytes stay untouched. The first 4 bytes of the old cell are lost under the note. That is often the start of the record, so a recovery tool must rebuild the row's layout from what remains.
2. **The free space of the page.** When the deleted cell was the one nearest the free space, SQLite simply moves the start of the cell content area past it. The old bytes are now inside the page's free space, whole, with no note written over them.
3. **A free page.** When the last cell on a page is deleted, the whole page is no longer needed. SQLite puts it on the {% include term.html t="freelist" %}, its list of pages waiting to be reused, and the page keeps its old content.

Run the demo and delete a row yourself.

{% include demo.html id="S16-D1" %}

**Four things that destroy deleted rows.**

| What | What it does | Can you see it in the file? |
|---|---|---|
| Reuse | A new row is written over the old bytes. The more a database is used after a deletion, the less of the deleted row is left | Only by what is missing |
| {% include term.html t="vacuum" %} | Rebuilds the whole file from its live rows. Every freeblock and every free page is gone | A freshly rebuilt file has no free space at all |
| {% include term.html t="auto-vacuum" %} | After each change, moves free pages to the end of the file and cuts them off, so the freelist stays empty | Yes: the header records it (offset 52 is not zero) |
| {% include term.html t="secure-delete" %} | Fills deleted bytes with zeros at once, in freeblocks and on free pages | Not in the header: you see it only as free space full of zeros |

The last row matters most. Secure delete is a setting of the program that uses SQLite, not of the file. Nothing in the database says it was on. The only evidence is the zeros themselves.

**What the test phone shows.** The unit read every ordinary SQLite database of the test phone's files that it holds, byte by byte: Opera's history, the calculator vault, Private Photo Vault and the gallery vault. In every one, auto-vacuum is on, the freelist is empty, and every freeblock is filled with zeros. The reason is in Android's own build of SQLite, which is published: Google compiles it with secure delete and auto-vacuum switched on by default. So on an Android phone, a row deleted by an app that uses the system's SQLite is usually gone from the database file itself.

The test phone's notes record that the owner removed a picture from the calculator vault on 26 July 2024 at 14:51 EDT. The vault keeps its hidden files in a table called `Hide`, in `note_contact.db`. Today that table holds one row, for another picture. The removed picture's row is not there, the database's only freeblock holds four bytes of zeros, the database has no free pages, and its journal is empty. The deletion is documented, and the database keeps no trace of it. That is a finding too, and section 8 shows how to write it.

<div class="box metaphor" markdown="1">

**The comparison.** Go back to the hotel floor of section 1. When a guest checks out, the reception crosses the name off the list, but nobody cleans the room until the next guest arrives. Secure delete is a hotel that sends housekeeping into the room the moment the guest leaves.

**Why it fits.** The crossed-out name is the removed pointer. The uncleaned room is the freeblock with the old bytes. The next guest is reuse. Housekeeping is the zeros. In the first hotel, you can still find the last guest's belongings in the room; in the second, you cannot.

**Where it breaks.** In a hotel you can read the cleaning policy on a notice at reception. In SQLite, the policy is not written anywhere in the file: secure delete belongs to the program that used the database. You learn which hotel you are in only by opening the rooms. And unlike any hotel, SQLite can knock down the walls and rebuild the floor overnight, with vacuum.

**So what.** Never write "the deleted rows cannot be recovered" from the header alone, or "they can" from the tool's name alone. Open the free space and look. Zeros in every freeblock are your evidence that secure delete was on, and that evidence belongs in your report.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An examiner finds a database whose header shows auto-vacuum is off, and whose freeblocks contain only zeros. A colleague says: "Auto-vacuum is off, so the deleted rows must still be there." Which reply is best?</p>
  <ul class="qc-opts">
    <li data-key="a">Agreed: without auto-vacuum, SQLite never removes deleted data</li>
    <li data-key="b">The zeros show the database file is damaged</li>
    <li data-key="c">Auto-vacuum only empties the freelist; zeros in the freeblocks show that secure delete was on in the program that wrote the database, so deleted cells were cleaned when they were deleted</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Auto-vacuum and secure delete are different settings: one removes free pages, the other cleans deleted bytes wherever they are. Secure delete leaves no flag in the header, so the zeros are the only evidence of it. Option (a) forgets secure delete and reuse; option (b) mistakes cleaned space for damage.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Fragments, the freelist's two kinds of page, and apps with their own SQLite</summary>

**Fragments.** A free gap of 1 to 3 bytes is too small to hold a freeblock's 4-byte note, so SQLite only counts it in the page header as fragmented bytes. These bytes are never listed anywhere.

**Trunk and leaf pages of the freelist.** The freelist is a chain of trunk pages; each trunk page lists the numbers of several free leaf pages. A free leaf page keeps its old content untouched until reuse, unless secure delete is on. The trunk pages themselves are overwritten with page numbers.

**Incremental vacuum.** With `auto_vacuum = INCREMENTAL`, free pages stay on the freelist until the program asks SQLite to remove them, so a database can show auto-vacuum in its header and still hold free pages.

**Apps with their own SQLite.** An app may bring its own copy of SQLite instead of using Android's, as Chromium-based browsers and apps using SQLCipher do. Its settings are its own. Opera's history on the test phone shows zero-filled freeblocks too, but a database written by an app's own SQLite can keep deleted bytes even on Android. On a computer, many programs leave secure delete off: the default of SQLite as published is off.
</details>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The row was deleted, so it is gone." | "The row's pointer was removed; whether its bytes survive depends on reuse, vacuum and secure delete." | Deletion and destruction are different events. |
| "The tool found no deleted rows, so none were deleted." | "No deleted rows survive in the free space this tool reads." | A deletion can leave nothing, as on the test phone. |
| "Auto-vacuum is on, so secure delete is on." | "Auto-vacuum is on; the zeros in the freeblocks show secure delete." | They are separate settings, and only one is in the header. |

</div>

<div class="box key" markdown="1">

Deleting a row removes its pointer, not its bytes: they stay in a freeblock, in the page's free space, or on a free page. Reuse, vacuum, auto-vacuum and secure delete destroy them, and on Android secure delete is usually on.

</div>

## 3. The journals: old pages and new pages

### The idea

A database must survive a crash in the middle of a change. If the power fails while half of a change is written, the file would be broken. SQLite prevents this with a second file beside the database, and it has two ways of using it.

The older way is the {% include term.html t="rollback-journal" %}. Before SQLite changes a page, it copies the page as it is now into a file ending in `-journal`. If the change fails, SQLite copies the old page back. When the change succeeds, the journal is no longer needed.

The newer way is the {% include term.html t="write-ahead-log" %}, often called the WAL, in a file ending in `-wal`. It works the other way round. SQLite leaves the database file alone and writes the new version of each changed page into the log. Readers look in the log first. Later, at a {% include term.html t="checkpoint" %}, SQLite copies the newest version of each page into the database file, and the log can start again from the beginning.

Both files can hold a version of a row that the database file does not: the rollback journal an older one, the WAL a newer one, or an older one too.

### How it works

**What the rollback journal leaves.** After a successful change, SQLite either deletes the journal, cuts it to zero bytes, or overwrites its first bytes with zeros, depending on the journal mode the program chose. A journal of zero bytes, like the calculator vault's `note_contact.db-journal` on the test phone, means the last change finished and nothing is left in it. A journal that still holds pages is worth a look: it may contain the page as it was before a deletion.

**What the WAL holds.** A WAL file is a short header followed by {% include term.html t="wal-frame" %}s. Each frame is a 24-byte frame header and a full copy of one database page as it was after a change. The frame header says which page it is and whether this frame ends a committed change. One change to one row adds a whole page to the log, and a second change to the same page adds a second copy of that page. So the log can hold several versions of the same page, one after another.

**The shm file.** A database in WAL mode also has an {% include term.html t="shm-file" %}, ending in `-shm`. It is an index of the log: for each page, which frame holds its newest version. SQLite can rebuild it from the log, so it holds no evidence of its own, but it changes whenever anyone reads the database.

**What a checkpoint does.** At a checkpoint, SQLite copies the newest version of each page from the log into the database file. Older versions are not copied anywhere. After the checkpoint, the log is reused from its start, and new frames overwrite the old ones. Until that happens, the old frames are still in the file. By default, SQLite checkpoints when the log reaches about 1,000 pages, and when the last program using the database closes it.

Use the demo to change a row twice and then run a checkpoint.

{% include demo.html id="S16-D2" %}

**What the test phone shows.** Private Photo Vault keeps its database in WAL mode. On the test phone, its `ppv.db` is a single page of 4,096 bytes: the database file holds no tables at all. Its `ppv.db-wal` is 168,952 bytes: 41 frames, 10 committed changes, never checkpointed. The whole database lives in the log. Replaying the log one commit at a time shows a row that existed after the fourth commit and is gone at the end: a row of the app's own `CircularLog` table, recording used space. It is a small row, but it shows the mechanism on real evidence: the log keeps a version of the database that the newest state no longer has.

<div class="box metaphor" markdown="1">

**The comparison.** The WAL is like a stack of sticky notes on a printed document. Each change is written on a note and stuck on top. Readers read the notes first, then the print. A checkpoint is retyping the document with the newest notes in it, and then throwing the notes away.

**Why it fits.** The printed document is the database file. The notes are the frames, and the newest note for a page wins, as the shm file tells readers. Until someone retypes the document, the notes are all there, including the ones that a later note replaced: older versions of the same text.

**Where it breaks.** A sticky note holds one changed line. A frame holds a whole page, so changing one row copies every other row on that page too, unchanged. And SQLite does not throw the notes away: it writes new notes over the old ones from the top of the stack, so an old note survives until a new one lands exactly on it.

**So what.** A WAL is a history of pages, not of rows. To find an older version of a row, compare the versions of its page frame by frame, and say in your report which frame and which commit a recovered value came from.

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">An app changed a message's text, then the phone was extracted. The database's WAL has not been checkpointed. Where can the message's old text survive?</p>
  <ul class="qc-opts">
    <li data-key="a">In an earlier frame of the WAL that holds the page before the change, as long as the log has not been reused over it, and possibly in the database file if no checkpoint copied the new page in yet</li>
    <li data-key="b">Only in the shm file, which keeps every old version of every row</li>
    <li data-key="c">Nowhere: the WAL holds only the newest version of each page</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The database file still holds the page as it was at the last checkpoint, and the log may hold earlier versions of the page in earlier frames. The shm file is only an index (b). The log keeps every frame it wrote until it is reused, not only the newest (c).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Journal modes, salts and frames left from before a reset</summary>

**Journal modes.** `DELETE` removes the journal after each change; `TRUNCATE` cuts it to zero bytes; `PERSIST` keeps it and zeroes its header, so old pages can remain inside it; `WAL` uses the write-ahead log instead. A program chooses the mode; the file records only whether it is in WAL mode (header offsets 18 and 19).

**Salts.** The WAL's header holds two random numbers, the salts, and every frame copies them into its own header. When the log is reset after a checkpoint, the salts change. A frame with the old salts is left over from before the reset: SQLite ignores it, but its bytes are still a copy of a page from earlier. Recovery tools differ in whether they read such frames.

**Persistent WAL.** Some programs keep the WAL file after the last connection closes instead of checkpointing and deleting it. Its size then shows how far the log once grew, and frames beyond the newest commit may be older still.
</details>

<div class="box key" markdown="1">

The rollback journal keeps old pages during a change; the write-ahead log keeps new pages until a checkpoint, and older versions until the log is reused. Both can hold a version of a row that the database file does not.

</div>

## 4. Handling a database without changing it

### The idea

Session 1's rule still holds: copy, hash, examine the copy. A database adds one danger that a picture or a document does not. Opening it in an ordinary program can change it, and can destroy exactly the evidence this session is about.

When the last program using a database in WAL mode closes it, SQLite runs a checkpoint, copies the newest pages into the database file, and deletes the log. Every older version of every page that the log held is then gone. An examiner who double-clicks a database to "have a quick look" can wipe out the deleted rows in its WAL in one second.

So the rule for databases has four parts. Copy the database together with its companion files. Hash all of them first. Open only copies. Open them read-only, in a tool that does not checkpoint.

### How it works

**What happens to the test phone's files.** The unit made three copies of Private Photo Vault's three files and opened each copy a different way, recording the hash values and sizes before and after:

| How the copy was opened | `ppv.db` | `ppv.db-wal` | `ppv.db-shm` | What the examiner sees |
|---|---|---|---|---|
| An ordinary read-write open, then close | Grows from 4,096 to 81,920 bytes; new hash value | Deleted | Deleted | The newest data. Every older version is gone |
| Read-only | Unchanged | Unchanged | **Changed**: same size, new hash value | The newest data, with the log intact |
| Ignoring the log (the database file alone) | Unchanged | Unchanged | Unchanged | No tables at all |

Try the three ways in the demo.

{% include demo.html id="S16-D3" %}

Three lessons come from this table.

First, **an ordinary open destroys evidence**. The checkpoint folded the log into the database and deleted it. The newest data is still readable, which is why nobody notices. What is lost is everything that only the log held.

Second, **read-only is not the same as untouched**. A read-only connection still writes into the shm file, because readers mark there which part of the log they are reading. The shm file holds no evidence of its own, but its hash value changes. That is why you hash before you open, and why you open a copy, never the extraction's own file. Write in your notes that the shm file changed and why.

Third, **a database without its log can look empty**. Private Photo Vault's database file alone has no tables. An examiner who copied only `ppv.db` would report that the app held nothing. Session 15 told you to copy the companion files; here is the reason in numbers.

**The method, in order.**

1. Copy the database and every file whose name starts with the database's name: `-wal`, `-shm`, `-journal`. Keep the names unchanged, side by side in one folder, because SQLite finds the companions by name.
2. Hash every file, and record the values before anything opens them.
3. Make a second copy for the tools. Keep the first copy as the one you never open.
4. Open the working copy read-only: in DB Browser for SQLite, **Open Database Read Only**. In a recovery tool, check in its documentation that it reads the files without opening them through SQLite in write mode.
5. Hash the files again after each tool, and write down every change with its cause.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "I only looked at it, so nothing changed." | "I opened a copy read-only; the shm file's hash value changed, as expected for a reader." | Reading a WAL database writes into its shm file. |
| "The WAL disappeared on its own." | "The WAL was deleted by a checkpoint when the last connection closed." | Something always runs the checkpoint; find out what. |
| "I copied `ppv.db`." | "I copied `ppv.db` with its `-wal` and `-shm` files, side by side, with their names unchanged." | The database alone can hold nothing at all. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner hashes a database, its WAL and its shm file, opens copies read-only in DB Browser for SQLite, and finds afterwards that only the copy's shm file has a new hash value. What should she write?</p>
  <ul class="qc-opts">
    <li data-key="a">That the copy was altered and can no longer be used</li>
    <li data-key="b">That the database and WAL copies are unchanged, and the shm file changed because a reader writes its read marks there; the original files were never opened</li>
    <li data-key="c">Nothing, because the shm file is not evidence</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The change is expected and explained, and the originals are untouched. The copy is still usable (a). Saying nothing (c) leaves a hash mismatch that a reviewer would find without its explanation.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Why a read-only open still writes, and when it cannot open at all</summary>

**Read marks.** The shm file holds the WAL index and a small set of read marks. A reader takes a read mark to tell writers which part of the log it still needs, so that a checkpoint does not reuse it. Taking a read mark is a write into the shm file, even for a read-only connection.

**Read-only folders.** If the shm file is missing and the folder cannot be written, a read-only connection to a WAL database can fail to open, or SQLite may open it only through a slower path. This is one more reason to work in a folder of your own copies, not inside the extraction.

**Immutable opens.** Some tools open a database as "immutable": SQLite then reads the database file only and ignores the WAL. That is the third row of the table. It is safe for the files and wrong for the evidence.
</details>

<div class="box key" markdown="1">

Copy the database with its companion files, hash them, open only copies, and open them read-only in a tool that does not checkpoint. An ordinary open can delete the WAL, and with it every older version of the data.

</div>

## 5. Recovering deleted records, and checking them

### The idea

A recovery tool reads the bytes that SQLite no longer points to: freeblocks, the free space of each page, free pages and the frames of the WAL. Wherever those bytes still look like a record, the tool rebuilds a row and shows it, usually beside the live rows, with a mark that says it was deleted.

What it shows you is not yet a finding. It is a fragment. The start of a deleted cell is often overwritten by a freeblock's note, so the tool has to guess where the record begins and which column is which. It can guess wrongly, and then the values land in the wrong columns. So a recovered record is a fragment until you have checked two things: its fields, and the page it came from.

### How it works

**The tools.** Three free tools are well known. The unit tested all three on the same files: a database built with known deletions, the test phone's files and a copy of a database shaped like the case's.

| Tool | Licence and state | Runs on | What it reads | How it did |
|---|---|---|---|---|
| FQLite | Apache 2.0, maintained | Windows, Linux, macOS; Java is included | Freeblocks, free space, free pages, WAL, rollback journal; shows each record's status, offset and page | Recovered deleted rows from the case-shaped table, flagged deleted; opened the test phone's WAL database; missed some rows on free pages |
| sqlite_dissect | An open-source licence of its own, MIT-style; little change since 2024 | Linux and Windows, command line | Freeblocks, free space, free pages, WAL versions, labelling where each row came from | Recovered every recoverable row of the known test; recovered none from a table whose first column is text, and stopped with an error on the test phone's one-page database |
| undark | BSD, unmaintained since 2016 | Linux, command line | The database file only, no WAL | Recovered some rows, mixed live and deleted rows, and misread a number |

The unit uses **FQLite on the Windows VM**. It reads every place a deleted record can be. It handled the case's table and opened the test phone's WAL database. And it shows the status, offset and page beside every record, which is what checking needs. sqlite_dissect is a strong second reading where it works, and its labels are the best of the three; it is a stretch task on Kali. No tool is right everywhere: that is the first thing the table teaches.

**Checking a recovered record.** For every recovered record you will rely on:

1. **Read its fields.** Does each value have the type its column should have? A file name in a size column, or a size that is far too large, means the tool misplaced the columns. On the case-shaped test copy, one tool recovered a row whose size read 112,772,352 bytes, when the file was 440,517 bytes.
2. **Compare it with another source.** A size, a name or a time that another record also holds is the strongest check: Session 13's two records of one event.
3. **Find its bytes.** Open the page at the offset the tool gives, in the tool's hex view, and see that the values are really there, in that order.
4. **Write what was whole and what was not.** "Recovered with its name, size and times; the start of the record was overwritten" is a finding a reader can weigh.

**App-level encryption comes first.** Session 15 showed that Threema encrypts its own database on top of the phone's encryption. That is {% include term.html t="app-level-encryption" %}, and it stops recovery before it starts. On the test phone, `threema4.db` has no SQLite signature. Its WAL tells the same story in a new way. The 158 frame headers are readable, but every page inside them looks random: close to 8 bits of information per byte, where a plain page is mostly zeros and text. A recovery tool cannot read records out of encrypted pages. So before any recovery, check the database's signature and look at its WAL. When the pages are encrypted, the honest result is a limitation. Decryption is a separate step, with its own key and its own legal question.

<div class="box metaphor" markdown="1">

**The comparison.** A recovered record is like a page torn from a ledger and found in a bin. The handwriting is the ledger's, but the top line is torn off.

**Why it fits.** The torn top line is the start of the cell under the freeblock's note. You can still read the entries, and you know which ledger it came from, as the tool knows the table. But without the top line, you must work out which column each figure belongs in.

**Where it breaks.** A torn page shows you where it is torn. A recovery tool does not: it prints a tidy row, and a shifted value looks exactly as confident as a correct one. And the page in the bin may not be from the ledger at all: a tool can build a row from bytes that only resemble a record.

**So what.** Never copy a recovered row into a report as it is printed. Check its fields against their types and against another source, find its bytes, and write which fields you trust.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A tool recovers a deleted row from a table of files: the name column holds <code>iZaVl8yVU5mWHlGbWcdo_u_wanna_bu</code> and the size column holds 7,305,055. What is the best next step?</p>
  <ul class="qc-opts">
    <li data-key="a">Report the row as recovered: the tool flagged it as deleted</li>
    <li data-key="b">Discard it: a damaged row is worthless</li>
    <li data-key="c">Treat it as a fragment with shifted columns: the name begins inside another field, so check the bytes at the given offset, compare the size with another record of the file, and report only the fields you can confirm</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The name starts in the middle of an identifier, a sign that the record's start was lost and the columns shifted. A flag (a) says where the bytes were, not that the fields are right. A damaged row can still carry a confirmable identifier or name (b), which may be the only trace of a deleted record.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How the tools rebuild a record, and the research behind them</summary>

**Signatures.** A tool learns each table's column types from its schema, then searches the free bytes for runs of bytes that fit that pattern. When the first column is an integer key, the pattern is easy to find. When the first column is text of varying length, as in the case's table, the pattern is weak, and sqlite_dissect says so in a warning before it recovers nothing.

**A standard test.** Researchers built a public corpus of SQLite databases with known deletions to compare these tools (Nemetz, Schmitt and Freiling, 2018). No tool recovered everything, and several printed rows that had never existed. FQLite's method is described by its author in Pawlaszczyk and Hummert (2020).

**Index entries.** A deleted row's index entry, holding a copy of an indexed column, may survive on an index page when the table cell does not. It is a second, partial witness.

**Decryption.** ALEAPP decrypts Threema's database with the key file in its sandbox, as Session 15 showed. Whether to decrypt, and with what authority, is a decision for the case, not for the tool.
</details>

<div class="box key" markdown="1">

A recovery tool reads the bytes SQLite no longer points to and rebuilds rows from them. A recovered record is a fragment until its fields and its source page are checked, and an encrypted page cannot be recovered at all.

</div>

## 6. The case: the databases the suspect's Drive program deleted

### The idea

Session 14 left one question open. The mail `It's me`, sent from the suspect's computer on 23 March 2015 at 20:38:47 UTC, carries two Google Drive links. The Drive program's log shows two files uploaded six minutes before and deleted from Drive three and a half minutes after. The answer key says which link is which file, but the log cannot show it, because the log never records a link.

The Drive program kept a database, `snapshot.db`, with a table `cloud_entry`: one row per file in the account, with the file's identifier in Drive, its name, its size and its times. A Drive link carries the file's identifier. So a `cloud_entry` row is the bridge between a link and a file name. The program deleted both rows when the files left Drive on 23 March, and deleted the whole database when it signed out on 25 March. Two deletions, at two scales: Session 2's and today's.

### How it works

**Session 2's way first.** The deleted `snapshot.db` is still listed in the current volume's file system, as a deleted entry, so a forensic tool can export its bytes, as you did in Session 2. Investigators who did this report that the exported file opens empty or not at all: the limit of recovery that Session 2 described, most likely because its clusters were reused. The unit's register records what its own export gave, as exhibit S16-003.

**The shadow copy.** Windows keeps {% include term.html t="volume-shadow-copy" %}s: copies of how a volume was at an earlier moment, used for restore points. The suspect's computer has one, made on the morning of 25 March 2015, before the sign-out. In it, `snapshot.db` is a live, whole file. The answer key's question 48 asks for the Drive traces in the shadow copy, and question 49 asks for the deleted records of `cloud_entry` inside its `snapshot.db`. The unit extracted it as exhibit S16-001.

**Then the records inside.** In the shadow copy's `snapshot.db`, the two files' rows had been deleted on 23 March, two days before the copy was made, and the answer key shows that their bytes survived in the database's free space. Recovered and checked, they give the bridge:

| Link code in the mail | Recovered `cloud_entry` row's file name |
|---|---|
| `0Bz0ye6gXtiZaVl8yVU5mWHlGbWc` | `do_u_wanna_build_a_snow_man.mp3` |
| `0Bz0ye6gXtiZaakx6d3R3c0JmM1U` | `happy_holiday.jpg` |

Session 5's change journal says these two names were given, minutes before the upload, to the client's pricing spreadsheet and meeting presentation. So the chain now runs, record by record, from two client documents to two links in a mail to the conspirator.

**Times.** The program wrote `sync_log.log` in local time with its offset, `-0400`, as Session 14 showed. The database writes its own numbers. Before you put a time from a recovered row in a timeline, decide which clock and unit it uses, as in Session 15, and check it against the log: the upload was at 20:32:35 UTC.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">Why does the unit recover the Drive records from the shadow copy's <code>snapshot.db</code> rather than from the file recovered from the current volume?</p>
  <ul class="qc-opts">
    <li data-key="a">The shadow copy was made before the sign-out deleted the file, so it holds the whole database; the deleted file on the current volume did not come back whole, while the deleted rows inside the shadow copy's database still sit in its free space</li>
    <li data-key="b">The shadow copy holds every file Windows ever deleted</li>
    <li data-key="c">Files recovered from a current volume can never be opened</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The two deletions are at two scales: the database file was deleted from the volume, and the rows were deleted inside the database. The shadow copy undoes the first, and record recovery the second. A shadow copy holds a volume as it was at one moment, not every deleted file (b); and recovered files often open (c), but this one did not come back whole.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How the unit reached the shadow copy</summary>

On Kali, `ewfmount` presents the E01 image as one raw disk, `vshadowinfo` lists the shadow copies of the volume at sector 206,848 (the partition you used in Session 2), and `vshadowmount` presents each shadow copy as a raw volume. The Sleuth Kit's `ifind` finds the file by its path in that volume, and `icat` exports it. The build script and the evidence register record each command and hash value. Tools that mount an image on Windows can expose its shadow copies too; the unit used Kali so that every step is a command in the register. A shadow copy is a record of the volume at one moment: it holds nothing changed after that moment, and Windows deletes old ones when space is short.
</details>

<div class="box key" markdown="1">

The Drive program deleted two records inside its database, then the database itself. The shadow copy gives back the database; record recovery gives back the rows; and the rows match the two links in the mail to the two renamed client documents.

</div>

## 7. What a forensic report is for, and who reads it

### The idea

Everything you did in this module ends in a report. The client never sees your timeline file, your hash list or the rows you recovered. They see the report, and the report is all they can act on.

Different people read it, and they read different parts:

| Reader | What they need | What they read |
|---|---|---|
| The client's manager | What happened, how sure you are, what to do now | The executive summary, and nothing else |
| A lawyer or a court | Each claim, the evidence for it, and its limits | Findings and limitations, closely |
| Another examiner | Exactly what you did, with which tools, so they can check it | Method and appendices |
| You, months later | Why you concluded what you did | All of it |

So a report is written in layers. Session 13 gave you its shape in the template, and the methods for a finding, a limitation and a recommendation. Today is the second pass: how each layer earns its reader's trust.

### How it works

**Structure.** Keep the template's order: executive summary; environment and method; findings; limitations; response actions and recommendations; references; appendices. Each section has one job, and a reader who wants that job done must find it in that place.

**Findings with their evidence.** A {% include term.html t="finding" %}, from Session 13, is a statement the evidence supports, with the evidence named. In a report, "named" means the reader can go from the sentence to the item: the exhibit, the file, the row and the value.

**The timeline.** Session 5's timeline becomes the spine of the findings: each event in UTC, in order, with its source. A full timeline goes in an appendix; the findings carry the events that matter.

**Limitations and recommendations.** Session 13's methods hold: a limitation is what you saw, its effect on a conclusion, and its evidence; a recommendation is a finding, a risk, a change and its evidence.

**The executive summary, written last.** The {% include term.html t="executive-summary" %} is the first section and the last one you write, because it summarises findings that do not exist until the rest is written. It is for a reader who reads nothing else, so it carries three things only: what happened, how sure you are and why, and what should change. It has no commands, field names, offsets or hash values. Those belong in the findings, where the summary's reader will never go, and where every other reader will.

Watch a technical paragraph become an executive summary in the demo.

{% include demo.html id="S16-D4" %}

<div class="box metaphor" markdown="1">

**The comparison.** An executive summary is like the first paragraph of a news story. A reader who stops after it should still know what happened, to whom and why it matters.

**Why it fits.** News is written so that the most important facts come first and the details follow, because most readers stop early. Your manager-reader stops after the summary, so the summary must stand alone, and the findings follow for those who read on.

**Where it breaks.** A news story rarely says how sure the reporter is, and a reader expects it to be read once. A forensic summary must state its confidence and its main limitation, because a decision will be made on it; and it may be read aloud in a court, where every word will be tested against the findings below it. A news lead may simplify; a summary may not say anything the findings do not support.

**So what.** Write the summary last, from your findings, and check every sentence in it against a finding. If a sentence has no finding behind it, delete the sentence or write the finding.

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">Which sentence belongs in an executive summary?</p>
  <ul class="qc-opts">
    <li data-key="a">"Two client documents were renamed, uploaded to a personal cloud account and shared by link within twenty minutes; this is firmly supported by four independent records on the computer."</li>
    <li data-key="b">"FQLite 4.22 recovered two rows with status D from cloud_entry in S16-001, at the offsets listed in Table 4."</li>
    <li data-key="c">"The suspect is guilty of leaking the documents."</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). It says what happened and how sure the writer is, in plain words. (b) is a correct finding-level detail: it belongs in the findings. (c) is not a forensic conclusion: guilt is for a court, and no record shows who sat at the keyboard.</p></div>

</div>

<div class="box key" markdown="1">

A report is read in layers by different readers. The executive summary, written last, tells a reader who reads nothing else what happened, how sure you are, and what should change; the findings carry the evidence for every word of it.

</div>

## 8. Evidence a reader can trust

### The idea

A finding is only as strong as the reader's ability to follow it back to the evidence. Six habits make that possible. They are small, and a report that misses any of them can lose a whole finding when someone asks "how do you know?"

### How it works

**1. Exhibit references and hash values.** Every statement that rests on an item names it by its {% include term.html t="exhibit-reference" %}, the identifier in the evidence register, such as S16-001. The register, with each item's hash value, goes in an appendix. "The recovered row (S16-001, with its page and offset in Table 4)" lets a reader find the bytes; "a recovered row" does not.

**2. Figures and tables with their source.** Every table and figure has a caption that says what it shows and where its data came from: the exhibit, the file and the tool with its version. A chart without a source is a picture.

**3. Screenshots with provenance.** A screenshot is evidence of what a tool showed, at one moment. Give it a number, a caption, the tool and version, the file it showed and what you did to reach that view: its {% include term.html t="provenance" %}. Hide what must not be shown, such as a test persona's phone numbers, and say that you did.

**4. Times with their clock.** Session 5 and Session 15: every time in UTC, with the clock it came from. "20:32:35 UTC, from `sync_log.log`, written as 16:32:35 with the offset -0400 in the line."

**5. Fact apart from opinion.** A fact is what a record shows. An opinion is what you conclude from facts. Both belong in a report, but never in the same breath. "The browser recorded a typed visit to the address" is a fact; "the user wanted to read the news" is an opinion, and it must say which facts it rests on.

**6. Confidence, stated.** Say how sure you are, and why, in words the reader can compare across findings. One simple way is to use a few fixed phrases and say what each one means in your method section:

| Phrase | Use it when |
|---|---|
| The evidence shows | Two or more independent records agree, and no record contradicts them |
| The evidence is consistent with | One record supports it, and nothing contradicts it |
| The evidence cannot show | The records needed do not exist or cannot be read, and you say why |

The third phrase is as important as the first. On the test phone, "the evidence cannot show what the removed picture was, because the calculator vault's database keeps no trace of its row and the program cleans deleted data" is a finding with its limitation, stated with confidence.

<div class="box lens" markdown="1">

**Through another lens: information design.** In 1986 the space shuttle Challenger broke apart shortly after launch, on an unusually cold morning. The cause was a seal, an O-ring, that failed in the cold. The night before, the engineers who built the rocket had argued against the launch and sent charts to support their case. The charts did not persuade the managers.

Years later, Edward Tufte, a writer on information design, argued in *Visual Explanations* that the engineers had the evidence but not a picture of it: their thirteen charts never set temperature beside damage. He redrew the data as one plot of damage against temperature, and argued that such a plot would have made the danger plain. His lesson is this session's: evidence persuades only when it is legible.

**Where it breaks.** The engineers answered him. In 2002, Roger Boisjoly, who had argued against the launch, and three colleagues replied in a journal of engineering ethics. Tufte's clean plot, they wrote, mixed two kinds of temperature, the air's and the seal's, and used figures the engineers did not have that night. The clear picture made the evidence look more certain than it was. Clarity can mislead: a clean figure can hide exactly the uncertainty a decision depends on.

**The question it raises.** When you make a finding legible, is the uncertainty still visible, or did your clean figure remove it?

</div>

**So legibility must carry its limitations.** Run the demo: the same finding, drawn twice.

{% include demo.html id="S16-D5" %}

<div class="box key" markdown="1">

**The pivotal idea.** A finding no one understands is not a finding. Make every finding legible, and make its limitation legible with it: a clean figure that hides a gap misleads as surely as a figure no one can read.

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "Figure 3 shows the uploads." | "Figure 3: uploads to the Drive account, from `sync_log.log` (S02-001), Autopsy 4.23.1; times in UTC." | A figure without its source cannot be checked. |
| "The user deleted the picture." | "The vault app's records no longer hold the picture's row; the owner's notes record its removal at 14:51 EDT on 26 July 2024." | Name the record and its author; keep fact and opinion apart. |
| "No data was found." | "The evidence cannot show it, because the database cleans deleted data; see limitation L2." | An absence needs its cause and its effect. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A chart in a draft report shows the test phone's database activity per day as a smooth line, with no mark on the day that the vault's records were cleaned. What is wrong with it?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing: a smooth line is easier to read</li>
    <li data-key="b">It hides a gap: the reader cannot see that one day's records were removed and cannot be recovered, so the chart looks more complete than the evidence is; mark the gap and its cause on the chart and in its caption</li>
    <li data-key="c">Charts do not belong in forensic reports</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A figure must carry the evidence's limits as well as its pattern. Legibility (a) is the aim, but not at the cost of honesty. Charts are welcome in reports (c) when they carry their source and their gaps.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Standards for forensic reports, and verbal scales</summary>

**Standards.** ISO/IEC 27037 covers the identification, collection, acquisition and preservation of digital evidence, and ISO/IEC 27042 its analysis and interpretation, including what a report should record. NIST SP 800-86, from Session 1, names reporting as the fourth stage of a forensic process. Courts and professional bodies in many countries add their own rules for expert reports: an expert states the facts relied on, the method, the range of opinion and the limits of the expert's knowledge.

**Verbal scales.** Some forensic fields use agreed scales of phrases for the strength of evidence, so that "strong support" means the same in every report from that field. Digital forensics has no single agreed scale. Whatever phrases you use, define them in your method section and use them the same way throughout.
</details>

## 9. Reproducible method and one citation style

### The idea

A finding is believed when another examiner can check it. {% include term.html t="reproducibility" %} means writing your method fully enough that someone with the same evidence and the same tools would get the same result. It is the reason your method section exists, and it is what a reviewer will try first.

A report also rests on sources outside your evidence: the file format, a tool's documentation, a standard. Each is cited, in one {% include term.html t="citation-style" %} used the same way everywhere.

### How it works

**What a reproducible method states.** For each step: the item (by exhibit reference and hash value); the tool and its exact version; the settings or command; what the step changed, if anything, and how you know (hash values before and after); and the result. Compare two versions of the same step:

| Not reproducible | Reproducible |
|---|---|
| "The database was examined and deleted records were recovered." | "A copy of S16-001 (SHA-256 recorded in Appendix B) was opened in FQLite 4.22 on Windows 11; the table `cloud_entry` was exported with Export Table to CSV. Two rows marked D were checked at their offsets in FQLite's hex view. The copy's hash value was unchanged after the tool closed." |

**Citing in one style.** APA 7 puts the author and year in the text, and an alphabetical list at the end. IEEE puts a number in square brackets in the text, and a list in the order of first citation. Both are accepted for your coursework; pick one and never mix them. Here are the same sources in both styles:

| | APA 7 | IEEE |
|---|---|---|
| In the text | ...as the file format describes (SQLite, n.d.). | ...as the file format describes [1]. |
| A web document | SQLite. (n.d.). *Database file format*. https://www.sqlite.org/fileformat.html | [1] SQLite, "Database file format." Accessed: (the day you read it). [Online]. Available: https://www.sqlite.org/fileformat.html |
| A dataset | National Institute of Standards and Technology. (2018). *Data leakage case* [Data set]. Computer Forensic Reference Data Sets. https://cfreds-archive.nist.gov/data_leakage_case/data-leakage-case.html | [2] National Institute of Standards and Technology, "Data leakage case," Computer Forensic Reference Data Sets, 2018. [Online]. Available: https://cfreds-archive.nist.gov/data_leakage_case/data-leakage-case.html |
| Software | Pawlaszczyk, D. (2026). *FQLite* (Version 4.22) [Computer software]. https://github.com/pawlaszczyk/fqlite | [3] D. Pawlaszczyk, *FQLite*, version 4.22, 2026. [Online]. Available: https://github.com/pawlaszczyk/fqlite |

Cite the tool with its version, as you name it in the method. Cite only sources you used, and use the source itself, not a page that quotes it.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A method section says: "Deleted rows were recovered with FQLite." Which addition makes it reproducible?</p>
  <ul class="qc-opts">
    <li data-key="a">A sentence explaining that FQLite is a well-known tool</li>
    <li data-key="b">A screenshot of FQLite's start screen</li>
    <li data-key="c">The exhibit and its hash value, the tool's exact version and platform, how the table was opened and exported, how each recovered row was checked, and the hash value after the tool closed</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Another examiner needs the item, the tool and version, the steps and the check. A tool's reputation (a) proves nothing about this run, and a start screen (b) shows no step.</p></div>

</div>

<div class="box key" markdown="1">

Write each step so a stranger could repeat it: item, tool and version, settings, what changed and the result. Cite every outside source in one style, the tool with its version.

</div>

## 10. The lab: recover the records, then write them up

Your task in one line: recover and check the deleted records of three test-phone databases and the suspect's Drive database, without changing them, then write one report section from your mobile findings.

You need the Windows VM, PowerShell, DB Browser for SQLite, FQLite, Notepad, your copy of the report template from Session 13, your Session 14 and Session 15 notes, and the files from folder `S16` on the lab share. Kali and REMnux stay off unless you choose the stretch task. Allow about an hour and a half.

<div class="box lms" markdown="1">

Folder `S16` on the lab share holds the S16 set: the Drive databases from the suspect's computer, the test phone's set, the unit's recovery output, the evidence register and the report checklist. FQLite's installer is in the `Tools` folder. If you are studying away from the lab, the LMS explains how to get the same files.

</div>

**What you receive.** Five exhibits, all listed in `s16-evidence-register.csv` with their hash values:

| Exhibit | File in folder `S16` | What it is |
|---|---|---|
| S16-001 | `s16-drive-vsc\snapshot.db` | The Drive program's database, from the shadow copy of the suspect's computer |
| S16-002 | `s16-drive-vsc\sync_config.db` | Its settings database, from the same shadow copy |
| S16-003 | `s16-drive-live\snapshot.db` | The same database, recovered from the current volume as a deleted file, Session 2's way |
| S16-004 | `s16-phone-set.tar` | Eight files of three apps, cut byte for byte from Session 15's examination subset |
| S16-005 | `s16-recovery-output.zip` | The unit's own recovery output, for comparison once you have done your own |

The phone set is a small cut made by a written rule, as Session 15's subset was cut from the whole extraction. It holds Private Photo Vault's database with its WAL and shm files, the calculator vault's database with its journal, and Threema's database with its WAL and shm files. Threema's key file is left out on purpose: today does not decrypt.

<div class="box safety" markdown="1">

**Three rules for today.**

1. **Never open an original.** Everything in `C:\Evidence\S16` stays as you copied it. You open copies in `C:\Cases\S16\work`, and the copies that may be changed in `C:\Cases\S16\scratch`.
2. **Never open a link or contact anyone from the evidence.** The Drive link codes are evidence, not addresses to visit.
3. **No contact details in your notes or your report.** The test phone's persona has phone numbers and e-mail addresses in her apps. Leave them out, even where a tool shows them.

</div>

### Part A: receive, hash and copy (about 10 minutes)

1. **Make your folders and copy the set.** In the Windows VM, create `C:\Evidence\S16`, `C:\Cases\S16\work` and `C:\Cases\S16\scratch`. Copy everything in folder `S16` on the lab share into `C:\Evidence\S16`, keeping the two subfolders.

   <div class="box expect" markdown="1">

   `C:\Evidence\S16` holds the two folders `s16-drive-vsc` and `s16-drive-live`, and the files `s16-phone-set.tar`, `s16-recovery-output.zip`, `s16-evidence-register.csv` and `s16-report-checklist.md`.

   </div>

   <div class="box trouble" markdown="1">

   If a subfolder is missing, copy the folder `S16` again as a whole rather than file by file. If the copy is refused for space, the whole set is small; check the free space on drive C:.

   </div>

2. **Hash everything before anything opens it.** In PowerShell:

   ```powershell
   Get-ChildItem C:\Evidence\S16 -Recurse -File | Get-FileHash -Algorithm SHA256 |
     Select-Object Hash, Path | Export-Csv C:\Cases\S16\s16-hashes-before.csv -NoTypeInformation
   Get-Content C:\Cases\S16\s16-hashes-before.csv
   ```

   Compare each value with the register, exhibit by exhibit.

   <div class="box expect" markdown="1">

   Every exhibit's value matches its row in the register. The register also records how each exhibit was made: S16-001 and S16-002 from the shadow copy, S16-003 from a deleted file entry, S16-004 from S15-002 with both hash values.

   </div>

   <div class="box trouble" markdown="1">

   If a value differs, copy that file again from the lab share. If it still differs, stop and tell the lecturer, exactly as in Session 1.

   </div>

3. **Make your working copies.** Unpack the phone set and copy the Drive databases into the working folder:

   ```powershell
   tar -xf C:\Evidence\S16\s16-phone-set.tar -C C:\Cases\S16\work
   Copy-Item C:\Evidence\S16\s16-drive-vsc -Destination C:\Cases\S16\work -Recurse
   Copy-Item C:\Evidence\S16\s16-drive-live -Destination C:\Cases\S16\work -Recurse
   Get-ChildItem C:\Cases\S16\work -Recurse -File | Get-FileHash -Algorithm SHA256 |
     Select-Object Hash, Path | Export-Csv C:\Cases\S16\s16-hashes-work.csv -NoTypeInformation
   ```

   <div class="box expect" markdown="1">

   The phone files are under `C:\Cases\S16\work\Dump\data\data\`, in three app folders, each database beside its companion files, with the names unchanged. Each working copy has the same hash value as the file it came from.

   </div>

   <div class="box trouble" markdown="1">

   If `tar` is not recognised, Windows is older than version 1803; tell the lecturer, who has the eight files unpacked. If a folder holds a database but not its `-wal` or `-shm`, the unpack stopped early: delete the `work\Dump` folder and run the `tar` line again.

   </div>

### Part B: read the live records, and see the wrong way (about 15 minutes)

4. **Read Private Photo Vault, read-only.** Open DB Browser for SQLite. Choose **File**, **Open Database Read Only**, and open `ppv.db`: from `C:\Cases\S16\work`, go through the folders `Dump`, `data`, `data`, `com.enchantedcloud.photovault` and `databases`. On the tab **Browse Data**, look at the tables `MediaFile`, `Album` and `CircularLog`. Close the database.

   <div class="box expect" markdown="1">

   DB Browser lists about a dozen tables, among them `Album`, `MediaFile`, `LoginRecord`, `Download`, `CircularLog` and `room_master_table`. `MediaFile` has 3 rows, `Album` 2 rows and `CircularLog` none. Write these counts in `C:\Cases\S16\s16-notes.txt`.

   </div>

   <div class="box trouble" markdown="1">

   If DB Browser shows no tables at all, the `ppv.db-wal` file is not beside `ppv.db`, or its name changed: check the folder. If it asks to save changes on closing, choose **No**: a read-only open should change nothing in the database.

   </div>

5. **See what reading changed.** Hash the three files again:

   ```powershell
   Get-FileHash C:\Cases\S16\work\Dump\data\data\com.enchantedcloud.photovault\databases\ppv.db* -Algorithm SHA256
   ```

   <div class="box expect" markdown="1">

   `ppv.db` and `ppv.db-wal` have the same values as in your `s16-hashes-work.csv`. `ppv.db-shm` may have a new value: a reader writes its read marks there (section 4). Write which file changed and why in your notes.

   </div>

   <div class="box trouble" markdown="1">

   If `ppv.db` or `ppv.db-wal` changed, the database was not opened read-only. Copy the three files again from `C:\Evidence\S16` into `work` (unpack the `.tar` into a new folder), and repeat step 4 with **Open Database Read Only**.

   </div>

6. **The wrong way, on scratch copies.** Copy the three Private Photo Vault files into `C:\Cases\S16\scratch`. List their sizes. Then open `scratch\ppv.db` with the ordinary **File**, **Open Database**, look at one table, close the database, and list the folder again:

   ```powershell
   Copy-Item C:\Cases\S16\work\Dump\data\data\com.enchantedcloud.photovault\databases\ppv.db* C:\Cases\S16\scratch
   Get-ChildItem C:\Cases\S16\scratch | Format-Table Name, Length
   # now open and close scratch\ppv.db in DB Browser with the ordinary Open Database
   Get-ChildItem C:\Cases\S16\scratch | Format-Table Name, Length
   ```

   <div class="box expect" markdown="1">

   Before: `ppv.db` 4,096 bytes, `ppv.db-wal` 168,952 bytes, `ppv.db-shm` 32,768 bytes. After: `ppv.db` has grown, to 81,920 bytes in the unit's run, and the WAL and shm files are gone. The data you saw is the same, and every older version the log held is lost. This is the demo's first row, on your own machine.

   </div>

   <div class="box trouble" markdown="1">

   If the WAL file is still there after closing, DB Browser may still hold the database open: close DB Browser itself, then list the folder again. If the sizes differ a little from the unit's, write yours: the point is that the log was folded in and removed.

   </div>

7. **Read a database's own settings.** Open `note_contact.db` read-only: from `C:\Cases\S16\work`, go through `Dump`, `data`, `data`, `com.calculator.lock.hide.photo.video` and `databases`. On the tab **Execute SQL**, run these lines one at a time:

   ```sql
   PRAGMA page_size;
   PRAGMA page_count;
   PRAGMA auto_vacuum;
   PRAGMA freelist_count;
   ```

   Then look at the tables `Hide` and `Delete_Data` on **Browse Data**.

   <div class="box expect" markdown="1">

   Page size 4096, page count 12 (12 pages of 4,096 bytes is the file's 49,152 bytes), auto-vacuum 1 (full), freelist count 0. `Hide` has one row, a picture named `0_DiwGeKS.jpeg`; `Delete_Data` is empty. The journal beside the database, `note_contact.db-journal`, is 0 bytes.

   </div>

   <div class="box trouble" markdown="1">

   If a PRAGMA line gives an error, run it on its own, without the others selected. DB Browser runs the selected text, or the whole box if nothing is selected.

   </div>

### Part C: recover on the phone (about 15 minutes)

8. **Install FQLite and open the calculator vault.** Run `fqlite-4.22-windows.exe` from the `Tools` folder (Java is included). In FQLite choose **Open Database...** and open the working copy of `note_contact.db`. Click each table in the tree on the left, and look at the status column of the rows.

   <div class="box expect" markdown="1">

   FQLite lists the same tables as DB Browser. No row has the status D for deleted. Together with step 7, you can now write the finding of section 2: the documented removal of a picture on 26 July 2024 left no row, no free page and no non-zero free bytes in this database.

   </div>

   <div class="box trouble" markdown="1">

   If the installer asks for administrator rights you do not have, ask the lecturer, who has the portable copy. If FQLite opens an empty window, open the database again from the menu rather than by dragging the file.

   </div>

9. **Open Private Photo Vault in FQLite.** Open the working copy of `ppv.db`. FQLite finds the WAL beside it by itself. Look at the table `CircularLog`.

   <div class="box expect" markdown="1">

   FQLite shows a `CircularLog` row with the values `1`, `usedSpace`, `1969-12-31T19:00:00-05:00` and `839680`, and its status column is empty. DB Browser in step 4 showed `CircularLog` with no rows. So this row is in the log but not in the newest state: it existed after an earlier change and was removed later. FQLite marks where it came from: in the unit's run, WAL frame 25, page 16. Write it in your notes as a row recovered from the WAL, and note that the tool did not flag it as deleted: you found that by comparing two tools.

   </div>

   <div class="box trouble" markdown="1">

   If FQLite shows no `CircularLog` row, check that the `-wal` file is beside `ppv.db` in the folder you opened, with its name unchanged. If FQLite shows the row twice, once from the database and once from the log, record both and the source of each.

   </div>

10. **Check Threema before trying anything.** Look at the first bytes of Threema's database and of its WAL:

    ```powershell
    $t = 'C:\Cases\S16\work\Dump\data\data\ch.threema.app\databases'
    Format-Hex -Path "$t\threema4.db" | Select-Object -First 2
    Format-Hex -Path "$t\threema4.db-wal" | Select-Object -First 4
    ```

    <div class="box expect" markdown="1">

    The database does not start with `SQLite format 3`: its first bytes look random, as in Session 15. The WAL starts with the readable WAL header (`37 7F 06 82`), but the bytes after the first 56 look random too. The log's structure is readable and its pages are encrypted: app-level encryption reaches the WAL. Write it as a limitation: no record recovery is possible without the app's key, which this session does not use.

    </div>

    <div class="box trouble" markdown="1">

    If `Format-Hex` prints the whole file, press Ctrl+C and check the `| Select-Object` part of the line. If the WAL's first bytes are not `37 7F 06 82` or `37 7F 06 83`, check that you opened `threema4.db-wal`, not the shm file.

    </div>

### Part D: the case, the Drive database (about 25 minutes)

11. **Read the live rows.** Open the working copy of `s16-drive-vsc\snapshot.db` read-only in DB Browser. Look at the table `cloud_entry`. Search its `doc_id` column for the two link codes from your Session 14 notes: `0Bz0ye6gXtiZaVl8yVU5mWHlGbWc` and `0Bz0ye6gXtiZaakx6d3R3c0JmM1U`.

    <div class="box expect" markdown="1">

    `cloud_entry` holds the files that were still in the Drive account when the shadow copy was made. Neither link code is among its live rows: those two files had been deleted from Drive two days before.

    </div>

    <div class="box trouble" markdown="1">

    If DB Browser says the file is not a database, you opened the S16-003 copy from `s16-drive-live`: use the one in `s16-drive-vsc`.

    </div>

12. **Recover the deleted rows.** Open the same working copy in FQLite, select `cloud_entry`, and look for rows with the status D. Export the table with **Export Table...** to `C:\Cases\S16\s16-cloud-entry.csv`.

    <div class="box expect" markdown="1">

    Rows with status D whose `doc_id` and `filename` are the two link codes and the two file names of section 6. Each row shows its offset in the file and its page. Some fields of a recovered row may be shifted or cut, as section 5 explained.

    </div>

    <div class="box trouble" markdown="1">

    If FQLite shows no D rows, check that you opened the copy from `s16-drive-vsc`, and compare with the unit's export in `s16-recovery-output.zip`. If your rows differ from the unit's, keep both and write the difference in your notes: two runs that disagree tell you which bytes to look at.

    </div>

13. **Check every recovered row.** For each D row: read each field against its column's type; compare `filename` and `size` with the Drive log's own lines, which give `happy_holiday.jpg` as 440,517 bytes and `do_u_wanna_build_a_snow_man.mp3` as 6,844,294 bytes; open **Hex-Viewer...** at the row's offset and find the identifier and the name in the bytes. Write the result in `C:\Cases\S16\s16-recovered.csv` with these columns:

    ```
    exhibit,file,table,status,page,offset_or_frame,key_values,fields_checked,whole_or_partial
    ```

    Add the `CircularLog` row from step 9 as a second kind of recovery: its exhibit is S16-004, and its offset column holds the WAL frame.

    <div class="box expect" markdown="1">

    At least two rows from `cloud_entry`, each with its identifier and name confirmed in the bytes, and a line saying which fields came out whole. The match from the link codes to the names is now your own finding, not the answer key's.

    </div>

    <div class="box trouble" markdown="1">

    If a size does not match the log, check whether its column is shifted: a name that starts in the middle of an identifier is the sign. Record the row as partial and confirm only the fields you can see in the bytes.

    </div>

14. **Compare Session 2's way.** Open the working copy of `s16-drive-live\snapshot.db` read-only in DB Browser, then in FQLite.

    <div class="box expect" markdown="1">

    This copy, recovered from the current volume as a deleted file, opens empty or is refused as "not a database", as investigators of this case report; the register records what the unit's copy gave. Write one sentence in your notes on why the shadow copy succeeded where file recovery did not.

    </div>

    <div class="box trouble" markdown="1">

    If this copy does open and holds rows, that is a better result than expected: record its rows and compare them with S16-001's.

    </div>

### Part E: write one report section (about 20 minutes)

15. **Write the section from your mobile findings.** Open your copy of the report template. Save it as `C:\Cases\S16\s16-report-section.docx` (or `.md`). Fill only these parts, from your Session 15 and today's mobile findings, never from your coursework:

    - **2.3 Analysis**: three to five lines of method for today's phone work: the exhibits and hash values, the tools with versions, read-only handling, what changed and why.
    - **3. Findings**: one short finding on the test phone's databases, such as "the photo vault's database is held in its WAL, and the log keeps a row the newest state does not", with its evidence by exhibit reference, file, table and frame, and its time in UTC where it has one.
    - **4. Limitations**: two limitations in Session 13's three parts: the calculator vault's documented deletion that left no trace, with its cause; and Threema's encryption.
    - **6. References**: every outside source you used, in one style, APA 7 or IEEE, as in section 9.

    <div class="box expect" markdown="1">

    About 300 to 400 words. Every claim has an exhibit reference; every time has its clock; the findings say what the records show and the limitations say what they cannot show.

    </div>

    <div class="box trouble" markdown="1">

    If your Session 15 findings are missing, use today's alone: steps 4 to 10 give you a finding and two limitations. If you find yourself writing about the cloud incident, stop: today's section is about the test phone only.

    </div>

16. **Write the executive-summary paragraph last.** Above section 2, write three to five sentences for a reader who reads nothing else: what the unit found on the test phone's databases, how sure it is and why, and what that means for examining phones. No commands, field names, offsets or hash values.

    <div class="box expect" markdown="1">

    Each sentence of the paragraph has a finding or a limitation behind it in your section.

    </div>

    <div class="box trouble" markdown="1">

    If a sentence has no finding behind it, delete it or write the finding. If the paragraph is longer than five sentences, you are summarising the method; cut back to what happened, how sure, and what follows.

    </div>

### Part F: check it (about 5 minutes)

17. **Check the section against the checklist.** Open `s16-report-checklist.md` from your evidence folder and tick each line that your section meets, in a copy beside your report. The checklist is also below.

| # | The section ... | Where |
|---|---|---|
| 1 | Keeps the template's headings and order | Whole section |
| 2 | Names the evidence for every claim: exhibit reference, file, table, and page, offset or frame | Findings |
| 3 | Gives every time in UTC with the clock it came from | Findings |
| 4 | Keeps fact apart from opinion, and states confidence in the phrases of section 8 | Findings, summary |
| 5 | States each limitation in three parts: what was seen, its effect, its evidence | Limitations |
| 6 | Gives enough method to repeat each step: item, tool and version, read-only handling, hash values before and after | Analysis |
| 7 | Cites every outside source in one style, the tools with their versions | References |
| 8 | Gives each table, figure or screenshot a caption with its source | Wherever used |
| 9 | Has an executive-summary paragraph written last, with a finding behind every sentence | Summary |
| 10 | Holds no phone number or e-mail address of the test persona | Everywhere |

### Checkpoint

Judge your work against the checklist above and the two files below. It is formative and is not marked here, but the report section rehearses criteria of your coursework, and the recovery is examined.

| # | Check | Your proof |
|---|---|---|
| 1 | Every exhibit verified against the register, and every working copy's hash value recorded | `s16-hashes-before.csv`, `s16-hashes-work.csv` |
| 2 | What changed when you read, and what the wrong way destroyed, with sizes | `s16-notes.txt` |
| 3 | The recovered records, each with its source and what was whole | `s16-recovered.csv` |
| 4 | The match from the two link codes to the two file names, from your own recovery | `s16-recovered.csv` |
| 5 | A report section that meets all ten lines of the checklist | `s16-report-section` |

### If you have time

**A second reading on Kali.** sqlite_dissect is a recovery tool that labels where every recovered row came from: a freeblock, the free space of a page, a free page or a version in the WAL. Copy `s16-drive-vsc\snapshot.db` and the three Private Photo Vault files to Kali through your shared folder, install it with `pipx install sqlite-dissect`, and run it on each:

```bash
sqlite_dissect snapshot.db -c -f -d out-snapshot -e csv
sqlite_dissect ppv.db -w ppv.db-wal -c -f -d out-ppv -e csv
```

Compare its output with FQLite's. Where they disagree, explain why from section 5, and write in one sentence which tool you would cite for each finding and why.

## Check yourself

**1. Describe how SQLite finds one row of a table in a database file.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
SQLite reads the table's root page from the schema, then follows the B-tree down through interior pages to a leaf page, where it reads the page header and the cell pointer list, finds the pointer for the row and reads the cell at that position. The cell holds the rowid and a record that gives each column's type and value. The points that earn marks: (1) the B-tree of pages from a root; (2) the cell pointer list on the page; (3) the cell holding the record.
</details>

**2. Explain why a row deleted from a SQLite table can often still be read, and name two things that prevent it.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Deleting a row removes its entry from the page's cell pointer list, but its bytes stay on the page as a freeblock or in the page's free space, or on a free page, until they are reused. Secure delete fills the bytes with zeros at once, and vacuum rebuilds the file without its free space; auto-vacuum and reuse also destroy them. The points that earn marks: (1) the pointer is removed, not the bytes; (2) where the bytes remain; (3) two destroyers named correctly.
</details>

**3. Compare a rollback journal with a write-ahead log as sources of deleted or changed records.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A rollback journal holds the old copy of each page while a change is made, so if it survives with content it can hold the page as it was before a deletion; after a successful change it is usually deleted, cut to zero or zeroed. A write-ahead log holds new versions of whole pages until a checkpoint, and keeps earlier versions of the same page until the log is reused, so it can hold newer and older versions of a row than the database file. The points that earn marks: (1) journal holds old pages during a change; (2) WAL holds new page versions until a checkpoint; (3) what each can still hold afterwards.
</details>

**4. An examiner double-clicks a copied app database to look at it. Explain what may have been lost.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
If the database uses a write-ahead log, an ordinary program closing it runs a checkpoint that copies the newest pages into the database file and deletes the log, so every older version of every page that only the log held is lost. The newest data still looks complete, so the loss is easy to miss, which is why databases are hashed first and opened read-only, as copies, in a tool that does not checkpoint. The points that earn marks: (1) the checkpoint on close; (2) the log and its older versions are lost; (3) the handling that prevents it.
</details>

**5. Explain why a deleted row recovered by a tool is not yet a finding.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The start of a deleted cell is often overwritten, so the tool must guess the record's layout, and it can place values in the wrong columns or build a row from bytes that only resemble one. The examiner checks each field against its type and against another source, finds the bytes at the offset the tool gives, and reports which fields are whole. The points that earn marks: (1) the record's start may be lost; (2) fields checked against type and another record; (3) bytes found at the source page and offset.
</details>

**6. State what an executive summary must contain, and why it is written last.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
It states what happened, how sure the examiner is and why, and what should change, in plain words for a reader who reads nothing else, without commands, field names or offsets. It is written last because it summarises findings and limitations that exist only once the rest of the report is written, and every sentence in it must have a finding behind it. The points that earn marks: (1) the three contents; (2) the reader who reads nothing else; (3) written last because it rests on the findings.
</details>

**7. Give two ways a figure in a forensic report can mislead, and how to prevent each.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A figure without its source cannot be checked, so every figure needs a caption naming the exhibit, the file and the tool with its version. A clean figure can hide a gap or an uncertainty, such as a day with no records, so the gap and its cause must be drawn on the figure and named in its caption. The points that earn marks: (1) missing source, prevented by a caption; (2) hidden gap or uncertainty, prevented by showing it; (3) the link to the reader's trust.
</details>

<div class="quiz" markdown="1">

## End-of-day quiz

This quiz closes Day 8 and spans Sessions 15 and 16. Write each answer in about two sentences before you open the model answer. Mark yourself on the points you made.

<div class="sa" markdown="1">

**Q1.** In Session 15, an app database on a phone extraction did not start with the bytes `SQLite format 3`. Explain what this most likely means, and what it means for recovering deleted records from it and from its WAL file. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The app has most likely encrypted its own database with its own key, on top of the phone's encryption, as Threema does. Its WAL frames carry readable headers but encrypted pages, so no recovery tool can read records from either file without the key, and the honest result is a limitation. **Points:** (1) app-level encryption; (2) the WAL's pages are encrypted too; (3) no recovery without the key, stated as a limitation.
</details>

</div>

<div class="sa" markdown="1">

**Q2.** In Session 15, a phone's browser history held 25 rows for one afternoon, of which 18 were hidden rows the pages requested by themselves. Explain how a report sentence about this history should be written, and why. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The sentence should name the author of the record, for example "the browser recorded a typed visit to the address", rather than "she visited", and keep the hidden rows apart from the pages the user opened. Many rows are written by apps and pages without the person's action, so a sentence that credits them to the person states an opinion as a fact. **Points:** (1) name the record's author; (2) separate user-opened pages from automatic requests; (3) fact kept apart from opinion.
</details>

</div>

<div class="sa" markdown="1">

**Q3.** An app on an Android phone deleted a message from a database in WAL mode, and the phone was extracted before any checkpoint. Explain where the deleted message may still be found, and why it may be missing from the database file itself. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
An earlier frame of the WAL may still hold the message's page as it was before the deletion, because the log keeps every page version it wrote until a checkpoint and reuse. The database file itself may never hold it as deleted bytes, because Android's system SQLite cleans deleted data with secure delete and keeps the freelist empty with auto-vacuum. **Points:** (1) an earlier WAL frame; (2) kept until checkpoint and reuse; (3) secure delete and auto-vacuum on Android.
</details>

</div>

<div class="sa" markdown="1">

**Q4.** A deleted database file is recovered from a volume by its file system entry, as in Session 2, but it opens empty. A volume shadow copy of the same volume exists. Explain why the shadow copy may succeed, and what the examiner still has to do to get deleted rows from it. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
A shadow copy holds the volume as it was at an earlier moment, so if it was made before the file was deleted it holds the whole database file, while the deleted file on the current volume may have lost clusters to reuse. Rows deleted inside the database before the shadow copy was made are still only free bytes in it, so the examiner opens a copy read-only and uses a record recovery tool, then checks each recovered row. **Points:** (1) the shadow copy predates the file's deletion; (2) the current copy may be overwritten; (3) record recovery and checking are still needed inside it.
</details>

</div>

<div class="sa" markdown="1">

**Q5.** A draft executive summary says: "The suspect deliberately leaked the files using Google Drive." Rewrite it so that it keeps fact apart from opinion and states confidence, and explain the change. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
For example: "The evidence shows that two client documents were renamed, uploaded to a personal Google Drive account and shared by links sent in a mail, all from the suspect's user account within twenty minutes; it cannot show who was at the keyboard." The rewrite states what the records show with its confidence and its limit, and leaves intent and guilt, which are opinions the records cannot prove, to the reader and the court. **Points:** (1) facts the records show; (2) a stated confidence and limit; (3) intent and guilt removed as unsupported opinion.
</details>

</div>

</div>

## Coming next

Today you recovered records at the smallest scale the module reaches, inside a page of a database, and wrote them up for a reader. Session 17 widens out again: it brings the computer, the network and the cloud together into one investigation and one timeline, and closes the module's ethics and law, including what the unit may and may not do with evidence like the test phone's.
