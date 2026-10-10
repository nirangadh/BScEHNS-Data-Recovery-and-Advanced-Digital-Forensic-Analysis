---
session_code: S03
description: "How to recover content when no index entry is left: carving files by their signatures, why fragmentation defeats carving, where to carve, what feature extraction adds, and how a lost partition or a RAID set is found again."
hook: >-
  In Session 2 every file you recovered still had a record that pointed to it. Now the records are gone.
  Before the unit returns to the client's evidence, it rehearses on a closed case: what can you recover from content alone, and how do you prove what it is?
outcomes:
  - "Explain how a carving tool finds a file by its header, its footer or a size limit, with no help from a file system"
  - "Explain why a carved file has no name, dates or path, and why a fragmented file is carved wrongly"
  - "Compare carving the whole image with carving unallocated space only, and identify what each choice misses"
  - "Compare file carving with feature extraction, and identify what bulk_extractor finds that a carving tool does not"
  - "Explain how a lost partition is found from its boot sector, and why disk order and stripe size decide whether a RAID set can be read"
  - "Apply PhotoRec, Foremost, TestDisk and bulk_extractor to the lab evidence"
  - "Justify each recovered item by matching its SHA-256 hash value to the expected list"
before:
  - "Explain [how deletion really works](../s02/#4-how-deletion-really-works) in FAT, NTFS and ext4 (Session 2)"
  - "Name the three places [where recoverable data lives](../s02/#5-where-recoverable-data-lives): unallocated space, file slack and unpartitioned space (Session 2)"
  - "Describe the four states in [the limits of recovery](../s02/#6-the-limits-of-recovery), and say why state 4 was left open (Session 2)"
  - "Read a [partition table](../s02/#1-the-disk-has-a-map-sectors-and-partitions) and say what it does not show (Session 2)"
  - "Calculate a [hash value](../s01/#3-the-hash-value-showing-that-nothing-changed) and use it for verification (Session 1)"
demos:
  - id: S03-D1
    title: "Carving by header and footer"
    file: s03-d1-header-footer-carving.html
    teaches: "A carving tool reads raw bytes in order, starts a file at a header and ends it at the footer, or at the size limit when no footer comes."
  - id: S03-D2
    title: "Fragmentation breaks the carve"
    file: s03-d2-fragmentation.html
    teaches: "A carving tool reads straight on, so a file stored in two runs comes back with another file's clusters in the middle and a different hash value."
  - id: S03-D3
    title: "Finding a lost partition"
    file: s03-d3-lost-partition.html
    teaches: "A boot sector describes its own volume, so a scan that finds it can rebuild the missing entry of the partition table."
  - id: S03-D4
    title: "Putting the stripes back in order"
    file: s03-d4-raid-stripes.html
    teaches: "Striped data can be read only when the disks are taken in the right order with the right stripe size."
slides: s03-carving-and-recovery.pptx
evidence: "the lab share, folder `S03` (the lab steps say exactly which files)"
---

Session 2 ended with a table of four states. In state 4 the record of a deleted file has been reused, and the content is still in unallocated space with no name. Your lab showed that this is not rare: the hash set found very few of the client's documents on the suspect's computer, because the records of his deleted folder were gone. Session 2 left that state open, and today closes it.

The unit does not practise a new method on a live engagement. It reopens a closed one. Today's first item is the disk of an executive called Jean, from a start-up named M57.biz, where a confidential spreadsheet of salaries left the company. That case is the M57-Jean scenario, a documented public training collection published by Digital Corpora. The second item is a small test image that the unit built itself, with known contents, so that every result of every tool can be checked. As in Session 2, the names in the evidence belong to the collections, and the methods are real.

One question runs through the whole session. When the index is gone, what can you still read from the content alone? First one file loses its record. Then a whole volume loses its place in the partition table. At the end, a set of disks loses its order.

## 1. Carving: finding a file by its shape

### The idea

Open any part of unallocated space in a hex viewer and you see bytes with no names. Somewhere in today's test image, a cluster begins like this:

```
FF D8 FF E0 00 10 4A 46 49 46 00 01 01 00 00 01
 .  .  .  .  .  .  J  F  I  F  .  .  .  .  .  .
```

You do not need a file system to know what this is. Every JPEG picture begins with the bytes `FF D8 FF`. A few bytes later, this one even says `JFIF`, the name of its format. And somewhere after it, the picture ends with the two bytes `FF D9`.

A pattern of this kind is a {% include term.html t="file-signature" %}. The part at the start of the file is the {% include term.html t="header" %}. The part at the end, when a file type has one, is the {% include term.html t="footer" %}.

A tool can search a whole image for headers and copy out everything from each header to its footer. This is {% include term.html t="file-carving" %}. The tool does not ask the file system anything. It works on a volume that was formatted, on a damaged volume, and on space that belongs to no volume at all.

### How it works

Most file types were designed so that a program can check what it has been given before it tries to open it. That is why the first bytes are fixed. The examiner uses the same bytes for a different purpose.

| File type | Header, in hex | Footer, in hex |
|---|---|---|
| JPEG picture | `FF D8 FF` | `FF D9` |
| PNG picture | `89 50 4E 47 0D 0A 1A 0A` | `49 45 4E 44 AE 42 60 82` |
| GIF picture | `47 49 46 38 39 61`, the text `GIF89a` | `00 3B` |
| PDF document | `25 50 44 46`, the text `%PDF` | `25 25 45 4F 46`, the text `%%EOF` |
| ZIP archive, and so DOCX, XLSX and PPTX | `50 4B 03 04`, the text `PK` and two more bytes | `50 4B 05 06`, then 18 more bytes |
| BMP picture | `42 4D`, the text `BM` | None. The header gives the size of the file |
| Older Office files: DOC, XLS, PPT | `D0 CF 11 E0 A1 B1 1A E1` | None |

Read the table with one question in mind: how sure is each pattern? Eight fixed bytes, as in a PNG header, almost never appear by chance. Two bytes, as in a BMP header or a JPEG footer, appear by chance quite often in a large image. Section 2 returns to this.

A carving tool reads the image from the first byte to the last. Watch one do it.

{% include demo.html id="S03-D1" %}

<div class="box metaphor" markdown="1">

**The comparison.** In Session 2, a file system was a library with a catalogue and shelves. Carving is what you do when the catalogue has burnt. You walk along every shelf and recognise each book by its cover and by its last page.

**Why it fits.** The shelves are the storage area, and you read them in order, as the tool reads sectors. The cover is the header: every book of one publisher's series looks the same at the front. The last page is the footer. Between the two, you take everything on the shelf and call it one book.

**Where it breaks.** Every book has a cover, but many file types have no last page, so the tool must decide in another way where to stop. A book also carries its own title, and a carved file does not: the name and the dates were written on the catalogue card, and the card is gone. And a book stands in one place, while a file may be stored in several runs. Section 4 is about that.

**So what.** Carving gives you content without a name, a date or a place in a folder. It answers "what is on this disk?" and never "who put it there, and when?" For those questions you need other evidence.

</div>

In Session 2, the film *Eternal Sunshine of the Spotless Mind* gave you a trace that remains when the route to it is lost. Carving is the stronger case: there is no route at all, and the content is recognised by its own shape, not as a vague feeling but as exact bytes that a hash value can prove.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "Magic number" | *File signature* | Both mean the fixed bytes that mark a file type. This module uses one term. |
| "Signature" for a hash value or a digital signature | A *file signature* is a pattern at the start of a file. | A hash value is calculated from all the content. A digital signature proves who signed. Neither is a pattern you search for. |
| "Carving" for every kind of recovery | *Carving* uses the content only. Recovery from a record, as in Session 2, uses the index. | The two methods give different things. Only the second gives a name and dates. |
| "The file extension shows the type." | The signature shows the type. The extension is part of the name. | The suspect in Session 2 renamed documents as pictures. Their signatures did not change. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A USB stick has been quick-formatted and then its new, empty file system has been damaged, so that no tool can read it. Can a carving tool still find pictures on it?</p>
  <ul class="qc-opts">
    <li data-key="a">No: without a file system, a tool cannot tell where a file is</li>
    <li data-key="b">Yes: the tool searches the raw data for headers and does not use the file system</li>
    <li data-key="c">Only if the directory entries of the pictures survive</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Carving needs only the content. Option (c) describes recovery from a record, which is Session 2's method. Carving is the method for the case in which no record is left.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Where signatures come from, and how tools store them</summary>

**The source is the file format.** Each format is described in a published document, or was worked out by examining many files. The JPEG standard defines markers that begin with `FF`: `FF D8` starts an image and `FF D9` ends it. The PNG standard fixes the first eight bytes and the name of the last block, `IEND`. The ZIP format begins each stored file with `PK`, the initials of its author.

**One format, several files.** DOCX, XLSX and PPTX are ZIP archives with fixed files inside, so their header is the ZIP header. A carving tool that knows this looks at the names inside the archive to choose between `.zip` and `.docx`. The older DOC, XLS and PPT formats share one header in the same way.

**How the tools keep them.** Foremost has a set of file types built in, and reads more from a configuration file, `/etc/foremost.conf`, in which each line gives an extension, a size limit, a header and an optional footer. PhotoRec has several hundred file types built into the program. On any Linux system, the command `file` uses the same idea to tell you the type of a file from its first bytes.

