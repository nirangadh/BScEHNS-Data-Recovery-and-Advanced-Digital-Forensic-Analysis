---
session_code: S15
description: "Mobile forensics on a provided extraction: why a phone is different evidence, the three kinds of extraction, the device states before and after first unlock, how Android and iOS store their data, how apps keep their records, the artefacts that answer case questions with their files and clocks, and how to check a parser's report against the source."
hook: >-
  The unit now learns to examine a phone. You have an extraction of a documented test phone:
  how was it taken, how does the phone store its data, and what do its records say,
  each with the file it comes from and the clock that wrote it?
outcomes:
  - "Explain why a phone is different evidence from a computer"
  - "Compare logical, full file system and physical extraction, and explain why encryption has made physical extraction far less useful"
  - "Explain how the states before and after first unlock decide which keys exist, and so what can be extracted"
  - "Identify the storage layout of Android (partitions, the user data file system, file-based encryption, app sandboxes) and of iOS (the APFS container and its volumes, data protection classes, app containers)"
  - "Identify how apps keep their records, in SQLite databases, property lists and XML preferences, and find the file behind an artefact"
  - "Apply ALEAPP to an extraction and answer case questions, each with its source file and its time in UTC"
  - "Justify a finding by checking a report line in its source file, opened read-only"
before:
  - "Explain what an [acquisition](../s01/#2-the-forensic-image-copy-everything-then-work-on-the-copy) is and why a forensic image is copied before anyone examines it (Session 1)"
  - "Verify a file against the [hash value](../s01/#3-the-hash-value-showing-that-nothing-changed) recorded in the evidence register (Session 1)"
  - "Explain what a [partition](../s02/#1-the-disk-has-a-map-sectors-and-partitions) and a [file system](../s02/#2-the-file-system-an-index-and-a-storage-area) are (Session 2)"
  - "Explain [encryption](../s04/#2-encryption-readable-only-with-the-key), the encryption key, and the difference between full-disk and file-level encryption (Session 4)"
  - "Normalise a time to [UTC](../s05/#8-one-clock-normalise-every-source-to-utc) with its time zone offset, and write a timeline (Session 5)"
demos:
  - id: S15-D1
    title: "Three extractions, one phone"
    file: s15-d1-three-extractions.html
    teaches: "Each kind of extraction reaches a deeper layer of the same phone, and the deepest layer comes back as unreadable data when the keys stay on the phone."
  - id: S15-D2
    title: "Before and after first unlock"
    file: s15-d2-first-unlock.html
    teaches: "The device state decides which keys are in memory, and so which files can be read, on Android and on an iPhone."
  - id: S15-D3
    title: "Two phones, side by side"
    file: s15-d3-two-phones.html
    teaches: "Android names each app's folder after the app, while an iPhone names it with a generated ID, and a metadata file inside the folder maps the ID back to the app."
  - id: S15-D4
    title: "From the screen to the row"
    file: s15-d4-screen-to-row.html
    teaches: "One visit on the phone's screen is traced to a file, a table, a row and a number, and the number becomes a time in UTC only when you know which clock wrote it."
  - id: S15-D5
    title: "A report line, checked"
    file: s15-d5-report-line-checked.html
    teaches: "A parser's report line is compared with the value in the source file, and the check shows what the parser added that the source never held."
slides: s15-mobile-forensics.pptx
evidence: "the examination subset of the documented test phone, its evidence register and the pre-computed report, in folder S15 on the lab share (the lab steps say exactly which files)"
---

Session 14 said the unit would turn to the suspect's phone next; the client's evidence holds no phone, so the unit learns mobile examination on a documented test phone, a researcher's published Pixel 7a with its own owner, accounts and dates.

**Be clear about what this phone is.** The extraction comes from a public collection of test phones made by Joshua Hickman, a digital forensics researcher. He set up a Google Pixel 7a on Android 14, gave it a made-up owner called Liz Dehner, and used about fifty apps on it between January and July 2024, keeping a record of what he did and when. Then the phone was extracted, and he published the result for training. Names, accounts and dates in this session are the dataset's own, shown exactly as recorded. Nothing on this phone belongs to the insider case.

**Why train on a test phone?** Because its record says what happened on it. When your report says a message arrived at a certain time, the unit can check you against the researcher's notes. That is the same reason the unit used documented datasets in every earlier session.

**Today is examination only.** You receive an extraction; you never touch a phone. How the extraction was taken still matters, because it decides what the file can and cannot hold, so sections 2 and 3 explain it.

## 1. Why a phone is different evidence

### The idea

A phone is not a small computer in a pocket. It differs from the suspect's computer in four ways that matter to an examiner.

It is **always on**. A computer is switched off at night. A phone keeps working, receiving messages and recording where it is, even while its owner sleeps.

It is **always with its owner**. A computer stays on a desk, so several people may use it. A phone travels in one pocket, and few people lend it. So a phone's records often describe one person's day more closely than any computer can.

It is **encrypted by default**. On the suspect's computer, encryption was something the user might turn on, as Session 4 showed. On a modern phone, encryption of the user's data is switched on from the first day, and the user cannot turn it off.

It is **full of app records that a computer never sees**. Messages in chat apps, location fixes, fitness data, photos with their places and times: most of them live only on the phone, or on the phone and in the app maker's cloud.

### How it works

| | The suspect's computer (Sessions 2 to 5, 14) | A modern phone |
|---|---|---|
| Power | Off when not in use | On almost all the time |
| Users | Possibly several, with profiles | Usually one person |
| Storage | A disk you can remove and image | A chip soldered inside, which you do not remove |
| Encryption | Optional, set up by the user | On from the start, and tied to the phone's own hardware |
| Where the records come from | The operating system and a few programs | The operating system and dozens of apps, each with its own records |
| Location | Rarely recorded | Recorded by the system and by many apps |
| A copy elsewhere | Sometimes, in a cloud drive (Session 14) | Often, in the phone maker's backup and each app's own service |

The last row connects to Session 14. Much of a phone's data also lives with a provider: a backup with Google or Apple, messages on a chat service's servers. Those copies are reached only through {% include term.html t="legal-process" %}, exactly as in Session 14. Today is about the copy on the phone.

**The test phone shows all four differences.** Its owner's Google account was added on the first day. It recorded a hike on 27 July 2024 in a fitness app, with hundreds of position fixes. It carries messages in more than twenty chat apps. And its user data was encrypted throughout, as on every phone that ships with a recent version of Android.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An examiner says: "A phone is just a small computer, so the methods of Sessions 2 to 5 apply unchanged." Which reply is best?</p>
  <ul class="qc-opts">
    <li data-key="a">Agreed: the file systems are the same, so the methods are the same</li>
    <li data-key="b">Disagree: phones keep no records that a computer does not also keep</li>
    <li data-key="c">Partly: the principles hold, but the storage cannot simply be removed and imaged, encryption is always on, and most records come from apps</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The principles of Session 1 still apply: copy, hash, record, examine the copy. But getting the copy is different, because the storage is soldered in and encrypted with keys held by the phone, and the records come mostly from apps. Option (a) ignores both. Option (b) is the reverse of the truth.</p></div>

</div>

<div class="box key" markdown="1">

A phone is always on, always with one person, encrypted by default and full of app records. The principles of Session 1 still hold; getting the data out and reading it are what change.

</div>

## 2. Extraction: the mobile word for an acquisition

### The idea

In Session 1, an {% include term.html t="acquisition" %} was the act of making a forensic image, or of collecting other digital evidence. On a computer, you remove the disk and copy every bit.

A phone does not allow that. Its storage is a chip soldered to the board, and the data on it is encrypted with keys that never leave the phone. So mobile examiners speak of an {% include term.html t="extraction" %}: getting the data out of the phone, or out of a service that holds its data, into a file you can examine.

**An extraction is an acquisition.** The word does not replace Session 1's term; it names the mobile way of doing one. Every rule of Session 1 still applies. The extraction gets a hash value the moment it exists, an entry in the evidence register, a chain of custody, and you examine a copy, never the original.

There are three kinds of extraction. They differ in how deep they reach.

### How it works

| Kind | How the data is obtained | What it holds | What it misses |
|---|---|---|---|
| {% include term.html t="logical-extraction" %} | The phone or its backup service hands over what it is designed to share, such as a backup | Contacts, messages, call logs, photos and the data of apps that allow backup | The private data of many apps, deleted records, system logs |
| {% include term.html t="full-file-system-extraction" %} | Software gains extra rights on the running phone, through an agent installed for the extraction or through a security flaw, and copies the whole file tree of the user's data | Every file of the user data, including each app's private folder and its databases, readable because the running phone decrypted them | Space that no file uses, so data that was deleted and left no trace inside a file |
| {% include term.html t="physical-extraction" %} | A bit-for-bit copy of the storage, read through the phone's own start-up code or straight from the chip | Everything stored, including unused space | Nothing is left out, but the user data is encrypted, and the keys stay inside the phone |

