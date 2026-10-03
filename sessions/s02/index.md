---
session_code: S02
description: "How a disk is organised into partitions and file systems, why deleting a file leaves its content behind, where that content can still be found, and when recovery stops being possible."
hook: >-
  The client's case is open. The suspect's computer and his USB stick have been imaged, and both look clean.
  If he deleted the confidential documents, what did he really remove, and what is still there for you to find?
outcomes:
  - "Explain how a partition table and a file system organise a storage device"
  - "Compare what FAT, NTFS and ext4 keep about a file, and what each one changes when the file is deleted"
  - "Identify the places where recoverable data can remain: unallocated space, file slack and unpartitioned space"
  - "Explain what ends the chance of recovery, on a hard disk and on a solid-state drive"
  - "Apply Autopsy to triage a file system and recover deleted files from the case evidence"
  - "Justify a recovery result by matching the SHA-256 hash value of each recovered file to the client's reference list"
before:
  - "Explain what a [forensic image](../s01/#2-the-forensic-image-copy-everything-then-work-on-the-copy) is, and why it copies every sector (Session 1)"
  - "Calculate a [hash value](../s01/#3-the-hash-value-showing-that-nothing-changed) and use it for verification (Session 1)"
  - "Keep a [chain of custody](../s01/#4-chain-of-custody-the-record-that-holds-the-evidence-together) with a custody record that has no gaps (Session 1)"
  - "Start your Windows and Kali virtual machines ([Session 0](../s00/))"
demos:
  - id: S02-D1
    title: "Reading a partition table"
    file: s02-d1-partition-table.html
    teaches: "A partition table is a small map of sector ranges; removing an entry changes the map and leaves every sector as it was."
  - id: S02-D2
    title: "Delete one file in FAT, NTFS and ext4"
    file: s02-d2-delete-three-ways.html
    teaches: "Deletion rewrites a few fields in the index, different ones in each file system, while the clusters keep their content."
  - id: S02-D3
    title: "File slack"
    file: s02-d3-file-slack.html
    teaches: "A shorter file written into a used cluster leaves old data after its own end."
  - id: S02-D4
    title: "The window closes"
    file: s02-d4-window-closes.html
    teaches: "On a hard disk, reuse overwrites deleted content slowly and in parts; on a solid-state drive, TRIM clears it soon after deletion."
slides: s02-storage-file-systems.pptx
evidence: "the lab share, folder `S02` (the lab steps say exactly which files)"
---

In Session 1 you proved that you can copy evidence and show that the copy is exact. Today the unit gives you the case itself. You receive two items: the image of the suspect's computer and the image of a USB stick that was found on him at the company's security checkpoint.

Both items come from the NIST CFReDS Data Leakage Case, a documented public training collection. The names in it, such as Iaman Informant, belong to that collection. The methods you use on it are real.

Session 1 left one promise open. It said that a forensic image takes every sector, and that the unlisted space matters. Today you see why.

## 1. The disk has a map: sectors and partitions

### The idea

Open the image of the suspect's computer in a forensic tool, and the first thing you see is not a file. It is a short list:

| Area | Starts at sector | Size |
|---|---|---|
| Not in any partition | 0 | 1 MB |
| Partition 1 | 2,048 | 100 MB |
| Partition 2 | 206,848 | 19.9 GB |
| Not in any partition | 41,940,992 | 1 MB |

A storage device is a long row of numbered blocks. Each block is a {% include term.html t="sector" %}, and on this disk each sector holds 512 bytes. The disk has 41,943,040 of them.

An operating system does not use the row as one piece. It divides the row into ranges, and each range is a {% include term.html t="partition" %}. The list of ranges is the {% include term.html t="partition-table" %}. It is very small, and it sits at the start of the disk.

When a partition holds a file system, the operating system shows it as a drive, such as `C:`. A partition in that state is called a {% include term.html t="volume" %}. On the suspect's computer, partition 1 is a small volume that Windows uses to start. Partition 2 is the `C:` drive.

Now look at the first and last rows of the list. Those sectors belong to no partition. They are {% include term.html t="unpartitioned-space" %}. The operating system never shows them to the user, but they are on the disk and they are in your image.

### How it works

There are two kinds of partition table. You must be able to recognise both.

The older kind is the {% include term.html t="mbr" %}, the Master Boot Record. It is the first sector of the disk, sector 0. Inside its 512 bytes are a small start-up program, four entries of 16 bytes each, and a two-byte mark at the end. Each entry holds a type code, the first sector of the partition and its number of sectors. The suspect's computer uses an MBR, and two of the four entries are filled.

The newer kind is the {% include term.html t="gpt" %}, the GUID Partition Table. It was designed because the MBR has two hard limits.

| | MBR | GPT |
|---|---|---|
| Where it is | Sector 0 only | A header in sector 1, then a list of entries after it |
| Number of partitions | 4 | Usually 128 |
| Largest disk | About 2 TB, with 512-byte sectors | Far larger than any disk made today |
| Second copy | None | A full copy in the last sectors of the disk |
| Self-check | None | A checksum that shows damage |
| How a partition is named | A one-byte type code | A long unique identifier, plus a name |

A GPT disk still has something in sector 0. It is called a protective MBR. It holds one entry that covers the whole disk, so that old software does not think the disk is empty.

The most important fact for an examiner is what the partition table is *not*. It is not the data. It is a map of the data. Step through the suspect's table, and then see what happens when one entry is removed.

{% include demo.html id="S02-D1" %}

<div class="box metaphor" markdown="1">

**The comparison.** A partition table is like the map in a land registry office. The map shows where each plot of land begins and ends.

**Why it fits.** The disk is the land. Each partition is a plot. The map is small and it is kept in one office, as the table is kept in a few sectors. If someone removes a plot from the map, the houses on that plot are still standing.

**Where it breaks.** A plot of land has fences that you can see. A partition has no fence. Its edges exist only as two numbers in the table, so changing one number moves the edge and leaves no mark on the sectors themselves. And an office usually keeps one map. A GPT disk keeps a second copy at the far end of the disk, which an examiner can compare with the first.

**So what.** Never accept "this disk is empty" or "this disk has one partition" from the table alone. Check the table, and then check the sectors that the table does not cover.

</div>

Look again at the suspect's USB stick. It is a 4 GB stick, but its table holds one partition of 1 GB. About three quarters of the stick is unpartitioned space. That is unusual, and an examiner notes it before opening a single file.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The disk" and "the drive" for the same thing | A *disk* is the device. A *volume* is one partition with a file system, shown as a drive letter. | One disk can hold several volumes. Your image is of the disk. |
| "The MBR" for any partition table | *MBR* and *GPT* are two kinds of partition table. | A GPT disk also has a sector 0, but its real table is elsewhere. |
| "Unallocated" for space outside partitions | *Unpartitioned space* is outside every partition. *Unallocated space* is free space inside a file system. | Tools, including Autopsy, print "Unallocated" for both. In your notes, say which one you mean. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An examiner images a 4 GB USB stick. The partition table shows one partition of 1 GB. What should the examiner do with the other 3 GB?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing: sectors outside a partition cannot hold data</li>
    <li data-key="b">Nothing: the forensic image does not include them</li>
    <li data-key="c">Examine them: they are in the image, and the table says nothing about what they hold</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). A forensic image takes every sector of the device, so the 3 GB is there. The partition table only says that no current partition uses those sectors. It does not say that they are empty.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Inside the two tables</summary>