**Signatures are not secret and not safe.** A person who knows about carving can change the first bytes of a file, and the carving tool will then pass over it. Hiding and its detection belong to Session 4.
</details>

<div class="box key" markdown="1">

Carving finds a file by the pattern of its own content. It needs no file system, and it returns no name, no dates and no path.

</div>

## 2. Where a carved file ends, and what it has lost

### The idea

A header tells the tool where a file starts. The harder question is where it ends. Today's test image holds three planted pictures that answer it in three different ways.

- A JPEG ends with `FF D9`. The tool reads on until it meets those two bytes.
- A BMP has no footer. But bytes 2 to 5 of its header hold the size of the whole file. The tool reads that number and takes exactly that many bytes.
- One planted JPEG has lost its end: a later file was written over its last clusters. The tool finds the header, reads on, and never meets the true footer.

For the third case, the tool needs a rule for giving up. The rule is a {% include term.html t="size-limit" %}: "if no end has come after this many bytes, stop here".

### How it works

| The tool decides the end by | It works when | It goes wrong when |
|---|---|---|
| The footer | The type has a footer, and the file is stored in one run | The same bytes appear earlier by chance, or the true footer was overwritten |
| A size written in the header | The type records its own size, as BMP and ZIP do | The header is damaged, or the file is stored in more than one run |
| The size limit | Nothing else is known | Always, a little: the file comes back too long, with other data after its true end |

A file that is too long often still opens, because most programs stop reading at the true end and ignore what follows. But its hash value is different from the original. Session 2 called this the dangerous state, and it is just as dangerous here.

**Chance matches.** In a large image, short patterns appear where no file begins or ends. Take the JPEG footer. In data that looks random, such as compressed or encrypted content, any two chosen bytes appear about once in every 65,536 positions. So a tool that is reading through such data in search of `FF D9` will soon find those bytes, and stop at a place that is not the end of any picture. A result that the tool reports and that is not a real find is a {% include term.html t="false-positive" %}. You will meet one in the lab, 76,889 bytes long, made from 40,960 bytes of a real picture and 35,929 bytes of something else.

**Files inside files.** A Word document can hold a picture. The picture is a complete PNG or JPEG, with its own header, stored inside the document. A tool that tests every byte finds that inner header too, and carves the picture as a second file. This is not an error, but it means that the number of carved files tells you little about the number of files that were once on the disk.

**What carving cannot return.** The name, the dates and the folder of a file were never in its content. They were in the index. So a carving tool must invent names, and it names each file by the place where it found it:

| The tool writes | Meaning |
|---|---|
| `f0002961.jpg` (PhotoRec) | A JPEG that starts at sector 2,961 of the data it was given |
| `00002961.jpg` (Foremost) | The same: the number is the sector at which the header was found |

That number is worth more than it looks. It is the only link between the carved file and a position on the disk, and with a position you can ask the questions of Session 2: is this sector in a partition, is its cluster allocated, and to which file?

Put the two methods of recovery side by side.

| | Recovery from a record (Session 2) | Carving (today) |
|---|---|---|
| It needs | A surviving record: a directory entry, an MFT record or an inode | A known signature in the content |
| It returns the name, dates and folder | Yes | No |
| It works after the records are reused or the file system is damaged | No | Yes |
| A file stored in several runs | Exact on NTFS, where the record lists the runs | Wrong, as section 4 shows |
| How you prove the result | A hash value | A hash value |

Use both, in that order. Recover everything that still has a record, because a record gives you more. Then carve what is left.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A carving tool returns a JPEG that opens and shows a complete picture. Its hash value does not match the client's original picture, which looks the same. Which explanation fits best?</p>
  <ul class="qc-opts">
    <li data-key="a">The tool carved a different picture</li>
    <li data-key="b">Hash values of carved files never match, because the name is lost</li>
    <li data-key="c">The carved file has extra bytes after the true end of the picture, or is missing some</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). A hash value is calculated from every byte of the content, so one byte too many changes it, although a viewer ignores bytes after the end of the picture. Option (b) is wrong: the name is not part of the content, so losing the name does not change the hash value.</p></div>

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">Foremost reports a picture named <code>00102400.jpg</code> from a disk image with 512-byte sectors. What does the name tell you?</p>
  <ul class="qc-opts">
    <li data-key="a">The header was found at sector 102,400, so you can check which partition and which cluster that is</li>
    <li data-key="b">The picture is 102,400 bytes long</li>
    <li data-key="c">It was the 102,400th file on the disk</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Carving tools name a file by the position of its header. The name is your link back to the disk, and in today's test image that sector turns out to lie outside every partition.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>PhotoRec and Foremost: two ways to carve</summary>

| | Foremost | PhotoRec |
|---|---|---|
| How it finds a file | Header, footer and size limit for each type | Header, then a check of the file's inner structure for many types |
| Where it looks for a header | At every byte. With the option `-q`, only at the start of each 512-byte block | At the start of each sector or cluster |
| What it does with a file that looks broken | Writes it anyway | Rejects it, unless you choose to keep corrupted files |
| A file inside another file | Found, when it searches every byte | Usually not found |
| Its record of the work | `audit.txt`, with the position of every file | `report.xml` and, with `/log`, `photorec.log` |
| Where it came from | Written for the United States Air Force Office of Special Investigations; public domain | Written by Christophe Grenier, with TestDisk; free software |

Neither tool is "better". Foremost shows you everything that begins like a file, including broken ones, and leaves the judgement to you. PhotoRec judges for you, and gives a cleaner result with fewer surprises. In the lab, the difference between their two lists is where the interesting items are.

**More about ends.** A PDF that was saved several times can hold several `%%EOF` marks, and the true end is the last of them. A JPEG taken by a camera often holds a small preview picture inside it, which is itself a JPEG with its own `FF D8` and `FF D9`. A tool that stops at the first `FF D9` returns only the first part of such a file. These are the reasons why a carving tool that understands the structure of a type does better than one that only matches patterns.

**Other tools.** Scalpel is a faster relative of Foremost and uses the same kind of configuration file. Autopsy has a module called PhotoRec Carver, which runs PhotoRec on unallocated space during an ingest. It was switched off in the prepared case of Session 2, because it adds hours to a full disk.
</details>

<div class="box key" markdown="1">

A carving tool ends a file at a footer, at a size written in the header, or at a size limit. A wrong end gives a file that may open and still fails its hash value.

</div>

## 3. Where to carve: the whole image, unallocated space, or slack

### The idea

A carving tool will read whatever you give it. The choice is yours, and it changes the result. In today's lab, PhotoRec returns 6 files from the test image with one choice and 13 files with another. Nothing on the disk changed between the two runs.

Session 2 gave you the three places where data remains after the index has stopped describing it: unallocated space, file slack and unpartitioned space. Each choice of what to carve covers some of these places and misses others.

### How it works

| You carve | The tool reads | You find | You miss |
|---|---|---|---|
| The unallocated space of one volume | Only the clusters that the file system marks as free | Content of deleted files | File slack, unpartitioned space, other volumes. It also needs a file system that the tool can still read |
| One whole volume | Every sector of the partition | The same, plus files in slack, plus a second copy of every current file | Unpartitioned space and other volumes |
| The whole image | Every sector of the device | Everything that begins with a known header, in every place | Nothing by position. But the output is the largest, and much of it is already known |

The first row is the fastest and gives the cleanest list. It is also the one that depends on the file system: the tool must read the record of free clusters to know where to look. If that record is damaged or false, the tool looks in the wrong places.

The last row depends on nothing. Its cost is volume. On a real system disk, a carve of the whole image returns every picture of the operating system and of every program, many thousands of files, with no names. The hash set from Session 2 is how you remove the known ones.

**A file in slack.** One planted item in the test image is a small GIF picture of 3,186 bytes. It lies in the drive slack of a current text file, `NOTES.TXT`, which is 300 bytes long in a cluster of 4,096 bytes. The cluster is allocated, so a carve of unallocated space never reads it. A carve of the whole volume does, and finds a GIF header at the start of the second sector of that cluster.

**Where a file can start.** A file system starts every file at the start of a cluster. So a tool that tests only the first bytes of each cluster, or of each sector, is fast and reports few false positives. It still finds the GIF in slack, because old data in drive slack begins at the start of a sector. But a file inside another file can begin at any byte, and only a search of every byte finds it.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner carves only the unallocated space of the suspect's volume and finds nothing of interest. Which place from Session 2 has this carve certainly not covered?</p>
  <ul class="qc-opts">
    <li data-key="a">The clusters of deleted files</li>
    <li data-key="b">The file slack of current files, and the space outside the partition</li>
    <li data-key="c">Nothing: unallocated space is everything that is not a current file</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). File slack lies inside allocated clusters, and unpartitioned space lies outside the volume, so neither is "unallocated space of the volume". Option (c) repeats the mix-up from Session 2 between unallocated and unpartitioned.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Carving with the Sleuth Kit: blkls</summary>

PhotoRec can choose the free clusters of a volume by itself. Foremost cannot: it reads the file that you give it. The Sleuth Kit fills the gap.