Use the demo to see each kind reach a deeper layer of the same phone.

{% include demo.html id="S15-D1" %}

**Why physical extraction has become far less useful.** A physical extraction is the closest thing to Session 1's forensic image, and for years it was the best kind. Encryption changed that. A modern phone encrypts its user data with keys made from two parts: a key stored in a protected part of the processor, and the user's passcode. Neither leaves the phone. So a bit-for-bit copy of the chip gives you every byte, but almost every byte of user data is unreadable. A full file system extraction, taken while the phone is running and has its keys in use, often gives you more readable evidence than a physical one.

**The test phone's extraction is a full file system extraction.** The researcher's notes do not say how the phone was extracted, but the extraction's own layout shows it: a file tree of the user data, with each app's private folder, and no copy of unused space. You will confirm this in the lab.

<div class="box metaphor" markdown="1">

**The comparison.** The three kinds of extraction are like three ways to collect the papers of an office building. A logical extraction is the receptionist handing over the folders she is allowed to share. A full file system extraction is being given the keys to every office and copying every paper in every drawer. A physical extraction is carrying away the whole building, brick by brick.

**Why it fits.** Each way reaches more than the one before. The receptionist shares only what the rules allow, as a backup does. The office keys open private rooms, as extra rights open each app's private folder. The bricks include every hidden corner, as a bit-for-bit copy includes unused space.

**Where it breaks.** In a real building, the bricks would give you everything. On a modern phone, every office keeps its papers in a locked safe, and the keys stay with the building's owner. Carrying away the bricks gives you the safes, still locked. That is why the deepest copy is no longer the most useful. There is a second break: the receptionist, the keys and the bricks are all choices made at the moment of extraction. You cannot go back and choose again once the phone has been switched off or reset.

**So what.** Before you read an extraction, write down which kind it is. Its kind tells you what you can and cannot find in it. A message missing from a logical extraction may still be on the phone; a deleted record missing from a full file system extraction may be gone from the files, or still inside a database, as Session 16 shows.

</div>

**The tools.** Commercial tools such as Cellebrite's, Magnet Forensics' GrayKey, MSAB's XRY and Oxygen Forensic Detective make extractions, and their makers keep their methods private. You will meet their names in reports and job advertisements. This module does not use them: the free tools ALEAPP, iLEAPP and Autopsy read the extractions those tools produce. The test phone was extracted with such a tool, and you read its result with free ones.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner receives two extractions of the same modern phone: a full file system extraction and a physical extraction. The phone's passcode is unknown. Which is likely to give more readable messages, and why?</p>
  <ul class="qc-opts">
    <li data-key="a">The physical extraction, because it holds every byte of the storage</li>
    <li data-key="b">The full file system extraction, because it was taken through the running phone, which had decrypted the files, while the physical copy is encrypted with keys that stayed in the phone</li>
    <li data-key="c">Both give the same messages, because they come from the same phone</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Holding every byte (a) does not help when the bytes are encrypted and the keys are missing. The two extractions reach different layers, so they do not give the same result (c).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How each kind of extraction is made, in more detail</summary>

**Logical.** On an iPhone, the classic logical extraction is the backup that Finder or iTunes makes; it can be encrypted with a backup password, and an encrypted backup holds more, such as saved passwords and health data. On Android, the old `adb backup` command once copied many apps' data, but Google has limited it over several versions; for apps built for Android 12 and later it no longer copies their data by default. Commercial tools also use small agent apps that read data through Android's normal interfaces.

**Full file system.** On an iPhone, the best-known route was checkm8, a flaw in the start-up code of the chips from the A5 to the A11 (the iPhone 4S to the iPhone X). It is in read-only memory, so Apple cannot fix it with an update, but it does not affect newer iPhones. Other routes use flaws in the software, or agents that need the phone unlocked. On Android, routes include flaws in the start-up chain of particular chipsets and temporary root access.

**Physical.** On older phones, examiners read the chip through test points on the board (JTAG, ISP) or removed the chip altogether (chip-off). These methods damage or risk the phone, need a laboratory, and on phones with modern encryption give mostly encrypted data.

**Cloud.** Some tools collect data from the phone maker's or an app's cloud service with the owner's credentials or a token found on the phone. That needs its own legal authority, because the data is not on the phone at all.
</details>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "We did an extraction, not an acquisition." | "We acquired the phone's data by a full file system extraction." | An extraction is one kind of acquisition, and the rules of Session 1 apply to it. |
| "A physical extraction always has the most evidence." | "A physical extraction has the most bytes; on an encrypted phone, a full file system extraction often has the most readable evidence." | Bytes are not evidence until they can be read. |
| "It is not in the extraction, so it was never on the phone." | "It is not in this extraction, which is of this kind." | Each kind of extraction misses something. |

</div>

<div class="box key" markdown="1">

An extraction is the mobile form of an acquisition. Logical, full file system and physical extractions reach deeper and deeper, but encryption keeps the deepest layer unreadable, so record the kind before you read the content.

</div>

## 3. Before and after first unlock

### The idea

A phone's keys are not always ready. When a phone is switched on, it has started, but most of the user's data is still locked: the keys that decrypt it are made only when the owner enters the passcode for the first time. This state is called {% include term.html t="before-first-unlock" %}, often shortened to BFU.

Once the owner has unlocked the phone once, those keys stay in the phone's memory, even when the screen locks again. This state is called {% include term.html t="after-first-unlock" %}, or AFU. The phone looks locked, but most of its data can be read by the running system, so that messages can arrive and alarms can ring while it sits in a pocket.

The state of the phone when it is seized decides what can be extracted from it. A phone in AFU can often give a full file system extraction even without the passcode. A phone in BFU usually gives very little: the system's own settings and a few files that apps chose not to protect.

### How it works

Both systems sort the user's files by when their keys are available.

| | Android | iPhone |
|---|---|---|
| Available from start-up, before any unlock | Device-encrypted storage: alarms, some system settings, and app data that the app asked to keep there | Files in the class "no protection", still encrypted, but with a key the phone always has |
| Available after the first unlock, until the phone restarts | Credential-encrypted storage: almost all app data, messages, photos | Files in the class "protected until first user authentication", the default for apps |
| Available only while the phone is unlocked | Not a separate class in normal use | Files in the class "complete protection", whose key is discarded shortly after the screen locks |

Try the demo, switching the phone between states.

{% include demo.html id="S15-D2" %}

**What this means for the people who seize a phone.** Restarting a phone, letting its battery run flat or turning it off moves it back to BFU, and the keys are gone until someone enters the passcode. So responders keep a seized phone powered and cut off from networks, so that nobody can wipe it remotely. Phone makers also add protections that push a phone back to BFU on purpose. Since iOS 18, an iPhone that nobody has unlocked for three days restarts by itself.

**You will not make these choices in this module.** But you will read their results. The state of the phone at extraction is part of the extraction's record, and it explains why some data is in it and some is not.

**The test phone was extracted after first unlock.** The researcher's notes do not say so, but the extraction shows it: it holds, readable, the app folders that only credential-encrypted storage can give. In a real case, you would find the state in the extraction tool's report or in the seizure notes.

<details class="deeper" markdown="1">
<summary>Where the keys come from</summary>

**Two parts.** On both systems, the key that protects the user's data is made from the passcode and a key that never leaves a protected part of the processor: the Secure Enclave on an iPhone, and a trusted execution environment or a separate security chip on Android phones, such as the Titan M chip in Pixel phones. Because the hardware key cannot be copied, the passcode can be guessed only on the phone itself, and the protected part slows down or blocks repeated wrong guesses. That is why examiners cannot simply copy an encrypted chip and try every passcode on a fast computer.

**Android's two storages.** File-based encryption (section 4) gives every user two storage areas. Device-encrypted storage uses keys available after start-up, so that the phone can ring an alarm before anyone unlocks it. Credential-encrypted storage uses keys made from the passcode at the first unlock. The paths that ALEAPP reads show which one a file came from: `/data/user_de/0/` for device-encrypted, `/data/user/0/` (also reached as `/data/data/`) for credential-encrypted.

**Apple's four classes.** Apple calls them classes A to D: complete protection (A), protected unless open (B, for files that must keep being written while the phone is locked), protected until first user authentication (C) and no protection (D). Apps choose a class for each file; if they choose nothing, it is class C.
</details>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A seized phone was kept switched on and in AFU, but at the laboratory its battery ran flat before the extraction. What has changed for the examiner?</p>
  <ul class="qc-opts">
    <li data-key="a">When the phone is charged and switched on again, it is in BFU: the keys made at the first unlock are gone, and most app data cannot be extracted without the passcode</li>
    <li data-key="b">Nothing: the data is still on the chip, so the same extraction is still possible</li>
    <li data-key="c">The data has been erased, because a flat battery wipes an encrypted phone</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The data is still on the chip (b), but it is encrypted, and the keys that the first unlock made were only in memory. Nothing was erased (c); it was locked again.</p></div>

