---
session_code: S12
description: "Collecting evidence you can never image: copies through the provider's interfaces, the two delivery clocks observed in your own account, your own requests in the record, hashing on arrival, validate-logs and what it proves, object metadata and ETags, the version history listed first, and a deleted object recovered by version ID without changing the bucket."
hook: >-
  The cloud drop is built, its records are switched on, and the incident has happened. Today the unit collects.
  It cannot seize anything, so every piece of evidence arrives as a copy that the provider hands over, on the provider's schedule.
  What has arrived, what may still be missing, and how will a stranger know that each copy is exactly what AWS held?
outcomes:
  - "Explain why cloud evidence is acquired as copies through the provider's interfaces, and what makes such a copy defensible"
  - "Identify which records have arrived and when, and state the completeness of each record as a limitation"
  - "Explain how the collection's own requests enter the records, and record the time and address of the collection"
  - "Apply hashing on arrival, read-only originals, working copies, a custody record and an evidence register to a cloud collection"
  - "Justify what a passing log-file validation proves and what it does not, and explain why server access logs have no such check"
  - "Compare the ETag of each object version with the MD5 hash value of a local copy, and explain when that comparison is valid"
  - "Apply list-object-versions before any recovery, recover a deleted object by version ID without changing the bucket, and explain why removing the delete marker is not a collection step"
before:
  - "Make a [working copy](../s01/#2-the-forensic-image-copy-everything-then-work-on-the-copy) and keep the original untouched (Session 1)"
  - "Use a [hash value](../s01/#3-the-hash-value-showing-that-nothing-changed) for verification, and keep a [custody record and an evidence register](../s01/#4-chain-of-custody-the-record-that-holds-the-evidence-together) (Session 1)"
  - "Explain why [deletion removes the pointer, not the data](../s02/#4-how-deletion-really-works) (Session 2)"
  - "Explain an examiner's [footprint](../s06/#3-live-acquisition-and-its-cost) (Session 6)"
  - "Explain the [two clocks](../s11/#6-two-records-two-clocks) of CloudTrail and the server access logs (Session 11)"
  - "Explain [object versioning, the delete marker and log-file integrity validation](../s11/#7-what-the-cloud-keeps-for-you-versions-and-a-signed-record) (Session 11)"
  - "Have your own environment built and the scripted incident run, as in the [Session 11 lab](../s11/#8-the-lab-build-the-drop-prove-it-is-ready-make-the-incident-happen) (Session 11)"
demos:
  - id: S12-D1
    title: "Collect now or later?"
    file: s12-d1-collect-now-or-later.html
    teaches: "CloudTrail files land within minutes and access-log files over hours, so a collection holds what had landed when you looked, and the question 'is it complete?' can only be answered with the time you looked."
  - id: S12-D2
    title: "Your requests join the record"
    file: s12-d2-requests-join-record.html
    teaches: "Each request you make to the case bucket becomes a data event within minutes and an access-log line hours later, so a later collection contains the record of the earlier one, while requests to the log buckets leave no line."
  - id: S12-D3
    title: "What a pass covers"
    file: s12-d3-what-a-pass-covers.html
    teaches: "One validate-logs run checks only the log files that the digest files of one Region list from the start time, so the newest files, other Regions and every server access log stay outside its pass."
  - id: S12-D4
    title: "ETag and MD5"
    file: s12-d4-etag-and-md5.html
    teaches: "For a small object uploaded in one piece with SSE-S3, the ETag is the MD5 hash value of its content; for a multipart upload it is built from the parts' MD5 values, and with SSE-KMS it is unrelated, so it matches no local MD5."
  - id: S12-D5
    title: "Read under the marker, or remove it"
    file: s12-d5-under-the-marker.html
    teaches: "Getting a version by its version ID leaves the version history exactly as it was, while removing the delete marker brings the object back and erases the marker, with its version ID and time, from the history."
slides: s12-cloud-collection.pptx
evidence: "none from the lab share: you collect from your own AWS environment, built and used in Session 11; the unit's reference collection exists only as a fallback for practising the method"
---

Session 11 built the cloud drop, switched its records on and ran the scripted incident. It ended with one rule: no request to the case bucket until Session 12. Three plain statements come first today.

**Today you collect and preserve. You do not analyse.** You collect the CloudTrail files, the server access log files, the metadata of every version of every object, and the deleted file's versions. You hash each one as it arrives and record it. Reading the logs, matching them and building the timeline belong to Session 13.

**What you collect today is your coursework evidence.** It comes from your own account and your own incident. Nobody else has the same evidence, and nobody can collect it for you.

**Nothing in your buckets changes today, and nothing is taken down.** Every command on this page reads. Your environment must stay exactly as it is until your coursework has been submitted, including any resubmission; the LMS says when that is.

**Why today's first request is deliberate.** Since the close of Session 11, nobody has touched the case bucket. That silence matters: every request recorded after the incident is now yours, made today, on purpose. Your requests will be recorded too, by the very records you switched on. That is not a problem, as long as you write down when you made them and from where, before anyone else has to work it out. Section 3 explains how.

## 1. Acquisition without an image

### The idea

In Session 1 you made a {% include term.html t="forensic-image" %} of a memory card: every sector, including the deleted ones. Then you worked on a copy and kept the image untouched.

In the cloud, that first step is impossible. The disks that hold your bucket belong to AWS, they hold other customers' data, and they are spread across buildings you will never enter. Nobody images them for you.

So {% include term.html t="acquisition" %} in the cloud means something narrower. You ask the provider, through its own interfaces, for copies: a copy of each log file, a copy of each object version, a copy of the metadata. The provider hands them over. You never touch the original, and you never will.

That raises a question that a forensic image answered by itself. **Why should anyone trust your copy?** The answer is your record of how you got it.

### How it works

A forensic image proves itself: it is complete, bit for bit, and its hash value describes the whole device. A cloud copy cannot do that. It is one file among many, given to you by someone else. What makes it defensible is a record that answers six questions about each collection.

| Question | What you record | Where it comes from |
|---|---|---|
| What? | The exact source: the bucket, the key, and the {% include term.html t="version-id" %} where there is one | The command you ran |
| How? | The command, the tool and its version | Your collection log and `aws --version` |
| When? | The time of each request, in {% include term.html t="utc" %} | Your collection log |
| From where? | The public {% include term.html t="ip-address" %} of the computer that made the request | `curl -s https://checkip.amazonaws.com` |
| As whom? | The identity that signed the request | `aws sts get-caller-identity` |
| Unchanged since? | The {% include term.html t="hash-value" %} of each file, taken the moment it arrived | `sha256sum`, into a manifest |

Together these answers do what the forensic image did on its own. A stranger can see what was asked for, when, by whom and from where, and can check that each file is still the file that arrived. The first five answers are also what the provider's own records will hold about your requests, which is why Section 3 matters.

This is still the first stage of NIST SP 800-86, {% include term.html t="collection" %}: finding, labelling and copying data while keeping it unchanged. Only the method of copying has changed.

<div class="box metaphor" markdown="1">

**The comparison.** Collecting cloud evidence is like getting a certified copy of a land record from the Land Registry.

**Why it fits.** Nobody takes the original register out of the building. You fill in an application, the registry's own staff make the copy, and you take the copy away. Your application shows who asked, for which record and when. In court, the copy and the paper trail of the application stand in for the original register. In the cloud, your commands are the application, AWS's service makes the copy, and your collection record is the paper trail.

**Where it breaks.** The registry certifies its copy with a seal and a signature. S3 gives you no certificate for a downloaded file: if you want proof that it has not changed, you must hash it yourself, at once. Only the CloudTrail files carry a check of their own, and even that check works on the files in AWS, not on your copy (Section 5 shows this). And a registry clerk can be asked in court how the copy was made; the provider's software cannot.

**So what.** The provider will not vouch for your copy. You vouch for it, with a hash value taken on arrival and a record of every request.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">Two analysts download the same log file from the same bucket and get the same SHA-256 value. One kept a collection log; the other did not. What does only the first analyst's copy have?</p>
  <ul class="qc-opts">
    <li data-key="a">A more accurate hash value</li>
    <li data-key="b">A record of what was asked for, when, from where and as whom, so a stranger can check how the copy was made</li>
    <li data-key="c">Nothing: identical hash values make the two copies equally defensible</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The hash value shows that the two files are identical, and nothing more (Session 1). It cannot show where the copy came from or how. A hash value is never more or less accurate (a), and (c) confuses "the same content" with "a defensible collection".</p></div>

</div>

<details class="deeper" markdown="1">
<summary>When the provider collects for you, and what an IaaS snapshot changes</summary>

Some evidence is only available from the provider itself, for example records of the provider's own systems, or data in an account that the investigator does not control. Then the request goes through legal channels, as Session 11 described under jurisdiction, and what comes back is again a copy: a production from the provider. The same six questions apply to it, answered by the provider's covering letter and by your own record of receiving it.