- `blkls -o START image > unalloc.raw` writes all the unallocated clusters of the volume that starts at sector `START` into one file. You then carve that file.
- `blkls -s -o START image > slack.raw` writes the file slack of every current file.

There is a price. Inside `unalloc.raw` the clusters are joined end to end, so a position in that file is not a position on the disk. The command `blkcalc -u N -o START image` converts cluster `N` of the extracted file back to its true address. Without this step, the number in a carved file's name leads you to the wrong place.

Joining the free clusters has one useful side effect. Suppose a deleted file was stored in two runs, with a current file between them. In the extracted file the two runs lie next to each other, and a carving tool reads them as one piece. The same file carved from the whole image comes back broken.
</details>

<div class="box key" markdown="1">

What you give the carving tool decides what it can find. Unallocated space alone misses file slack and everything outside the volume.

</div>

## 4. Fragmentation: why carving struggles

### The idea

Look at one line of your lab results before you get there. The expected list says that item C07 is a JPEG of 67,595 bytes. Foremost carves a JPEG from the right place, and it is 75,787 bytes long. The difference is 8,192 bytes, which is exactly two clusters.

The picture opens. The top part is right, and below a certain line it turns into coloured noise. The hash value does not match.

Session 2 told you that a file system tries to store each file in one continuous run of clusters. When no free run is long enough, it stores the file in several runs. That state is {% include term.html t="fragmentation" %}. Item C07 was stored in two runs, and two clusters of another file lie between them.

### How it works

The file system knew where the second run began, because the index said so. A carving tool has no index. It has one working rule: a file starts at its header and continues in the next cluster, and the next, until the end. For a file in one run the rule is right. For a file in two runs the tool does this:

1. It finds the header and takes the first run. So far, correct.
2. It reaches the end of the first run and reads straight on, into clusters that belong to something else.
3. It goes on until it meets something that looks like an end.

What comes out depends on what lay in the gap.

| What the tool meets after the first run | What comes out |
|---|---|
| Other data, and then the second run with the true footer | A file with foreign clusters in the middle. It is too long, and it is damaged from the first foreign cluster onwards |
| Another file of the same type, with its own footer | A file made of the first run and all of the other file. The second run is never joined to anything |
| Nothing that looks like an end | A file as long as the size limit |

PhotoRec adds one more outcome. It checks the structure of a JPEG as it reads, sees that the picture breaks, and rejects the file. You get no output for that header at all, unless you ask the tool to keep corrupted files.

Step through the same picture stored in one run and in two.

{% include demo.html id="S03-D2" %}

<div class="box metaphor" markdown="1">

**The comparison.** A fragmented file is like a magazine article that stops at the foot of page 12 with the words "continued on page 47". The index is that small note. Tear it off, and a reader who turns to page 13 reads on into a different article.

**Why it fits.** The pages are clusters, and the article is the file. The first pages are in order and are read correctly. The note is the only thing that says where the rest is, as the record was the only thing that listed the runs. Without it, the reader takes the next page, as a carving tool takes the next cluster.

**Where it breaks.** A human reader notices at once that page 13 makes no sense, stops, and goes to look for the rest. A simple carving tool does not notice anything. It cannot judge meaning, so it joins the wrong pages and reports one complete file. Also, in a magazine only the article suffers. In a compressed file, such as a JPEG, one wrong cluster spoils everything that follows it, even the correct clusters of the second run.

**So what.** Never report a carved file as recovered because the tool wrote it. Open it, compare its size with what you expect, and above all compare its hash value. A carved file that is too long by a whole number of clusters is a strong sign of fragmentation.

</div>

Fragmentation and overwriting give the same first sign, which is a hash value that does not match. They are different facts, and your report must not mix them.

| | Fragmented | Partly overwritten |
|---|---|---|
| Is all the original content still on the disk? | Yes, in separate places | No. Part of it has been replaced |
| What the carved file holds after the good part | Foreign data, and later perhaps the true second run | Foreign data only |
| Can the file still be made whole? | Sometimes, by finding the second run and joining it | No |
| In Session 2's terms | A new problem: the content survives, the order is lost | State 2: the content is partly gone |

In the lab, C07 is the first kind and C08 is the second. The task at the end of the lab shows that C07 can be put back together by hand, and that its hash value then matches.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A carved JPEG is 12,288 bytes longer than the original, and clusters on this volume are 4,096 bytes. The top of the picture is correct and the rest is noise. What should the examiner suspect first?</p>
  <ul class="qc-opts">
    <li data-key="a">The tool has a fault</li>
    <li data-key="b">The picture was edited before it was deleted</li>
    <li data-key="c">The picture was stored in two runs, and three clusters of another file lie between them</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The extra length is exactly three clusters, and the damage begins part of the way down. That is what reading straight on through a gap produces. An edited picture would be a complete picture with a different hash value, not a half-correct one.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How common fragmentation is, and what better tools do</summary>

**Why it happens.** A file is fragmented when it is written into free space that is already broken into pieces, or when it grows after other files have been stored behind it. Large files, files that grow slowly such as mailboxes and logs, and nearly full volumes all suffer most. FAT volumes fragment more easily than NTFS or ext4, which choose free space with more care.

**How common it is.** Garfinkel studied the file systems of more than 300 used hard disks. Most files were stored in one run. But the kinds of file that examiners look for were fragmented more often: about one JPEG in six, about one Word document in six, and more than half of the large mail stores. So carving recovers most pictures and misses a real share of them.

**What more careful tools do.** Many fragmented files have only two runs. A tool can carve the first run, then try leaving out one cluster, two clusters, three clusters and so on, and test each attempt by trying to decode the file. The attempt that decodes without an error is the right one. This is called gap carving, and it works only for file types that can be tested, such as JPEG, PNG and ZIP. PhotoRec uses a related idea when it rejects a broken picture and then tries again without the clusters that it has already given to other files.

**A device that is fragmented on purpose.** Section 7 describes disk sets that cut every file into pieces of a fixed size and spread them over several disks. For a carving tool that reads one disk of such a set, every large file is fragmented.

Reference: Garfinkel, S. (2007) 'Carving contiguous and fragmented files with fast object validation', *Digital Investigation*, 4 (Supplement), pp. S2-S12.
</details>

<div class="box key" markdown="1">

A carving tool assumes that a file is stored in one run. When it is not, the tool joins the wrong clusters, and only the hash value shows it.

</div>

## 5. Features instead of files: bulk_extractor

### The idea

Think again about item C07. Between its two runs lie two clusters of another file. What are they?

They are part of an old message log. It begins in the middle of a sentence, because its first clusters were reused long ago. It has no header, so no carving tool will ever report it as a file. But it is full of lines like this one:

```
Entry 001: message from returns@harbour-print.example.net to storage.desk@northdock.example.org about tray 26.
```

A carving tool walked through these clusters and saw only "not a JPEG". For an investigator, they may be the most useful sectors on the disk: they show who wrote to whom.

A short piece of data with a form that a tool can recognise is a {% include term.html t="feature" %}. Email addresses, web addresses, domain names and telephone numbers are features. The tool **bulk_extractor** does not look for files at all. It reads every byte of an image and writes down every feature it meets, with the position at which it found it.

### How it works

bulk_extractor reads the image from start to end in large pieces, and gives each piece to a set of scanners. Each scanner knows one kind of pattern. The file system is ignored completely, so allocated space, unallocated space, slack and unpartitioned space are all treated in the same way.

For each kind of feature, the tool writes a {% include term.html t="feature-file" %}. Each line has three parts: the position in the image, the feature, and the bytes around it.

```
3605097   storage.desk@northdock.example.org   .example.net to storage.desk@northdock.example.org about tray 26.
```

The position is a byte offset. Divide it by 512 and you have a sector: 3,605,097 is in sector 7,041 of the test image. You already know that Foremost carved a broken JPEG that starts at sector 6,961 and is 149 sectors long. So this address lies inside that carved "picture". The two tools have looked at the same sectors and reported different things.

The tool also writes a count for each kind of feature, in files whose names end in `_histogram.txt`. This is the first thing to read on a new disk:

```
n=36    storage.desk@northdock.example.org
n=30    night.shift@northdock.example.org
n=30    returns@harbour-print.example.net
n=27    quotes@harbour-print.example.net
n=13    intake@forensics-unit.example.com
```

Without opening a single file, you know which addresses matter most on this device.

**It reads inside compressed data.** This is the second thing that a carving tool cannot do. When bulk_extractor meets data that is compressed in a common way, it unpacks the data in memory and scans the result. The position then has more than one part:

```
5202432-GZIP-46   intake@forensics-unit.example.com   To: intake@forensics-unit.example.com
```

Read it from left to right: at byte 5,202,432 of the image a compressed stream begins, and 46 bytes into the unpacked data is the address. A plain text search of the raw image cannot find this address at this place, because in the image it exists only in compressed form. In the lab you will count: a text search finds the address 10 times, and bulk_extractor finds it 13 times.