</div>

<div class="box key" markdown="1">

Before first unlock, most keys do not exist yet; after first unlock, they stay in memory until the phone restarts. The state at seizure decides what any extraction can hold.

</div>

## 4. Android storage: partitions, a file system and one folder per app

### The idea

An Android phone's storage chip is divided into {% include term.html t="partition" %}s, as Session 2's disk was. Most of them hold the system: the start-up code, the operating system, the radio's software. They are the same on every phone of the model, and they are signed by the maker, so an examiner rarely needs them.

One partition holds everything that belongs to the user: the user data partition, which the running phone mounts at `/data`. Every app's records, every photo and every message lives here. This is the partition that a full file system extraction copies.

The user data partition has a {% include term.html t="file-system" %}, as every volume in Session 2 did. On Android it is ext4, the usual file system of Linux, or {% include term.html t="f2fs" %}, a file system designed for flash storage. Which one depends on the phone's maker. A full file system extraction copies the files, not the file system, so you will rarely see which one it was.

### How it works

**The user data is encrypted file by file.** Android uses {% include term.html t="file-based-encryption" %}: each file is encrypted with its own key, made from one of the two storage keys of section 3. Session 4 taught {% include term.html t="file-level-encryption" %}, which encrypts single files or folders and leaves the rest of the volume readable. Android's file-based encryption is file-level encryption applied by the system to the whole user data partition: every file, and every file name, is encrypted, and nothing is left readable by choice. A further layer, metadata encryption, also protects the file system's own records, such as sizes and permissions.

So why can you read the test phone's files? Because the extraction was taken through the running phone in AFU. The phone decrypted each file as it was copied. The extraction holds the readable files, and the encryption of section 3 is no longer between you and them.

**Each app has its own locked folder.** When an app is installed, Android gives it its own identity and its own private folder, which no other app may read. This is the {% include term.html t="app-sandbox" %}. The folder is named after the app's {% include term.html t="package-name" %}, its unique name written like a web address backwards. On the test phone:

| What you see on the screen | Package name | Private folder in the extraction |
|---|---|---|
| Threema (a chat app) | `ch.threema.app` | `data/data/ch.threema.app/` |
| Opera (a browser) | `com.opera.browser` | `data/data/com.opera.browser/` |
| Calculator (a vault app that hides pictures and notes behind a working calculator) | `com.calculator.lock.hide.photo.video` | `data/data/com.calculator.lock.hide.photo.video/` |

Look at the third row. On the screen, the app called itself "Calculator". Its package name tells you what it really does. The label is chosen to hide; the package name is how the system knows the app, and the app's maker cannot change it once the app is published.

**Inside each private folder**, apps follow the same habits:

| Folder | What it usually holds |
|---|---|
| `databases/` | The app's SQLite databases: messages, contacts, history |
| `shared_prefs/` | The app's settings, in XML files |
| `files/` | Anything else the app writes: keys, logs, downloaded media |
| `cache/` | Temporary copies, which the system may delete at any time |

**Some data is shared on purpose.** Photos, downloads and documents that the user should see from any app live in shared storage, at `data/media/0/` in the extraction. The user sees it as the phone's internal storage, the folder that contains `DCIM` for the camera and `Download`. The system keeps its own records in `data/system/`, `data/system_ce/0/`, `data/system_de/0/` and `data/misc/`: accounts, saved Wi-Fi networks, app usage.

<div class="box metaphor" markdown="1">

**The comparison.** The app sandbox is like a block of flats. Each tenant has a flat with a lock, and no tenant has a key to another's flat. The front of the building has a shared hall with a notice board and post boxes.

**Why it fits.** Each app is a tenant, its private folder a flat, and the lock the rule that stops other apps from reading it. Shared storage is the hall: anything put there can be seen by every tenant who has permission.

**Where it breaks.** In a block of flats, the tenants do not know the landlord's keys. On a phone, the landlord, the operating system, holds a key to every flat and uses it all the time: to back up, to show notifications, to scan for malware. A full file system extraction borrows the landlord's keys. There is a second break: tenants can hand each other things through the landlord, so an app's records can also turn up in another app's folder or in the system's own folders, such as a photo the chat app saved to shared storage.

**So what.** Look for an app's records first in its own folder, then in shared storage and the system's folders. When the report names a file, its path tells you which flat it came from.

</div>

**Two layers of encryption, not one.** The system's file-based encryption is removed by an AFU extraction. But an app may also encrypt its own data, inside its own folder, with its own key. Threema does: its message database, `threema4.db`, does not start with the signature `SQLite format 3` that every ordinary SQLite database starts with. Its first bytes look random. You met this test in Session 3, where a {% include term.html t="file-signature" %} told you what a file is. A database without its signature, in an app that is known to encrypt, has been encrypted by the app. The key is in a file called `key.dat` in the same sandbox, and ALEAPP can use it, as long as the user did not protect it with an extra passphrase.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">In an Android extraction, an examiner finds the folder <code>data/data/com.example.notes/</code>. On the phone's screen, the app's icon was labelled "Weather". What should the examiner conclude?</p>
  <ul class="qc-opts">
    <li data-key="a">The folder belongs to a different app, because the names do not match</li>
    <li data-key="b">The label is the true name, so the package name is wrong</li>
    <li data-key="c">The folder belongs to the app the screen calls "Weather"; its package name suggests a notes app, and the difference is worth examining, as with the test phone's calculator vault</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The system names the private folder after the package name, so the folder and the app belong together, whatever the label says (a). Labels are free text chosen by the app's maker or the user (b). A mismatch is not proof of hiding, but it is a reason to look inside.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Partitions, slots, users and other details</summary>

**Slots and the super partition.** Many recent phones keep two copies of the system partitions, slot A and slot B, so that an update can be written to one while the phone runs from the other. Since Android 10, most system partitions also sit inside one large partition called `super`, divided by the system at start-up. None of this changes the user data partition.

**The `metadata` partition.** A small partition that holds the keys for metadata encryption. Without it, even the file system's structure on `/data` cannot be read.

**More than one user.** Android supports several users and a work profile. User 0 is the owner. A second user's data is under `data/user/10/` and similar numbers, and a work profile's apps have their own sandboxes there. ALEAPP reports the user number with each record where it can.

**Two paths, one folder.** `/data/data/<package>` and `/data/user/0/<package>` are the same folder: the first is the older path, kept for compatibility. Device-encrypted app data is under `/data/user_de/0/<package>`. An extraction may show the same file under more than one path; a good parser reads it once.

**APK files.** The apps themselves are in `data/app/`. Their code can tell an examiner how an app stores its data, which is how parser authors work out what a column means.
</details>

<div class="box key" markdown="1">

On Android, the user data partition at `/data` holds everything of the user's, encrypted file by file. Each app keeps its records in a private folder named after its package name, and an app may add its own encryption inside it.

</div>

## 5. iOS storage: a container, volumes and folders with generated names

### The idea

An iPhone uses Apple's file system, APFS. APFS does not give each file system its own partition. Instead, one large area of the storage, the {% include term.html t="apfs-container" %}, holds several file systems, and they share the container's free space between them.

Each file system inside the container is called a {% include term.html t="volume" %}. In Session 2, a volume was a partition that holds a file system. APFS keeps the word but changes one thing: its volumes do not each own a partition. They are separate file systems that grow and shrink inside the one container.

Two volumes matter. The System volume holds the operating system. It is sealed: Apple signs it, and the phone checks the seal at start-up, so it cannot be changed without the change showing. The Data volume holds everything of the user's, mounted at `/private/var`. As on Android, this is the volume that a full file system extraction copies.

### How it works

**Every file has a protection class.** iOS encrypts each file with its own key, and each key is protected by one of four {% include term.html t="data-protection-class" %}es that you met in section 3. The class decides when the file can be read: always, after the first unlock, or only while the phone is unlocked. A file's class is set by the app that writes it. This is why an AFU extraction of an iPhone holds most app data, but not files that an app put in the strictest class.

**Each app has a container, named by a generated ID.** On an iPhone, an app's private folder is its {% include term.html t="app-container" %}. Unlike Android, the folder is not named after the app. It is named with a long generated ID, such as:

```
/private/var/mobile/Containers/Data/Application/4F1C2E9A-7B3D-4C6E-9A10-2D5E8B7C1F34/
```

The ID tells you nothing about the app. To find out which app owns a container, you read a small hidden file inside it:

```
.com.apple.mobile_container_manager.metadata.plist
```

That file holds the app's bundle identifier, Apple's equivalent of the package name, such as `com.example.chat`. iLEAPP reads these files for you and lists every container with its app.

An app usually has more than one container. Its program sits in a bundle container, its private data in a data container, and data it shares with its own extensions, such as a widget, in a shared group container. Each has its own generated ID.