On IaaS there is one tool that comes closer to an image: a snapshot of a virtual disk. It copies the whole virtual disk, including space that the file system no longer uses. It is still made by the provider's software and still sits in the customer's account, so responders copy it, record how, and hash what they can. Your coursework uses S3, where no snapshot exists: the objects, their metadata and the records are the whole of the evidence.
</details>

<div class="box key" markdown="1">

In the cloud you collect copies through the provider. What makes a copy defensible is your record: what, how, when, from where, as whom, and its hash value on arrival.

</div>

## 2. The two clocks, in your own account

### The idea

Session 11 described two records with two clocks. Today you see them in your own account.

**CloudTrail** publishes its log files about every five minutes. AWS says that it typically delivers an event within about five minutes of the action, and adds that this time is not guaranteed.

**S3 server access logs** are delivered on a {% include term.html t="best-effort-delivery" %} basis. AWS says that most records arrive within a few hours, that some may arrive much later, that a few may never arrive at all, and that the logs are not meant to be a complete account of every request.

The delay between an action and the arrival of its record is the {% include term.html t="log-delivery-latency" %}. Today you measure it, roughly, for both records.

### How it works

Each file in a bucket has a last-modified time: for a log file, that is when it was delivered. So you can see the two clocks without opening a single file. You list each log bucket, sort the files by their last-modified times, and set those times beside the times in your incident logs from Session 11.

What you usually see:

- **CloudTrail:** the first files after the incident's start arrive within minutes of it, and files keep arriving every few minutes while anything happens in the account.
- **Server access logs:** the files arrive later and in a less regular pattern. Some of the incident's requests may not be in any file yet.

Now the hard part. Suppose the access-log files have stopped arriving. **Is the record complete?** You cannot know. A file could still be on its way, and AWS says some records are never delivered. Waiting longer makes a gap less likely; it never proves there is none.

{% include demo.html id="S12-D1" %}

So you do not claim completeness. You state it as a limitation, in words like these: *"Server access log files were listed at [time, UTC] and collected at [time, UTC]; [N] files had arrived. A second collection at [time, UTC] found [M]. AWS delivers these logs on a best-effort basis, so records of some requests may be missing."* A careful reader can then judge the gap for themselves.

**If records are still missing today.** Never wait silently, and never collect "when it looks finished". Record what is missing and when you looked, collect what is there, and collect again later into a new folder, recording that too. The lab shows how.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "AWS delivers CloudTrail within five minutes." | "AWS says CloudTrail typically delivers within about five minutes, and does not guarantee it." | The guarantee is not there, and a report must not add one. |
| "The access logs stopped arriving, so they are complete." | "No more files had arrived by [time]; completeness cannot be confirmed." | Best-effort delivery means late and missing records are possible. |
| "The access log has no line for that read, so the read did not happen." | "No line was delivered for that read." | A missing access-log line is not evidence that nothing happened. CloudTrail may still hold it. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An analyst lists the access-log bucket, waits one more hour, lists it again and finds no new files. Which statement belongs in the report?</p>
  <ul class="qc-opts">
    <li data-key="a">"The server access logs are complete."</li>
    <li data-key="b">"The server access logs are incomplete."</li>
    <li data-key="c">"No new access-log files arrived between the two listings; because delivery is best-effort, the record may still be incomplete."</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). It reports what was seen, with the times, and states the limitation. (a) claims a completeness that AWS does not promise. (b) claims a gap that nobody has shown: the record may also be complete.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What "the time a file arrived" really is</summary>

The last-modified time of a log file in S3 is the time at which the delivery service wrote it. It is not the time of the events inside it. A CloudTrail file may hold events from several minutes before its delivery, and an access-log file may hold requests from hours before. The name of a file also carries a time: CloudTrail puts a time near the end of each file name, and the access logs, in the key format that you chose in Session 11, start each name with a date and time. Neither is the time of every record inside.

So today's comparison is rough on purpose: it shows the shape of the delay, not the delay of each request. Matching each request to its record, and measuring the real delay, needs the times inside the records. That is Session 13's work.

AWS also notes that a change to logging settings takes up to about an hour to apply fully, which is why Session 11 waited an hour before the incident. And `aws s3 sync` gives each downloaded file the bucket's last-modified time as its own modification time, so your copies keep the delivery times, at least until something touches them.
</details>

<div class="box key" markdown="1">

CloudTrail arrives in minutes, typically; the access logs arrive in hours, on a best-effort basis. Completeness is never proved: you record when you looked and what you found.

</div>

## 3. The observer in the record

### The idea

Session 6 showed that a memory capture tool changes the memory that it copies: its {% include term.html t="footprint" %}. Collecting from the cloud has a footprint too, but in a different place. Your requests do not change the bucket. They add lines to its records.

You switched those records on in Session 11. They do not know that you are the investigator. Every request to the case bucket is recorded like any other: by CloudTrail as a {% include term.html t="data-event" %}, within minutes, and by S3 as a {% include term.html t="server-access-log" %} line, hours later.

### How it works

Which of today's requests leave a line? It depends on the settings you chose in Session 11, and you can work it out.

| Today's request | CloudTrail | Server access logs |
|---|---|---|
| Listing and downloading the trail bucket | No line: data events were switched on for the case bucket only | No line: the trail bucket does not log its requests |
| Listing and downloading the access-log bucket | No line, for the same reason | No line: it must not log itself |
| `validate-logs` reading the digest and log files | Only management events for the trail and key lookups, if any | No line |
| `list-object-versions` on the case bucket | A data event, if your event selector matches list requests; Session 13 shows you whether it did | A line |
| `head-object` on each version | A data event | A line |
| `get-object` on each version | A data event | A line |

So your collection adds about fourteen requests to the case bucket's records: two listings, nine head requests and three downloads. Each carries your identity, `nb6018-analyst`, the time, your address and the name of your tool.

Here is the trap. **Part 1 of the incident was also run from Kali, as `nb6018-analyst`, probably from the same address.** In Session 13, your collection and part 1 of the incident will look alike in the records. Two things will separate them: the time, and the kind of request, because the incident never asked for a version by its version ID and never made a head request. So you note the time and the address of your collection, at its start and at its end, before you make the first request.

{% include demo.html id="S12-D2" %}

The demo shows one more effect. Your access-log lines arrive hours later. So a collection made today does not hold the lines of today's collection, but a collection made tomorrow will. If you collect twice, the second collection contains the record of the first.

<div class="box metaphor" markdown="1">

**The comparison.** Collecting from a bucket is like reading a building's visitors' book, where the rule is that you must sign it before you read it.

**Why it fits.** The book is the evidence you came for. Your signature joins the other lines, written in the same way, with your name and the time. Someone who reads the book later will see your visit among the visits you came to study, and will need your own notes to tell them apart.

**Where it breaks.** In a visitors' book you see your own line at once. Here your access-log line arrives hours later, so it is missing from the copy you take today and present in any later copy. And not every building has a book: the trail bucket and the access-log bucket record nothing of your visits, because you did not switch that on. Finally, signing a book never changes the earlier lines, and neither do your requests: the records grow; nothing in them is changed.

**So what.** Before your first request, record the time and your address, and record them again at the end. In Session 13 that note lets you separate the collection from the incident.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">Which of these requests made today will appear in the case bucket's server access logs?</p>
  <ul class="qc-opts">
    <li data-key="a">Downloading the CloudTrail files with <code>aws s3 sync</code></li>
    <li data-key="b">A <code>head-object</code> request for one version of <code>staging/client-list.csv</code></li>
    <li data-key="c">Running <code>validate-logs</code> on the trail</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). It is a request to the case bucket, which has server access logging switched on. (a) and (c) read the trail bucket, which does not log requests at all.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What AWS documents about list requests, and why the table hedges</summary>

AWS lists `ListObjects` and `ListObjectVersions` among the object-level operations that CloudTrail can record as S3 data events. It does not say plainly whether a selector like yours, "resources.ARN starts with the bucket's name and a slash", matches a list request, which acts on the bucket rather than on one object. The honest position is the one in the table: the server access logs record the listing for certain, if the line is delivered; whether CloudTrail recorded it is something you check in your own records in Session 13. That check is itself a small finding about your readiness.

Your tool also leaves a name: each request carries a user agent that names the AWS CLI and its version. Session 13 uses it. Today it is enough to record `aws --version` in your collection log.
</details>

<div class="box key" markdown="1">

Every request you make to the case bucket becomes part of its record. Note the time and the address of your collection at its start and its end, so that it can be told apart from the incident.

</div>

## 4. Preservation: hash on arrival, keep the original, work on a copy

### The idea

Session 1 gave you a routine for evidence. It does not change in the cloud; only the evidence does.

1. **Hash every file the moment it arrives**, before you open it, and write the values down.
2. **Keep the originals untouched.** Make them read-only. Never decompress, rename or edit them.
3. **Work on a {% include term.html t="working-copy" %}**, made from the originals, in a separate folder.
4. **Record everything:** an entry in the {% include term.html t="custody-record" %} for each action, and an entry in the {% include term.html t="evidence-register" %} for each item, each with its source location, time, tool and identity.

Everything you collect today, with its hash values and its records, forms your {% include term.html t="evidence-set" %}.

