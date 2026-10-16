---
session_code: S17
description: "The whole case at once: the computer, network and cloud threads joined into one timeline in UTC, corroboration by independent sources, what anti-forensics does to a conclusion, response and recovery revisited, containing a compromised server without losing its volatile evidence, MFA and its limits; then the law, the standards and the court around the work, and the ethics of an examiner who can see everything."
hook: >-
  The unit has read the suspect's computer, his mail, his browsers and his cloud program, one session at a time.
  Today it puts them on one clock, decides how sure it can be, and asks what the law and its own conscience allow it to do with what it saw.
outcomes:
  - "Construct one timeline in UTC from the computer, network and cloud threads of one case, and identify which events are corroborated by independent sources and which stand alone"
  - "Explain what traces of a cleaning or wiping tool mean for an incident-response conclusion, and state confidence that allows for what may have been removed"
  - "Compare incident response with disaster recovery for a real decision, and identify the outputs of post-incident activity"
  - "Justify an order of actions that contains a compromised server without destroying its volatile evidence, and explain what multi-factor authentication for administrative access does and does not stop"
  - "Identify the laws that govern an examiner's work in the United Kingdom and in Sri Lanka, and across borders, and the standards behind forensically sound practice"
  - "Explain the expert witness's duty to the court, the difference between fact and opinion, tool validation and disclosure, and how a defence tests a method"
  - "Justify decisions about authority, proportionality, collateral data, privacy, retention and bias, and the duty to report what does not fit"
before:
  - "Explain [incident response and disaster recovery](../s01/#7-response-recovery-and-learning), and the [four phases and six Functions](../s01/#6-responding-to-an-incident-four-phases-and-six-functions) of NIST SP 800-61 (Session 1)"
  - "Explain why [hiding leaves its own trace](../s04/#7-hiding-leaves-its-own-trace), and what the suspect's cleaning tools did and did not show (Session 4)"
  - "Normalise every source to [UTC](../s05/#8-one-clock-normalise-every-source-to-utc) and write a timeline in the unit's seven columns (Session 5)"
  - "Write a [finding, a limitation and a recommendation](../s13/#9-limitations-and-recommendations-two-methods) by the method (Session 13)"
  - "Follow the suspect's [mail and Google Drive traces](../s14/#9-ordinary-artefacts-extraordinary-reading), and [attribute](../s14/#8-attribution-when-the-network-is-not-yours) a message step by step (Session 14)"
  - "Read the recovered [Drive records](../s16/#6-the-case-the-databases-the-suspects-drive-program-deleted) that tie two links to two files, and state confidence in a [report a reader can trust](../s16/#8-evidence-a-reader-can-trust) (Session 16)"
demos:
  - id: S17-D1
    title: "Three threads, one timeline"
    file: s17-d1-three-threads.html
    teaches: "Events from the computer, network and cloud threads fall into place on one UTC line, and an event counts as corroborated only when two independent writers agree, so turning off one thread shows which conclusions lose their second witness."
  - id: S17-D2
    title: "The confidence ladder"
    file: s17-d2-confidence-ladder.html
    teaches: "Records that agree move a conclusion up the ladder, a missing record never moves it towards 'did not happen', and traces of a cleaning tool lower the highest rung that any 'nothing else happened' claim can reach."
  - id: S17-D3
    title: "Containment that keeps the evidence"
    file: s17-d3-containment.html
    teaches: "The order of the first actions on a compromised server decides what evidence survives: isolate and capture first, and memory, connections and logs are kept; switch off or restore first, and they are lost for good."
  - id: S17-D4
    title: "From collection to court"
    file: s17-d4-collection-to-court.html
    teaches: "An exhibit reaches the court through a chain of steps, and each broken step gives the defence a specific challenge to the method, not only to the result."
slides: s17-integration-ethics-law.pptx
evidence: "the S17 integration pack (excerpts of the suspect's computer, mail store and Google Drive program, the unit's parsed outputs, the question sheet and the evidence register), in folder S17 on the lab share (the lab steps say exactly which files)"
---

Day 9 opens with the whole case. Every session since Session 2 has read one kind of record. Today you read them together, on one clock, and you write what they show as one short incident summary. Then you step back and look at the frame around everything the unit has done: the law, the standards, the court and the examiner's own conscience.

**Two halves.** The first half is the integrated investigation, a timed exercise of about an hour and a half on an integration pack. The second half is ethics and law, and it ends with a structured debate. Session 18 is the coursework workshop; this session teaches no new tool.

**One case, one clock.** The pack is cut from the suspect's computer in the CFReDS case alone, by a written rule, as Session 15 cut its subset. Its network thread is honest about what it is. Session 7 said the client recorded no traffic, and the captures you read in Sessions 7 and 8 came from other networks. So the network thread here is what the suspect's own records say about networks: the address his computer held, the file share it reached, the links in his mail, and any addresses that his mail store or his Drive program wrote down. The lab finds out how much of that exists.

## 1. One case, one clock: three threads into one timeline

### The idea

Over the module you read the case in threads. The **computer thread** came from the suspect's disk: renames in the change journal, programs that ran, the USB stick (Sessions 2 to 5). The **network thread** is the addresses and connections that the records mention. The **cloud thread** came from the Google Drive program's log and its databases (Sessions 14 and 16). The mail store was the link between them.

Each thread alone told part of the story. Put on one clock, they tell more, and they test each other. An event that two threads record in the same minute is stronger than an event only one thread records. That is {% include term.html t="corroboration" %}.

But two records are not always two witnesses. A program can write the same fact into its log and into its database. If the program was wrong, both records are wrong in the same way. So corroboration needs an {% include term.html t="independent-source" %}: a record written by a different program, person or machine.

### How it works

**Step 1: one clock.** Every row goes into Session 5's seven columns, with its time in {% include term.html t="utc" %} and the clock it came from in `original_zone`. The Drive log writes local time with `-0400` in every line. The change journal and the registry write UTC. The `setupapi.dev.log` file writes the desk clock with no offset at all. One wrong conversion moves an event four hours and breaks every join after it.

**Step 2: join keys.** Threads are joined by values they share, as in Session 13. In this case the keys are file names (the renamed documents), the Drive link codes (the mail and the recovered database rows), account names, and times.

**Step 3: ask who wrote each record.** Here is the case's crucial half hour, Monday 23 March 2015, in UTC, with the writer of each record:

| UTC | Thread | Record | Writer |
|---|---|---|---|
| 20:05:32 | Cloud | Drive program signs in with `iaman.informant.personal@gmail.com` | Google Drive program (`sync_log.log`) |
| 20:23:28 | Network | `\\10.11.11.128\secured_drive` typed into Run | Windows Explorer (RunMRU in `NTUSER.DAT`) |
| 20:24:01 to 20:24:27 | Network | Folders of the share's `Secret Project Data` opened | Windows Explorer (shellbags in `UsrClass.dat`) |
| 20:26:04 | Network | The share mapped as drive `V:` | Windows Explorer (Map Network Drive MRU) |
| 20:30:44, 20:31:02 | Computer | Two client documents renamed `happy_holiday.jpg` and `do_u_wanna_build_a_snow_man.mp3` | NTFS (change journal `$J`) |
| 20:32:35 | Cloud | Both files uploaded | Google Drive program (`sync_log.log`) |
| 20:38:47 | Mail | `It's me`, with two `drive.google.com` links, sent to the contact | Outlook (mail store, recovered from free space) |
| 20:42:17 | Cloud | Both files deleted from Drive | Google Drive program (`sync_log.log`) |

Read the last column. The upload at 20:32:35 is written by the Drive program. The mail at 20:38:47 is written by Outlook, a different program, into a different store. The mail's two links, matched by Session 16's recovered rows, point to the same two files. So the upload is corroborated by an independent source.