| | File carving | Feature extraction |
|---|---|---|
| It looks for | Whole files, by header and footer | Small pieces of data with a known form |
| It returns | Files you can open | Lines of text: position, feature, context |
| A fragment with no header | Not found | Found, if it holds features |
| A fragmented file | Carved wrongly | Each run is scanned; the features are found |
| Compressed data | Carved as an archive that you must open yourself | Unpacked and scanned; the position records the path |
| What you get first | Many files with no names | A counted list of who and what appears on the disk |
| What it cannot do | Read a fragment, or rebuild a file in several runs | Give you a file, or say which file a feature came from |

<div class="box metaphor" markdown="1">

**The comparison.** Carving is like digging up whole objects from a field. Feature extraction is like walking the same field with a metal detector.

**Why it fits.** The digger recovers a pot only where a whole pot lies, and passes over broken pieces. The detector does not care whether an object is whole. It sounds for every coin, in a pot, beside a pot or alone in the soil, and you mark each place on a map. The map is the feature file, and the count of coins in each corner of the field is the histogram.

**Where it breaks.** A detector cannot tell you which pot a coin came from, and a feature file cannot tell you which file an address came from. You must go to that position yourself and look. A detector also sounds only for metal: bulk_extractor finds only the forms that its scanners know, so a name, a plan or a picture gives no signal. And a coin is always a coin, while a string that has the form of an address may be part of a program and not anyone's address.

**So what.** Use the two together. Run bulk_extractor first, because it is fast and tells you where to look and whom to ask about. Then carve, and use the positions in the feature files to connect what the two tools found.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">Unallocated space holds the last two clusters of a deleted email. Its first clusters have been reused. Which tool can show the examiner the addresses in it?</p>
  <ul class="qc-opts">
    <li data-key="a">A carving tool, because emails have headers</li>
    <li data-key="b">bulk_extractor, because it scans every byte for the form of an address and needs no start of a file</li>
    <li data-key="c">Neither, because the file is incomplete</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The start of the file is gone, so there is no header for a carving tool to find. A feature needs no file around it. The address is reported with its position, and the examiner can read the surrounding sectors.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Scanners, false positives, and care with the output</summary>

**The scanners.** The standard set finds email addresses and message headers, web addresses and searches, domain names, telephone numbers, number patterns that pass the check used for payment card numbers, GPS positions in pictures, and more. Other scanners unpack data: `gzip` and `zip` streams, and several other forms. A scanner that unpacks hands its result back to all the other scanners, so an address inside an archive inside an archive is still found.

**The files.** `email.txt`, `url.txt`, `domain.txt` and `telephone.txt` are feature files. Each has a partner such as `email_histogram.txt`. `report.xml` records how the run was made, which you keep with your notes.

**False positives.** A feature is only a form. Every Windows system holds hundreds of addresses of software companies and certificate authorities, inside program files. On a real disk the top of the email histogram is often filled with them. The tool accepts a "stop list" of features to leave out, and experienced units keep one. A number that passes the check for card numbers may be a part number. Treat a feature as a lead to follow, not as a finding.

**Speed.** The image is cut into pieces of 16 MB, and several pieces are scanned at the same time on different processor cores. This is why the tool is fast, and why it is the long job that you start first in the lab.

**Care with the output.** The feature files of a real disk are a dense collection of personal data about everyone who appears on it, including people who have nothing to do with the case. They are evidence. Keep them with the case, record them in your custody record, and do not copy them to places where the image itself would not be allowed.

Reference: Garfinkel, S. (2013) 'Digital media triage with bulk data analysis and bulk_extractor', *Computers and Security*, 32, pp. 56-72.
</details>

<div class="box key" markdown="1">

bulk_extractor reports small pieces of data with their positions, from every byte of the image. It finds what lies in fragments and in compressed data, where a carving tool finds nothing, but it never gives you a file.

</div>

## 6. A lost partition table

### The idea

So far, one file had lost its record. Now a whole volume loses its place on the map.

Ask the Sleuth Kit for the partition table of today's test image, and it prints this:

| Area | Starts at sector | Length in sectors |
|---|---|---|
| Not in any partition | 0 | 2,048 |
| Partition 1, FAT16 | 2,048 | 98,304 |
| Not in any partition | 100,352 | 161,792 |

The device has 262,144 sectors. The table gives 98,304 of them to one partition. More than 60 per cent of the device belongs to nothing. Session 2 taught you to distrust exactly this. The suspect's USB stick had the same shape. And demo S02-D1 showed that removing an entry from the table changes the map and leaves every sector as it was.

So the question is not whether something could be there. The question is how to find where it begins.

### How it works

A file system does not rely on the partition table to describe it. Its first sector is a {% include term.html t="boot-sector" %}, and in that sector the file system writes its own facts: its type, the size of a sector and of a cluster, its total number of sectors and its label. The sector ends with the mark `55 AA`, the same two bytes that end an MBR.

Compare what the two records hold.

| | An entry in the partition table | The boot sector of the volume |
|---|---|---|
| Where it is | In sector 0 of the disk | In the first sector of the volume itself |
| The type of file system | A one-byte code | Written out, with the details of the layout |
| The size of the volume | Yes | Yes |
| Where the volume starts | Yes | Not as a number you can trust. But the sector *is* the start |
| Lost when the entry is removed | Yes | No |

Everything in the entry can be worked out again from the boot sector and from the place where the boot sector was found. That is the whole method:

1. Read the disk sector by sector, outside the known partitions.
2. At each sector, ask: does this look like the start of a file system? Does it end with `55 AA`, name a known type, and give sizes that make sense?
3. If it does, read the size from it. The start is the sector you are standing on.
4. Check the claim: is there really a file system of that size after it, with a readable top folder?

The tool **TestDisk** does these four steps. It then shows you the partitions that it found, and can write a new table.

{% include demo.html id="S03-D3" %}

<div class="box metaphor" markdown="1">

**The comparison.** Session 2 compared the partition table to the map in a land registry office. Now the map has lost a page. A surveyor walks the land and looks for the stone at the corner of each plot, on which the owner once cut the plot's size.

**Why it fits.** The land is the disk and the plots are the volumes. The stone is the boot sector: it stands on the plot itself, not in the office, so it survives the loss of the map. It gives the size, and the place where it stands gives the start. With both, the surveyor can draw the missing page again.

**Where it breaks.** Session 2 said that a partition has no fence, and that is still true: the stone marks one corner and nothing marks the edges. Stones are also never cleared away. A disk that was divided differently in the past still carries the boot sectors of those older volumes, and some file systems keep a second copy of the boot sector, so a scan can find more stones than there are plots. The surveyor must test each one against what lies behind it. And a real surveyor changes nothing by walking, while a tool that writes a new table changes sector 0.

**So what.** Finding a lost partition is reading, and writing the table back is a change. Do the reading on the image. If you must write, write to a working copy, and record the change. Often you need not write at all: once you know the start sector, your tools can open the volume from that sector directly.

</div>

That last point matters in practice. Every Sleuth Kit command accepts a start sector with the option `-o`. If TestDisk, or your own search, tells you that a FAT32 volume begins at sector 108,544, then `fls -o 108544` lists its files, and nothing on the image has been changed. In the lab you do both: you read the lost volume in place, and you write a new table to a working copy to see exactly which bytes change. The answer is 11 bytes, all of them in sector 0.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The partition was deleted." | "The entry was removed from the partition table." | The sectors of the volume are untouched. Only the map changed. |
| "TestDisk repaired the disk." | "TestDisk found the volume and wrote a new table." | Nothing was broken in the volume. And writing a table is a change that you must record. |
| "Boot sector" and "MBR" for the same thing | The *MBR* is sector 0 of the disk and holds the partition table. A *boot sector* is the first sector of one volume. | Both end with `55 AA`, which is why they are mixed up, and why a search for that mark finds both. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A scan of unpartitioned space finds a valid FAT32 boot sector at sector 108,544 and an identical one at sector 108,550. What is the most likely explanation?</p>
  <ul class="qc-opts">
    <li data-key="a">One volume: FAT32 keeps a backup copy of its boot sector six sectors after the first</li>
    <li data-key="b">Two volumes that start six sectors apart</li>
    <li data-key="c">A fault in the scan</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Two volumes cannot overlap almost completely, so (b) makes no sense once you read the size in the boot sector. FAT32 writes a second copy of its boot sector at sector 6 of the volume, and a scan for boot sectors finds both.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Backup copies, older volumes and GPT</summary>

**Backup boot sectors.** FAT32 keeps a copy of its boot sector at sector 6 of the volume. NTFS keeps a copy in the last sector of the partition. The ext file systems keep copies of their main record, the superblock, at several places across the volume. FAT12 and FAT16 keep none. If the first boot sector of a volume has been overwritten, a tool can find the backup, work out where the volume must begin, and offer to copy the backup into place.

**Stale candidates.** A scan often finds boot sectors that belong to no current volume: the remains of an older layout, or the backup copy of a current one. TestDisk tests each candidate, and shows you the list so that you can test it too, by listing the files of each one. A candidate that overlaps a known good volume, or whose top folder cannot be read, is not a volume to restore.

**GPT disks.** Session 2 explained that a GPT disk keeps a second copy of its table in the last sectors of the disk. When the first copy is damaged, the first thing to try is the second copy. Only when both are gone do you search for the volumes themselves.