Use the demo to set the two phones side by side.

{% include demo.html id="S15-D3" %}

<div class="box metaphor" markdown="1">

**The comparison.** iPhone app containers are like lockers at a swimming pool. Each locker has a number, not a name. The number is printed on a tag inside the locker, and the attendant's ledger says whose locker it is.

**Why it fits.** The folder's generated ID is the locker number. The metadata file inside the container is the tag. iLEAPP is the attendant who reads every tag and writes the ledger.

**Where it breaks.** A swimmer keeps the same locker all afternoon. An app gets new generated IDs when it is deleted and installed again, and its old container is removed with its old data. So the ledger is true only for the moment of the extraction. A second break: the tag can be missing. If a container has lost its metadata file, you must identify it from what it contains, such as the names of its databases.

**So what.** Never write a container's generated ID in a report without the app it belongs to, and never carry an ID from one extraction to another phone or to a later extraction of the same phone. Write the bundle identifier, and say how you linked it to the folder.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner compares two iPhone extractions of the same phone, made a month apart. The chat app's data container has a different generated ID in each. What is the most likely reason?</p>
  <ul class="qc-opts">
    <li data-key="a">One of the two extractions has been altered, so its hash value must be checked again</li>
    <li data-key="b">The app was deleted and installed again between the two extractions, which gave it new containers; the metadata files will show the same bundle identifier</li>
    <li data-key="c">iOS gives every container a new ID each time the phone restarts</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Reinstalling an app gives it new containers, and that is a finding in itself: its data before the reinstall is gone from the phone. Hashes (a) are always checked, but a new ID is normal behaviour, not a sign of tampering. Restarting (c) does not change the IDs.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The other volumes, and two records an examiner meets often</summary>

**Other volumes.** Besides System and Data, an iPhone's container holds small volumes such as Preboot (start-up files), VM (memory paging), Update and a few for the hardware. They rarely hold user evidence.

**Snapshots.** APFS can keep read-only snapshots of a volume, which the system uses during updates. A snapshot holds files as they were when it was made.

**The keychain.** Saved passwords and tokens are not in the apps' containers; they are in the keychain, a separate encrypted store with its own protection classes. A full file system extraction may include it, decrypted only for the items its state allows.

**Where the system writes its records.** Messages from the phone's own Messages app and the index of photos and their metadata are in these two databases:

```
/private/var/mobile/Library/SMS/sms.db
/private/var/mobile/Media/PhotoData/Photos.sqlite
```

iLEAPP lists the exact path for every record it reads.
</details>

<div class="box key" markdown="1">

An iPhone keeps the user's data in the Data volume of one APFS container. Each file has a protection class, and each app's data sits in a container named by a generated ID, which only the metadata file inside it links to the app.

</div>

## 6. How apps keep their records

### The idea

Most of an app's records are kept in three kinds of file. Learn to recognise them, and you can read almost any app's private folder, on either system.

A {% include term.html t="sqlite-database" %} is a whole database in one ordinary file. It holds tables, and each table holds rows: one row per message, per contact, per visit. Most apps on both systems, and many programs on computers, use SQLite. You read one in Session 14: Chrome's `History` file.

A {% include term.html t="property-list" %} is Apple's file format for settings and small records. It holds named values in an XML text form or in a compact binary form, which starts with the bytes `bplist00`.

Android apps keep their settings in {% include term.html t="shared-preferences" %}: XML files in the app's `shared_prefs` folder, each value with a name.

### How it works

**A database file rarely travels alone.** Next to `History` you will often find `History-journal`, or next to `threema4.db` the files `threema4.db-wal` and `threema4.db-shm`. These are part of the database: SQLite writes changes there first. A copy of the database without them can show an older state, or miss the newest rows. So when you copy a database out of an extraction, copy its companion files with it. How these files work, and why they can hold deleted records, is Session 16's subject.

**A settings file is plain to read.** Here are two lines from Threema's shared preferences on the test phone:

```xml
<string name="identity">T4UFS63T</string>
<string name="nickname">Liz D</string>
```

The first is the user's Threema ID, the second the name she showed to others. Nothing needs converting: the file names its values. That is why settings files often answer the question "which account was this?"

**Some apps use other formats.** You will meet them in the report, and you only need to recognise their names today.

<details class="deeper" markdown="1">
<summary>Protobuf, LevelDB and other formats</summary>

**Protocol Buffers (protobuf).** A compact binary format from Google. Android's own app usage records since Android 10, and many Google apps' records, are kept in it. The bytes carry field numbers, not field names, so a parser needs to know what each number means; ALEAPP includes such knowledge for the files it supports, and can show unknown messages as numbered fields.

**LevelDB.** A key-value store kept as a folder of several files, used by apps built on Chromium for the web pages' local storage. One record can be spread over several files, and old values remain until the files are merged.

**Realm and JSON.** Some apps use the Realm database, with its own file format, or keep their records as JSON text, sometimes compressed.

**App-level encryption.** As section 4 showed with Threema, an app can encrypt its own database. The SQLCipher library is common for this. A database without its signature is the sign to look for.
</details>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "I copied the database." | "I copied the database and its journal or WAL files." | The companion files hold changes that may not yet be in the main file. |
| "The database is corrupt; it will not open." | "The file has no SQLite signature; it may be encrypted by the app." | An app-encrypted database looks like random data. |
| "Settings are not evidence." | "Settings files often name the account, the user name and the app's options." | Session 14 showed that ordinary records become evidence in context. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">An examiner exports an app's database from an extraction, opens it in DB Browser for SQLite, and finds no messages after 9 March, although the app's notification records show messages until 12 March. The folder also held the files <code>msgstore.db-wal</code> and <code>msgstore.db-shm</code>, which were not exported. What is the first thing to try?</p>
  <ul class="qc-opts">
    <li data-key="a">Export the database again together with its WAL and SHM files, keep the original names side by side, and open the copy read-only</li>
    <li data-key="b">Conclude that the messages after 9 March were deleted by the user</li>
    <li data-key="c">Report that the app does not store recent messages on the phone</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The newest changes may still be in the WAL file, which the main file does not yet include. Conclusions about deletion (b) or the app's behaviour (c) come only after the complete set of files has been read.</p></div>

</div>

<div class="box key" markdown="1">

Apps keep their records in SQLite databases, property lists and XML preferences. Copy a database with its companion files, and treat a database without its signature as possibly encrypted by the app.

</div>

## 7. The artefacts that answer case questions

### The idea

An examiner opens a phone's extraction with questions, not with a list of files. Who did the owner talk to, and when? Where was the phone? Which apps were used, and when? Which accounts and networks did it know? Each question has typical sources, and each source has its own clock.

The clock matters as much as the record. Session 5 taught you to normalise every time to UTC with its {% include term.html t="time-zone-offset" %}. On a phone, you must first know what a number means: which clock wrote it, in which unit, counted from which starting point.

### How it works