Session 16's recovered `cloud_entry` rows add detail, but not independence: `snapshot.db` was written by the same Drive program as `sync_log.log`. If you count it as a second witness, you count one witness twice.

Now look at the share. Three records show the suspect's account reaching `\\10.11.11.128\secured_drive`, and all three were written by one program on one computer: Windows Explorer, on the suspect's machine. The file server at 10.11.11.128 kept its own records of who connected and which files were read, but they are not in the evidence. So the share access is a **single-source** event. It is very likely true, and your report says exactly what supports it, and what does not.

Try it in the demo: turn threads on and off and watch which events keep a second witness.

{% include demo.html id="S17-D1" %}

**What the network thread can say.** The computer's own records give it an address, 10.11.11.129, given to it by a DHCP server at 10.11.11.254, with a gateway at 10.11.11.2 (from the `SYSTEM` hive). The share at 10.11.11.128 sits on the same network: a server inside the client's office. The links in the mail name Google's servers by their host name. Whether the mail store kept the mail servers' `Received` lines, and whether the Drive log wrote any addresses, you find out in the lab: Session 14 showed that a store may keep no transport header at all. If they are absent, that is a finding and a limitation, not a failure.

Remember Session 7: an address is a device at a time, not a person. And 10.11.11.129 is a private address. The answer key records that the computer ran on a network that translated its addresses (NAT). Google's servers never saw 10.11.11.129: they saw the address of the device in front of it. To connect Google's records to this computer, an investigator needs the client's own records of that translation.

<div class="box metaphor" markdown="1">

**The comparison.** An integrated timeline is like a rope braided from three strands. Each strand alone may snap, but the braid holds a weight none of them could hold alone.

**Why it fits.** The computer, network and cloud threads are the strands. Where they cross, at the same file names and minutes, they grip each other: the renamed files in the change journal are the same files in the Drive log and in the mail's links. A break in one strand, such as a missing log, does not drop the load, because the others still carry it.

**Where it breaks.** A rope maker makes sure each strand is spun separately. Evidence does not come with that promise. Two "strands" written by one program, like the Drive log and the Drive database, are one strand counted twice: if the program is wrong, both fail together. And strands keyed to one wrong clock all slide together, so the braid looks tight while every event sits four hours away from the truth.

**So what.** Before you count a second record as support, write down who wrote each one. Count only independent writers, and normalise every clock before you compare times.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">Which pair of records corroborates the upload of the two files most strongly?</p>
  <ul class="qc-opts">
    <li data-key="a">The Drive program's log line and the Drive program's recovered database rows</li>
    <li data-key="b">The Drive program's log line and the same line read again in a second tool</li>
    <li data-key="c">The Drive program's log line and the mail sent six minutes later, whose two links point to the same two files</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The mail was written by Outlook into its own store, independently of the Drive program. Option (a) is one writer twice. Option (b) is one record read twice: a second tool checks the reading, not the event.</p></div>

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">The suspect's computer records that it opened folders on <code>\\10.11.11.128\secured_drive</code> at 20:24 UTC. Nothing else in the evidence mentions the share. How should the timeline mark this event?</p>
  <ul class="qc-opts">
    <li data-key="a">As corroborated, because three different records show it</li>
    <li data-key="b">As single-source: all three records were written by Windows Explorer on the same computer, and the file server's own records are not in the evidence</li>
    <li data-key="c">As unreliable, and leave it out of the timeline</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Three records from one writer on one machine are one source. The event is still evidence, and it stays in the timeline (c is wrong); the tag tells the reader how far it is supported, and the missing server records become a recommendation.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Correlation, corroboration and two writers that share a clock</summary>

**Correlation and corroboration.** Session 8 used {% include term.html t="correlation" %} for linking records of the same activity, and showed that it can exclude as well as confirm. Corroboration is the special case where the linked records are independent and agree. Correlation is the method; corroboration is one of its possible results.

**Independent, but on one clock.** The change journal, the mail store and the Drive log are written by different programs, but all of them take their time from the same computer's clock. If that clock was wrong, all three are wrong by the same amount, and they still agree with each other. A record written on another machine, such as the file server's log or Google's own records, would test the clock as well as the event. That is one reason why the missing server records matter.

**What a timeline row is.** A row says "this record says this happened at this time". When you tag it `corroborated`, write in the tag which independent record agrees, so that a reader can check it. When you tag it `single-source`, the limitation section says what would corroborate it.
</details>

<div class="box key" markdown="1">

Put every thread on one clock, join them by shared values, and count support only from independent writers. A record that only one writer made is still evidence; your timeline says so.

</div>

## 2. What anti-forensics does to a conclusion

### The idea

Session 4 taught that hiding leaves its own trace: the act that removes one piece of evidence creates another. Today's question is different. When you find those traces, what happens to your conclusions?

Three rules answer it.

1. **The traces are evidence in themselves.** A wiping tool that was searched for, downloaded, installed and run in the last hours before an employee left is a finding, with its own sources and times.
2. **{% include term.html t="absence-of-evidence" %} is not proof of absence.** If a record is missing on a computer where a cleaning tool ran, you cannot tell whether the event never happened or whether its record was removed.
3. **Confidence must say so.** Every conclusion that rests on something being absent loses strength. A conclusion that rests on records that survived does not.

### How it works

**The suspect's last morning, Wednesday 25 March 2015, in UTC:**

| UTC | Record | What it shows |
|---|---|---|
| 14:46:44 to 14:47:51 | IE 11 history | Searches for `anti-forensic tools`, `eraser`, `ccleaner`; the Eraser download at 14:47:34 |
| 14:50:14 and 14:57:56 | Prefetch | The Eraser and CCleaner installers run |
| 15:13:30 | Prefetch | `ERASER.EXE` last run, run count 2 (UserAssist: 15:12:28, count 1) |
| 15:15:50 | Prefetch | `CCLEANER64.EXE` runs |
| 15:18:29 | Prefetch | `UNINST.EXE` removes CCleaner |
| 15:22:47 | Drive log | The Drive program signs out and, a second later, deletes its two databases |

Session 4 showed that Eraser wiped harmless sample pictures, not the client's documents, and Session 16 showed that the Drive databases came back from a shadow copy. So the main conclusion is still strong. But two kinds of statement are now different.

**Statements built on records that survived** keep their strength. The renames, the upload, the mail and the deletion are recorded by independent writers, and nothing contradicts them. "The evidence shows that two client documents were renamed, uploaded to a personal cloud account and shared by link" still stands.

**Statements built on absence** lose it. "No other file left the company" rests on not finding a record. On a computer where a cleaning tool ran, the honest form is "the evidence cannot show whether other files left, because a cleaning program ran on 25 March and its settings decide what it removed".

Use Session 16's three phrases, and let the evidence, not your wish, choose the rung. The demo shows the ladder.

{% include demo.html id="S17-D2" %}

<div class="box metaphor" markdown="1">

**The comparison.** Finding anti-forensic traces is like walking into a room that smells strongly of bleach. You know someone cleaned it.

**Why it fits.** The smell is the prefetch file and the search history: the cleaning left its own mark. You can still see what the cleaner did not reach: the stain under the carpet, the footprint on the window sill, like the renames in the change journal and the copy in the shadow copy. And you cannot say "nothing happened on the table", because the table is exactly what was wiped.

**Where it breaks.** In a house, bleach in a room that was not dirty is strange. On a computer, cleaning tools are lawful and common: many careful people run them every week for privacy or space. The smell alone proves nothing; its timing and its company do. And unlike a room, a computer keeps many records that a cleaning tool does not know exist, so a good cleaner may still leave far more behind than a cleaner of rooms.