**Why an entry goes missing.** A fault, an interrupted repartitioning, or a person. Removing an entry is a quick way to make a volume disappear from every normal view of a disk, and it leaves the data in place for whoever knows the start sector. Session 4 treats this as one form of hiding.

**Searching by hand.** In the Sleuth Kit, `sigfind -o 510 55AA image` prints every sector that has the mark `55 AA` at bytes 510 and 511. It is a rough search, and it also reports sectors that are not boot sectors, but it shows the idea in one line. You use it in the lab.
</details>

<div class="box key" markdown="1">

A volume describes itself in its boot sector. When its entry in the partition table is gone, the boot sector and the place where it is found are enough to rebuild the entry.

</div>

## 7. RAID: one volume spread over several disks

### The idea

Some evidence arrives as several disks that make sense only together. A small company keeps its shared files on a storage box with four disks in it. You image all four. Each image, opened alone, shows no usable file system, and a carving tool returns mostly small files and broken large ones.

The disks are a {% include term.html t="raid" %} set. A RAID set joins several disks so that the operating system sees one volume. This session teaches the ideas only. There is no RAID lab. But you must be able to explain what was done to the data, because that tells you what you need in order to read it.

### How it works

There are three building blocks.

**Striping.** The data is cut into equal pieces, and the pieces are written to the disks in turn: the first piece to disk 1, the second to disk 2, and so on, then back to disk 1. This is {% include term.html t="striping" %}. The number of bytes written to one disk before moving to the next is the {% include term.html t="stripe-size" %}, often 64 KB or more. Striping gives speed and the full space of all the disks. It gives no safety: if one disk fails, every large file has holes in it.

**Mirroring.** The same data is written to two disks at once. This is {% include term.html t="mirroring" %}. Each disk is a complete copy, and each one can be read alone.

**Parity.** For each row of stripes, the set calculates one more stripe from the others and stores it on a further disk. This extra data is {% include term.html t="parity" %}. If any one disk is lost, its content can be worked out from the disks that remain.

| Level | How the data is laid out | Disks needed | Disks it can lose | What one disk shows by itself |
|---|---|---|---|---|
| RAID 0 | Striping only | 2 or more | None | Every second piece of everything |
| RAID 1 | Mirroring | 2 | 1 | A complete, readable volume |
| RAID 5 | Striping, with one parity stripe in each row | 3 or more | 1 | Pieces of data mixed with parity |

**How parity works.** Parity uses one simple operation on bits, called exclusive or and written XOR: the result is 1 when the two bits differ, and 0 when they are the same. Take one byte from disk A and the byte at the same position on disk B.

| | Bits |
|---|---|
| Disk A | `1011 0010` |
| Disk B | `0110 1100` |
| Parity: A XOR B | `1101 1110` |

Now suppose disk B is lost. Take what is left and apply the same operation.

| | Bits |
|---|---|
| Disk A | `1011 0010` |
| Parity | `1101 1110` |
| A XOR parity | `0110 1100` |

The result is the lost byte of disk B, exactly. The same works for every byte and for any number of disks, as long as only one disk is missing.

**Why order and stripe size matter.** To read a striped set from its images, you must put the pieces back in the order in which they were written. For that you need to know:

- how many disks the set had, and which image is which disk;
- the order of the disks;
- the stripe size;
- for RAID 5, where the parity stripe lies in each row.

Get one of these wrong and the result is not a little wrong. The first stripe may be in the right place, so the volume seems to begin correctly, and everything after it is in the wrong order. Try it.

{% include demo.html id="S03-D4" %}

<div class="box metaphor" markdown="1">

**The comparison.** Striping is like dealing a sorted pack of cards to three players, a few cards at a time and always in the same order of players.

**Why it fits.** The pack is the data, and the players are the disks. The number of cards that each player receives at a time is the stripe size. To rebuild the sorted pack you must collect the cards in the order in which you dealt them: the same players in the same order, the same number of cards at a time. Collect from the players in another order, or four cards at a time when you dealt three, and the pack is mixed.

**Where it breaks.** A playing card shows its own value, so you could sort a mixed pack again by looking at it. A stripe shows nothing: it is 64 KB of bytes with no number on it and no sign of which stripe comes next. Players also sit in fixed seats, while disks that have been taken out of a box and placed on a table have no order at all, unless someone wrote it down.

**So what.** The order of the disks is evidence, and it exists only at the moment of seizure. Before a disk leaves its box, record which slot it came from and label it. Then image every disk separately, and rebuild the set from the images.

</div>

Striping also connects to section 4. A striped set cuts every file into pieces of the stripe size and spreads them over the disks. To a carving tool that reads one disk alone, every file larger than one stripe is fragmented. That is why the carve of a single disk from such a set gives small whole files and large broken ones.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An examiner rebuilds a RAID 0 set from two images. The partition table and the first folders can be read, but every file larger than about 64 KB is damaged. What is the most likely cause?</p>
  <ul class="qc-opts">
    <li data-key="a">Both disks are failing</li>
    <li data-key="b">The files were encrypted</li>
    <li data-key="c">The stripe size or the order of the disks is wrong, so only the first stripe is in its true place</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The start of the volume lies in the first stripe, which is in the right place under almost any setting. Everything after it depends on the right stripe size and order. Damage that begins at a fixed size is the sign of a wrong setting, not of a failing disk.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>More levels, and how the settings are found</summary>

**More levels.** RAID 6 stores two different parity stripes in each row and survives the loss of two disks. RAID 10 is a striped set of mirrored pairs. Some storage boxes simply join disks end to end with no striping, which is often called JBOD.

**Where the parity lies.** RAID 5 does not keep all its parity on one disk. The parity stripe moves to a different disk in each row, in a fixed pattern, and there are several patterns in use. The pattern is one more setting that must be right.

**Where the settings are written.** A set made by software usually records its own description on each disk. Linux software RAID writes a small block on every member that gives the level, the stripe size, the number of disks and the place of this disk in the order. A hardware RAID controller keeps its description in its own format, sometimes on the disks and sometimes only in the controller. So the description is itself evidence to collect: photograph the controller's settings screen if the system is still running.

**When the settings are lost.** The examiner works them out. A known structure helps: the MBR and the first boot sector show which disk is first, and a large file with a regular inner structure shows where one stripe ends and the next begins. Tools exist that try the possible settings and test each result.

**In practice.** Image each member disk separately and verify each image. Then attach the images in read-only mode and let software rebuild the set from them. On Linux, the tool `mdadm` can assemble a set from images in a read-only state. The originals are never placed back in a controller that might start to "repair" them.

**One missing disk.** A RAID 5 set with one disk missing or unreadable can still be read in full, because parity gives back the missing content. A RAID 0 set with one disk missing cannot.
</details>

<div class="box key" markdown="1">

A RAID set can be read only with the right disks, in the right order, with the right stripe size. Record the order before the disks leave the box, and rebuild the set from images.

</div>

## 8. The lab: carve, rebuild and extract

Your task: recover the ten planted items from the unit's test image and prove each one by its hash value, find the partition that the table does not list, and extract the features from both items of evidence.

You work in the Kali VM, on the command line. Allow about two hours.

<div class="box lms" markdown="1">

The evidence files, the expected list, the evidence register and a blank custody record are in folder `S03` on the lab share. If you are studying away from the lab, the LMS explains how to get the same files.

</div>

**The items.** Keep every file name exactly as it is.

| Exhibit | Files | What it is |
|---|---|---|
| `S03-001` | `nps-2008-jean.E01` and `nps-2008-jean.E02` | The image of Jean's computer, in two parts. From the M57-Jean scenario, created at the Naval Postgraduate School for teaching and published by Digital Corpora |
| `S03-002` | `s03-carving-image.dd` | The unit's test image: a raw image of 128 MB with known contents. Built by the unit. Everything in it is generated, and it holds no real data |

**One more file from the unit.** `s03-expected-list.csv` lists the ten planted items of the test image, C01 to C10, each with its type, its size and its SHA-256 value. It does not say where they are or what state they are in. That is your work.

Each planted picture shows its own item code in large letters, and each planted document names its code in its first line. So when a file comes back damaged, you can still see which item it was.

### Part A: start the long job first

Do these three steps as soon as the session opens. The last one runs while you read sections 1 to 7.

1. In the Kali VM, open a terminal. Create two folders, copy the files from the lab share and protect them:

   ```bash
   mkdir -p ~/evidence/s03 ~/cases/s03
   cp /media/sf_nb6018/S03/* ~/evidence/s03/
   chmod 444 ~/evidence/s03/*
   ls -l ~/evidence/s03
   ```

   <div class="box expect" markdown="1">

   Six files, all read-only: the two parts of Jean's image, `s03-carving-image.dd` with a size of exactly 134,217,728 bytes, the expected list, the evidence register and the custody record. The copy takes several minutes, because Jean's image is several gigabytes.

   </div>

   <div class="box trouble" markdown="1">

   If Kali says "Permission denied" for `/media/sf_nb6018`, the shared folder is not set up for your user: repeat the last part of Step 5 in Session 0. If the disk is full, delete what you no longer need from `~/cases` of earlier sessions, and copy again.

   </div>