**The MBR, byte by byte.** Bytes 0 to 445 hold the start-up program. Bytes 446 to 509 hold the four partition entries. Bytes 510 and 511 hold the mark `55 AA`. In each 16-byte entry, one byte says whether the partition is the one to start from, one byte is the type code, four bytes give the first sector and four bytes give the number of sectors. Four bytes can count up to about 4.29 thousand million sectors. With 512-byte sectors that is about 2 TB, which is where the size limit comes from.

Some type codes that you will meet: `07` for NTFS and exFAT, `0B` and `0C` for FAT32, `83` for a Linux file system, and `EE` for the protective MBR of a GPT disk. When a disk needed more than four partitions, one MBR entry could be an *extended* partition, which holds a chain of further tables inside it.

**The GPT.** The header in sector 1 gives the size of the disk, the place of the entry list and a checksum. The entry list usually fills sectors 2 to 33, with 128 entries of 128 bytes. Each entry holds a type identifier, a unique identifier for that one partition, the first and last sector, and a name. The same list and header are stored again in the last 33 sectors of the disk. If the two copies differ, something changed one of them, and that is worth a note.

**Why the first megabyte is empty.** Modern tools start the first partition at sector 2,048, which is exactly 1 MB into the disk. The sectors between the table and the first partition are normally empty. Because nothing should be there, anything that *is* there deserves a look.

**The tool.** In the Sleuth Kit, the command `mmls` prints the partition table of an image, including the ranges that no partition covers. Autopsy shows the same list as the volumes under a data source.
</details>

<div class="box key" markdown="1">

The partition table is a small map. Sectors that the map does not show are still on the disk and still in your image.

</div>

## 2. The file system: an index and a storage area

### The idea

Open partition 2 of the suspect's disk and you see folders and files. One of them is his letter of resignation, a Word document on the desktop.

The tool tells you two different kinds of thing about that letter. It tells you the name, the size, the dates and the place on the disk where the letter is stored. It also shows you the words of the letter. The first kind of thing is {% include term.html t="metadata" %}: information *about* the file. The second is the content.

A {% include term.html t="file-system" %} keeps these two in different places. One part of the volume is an index that holds the metadata. The rest of the volume is a storage area that holds content. The index says where in the storage area each file's content is.

### How it works

The storage area is not handed out one sector at a time. That would need too many records. The file system groups sectors into a {% include term.html t="cluster" %}, and gives out whole clusters. On an NTFS volume of this size, a cluster is normally 8 sectors, which is 4,096 bytes.

Two consequences follow, and both matter later today.

**A file takes whole clusters.** A file of 10,000 bytes needs three clusters, which is 12,288 bytes. The last cluster is only partly used.

**The file system must know which clusters are in use.** It keeps a record for this. A cluster that belongs to a current file is {% include term.html t="allocated" %}. All the other clusters together are the {% include term.html t="unallocated-space" %} of the volume.

Read that last definition again, because it is the centre of this session. Unallocated does not mean empty. It means only that the file system has no current file there. A cluster can be unallocated and still hold every byte that was written to it last year.

| | Allocated cluster | Unallocated cluster |
|---|---|---|
| The file system says | "A current file uses this." | "This is free. I may give it to the next file." |
| What it holds | Content of a current file | Whatever was written there last: old content, or nothing |
| Does a normal file copy take it? | Yes, as part of the file | No |
| Does a forensic image take it? | Yes | Yes |

<div class="box metaphor" markdown="1">

**The comparison.** A file system is like a library with a catalogue and shelves. The catalogue holds a card for each book. The card gives the title and the shelf where the book stands.

**Why it fits.** The cards are the metadata and the shelves are the storage area. A reader finds a book through the card, never by walking along the shelves. A shelf position with no card pointing to it is "free" in the catalogue, whatever is standing on it.

**Where it breaks.** A book is whole or it is gone. A file can be half replaced: some of its clusters reused, the others still holding the old content. A book stands in one place. A file can be stored in several separate runs of clusters. And nobody ever walks along a computer's shelves, because the operating system trusts the catalogue completely. Only an examiner's tools read the shelves directly.

**So what.** There are always two questions about a file, and they have separate answers. What does the catalogue say? What is on the shelf? Most of today is about cases where the two answers differ.

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A tool reports that cluster 9,000 of the suspect's volume is unallocated. What do you know about its content?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing yet: it may hold old data, and you must look</li>
    <li data-key="b">It holds only zeros</li>
    <li data-key="c">It has never been used</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). "Unallocated" is a statement by the index: no current file owns this cluster. It says nothing about the bytes that are stored there. Options (b) and (c) are both possible, but neither follows from the word.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Cluster sizes and fragmentation</summary>

The cluster size is chosen when the volume is formatted, and it is recorded in the first sector of the volume, called the boot sector. Common sizes are 4,096 bytes for NTFS and ext4, and between 4,096 and 32,768 bytes for FAT32, depending on the size of the volume. The ext file systems call the same unit a *block*.

A file system tries to store each file in one continuous run of clusters. When no free run is long enough, it stores the file in several runs. Such a file is *fragmented*. For normal use this only costs some speed. For recovery it matters a great deal, because a tool that has lost the index does not know where the next run begins. Session 3 returns to this problem.

In the Sleuth Kit, `fsstat` prints the facts of a file system, including its cluster size and the ranges of its index and its storage area.
</details>

<div class="box key" markdown="1">

A file system is an index plus a storage area. "Unallocated" is what the index says about a cluster, not what the cluster contains.

</div>

## 3. Three file systems, one job

### The idea

The case gives you two file systems in one day. The suspect's Windows computer uses NTFS. His USB stick uses FAT32. A Linux server, or an Android phone, would give you a third family, called ext.

All three do the same job. Each must answer three questions about every file. What is it called? What are its size and dates? Where is its content? They differ in *where* they write each answer. Those differences decide what is left after a deletion, so you need them before the next section.

### How it works

| | FAT32 | NTFS | ext4 |
|---|---|---|---|
| Where you meet it | USB sticks, memory cards, cameras | Windows system disks | Linux, and Android phones |
| The name is in | The {% include term.html t="directory-entry" %} | The file's record in the {% include term.html t="master-file-table" %}, and the folder's index | The directory entry |
| Size and dates are in | The directory entry | The file's record | The {% include term.html t="inode" %} |
| The place of the content is in | The directory entry gives the *first* cluster. The {% include term.html t="file-allocation-table" %} gives the rest. | The file's record, as a list of runs | The inode, as a list of ranges |
| Which clusters are free is in | The file allocation table | A bitmap file | Bitmaps |

**FAT32** is the simplest. A folder is a list of directory entries of 32 bytes. Each entry holds the file's name, its dates, its size and the number of its first cluster. To find the second cluster, the system looks in the file allocation table. That table has one entry per cluster, and each entry holds the number of the *next* cluster of the same file. So the content of a file is a chain, and the table is the only place where the chain is written.

**NTFS** puts almost everything about a file in one place. The master file table, usually written as MFT, has one record of 1,024 bytes for every file and folder. The record holds the name, four dates, the size, and the list of cluster runs where the content is. If the file is very small, the content itself is stored inside the record, and the file uses no clusters at all.

**ext4** separates the name from everything else. The directory entry holds only the name and a number. The number leads to the inode, which holds the size, the dates and the ranges of blocks where the content is. An ext4 file system also keeps a journal, a running record of recent changes to its own metadata.