**So what.** Report the cleaning as a finding with its times, use the context (the searches, the order, the last day), and lower your confidence only for the claims that rest on absence.

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "No record of other files leaving, so only two files left." | "The evidence shows two files left by Drive; it cannot show whether others left, because a cleaning tool ran." | Absence after cleaning is not proof. |
| "He used CCleaner, so he destroyed evidence." | "CCleaner ran under his account at 15:15:50 UTC; what it removed depends on its settings and cannot be read from these records." | The tool's run is a fact; its effect is not. |
| "Anti-forensics means nothing can be trusted." | "Conclusions that rest on surviving, independent records stand; conclusions that rest on absence are weaker." | The damage is to one kind of claim, not to all of them. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A cleaning tool ran on a suspect's computer the day after an upload. The examiner finds no browser history for that evening. Which sentence belongs in the report?</p>
  <ul class="qc-opts">
    <li data-key="a">"The evidence cannot show what was viewed that evening: the browser's history for those hours is empty, and a cleaning tool ran the next day."</li>
    <li data-key="b">"The suspect did not use the browser that evening."</li>
    <li data-key="c">"The suspect deleted his browsing that evening to hide it."</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). It states the absence, its likely cause and the limit. Option (b) treats absence as proof. Option (c) claims an act and an intention that no record shows.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What the case tells you about the cleaning, and what other sources survive it</summary>

**What Eraser touched.** The answer key records Eraser's targets and its setting (seven passes), and Session 4 showed they were sample pictures and an installer. That knowledge comes from the scenario's documentation, not from the computer: in a real case, you would know only that the tool ran, unless its own logs or the files' old names survive.