### How it works

A collection from S3 brings hundreds of small files, not one image. Hashing each by hand would be slow and easy to get wrong. So the lab uses a short routine, called `seal`, after each download:

- it calculates the SHA-256 value of every new file and adds the values to one manifest file;
- it makes the new files read-only;
- it writes a line in your collection log: which folder, how many files, at what time.

The manifest is the list of hash values for the whole collection. At the end, you hash the manifest itself and write that one value in the custody record. Anyone can later recalculate every value and compare.

The folder layout keeps the roles apart:

```
~/nb6018-cw/s12/
  collection-log.txt          every request, every seal, in UTC
  evidence/c1-<time>/         the first collection: originals, read-only after sealing
     listings/  trail/  access-logs/  validation/
     case/history/  case/head/  case/recovered/  case/history-after/
     manifest-sha256.txt
  evidence/c2-<time>/         a later collection, only if one is needed
  records/                    your own tables and the custody record and register
  work/                       working copies: decompressed and ordered
```

If records are still arriving, a later collection goes into its own new folder, `c2-...`. It never adds to `c1` and never replaces anything in it. Two collections of the same bucket at two times are two items of evidence, each with its own hash values. Where their files overlap, matching hash values also show that those files did not change between the two collections, which is useful for the server access logs, because they have no other check.

The working copies in `work/` are different. You may delete them and make them again from the originals at any time, and you never report from a file in `work/` without checking it against the manifest.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">An analyst syncs the CloudTrail files, decompresses them in the same folder to look at them, and then hashes the folder. What is wrong?</p>
  <ul class="qc-opts">
    <li data-key="a">The hash values describe files that the analyst has already changed, so nothing shows that they match what AWS delivered</li>
    <li data-key="b">Nothing, because decompressing a file does not change its content</li>
    <li data-key="c">Nothing, as long as the analyst writes the hash values in the register</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The originals were changed before they were hashed, so the first recorded value is of something that AWS never delivered. Decompressing writes a new file with different bytes (b is wrong), and a register entry (c) only records the mistake.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Why SHA-256 here, and why read-only is not a write blocker</summary>

S3 does not give you a SHA-256 value for most objects, so the value in your manifest is the first one that exists for each file. That is why it must be taken before anything else happens to the file, as Session 1 required for an image. MD5 appears today too, in Section 6, but only as a way to compare with S3's ETag; the values you rely on are SHA-256.

Making the files read-only protects them from accidents, not from you: any user who owns a file can make it writable again. It plays the role that the Read-only tick played in Session 1, not the role of a write blocker. The protection that a stranger can check is the manifest and the custody record. If you ever find a mismatch, do not repair it. Record it, as Session 1 taught.
</details>

<div class="box key" markdown="1">

Hash every file as it arrives, make the originals read-only, work only on copies, and record each item with its source, time, tool and identity.

</div>

## 5. Proving the CloudTrail files are unchanged

### The idea

Session 11 switched on {% include term.html t="log-file-integrity-validation" %}. Every hour since then, CloudTrail has written a signed {% include term.html t="digest-file" %} listing the hash value of each log file it delivered. Today you use that chain.

The AWS CLI command `aws cloudtrail validate-logs` walks the chain of digest files and checks the signature of each digest and the hash value of each log file that the digests list. Each file gets a verdict: valid, or one of several INVALID messages.

A pass proves two things: the log files have **not been changed**, and **none has been removed**, since CloudTrail delivered them. It does not prove that every action was recorded. And the server access logs have no such check at all.

### How it works

Three details decide what a run actually covers. Each one matters for your report.

**It checks AWS's files, not yours.** The command reads the log and digest files in the trail bucket, where CloudTrail put them. It cannot validate the copies on your Kali VM. Your copies are protected by your own manifest. Together the two show an unbroken line: unchanged in AWS since delivery, and unchanged on your side since collection, provided you collected the same files that were validated.

**It works one Region at a time.** Your trail records every Region, so the trail bucket has a folder for each Region in which something happened, for example `ap-south-1` for your bucket, and often `us-east-1` for sign-ins and other global actions. The command validates the Region named by `--region`. You run it once for each Region folder in your collection.

**It covers only files that a digest lists.** Digest files are written once an hour. Log files delivered after the latest digest are not in any digest yet, so they are not checked. They are not invalid; they are simply not covered. Run the command again an hour later and they will be.

{% include demo.html id="S12-D3" %}

So you read the summary at the end of each run, and you compare it with what you collected. If the run says `40/40 log files valid` and your folder holds 46 log files for that Region, the six that remain are explained, one by one, before anything is written in the report: files after the latest digest, or files from before your start time.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An analyst runs <code>validate-logs</code> with <code>--region ap-south-1</code>. It reports every digest file and every log file valid. Her collection also holds CloudTrail files under <code>us-east-1</code>. What has she shown about those?</p>
  <ul class="qc-opts">
    <li data-key="a">That they are unchanged, because the trail records every Region</li>
    <li data-key="b">That they are changed, because they were not reported as valid</li>
    <li data-key="c">Nothing yet: she must run the command again with <code>--region us-east-1</code></li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Each run checks the digest files of one Region. Files outside it have neither passed (a) nor failed (b): they have not been checked.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The options, the messages and the server access logs</summary>

The command needs two options: `--trail-arn`, the full name of your trail, and `--start-time`, in UTC. It accepts `--end-time` (the default is now), `--s3-bucket` and `--s3-prefix` (only needed when the files moved or the trail changed bucket), `--account-id` (for organisation trails only) and `--verbose`, which prints a line for every file instead of failures only. The identity needs permission to list and read the trail bucket and to look up the trail; your `nb6018-analyst` user has it.

The INVALID messages name the problem: a hash value that does not match (the file changed), a digest whose signature fails, a file that is not found (removed), or a file that has been moved from its original place. A starting digest is written each time validation is switched on, or logging restarts, and has no link to an earlier digest; a break in the chain is therefore normal at those times and nowhere else. AWS writes a digest every hour even when nothing happened, which lets you show that no log file was delivered in that hour.

The server access logs have no digest, no signature and no chain. The only integrity you can show for them is your own: hash values taken on arrival, and, if you collect twice, matching values for the files that both collections hold. Say so in the report, plainly. It is a limitation of the evidence, not of your work.
</details>

<div class="box key" markdown="1">

A pass from `validate-logs` proves that the CloudTrail files it checked are unchanged and none is missing since delivery. It does not prove that everything was recorded, it covers one Region and the files already in a digest, and it never covers the server access logs.

</div>

## 6. Object metadata and the ETag

### The idea

The logs record what happened to the objects. The objects themselves carry their own description: their {% include term.html t="metadata" %}. For each version of each object, `aws s3api head-object` returns it without downloading the content:

| Field | What it tells you |
|---|---|
| `VersionId` | Which version this is |
| `LastModified` | When this version was written, in UTC |
| `ContentLength` | Its size in bytes |
| `ETag` | A value that S3 keeps to identify the content |
| `ServerSideEncryption` | How S3 encrypts it at rest; `AES256` means {% include term.html t="server-side-encryption" %} with keys that S3 manages, called SSE-S3 |

The most useful field is the {% include term.html t="etag" %}. In your bucket, it lets you match each version in the cloud to the local copy that your incident script kept in `files/`, without downloading anything.

### How it works

For your files, the ETag is the MD5 hash value of the content. That is true because of two facts about how they were stored, and both must hold:

1. **They were uploaded in one piece.** Your files are tiny, so the AWS CLI sent each one in a single request.
2. **They are encrypted with SSE-S3.** That is your bucket's default, which you left as it was in Session 11.

Change either fact and the rule fails. A {% include term.html t="multipart-upload" %}, which the AWS CLI uses for files of more than about 8 MB and the console for files of more than 16 MB, gives an ETag built from the MD5 values of the parts, followed by a hyphen and the number of parts. Encryption with AWS KMS keys (SSE-KMS) or with customer-provided keys gives an ETag that is not an MD5 value at all.

{% include demo.html id="S12-D4" %}

In the lab, you calculate the MD5 value of each of the nine local files with `md5sum`, and match each one to the ETag of a version. Nine versions, nine local files, nine matches: each version in the bucket holds exactly the content you uploaded, and you now know which local file is which version.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The ETag is the MD5 of the file." | "The ETag is the MD5 of the content only for a single-part upload that is unencrypted or uses SSE-S3." | Multipart uploads, SSE-KMS and customer keys break the rule. |
| "The ETag does not match my MD5, so the file was changed." | "First check how the object was uploaded and encrypted." | An ETag ending in a hyphen and a number, or an SSE-KMS object, never matches. |
| "The ETag matches, so I do not need to hash the download." | "The ETag shows what S3 holds. Your SHA-256 value shows that your copy has not changed since it arrived." | Two different claims, two different values. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">An object's ETag is <code>"9b2f0c3e5d7a41b8c6e2f0a1d3b5c7e9-4"</code>. An analyst's local copy has a different MD5 value. What is the best reading?</p>
  <ul class="qc-opts">
    <li data-key="a">The object was uploaded in four parts, so its ETag is not the MD5 of the content and cannot be compared with it</li>
    <li data-key="b">The object was changed four times after upload</li>
    <li data-key="c">The local copy is damaged</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). A hyphen and a number at the end of an ETag mark a multipart upload. The number counts parts, not changes (b). Nothing here shows damage (c): compare a downloaded copy's hash value with the local copy's instead.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The rule in AWS's words, and what else the metadata can show</summary>