| Question | Typical source on Android | Typical source on iPhone | Its clock |
|---|---|---|---|
| Messages (the phone's own SMS app) | `mmssms.db` of the telephony provider, in device-encrypted storage | `sms.db` | Milliseconds since 1970 in UTC (Android); seconds or nanoseconds since 2001 in UTC (iPhone) |
| Messages (chat apps) | Each app's database in its sandbox | Each app's database in its container | The app's choice: usually milliseconds since 1970, with separate times for sent, delivered and read |
| Calls | `calllog.db` of the contacts provider | `CallHistory.storedata` | Milliseconds since 1970 (Android); seconds since 2001 (iPhone) |
| Contacts | `contacts2.db` | `AddressBook.sqlitedb` | Contacts carry few times |
| Locations | App databases, such as a fitness app's track points; the location fields of photos | App databases; the system's location caches; the location fields of photos | Usually milliseconds since 1970, one time per fix |
| App usage | `usagestats` files of the system (protobuf) | The system's usage records (`knowledgeC.db` on older versions, newer formats since) | Milliseconds since 1970 |
| Accounts | `accounts_ce.db` and `accounts_de.db` of the system | `Accounts3.sqlite` | Often no time at all |
| Wi-Fi networks | `WifiConfigStore.xml` | A property list of known networks | Some networks carry the time they were added or last joined |
| Photo metadata | EXIF fields inside each picture; the media index `external.db` | EXIF fields; `Photos.sqlite` | EXIF time is the camera's local time, sometimes with its offset; the media index uses UTC |

Treat the table as a map, not as a fixed list. Paths change between versions, and each app makes its own choices. ALEAPP and iLEAPP name the exact file for every record they show, on the extraction in front of you.

**Five kinds of clock you will meet.** Phones count time in many ways, and a number means nothing until you know which:

| You see | It is | Example on the test phone |
|---|---|---|
| A 13-digit number such as `1714253692905` | Milliseconds since 1 January 1970, UTC (Unix time in milliseconds) | Private Photo Vault's `last_update` |
| A 17-digit number such as `13365375162964931` | Microseconds since 1 January 1601, UTC, as in Chrome in Session 14 | Opera's history, because Opera is built on Chromium |
| A number around 700 to 800 million, often with a decimal part | Seconds since 1 January 2001, UTC (Apple's own time) | Common in iPhone databases |
| Text with an offset, such as `2024-04-27T17:34:52.905-04:00` | A local time with its offset written in | Private Photo Vault's `creation_date` |
| Text without a time zone, such as `04-02-2024` | Whatever the app wrote, with no clock stated | The calculator vault's note date |

The last row is the dangerous one. Section 9 shows why.

**A record and its clock, traced.** Before the demo, here is one fact from the test phone. On 13 July 2024, the researcher typed `mlb.com` into Opera at 16:12 local time. His notes give that time in Eastern Daylight Time, UTC-4. Follow it from the screen to the row:

{% include demo.html id="S15-D4" %}

**Times that the person did not choose.** Many app records carry more than one time. A Threema message on the test phone has the time it was created, the time it was delivered to the other phone and the time it was read there. The first was written by the sender's phone. The second and third were reported back by the other side. So one row holds clocks from two phones and a server. Write which time you used.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A chat app's database stores a message time as <code>1720901562964</code>. Which reading is correct?</p>
  <ul class="qc-opts">
    <li data-key="a">Seconds since 1 January 2001, Apple's time, because it is a long number</li>
    <li data-key="b">Microseconds since 1601, Chrome's time, because it is a long number</li>
    <li data-key="c">Milliseconds since 1 January 1970, UTC: 13 digits is the usual length of that count for recent dates, and it gives 13 July 2024 at 20:12:42 UTC</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The number of digits is the first clue. Apple's seconds since 2001 have 9 digits for recent dates (a). Chrome's microseconds since 1601 have 17 digits (b). Always convert one value and check that the result is a sensible date before you trust the reading.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Converting the clocks in SQLite</summary>

In DB Browser for SQLite, on the tab **Execute SQL**, these expressions turn each kind of number into a readable UTC time. Replace `t` with the column name:

```sql
datetime(t/1000, 'unixepoch')                     -- milliseconds since 1970
datetime(t, 'unixepoch')                          -- seconds since 1970
datetime(t/1000000 - 11644473600, 'unixepoch')    -- microseconds since 1601 (Chrome, Opera)
datetime(t + 978307200, 'unixepoch')              -- seconds since 2001 (Apple)
datetime(t/1000000000 + 978307200, 'unixepoch')   -- nanoseconds since 2001 (newer Apple records)
```

The number 978307200 is the count of seconds from 1 January 1970 to 1 January 2001. The number 11644473600 is the count from 1 January 1601 to 1 January 1970, as in Session 14. Each result is in UTC, so add no offset before you compare it with your timeline.
</details>

<div class="box key" markdown="1">

Every case question has typical sources, and every source has its own clock. Name the file and the clock with every time you write, and convert to UTC only when you know which clock you are reading.

</div>

## 8. The most candid witness

### The idea

You have now seen how much a phone records: messages and when they were read, every page and when it was opened, where the phone was every few seconds on a walk. No diary is so complete. That raises a question about what a phone is, for the person who carries it.

<div class="box lens" markdown="1">

**Through another lens: the extended mind.** In 1998 the philosophers Andy Clark and David Chalmers asked where the mind stops. Their example: Inga wants to visit a museum, remembers its address and walks there. Otto has a memory illness, so he writes everything in a notebook he always carries. He reads the address in the notebook and walks there. Clark and Chalmers argued that the notebook plays the same part for Otto that memory plays for Inga. It is always with him, he trusts it, and he uses it without a second thought. So, they said, the notebook is part of how Otto thinks.

A phone is Otto's notebook for almost everyone. People do not remember numbers, routes or the times of their meetings; the phone does it for them. In that sense, examining a phone is reading part of a person's mind, which is why it can be so revealing, and why it calls for so much care.

**Where it breaks.** Otto chooses what he writes in his notebook. A phone records far more than its owner chose to remember. On the test phone, the browser history for the afternoon of 13 July 2024 holds 25 addresses. Seven are pages the user opened. The other eighteen are hidden rows: requests that the pages made by themselves, in the same seconds, to advertising and tracking addresses, a cookie-consent service, embedded story frames and a social-media widget. The user never typed, saw or chose any of them. Much of the rest of the phone is the same. The read time of a message is reported by the other person's phone. A location fix is written by an app running in the background. Much of what the phone "remembers" was written by apps, not by the person.

**The question it raises.** When a report says "she visited" or "she read", is the record the person's own memory, or something an app wrote about her?

</div>

### How it works

The break is what the examiner must remember in practice. Each record has an author, and the author is often not the phone's owner:

| Record on the test phone | Written by |
|---|---|
| The typed visit to `mlb.com` in Opera | The browser, after the user typed it |
| The hidden rows for tracking addresses in the same second | The browser, at the request of the page's own code |
| A Threema message's created time | The phone, when the user pressed send |
| The same message's read time | The other person's phone, reported back |
| A track point during the hike | The fitness app, every few seconds, without a touch |

So a sentence in a report should name the author of the record: "the browser recorded a typed visit", not just "she visited".

<div class="box key" markdown="1">

**The pivotal idea.** The phone is the most candid witness a person carries. It records more than its owner chose to remember, and much of it was written by apps, not by the person.

</div>

## 9. Parsing and checking: the report line is a claim

### The idea

A full file system extraction of the test phone holds hundreds of thousands of files. Nobody reads them one by one. A {% include term.html t="parser" %} reads the files it knows and turns them into readable records. For phones, the best-known free parsers are ALEAPP, for Android, and iLEAPP, for iPhones, written by Alexis Brignoni and many contributors. Each reads an extraction and writes a report: one page per kind of record, with the path of the file it came from.

A report line is a claim until you check it. You have met this idea twice. In Session 8, an IDS alert was a hypothesis, not a finding, until the traffic showed what the rule only suggested. In Session 13, a finding was stronger when two records of one event agreed. A parser's line is in the same position: it is what a program says a file contains.

### How it works

**What the report gives you.** For each kind of record, ALEAPP shows a table and a line "located at", with the path of the source file inside the extraction. It also saves each table as a TSV file, which a spreadsheet can open, and a timeline of every dated record. The report reads only the files that its modules know. A section that is missing does not mean the phone held no such data.

**Three ways a parser can mislead.**

1. **It can add what the source never held.** On the test phone, ALEAPP's page for the calculator vault's notes shows a "Note Date" of `2024-02-04 00:00:00+00:00`. The database holds only the text `04-02-2024`: a date, with no time and no clock. The parser restates the date as midnight UTC, so that the row can be sorted with the others, and shows the text it read in a second column. Someone who copies only the first column writes a precise time that nobody recorded.
2. **It can miss what it does not understand.** Apps change how they store their data with each new version. A parser written for one version may find no rows in the next, or read a column with a new meaning in the old way. The report then shows nothing, or shows something wrong, without warning.
3. **It can label a record by its own rules.** In Session 14, Autopsy listed Internet Explorer 11's records under "Microsoft Edge", because one module reads both. A label is the parser's choice, not the source's.

Run the demo to check one report line against its source.

{% include demo.html id="S15-D5" %}

**How to check a report line.** Six steps, the same for any line:

1. Note the line and the path in its "located at" line.
2. Copy that file out of the extraction, with its companion files, into your case folder. Record the copy's hash value.
3. Open the copy read-only: DB Browser for SQLite's **Open Database Read Only** for a database, a text editor for XML.
4. Find the row or the value the report used.
5. Read the raw value and decide which clock it uses (section 7). Convert it yourself.
6. Compare: does the source say what the report says, no more and no less?

<div class="box metaphor" markdown="1">

**The comparison.** A parser is like an interpreter who translates a witness's statement into your language.

**Why it fits.** You cannot read the witness's language, the raw bytes of the file, quickly enough yourself. The interpreter knows it and gives you sentences you can use. A good interpreter is right almost every time, and you depend on it.

**Where it breaks.** A human interpreter who adds a detail usually knows they have done so. A parser may add a precise time to a date without any warning in the main column, may skip a sentence it does not understand, and may translate a new dialect with old rules. And unlike a witness, the file can be read again by anyone. So you can always go back to the original words, and in a report you must, for any line that carries weight.

**So what.** Use the report to find the evidence, and the source file to state it. For every finding that matters, check at least one line in its source, and write which tool and version produced the report.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">ALEAPP's report on a phone shows no section for a chat app that the owner used every day. Which statement is best?</p>
  <ul class="qc-opts">
    <li data-key="a">The phone holds no messages from that app</li>
    <li data-key="b">The report holds no messages from that app; the examiner should look for the app's folder in the extraction and check whether this version of ALEAPP supports this version of the app</li>
    <li data-key="c">The messages were deleted, because a daily app always has records</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A missing section shows only what the parser found. The app's folder may be there, unread, because the parser has no module for the app or for its newest version (a). Deletion (c) is one explanation among several, and needs its own evidence.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Versions, a second tool, and the parsers' own notes</summary>

**Write the versions.** A finding should name the parser and its version, such as "ALEAPP 2026.4.3", and, where the report shows it, the version of the app whose records were read. When a parser is updated, the same extraction can give a different report.

**A second tool.** Autopsy's Android Analyzer, and its module that runs ALEAPP inside Autopsy, give a second reading of the same files, by a different route. Two tools that agree are stronger than one, as Session 13's two records were; two tools that disagree tell you exactly which file to open.

**The parsers explain themselves.** ALEAPP's modules carry notes that say what each column is and how a value was decoded. The calculator vault module, for example, explains that its date is stored as text, day first, and is the date of the note's latest save, not necessarily the day it was written. Reading those notes is part of checking a line.

**iLEAPP.** It reads an iPhone's full file system extraction, a backup made by Finder or iTunes, or an archive from a commercial tool. Its report has the same layout as ALEAPP's.
</details>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "ALEAPP shows the note was written at midnight." | "The note's database holds the date 4 February 2024, with no time; ALEAPP shows it as midnight UTC." | The time is the parser's, not the source's. |
| "The report proves it." | "The report shows it; I checked it in the source file at this path." | A report is a reading, not the evidence. |
| "No section, no data." | "No section in this report from this version." | Parsers read only what they know. |

</div>

<div class="box key" markdown="1">

A parser's report line is a claim about a file. Use the report to find the evidence, and check every finding that matters in its source file, opened read-only, with its clock converted by you.

</div>

## 10. The lab: examine the test phone's extraction

Your task in one line: verify the test phone's extraction, find how its data is laid out, run ALEAPP on it, answer six case questions with their source files and clocks, check two report lines in their sources, and write your findings with their confidence.

You need the Windows VM, PowerShell, a web browser, DB Browser for SQLite, Notepad, your shared folder, and the files from folder `S15` on the lab share. Kali and REMnux stay off. Allow about an hour and forty-five minutes.

**ALEAPP takes a long time on the subset.** Your lecturer may ask you to do Parts A and B at the start of the session, so that ALEAPP runs while the class goes through sections 1 to 9. Then continue from Part C.

<div class="box lms" markdown="1">

Folder `S15` on the lab share holds the examination subset of the test phone's extraction, the evidence register, the unit's pre-computed ALEAPP report and the findings form. ALEAPP for Windows is in the `Tools` folder. If you are studying away from the lab, the LMS explains how to get the same files.

</div>

**What you receive.** The full extraction of the test phone, as the researcher published it, is about 30 to 35 GB. Thirty-five copies of that would not fit the lab. So the unit cut an examination subset from it, as Session 2 used a triage subset and Session 7 a slice: the user data with every app's folder, the system's records and the shared storage, but without the installed programs, temporary caches and very large media files. The subset is one `.tar` file, an archive that keeps every file with its path and dates. The evidence register records the hash value of the full extraction (exhibit S15-001), the hash value of the subset (S15-002), and what was left out.

<div class="box safety" markdown="1">

**Three rules for today.**

1. **The subset is read only.** You list it and copy files out of it; you never change it. Record the SHA-256 value of every file you copy out before you open it.
2. **Never contact anyone or anything from the evidence.** The phone holds real-looking accounts, phone numbers and links. They belong to a test persona, and some may now belong to other people. Do not sign in, call, message or visit.
3. **Write only what the question needs.** When a file shows a phone number or another personal value that your answer does not need, leave it out of your notes.

</div>

### Part A: receive and verify the extraction

1. **Make your folders and copy the files.** In the Windows VM, create `C:\Evidence\S15`, `C:\Cases\S15` and `C:\Cases\S15\extract`, and a folder `s15` in your shared folder. Copy the four files from folder `S15` on the lab share into `C:\Evidence\S15`.

   <div class="box expect" markdown="1">

   `C:\Evidence\S15` holds `s15-pixel7a-exam-subset.tar`, `s15-evidence-register.csv`, `s15-aleapp-report.zip` and `s15-findings-form.csv`. The `.tar` file takes the longest to copy; the register gives its exact size.

   </div>

   <div class="box trouble" markdown="1">

   If Windows says there is not enough space, check the free space on drive C:. The subset and the unpacked report need several gigabytes together; the register lists both sizes. Delete old working copies from earlier sessions only if the lecturer agrees.

   </div>

2. **Verify the subset against the register.** Open PowerShell and run:

   ```powershell
   Get-FileHash C:\Evidence\S15\s15-pixel7a-exam-subset.tar -Algorithm SHA256
   ```

   Open `s15-evidence-register.csv` in Notepad and compare your value with the row for exhibit S15-002, character by character. Then mark the subset read-only:

   ```powershell
   Set-ItemProperty C:\Evidence\S15\s15-pixel7a-exam-subset.tar -Name IsReadOnly -Value $true
   ```

   <div class="box expect" markdown="1">

   The two values match. The register also shows the row for S15-001, the full extraction as published, with the researcher's own published SHA-256 value, and a note on how S15-002 was cut from it.

   </div>

   <div class="box trouble" markdown="1">

   If the values differ, stop and copy the file again. If it still differs, tell the lecturer and do not continue with this copy, exactly as in Session 1.

   </div>

3. **Record what kind of extraction this is.** Create `C:\Cases\S15\s15-notes.txt`. Write the exhibit number, your hash value, the kind of extraction the register states, and two sentences: one on what this kind can hold, one on what it cannot hold (section 2).

   <div class="box expect" markdown="1">

   The register says: full file system extraction, cut to an examination subset. Your two sentences name, for example, every app's private files as what it holds, and unused space and anything the cut left out as what it does not.

   </div>

   <div class="box trouble" markdown="1">

   If you are unsure what the kind leaves out, read the table and the comparison in section 2 again before you go on. Part C will let you confirm the kind from the layout itself.

   </div>

### Part B: start the parser early

4. **Start ALEAPP.** Copy `ALEAPP-2026.4.3-windows-x64-portable.zip` from the `Tools` folder on the lab share to `C:\Tools`, extract it, and start `aleapp.exe` in the extracted folder. In the window:
   - under the line that asks for the file of the extraction, click **Browse File** and select `C:\Evidence\S15\s15-pixel7a-exam-subset.tar`;
   - create the folder `C:\Cases\S15\report`, then under **Select Output Path** click **Browse Folder** and select it;
   - keep the modules as they are selected (a few slow ones are left out on purpose, and today needs none of them), and click **Process**.

   <div class="box expect" markdown="1">

   A log window lists the modules one by one, each with "started" and "completed". Many say "No file found": the module looks for an app this phone never had. The run continues while you work on Part C. On a lab VM, expect it to take a long time, possibly more than twenty minutes.

   </div>

   <div class="box trouble" markdown="1">

   If ALEAPP stops with an error, or has not finished after thirty minutes, close it and use the unit's pre-computed report: extract `s15-aleapp-report.zip` into `C:\Cases\S15\report`. It was made with the same version on the same subset. Write in your notes which report you used. If Windows warns that the program is from an unknown publisher, ask the lecturer before you allow it.

   </div>

### Part C: find the layout while the parser runs

5. **List the files in the extraction.** In PowerShell, write the list of every path in the subset to a file, then count the lines and look at the first ones:

   ```powershell
   tar -tf C:\Evidence\S15\s15-pixel7a-exam-subset.tar > C:\Cases\S15\s15-file-list.txt
   (Get-Content C:\Cases\S15\s15-file-list.txt).Count
   Get-Content C:\Cases\S15\s15-file-list.txt -TotalCount 15
   ```

   <div class="box expect" markdown="1">

   Many thousands of paths. They all start with `Dump/data/`: the extraction tool put the phone's `/data` partition inside a folder called `Dump`. Write the count in your notes.

   </div>

   <div class="box trouble" markdown="1">

   If `tar` is not recognised, your Windows is older than version 1803; use the pre-computed report's file list in `C:\Cases\S15\report` instead, and tell the lecturer. If the paths start with another folder name, use that name wherever this page writes `Dump`.

   </div>

6. **Find which parts of the phone it covers.** List the folders two levels down:

   ```powershell
   Get-Content C:\Cases\S15\s15-file-list.txt | ForEach-Object { ($_ -split '/')[0..2] -join '/' } | Sort-Object -Unique
   ```

   <div class="box expect" markdown="1">

   Folders such as `Dump/data/data`, `Dump/data/media`, `Dump/data/misc`, `Dump/data/system`, `Dump/data/system_ce`, `Dump/data/system_de`, `Dump/data/user` and `Dump/data/user_de`. Everything is under `data`: one partition, the user data partition. There is no system partition and no image of unused space. Write in your notes why this confirms a full file system extraction.

   </div>

   <div class="box trouble" markdown="1">

   If the command runs for more than a minute, it is working through a long list; wait. If you see folders that this page does not name, that is normal: write them down. The register's note on the cut lists the folders the unit left out, such as `data/app`.

   </div>

7. **Count the app sandboxes and find three of them.** Run:

   ```powershell
   $pkgs = Get-Content C:\Cases\S15\s15-file-list.txt | Select-String '^Dump/data/data/([^/]+)/' | ForEach-Object { $_.Matches[0].Groups[1].Value } | Sort-Object -Unique
   $pkgs.Count
   $pkgs | Select-String 'threema|opera|calculator'
   ```

   <div class="box expect" markdown="1">

   A count of package folders, well over a hundred, because the system's own components have sandboxes too. The three packages of section 4 appear:

   ```
   ch.threema.app
   com.calculator.lock.hide.photo.video
   com.opera.browser
   ```

   Write the count and the three names in your notes.

   </div>

   <div class="box trouble" markdown="1">

   If the last command shows nothing, check the first one: `$pkgs.Count` must be more than zero. If it is zero, look at the paths in step 5 again and adjust `Dump/data/data` to what you see.

   </div>

8. **Look inside one sandbox.** Run:

   ```powershell
   Get-Content C:\Cases\S15\s15-file-list.txt | Select-String '^Dump/data/data/ch\.threema\.app/(databases|shared_prefs|files)/'
   ```

   <div class="box expect" markdown="1">

   Among other files, under `Dump/data/data/ch.threema.app/`:

   ```
   databases/threema4.db
   databases/threema4.db-shm
   databases/threema4.db-wal
   files/key.dat
   shared_prefs/ch.threema.app_preferences.xml
   ```

   These are the app's database, its settings and the key the app uses to encrypt the database (sections 4 and 6).

   </div>

   <div class="box trouble" markdown="1">

   If the dots in the pattern confuse you, they are written `\.` because a plain dot means "any character" in a pattern. The command still works if you leave them plain.

   </div>

9. **Find the shared storage.** Run:

   ```powershell
   Get-Content C:\Cases\S15\s15-file-list.txt | Select-String '^Dump/data/media/0/DCIM/' | Select-Object -First 10
   ```

   <div class="box expect" markdown="1">

   Paths in the camera folder, such as:

   ```
   Dump/data/media/0/DCIM/Camera/PXL_...jpg
   ```

   Pixel phones name camera pictures `PXL_` followed by a date and a time. Write one file name in your notes; question 6 uses the camera folder.

   </div>

   <div class="box trouble" markdown="1">

   If nothing is listed, the camera folder may have been left out of the subset as large media. Check the register's note on the cut, and use the media index in question 6 instead: it lists every picture, even when the picture file itself is not in the subset.

   </div>

### Part D: read the report

10. **Open the report.** When ALEAPP has finished, click **Open HTML in Browser & Close**, or open `index.html` in the report's output folder yourself. The menu on the left lists the report's sections by app or by kind of record.

    <div class="box expect" markdown="1">

    ALEAPP made a folder named `ALEAPP_Output_` followed by the date inside `C:\Cases\S15\report`; `index.html` is in it. Each page shows the ALEAPP version at the top. The menu includes **Threema**, **Chromium** (with **Web History**), **Accounts**, **WiFi Profiles**, **AllTrails** and **Emulated Storage Metadata**. Each section's page has a table and a line "located at" that names the source file in the extraction.

    </div>

    <div class="box trouble" markdown="1">

    If a section is missing from the menu, ALEAPP found no rows for it; that is a finding about the report, not about the phone (section 9). If the page is slow, use the TSV file of the same name in the folder `_TSV Exports`, which opens in Notepad.

    </div>

### Part E: answer six case questions

11. **Prepare your findings file.** Copy `s15-findings-form.csv` from `C:\Evidence\S15` into the folder `s15` of your shared folder as `s15-findings.csv`, remove its read-only mark, and open it in Notepad. It has one line per question, and these columns:

    | Column | What to write |
    |---|---|
    | `question` | Already filled: Q1 to Q6 |
    | `answer` | Your answer, in one short sentence |
    | `source_file` | The path inside the extraction, from the report's "located at" line |
    | `raw_value` | The time exactly as the report or the file shows it |
    | `clock` | Which clock: for example "Unix milliseconds, UTC", "phone's local time with offset", "date only, no time" |
    | `time_utc` | The time in UTC, as `YYYY-MM-DD HH:MM:SS` |
    | `confidence` | `high`, `medium` or `low`, as defined below |
    | `checked_in_source` | `yes` for the two lines you check in Part F, otherwise `no` |

    **Confidence.** Write `high` when you read the value in the source file yourself and its clock is clear. Write `medium` when the report shows it and the clock is clear, but you did not open the source. Write `low` when the clock is unclear, the value is missing, or the answer rests on your reading rather than on a record.

    <div class="box expect" markdown="1">

    Six lines, Q1 to Q6, each with empty columns after `question`.

    </div>

    <div class="box trouble" markdown="1">

    If an answer contains a comma, put the whole answer in double quotes, or the line will split into extra columns.

    </div>

12. **Answer the questions from the report.** Use the sections named in brackets. For every time, read section 7 again if you are unsure of the clock.

    | # | Question |
    |---|---|
    | Q1 | **Messages** (Threema). The owner's Threema conversation with the contact "ThisIs DFIR" began on 2 May 2024. What was the first message she received, and at what time in UTC? Name the time column you used. |
    | Q2 | **Accounts** (Accounts). Which Google account was on the phone? Name the source file, and say whether that file records when the account was added. |
    | Q3 | **Browsing** (Chromium, Web History, rows with the browser name Opera). What was the first address typed in Opera, at what time in UTC, and which two searches followed? The researcher's notes say that private tabs were also used that afternoon: what does the history hold of them? |
    | Q4 | **Location** (AllTrails). The app recorded one activity. When did it start and end, in UTC? Where was its first track point, in latitude and longitude to four decimal places? |
    | Q5 | **Wi-Fi** (WiFi Profiles). Which Wi-Fi networks had the phone saved? Give their names, the source file, and any time recorded for one of them. |
    | Q6 | **Photo metadata** (Emulated Storage Metadata, Images). Choose the newest picture in the camera folder that the media index lists. Give its file name, its date taken and its date added in UTC, and say which of the two agrees with the date and time in its file name. |

    <div class="box expect" markdown="1">

    Six answers, each with a path that starts with `Dump/data/`. Times appear in UTC in the report's main columns; where a section also shows the raw value, copy that into `raw_value`. For Q2, you may find that the source holds no time at all: that is an answer, and `time_utc` stays empty.

    </div>

    <div class="box trouble" markdown="1">

    If a section has many rows, use the search box above its table. If two time columns appear, for example created and read for a message, decide which one answers the question and name it. If you cannot find a section at all, write `not found in report` and the reason you suspect; do not leave the line empty.

    </div>

### Part F: check two report lines in their sources

13. **Check a database line, read-only.** Copy Opera's history database and its journal out of the subset into your extract folder, and record the copy's hash value:

    ```powershell
    tar -xf C:\Evidence\S15\s15-pixel7a-exam-subset.tar -C C:\Cases\S15\extract "Dump/data/data/com.opera.browser/app_opera/History" "Dump/data/data/com.opera.browser/app_opera/History-journal"
    Get-FileHash C:\Cases\S15\extract\Dump\data\data\com.opera.browser\app_opera\History -Algorithm SHA256
    ```

    Open DB Browser for SQLite and choose **Open Database Read Only**, then the copied `History`. On the tab **Execute SQL**, run:

    ```sql
    SELECT id, url, typed_count, hidden, last_visit_time,
           datetime(last_visit_time/1000000 - 11644473600, 'unixepoch') AS utc
    FROM urls ORDER BY last_visit_time;
    ```

    Compare the row for your answer to Q3 with the report's line. Write in your notes: the report's value, the raw value, your converted value, and whether they agree. Then set `checked_in_source` to `yes` for Q3 and raise its confidence if they agree.

    <div class="box expect" markdown="1">

    25 rows. The first is `https://mlb.com/` with `typed_count` 1, the raw value `13365375162964931` and `2024-07-13 20:12:42` in the column `utc`. The report shows `2024-07-13 20:12:42.964931+00:00`: the same time, with the fraction of a second that the SQL function drops. Eighteen rows have `hidden` set to 1: the requests the pages made by themselves (section 8).

    </div>

    <div class="box trouble" markdown="1">

    If `tar` says it cannot find a member, check the spelling and the case of the path against your file list; paths inside the archive use forward slashes. If DB Browser shows a message about a journal, close it and check that `History-journal` was copied beside `History`. If the list of tables is empty, you opened the folder or the wrong file.

    </div>

14. **Check a settings line.** Copy Threema's preferences file out of the subset, record its hash value, and open it in Notepad:

    ```powershell
    tar -xf C:\Evidence\S15\s15-pixel7a-exam-subset.tar -C C:\Cases\S15\extract "Dump/data/data/ch.threema.app/shared_prefs/ch.threema.app_preferences.xml"
    Get-FileHash C:\Cases\S15\extract\Dump\data\data\ch.threema.app\shared_prefs\ch.threema.app_preferences.xml -Algorithm SHA256
    notepad C:\Cases\S15\extract\Dump\data\data\ch.threema.app\shared_prefs\ch.threema.app_preferences.xml
    ```

    Use **Find** (Ctrl+F) to look for `"identity"`, then for `"nickname"`. Compare both with the report's section **Threema - Account**, and write in your notes whether they agree. This line is not one of the six questions: write it as a seventh line in your findings file, `Q7`, with the answer, the source file, no time and `checked_in_source` set to `yes`.

    <div class="box expect" markdown="1">

    The two lines `<string name="identity">T4UFS63T</string>` and `<string name="nickname">Liz D</string>`. The report shows the same ID and nickname. The file also holds a mobile number: by the third safety rule, leave it out of your notes.

    </div>

    <div class="box trouble" markdown="1">

    If Notepad shows the whole file on one line, it is still the same file; use Find. If the report's account section is missing, write the values from the file and note that the report did not show them.

    </div>

### Part G: write the findings

15. **Finish your findings file.** Read each line of `s15-findings.csv` once more. Every line needs a source file, a clock and a confidence. Where a time was given only as a date, or the clock was unclear, say so in `clock` and lower the confidence.

    <div class="box expect" markdown="1">

    Seven lines. Q3 and Q7 are checked in their sources; at least Q3 is `high`. A line with no time, such as Q2 or Q7, has an empty `time_utc` and a `clock` that says why.

    </div>

    <div class="box trouble" markdown="1">

    If you used the pre-computed report, say so in your notes; the checkpoint accepts either report. If an answer depends on the researcher's notes rather than the phone's records, such as the private tabs in Q3, say which part comes from where.

    </div>

### Checkpoint

Hand in `s15-findings.csv` and `s15-notes.txt`. Judge your own work against this table first. The lecturer checks your findings against the unit's key, which was built from the researcher's published record and the unit's own run of ALEAPP on the same subset.

| # | Check | Your proof |
|---|---|---|
| 1 | The subset's hash value matches the register, and the kind of extraction is recorded with what it can and cannot hold | Steps 2 and 3 |
| 2 | The layout is described: one user data partition, the number of package folders, the three packages of section 4 | Steps 6 and 7 |
| 3 | At least five of the six questions answered with the right source file and the right time in UTC | Step 12 |
| 4 | Every time line names its clock, and no date-only value is given a time it does not have | Step 12 |
| 5 | Two lines checked in their sources, one in a database opened read-only, with the raw value and your own conversion | Steps 13 and 14 |
| 6 | A confidence on every line that fits the definition, and no personal values beyond what the questions need | Step 15 |

### If you have time

**A parser's date, checked.** Copy the calculator vault's database out of the subset, with its journal:

```
Dump/data/data/com.calculator.lock.hide.photo.video/databases/note_contact.db
Dump/data/data/com.calculator.lock.hide.photo.video/databases/note_contact.db-journal
```

Open it read-only and run `SELECT * FROM Note;`. Compare the value in `note_date` with the report's section **Calculator Lock - Notes**. Write one sentence on what the report's first column adds, and one on what the value can and cannot tell you. The demo in section 9 shows the same line; here you check it yourself.

**A second tool.** In Autopsy, create a case `S15-autopsy`, add `s15-pixel7a-exam-subset.tar` as a **Logical Files** data source, and run only the **Android Analyzer** and **Android Analyzer (aLEAPP)** modules. It runs a long time on this subset, so start it at the end of the lab and read it later. Compare one line, such as the Opera visit of Q3, between Autopsy's results and your ALEAPP report. Write which version of ALEAPP Autopsy used, if it shows it.

**The other platform.** If the lecturer has placed the researcher's iOS 17 extraction in folder `S15-ios` on the lab share, run iLEAPP on it, open one app's data container in its report, and find the metadata file that names the app. Write the generated ID and the bundle identifier side by side, as section 5 asks.

## If you missed Session 15

This session works on a provided extraction, so you can do it alone from this page.

1. **Read sections 1 to 9 and run the five demos** (about 75 minutes). Answer each quick check before you open the answer.
2. **Get the files.** Folder `S15` on the lab share holds the subset, the register, the pre-computed report and the form; ALEAPP is in the `Tools` folder. The LMS explains how to get them away from the lab.
3. **Do Parts A to G in one sitting** (about an hour and forty-five minutes). If ALEAPP is slow on your machine, use the pre-computed report from the start and say so in your notes.
4. **Tick the checkpoint table** and hand in the two files.
5. **If you are blocked**, write to the lecturer through the LMS with the step number and the exact error message.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. Compare a logical extraction with a full file system extraction of the same phone.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A logical extraction holds what the phone or its backup service is designed to share, such as contacts, messages and the data of apps that allow backup, so it misses many apps' private data. A full file system extraction copies the whole file tree of the user data through extra rights on the running phone, so it includes each app's private folder, but still not the unused space of the storage. The points that earn marks: (1) logical holds only what the phone shares; (2) full file system holds every file of the user data, including app sandboxes; (3) neither holds unused space.
</details>

**2. Explain why a physical extraction of a modern phone often gives less readable evidence than a full file system extraction.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A physical extraction copies every bit of the storage, but a modern phone encrypts its user data with keys made from the passcode and a key that never leaves the phone's processor. So the copy holds encrypted data without the keys, while a full file system extraction is taken through the running phone, which has already decrypted the files it copies. The points that earn marks: (1) physical is a bit-for-bit copy; (2) the user data is encrypted with keys that stay in the phone; (3) the full file system extraction reads files the running phone has decrypted.
</details>

**3. Explain the difference between the states before first unlock and after first unlock, and why it matters to an extraction.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Before first unlock, the phone has started but the owner has not entered the passcode, so the keys for most user data do not exist yet and only a small part of the data can be read. After first unlock, those keys stay in memory until the phone restarts, even when the screen is locked, so a full file system extraction can often read most app data; a restart or a flat battery returns the phone to the first state. The points that earn marks: (1) BFU means the passcode-derived keys are absent; (2) AFU keeps them in memory until restart; (3) the state at seizure decides what can be extracted.
</details>

**4. Describe where an Android app keeps its private data, and how an examiner knows which app a folder belongs to.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Each app has a private folder, its sandbox, on the user data partition at `/data/data/` followed by its package name, with its databases, settings and other files inside, and no other app may read it. The package name is the app's unique name, written like a reversed web address, so the folder name identifies the app even when the label on the screen says something else. The points that earn marks: (1) the sandbox under `/data/data/`; (2) its usual contents; (3) the package name identifies the app, not the label.
</details>

**5. Explain how an examiner identifies which app owns a data container on an iPhone.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
An iPhone names each app's container with a generated ID that says nothing about the app, so the examiner reads the hidden metadata file inside the container, which holds the app's bundle identifier; tools such as iLEAPP do this for every container. The ID changes when the app is deleted and installed again, so the link holds only for that extraction and must be stated with the bundle identifier. The points that earn marks: (1) the folder name is a generated ID; (2) the metadata file inside gives the bundle identifier; (3) the link is true only for that extraction.
</details>

**6. A parser's report shows a time for a record. Describe how an examiner checks it.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The examiner copies the source file named in the report, with its companion files, out of the extraction, records the copy's hash value, opens it read-only and finds the row or value the report used. She then reads the raw value, decides which clock and unit wrote it, converts it herself and compares the result with the report, noting anything the report added or left out, such as a time given to a value that held only a date. The points that earn marks: (1) copy and hash the named source file; (2) open read-only and find the raw value; (3) convert it with the right clock and compare.
</details>

**7. Explain why each time in a mobile finding must be written with its clock, using one example from today.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A number in a phone's database means nothing until you know which clock wrote it, in which unit and from which starting point: the same digits can be milliseconds since 1970 or seconds since 2001, and a text date may hold no time at all. For example, Opera's history counts microseconds since 1601 in UTC, while the calculator vault stored only the text `04-02-2024`, which a parser showed as midnight UTC although no time was recorded. The points that earn marks: (1) the clock, unit and starting point decide the time; (2) different apps use different clocks; (3) one correct example.
</details>

## Coming next

Today you opened app databases only to read them. Session 16 goes inside them: how a SQLite database stores its pages, why a deleted row can survive in the WAL file or in the free space of the database, how to recover such rows, and how to write those findings into a report. Its case example comes back from the phone to the suspect's computer, to the Google Drive database that the suspect deleted.