**What survives cleaning tools.** A cleaning tool knows about the places it was written to clean. It rarely knows about the change journal, the shadow copies, the Windows search index (where a deleted message survived, Session 14), prefetch files, or records on other machines. That is why an examiner looks in many places, and why the mail store's copy of `It's me`, recovered from free space, still matters after a cleaning.

**Incident-response decisions.** For the client, anti-forensic traces change decisions, not only words. If the employee cleaned his computer, the client cannot assume that the two documents were all that left, so it treats every file he could reach on the share as possibly exposed. That is a response action, and section 3 places it.
</details>

<div class="box key" markdown="1">

Traces of a cleaning tool are evidence in themselves. Conclusions that rest on surviving, independent records keep their strength; conclusions that rest on a missing record must say that the record may have been removed.

</div>

## 3. Response and recovery, revisited

### The idea

Session 1 separated {% include term.html t="incident-response" %} from {% include term.html t="disaster-recovery" %}: one deals with a threat, the other restores a service. Session 13 separated response actions, what you do about this incident now, from recommendations, what changes next time. With the whole case in front of you, you can now place each decision the client must take.

### How it works

NIST SP 800-61 Rev 3 is the current guidance. It places the work under the six Functions of the Cybersecurity Framework 2.0. Rev 2, which it replaced, drew four phases; you will still meet them, so the table names both, and names Rev 2 as Rev 2.

| Decision for the client | Kind | Rev 3 Function | Rev 2 phase (as Rev 2 named it) |
|---|---|---|---|
| Lock the suspect's company accounts, including his access to the share | Response action | Respond | {% include term.html t="containment" %} |
| Preserve the file server's logs at 10.11.11.128 and the mail server's records before they are overwritten | Response action | Respond | Detection and Analysis |
| Treat every file in `Secret Project Data` as possibly exposed, and tell the people who must act on that | Response action | Respond | Containment |
| Remove the personal Drive program and check for other cloud programs on his computer | Response action | Respond | {% include term.html t="eradication" %} |
| Return the computer to use, after imaging it | Response action | Recover | {% include term.html t="system-recovery" %} |
| Hold a review and write a {% include term.html t="lessons-learned" %} report with named actions | Post-incident output | Identify (Improvement) | {% include term.html t="post-incident-activity" %} |

Notice what is missing from the table: disaster recovery. No service was lost, nothing was destroyed, and nothing needs to be restored from backup. This is a security incident from start to end. If the employee had also deleted the share's files, both plans would start at once, and Session 1's rule would apply: preserve first, then restore.

**What post-incident activity produces.** A review that ends in a meeting has failed. For this client, the outputs are things that make the next incident easier to see and to prove:

- **A lessons-learned report** with named actions and owners: who does what, and by when.
- **Logging on the file share**, so that the next read of `Secret Project Data` has a second, independent writer. Today's single-source event is the reason.
- **A rule for personal cloud programs** on company computers, and an alert when one is installed.
- **A playbook for an employee's last weeks**, since this employee searched for cleaning tools and burned a CD in his last two days.
- **A decision about the evidence**: what the client keeps, for how long, and in whose custody. Section 7 returns to it.

Each of these is a {% include term.html t="recommendation" %} in Session 13's sense: a finding, a risk, a change and its evidence.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">The review of the case recommends logging every read on the file share. In NIST SP 800-61 Rev 3, where does this action sit?</p>
  <ul class="qc-opts">
    <li data-key="a">Recover, because it returns the share to normal</li>
    <li data-key="b">Improvement, which Rev 3 places in Identify and which feeds Protect and Detect for the next incident</li>
    <li data-key="c">Containment, because it stops the leak</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The leak is over, so nothing is being contained (c), and no service was lost (a). The action comes out of the review and prepares the next investigation. Rev 2 would call the same work post-incident activity feeding preparation.</p></div>

</div>

<div class="box key" markdown="1">

Place every decision: a response action deals with this incident, a recommendation changes the next one. When no service is lost, disaster recovery has no part to play, and post-incident activity produces changes, not only a meeting.

</div>

## 4. Closing the parallel engagement: contain without destroying

*The unit's second client, the web server suspected of a compromise, was introduced in Session 14. Its evidence is still being prepared, and its analysis will be added to Session 14 and to this section when it is ready. Today you take the incident-response decision on a described scenario, without technical artefacts.*

### The idea

Here is the scenario. A small online shop calls the unit on a weekday morning. Its payment page is sending customers' card details to an unknown site, and an unknown file in the upload folder appears to run commands when it is visited. The web server is still running and still taking orders.

The client's first idea is to switch the server off. That stops the harm at once. It also destroys exactly what the investigation needs most. Session 6's {% include term.html t="order-of-volatility" %} says why: the running processes, the open network connections and the contents of memory exist only while the power is on. The attacker's tool may live only in memory. Its connections show where the stolen data was going.

The client's second idea is to restore the server from last week's backup. That destroys the evidence on the disk too, and if the backup already contains the attacker's file, it restores the attack.

So containment here has two jobs at once: stop the harm now, and keep the evidence. The answer is to isolate first and capture next, and to switch off or restore only after that.

### How it works

**An order of actions:**

1. **Do not switch it off, and do not restore it.** Write down the time, who is present and what is on the screen.
2. **Stop the harm without cutting the power.** Replace the payment page with a maintenance page, or take the shop offline at the router or firewall. Keep a copy of the infected page first.
3. **Isolate the host.** {% include term.html t="host-isolation" %} cuts the server off from every network while it keeps running: a firewall rule or a switch port, or for a cloud server, a rule that blocks all traffic. The attacker loses contact; the memory stays.
4. **Capture volatile evidence, in the order of volatility.** Network connections and running processes, then memory, as in Session 6. Record the tool, its version and its own footprint.
5. **Preserve the logs off the server.** Copy the web server's access log and the system logs to safe storage, with their hash values. An attacker with a shell can edit logs on the server itself.
6. **Image the disk**, or take a snapshot of a virtual or cloud server's disk.
7. **Only now**: remove the attacker's files, rebuild or restore from a backup known to be clean, and change every password and key that the server held.

{% include demo.html id="S17-D3" %}

**Multi-factor authentication for administrative access.** The review will recommend {% include term.html t="multi-factor-authentication" %} for every {% include term.html t="privileged-account" %}: the administrator accounts of the shop, its hosting panel and its server. Session 11 asked you to switch it on for your cloud account. It is the right recommendation, and your report must also state its limits, because a recommendation without them promises too much.

| MFA stops | MFA does not stop |
|---|---|
| A stolen or guessed password used alone | A web shell already on the server: it runs as the web server's own account and never signs in |
| Password reuse from another site's leak | A session cookie stolen after the sign-in, which the attacker reuses without signing in |
| Most automated attacks on sign-in pages | A fake sign-in page that passes the code on to the real site in real time |
| | Repeated push requests that a tired administrator finally approves |
| | An older account or a recovery path that was never given MFA |

{% include term.html t="phishing-resistant-authentication" %}, such as a security key, closes the third row of the right column, because the key checks the real address of the site before it answers. Even so, MFA protects the door, not the building: the shell, the stolen cookie and the forgotten account each need their own recommendation.

<div class="box metaphor" markdown="1">

**The comparison.** Containing a compromised server is like isolating a patient with an infection on a hospital ward. You do not end the patient's life to protect the ward, and you do not send the patient home. You move them to an isolation room where they stay alive, and you take samples.

**Why it fits.** Isolation stops the spread, as host isolation cuts the attacker off. The patient stays alive, as the server keeps running so its memory survives. The samples are taken early, before treatment changes what they show, as volatile evidence is captured before eradication.

**Where it breaks.** An infection does not notice that it has been isolated. An attacker can: some tools delete themselves or damage the system when they lose their connection, so isolation has a cost that must be weighed. And taking a sample from a patient does not change the infection, while capturing memory runs a program on the server and changes a little of what you capture, as Session 6 showed.

**So what.** Isolate and capture before any shutdown, write down the footprint of your own tools, and agree the order with the client before the day it is needed, in its playbook.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A compromised web server is sending card details to an attacker. Which first actions keep the most evidence while stopping the harm?</p>
  <ul class="qc-opts">
    <li data-key="a">Switch the server off at once, then image its disk</li>
    <li data-key="b">Restore the server from last week's backup, then investigate the backup</li>
    <li data-key="c">Replace the payment page and isolate the server from the network while it runs, capture its connections, processes and memory, copy its logs off the server, then image the disk</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). It stops the theft and keeps the volatile evidence. Switching off (a) loses memory and connections; restoring first (b) loses the disk's evidence and may restore the attacker's file with it.</p></div>

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">After the incident, the shop turns on MFA for all administrator accounts. Which threat does this NOT remove?</p>
  <ul class="qc-opts">
    <li data-key="a">A web shell left on the server, which runs commands as the web server's own account</li>
    <li data-key="b">An attacker who bought an administrator's password from another site's leak</li>
    <li data-key="c">An automated attack that guesses passwords on the administrator sign-in page</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). A shell never signs in, so MFA never sees it. MFA does stop a password used alone (b) and guessing on the sign-in page (c). The shell needs eradication and a rebuild.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Cloud servers, legal duties and when isolation is not possible</summary>

**Cloud servers.** On a cloud provider, isolation is a network rule that blocks all traffic to the instance, the disk image is a snapshot, and memory capture needs an agent or a tool run inside the instance. Session 11's shared-responsibility model decides what you can reach: the provider will not capture your instance's memory for you.

**When isolation is not possible.** If the server cannot be isolated without stopping a service that people depend on, the decision is a business one, made by the client with the unit's advice, and written down with its reasons. The unit's job is to say what each choice costs in evidence.

**Legal duties.** Card data and customers' names are personal data. The shop may have a legal duty to report the breach to a regulator and to tell its customers, and its card-payment contracts carry their own rules. Section 5 names the data protection laws. A duty to report never justifies destroying evidence: reporting goes faster when the evidence is sound.
</details>

<div class="box key" markdown="1">

Contain without destroying: stop the harm, isolate the host, capture what is volatile, copy the logs off, image the disk, and only then remove and restore. Recommend MFA for every privileged account, and state what it does not stop.

</div>

## 5. The law around the work

### The idea

Everything the unit did is lawful only because of the authority behind it. The same act, reading someone's mail, copying a disk, capturing traffic, can be an examination or an offence, depending on who allowed it and why. So an examiner needs to know which laws touch the work, and what each one asks of them.

This section names the laws for the two places that matter to you: the United Kingdom, whose university awards your degree, and Sri Lanka, where you study and may work. It does not teach the law. It tells you what each law means for an examiner's day. None of it is legal advice.

Sessions 7, 9, 11 and 14 each said that Session 17 would return to the law. Here are their questions: capturing traffic (Session 7), holding malware samples (Session 9), evidence held in another country (Session 11), and asking a provider to keep records (Session 14).

### How it works

**United Kingdom.**

| Law | What it covers | What it means for an examiner |
|---|---|---|
| Computer Misuse Act 1990 | Offences of unauthorised access (section 1), access with intent to commit a further offence (section 2), acts that impair a computer (section 3), acts causing serious damage (section 3ZA), and making, supplying or obtaining articles for those offences (section 3A) | Your access to every system and account must be authorised, in writing, by someone entitled to give it. Signing in to the suspect's personal Gmail account with a password found on his computer would be unauthorised access. Holding tools and samples for defensive work is lawful when the purpose is clear (Session 9) |
| Investigatory Powers Act 2016 | The offence of intercepting a communication in the course of its transmission without lawful authority (section 3) | Capturing other people's traffic needs a legal basis, such as the network owner's authority for its own network. In this module you captured only your own VM (Session 7) |
| Data Protection Act 2018 and the UK GDPR | How personal data is collected, used, kept and protected. Both were amended, not replaced, by the Data (Use and Access) Act 2025, whose main data protection changes came into force in 2026 | Evidence is full of personal data. You need a lawful basis, you use only what the case needs, you keep it secure, and you keep it no longer than needed |
| The Forensic Science Regulator's statutory Code of Practice (version 2, made under the Forensic Science Regulator Act 2021) | Forensic science for the criminal justice system in England and Wales, including data capture, processing and analysis from digital storage devices | Methods must be validated before use; reports must declare their limitations; disclosure duties must be met; some activities need accreditation |
| The Criminal Procedure Rules 2025, Part 19 | Expert evidence in criminal courts in England and Wales | The expert's duty to the court overrides any obligation to whoever instructs or pays the expert (rule 19.2). The report states the facts relied on, the range of opinion and the reasons for the expert's own view, and what the court needs to judge reliability (rule 19.4) |

**Sri Lanka.**

| Law | What it covers | What it means for an examiner |
|---|---|---|
| Computer Crime Act No. 24 of 2007 | Offences including unauthorised access (section 3), dealing with unlawfully obtained data (section 7), illegal interception (section 8) and illegal devices (section 9); and the investigation: a panel of experts (section 17), search and seizure (section 18), preservation of information (section 19) and confidentiality of what an investigation obtains (section 24) | The same rule of authority as in the UK, with interception and devices named as offences. An expert appointed to an investigation has powers and a duty of confidentiality. A preservation request, Session 14's way to freeze a provider's records, has its home in section 19 |
| Evidence (Special Provisions) Act No. 14 of 1995 | The admissibility of contemporaneous recordings (Part I) and of computer evidence (Part II, section 5), with conditions and notice to the other side | Computer evidence must meet the Act's conditions before a court will hear it. A clean chain of custody and proof that the computer and your tools worked properly are how an examiner helps it meet them |
| Personal Data Protection Act No. 9 of 2022 | Sri Lanka's data protection law, with a Data Protection Authority | Its main duties on how personal data is processed come into force in stages by Minister's Order, after an amending Act of 2025. An Order of July 2026 brings Parts I and III into operation on 1 January 2027; the rights of individuals and the penalties wait for a further Order. Check the Authority's site for what is in force when you read this. Its principles are already good practice for every examiner |

**Across borders.** Evidence is often in another country: Google's records of the personal account are not in the client's office. The Council of Europe's Convention on Cybercrime, the Budapest Convention, gives its Parties a shared way to ask each other to preserve data quickly and to hand over evidence. The United Kingdom has been a Party since 2011 and Sri Lanka since 2015. The formal route between countries is {% include term.html t="mutual-legal-assistance" %}: one country's authority asks another's, and the other country collects the evidence under its own law. It is slow, as Session 11 warned, which is why a preservation request comes first, as Session 14 explained.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">During the examination, an analyst finds the password of the suspect's personal Gmail account saved on his computer. What may the unit do with it?</p>
  <ul class="qc-opts">
    <li data-key="a">Sign in to the account to see what was shared, because the client owns the computer</li>
    <li data-key="b">Record it as a finding and report it; reaching the account's records needs the provider's response to legal process, never the found password</li>
    <li data-key="c">Delete it from the image, because it is personal data</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The client owns the computer, not the personal account, so signing in (a) would be unauthorised access under both countries' computer crime laws. Altering the image (c) breaks forensic soundness; data minimisation is about what you use and report, not about changing evidence.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Two more laws, the protocols, and why this table will age</summary>

**Electronic records in Sri Lanka.** The Electronic Transactions Act No. 19 of 2006, amended in 2017, gives electronic records legal recognition and has its own rule for business records. Which Act governs a given record is a question for a lawyer; an examiner's part is a record whose integrity can be shown.

**The protocols.** The Budapest Convention has a Second Additional Protocol (opened in 2022) for faster cooperation, including direct requests to providers in other Parties. Both the UK and Sri Lanka have signed it; signing is not the same as being bound, so check its status before relying on it.

**Why this table will age.** Laws change, and data protection law is changing fast in both countries. A professional checks the current text on the official sites (legislation.gov.uk; documents.gov.lk and the Data Protection Authority's site) before relying on any line here.
</details>

<div class="box key" markdown="1">

Authority makes an examination lawful. Know which law covers access, interception, personal data, expert evidence and evidence abroad in the place you work, and check its current text before relying on it.

</div>

## 6. Standards and the court

### The idea

A finding is useful to a client only if it can survive a test. In the end, that test is often a court, where the other side's lawyer asks one question in many forms: "How do you know?"

Standards are the profession's agreed answer to that question before it is asked. The court is where the answer is tested.

### How it works

**Standards.** ISO/IEC 27037:2012 gives guidelines for four processes: the identification, collection, acquisition and preservation of digital evidence. They are the same habits that Session 1 named through the ACPO principles: change nothing that may be relied on; if you must, be competent and explain it; keep a record another examiner could follow; and the person in charge answers for it. Session 1 called the result {% include term.html t="forensically-sound" %}. In England and Wales, the Forensic Science Regulator's Code adds that the methods themselves must be validated.

**Admissibility.** {% include term.html t="admissibility" %} is whether a court lets evidence be heard at all. Each country has its own rules, as section 5 showed. What they share is a demand that the evidence is relevant, that it is what it claims to be, and that the way it was obtained and handled can be trusted.

**Two kinds of witness.**

| | {% include term.html t="witness-of-fact" %} | {% include term.html t="expert-witness" %} |
|---|---|---|
| Says | What they saw, heard or did | What the evidence means, in their opinion |
| Example | "I imaged the disk at 10:02 and recorded this hash value." | "The two uploads and the mail are consistent with the documents leaving by Drive, for these reasons." |
| Allowed because | They were there | Their knowledge is beyond the court's own |
| Duty | To tell the truth | To tell the truth, and to help the court: this duty overrides any duty to the client |

An examiner is often both, in one report. Keep the two apart, exactly as Session 16 kept fact apart from opinion.

**Tools that are tested.** {% include term.html t="tool-validation" %} means testing a tool on data with a known answer before you trust it with evidence. Its result includes the tool's {% include term.html t="error-rate" %} and where it fails. Session 16 saw the reason: three recovery tools gave three different answers on the same files. Session 5 saw a gentler version: prefetch and UserAssist disagreed about Eraser, because they count different things. A validated method knows such differences in advance and says so.

**Disclosure.** {% include term.html t="disclosure" %} is giving the other side the material that may weaken your own side's case or help theirs. In a criminal case, an expert must tell the side that instructed them about such material, so that it can be disclosed. A finding left out because it did not suit the client is not a gap in a report: it is a breach of duty.

**How a defence tests a method.** A good defence rarely attacks the conclusion first. It attacks the steps that lead to it:

- **The chain** (Session 1): a gap in the custody record, a hash value that was not recorded, a copy whose origin cannot be shown.
- **The hypothesis** (Session 8): a claim reported as a finding without being tested, such as an alert taken as proof.
- **The tools** (Session 16): a recovered record that one tool shows and another does not, with no check of the bytes.
- **The clock** (Session 5): a time not normalised, so that two events appear in the wrong order.
- **The alternatives** (Session 14): an innocent reading that was not considered, such as the IT-security employee's searches.

Walk an exhibit to court in the demo, and break one step at a time.

{% include demo.html id="S17-D4" %}

<div class="box metaphor" markdown="1">

**The comparison.** An expert witness is like a doctor whom an employer pays to report on whether a worker is fit to work. The employer pays the fee, but the doctor's report must be true, whatever the employer hoped to read.

**Why it fits.** The client pays the unit, as the employer pays the doctor. The report's reader, the court or the worker's case, relies on it because the writer is a professional who answers to a duty above the payer. A doctor who writes what the employer wants loses the trust that made the report worth paying for.

**Where it breaks.** A doctor's report is usually read once and accepted. An expert's report enters a contest: the other side has its own expert, and cross-examination tests every step in public. And the expert's duty is not only conscience or a professional code: in England and Wales it is written into the court's own rules, which say it overrides the duty to the payer.

**So what.** Write every report as if the other side's expert will read it line by line, because they will. Include the limitations, the alternatives you tested and the results that did not help your client.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">Two recovery tools gave different answers on the same database, and the examiner reports only the tool whose answer supports the client. What has gone wrong?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing: the examiner chose the better tool</li>
    <li data-key="b">Only a citation problem: both tools should be cited</li>
    <li data-key="c">A breach of the expert's duty: the disagreement is material that may weaken the case, so it must be stated, checked against the bytes and disclosed</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The disagreement matters to the reliability of the finding, and the duty to the court overrides the client's interest. Choosing a tool (a) is fine only with a reason the report gives; citing both (b) without stating the disagreement still hides it.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What the court's rules ask of a report, and accreditation</summary>

**The report.** The Criminal Procedure Rules 2025 list what an expert's report contains, among them the facts and instructions it relies on, a summary of the range of opinion where there is one, with reasons for the expert's own view, information the court needs to decide whether the opinion is reliable, and a declaration that the expert understands and will keep the duty to the court. The Forensic Science Regulator's Code asks reports to declare their limitations and to keep evidence of opinion apart from evidence of fact. Session 16's report section already does most of this.

**Accreditation.** The Code links some activities to accreditation against ISO/IEC 17025, the general standard for testing laboratories. A university unit is not accredited, which is one reason your coursework is a report, not a statement for court.

**Sri Lanka.** The Computer Crime Act provides for a panel of experts who assist investigations, and the Evidence (Special Provisions) Act sets the conditions for computer evidence. The questions a defence asks are the same in both countries.
</details>

<div class="box key" markdown="1">

Standards answer "how do you know?" before it is asked. In court, the expert's duty is to the court, not the client: keep fact apart from opinion, use validated tools, state their known errors, and disclose what does not help your side.

</div>

## 7. Ethics: the power to see everything

### The idea

In this module you read a man's mail, his searches, his cloud account's records and the moment he left work each day. You read a stranger's test phone, with her photographs and her messages. Nobody asked them. That is the nature of the work: an examiner sees far more than the question needs.

The law sets the outer limits. Ethics decides what you do inside them.

<div class="box lens" markdown="1">

**Through another lens: *Minority Report*.** In Steven Spielberg's 2002 film, based on a story by Philip K. Dick, the police of a future city arrest people for murders they have not yet committed. Three people with visions of the future, the "precogs", see the crimes in advance, and the system is trusted completely. The plot turns on a secret: sometimes one of the three sees a different future, a "minority report", and the system hides it, because a system that is sometimes uncertain would lose its authority. Due process has gone: the record of what will happen has replaced the evidence of what did.

**Where it breaks.** Forensics works on what happened, not on what will happen; nobody in this module predicts a crime. But the film's warning carries over. Trusting a tool's output, or a confident timeline, without testing it is the same mistake on a smaller scale. And hiding a result that does not fit, a second tool's disagreement, a limitation, a finding that helps the other side, is exactly the minority report the system buried.

**The question it raises.** The film's city could see everything. Its failure was not the seeing; it was what it allowed itself to do with what it saw. What will you allow yourself?

</div>

<div class="box key" markdown="1">

**The pivotal idea.** The power to see everything imposes a duty over what you do with it.

</div>

The same question sits at the centre of a wider public debate between privacy and security. One side says that seeing more keeps people safe. The other says that seeing more harms people, even when nothing is done with it, and that power over information is easily misused. An examiner lives inside that debate every day, on a small scale.

### How it works

Six duties turn the pivotal idea into practice.

**1. Authority and scope.** Work only with written authority, and only inside its {% include term.html t="scope-of-authority" %}. The client authorised the unit to examine its own computer and accounts. It could not authorise access to the suspect's personal Gmail account, which is why Session 14 sent that question to legal process.

**2. Proportionality.** {% include term.html t="proportionality" %} asks whether each intrusion is needed for the question. Searching the suspect's whole disk for the client's documents is proportionate. Reading years of his private photographs to "get a sense of him" is not.

**3. Collateral and third-party data.** {% include term.html t="collateral-data" %} is everything you see that the case does not need: the suspect's evening news reading, his family's messages, a colleague's mail in a shared folder. You do not report it, you do not discuss it, and you do not use it. If it reveals a serious crime, such as a risk to a child, you stop and raise it through the procedure your organisation has for it, not on your own.

**4. Privacy, even in public datasets.** The CFReDS case and the test phone are public, but public is not the same as consent. The unit kept the test persona's phone numbers and e-mail addresses off every page and out of every report, and used the phone only for what it is published for: learning the method. Session 16 promised this answer about evidence like the test phone's: the unit may examine it for training within its published terms; it may not contact or identify the persona, republish her contact details, or decrypt what she protected without an authority to do so. That is {% include term.html t="data-minimisation" %}, applied.

**5. Retention and disposal.** Every piece of evidence has a {% include term.html t="retention-period" %}, set by law, by contract or by the case. When it ends, evidence is returned or destroyed safely, and the destruction is recorded in the custody record. Copies on a laptop or a USB stick at home break both the chain and the law.

**6. Bias, and the duty to report what does not fit.** {% include term.html t="confirmation-bias" %} is the habit of trusting what supports what we already believe. Examiners who are told "this man leaked the files" start looking for proof, not for truth. Session 8 tested the defence's "it was malware" with the same care as the accusation; Session 14 tested the IT-security employee's innocent reading. The duty that follows is simple to state and hard to keep: report what the evidence shows, including what does not fit the client's preferred answer.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The client owns the laptop, so we can read everything on it." | "We read what the scope of authority allows and the question needs." | Ownership of a device is not consent from every person whose data is on it. |
| "It's a public dataset, so privacy doesn't apply." | "It is public for learning; contact details and identities stay out of our work." | Publication is not consent to republish. |
| "We found it, so it goes in the report." | "It goes in if it bears on the question; collateral data stays out." | A report is not an inventory of a person's life. |
| "The client asked us to drop that line." | "That line is a limitation the evidence requires; it stays." | The duty to the court and to the truth overrides the client. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">While building the timeline, an examiner notices the suspect's searches about a medical condition. The searches have nothing to do with the leak. What should the examiner do?</p>
  <ul class="qc-opts">
    <li data-key="a">Add them to the timeline, because a complete timeline is more professional</li>
    <li data-key="b">Leave them out of the timeline and the report, mention them to no one, and keep working: they are collateral data</li>
    <li data-key="c">Delete them from the image, to protect his privacy</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Health searches unrelated to the question are collateral data: using or reporting them is not proportionate. A timeline holds what the question needs (a). Changing the image (c) is never allowed: privacy is protected by what you use and report, not by altering evidence.</p></div>

</div>

<div class="box key" markdown="1">

Work inside your authority, intrude no further than the question needs, leave collateral data alone, protect people even in public data, keep evidence only as long as allowed, and report what the evidence shows, especially when it does not fit.

</div>

## 8. The lab: one case, one clock, one summary; then the debate

Your task in one line: in about ninety minutes, build one timeline in UTC from the computer, network and cloud threads of the integration pack, mark which events are corroborated and which stand alone, and write a short incident summary; then debate two ethical scenarios.

You need the Windows VM with Timeline Explorer, DB Browser for SQLite, Notepad and PowerShell; your Session 5, 14 and 16 notes; and the files from folder `S17` on the lab share. Kali and REMnux stay off. The session uses no new tool.

<div class="box lms" markdown="1">

Folder `S17` on the lab share holds the integration pack: `s17-computer.zip`, `s17-mail.zip`, `s17-cloud.zip`, `s17-parsed.zip`, the question sheet, the two forms and `s17-evidence-register.csv`. If you are studying away from the lab, the LMS explains how to get the same files.

</div>

**What you receive.** Six exhibits, all in the register with their hash values:

| Exhibit | File in folder `S17` | What it is |
|---|---|---|
| S17-001 | `s17-computer.zip` | Excerpts of the suspect's computer: registry hives, the change journal, prefetch, LNK files and jump lists, event logs, `setupapi.dev.log`, the two browsers' history files |
| S17-002 | `s17-mail.zip` | The mail store `iaman.informant@nist.gov.ost` |
| S17-003 | `s17-cloud.zip` | The Drive program's `sync_log.log`, its `snapshot.db` from the shadow copy (Session 16) and the unit's export of the recovered rows |
| S17-004 | `s17-parsed.zip` | The unit's parsed outputs from Sessions 5, 14 and 16's tools: the working layer for today |
| S17-005 | `s17-question-sheet.md`, `s17-timeline-form.csv`, `s17-summary-form.md` | The questions, by time box, and the two forms |
| S17-006 | `s17-evidence-register.csv` | Every exhibit with its rule, its hash value and the hash values of the sources it was cut from |

The pack is cut by a written rule from three earlier exhibits: Session 5's triage collection, Session 2's image and Session 16's set. The rule and both hash values of each source are in the register. It leaves out everything the questions do not need: the master file table, other users' files, the removable media and the CD.

<div class="box safety" markdown="1">

**Three rules for today.**

1. **Never open an original.** Everything in `C:\Evidence\S17` stays as you copied it. You work on copies in `C:\Cases\S17`.
2. **Never open a link or contact anyone from the evidence.** The Drive links and every address are evidence, not places to visit.
3. **Collateral data stays out.** If you see something about the suspect that the questions do not need, leave it out of your notes, your timeline and your summary.

</div>

### Part A: the timed investigation (90 minutes)

The time boxes keep you moving. If a box runs out, write what you have, mark what is missing, and move on: an honest gap is better than an unfinished summary.

**Box 1: receive and verify (10 minutes)**

1. **Copy and hash.** Create `C:\Evidence\S17` and `C:\Cases\S17`. Copy the contents of folder `S17` into `C:\Evidence\S17`, then in PowerShell:

   ```powershell
   Get-ChildItem C:\Evidence\S17 -File | Get-FileHash -Algorithm SHA256 |
     Select-Object Hash, Path | Export-Csv C:\Cases\S17\s17-hashes.csv -NoTypeInformation
   Import-Csv C:\Evidence\S17\s17-evidence-register.csv | Format-Table exhibit, file, sha256
   ```

   <div class="box expect" markdown="1">

   Every file's value matches its row in the register. The register also lists four sources (S02-001, S05-002, S16-001 and S16-005) with their own hash values: you do not have those files today, and you do not need them.

   </div>

   <div class="box trouble" markdown="1">

   If a value differs, copy that file again. If it still differs, stop and tell the lecturer, as in Session 1.

   </div>

2. **Unpack the copies.** Expand each ZIP file into `C:\Cases\S17`, and copy `s17-timeline-form.csv` there as `s17-integrated-timeline.csv`.

   ```powershell
   Get-ChildItem C:\Evidence\S17\*.zip | ForEach-Object { Expand-Archive $_.FullName -DestinationPath C:\Cases\S17 }
   Copy-Item C:\Evidence\S17\s17-timeline-form.csv C:\Cases\S17\s17-integrated-timeline.csv
   ```

   <div class="box expect" markdown="1">

   Four folders in `C:\Cases\S17`: `s17-computer`, `s17-mail`, `s17-cloud` and `s17-parsed`. The timeline form holds Session 5's seven column names and one example row.

   </div>

   <div class="box trouble" markdown="1">

   If `Expand-Archive` says a path is too long, expand into `C:\S17` instead and use that folder for the rest of the lab.

   </div>

**Box 2: the network thread (20 minutes)**

3. **The computer's own address.** Open `s17-parsed\regripper-nic2.txt` in Notepad. Find the network card's settings.

   <div class="box expect" markdown="1">

   The address 10.11.11.129 with the mask 255.255.255.0, given by DHCP from the server 10.11.11.254, with the gateway and name server 10.11.11.2. Write them in your notes with their source: the `SYSTEM` hive, in `s17-computer`.

   </div>

   <div class="box trouble" markdown="1">

   If the file shows no DHCP values, open the `SYSTEM` hive from `s17-computer` (folder `Windows`, then `System32`, then `config`) in Registry Explorer, read-only. Go to `ControlSet001`, then `Services`, `Tcpip`, `Parameters` and `Interfaces`: the card's key holds `DhcpIPAddress` and `DhcpServer`.

   </div>

4. **The share.** Open `s17-parsed\regripper-runmru.txt` and `s17-parsed\regripper-mndmru.txt`, then `s17-parsed\shellbags-usrclass.csv` in Timeline Explorer. Filter for `10.11.11.128`.

   <div class="box expect" markdown="1">

   `\\10.11.11.128\secured_drive` in RunMRU and in the Map Network Drive MRU, and shellbag rows for folders under `Secret Project Data` on 23 March 2015. Write each time in UTC and its source. The registry and shellbag times are already in UTC.

   </div>

   <div class="box trouble" markdown="1">

   A registry key holds one last-write time for the key, not one per value (Session 5). If RegRipper prints only the key's time, write it with the words "key last written", and use the shellbags for the folders' times.

   </div>

5. **The addresses the mail and the Drive program wrote.** Open `s17-parsed\mail-index.csv` in Timeline Explorer and look at the columns `internet_headers` and `received_lines`. Then search `s17-parsed\sync_log.log` in Notepad for numbers in the form of an address and for host names.

   <div class="box expect" markdown="1">

   Either the store kept Internet headers for some messages, and you read their `Received` lines from the bottom up as in Session 14, with every time normalised to UTC; or it kept none, and you write that as a finding and a limitation: "the mail store kept no transport headers, so the route and the servers' clocks cannot be read from it". The same for the Drive log: list any addresses and host names it holds, or write that it holds none.

   </div>

   <div class="box trouble" markdown="1">

   An address in a mail header was written by the server that received the message, about the server or device that sent it to it. Write whose record each address is. An address inside the client's network, such as 10.11.11.x, says nothing about the internet side.

   </div>

**Box 3: the computer, the cloud and the mail together (25 minutes)**

6. **The renames.** Open `s17-parsed\usnjrnl.csv` in Timeline Explorer. Filter the column `UpdateReasons` for `RenameNewName` and go to 23 March 2015, from 20:30 to 20:32.

   <div class="box expect" markdown="1">

   Two renames: the pricing spreadsheet, (secret_project)_pricing_decision.xlsx, to `happy_holiday.jpg` at 20:30:44, and the meeting presentation, [secret_project]_final_meeting.pptx, to `do_u_wanna_build_a_snow_man.mp3` at 20:31:02. The old name is in the row with `RenameOldName` just before each.

   </div>

   <div class="box trouble" markdown="1">

   If you see no rows, clear the other filters and check the date: the journal is in UTC, so the renames are not at 16:30.

   </div>

7. **The cloud program.** In `s17-parsed\sync_log.log`, find the sign-in with the personal account, the two `CREATE` lines and the `DELETE` lines on 23 March, and the sign-out on 25 March.

   <div class="box expect" markdown="1">

   Every line is written in local time with `-0400`: 16:05:32, 16:32:35, 16:42:17 and, on 25 March, 11:22:47. In UTC, add four hours: 20:05:32, 20:32:35, 20:42:17 and 15:22:47. Write `local (UTC-4), offset in the line` in `original_zone`.

   </div>

   <div class="box trouble" markdown="1">

   If your times are four hours apart from the change journal's renames, you forgot the offset. The renames come two minutes before the upload, never four hours after it.

   </div>

8. **The mail and the bridge.** In `s17-parsed\mail-index.csv`, find `It's me`, then open `s17-parsed\unit-recovered-cloud-entry.csv` and match its two link codes to two file names.

   <div class="box expect" markdown="1">

   `It's me`, recovered, sent at 20:38:47 UTC with two `drive.google.com` links. The recovered rows tie `0Bz0ye6gXtiZaVl8yVU5mWHlGbWc` to `do_u_wanna_build_a_snow_man.mp3` and `0Bz0ye6gXtiZaakx6d3R3c0JmM1U` to `happy_holiday.jpg`, as in Session 16. The chain runs from two client documents, to two renamed files, to two uploads, to two links in a mail.

   </div>

   <div class="box trouble" markdown="1">

   If `It's me` is not in the index, look for rows with the state `recovered`: it was recovered from the store's free space, and its folder may be empty. Session 14's quote inside the reply `RE: It's me` also gives it, at minute precision.

   </div>