AWS's documentation on checking object integrity states it this way: an object created by a single PUT, POST or copy, or through the console, that is unencrypted or encrypted with SSE-S3, has an ETag that is an MD5 digest of its data; with SSE-C or SSE-KMS it does not; and an object created by a multipart upload never does, whatever the encryption. The ETag reflects the content only, never metadata changes.

For a multipart object, S3 calculates the MD5 value of each part, joins those values together, takes the MD5 value of the result, and adds a hyphen and the number of parts. If you know the exact part size that the uploader used, you can repeat the calculation on a local copy; if you do not, you compare SHA-256 values of a downloaded copy and the local file instead.

Newer versions of the AWS CLI also ask S3 to store an extra checksum, such as CRC64NVME, with each upload. `head-object` shows it only when you add `--checksum-mode ENABLED`. It is another value calculated by S3, useful for the same kind of matching, and it does not replace your own SHA-256 values.

Metadata has limits as evidence. `LastModified` is when S3 stored the version, not when anyone created the content. And the metadata of a version can never be read after that version has been permanently deleted, which is one more reason why versioning was switched on before the incident.
</details>

<div class="box key" markdown="1">

`head-object` gives each version's ID, time, size, encryption and ETag. Only for single-part SSE-S3 uploads is the ETag the MD5 value of the content, and then it matches your local copy.

</div>

## 7. The history first, then recovery by version ID

### The idea

One file of the incident, `staging/pricing-plan.txt`, was deleted from CloudShell at the end of Session 11. Session 11 told you that a versioned bucket keeps every version under a {% include term.html t="delete-marker" %}. Today you prove it, in a fixed order.

**First, list the history.** `aws s3api list-object-versions` shows every version of every object under a {% include term.html t="prefix" %}, and every delete marker. It shows which entry is the {% include term.html t="latest-version" %} for each key: for `pricing-plan.txt`, the latest entry is the delete marker, which is why the object looks deleted.

**Then recover, by version ID.** `aws s3api get-object` with `--version-id` downloads one exact version to your computer. The bucket does not change: the delete marker stays on top, the versions stay below it, and the history afterwards is identical to the history before.

The order is the method. You list the history before you recover anything, so that you know what exists and can show later that your recovery changed nothing.

### How it works

Read the listing for `pricing-plan.txt` from the bottom up, as the bucket built it:

- three versions, each with its own version ID, last-modified time, size and ETag, all marked as not latest;
- one delete marker, with its own version ID and time, marked as latest.

The delete marker is evidence too. Its last-modified time is the time of the deletion, as S3 recorded it, and its version ID identifies it. Session 13 will set that time beside CloudTrail's record of the delete.

There are two ways to "get the file back", and they are not the same:

| | Download a version by its version ID | Remove the delete marker |
|---|---|---|
| What happens | You receive a copy of one version | S3 permanently deletes the marker; version 3 becomes the latest version again |
| The bucket | Unchanged | Changed: the history has lost an entry |
| The evidence | Intact: the marker still records when the object was deleted | The marker's version ID and time are gone from the history |
| Whose decision | The investigator's: it is collection | The owner's: it is a response action, part of system recovery |

{% include demo.html id="S12-D5" %}

Removing the marker is a real and useful action. An owner who needs the file back in service may choose it, after the evidence has been collected. It is not a collection step, so you do not do it in the lab, and you do not do it in your coursework environment at all.

<div class="box metaphor" markdown="1">

**The comparison.** A delete marker is like a "WITHDRAWN" slip clipped on top of a file in a records room. Reading by version ID is like asking the archivist for page 3 of the file underneath. Removing the marker is like taking the slip away.

**Why it fits.** The slip makes the file look withdrawn to anyone who glances at the shelf, as the marker makes the object look deleted in a normal listing. The pages underneath are intact. Asking for one page by its number leaves the slip where it is. Taking the slip away makes the file look current again, and the slip, with the date written on it, is gone.

**Where it breaks.** In a records room you might lift the slip and read underneath without anyone knowing. In S3, every request is recorded, as Section 3 showed. And S3 does not make you lift anything: you go straight to the version by its ID, without touching the marker at all. Finally, a slip taken away can sometimes be found in a bin; a delete marker removed from S3 is gone for good.

**So what.** Collect by version ID, and leave the marker to the owner. The slip is part of the evidence.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An analyst needs the content of a deleted object from a versioned bucket, and must not change the evidence. What should she do first?</p>
  <ul class="qc-opts">
    <li data-key="a">Remove the delete marker, so that the object is listed again, and download it normally</li>
    <li data-key="b">List the object's versions, then download the version she needs by its version ID</li>
    <li data-key="c">Copy the last version over the deleted object, so that it becomes the latest version</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The listing shows what exists and gives the version IDs; the download by version ID changes nothing in the bucket. (a) destroys the marker, which records when the object was deleted. (c) adds a new version on top, so the bucket's history changes too.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What S3 answers when you ask for a deleted object</summary>

If you ask for `pricing-plan.txt` without a version ID, S3 looks at the latest entry, finds the delete marker, and answers as if the object does not exist: a "not found" error, with a header saying that a delete marker was found. If you ask for the delete marker's own version ID, S3 answers that the method is not allowed, because a marker has no content. If you ask for the version ID of a real version, S3 returns its content. Reading a specific version needs the permission `s3:GetObjectVersion`, which your identity has.

AWS documents two ways for an owner to restore a previous version: copying it on top, which adds a new version, and deleting the newer entries above it, which removes them for good. For a deleted object, removing the delete marker is the second way. Both change the bucket, which is why both are response actions and neither is collection.

A lifecycle rule, if a bucket had one, could also remove old versions or delete markers automatically after a set time. Your bucket has none. In a company's bucket, an investigator checks for lifecycle rules early, because they can remove evidence by policy while the investigation is running.
</details>

### What you hold, and what you never will

<div class="box lens" markdown="1">

**Through another lens: transactive memory.** The psychologist Daniel Wegner gave a name to something every couple and every close team does. Nobody remembers everything. Each person remembers some things for the group, and everyone knows who holds what. When you need a fact that your partner keeps, you do not search your own memory; you ask. Wegner called this shared system transactive memory.

A cloud investigation works the same way. You do not hold the original. The provider holds it, and you know exactly what it holds, because you switched the records on. To recall anything, you ask, through its interfaces, and the answer arrives on the provider's schedule: in minutes for CloudTrail, in hours, or not at all, for the server access logs. Your collection today was a long conversation with the member of the team who remembers.

**Where it breaks.** You cannot check a partner's memory. You can check this one. The digest files let you check the CloudTrail files, the version IDs fix exactly which version you asked for, and the ETags let you match each version to your own copy. And a partner forgets by accident; the provider forgets by policy. It keeps what it was told to keep, for as long as it was told: 90 days of Event history, and every other record only as long as its bucket, its retention settings and any {% include term.html t="lifecycle-rule" %} allow.

**The question it raises.** When the provider's answer is all you have, what turns that answer into evidence that a stranger can trust?

</div>

<div class="box key" markdown="1">

**The pivotal idea.** You never hold the original; a verified copy with an unbroken record is the closest you get.

</div>

That sentence is the lab. Every step either makes a copy, verifies it, or adds to the record.

## 8. The lab: collect, preserve and recover from your own drop

Your task in one line: from your Kali VM, check what has landed since the incident, collect both logs and the case bucket's history, metadata and deleted file, hash and record every item as it arrives, validate the CloudTrail files, and leave every bucket exactly as you found it.

You need the Kali VM with the AWS CLI that you configured in Session 11, and your folder `~/nb6018-cw/s11/` with `names.sh`, `config-log.txt` and `incident/`. The Windows VM and REMnux stay off. Allow about two hours.

<div class="box safety" markdown="1">

**This is your coursework evidence. Six rules.**

1. **Read only.** Run only the commands on this page. Never delete, copy, restore, move or change anything in any bucket: no removing the delete marker, no copying a version on top, no lifecycle rule, no change to any setting.
2. **No extra looks at the case bucket.** Do not open it in the console and do not list it "just to see". Every request becomes part of its record. The page's requests are the ones you will be able to explain.
3. **Never edit the evidence folder.** After a folder is sealed, you only read it. All other work happens in `work/` and `records/`.
4. **Never show a secret, and mask your account ID** in anything you show: `********3333`. The unmasked files stay in your private folder.
5. **Take nothing down.** Keep the buckets, the trail, its logging and versioning until your coursework has been submitted, including any resubmission.
6. **Watch the cost.** Today's requests cost a tiny fraction of a cent. If your budget alarm e-mails you, stop and tell the lecturer.

</div>