Here is the same fact, "where is the content?", written three ways for a file in clusters 500 to 502:

| File system | What is written |
|---|---|
| FAT32 | Directory entry: first cluster 500. Table entry 500 says 501. Entry 501 says 502. Entry 502 says "end". |
| NTFS | MFT record: one run, starting at cluster 500, 3 clusters long. |
| ext4 | Inode: one range, starting at block 500, 3 blocks long. |

Notice how much FAT depends on its table. If the table entries for this file were cleared, the directory entry would still give cluster 500 and the size. The tool could only *assume* that the file continues in 501 and 502.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">In which of these file systems does the record that holds a file's name also hold the full list of places where its content is stored?</p>
  <ul class="qc-opts">
    <li data-key="a">FAT32</li>
    <li data-key="b">NTFS</li>
    <li data-key="c">ext4</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). An MFT record holds the name and the list of cluster runs together. In FAT32 the directory entry holds only the first cluster, and the chain is in the table. In ext4 the name is in the directory entry and the list is in the inode.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>More about each file system</summary>

**The FAT family.** FAT12, FAT16 and FAT32 differ in the size of a table entry, and so in the number of clusters they can count. A FAT volume keeps two copies of the table. Long file names are stored in extra directory entries placed before the main one. exFAT is a newer relative for large memory cards. It adds a bitmap of free clusters, and it can mark a file as continuous so that it needs no chain. The company's own authorised USB stick in this case uses exFAT.

**NTFS.** Everything in NTFS is a file, including its own metadata. The MFT is the file `$MFT`. The bitmap of used clusters is `$Bitmap`. Each MFT record is made of *attributes*. `$STANDARD_INFORMATION` holds the four dates that Windows shows. `$FILE_NAME` holds the name, the parent folder and a second set of dates. `$DATA` holds the content or the list of runs. Content stored inside the record is called *resident*, and this happens for files up to about 700 bytes. NTFS also keeps two logs of its own activity, `$LogFile` and the change journal `$UsnJrnl`. You will use them in Session 5.

**The ext family.** ext2 has no journal. ext3 added the journal. ext4 replaced the old lists of single blocks with *extents*, which are ranges. The volume is divided into block groups, and each group has its own bitmaps and its own table of inodes. You meet ext4 again in Session 15, because it is the file system of most Android phones.

**Other file systems.** The CD in this case uses UDF. Apple devices use APFS, which Session 15 covers. The three-question method works on all of them: find where the name, the dates and the place of the content are written.
</details>

<div class="box key" markdown="1">

Every file system records a name, a set of facts and the place of the content. Where each one is written decides what survives a deletion.

</div>

## 4. How deletion really works

### The idea

The documentation of the case describes one moment exactly. The suspect had copied the confidential documents into a folder on his desktop. After he had copied them to his USB stick, he selected the folder on his desktop, held Shift and pressed Delete. The folder disappeared. He did the same kind of thing to the stick later: he gave it a {% include term.html t="quick-format" %}, and it looked empty.

Each action took a second or two. The files held many megabytes. A computer cannot clear that much storage in that time, and it did not try. In both cases the system changed a few small records in the index. It did not touch the content.

### How it works

When a file is deleted, the file system does two things. It marks the file's record as no longer in use. It marks the file's clusters as unallocated. Nothing else is needed, because from that moment no reader can reach the content through the index.

What exactly is changed depends on the file system. This is where section 3 pays off.

| | What deletion changes | What is left |
|---|---|---|
| FAT32 | The first byte of the directory entry becomes the mark `E5`. The file's entries in the file allocation table are set to zero. | The rest of the name, the dates, the size and the *first* cluster. The chain is gone. All the content. |
| NTFS | The "in use" flag of the MFT record is cleared. The file's bits in the bitmap are cleared. The name is taken out of the folder's index. | The whole MFT record: name, dates, size and the full list of runs. All the content. |
| ext4 | The inode's list of ranges is cleared and a deletion time is written. The bitmaps are updated. The directory entry is skipped over. | The name, for a while. The inode's dates. All the content, but no record of where it is. |

Watch one file being deleted in each of the three.

{% include demo.html id="S02-D2" %}

So the same act gives three different starting points for {% include term.html t="data-recovery" %}.

- On **NTFS**, the tool reads the old MFT record and follows the runs. If nothing has reused the record or the clusters, the file comes back exactly, even when it was stored in several runs.
- On **FAT32**, the tool knows the first cluster and the size. It reads forward from there and assumes that the file was stored in one run. For a file stored in one run, the result is exact. For a fragmented file, the result is wrong after the first run.
- On **ext4**, the tool has a name and an inode with no ranges. It must look for an older copy of the inode in the journal, or search the unallocated space for the content itself.

Two special cases appear in today's evidence.

**The Recycle Bin is not deletion.** When a Windows user presses Delete without Shift, the file is moved to a hidden folder called `$Recycle.Bin`. Windows gives it a new name that begins with `$R`, and writes a small partner file that begins with `$I`. The partner file records the original path, the size and the time of the deletion. Nothing is unallocated at this point. Real deletion happens when the user empties the bin, and then both files are deleted in the normal NTFS way. Shift and Delete skips the bin.

**A quick format is a mass deletion.** A quick format writes a new, empty file allocation table and a new, empty top folder. It does not visit the storage area. Every file's content is still there. So are the old sub-folders, because a folder is itself stored in clusters in the storage area. A tool can find those old folders by their shape, and read the directory entries inside them. Files found this way, with their own record but no path back to the top, are called {% include term.html t="orphan-file" text="orphan files" %}.

<div class="box lens" markdown="1">

**Eternal Sunshine of the Spotless Mind.** In this film, Joel and Clementine were a couple. After they part, each one pays a company to erase the other from memory. The technicians work through the night and remove the memories one by one. In the morning, neither person can recall the other.

But the erasure is not complete. The two meet again as strangers and are drawn together at once. A worker at the company, who had her own memory of a love affair erased, falls in love with the same man a second time. The events can no longer be recalled. Something that the events left behind is still there, and it still acts.

Psychologists who study memory make the same distinction. A memory that you cannot recall is not always gone. Often the trace is still stored, and what you have lost is the route to it. Give the right cue, such as a smell or a street, and it returns.

A deleted file is in that state. The system has lost its route to the content. The trace remains. Your tools are the cue.

</div>

<div class="box key" markdown="1">

Deletion removes the pointer, not the data; recovery reads what the system stopped indexing.

</div>