**Box 4: the last morning, and what it does to confidence (15 minutes)**

9. **The cleaning.** Open `s17-parsed\prefetch.csv` in Timeline Explorer and filter `ExecutableName` for `eraser`, `ccleaner` and `uninst`. Then open `s17-parsed\ie-history.csv` and find 25 March.

   <div class="box expect" markdown="1">

   The searches `anti-forensic tools`, `eraser` and `ccleaner` from 14:46:44 UTC; `ERASER.EXE` last run at 15:13:30 with run count 2; `CCLEANER64.EXE` at 15:15:50; `UNINST.EXE` at 15:18:29. Add the Drive sign-out from step 7 at 15:22:47.

   </div>

   <div class="box trouble" markdown="1">

   If the IE history shows the program as "Microsoft Edge", that is Autopsy's label for Internet Explorer's `WebCacheV01.dat`, as in Session 14.

   </div>

10. **Write two confidence statements** in your notes, using Session 16's phrases: one for "the two client documents left by Google Drive" and one for "no other file left the company". Say what each rests on.

    <div class="box expect" markdown="1">

    The first rests on independent, surviving records and reads "the evidence shows". The second rests on absence after a cleaning tool ran and reads "the evidence cannot show", with the reason (section 2).

    </div>

    <div class="box trouble" markdown="1">

    If both statements read "the evidence shows", ask of the second: which record shows that nothing else left? There is none.

    </div>