2. Verify both exhibits, and compare the values with the evidence register:

   ```bash
   sha256sum ~/evidence/s03/s03-carving-image.dd
   ewfverify ~/evidence/s03/nps-2008-jean.E01
   ```

   <div class="box expect" markdown="1">

   The SHA-256 value of the test image is the one in the register. `ewfverify` reads both parts of Jean's image, prints an MD5 hash stored in the file and an MD5 hash calculated over the data, and ends with `ewfverify: SUCCESS`. Both MD5 values equal the one in the register. Write entry 1 and entry 2 in the custody record: received, and verified on receipt.

   </div>

   <div class="box trouble" markdown="1">

   If a value does not match, stop and copy that exhibit again. If it still differs, tell the lecturer and do not continue with that file. If `ewfverify` cannot find the second part, both parts must be in the same folder with their original names.

   </div>

3. Open Jean's image as a raw view, and start bulk_extractor on it:

   ```bash
   sudo mkdir -p /mnt/jean
   sudo ewfmount -X allow_other ~/evidence/s03/nps-2008-jean.E01 /mnt/jean
   ls -l /mnt/jean
   bulk_extractor -o ~/cases/s03/be-jean /mnt/jean/ewf1
   ```

   <div class="box expect" markdown="1">

   `ls` shows one file, `ewf1`, which is read-only and as large as Jean's whole disk. It is not a copy: `ewfmount` shows the sectors inside the E01 files as if they were one raw image, so that every tool can read them. bulk_extractor then prints lines of progress. Leave this terminal alone, and open a second terminal for the next steps.

   </div>

   <div class="box trouble" markdown="1">

   If `ewfmount` says that the mount point is not empty, the image is already mounted from an earlier attempt: go on to the `ls` command. If bulk_extractor says that the output folder exists, a first attempt left it behind: delete `~/cases/s03/be-jean` and start again.

   </div>

### Part B: carve the test image

{:start="4"}
4. In the second terminal, go to your case folder and read the map of the test image:

   ```bash
   cd ~/cases/s03
   mmls ~/evidence/s03/s03-carving-image.dd
   ```

   <div class="box expect" markdown="1">

   The table from section 6: one partition, `DOS FAT16 (0x06)`, from sector 2,048 with a length of 98,304 sectors. Before it, 2,048 sectors marked `Unallocated`. After it, 161,792 sectors marked `Unallocated`, from sector 100,352 to the end. As in Session 2, the tool prints "Unallocated" for unpartitioned space. Write the three rows in your notes.

   </div>

   <div class="box trouble" markdown="1">

   If `mmls` prints nothing or an error, check the path and the name of the file. The name has no capital letters.

   </div>

5. List the files of the partition, with Session 2's method, and recover the one deleted file that still has a record:

   ```bash
   fls -r -o 2048 ~/evidence/s03/s03-carving-image.dd
   icat -o 2048 ~/evidence/s03/s03-carving-image.dd 7 > oldlogo.png
   sha256sum oldlogo.png
   grep -i "$(sha256sum oldlogo.png | cut -c1-64)" ~/evidence/s03/s03-expected-list.csv
   ```

   <div class="box expect" markdown="1">

   `fls` lists four current files, `README.TXT`, `NOTES.TXT`, `STAFF.JPG` and `DATA.BIN`, and one deleted file marked with a star: `_LDLOGO.PNG`, at address 7. The first letter of its name is lost, as Session 2 explained for FAT. The last command prints the line of item C02. One of the ten items still had a record. The other nine have none in this file system.

   </div>

   <div class="box trouble" markdown="1">

   If `grep` prints nothing, the recovered file is not on the list: check that you wrote the address 7 and the offset 2048.

   </div>

6. Carve the unallocated space of the partition with PhotoRec:

   ```bash
   photorec /d pr-free /log ~/evidence/s03/s03-carving-image.dd
   ```

   PhotoRec shows menus. Choose **Proceed**. In the list of partitions, the line `1 P FAT16 >32M` is already selected: choose **Search**. Choose **Other** for the type of file system. Choose **Free**. When it has finished, choose **Quit** until the program closes. Then run `ls -l pr-free.1`.

   <div class="box expect" markdown="1">

   PhotoRec reports that 6 files were saved. The folder `pr-free.1` holds a JPEG, a PNG, a PDF, a DOCX, a BMP and one very large file that ends in `.gz`, with a small `report.xml`. The PDF has part of a title in its name, because PhotoRec read the title from inside the document.

   </div>

   <div class="box trouble" markdown="1">

   The first screen also offers **Sudo**. You do not need it for an image file: choose **Proceed**. If you chose the wrong line in a later menu, quit, delete the folder `pr-free.1` and start the step again.

   </div>

7. Carve the whole image with PhotoRec:

   ```bash
   photorec /d pr-disk /log ~/evidence/s03/s03-carving-image.dd
   ```

   Choose **Proceed**. This time press the Up arrow once, so that the line `No partition ... [Whole disk]` is selected. Choose **Search**, then **Other**. PhotoRec does not ask about free space now, because it is not using a file system. Quit when it has finished, and run `ls -l pr-disk.1`.

   <div class="box expect" markdown="1">

   13 files. Compare the two lists. Seven files are new: three small `.txt` files, a GIF, a second JPEG near the start, a JPEG whose name holds the number 102400, and a second PDF whose name holds the number 110596. Notice also that the files you saw before have new numbers: `f0000913.jpg` is now `f0002961.jpg`. The first number counted sectors from the start of the partition, and the second counts from the start of the disk. The difference is 2,048.

   </div>

   <div class="box trouble" markdown="1">

   If you again see 6 files, the first line of the list was not selected when you chose Search. Delete `pr-disk.1` and repeat the step.

   </div>

8. For each of the seven new files, write one line in your notes that explains why the first carve did not find it. Use the sector in each name, the table from step 4 and the list from step 5.

   <div class="box expect" markdown="1">

   Your notes give three kinds of reason. Some files are current files, so their clusters are not free. One lies in the slack of a current file: its sector is one after the start of `NOTES.TXT`. Two lie beyond sector 100,351, outside the partition.

   </div>

   <div class="box trouble" markdown="1">

   If you cannot place a sector, use the numbers from step 4. A sector from 2,048 to 100,351 is inside the partition. To see whether a current file uses it, compare with the `.txt` files: PhotoRec carved `README.TXT` and `NOTES.TXT` at the sectors where those files begin.

   </div>

9. Carve the whole image with Foremost, and read its record:

   ```bash
   foremost -t jpg,gif,png,bmp,pdf,zip -i ~/evidence/s03/s03-carving-image.dd -o fm
   cat fm/audit.txt
   ```

   <div class="box expect" markdown="1">

   `audit.txt` ends with `12 FILES EXTRACTED`: 5 JPEG, 1 GIF, 2 PNG, 1 BMP, 2 PDF and 1 ZIP. Foremost names the ZIP file `.docx`, because it looked inside. Each line gives the sector in the name and the position in bytes. Foremost has two JPEG files that PhotoRec did not give you, `00006961.jpg` and `00008561.jpg`, and a PNG at sector 5,364 that lies three sectors after the start of the DOCX.

   </div>

   <div class="box trouble" markdown="1">

   If Foremost says that the output folder is not empty, delete the folder `fm` and run the command again. Foremost never writes into a folder that already holds results.

   </div>

10. Open the two extra JPEG files and the extra PNG:

    ```bash
    xdg-open fm/jpg/00006961.jpg
    xdg-open fm/jpg/00008561.jpg
    xdg-open fm/png/00005364.png
    ```

    <div class="box expect" markdown="1">

    The first picture shows the code C07 at the top, and below it bands of colour and noise. The second shows C08 at the top, and below it a flat grey area. Both are damaged. PhotoRec found the same two headers, tested the pictures, and rejected them. The PNG shows C04: it is the picture stored inside the Word document, carved a second time by itself.

    </div>

    <div class="box trouble" markdown="1">

    If no viewer opens, open the folder `fm` in the file manager and select the files there.

    </div>

### Part C: hash and match

{:start="11"}
11. Calculate the SHA-256 value of every carved file, and match the values against the expected list:

    ```bash
    cd ~/cases/s03
    find pr-disk.1 fm -type f ! -name report.xml ! -name audit.txt \
      -exec sha256sum {} + > carved-sha256.txt
    tail -n +2 ~/evidence/s03/s03-expected-list.csv |
    while IFS=, read -r item type size sha; do
      hit=$(grep "^$sha" carved-sha256.txt | awk '{print $2}' | tr '\n' ' ')
      echo "$item,$type,$size,${hit:-NOT EXACT}"
    done > s03-checkpoint.csv
    column -s, -t s03-checkpoint.csv
    ```

    <div class="box expect" markdown="1">

    Ten lines. Eight items show the paths of two carved files each, one from PhotoRec and one from Foremost: both tools recovered them exactly. Two items, C07 and C08, show `NOT EXACT`.

    </div>

    <div class="box trouble" markdown="1">

    If every line shows `NOT EXACT`, the file `carved-sha256.txt` is empty or the list was not read: run `head -3 carved-sha256.txt` and check the two folder names in the `find` command.

    </div>