<div class="box lms" markdown="1">

The LMS carries this session's blank custody record and evidence register, the readiness and collection self-check, and the date of the cloud readiness and collection check that follows this session. Use the LMS for anything about dates.

</div>

### Part A: prepare, and record yourself first

1. **Create today's folder and your helpers.** On Kali:

   ```bash
   mkdir -p ~/nb6018-cw/s12/{evidence,records,work}
   cat > ~/nb6018-cw/s12/s12-env.sh <<'EOF'
   source "$HOME/nb6018-cw/s11/names.sh"
   S12="$HOME/nb6018-cw/s12"
   clog() { printf '%s  %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$S12/collection-log.txt"; tail -n 1 "$S12/collection-log.txt"; }
   seal() { ( cd "$1" && find "$2" -type f -print0 | sort -z | xargs -0 sha256sum ) >> "$1/manifest-sha256.txt"; chmod -R a-w "$1/$2"; clog "sealed $(basename "$1")/$2: $(find "$1/$2" -type f | wc -l) files hashed and made read-only"; }
   [ -f "$S12/c1.sh" ] && source "$S12/c1.sh"
   true
   EOF
   source ~/nb6018-cw/s12/s12-env.sh
   echo "$CASE $LOGS $TRAIL $TRAIL_NAME $REGION"
   ```

   `clog` writes one line, in UTC, to your collection log. `seal` hashes every file in one folder of a collection into the manifest, then makes the folder read-only. In every new terminal, run `source ~/nb6018-cw/s12/s12-env.sh` again before anything else.

   <div class="box expect" markdown="1">

   One line with your three bucket names, `nb6018-trail` and `ap-south-1`.

   </div>

   <div class="box trouble" markdown="1">

   If the line is empty or shows only `ap-south-1`, `names.sh` is missing or its names are wrong: check `~/nb6018-cw/s11/names.sh` against the bucket names in your S11 readiness files. If you never did Session 11, stop here and follow "If you missed Session 12" below.

   </div>

2. **Record who, where, when and with what, before any request to the case bucket.**

   ```bash
   clog "S12 collection start on Kali"
   clog "identity: $(aws sts get-caller-identity --query Arn --output text)"
   clog "Kali public address at start: $(curl -s https://checkip.amazonaws.com)"
   clog "tool: $(aws --version 2>&1)"
   C1="$S12/evidence/c1-$(date -u +%Y%m%dT%H%MZ)"
   mkdir -p "$C1"/{listings,trail,access-logs,validation,case/history,case/head,case/recovered,case/history-after}
   echo "C1=\"$C1\"" > "$S12/c1.sh"
   clog "collection folder $C1 created"
   ```

   <div class="box expect" markdown="1">

   Five lines in UTC, each echoed on the screen. The identity ends in `user/nb6018-analyst`. The address is your Kali VM's public address, probably the same one that `incident-log.txt` recorded in Session 11. The tool line begins `aws-cli/2.`.

   </div>

   <div class="box trouble" markdown="1">

   If the identity says `InvalidClientTokenId`, your access key was deleted or mistyped: create a new key for `nb6018-analyst` as in Session 11, step 5, and note it in the collection log. If the address line is empty, Kali has no internet: fix the network first. Never collect from a different computer without noting it here.

   </div>

### Part B: what has landed, and when

{: start="3"}
3. **List both log buckets, without downloading anything.**

   ```bash
   aws s3api list-objects-v2 --bucket "$TRAIL" --region "$REGION" --query 'Contents[].[LastModified,Size,Key]' --output text | sort > "$C1/listings/trail-landed.tsv"
   aws s3api list-objects-v2 --bucket "$LOGS" --region "$REGION" --query 'Contents[].[LastModified,Size,Key]' --output text | sort > "$C1/listings/access-logs-landed.tsv"
   clog "listed s3://$TRAIL/ and s3://$LOGS/ (no download)"
   seal "$C1" listings
   wc -l "$C1"/listings/*.tsv
   ```

   Each line of a listing shows when the file landed (its last-modified time, in UTC), its size and its key. These are the provider's answers, so they are evidence and are sealed at once.

   <div class="box expect" markdown="1">

   Two files with a few hundred lines in `trail-landed.tsv` (log files under `CloudTrail/`, and hourly digest files under `CloudTrail-Digest/`, for several Regions) and some lines in `access-logs-landed.tsv`, each key starting with `case/` and a date and time. The seal line reports two files.

   </div>

   <div class="box trouble" markdown="1">

   If `access-logs-landed.tsv` holds only the word `None`, no access-log file has arrived yet. That is a finding, not a failure: keep the file, carry on, and follow "If records are still arriving" after Part H. If `trail-landed.tsv` holds `None`, check in the console that the trail is still **Logging**, and tell the lecturer.

   </div>

4. **Set the arrivals beside the incident.** Take the incident's start and end times from your Session 11 logs, then see what landed after the start:

   ```bash
   grep -h -E 'START|END' ~/nb6018-cw/s11/incident/incident-log.txt ~/nb6018-cw/s11/incident/part2-log.txt
   START=$(head -n 1 ~/nb6018-cw/s11/incident/incident-log.txt | cut -c1-19)
   for f in trail-landed access-logs-landed; do
     echo "== $f: files that landed after the incident started"
     grep -v CloudTrail-Digest "$C1/listings/$f.tsv" | awk -v s="$START" 'substr($1,1,19) >= s' > "$S12/records/$f-after-start.tsv"
     wc -l < "$S12/records/$f-after-start.tsv"
     head -n 2 "$S12/records/$f-after-start.tsv"; echo "   ..."; tail -n 2 "$S12/records/$f-after-start.tsv"
   done
   ```

   Now write a short note, `records/two-clocks.md`, in your own words: for each record, how many files landed after the incident started, when the first and the last of them landed, and how those times compare with the incident's start and end. End it with one sentence on completeness, in the form of Section 2.

   <div class="box expect" markdown="1">

   CloudTrail files that landed within minutes of the incident's start, and more every few minutes through it. Access-log files that landed later and less regularly, perhaps continuing for hours after the end of part 2. Your exact times and counts are your own evidence. Do not open any file yet.

   </div>

   <div class="box trouble" markdown="1">

   If the first command shows no `START` line, your incident logs are missing or were renamed: find them in `~/nb6018-cw/s11/incident/` before going on. If the access-log count is 0, write that in your note with the time, and continue: you will collect again later.

   </div>

### Part C: collect both logs, and seal each as it arrives

{: start="5"}
5. **Collect the CloudTrail files.**

   ```bash
   clog "sync start: s3://$TRAIL/ to trail/"
   aws s3 sync "s3://$TRAIL/" "$C1/trail/" --region "$REGION" --no-progress --only-show-errors
   clog "sync end: s3://$TRAIL/ to trail/"
   seal "$C1" trail
   find "$C1/trail" -type f | wc -l; wc -l < "$C1/listings/trail-landed.tsv"
   ```

   <div class="box expect" markdown="1">

   No output from the sync itself, then the seal line. The folder `trail/AWSLogs/` holds your account ID, then `CloudTrail/` and `CloudTrail-Digest/`, each with a folder per Region, then year, month and day. The number of files collected is equal to or a little larger than the number listed in step 3: files keep arriving, and the newest landed between the two commands.

   </div>

   <div class="box trouble" markdown="1">

   If the sync stops with an error, run the same command again: `sync` copies only what is missing. Note both runs in the collection log. If the number collected is smaller than the number listed, something stopped the download: run the sync again before you seal. If you sealed too early, do not unseal: collect again into a new folder, as for `c2`, and note why.

   </div>

6. **Collect the server access log files.**

   ```bash
   clog "sync start: s3://$LOGS/ to access-logs/"
   aws s3 sync "s3://$LOGS/" "$C1/access-logs/" --region "$REGION" --no-progress --only-show-errors
   clog "sync end: s3://$LOGS/ to access-logs/"
   seal "$C1" access-logs
   find "$C1/access-logs" -type f | wc -l; wc -l < "$C1/listings/access-logs-landed.tsv"
   ```

   <div class="box expect" markdown="1">

   The folder `access-logs/case/` holds the access-log files, each named with a date and time and a random string, with no file extension. The counts agree, or the folder holds a few more.

   </div>

   <div class="box trouble" markdown="1">

   If the folder is empty, no file had arrived: keep the empty, sealed folder as the record of that fact. The collection log already says when you looked.

   </div>