**Box 5: one timeline and one summary (20 minutes)**

11. **Fill the timeline.** In `s17-integrated-timeline.csv`, replace the example with at least fifteen rows from Boxes 2 to 4, in Session 5's seven columns. Use the column `tag` for two words: `corroborated` (followed by the independent record that agrees) and `single-source`.

    <div class="box expect" markdown="1">

    A line looks like this:

    ```
    2015-03-23T20:32:35Z,File created,C/Users/informant/AppData/Local/Google/Drive/user_default/sync_log.log,Google Drive log,CREATE happy_holiday.jpg and do_u_wanna_build_a_snow_man.mp3 (upload),"local (UTC-4), offset in the line",corroborated: mail It's me (Outlook) links the same two files
    ```

    At least one row tagged `corroborated` and one tagged `single-source`. Every row has its clock in `original_zone`.

    </div>

    <div class="box trouble" markdown="1">

    If you are tempted to tag the share access `corroborated` because three records show it, ask who wrote them. If a description needs a comma, put it inside double quotes, as in Session 5.

    </div>

12. **Write the incident summary** in `s17-summary-form.md`, under its headings: three findings, each with its exhibit, its time in UTC and a confidence phrase; one limitation in Session 13's three parts; two recommendations, each with its finding; and, above them, an executive summary of three sentences written last (Session 16).

    <div class="box expect" markdown="1">

    About 250 to 350 words. The single-source share access appears as a limitation or as the reason for a recommendation (logging on the share). No sentence names a person as the one at the keyboard.

    </div>

    <div class="box trouble" markdown="1">

    If your summary is mostly method, cut it: the method is in your timeline. If a sentence has no finding behind it, delete it or write the finding.

    </div>