12. Find out what happened to C07. Compare the size of the carved file with the size on the list, and look at the place where the damage begins:

    ```bash
    ls -l fm/jpg/00006961.jpg
    grep C07 ~/evidence/s03/s03-expected-list.csv
    xxd -s 40960 -l 96 fm/jpg/00006961.jpg
    ```

    <div class="box expect" markdown="1">

    The carved file is 75,787 bytes and the list says 67,595. The difference is 8,192 bytes, exactly two clusters. At byte 40,960, which is the end of the tenth cluster, the picture data stops and plain text begins: part of a message log, with email addresses in it. The file was stored in two runs, and two clusters of another file lie between them.

    </div>

    <div class="box trouble" markdown="1">

    If `xxd` shows no readable text, check the number 40960. It is 10 times 4,096.

    </div>

13. Find out what happened to C08:

    ```bash
    ls -l fm/jpg/00008561.jpg
    grep C08 ~/evidence/s03/s03-expected-list.csv
    istat -o 2048 ~/evidence/s03/s03-carving-image.dd 8 | head -16
    ```

    <div class="box expect" markdown="1">

    The carved file is 76,889 bytes and the list says 70,160, so the difference is not a whole number of clusters. `istat` shows the current file `DATA.BIN` and the sectors it uses, counted from the start of the partition. The first is 6,593. Add 2,048 and you have sector 8,641 of the disk, which is 80 sectors, or ten clusters, after the header of C08 at sector 8,561. A current file now owns the clusters where the rest of C08 was. The end of the picture has been overwritten, and the "footer" that Foremost found is a chance match inside `DATA.BIN`.

    </div>

    <div class="box trouble" markdown="1">

    If `istat` reports a different file, check the address 8 against the output of `fls` in step 5.

    </div>

14. Open `s03-checkpoint.csv` in a text editor. For C07 and C08, replace `NOT EXACT` with a short statement of the cause, in your own words, and save the file.

    <div class="box expect" markdown="1">

    Two lines that say what each file is, for example that one is fragmented and the other is partly overwritten, and how you know. The other eight lines are unchanged.

    </div>

    <div class="box trouble" markdown="1">

    If you are not sure which is which, read the table in section 4 again. Only one of the two can still be made whole.

    </div>

### Part D: find the lost partition

{:start="15"}
15. Search the test image for the mark that ends a boot sector:

    ```bash
    sigfind -o 510 55AA ~/evidence/s03/s03-carving-image.dd
    ```

    <div class="box expect" markdown="1">

    Six sectors: 0, 2048, 108544, 108545, 108550 and 108551. Sector 0 is the MBR. Sector 2,048 is the boot sector of the partition you know. Sector 108,544 lies in space that the table gives to nothing. Sector 108,550 is six sectors later. The other two are a small information sector that FAT32 keeps after each copy of its boot sector, and that ends with the same mark.

    </div>

    <div class="box trouble" markdown="1">

    A line about an error while reading, at the very end, only means that the tool reached the end of the image.

    </div>

16. Test the candidate without changing anything:

    ```bash
    fsstat -o 108544 ~/evidence/s03/s03-carving-image.dd | head -12
    fls -o 108544 ~/evidence/s03/s03-carving-image.dd
    icat -o 108544 ~/evidence/s03/s03-carving-image.dd 5 > report.pdf
    sha256sum report.pdf
    ```

    <div class="box expect" markdown="1">

    `fsstat` reports a FAT32 file system with the label `ARCHIVE`. `fls` lists two current files, `README.TXT` and `REPORT.PDF`. The SHA-256 value of `report.pdf` is the value of item C10 on the expected list. You have reached a file in a partition that the table does not list, with its name, and the image is unchanged.

    </div>

    <div class="box trouble" markdown="1">

    If `fsstat` cannot determine the file system type, the offset is wrong. It must be the sector from step 15, 108544.

    </div>

17. Now let TestDisk do the same search and write a new table. It will change sector 0, so you give it a working copy and never the exhibit:

    ```bash
    cp ~/evidence/s03/s03-carving-image.dd s03-work.dd
    chmod 644 s03-work.dd
    testdisk /log s03-work.dd
    ```

    Choose **Proceed**, then **Intel**, then **Analyse**. TestDisk shows the current structure, with one partition. Choose **Quick Search**.

    <div class="box expect" markdown="1">

    Two lines: `FAT16 >32M` with the label `[S03TEST]` and 98,304 sectors, and `FAT32` with the label `[ARCHIVE]` and 131,072 sectors. TestDisk prints the start and the end of each in an old form, as cylinder, head and sector. The last number of each line is the size in sectors.

    </div>

    <div class="box trouble" markdown="1">

    If TestDisk says that write access for this media is not available, you opened the read-only exhibit and not the working copy: quit and start again with `s03-work.dd`. Do not answer that message by using `sudo`, which would let the tool change the exhibit. If TestDisk shows only one line after the search, the copy is incomplete: check with `ls -l s03-work.dd` that it has 134,217,728 bytes.

    </div>

18. Press the Down arrow to select the FAT32 line, and press **P** to list its files. Press **q** to return. Press Enter to continue. Select **Write** with the Right arrow, press Enter, and confirm with **Y**. Choose **Ok**, then **Quit** until the program closes.

    <div class="box expect" markdown="1">

    After **P**, TestDisk lists `README.TXT` and `REPORT.PDF`. After you confirm, it says that you will have to reboot for the change to take effect. That message is meant for real disks, and you can ignore it for an image.

    </div>

    <div class="box trouble" markdown="1">

    If the bottom line offers **Deeper Search** and not **Write**, press the Right arrow once more. Do not run Deeper Search: it is not needed here.

    </div>

19. Read the new table, and measure the change:

    ```bash
    mmls s03-work.dd
    cmp -l ~/evidence/s03/s03-carving-image.dd s03-work.dd | wc -l
    sha256sum ~/evidence/s03/s03-carving-image.dd s03-work.dd
    ```

    <div class="box expect" markdown="1">

    `mmls` now shows a second partition, `Win95 FAT32 (0x0b)`, from sector 108,544 to sector 239,615, with a length of 131,072 sectors. `cmp` counts 11 bytes that differ between the two files. All 11 are in sector 0: ten in the second entry of the table, and one in the first entry, where TestDisk marked the first partition as the one to start from. The two SHA-256 values differ. The value of the evidence file is still the one in the register. Add an entry to the custody record: a working copy was made and its partition table was rewritten, with the tool, its version and the number of bytes changed.

    </div>

    <div class="box trouble" markdown="1">

    If `cmp` reports no difference, TestDisk did not write: repeat step 18 and make sure that you answer **Y**.

    </div>

### Part E: carve Jean's disk

{:start="20"}
20. Read the map of Jean's disk, through the raw view from step 3:

    ```bash
    mmls /mnt/jean/ewf1
    ```

    <div class="box expect" markdown="1">

    A partition table with one NTFS partition that fills almost the whole disk. Write its row in your notes.

    </div>

    <div class="box trouble" markdown="1">

    If `/mnt/jean/ewf1` does not exist, the mount from step 3 is gone, for example after a restart of the VM. Run the `ewfmount` command from step 3 again.

    </div>

21. Carve the unallocated space of Jean's partition for pictures and documents. A real disk is large, so this time you choose the file types, and you give PhotoRec its choices on the command line:

    ```bash
    photorec /d pr-jean /log /cmd /mnt/jean/ewf1 partition_i386,1,fileopt,everything,disable,jpg,enable,doc,enable,pdf,enable,zip,enable,freespace,search
    ```

    Read the command from left to right: an MBR partition table, partition 1, switch all file types off, switch four on, carve free space only, start. The type `doc` covers the older Office files, including XLS spreadsheets. The type `zip` covers DOCX, XLSX and PPTX.

    <div class="box expect" markdown="1">

    PhotoRec shows a counter of files found for each type, and the time remaining. It creates folders `pr-jean.1`, `pr-jean.2` and so on, with 500 files in each. Let it run. If it has not finished after fifteen minutes, choose **Stop**, and work with what it has saved.

    </div>

    <div class="box trouble" markdown="1">

    If PhotoRec says that it cannot open the partition, the number after `partition_i386` does not match the table from step 20. Use the number of the NTFS partition in that table, counting from 1.

    </div>

22. Count the carved files by type, and look at some of them:

    ```bash
    find pr-jean.* -type f ! -name report.xml | sed 's/.*\.//' | sort | uniq -c
    xdg-open pr-jean.1
    ```

    <div class="box expect" markdown="1">

    A count for each type, and a folder full of files named by sector. This is what carving a real disk gives you: many files, no names, no dates, and no sign of which ones matter. Write the counts in your notes, with one sentence on how you would reduce this set to the files that matter to the case.

    </div>

    <div class="box trouble" markdown="1">

    If a count is zero for every type, look at the last lines of `photorec.log` in your case folder. It says which partition was read and what was found.

    </div>

### Part F: read the features

{:start="23"}
23. Run bulk_extractor on the test image. It takes a few seconds:

    ```bash
    bulk_extractor -o be-test ~/evidence/s03/s03-carving-image.dd > be-test.log
    cat be-test/email_histogram.txt
    ```

    <div class="box expect" markdown="1">

    Five addresses with their counts, the same lines as in section 5. The most frequent one begins with `storage.desk` and has a count of 36. Every address ends in a domain that is reserved for examples.

    </div>

    <div class="box trouble" markdown="1">

    If the folder `be-test` exists from an earlier attempt, delete it first. Like Foremost, bulk_extractor does not write into a folder that already holds results.

    </div>