Now test the film against the disk, as you would test any comparison. In the film, what remains is a feeling: vague, and impossible to prove. On a disk, what remains is exact. It is the same bytes, and a hash value can show that they are the same bytes. The film's erasure is also hard work, done by people who hunt for each memory. Ordinary deletion is the opposite: the lazy removal of a pointer. Hunting down the content itself is called wiping, and it is a different act with different traces. You will study it in Session 4.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The file was erased." | "The file was deleted." | *Deleted* means that the index entry was released. Whether the content still exists is a separate question. |
| "Deleted" and "wiped" for the same thing | *Wiped* means that the content was overwritten on purpose. | A deleted file can often be recovered. A wiped file cannot. Session 4 covers wiping. |
| "It is in the Recycle Bin, so it is deleted." | "It was moved to the Recycle Bin." | The file is still allocated. Only its name and folder changed. |
| "Recovery" for both meanings | {% include term.html t="data-recovery" text="Data recovery" %} gets data back from storage. System recovery returns systems to normal after an incident. | Session 1 promised this distinction. In this module we always say which one. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A tool recovers two deleted files that were each stored in two separate runs of clusters. One was on an NTFS volume, the other on a FAT32 volume. Nothing has been written to either volume since. Which result do you expect?</p>
  <ul class="qc-opts">
    <li data-key="a">Both files are exact</li>
    <li data-key="b">Neither file is exact</li>
    <li data-key="c">The NTFS file is exact; the FAT32 file is right only up to the end of its first run</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The NTFS record still lists both runs. The FAT32 directory entry gives only the first cluster, and the chain in the table was set to zero, so the tool reads straight on and takes clusters that belonged to something else.</p></div>

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A user presses Delete, without Shift, on a file on the desktop of a Windows computer. What has happened to the file's clusters?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing: they are still allocated, to a file with a new name in the Recycle Bin</li>
    <li data-key="b">They are now unallocated</li>
    <li data-key="c">They have been filled with zeros</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Sending a file to the Recycle Bin is a move and a rename. The clusters become unallocated only when the bin is emptied. Windows does not fill them with zeros in either case.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Edge cases, and what the tools show</summary>

**What `E5` costs.** In FAT, the deletion mark replaces the first character of the short name, so a recovered short name may show `_` or `?` in first place. If the file had a long name, the extra entries that hold it usually survive, and the tool shows the full name.

**Why NTFS records disappear quickly.** When NTFS needs a record for a new file, it takes the free record with the lowest number. So a deleted file's record can be reused within minutes on a busy system, long before its clusters are reused. When that happens, the content may still be in unallocated space with no name attached to it. The documentation of this case warns that this happened to the folder on the suspect's desktop.

**Names that outlive the record.** NTFS writes file names in more than one place. The folder's index can keep an old entry in its unused part. The change journal `$UsnJrnl` logs each creation, rename and deletion by name. So an examiner can sometimes show that a file with a certain name existed, and when it was renamed, with no content to show. Session 5 uses these sources.

**ext3 and ext4.** These file systems clear the inode's block list on purpose, to keep the file system consistent after a crash. This is why simple undelete tools work on FAT and NTFS and fail on ext4. Recovery there depends on the journal, or on carving, which is the subject of Session 3.

**In the tools.** Autopsy marks a deleted file with a red cross and lists all of them under *Deleted Files*. Orphan files appear in a folder that the tool creates, called `$OrphanFiles`. In the Sleuth Kit, `fls -d` lists deleted entries and `icat` writes out the content that an entry points to. A deleted entry whose clusters now belong to another file is marked `realloc`.
</details>

## 5. Where recoverable data lives

### The idea

Section 4 showed that deleted content stays in unallocated space. That is the largest place to look. There are two more. Each one exists for the same reason: the index stopped describing some part of the storage.

Here is the second place. The suspect's resignation letter is, let us say, 10,000 bytes long. The file system gave it three clusters, which is 12,288 bytes. The letter does not fill the third cluster. The 2,288 bytes after the end of the letter belong to the file, but they are not part of the letter. This space is {% include term.html t="file-slack" %}.

What is in those 2,288 bytes? Whatever was in that cluster before the letter was saved.

### How it works

When a file system gives a cluster to a new file, it does not clean the cluster first. The new content is written from the start of the cluster. The rest stays as it was. If the cluster once held part of a deleted spreadsheet, then the end of that part is still there, inside a cluster that now belongs to an ordinary letter.

File slack has two parts, because a disk writes whole sectors.

- The letter ends somewhere inside a sector. The computer must write that whole sector, so it fills the rest of the sector with something. This first part is {% include term.html t="ram-slack" %}. Very old systems filled it with whatever was in memory at that moment, which is how it got its name. Modern Windows fills it with zeros.
- After that sector, the cluster has more sectors that the letter does not need. The computer does not write to them at all. This second part is {% include term.html t="drive-slack" %}, and it keeps the old data.

For the letter of 10,000 bytes in clusters of 4,096 bytes:

| | Bytes |
|---|---|
| Three clusters | 12,288 |
| The letter | 10,000 |
| File slack: 12,288 less 10,000 | 2,288 |
| RAM slack: the rest of the sector in which the letter ends | 240 |
| Drive slack: the four whole sectors that remain | 2,048 |

Change the size of the new file in the demo, and watch the two parts of the slack change.

{% include demo.html id="S02-D3" %}

<div class="box metaphor" markdown="1">

**The comparison.** File slack is like a whiteboard that the next teacher wipes only where she needs space. She writes a short note at the top. Below her note, the last lesson is still on the board.

**Why it fits.** The board is the cluster. The new note is the new file. The old writing below it is the drive slack: it belongs to nobody now, and it stays until someone needs that part of the board.

**Where it breaks.** Everyone in the room can see the old writing on a board. Nobody can see slack. The operating system stops reading at the end of the file, so a user, a copy program and a backup never show it. The board also has no RAM slack: on a modern computer, the short strip directly after the new note is wiped clean, and only the area below it keeps the old lesson. And what remains is a tail, not a message. It is the last part of something, with no name and no date.

**So what.** Slack rarely gives you a whole document. It gives you fragments: a line of an email, a row of figures, part of a picture. A fragment can still show that certain content was once on this disk, even after the file that held it was deleted and its first clusters were reused.

</div>

You now have the full list of places where data can remain after the index has stopped describing it.

| Place | What it is | What you may find there |
|---|---|---|
| Unallocated space | Clusters that the file system marks as free | Whole deleted files, or large parts of them |
| File slack | The end of a current file's last cluster | The tail of whatever used that cluster before |
| Unpartitioned space | Sectors outside every partition | Anything: an old volume, hidden data, or nothing |

All three are in a forensic image. None of them is in a file copy. This is the reason behind the rule you learned in Session 1.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A file of 5,000 bytes is saved on a volume with clusters of 4,096 bytes. How much file slack does it have?</p>
  <ul class="qc-opts">
    <li data-key="a">904 bytes</li>
    <li data-key="b">3,192 bytes</li>
    <li data-key="c">None, because the file is larger than one cluster</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The file needs two clusters, which is 8,192 bytes. 8,192 less 5,000 is 3,192. Option (a) is the part of the file in the second cluster, not the slack. Almost every file has slack, because very few sizes are an exact number of clusters.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Other small places, and how tools show slack</summary>

**Slack in the index itself.** An MFT record is 1,024 bytes, and most files do not fill it. The unused end of a record can hold parts of the record's earlier use. A folder's index on NTFS is stored in blocks, and the unused end of a block can hold the names of files that were deleted from the folder. A FAT folder keeps deleted directory entries until new ones replace them.

**Volume slack.** A partition can be a little larger than the file system inside it. The sectors between the end of the file system and the end of the partition are another small area that the index never describes.

**How the tools show it.** Autopsy can show the slack of each file as a separate item whose name ends in `-slack`. They are hidden by default. You switch them on in **Tools**, **Options**, **View**. Keyword search and carving tools read unallocated space and slack as raw data, without the file system's help.

**A caution for reports.** Content found in slack or in unallocated space has no name, no dates and no owner attached to it. You can report that the content is present on the device. To say who put it there, and when, you need other evidence.
</details>

<div class="box key" markdown="1">

Recoverable data lives where the index stopped describing the storage: in unallocated space, in file slack and in unpartitioned space.