7. **Write the custody and register entries.** Open the blank custody record and evidence register from the LMS, saved in `records/`. Enter the listings, the CloudTrail collection and the access-log collection, each as its own item:

   | In the custody record | Example for the CloudTrail collection |
   |---|---|
   | Time (UTC) | From the `sync end` line of your collection log |
   | Item | S12-002, CloudTrail files, collection c1 |
   | Source location | `s3://nb6018-trail-ab-4821/` (your own name) |
   | Action | Collected with `aws s3 sync`; hashed and made read-only by `seal` |
   | Tool and version | Your `aws --version` line; `sha256sum` |
   | Identity | `arn:aws:iam::********3333:user/nb6018-analyst` |
   | From address | Your Kali address from step 2 |
   | Where kept | `evidence/c1-<time>/trail/` on your Kali VM |
   | Hash | "N files, SHA-256 in manifest-sha256.txt; manifest hashed at close" |

   <div class="box expect" markdown="1">

   Three items in the register (S12-001 listings, S12-002 CloudTrail files, S12-003 access-log files), each with its file count, and one custody entry for each action so far, written now, not at the end of the day.

   </div>

   <div class="box trouble" markdown="1">

   If you have not got the blank forms, make the two tables yourself, with the columns of the table in this step, and note that you did. If you forgot an entry, add it at the end, marked "late entry", with the reason.

   </div>

### Part D: validate the CloudTrail files

{: start="8"}
8. **Run `validate-logs` once for each Region in your collection.**

   ```bash
   TRAIL_ARN=$(aws cloudtrail describe-trails --trail-name-list "$TRAIL_NAME" --region "$REGION" --query 'trailList[0].TrailARN' --output text)
   VSTART=$(grep -m 1 'trail nb6018-trail created' ~/nb6018-cw/s11/config-log.txt | cut -c1-20)
   echo "$TRAIL_ARN from $VSTART"
   for r in $(ls "$C1"/trail/AWSLogs/*/CloudTrail/); do
     clog "validate-logs start: region $r, from $VSTART"
     aws cloudtrail validate-logs --trail-arn "$TRAIL_ARN" --start-time "$VSTART" --verbose --region "$r" > "$C1/validation/validate-$r.txt" 2>&1
     clog "validate-logs end: region $r: $(tail -n 2 "$C1/validation/validate-$r.txt" | tr '\n' ' ')"
     echo "  log files of $r in collection: $(find "$C1/trail/AWSLogs" -path "*/CloudTrail/$r/*" -type f | wc -l)"
   done
   seal "$C1" validation
   ```

   <div class="box expect" markdown="1">

   For each Region, a summary such as `24/24 digest files valid` and `52/52 log files valid`, written into your collection log, and a count of the log files you collected for that Region. Every file that the run checked says `valid`. The number checked may be smaller than the number collected: the difference should be the files delivered after the latest digest. You record the result, and the difference, in the register (S12-004).

   </div>

   <div class="box trouble" markdown="1">

   If `VSTART` is empty, your configuration log has no line with "trail nb6018-trail created": take the time of the trail's creation from `readiness/08-trail.json` or from your notes, in the form `YYYY-MM-DDThh:mm:ssZ`, and set `VSTART` to it. If a line says `INVALID`, stop and record it exactly, with the time, then tell the lecturer: a real invalid result is a finding, never something to repair. If the summary says no digest files were found, digests start about an hour after validation was enabled: check the time of Part C of Session 11, and run the command again later.

   </div>

### Part E: working copies, decompressed and ordered

{: start="9"}
9. **Make the working copies.** The originals stay sealed; you work only in `work/`.

   ```bash
   W="$S12/work/c1"; mkdir -p "$W"
   cp -r "$C1/trail" "$C1/access-logs" "$W/" && chmod -R u+w "$W"
   find "$W/trail" -name '*.json.gz' -exec gunzip {} +
   find "$W/trail" -path '*/CloudTrail/*' -name '*.json' | awk -F_ '{print $(NF-1) "\t" $0}' | sort > "$W/trail-files-in-order.tsv"
   find "$W/access-logs" -type f | sort > "$W/access-log-files-in-order.txt"
   xargs -a "$W/access-log-files-in-order.txt" -d '\n' cat > "$W/access-logs-in-file-order.log"
   clog "working copies made in work/c1: decompressed and ordered"
   wc -l "$W/trail-files-in-order.tsv" "$W/access-log-files-in-order.txt" "$W/access-logs-in-file-order.log"
   ```

   The CloudTrail files are ordered by the time in their names, across all Regions. The access-log files are joined in the order of their names, into one file. Nothing is read or interpreted yet: ordering is preparation, and analysis is Session 13's.

   <div class="box expect" markdown="1">

   A list of the CloudTrail files with the time from each name first, in the form `YYYYMMDDThhmmZ`, a list of the access-log files, and one joined access-log file with one line per request. The sealed originals are unchanged: `sha256sum -c` on the manifest, in step 17, will show it.

   </div>

   <div class="box trouble" markdown="1">

   If `gunzip` says permission denied, the `chmod` did not run: run `chmod -R u+w "$W"` and repeat the `find ... gunzip` line. If you ran `gunzip` inside `evidence/` by mistake, it will have failed, because the folder is read-only. That is exactly what the seal is for.

   </div>

10. **Open one record of each kind, to confirm that each file holds what it should.**

    ```bash
    head -c 300 "$(head -n 1 "$W/trail-files-in-order.tsv" | cut -f2)"; echo
    head -n 1 "$W/access-logs-in-file-order.log" | cut -c1-200
    ```

    <div class="box expect" markdown="1">

    The CloudTrail file begins `{"Records":[{"eventVersion":` and goes on with the fields of one event. The access-log line begins with a long string of letters and digits (the owner of the bucket), then your case bucket's name, then a time in square brackets with `+0000`. That is all: you have confirmed that the files are what their names say. Do not go further today.

    </div>

    <div class="box trouble" markdown="1">

    If the CloudTrail file shows unreadable characters, it is still compressed: check that the path ends in `.json`. If the access-log file is empty, no access-log file had arrived: see "If records are still arriving".

    </div>

### Part F: the case bucket's history and metadata

{: start="11"}
11. **List the history before anything else in the case bucket.** This is your first request to the case bucket today.

    ```bash
    clog "list-object-versions start: s3://$CASE/staging/"
    aws s3api list-object-versions --bucket "$CASE" --prefix staging/ --region "$REGION" > "$C1/case/history/versions-before.json"
    clog "list-object-versions end"
    seal "$C1" case/history
    cat > "$S12/versions.py" <<'EOF'
    import json, sys
    d = json.load(open(sys.argv[1]))
    for v in d.get("Versions", []):
        print(v["Key"], v["VersionId"], "latest" if v["IsLatest"] else "-", v["LastModified"], v["Size"], v["ETag"].strip('"'), sep="\t")
    for m in d.get("DeleteMarkers", []):
        print(m["Key"], m["VersionId"], "latest" if m["IsLatest"] else "-", m["LastModified"], "delete-marker", "-", sep="\t")
    EOF
    python3 "$S12/versions.py" "$C1/case/history/versions-before.json" | sort -t "$(printf '\t')" -k1,1 -k4,4 > "$S12/records/versions-before.tsv"
    column -t -s "$(printf '\t')" "$S12/records/versions-before.tsv"
    ```

    The small Python file only prints the saved answer as a table, sorted by key and then by time; it sends no request.

    <div class="box expect" markdown="1">

    Ten lines. Three versions each of `client-list.csv`, `design-notes.txt` and `pricing-plan.txt`, with sizes that grow from version 1 to version 3, and the third version of the first two files marked `latest`. For `pricing-plan.txt`, no version is `latest`: the tenth line, a `delete-marker`, is. Its time is the delete from CloudShell, at the end of `part2-log.txt`.

    </div>

    <div class="box trouble" markdown="1">

    If you see fewer versions, check that `--prefix` is `staging/` with the slash. If `pricing-plan.txt` has no delete marker, check `part2-log.txt`: did the delete run? If it did not, your incident is incomplete: record that, and ask the lecturer before you go on. If you see more versions than nine, someone wrote to the bucket after the incident: record it and tell the lecturer.

    </div>

12. **Read the metadata of every version.** One request per version; the delete marker is skipped, because it has no content.

    ```bash
    clog "head-object start: every version under s3://$CASE/staging/"
    n=0
    while IFS="$(printf '\t')" read -r key vid latest when size etag; do
      [ "$size" = "delete-marker" ] && continue
      n=$((n+1))
      aws s3api head-object --bucket "$CASE" --key "$key" --version-id "$vid" --region "$REGION" < /dev/null > "$C1/case/head/head-$n-$(basename "$key").json"
    done < "$S12/records/versions-before.tsv"
    clog "head-object end: $n versions"
    seal "$C1" case/head
    grep -h -E '"(VersionId|ETag|ContentLength|ServerSideEncryption)"' "$C1"/case/head/head-1-*.json
    ```

    <div class="box expect" markdown="1">

    `head-object end: 9 versions`, and for the first file the fields `"ContentLength"`, `"ETag"`, `"VersionId"` and `"ServerSideEncryption": "AES256"`. Each head file's `VersionId` matches its line in `versions-before.tsv`.

    </div>

    <div class="box trouble" markdown="1">

    If a request says `Not Found` or `403`, a version ID was cut or mistyped: check that the listing was not edited. Never run `head-object` on the delete marker's version ID: S3 answers that the method is not allowed, and the request is recorded for nothing.

    </div>