### Part B: the ethics debate (35 minutes)

The room splits into four teams. Two scenarios, two teams each: one team argues for the motion, the other against. All four teams prepare for 5 minutes. Then each scenario takes 15 minutes: 3 minutes for each side, 1 minute for each reply, and 7 minutes in which the room tests both arguments against section 7, the expert's duty in section 6 and the laws in section 5.

**Scenario A: collateral data.** While building today's timeline, an analyst finds that the suspect's computer also holds his private messages to a relative about a family illness, and the browsing of his last evenings. A colleague says: "Put it all in an appendix. More context helps the client understand him." The motion: *the appendix should include it*.

**Scenario B: the client's request.** The client's manager reads the draft summary and asks the unit to remove one sentence: "The evidence cannot show who was at the keyboard." The manager says it "weakens the case for dismissal" and adds that the client is paying for the report. The motion: *the unit should remove the sentence*.

<div class="box expect" markdown="1">

Each team names at least one duty from section 7 and one rule from section 5 or 6. Write down the strongest argument you heard against your own side.

</div>

### Checkpoint

Hand in your timeline and your summary. They are judged against the integration pack's ground truth. It is formative and is not marked here, but the timeline rehearses your coursework's analysis and the summary its writing.

| # | Check | Your proof |
|---|---|---|
| 1 | Every exhibit verified against the register | `s17-hashes.csv` |
| 2 | At least fifteen rows in the seven columns, every time in UTC with its clock | `s17-integrated-timeline.csv` |
| 3 | The key events of the case at the right times, within one minute: the sign-in, the share, the renames, the upload, the mail, the deletion, the USB stick, the cleaning and the sign-out | `s17-integrated-timeline.csv` |
| 4 | Rows from the computer, network, cloud and mail threads, with corroborated and single-source events tagged correctly | `s17-integrated-timeline.csv` |
| 5 | A summary whose findings name their exhibit, time and confidence, with one limitation, two recommendations and an executive summary written last | `s17-summary-form.md` |