</div>

## 6. The limits of recovery

### The idea

A deleted file is recoverable only while two things survive: something that says where it is, and the content itself. Either one can be lost, and they are lost separately.

Think about the suspect's `C:` drive in the hours after he deleted the folder. He kept working. He browsed the web for about four hours, and wrote his resignation letter. Every page and every saved file needed clusters, and the file system gave out clusters that it had marked as free. Some of them were the clusters of his deleted documents.

When new data is stored in a cluster, the old data in that cluster is gone. To {% include term.html t="overwrite" %} is the one event that truly ends recovery. No tool reads what was there before.

### How it works

On a hard disk, overwriting is slow and uneven. The file system does not reuse clusters in the order in which they were freed. A deleted file can sit untouched for months, or lose one cluster in the first minute. This gives four possible states, and you will meet all of them.

| State | The record | The content | What you can do |
|---|---|---|---|
| 1 | Survives | Survives | Recover the file exactly, and show it with a hash value |
| 2 | Survives | Partly overwritten | Recover a damaged file. The hash value will not match |
| 3 | Survives | Fully overwritten | Report that a file with this name, size and dates existed. Its content is gone |
| 4 | Reused | Survives | The content is in unallocated space with no name. Session 3 shows how to find it |

State 3 is the film from section 4, turned around: the trace of the event is there, and the content is not. State 2 is the dangerous one. The tool gives you a file with the right name and the right size. Part of it is the suspect's document, and part of it is something else. Only the hash value tells you.

A {% include term.html t="solid-state-drive" %} changes the picture. Its memory chips cannot overwrite a used block directly. The block must be cleared first, and clearing is slow. So the drive wants to know early which blocks are no longer needed, and to clear them in quiet moments. The command that tells it is {% include term.html t="trim" %}.

When a file is deleted on a modern system with a solid-state drive, the operating system sends TRIM for the file's blocks. The drive clears them when it chooses, often within seconds or minutes. From then on, reading those blocks returns zeros. The index entry may still be there, with the name, the size and the dates. The content behind it is gone.

Compare the two kinds of device over the same hour.

{% include demo.html id="S02-D4" %}

| | Hard disk | Solid-state drive with TRIM |
|---|---|---|
| What happens to deleted content | It stays until a new file happens to need that cluster | The drive is told at once, and clears the blocks soon |
| How long the content survives | Minutes to years | Often seconds to minutes |
| What remains afterwards | Often the record and the content | Often the record only |
| Does switching off stop it? | Yes: nothing changes without power | It stops while the power is off, and can continue when any power returns |

TRIM is not sent in every situation. Many USB sticks and memory cards do not support it. Many external drive cases do not pass it on. Older operating systems do not send it. The suspect's stick is a USB stick, and the computer in this training case stored its data as a hard disk does. So today's evidence behaves in the older way, and that is why your lab works. On a recent laptop, the same actions could leave you names and no content.

Two more things end recovery, and each has its own session. Wiping overwrites content on purpose, and encryption makes content unreadable without a key. Both belong to Session 4.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A tool recovers a deleted Word file. The name, the size and the dates are right, but Word cannot open it, and its hash value does not match the client's original. Which explanation fits best?</p>
  <ul class="qc-opts">
    <li data-key="a">The tool has a fault</li>
    <li data-key="b">The record survived, but some of the file's clusters have been reused by other files</li>
    <li data-key="c">The suspect changed the file before he deleted it</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The tool followed a true record to clusters that now hold other data in part. Option (c) could give a different hash value, but the file would still open. A file that will not open at all points to damaged content.</p></div>

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">On a laptop with a solid-state drive and TRIM, an examiner finds the MFT record of a file deleted last week. The clusters it points to hold only zeros. What can the examiner report?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing, because there is no content</li>
    <li data-key="b">That the file was empty</li>
    <li data-key="c">That a file with this name, size and dates existed and was deleted, and that its content is no longer on the drive</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The record is evidence by itself. It shows that the file existed, how large it was and when it was last changed. Option (b) is wrong because the record gives a size that is not zero. The missing content is a limit to state in the report, not a reason to stay silent.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>More about solid-state drives</summary>

**Why the drive clears blocks itself.** A solid-state drive writes in small units called pages and clears in larger units called blocks. To reuse a block, the drive moves any pages that are still needed to another place, and then clears the whole block. This housekeeping is called garbage collection, and the drive's own controller runs it. TRIM gives the controller the list of pages that it does not need to keep.

**What a read returns after TRIM.** Most modern drives promise that a trimmed block reads as zeros from the moment the command is accepted, even before the block is really cleared. For the examiner the result is the same: the tool reads zeros.

**Why this troubles the rule about not changing the original.** A write blocker stops the computer from sending writes to the drive. It cannot stop the drive's own controller, which runs whenever the drive has power. So a solid-state drive can go on clearing trimmed blocks while it is connected for imaging. The practical rule is to image it once, as soon as possible, and to record in your notes that the device is a solid-state drive.

**What survives TRIM.** The file's record in the index is not trimmed, so names, sizes and dates remain. Very small NTFS files whose content is stored inside the MFT record survive with it. Copies of the content in other places also survive, for example in a backup, in a cloud folder or on a USB stick.

**Wear levelling.** The controller spreads writes over all its blocks, so that no block wears out early. The place where the operating system thinks a sector is, and the place where the chips hold it, are therefore different and change over time. A normal image shows the first view only.

**Did overwritten data ever come back?** You may read that special equipment can recover overwritten data from a hard disk. For modern disks this is not a practical method, and guidance such as NIST SP 800-88 treats a single overwrite as enough to prevent recovery with laboratory techniques.
</details>

<div class="box key" markdown="1">

Recovery needs a surviving record or surviving content, and ideally both. Overwriting ends it slowly on a hard disk. TRIM can end it within minutes on a solid-state drive.

</div>

## 7. The lab: triage the suspect's disk and recover the documents

Your task: examine the file systems of the suspect's computer and his USB stick, recover the deleted documents, and show with hash values which of them are the client's confidential files.

You work in the Windows VM with Autopsy, FTK Imager and PowerShell. Allow about two hours.

<div class="box lms" markdown="1">

The evidence files, the prepared Autopsy case, the evidence register, a blank custody record and the client's reference list are in folder `S02` on the lab share. The Autopsy installer is in the `Tools` folder. If you are studying away from the lab, the LMS explains how to get the same files.

</div>

**The items.** Keep every file name exactly as it is.

| Exhibit | Files | What it is |
|---|---|---|
| `S02-001` | `cfreds_2015_data_leakage_pc.E01` to `.E04` | The image of the suspect's computer, in four parts |
| `S02-002` | `cfreds_2015_data_leakage_rm#2.E01` | The image of the USB stick found on the suspect |

Both come from the NIST CFReDS Data Leakage Case, which NIST publishes for training and tool testing.

**Two more files from the unit.**

- `S02-autopsy-case-PC.zip` is an Autopsy case that the unit has already built from exhibit `S02-001`. A full ingest of a 20 GB disk takes longer than this session, so a colleague ran it for you. You will open the result. Then you will run a complete ingest yourself on the smaller exhibit.
- `client-reference-list.csv` comes from the client. It lists every confidential document of the secret project, with its original name, its size and its hash values. `client-confidential-md5.txt` holds the same MD5 values in the form that Autopsy reads.

### Part A: start the long jobs first