13. **Match each version to its local copy by ETag.**

    ```bash
    md5sum ~/nb6018-cw/s11/incident/files/* > "$S12/records/local-md5.txt"
    while IFS="$(printf '\t')" read -r key vid latest when size etag; do
      [ "$size" = "delete-marker" ] && continue
      local_file=$(grep "^$etag " "$S12/records/local-md5.txt" | awk '{print $2}' | xargs -r -n 1 basename)
      printf '%s\t%s\t%s\t%s\n' "$key" "$vid" "$etag" "${local_file:-NO MATCH}"
    done < "$S12/records/versions-before.tsv" > "$S12/records/etag-match.tsv"
    column -t -s "$(printf '\t')" "$S12/records/etag-match.tsv"
    ```

    <div class="box expect" markdown="1">

    Nine lines and nine matches. Each key is matched to a local file with the same name and a version number in front, `1-` for the oldest, `3-` for the newest: `staging/pricing-plan.txt` to `1-pricing-plan.txt`, `2-pricing-plan.txt` and `3-pricing-plan.txt`, in the order of their times. Each version in the bucket holds exactly the content that your script uploaded.

    </div>

    <div class="box trouble" markdown="1">

    If a line says `NO MATCH`, first look at the ETag: if it ends in a hyphen and a number, the file was uploaded in parts, and if `ServerSideEncryption` says `aws:kms`, the bucket's encryption was changed. Neither should happen with the Session 11 script. If the ETag is a plain 32-character value and still matches nothing, a local file in `files/` was changed or deleted after Session 11: record it, and rely on the downloaded copies in step 15.

    </div>

### Part G: recover the deleted file by version ID

{: start="14"}
14. **Download each version of `pricing-plan.txt` by its version ID.** The bucket does not change.

    ```bash
    clog "get-object start: every version of s3://$CASE/staging/pricing-plan.txt, by version ID"
    n=0
    grep "^staging/pricing-plan.txt$(printf '\t')" "$S12/records/versions-before.tsv" | grep -v delete-marker | sort -t "$(printf '\t')" -k4,4 |
    while IFS="$(printf '\t')" read -r key vid latest when size etag; do
      n=$((n+1))
      aws s3api get-object --bucket "$CASE" --key "$key" --version-id "$vid" --region "$REGION" \
        "$C1/case/recovered/pricing-plan-v$n.txt" < /dev/null > "$C1/case/recovered/pricing-plan-v$n.response.json"
      echo "v$n  $vid"
    done
    clog "get-object end"
    seal "$C1" case/recovered
    ```

    <div class="box expect" markdown="1">

    Three lines, `v1` to `v3`, each with its version ID, and in `case/recovered/` three text files with a response file each. Each response file shows the same `VersionId` and `ETag` as the listing. The first line of each text file reads `SYNTHETIC TEACHING FILE - NB6018CEM - contains no real data`.

    </div>

    <div class="box trouble" markdown="1">

    If S3 answers `NoSuchKey` or `Not Found`, the command was sent without a version ID, or with the delete marker's ID: check the `grep -v delete-marker` part. If it answers `AccessDenied`, your identity is not `nb6018-analyst`: check step 2. Never try to "fix" a missing object by changing the bucket.

    </div>

15. **Hash the recovered versions and compare them with your local copies.**

    ```bash
    cd "$C1/case/recovered" && sha256sum pricing-plan-v*.txt; cd - > /dev/null
    cd ~/nb6018-cw/s11/incident/files && sha256sum ?-pricing-plan.txt; cd - > /dev/null
    for n in 1 2 3; do cmp -s "$C1/case/recovered/pricing-plan-v$n.txt" ~/nb6018-cw/s11/incident/files/$n-pricing-plan.txt && echo "v$n identical to $n-pricing-plan.txt"; done
    ```

    Enter the three recovered versions in the register as S12-007 (or one item each, if your register uses one line per file), each with its version ID, its SHA-256 value and its source location, `s3://<your case bucket>/staging/pricing-plan.txt` with `versionId=`.

    <div class="box expect" markdown="1">

    Three SHA-256 values for the recovered versions, the same three values for the local copies, and three lines saying `identical`. The deleted file is recovered, every version of it, and you can show that each is exactly what was uploaded.

    </div>

    <div class="box trouble" markdown="1">

    If a pair differs, check the order first: `v1` is the oldest version by time. If they still differ, the local copy may have changed after Session 11: record both values. The recovered version is the evidence; your local copy is only a reference.

    </div>

### Part H: prove nothing changed, and close the record

{: start="16"}
16. **List the history again, and compare.**

    ```bash
    clog "list-object-versions start (after recovery)"
    aws s3api list-object-versions --bucket "$CASE" --prefix staging/ --region "$REGION" > "$C1/case/history-after/versions-after.json"
    clog "list-object-versions end (after recovery)"
    seal "$C1" case/history-after
    python3 "$S12/versions.py" "$C1/case/history-after/versions-after.json" | sort -t "$(printf '\t')" -k1,1 -k4,4 > "$S12/records/versions-after.tsv"
    diff "$S12/records/versions-before.tsv" "$S12/records/versions-after.tsv" && clog "bucket history identical before and after recovery: nothing changed"
    ```

    <div class="box expect" markdown="1">

    No output from `diff`, and a collection-log line saying that the history is identical. The delete marker is still the latest entry for `pricing-plan.txt`.

    </div>

    <div class="box trouble" markdown="1">

    If `diff` shows a difference, stop. Record the two lines exactly, with the time, and tell the lecturer. Do not try to put anything back.

    </div>

17. **Close the collection.**

    ```bash
    clog "Kali public address at end: $(curl -s https://checkip.amazonaws.com)"
    ( cd "$C1" && sha256sum -c --quiet manifest-sha256.txt ) && clog "manifest re-checked: every file matches"
    chmod a-w "$C1/manifest-sha256.txt" "$C1"
    clog "S12 collection end; manifest SHA-256 $(sha256sum "$C1/manifest-sha256.txt" | cut -d' ' -f1)"
    sha256sum "$S12/collection-log.txt"
    ```

    Write the last entries in the custody record: the manifest's SHA-256 value, the collection log's SHA-256 value, the start and end times and addresses of the collection, and the statement that the bucket's history was identical before and after.

    <div class="box expect" markdown="1">

    `manifest re-checked: every file matches`, the end address (normally the same as the start), and the manifest's value. Your collection log now holds every request you made today, with its time.

    </div>

    <div class="box trouble" markdown="1">

    If the re-check reports a file that does not match, something wrote to a sealed folder. Record the file name and stop: do not hash the folder again to make the problem disappear. If the address changed between start and end, record both: Session 13 will need both.

    </div>

### If records are still arriving: collect again, and record that too

If step 3 or step 4 showed few or no access-log files, collect again later, at least a few hours after the incident's end, and as often as you need. A later collection goes into a new folder and never changes `c1`:

```bash
source ~/nb6018-cw/s12/s12-env.sh
C2="$S12/evidence/c2-$(date -u +%Y%m%dT%H%MZ)"; mkdir -p "$C2"/{listings,access-logs}
clog "second collection start; Kali public address: $(curl -s https://checkip.amazonaws.com)"
aws s3api list-objects-v2 --bucket "$LOGS" --region "$REGION" --query 'Contents[].[LastModified,Size,Key]' --output text | sort > "$C2/listings/access-logs-landed.tsv"
seal "$C2" listings
aws s3 sync "s3://$LOGS/" "$C2/access-logs/" --region "$REGION" --no-progress --only-show-errors
seal "$C2" access-logs
clog "second collection end: $(find "$C2/access-logs" -type f | wc -l) access-log files"
```

Enter `c2` as a new item in the register, with its own custody entries. Then compare the two manifests: files that both collections hold should have the same SHA-256 values, and the new files are the ones that arrived in between. Some of them will hold the lines of today's own requests to the case bucket. Do the same for the trail bucket if your CloudTrail files were still arriving.

### Checkpoint

Judge your own work against this table. It is formative and is not marked here, but every row is part of your coursework evidence.

| # | Check | Your proof |
|---|---|---|
| 1 | The collection log has a UTC line for every request and every seal, and the start and end addresses | `collection-log.txt` |
| 2 | Both logs collected, every file hashed on arrival and read-only, and the manifest re-checked | `manifest-sha256.txt`; the re-check line |
| 3 | The two clocks noted: arrivals compared with the incident, and completeness stated as a limitation | `records/two-clocks.md` |
| 4 | `validate-logs` run for every Region in the collection, with each result and any difference in counts explained | `validation/`; register S12-004 |
| 5 | The history listed before any recovery, and the metadata of all nine versions saved | `case/history/`, `case/head/` |
| 6 | Nine ETags matched to the nine local files | `records/etag-match.tsv` |
| 7 | Three versions of `pricing-plan.txt` recovered by version ID, each hashed and identical to its local copy | `case/recovered/`; register S12-007 |
| 8 | The bucket's history identical before and after | The `diff` line in the collection log |
| 9 | Custody record and register complete, with no gap and no entry written later without being marked late | `records/` |

### If you have time

**Find the clocks in the file names.** Pick the CloudTrail file whose name holds the earliest time after the incident started, and compare that time with its last-modified time in `trail-landed.tsv`. Do the same for one access-log file. What does each pair tell you, and what does it not tell you?