24. Compare bulk_extractor with a plain text search, for one address:

    ```bash
    grep -a -o 'intake@forensics-unit.example.com' ~/evidence/s03/s03-carving-image.dd | wc -l
    grep -c 'intake@forensics-unit' be-test/email.txt
    grep GZIP be-test/email.txt | head -3
    ```

    <div class="box expect" markdown="1">

    The text search finds the address 10 times. bulk_extractor lists it 13 times. The three others have positions that begin with `5202432-GZIP-`: they exist in the image only inside compressed data. Divide 5,202,432 by 512. The result, 10,161, is the sector in the name of the large `.gz` file that PhotoRec carved in step 7. PhotoRec gave you an archive with no name. bulk_extractor read through the compression and gave you the addresses.

    </div>

    <div class="box trouble" markdown="1">

    If the second count is 0, look at the name of the feature file: it is `email.txt`, inside `be-test`.

    </div>

25. Connect a feature to a carved file. Take the position of the first line of `be-test/email.txt` that does not begin with `#`, and divide it by 512:

    ```bash
    grep -v '^#' be-test/email.txt | head -1
    echo $((3605060 / 512))
    ```

    <div class="box expect" markdown="1">

    Sector 7,041. That is 80 sectors, ten clusters, after sector 6,961, where Foremost found the header of C07. The addresses lie in the two foreign clusters in the middle of the broken picture. A carving tool passed through them and reported nothing.

    </div>

    <div class="box trouble" markdown="1">

    If your first position is a different number, use your number in the calculation. The sector should still fall between 6,961 and 7,109.

    </div>

26. Go back to the first terminal. When bulk_extractor has finished with Jean's disk, read its counts:

    ```bash
    head -25 ~/cases/s03/be-jean/email_histogram.txt
    head -25 ~/cases/s03/be-jean/email_domain_histogram.txt
    ```

    <div class="box expect" markdown="1">

    A long list of addresses with counts, and a list of mail domains. Many belong to software companies and to certificate authorities: they come from program files, and they are the false positives that section 5 described. Among them are addresses at the company's own domain, `m57.biz`, and addresses of people outside the company. Write in your notes the three most frequent addresses with their counts, and every address outside `m57.biz` that looks like a person and not like a company.

    </div>

    <div class="box trouble" markdown="1">

    If bulk_extractor is still running, read `be-jean/email.txt` while you wait: the feature files grow during the run, and the histograms are written at the end.

    </div>

27. Choose one address of a person outside the company, and read what surrounds it on the disk:

    ```bash
    grep -m 3 'ADDRESS' ~/cases/s03/be-jean/email.txt
    xxd -s $((OFFSET - 256)) -l 768 /mnt/jean/ewf1
    ```

    Write the address in place of `ADDRESS`. Choose a line whose position is a plain number, and write that number in place of `OFFSET`.

    <div class="box expect" markdown="1">

    `xxd` prints the bytes before and after the address. Often they are part of an email: you can read other addresses, a subject or part of a message. Without recovering one file, you have a lead on who was in contact with Jean, and a position on the disk where the evidence for it lies.

    </div>

    <div class="box trouble" markdown="1">

    If the bytes are not readable, the address lies inside a program file or in compressed data. Choose another line.

    </div>

28. Close the session cleanly. Release the raw view, and complete the custody record:

    ```bash
    sudo umount /mnt/jean
    ```

    <div class="box expect" markdown="1">

    `/mnt/jean` is empty again. The custody record has an entry for each exhibit that you examined, with the tools and their versions, and for each set of results that you created: the carved files, the working copy and the two feature folders. The feature folder of Jean's disk is recorded as evidence that holds personal data.

    </div>

    <div class="box trouble" markdown="1">

    If Kali says that the target is busy, a program still has `ewf1` open: close PhotoRec and any `xxd` output that is still running, and try again.

    </div>

### Checkpoint

Hand in `s03-checkpoint.csv`, your notes and your custody record. Your work passes when all five of these are true:

1. Your list has ten lines, C01 to C10. Each of the eight items that you recovered exactly names the carved file, or files, that matched its SHA-256 value.
2. C07 and C08 are not claimed as recovered. Each carries your statement of the cause, and the two causes are different.
3. Your notes give the start sector, the length, the file system and the label of the partition that the table did not list, and explain why seven files appeared only when you carved the whole image.
4. Your notes give, for Jean's disk, the number of carved files of each type and the three most frequent email addresses with their counts.
5. Your custody record has no gap, and it records the working copy and the change that you made to it.

The lecturer judges your list against the unit's record of how the test image was built, and your figures for Jean's disk against the unit's own run. Each item was planted in a known place and a known state, so your answer for each one is right or wrong, not a matter of opinion.

This checkpoint helps with the phase test.

### If you have time

**Put C07 back together.** You know from step 12 that the carved file has two foreign clusters, from byte 40,960 to byte 49,151. Leave them out, and test the result:

```bash
(head -c 40960 fm/jpg/00006961.jpg; tail -c +49153 fm/jpg/00006961.jpg) > c07-rebuilt.jpg
sha256sum c07-rebuilt.jpg
grep C07 ~/evidence/s03/s03-expected-list.csv
```

The two values are the same. You have recovered a fragmented file by hand, and the hash value proves it. Open the picture: it is whole. Then try the same idea on C08 and explain in one sentence why it cannot work.

**Ask PhotoRec to keep what it rejects.** Run `photorec /d pr-keep /log ~/evidence/s03/s03-carving-image.dd`, select the whole disk, and before **Search** open **Options** and set **Keep corrupted files** to **Yes**. Compare the result with step 7. The files whose names begin with `b` are the ones that PhotoRec judged to be broken.

**Carve unallocated space with Foremost.** Use the method from the deeper layer of section 3: `blkls -o 2048 ~/evidence/s03/s03-carving-image.dd > unalloc.raw`, then `foremost -t jpg -i unalloc.raw -o fm-unalloc`. Compare the sectors in the names with those from step 9, and explain the difference.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. A carving tool and a recovery from a directory entry both return the same deleted picture, and both copies have the same hash value. Name two things that the second method gives the examiner and the first does not.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Recovery from the directory entry gives the name of the file and its dates, and shows the folder it was in, because those facts were stored in the index. The carved copy has only the content and the sector where it was found. The points that earn marks: (1) the name; (2) the dates, or the place in the folder structure; (3) the reason: these facts are kept in the index and not in the content.
</details>

**2. Explain why a file that was stored in two runs of clusters is carved wrongly, and how the examiner can tell.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A carving tool has no record of where the second run begins, so after the first run it reads straight on and takes clusters that belong to other data. The examiner can tell because the carved file is damaged from a certain point, is often too long by a whole number of clusters, and has a hash value that does not match the original. The points that earn marks: (1) the tool assumes one continuous run; (2) foreign clusters are joined to the first run; (3) a correct sign, such as the size, the damage or the hash value.
</details>

**3. An examiner carves the unallocated space of a volume and reports that no pictures were found on the device. Give two reasons why this statement goes too far.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The carve did not read the file slack of current files or the space outside the partition, and pictures can lie in both. It also finds only pictures that begin with a known header and are stored in one run, so a fragment or a fragmented picture is missed or rejected. The points that earn marks: (1) one place that was not read, such as file slack or unpartitioned space; (2) a limit of carving itself, such as fragmentation or a missing header; (3) the report should state what was searched and how, not that nothing exists.
</details>

**4. The partition table of a disk lists one partition, and half of the disk belongs to no partition. Describe how a tool can find a volume in that space, and what the examiner should do before letting the tool write a new table.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The tool reads the unpartitioned sectors and looks for a boot sector, which gives the type and the size of the volume, and the sector where it is found gives the start. Writing a new table changes sector 0, so the examiner works on a verified working copy and records the change, or reads the volume from its start sector without writing at all. The points that earn marks: (1) the boot sector describes the volume; (2) its position gives the start, so the entry can be rebuilt; (3) the original is not changed: a working copy, or reading by offset.
</details>

**5. Two disks from a RAID 0 set are imaged. Explain why carving one image alone recovers small files and not large ones.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A RAID 0 set cuts the data into stripes of a fixed size and writes them to the two disks in turn, so one disk holds only every second stripe. A file smaller than one stripe can lie whole on one disk, but a larger file is missing half of its pieces there, and a carving tool reads straight on into stripes of other files. The points that earn marks: (1) striping spreads the data over the disks in fixed pieces; (2) one disk holds only part of any large file; (3) to the carving tool this is fragmentation, so the set must be rebuilt first, with the right order and stripe size.
</details>

## Coming next

Today nobody tried to stop you. The content was simply left behind, and you learned to read it without an index. In Session 4 someone has tried: files are encrypted, wiped, hidden inside pictures or given false dates. You will see that each of these acts leaves its own trace. Session 4 closes Day 2, so it ends with the quiz for both of today's sessions.