Do these three steps as soon as the session opens. They run while you read sections 1 to 6.

1. In the Windows VM, create `C:\Evidence\S02` and `C:\Cases\S02`. Copy the two exhibits, the register, the custody record and the two client files into `C:\Evidence\S02`. Copy `S02-autopsy-case-PC.zip` into `C:\Cases\S02`.

   <div class="box expect" markdown="1">

   `C:\Evidence\S02` holds nine files: four parts of the computer image, one USB image, the evidence register, the custody record and the two client files. The copy takes several minutes, because the computer image is about 7 GB.

   </div>

   <div class="box trouble" markdown="1">

   If Windows reports that the disk is full, your VM has less than 25 GB free. Delete the Session 1 scratch files in `C:\Cases\S01`, empty the Windows Recycle Bin, and copy again. If the lab share is slow, copy to your host machine first and take the files through `\\VBOXSVR\nb6018`.

   </div>

2. Install Autopsy from `C:\Tools` with the default choices. Do not start it yet.

   <div class="box expect" markdown="1">

   Autopsy appears in the Start menu. The installer needs a few minutes.

   </div>

   <div class="box trouble" markdown="1">

   If the installer is not in `C:\Tools`, copy the `Tools` folder from the lab share again. Use the installer from the lab share and no other: a prepared case opens reliably only in the version that built it.

   </div>

3. Set every exhibit file to read-only, as you did in Session 1. Write entry 1 in the custody record: you received exhibits `S02-001` and `S02-002` from the lab share. Then start FTK Imager, add `cfreds_2015_data_leakage_pc.E01` as an image file, right-click it and choose **Verify Drive/Image**. Leave it running.

   <div class="box expect" markdown="1">

   A progress bar starts. FTK Imager finds parts `.E02` to `.E04` by itself. The check of 20 GB takes some time. You will read the result in Part B.

   </div>

   <div class="box trouble" markdown="1">

   If FTK Imager says that a segment is missing, one of the four parts did not copy or has a changed name. All four must be in the same folder with their original names.

   </div>

### Part B: verify what you received

{:start="4"}
4. When the verification of the computer image has finished, compare the MD5 and SHA1 values with the evidence register. Then add the USB image `cfreds_2015_data_leakage_rm#2.E01` and verify it in the same way.

   <div class="box expect" markdown="1">

   For each exhibit, three sources agree: the register, the value stored inside the E01 file, and the value that FTK Imager computed. The result window says **Match**. FTK Imager also reports the number of sectors: 41,943,040 for the computer and 7,821,312 for the stick.

   </div>

   <div class="box trouble" markdown="1">

   If a value does not match, stop and copy that exhibit again. If it still differs, tell the lecturer and do not continue with that file. You met this rule in Session 1, and it does not change.

   </div>

5. Add entry 2 to the custody record: both exhibits verified on receipt, with the tool and its version. Close FTK Imager.

   <div class="box expect" markdown="1">

   The record shows who has the exhibits, where they are and that their hash values were checked, before any examination starts.

   </div>

   <div class="box trouble" markdown="1">

   If you opened the exhibits in Autopsy before you wrote this entry, write it now and give the true order of events.

   </div>

### Part C: open the prepared case and read the disk's map

{:start="6"}
6. Right-click `S02-autopsy-case-PC.zip`, choose **Extract All**, and extract it into `C:\Cases\S02`. Start Autopsy, choose **Open Case**, and open `C:\Cases\S02\CFReDS-PC\CFReDS-PC.aut`.

   <div class="box expect" markdown="1">

   The case opens with a tree on the left. Under **Data Sources** you see `cfreds_2015_data_leakage_pc.E01`. No ingest starts, because the work was done when the case was built.

   </div>

   <div class="box trouble" markdown="1">

   If Autopsy says that the image is missing and asks whether you want to find it, choose **Yes** and select the `.E01` file in `C:\Evidence\S02`. This happens when your folder names differ from the ones in step 1. If Autopsy says that the case was made by a newer version, you installed the wrong installer: see step 2.

   </div>

7. Open the data source in the tree by selecting the small arrow beside it. Write the list of volumes in your notes.

   <div class="box expect" markdown="1">

   Four items, which are the four rows of the table at the start of section 1. `vol1` and `vol4` are marked **Unallocated**. `vol2` and `vol3` are marked **NTFS / exFAT (0x07)**, and they start at sectors 2,048 and 206,848. Here Autopsy uses "Unallocated" for unpartitioned space.

   </div>

   <div class="box trouble" markdown="1">

   If you see only one item, you opened the image as a file and not as a disk. Close the case and repeat step 6 with the `.aut` file.

   </div>

8. In your notes, answer two questions from what you see. Which kind of partition table does this disk use, and how do you know? How many sectors of the disk belong to no partition?

   <div class="box expect" markdown="1">

   The type code `0x07` and the absence of a protective entry point to an MBR. The unpartitioned sectors are the two ranges of 2,048 sectors, at the start and at the end of the disk.

   </div>

   <div class="box trouble" markdown="1">

   If you are not sure how to count, use the first and last sector numbers that Autopsy prints beside each volume. A range from 0 to 2,047 holds 2,048 sectors.

   </div>

### Part D: triage the file system

{:start="9"}
9. Open `vol3`, then `Users`, `informant`, `Desktop`. Select the Word file whose name begins with `Resignation_Letter`. In the lower pane, open the **File Metadata** tab.

   <div class="box expect" markdown="1">

   The tab shows the file's MFT record: that it is **Allocated**, its size, its dates, and near the end the list of sectors where its content is stored. This is the index speaking. The **Text** tab beside it shows the content. Record the size, and work out how many clusters the file uses and how much file slack it has.

   </div>

   <div class="box trouble" markdown="1">

   If the `Desktop` folder shows only a few items, that is correct. The suspect tidied his desktop before he left. Deleted items appear in the next step.

   </div>

10. In the tree, open **File Views**, then **Deleted Files**, then **File System**. Sort the list by the **Location** column. Look for the folder `$Recycle.Bin`.

    <div class="box expect" markdown="1">

    Autopsy lists a large number of deleted files, each with a red cross. Most are ordinary Windows housekeeping. Inside `$Recycle.Bin`, in a folder whose name ends in `-1000`, you find deleted files whose names begin with `$I` and `$R`. The suspect emptied the bin, so these are truly deleted.

    </div>

    <div class="box trouble" markdown="1">

    If the list is too long to read, type `$Recycle` in the filter box of the Location column, or use **Tools**, **File Search by Attributes** with the name `$I`.

    </div>

11. Select one `$I` file that ends in `.jpg`. Read it in the **Hex** or **Text** tab. Then select the `$R` file with the same letters after the `$R`, and open the **Application** tab.

    <div class="box expect" markdown="1">

    The `$I` file shows the original path of the deleted item. The `$R` file is the item itself. If its record and its clusters both survived, the picture appears. You have just recovered a deleted file: state 1 from section 6.

    </div>

    <div class="box trouble" markdown="1">

    If the picture does not appear, or the content is clearly something else, do not treat it as a failure. Write down the name and what you see. You have found state 2 or state 3, and you need one of those for the next step in any case.

    </div>