The lecturer checks the timeline against the case's answer key event by event, so each key row is right or wrong. The summary is read against a model.

### If you have time

**Check one parsed row against its raw file.** Open the suspect's `NTUSER.DAT` from `s17-computer` (folder `Users`, then `informant`) read-only in Registry Explorer. Go to `Software`, then `Microsoft`, `Windows`, `CurrentVersion`, `Explorer` and `RunMRU`, and find the share's path. A parsed output is a tool's reading; the hive is the record.

**Find the second day.** On 24 March 2015, the share was reached again shortly before the USB stick's first connection at 13:58:32 UTC. Find what records it, and decide whether the two events are corroborated or only close in time.

## Check yourself

**1. Explain the difference between correlation and corroboration, with an example from the case.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Correlation links records of the same activity, for example the Drive log and the Drive database by file name. Corroboration is when the linked records are independent and agree, for example the Drive log's upload and the mail written by Outlook six minutes later that links the same two files. The points that earn marks: (1) correlation is the linking method; (2) corroboration needs independent writers; (3) a correct example of each.
</details>

**2. Explain why the share access on 23 March is a single-source event, and what would corroborate it.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
All three records of it, RunMRU, the Map Network Drive MRU and the shellbags, were written by Windows Explorer on the suspect's computer, so they are one source. The file server's own access records at 10.11.11.128 would corroborate it, because another machine and another program wrote them. The points that earn marks: (1) one writer on one machine; (2) the server's records as an independent source; (3) the event is still reported, tagged as single-source.
</details>

**3. A cleaning tool ran on a suspect's computer. Explain how this changes the confidence of two kinds of conclusion.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Conclusions that rest on records that survived and agree, such as an upload confirmed by an independent mail, keep their strength. Conclusions that rest on a record being absent, such as "nothing else left", lose it, because the missing record may have been removed, so they must say "the evidence cannot show". The points that earn marks: (1) surviving independent records stand; (2) absence is not proof after cleaning; (3) the trace of the tool is itself a finding.
</details>

**4. Explain why a compromised web server should not simply be switched off, and give the order of the first actions.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Switching off destroys the volatile evidence, the running processes, connections and memory, which may hold the attacker's tool and show where stolen data went. The harm is stopped instead by replacing the page and isolating the host while it runs; then volatile evidence is captured in the order of volatility, logs are copied off the server, the disk is imaged, and only then is the server cleaned and restored. The points that earn marks: (1) what switching off loses; (2) isolation stops the harm and keeps the power; (3) capture before eradication and restore.
</details>

**5. State two threats that multi-factor authentication for administrators stops and two that it does not.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
It stops a stolen or guessed password used alone, and password reuse from another site's leak. It does not stop a web shell already on the server, which never signs in, or a session cookie stolen after a sign-in; a fake page that relays codes is stopped only by phishing-resistant authentication. The points that earn marks: (1) two correct threats stopped; (2) two correct threats not stopped; (3) the reason, that MFA protects the sign-in only.
</details>

**6. Explain the difference between a witness of fact and an expert witness, and the expert's duty.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A witness of fact tells the court what they saw or did, such as imaging a disk and recording its hash value; an expert witness gives opinions on what the evidence means, because their knowledge is beyond the court's. The expert's duty is to help the court, and in England and Wales the court's rules say this overrides any obligation to the person who instructs or pays them. The points that earn marks: (1) fact against opinion; (2) why an expert may give opinions; (3) the duty to the court over the client.
</details>

**7. A client asks the unit to leave a limitation out of its report. Explain what the unit should do, and why.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The unit keeps the limitation, explains to the client why it is required, and records the request. A limitation the evidence requires is part of the truth of the finding, the expert's duty to the court overrides the client's interest, and material that weakens the client's case must be disclosed. The points that earn marks: (1) the limitation stays; (2) the duty to the court and to the truth; (3) disclosure.
</details>

## Coming next

Today you saw the whole case on one clock, and the frame of law and ethics around it. Session 18 is the coursework workshop: the rubric, the report and the viva, with time to work on your own cloud incident. The mock phase test closes Day 9; it is issued through the LMS, not on this portal.