**Check the ETag rule from the other side.** Run `head-object` on one version with `--checksum-mode ENABLED` added, saving the answer to a new file in `records/` and noting the request in your collection log. Which extra value appears, and why does it not replace your SHA-256 value?

## The cloud readiness and collection check

A short check follows this session. Its date is on the LMS. You pass it when all three rows are true, and you can show each one from your own files.

| Row | It is true when | Your proof |
|---|---|---|
| Ready | Every row of the Session 11 readiness checklist is true | `~/nb6018-cw/s11/readiness/` and the checklist |
| Collected | Both logs collected, hashed on arrival and validated, with the custody record and register complete | The checkpoint table above, rows 1 to 4 and 9 |
| Recovered | The deleted file recovered by version ID, with its version ID and a SHA-256 value that matches the local copy | `case/recovered/`, step 15 |

If a row is false, use the time before the check: the catch-up route below covers each part.

## If you missed Session 12

This session collects your coursework evidence, so you cannot skip it, but you can do it alone from this page. Your evidence will simply be collected later, and your collection log will say when.

1. **Read sections 1 to 7 and run the five demos** (about 70 minutes). Answer each quick check before you open the answer.
2. **Do not touch the case bucket before you start the lab.** No console look, no listing. The rule from Session 11 still holds.
3. **Do the lab in one sitting** (about two hours), from Part A. Waiting longer than the class did is not a problem: more of the access logs will have arrived.
4. **Tick the checkpoint table** and keep every file.
5. **If you are blocked**, write to the lecturer through the LMS with the step number and the exact error message, with your account ID masked.

**If you missed Session 11 as well,** do Session 11 first, completely, using its own catch-up list: build the environment, verify it, and run the incident. Then wait. Do not collect on the same day as the incident: give the server access logs at least several hours, and a night if you can. Read this page while you wait.

**If your environment is broken** and cannot be repaired in time, the lecturer can give you the unit's reference collection to practise the method on. It lets you learn the steps, but it is not your evidence: your coursework needs a collection from your own environment.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. Explain why a collection from S3 can be defensible even though nothing in it is a forensic image.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A defensible collection is one a stranger can check, and that does not need an image: it needs a record of what was requested, how, when, from where and as whom, with a hash value for each file taken the moment it arrived. Those records and values let anyone see how each copy was made and confirm that it has not changed since. The points that earn marks: (1) no image is possible, only copies through the provider; (2) the collection record (what, how, when, where from, identity); (3) hash values on arrival.
</details>

**2. Thirty minutes after an incident, an analyst finds CloudTrail files for it but no server access log files. Write what she should record, and what she should do next.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
She records the time she looked, what had arrived for each record, and that server access logs are delivered on a best-effort basis, usually within hours, so their absence shows nothing yet. She collects what is there, then collects again later into a new folder and records that collection with its own time and hash values. The points that earn marks: (1) record the time and what was found; (2) the absence is explained by delivery delay, not by the incident; (3) collect again later as a separate, recorded collection.
</details>

**3. An analyst's collection ran from the same Kali VM, as the same IAM user, as part 1 of the incident she is investigating. Explain how her collection enters the records, and how she keeps it apart from the incident.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Each request she made to the case bucket was recorded like any other, as a CloudTrail data event and as a server access log line, with her identity, address and time. She keeps it apart by having recorded the start and end time and the address of her collection before her first request, and by its kind of request, such as requests for a version by its version ID, which the incident never made. The points that earn marks: (1) her requests are recorded in both logs; (2) identity and address alone cannot separate them; (3) recorded times, and the different operations, separate them.
</details>

**4. `validate-logs` reports `40/40 log files valid` for one Region, and the analyst collected 46 CloudTrail log files for that Region. Give two explanations that are consistent with a valid collection.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Six files may have been delivered after the latest digest file, so no digest lists them yet and the command did not check them. Some may also have been delivered before the start time given to the command, which only checks files from that time onwards. The points that earn marks: (1) files after the latest digest are not yet covered; (2) files before the start time are outside the range; (3) unchecked is not the same as invalid, so the analyst runs the command again later or explains each file.
</details>

**5. An object version's ETag is `"5f1e...-3"`. Explain why the analyst cannot compare it with the MD5 value of her local copy, and what she can compare instead.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The hyphen and the number show a multipart upload in three parts, so the ETag is built from the MD5 values of the parts and is not the MD5 value of the whole content. She can download that version by its version ID and compare its SHA-256 value with the SHA-256 value of her local copy. The points that earn marks: (1) multipart upload identified from the form of the ETag; (2) the ETag is not the MD5 of the content; (3) compare hash values of a downloaded copy instead.
</details>

**6. Explain why an analyst lists an object's versions before she recovers it, and why she downloads a version by its version ID instead of removing the delete marker.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The listing shows every version and the delete marker, with their version IDs and times, before anything happens, so she knows what exists and can show later that nothing changed. A download by version ID leaves the bucket unchanged, while removing the delete marker changes the evidence and destroys the record of when the object was deleted, which is a response action for the owner, not a collection step. The points that earn marks: (1) list first, to know what exists and to have a before-state; (2) get by version ID changes nothing; (3) removing the marker changes the evidence, and is the owner's decision.
</details>

<div class="quiz" markdown="1">

## End-of-day quiz

This quiz closes Day 6. The phase test examines no cloud domain, so Days 6 and 7 bring back earlier material: one question from each of Days 1 to 5. Write each answer in about two sentences before you open the model answer. Mark yourself on the points you made.

<div class="sa" markdown="1">

**Q1.** In Session 2, the unit loaded the client's list of MD5 values for its confidential documents into Autopsy as a hash set. Explain what a hit on that list proves, and why an edited copy of a confidential document would not be found by it. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
A hit proves that the file on the suspect's disk has exactly the same content as a document on the client's list, bit for bit, whatever its name or folder. An edited copy has different content, so its hash value is completely different and matches nothing on the list, even if almost every word is the same. **Points:** (1) a hit means identical content; (2) the name and location do not matter to the match; (3) any change to the content gives a new value, so edited copies are missed and need another method, such as searching for words.
</details>

</div>

<div class="sa" markdown="1">

**Q2.** A RAID 5 set of three disks arrives with one disk dead. A RAID 0 set of two disks arrives in the same state. Explain why the data of the first set can still be read in full, and that of the second cannot. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
RAID 5 stores a parity stripe in each row, calculated with XOR from the other stripes, so any one missing stripe can be worked out again from the stripes that remain. RAID 0 stores stripes on the two disks with no parity, so every stripe on the dead disk is simply gone, and only pieces of files survive on the other. **Points:** (1) RAID 5 keeps parity; (2) XOR of the remaining stripes rebuilds the missing one; (3) RAID 0 has no redundancy, so the lost disk's stripes cannot be rebuilt.
</details>

</div>

<div class="sa" markdown="1">

**Q3.** An examiner runs a memory capture tool from a USB stick on a suspect's running computer. Name two changes that the capture makes to the computer, and say how the examiner stops them being mistaken for the suspect's actions. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The tool starts as a new process and loads a driver into the kernel, using memory that may have held other data, and Windows records the USB stick in the registry. The examiner records the tool, its version, the stick and the exact times of the capture as she acts, so that these traces can later be identified as the examiner's footprint and set aside. **Points:** (1) one correct change, such as a new process or the driver in memory; (2) a second, such as the USB record in the registry or overwritten pages; (3) a record made at the time, with tool, version and times.
</details>

</div>

<div class="sa" markdown="1">

**Q4.** A company switches on an anomaly-based IDS and lets it measure its baseline during a quiet holiday week. Describe what happens when normal work resumes, and name the kind of error that results. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The baseline describes a week with little traffic, so ordinary working traffic, with more volume, more hosts and different hours, differs from it and raises many alerts. These alerts are false positives, and their number can hide a real attack among them. **Points:** (1) the baseline is not representative of normal work; (2) normal activity then departs from it and raises alerts; (3) the term false positive, used correctly, or the risk of alert fatigue.
</details>

</div>

<div class="sa" markdown="1">

**Q5.** In Session 9, an analyst unpacks a sample with `upx -d` into a new file. Explain why the unpacked file must be recorded as a new item with its own hash value, and why that value will not match a public report about the original sample. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
Unpacking writes a different file with different bytes, made by the analyst's tool, so it is a new item: the custody record must show where it came from, which tool and version made it, and its own hash value. Public reports describe the sample as it was found, packed, so their hash values describe the packed file, and the unpacked file's value can even differ between versions of UPX. **Points:** (1) a new file with different content is a new item; (2) its origin, tool and version are recorded with its hash value; (3) public values describe the packed original, so they cannot match.
</details>

</div>

</div>

## Coming next

You now hold a verified copy of everything your environment recorded, with a record that says how each piece arrived. Session 13 opens the logs. You will parse the CloudTrail files, set them beside the server access logs, find your own collection in both and set it aside, rebuild the incident's timeline, and begin writing your findings in the report template.