12. Find two contrasting examples among the deleted files, and record both in your notes: one file that is recovered whole, and one file whose name and size are listed but whose content is damaged, missing or clearly not its own.

    <div class="box expect" markdown="1">

    For each example your notes give the full path, the size, the dates, and one sentence on how you judged the content. Pictures are the easiest to judge, because they either display or they do not.

    </div>

    <div class="box trouble" markdown="1">

    If you meet files with long random names that are full of random bytes, note where they are and move on. They are the work of a tool that the suspect installed, and they belong to Session 4.

    </div>

13. In the tree, open **Analysis Results** and look for **Hashset Hits**. The unit built this case with the client's {% include term.html t="hash-set" %}, so every file on the computer whose MD5 value is on the client's list was marked.

    <div class="box expect" markdown="1">

    You see the number of files on the computer that are exact copies of a confidential document, with the path of each. Write the number and the paths in your notes. The number may be small, or zero.

    </div>

    <div class="box trouble" markdown="1">

    If there are no hits, that is a finding and not an error. Think about section 4: the suspect deleted the folder, and its records were reused. The documents may be in unallocated space with no name, or gone. Session 3 gives you the method to look further.

    </div>

### Part E: run your own ingest on the USB stick

{:start="14"}
14. In Autopsy, open **Tools**, **Options**, **Hash Sets**. Choose **Import Hash Set**, select `C:\Evidence\S02\client-confidential-md5.txt`, give it the name `Client confidential`, set its type to **Notable**, and choose **OK**.

    <div class="box expect" markdown="1">

    `Client confidential` appears in the list of hash sets. Autopsy may spend a moment building an index for it.

    </div>

    <div class="box trouble" markdown="1">

    If Autopsy does not accept the file, check that you selected the `.txt` file and not the `.csv` file.

    </div>

15. Choose **Case**, **Close Case**, then **New Case**. Name the case `S02-RM2`, set the base folder to `C:\Cases\S02`, and enter the case number `NB6018-S02` and your name as examiner. For the data source, choose **Disk Image or VM File** and select `cfreds_2015_data_leakage_rm#2.E01`. Make sure that **Ignore orphan files in FAT file systems** is *not* ticked.

    <div class="box expect" markdown="1">

    Autopsy moves to the page **Configure Ingest**.

    </div>

    <div class="box trouble" markdown="1">

    If you ticked the orphan option by mistake, the recovered files will not appear later. Remove the data source and add it again without the tick.

    </div>

16. On the **Configure Ingest** page, set **Run ingest modules on** to **All Files, Directories, and Unallocated Space**. Tick only these modules: **Hash Lookup**, **File Type Identification**, **Extension Mismatch Detector** and **Data Source Integrity**. In the settings of Hash Lookup, tick `Client confidential`. Choose **Next**, then **Finish**.

    <div class="box expect" markdown="1">

    A progress bar appears at the bottom right. This is the {% include term.html t="ingest" %}. It finishes in a few minutes, because the stick is small. Autopsy then reports that the image's hash value was verified.

    </div>

    <div class="box trouble" markdown="1">

    If the ingest runs for much longer, you left other modules ticked. The carving module is the slowest. It is the subject of Session 3, and you do not need it today. You can cancel it from the progress bar.

    </div>

17. Open the data source and read its volumes. Then open the FAT32 volume.

    <div class="box expect" markdown="1">

    The stick has one FAT32 volume of about 1 GB and a much larger range marked **Unallocated**: the unpartitioned space from section 1. Inside the volume, the top folder is almost empty, because of the quick format. A folder named `$OrphanFiles` holds what Autopsy found in the old folders.

    </div>

    <div class="box trouble" markdown="1">

    If there is no `$OrphanFiles` folder, look in **File Views**, **Deleted Files**, **All**. If nothing is there either, check the option in step 15.

    </div>

18. Open **Analysis Results**. Read **Hashset Hits**, and then **Extension Mismatch Detected**.

    <div class="box expect" markdown="1">

    Hashset Hits lists the recovered files whose content is exactly a confidential document. Their names do not look confidential at all: they look like pictures, music and diaries. Extension Mismatch Detected shows why: the type of the content does not agree with the ending of the name. The suspect renamed the files before he copied them. A hash value is calculated from content only, so the new names did not help him.

    </div>

    <div class="box trouble" markdown="1">

    If Hashset Hits is empty, the hash set was not ticked in step 16. Right-click the data source, choose **Run Ingest Modules**, and run Hash Lookup again with the set ticked. If Hashset Hits is shorter than the mismatch list, some recovered files are not exact copies of the client's documents. Step 21 deals with them.

    </div>

### Part F: recover, hash and match

{:start="19"}
19. In Hashset Hits, select all the files, right-click, and choose **Extract File(s)**. Accept the folder that Autopsy offers, `C:\Cases\S02\S02-RM2\Export`. Then extract any other recovered document that the mismatch list shows and the hit list does not.

    <div class="box expect" markdown="1">

    The `Export` folder holds the recovered files, with the names they had on the stick.

    </div>

    <div class="box trouble" markdown="1">

    If Autopsy adds a number in front of a name, two files had the same name. Keep both.

    </div>

20. Open PowerShell and calculate the SHA-256 value of every recovered file:

    ```powershell
    cd C:\Cases\S02\S02-RM2\Export
    Get-ChildItem -File | Get-FileHash -Algorithm SHA256 |
      Select-Object Hash, @{n='RecoveredName';e={Split-Path $_.Path -Leaf}} |
      Export-Csv ..\recovered-sha256.csv -NoTypeInformation
    Import-Csv ..\recovered-sha256.csv | Format-Table -AutoSize
    ```

    <div class="box expect" markdown="1">

    A table with one line for each recovered file: a SHA-256 value of 64 characters, and the name on the stick.

    </div>

    <div class="box trouble" markdown="1">

    If PowerShell cannot find the folder, check the case name in the path. If a name with square brackets causes an error, run the commands again exactly as written: `Get-ChildItem -File` handles such names.

    </div>

21. Match your values against the client's list:

    ```powershell
    $client = Import-Csv C:\Evidence\S02\client-reference-list.csv
    Import-Csv ..\recovered-sha256.csv | ForEach-Object {
      $hit = $client | Where-Object SHA256 -eq $_.Hash
      [pscustomobject]@{
        RecoveredName = $_.RecoveredName
        ClientDocument = if ($hit) { ($hit.OriginalName -join '; ') } else { 'NO MATCH' }
        SHA256 = $_.Hash
      }
    } | Export-Csv ..\S02-checkpoint.csv -NoTypeInformation
    Import-Csv ..\S02-checkpoint.csv | Format-List
    ```

    <div class="box expect" markdown="1">

    For each recovered file you see its name on the stick, the client's document that it really is, and the SHA-256 value that proves it. A file such as a "picture" or a "diary" turns out to be a design document or a technical review.

    </div>

    <div class="box trouble" markdown="1">

    If a recovered document shows `NO MATCH`, do not delete the line. Go back to section 4 and section 6, and write one sentence in your notes that explains how a recovered FAT file can differ from the original.

    </div>

22. Close the custody record. Add entries for the examination of each exhibit: the tool and its version, the case names, and the creation of the exported copies in `C:\Cases\S02\S02-RM2\Export`.

    <div class="box expect" markdown="1">

    Every action that touched an exhibit has an entry. The exported files are recorded as copies made by you, with the place where they are kept.

    </div>

    <div class="box trouble" markdown="1">

    If you find an action with no entry, add it at the end, mark it as a late entry and give the reason.

    </div>

### Checkpoint

Hand in `S02-checkpoint.csv`, your notes and your custody record. Your work passes when all four of these are true:

1. Your list names each confidential file that you recovered from the stick, with its name on the stick, the client's document that it matches, and its SHA-256 value.
2. Every SHA-256 value in your list is on the client's reference list, or the line is marked `NO MATCH` with your explanation.
3. Your notes give the partition layout of both exhibits and the two contrasting deleted files from step 12.
4. Your custody record has no gap.

The lecturer judges your list against the answer key that NIST publishes with the case. The key says which files can be recovered from the stick, so your list is right or wrong, not a matter of opinion.

This checkpoint helps with the phase test and the coursework. In the coursework you will recover a deleted object from cloud storage and must prove what you recovered in the same way.

### If you have time

Do the examination of the stick again in the Kali VM, with the Sleuth Kit on the command line. Autopsy runs the same engine underneath.

1. Copy the USB image into Kali. Run `ewfverify 'cfreds_2015_data_leakage_rm#2.E01'`. The quotation marks are needed because of the `#` in the name.
2. Run `mmls 'cfreds_2015_data_leakage_rm#2.E01'`. It prints the partition table. Note the start sector of the FAT32 partition. In the next commands, write that number in place of `START`.
3. Run `fsstat -o START 'cfreds_2015_data_leakage_rm#2.E01' | head -40`. Find the cluster size.
4. Run `fls -r -o START 'cfreds_2015_data_leakage_rm#2.E01' | less`. Find the entries under `$OrphanFiles`. The number after the type letters is the address of each entry.
5. Choose one entry. Run `icat -o START 'cfreds_2015_data_leakage_rm#2.E01' ADDRESS > recovered.bin`, with the entry's address in place of `ADDRESS`. Then run `sha256sum recovered.bin` and compare the value with your checkpoint list.

When the two tools give the same SHA-256 value for the same file, you have checked your result with a second tool, as you did in Session 1.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. A simple undelete tool brings back deleted files well on an NTFS volume and badly on an ext4 volume. Explain the difference.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
When NTFS deletes a file, the MFT record keeps the list of cluster runs, so a tool can follow it to the content. When ext4 deletes a file, it clears the list of ranges in the inode, so the tool has a name and dates but no record of where the content is. The points that earn marks: (1) NTFS leaves the location list in the record; (2) ext4 clears the location list in the inode; (3) on ext4 the tool must use the journal or search the unallocated space for the content.
</details>

**2. Explain the difference between RAM slack and drive slack, and say which one is more likely to hold old data on a modern Windows computer.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
RAM slack runs from the end of the file to the end of the sector in which the file ends, and drive slack is the whole sectors that remain in the file's last cluster. Modern Windows fills RAM slack with zeros and does not write to the drive slack, so the drive slack is the part that can hold old data. The points that earn marks: (1) RAM slack is the rest of the last used sector; (2) drive slack is the remaining whole sectors of the cluster; (3) drive slack keeps old data because nothing writes to it.
</details>

**3. On a laptop with a solid-state drive, an examiner finds the names and dates of deleted files but only zeros where the content should be. How should the report describe this?**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The report should state that records of the files exist, with their names, sizes and dates, and that their content is no longer on the drive, which is the expected result of TRIM on a solid-state drive. It should not say that the files were empty or that nothing was found, and it should say where copies of the content might still exist. The points that earn marks: (1) the records are evidence that the files existed; (2) the missing content is explained as a limit of the device, not as a fact about the files; (3) the report points to other sources, such as backups, cloud storage or removable media.
</details>

**4. Autopsy uses the word "Unallocated" for two different things in today's lab. Name both, and say how you would keep them apart in a report.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Beside a volume in the list under a data source, "Unallocated" means unpartitioned space: sectors that no partition covers. Inside a file system, it means unallocated space: clusters that the file system marks as free. The points that earn marks: (1) unpartitioned space is outside every partition; (2) unallocated space is free clusters inside a volume; (3) the report uses the two separate terms and gives sector or cluster numbers.
</details>

<div class="quiz" markdown="1">

## End-of-day quiz

This quiz closes Day 1. It covers Sessions 1 and 2. Write each answer in about two sentences before you open the model answer. Mark yourself on the points you made.

<div class="sa" markdown="1">

**Q1.** The unit makes three working copies of one forensic image, for three analysts. Explain how the custody record and the hash value together account for all three copies. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
Each working copy gets its own identifier and its own entries in the custody record, which show who holds that copy and where it is. Every copy must give the same hash value as the one recorded in the evidence register, which shows that all three hold the same content as the first image. **Points:** (1) the record follows each copy separately; (2) one recorded hash value ties every copy to the first image; (3) the record shows who held a copy and the hash shows what it contains, and neither can do the other's job.
</details>

</div>

<div class="sa" markdown="1">

**Q2.** A manager at the client company offers to "save time" by copying the suspect's Documents folder to a USB stick for the unit. Name two kinds of evidence that this copy would leave behind on the suspect's disk. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
A folder copy takes only the current files that the file system lists. It leaves behind the content of deleted files in unallocated space, and the old data in file slack, and it also misses anything in unpartitioned space and the file system's own records of deleted files. **Points:** (1) a file copy follows the index and takes current files only; (2) one correct place that is missed, such as unallocated space; (3) a second correct place, such as file slack, unpartitioned space or the records of deleted files.
</details>

</div>

<div class="sa" markdown="1">

**Q3.** A file of 6,000 bytes is stored on a volume with clusters of 4,096 bytes and sectors of 512 bytes. Calculate its file slack, and say what an examiner might find there. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The file needs two clusters, which is 8,192 bytes, so the file slack is 2,192 bytes: 144 bytes of RAM slack and 2,048 bytes of drive slack. The drive slack can hold the tail of whatever file used that cluster before. **Points:** (1) two clusters, 8,192 bytes; (2) 2,192 bytes of slack; (3) it may hold a fragment of older data, with no name or date attached.
</details>

</div>

<div class="sa" markdown="1">

**Q4.** A suspect removes a partition from the partition table of a disk, and the operating system now shows that part of the disk as empty. Explain why the files of that partition are still on the disk, and what an examiner needs in order to reach them. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The partition table is only a map of sector ranges, so removing an entry changes the map and leaves the sectors, with the file system and its files, exactly as they were. The examiner needs a forensic image of the whole disk and the first sector of the old partition, which can be found by searching the unpartitioned space for the start of a file system, or from the second copy of the table on a GPT disk. **Points:** (1) the table is a map, not the data; (2) the sectors of the old partition are unchanged and are in the image; (3) the examiner must find where the partition began.
</details>

</div>

<div class="sa" markdown="1">

**Q5.** Autopsy lists a deleted file with its full name, size and dates. When the examiner exports it, its hash value does not match the client's original. Explain how both facts can be true, and what the examiner can still report. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The file's record in the index survived, but some or all of the clusters that the record points to have since been given to other files, so the exported content is no longer the original content. The examiner can still report that a file with this name, size and dates existed on the device and was deleted, and must state that its content could not be recovered intact. **Points:** (1) the record and the content are stored separately and are lost separately; (2) the clusters were reused, so the content differs; (3) the record is still evidence that the file existed, and the limit is stated in the report.
</details>

</div>

</div>

## Coming next

You can now recover a deleted file while its record survives. In Session 3 the record is gone. You will learn to find content in unallocated space by its shape alone, and to rebuild a partition table that has been lost. Keep the film in mind, because Session 3 returns to it.
