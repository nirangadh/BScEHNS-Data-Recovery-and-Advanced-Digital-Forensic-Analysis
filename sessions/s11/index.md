---
session_code: S11
description: "Evidence when the computer belongs to someone else: the shared-responsibility model, what IaaS, PaaS and SaaS leave the customer, volatility, multi-tenancy and jurisdiction, and forensic readiness built in your own AWS account with CloudTrail, S3 server access logs, object versioning and log-file integrity validation."
hook: >-
  The case's trail runs out at a cloud drop: storage that the unit can never seize or image.
  Today each analyst rebuilds that kind of drop in their own AWS account, switches every record on before anything happens there,
  and then makes something happen. What will be recorded, by whom, and how will we know that the record can be trusted?
outcomes:
  - "Explain the shared-responsibility model, and why the line it draws decides what evidence a customer can reach"
  - "Compare IaaS, PaaS and SaaS by the evidence that each leaves the customer"
  - "Explain volatility, multi-tenancy and jurisdiction as challenges for a cloud investigation"
  - "Justify forensic readiness in the cloud, and explain why a record that was off during an incident can never be recovered for that time"
  - "Identify what CloudTrail management events, CloudTrail data events, S3 server access logs, object versioning and log-file integrity validation each record or protect"
  - "Apply a readiness specification in your own AWS account, and verify every setting with saved evidence"
  - "Execute the scripted incident, and explain why it runs at the close of this session and not at the start of the next"
before:
  - "Explain what makes evidence [forensically sound](../s01/#1-forensically-sound-evidence-that-a-stranger-can-check), and what [forensic readiness](../s01/#forensic-readiness) means (Session 1)"
  - "Use a [hash value](../s01/#3-the-hash-value-showing-that-nothing-changed) for verification, and keep a [custody record](../s01/#4-chain-of-custody-the-record-that-holds-the-evidence-together) with no gaps (Session 1)"
  - "Name the phases of [incident response](../s01/#6-responding-to-an-incident-four-phases-and-six-functions) (Session 1)"
  - "Explain why [deletion removes the pointer, not the data](../s02/#4-how-deletion-really-works) (Session 2)"
  - "Normalise every time to [UTC](../s05/#8-one-clock-normalise-every-source-to-utc) before you build a timeline (Session 5)"
  - "Apply the [order of volatility](../s06/#2-the-order-of-volatility-collect-first-what-dies-first) (Session 6)"
demos:
  - id: S11-D1
    title: "The responsibility line slides"
    file: s11-d1-responsibility-line.html
    teaches: "As the service model moves from your own server to IaaS, PaaS and SaaS, more layers pass to the provider, and the evidence you can collect yourself shrinks with them."
  - id: S11-D2
    title: "A record that only runs forward"
    file: s11-d2-records-run-forward.html
    teaches: "Logging records only from the moment it is switched on: actions before the switch stay dark for ever, apart from the 90 days of management events that Event history keeps by itself."
  - id: S11-D3
    title: "Versions pile up under a delete"
    file: s11-d3-versions-under-delete.html
    teaches: "In a versioned bucket, every overwrite adds a version and a delete only adds a delete marker on top, so the current view looks empty while every earlier version is still there."
  - id: S11-D4
    title: "Two logs, two clocks"
    file: s11-d4-two-clocks.html
    teaches: "CloudTrail delivers its files within minutes, while server access logs arrive hours later and not always, so a collection made too soon holds one complete record and one partial record."
  - id: S11-D5
    title: "The digest chain"
    file: s11-d5-digest-chain.html
    teaches: "Each hourly digest file holds the hash value of every log file and the signature of the digest before it, so a changed log file, a removed log file and a removed digest file are each detected."
slides: s11-cloud-readiness.pptx
evidence: "none from the lab share: you build the environment yourself in your own AWS account, to the specification on this page, and it becomes your coursework evidence"
---

Day 6 opens the coursework block. Sessions 11, 12 and 13 work on one environment, and that environment is the evidence of your coursework. Three plain statements come first.

**Today you build the evidence yourself.** In Sessions 1 to 10, every piece of evidence came from the lab share, chosen and checked by the unit. This one is different. You build a small cloud environment in your own AWS account, to the specification on this page, and you generate its evidence. The coursework brief, on the LMS, tells you what your report must show. This page tells you how to set the environment up.

**Today sets things up and makes one thing happen. It does not investigate.** You switch every record on, you prove that each one is on, and at the end you run a short scripted incident. You do not collect anything today, and you do not analyse anything. Session 12 collects and preserves. Session 13 analyses and builds the timeline.

**Where this fits the case.** The suspect's data did not only leave on removable media. The case file names a cloud drop: online storage where the data was staged, outside the client's building. The unit cannot seize that drop or image it, and the real one is not available to you. So each analyst rebuilds that kind of drop in their own account and investigates their own copy. Your environment is a reconstruction, built so that the method is real. The unit also uses one public practice range, flaws.cloud, which its owner publishes for exactly this kind of exploration.

The question for today is not "what happened?" It is the question that comes before every investigation in the cloud: what must be switched on now, so that the next action leaves a record that we can trust?

## 1. The cloud drop: evidence you will never hold

### The idea

In every session so far, you held the evidence. You had a forensic image of a disk, a memory image, a packet capture. You could hash it, copy it and read every byte, including the deleted ones.

In the cloud, you hold nothing. Your files sit on disks owned by a {% include term.html t="cloud-provider" %}, in a building you will never enter. The same disks also hold other customers' data. You cannot pull a disk out and image it, and the provider will not do it for you.

So what can an investigator reach? Only three things, and only through the provider's own interfaces:

1. **The content**, downloaded through the provider's service. This is a copy of a file, not a forensic image of a disk. There is no unallocated space and no slack to read.
2. **The metadata** that the service keeps about each file: its size, its times, its versions.
3. **The provider's records** of what happened: who did what, and when. These exist only if someone switched them on.

The provider in this module is Amazon Web Services (AWS). Your data lives in one {% include term.html t="region" %}, which you choose. The module uses **Asia Pacific (Mumbai)**, whose code is `ap-south-1`.

### How it works

Think about the suspect's cloud drop as the unit sees it. The unit has a name for the storage and, perhaps, a court order. It cannot walk into a data centre. Whatever the unit learns, it learns from what AWS gives back: the files as they are now, their metadata, and AWS's records of past actions.

That changes what "forensically sound" means in the cloud. Session 1 said that evidence is forensically sound when a stranger can check that it was collected properly and has not changed. On a disk, you showed that with a forensic image and a hash value. In the cloud you cannot image anything. You show it instead with three habits:

- **A documented acquisition.** Every command that collects evidence is recorded, with its time in UTC, so a stranger could repeat it.
- **Hash values at collection.** The moment a file arrives on your analysis machine, you hash it, and the custody record carries that value from then on.
- **Records that can be checked.** The provider's logs carry their own proof that they have not changed since delivery. Section 7 shows how.

The first two are Session 12's work. Today is about the third, and about something that comes before all three: the records must exist.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An analyst downloads every file from a company's cloud storage. Why is this not the same as a forensic image of a disk?</p>
  <ul class="qc-opts">
    <li data-key="a">Because downloaded files cannot be hashed</li>
    <li data-key="b">Because a download changes the files in the cloud</li>
    <li data-key="c">Because a download gives only the current files, with no deleted data, unallocated space or slack</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). A download is a copy of each file as the service shows it now. A forensic image copies every sector, including what the file system no longer lists. Downloaded files can and must be hashed (a is wrong), and reading a file does not change it (b is wrong), although the read itself may be recorded.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The standards that name the problem</summary>

NIST's report *NIST Cloud Computing Forensic Science Challenges* (NISTIR 8006) lists the problems that cloud computing creates for forensic work, grouped by kind: architecture, data collection, analysis, anti-forensics, incident first response, roles, legal matters, standards and training. Most of them come back to the point of this section: the investigator depends on the provider for access, for records and for the integrity of both.

The disk-era guidance still applies. NIST SP 800-86, which Session 1 used for the four stages of an investigation, applies to the cloud with one change: collection happens through the provider's interfaces, so the record of each collection step carries more of the weight that the forensic image used to carry.
</details>

<div class="box key" markdown="1">

In the cloud you never hold the original. You reach the content, its metadata and the provider's records, and only through the provider.

</div>

## 2. Shared responsibility: the line decides what you can reach

### The idea

Who keeps a cloud system safe? Both sides do, and they split the work. AWS describes the split in two short phrases. AWS is responsible for security **of** the cloud: the buildings, the hardware, the network and the software that runs the virtual machines. The customer is responsible for security **in** the cloud: their data, their users and passwords, and every setting they choose. This split is called the {% include term.html t="shared-responsibility-model" %}.

For an investigator, the same line has a second meaning. It decides what evidence you can reach.

- **Below the line**, on the provider's side, you never get the evidence yourself: not the physical disk, not the logs of the software that runs the virtual machines, not anything about other customers.
- **Above the line**, on your side, you get the evidence only if you arranged for it. The provider will record actions in your account, but only the kinds of records you switched on, kept for only as long as you chose.

### How it works

Take two questions from the case and place them against the line.

*"Which IP address read the client's file in the drop at 02:14?"* The read happened in the customer's account, on the customer's data. Whether anyone can answer depends on one thing: did the customer switch on a record of reads before 02:14? The answer is above the line, so it is the customer's responsibility.

*"Did another customer on the same hardware see the client's data?"* That is about the provider's hardware and its separation of customers. The customer cannot investigate it. Only the provider can, and the customer learns only what the provider chooses or is required to share. The answer is below the line.

This is why the model matters more to an investigator than its name suggests. A security engineer reads it as a list of jobs. An investigator reads it as a map of where evidence can exist, and of who had to create it.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The data is in AWS, so AWS keeps the evidence." | AWS keeps the records that the customer switched on, for as long as the customer chose. | Most records about your own data are your responsibility to switch on and to keep. |
| "The cloud is just someone else's computer." | It is someone else's computer, shared with strangers, reached only through the owner's interfaces. | The second half is what changes forensic work: shared hardware and no direct access. |
| "Shared responsibility means AWS and the customer share every task." | Each task belongs to one side; the line between the sides moves with the service. | Section 3 shows the line moving. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A company's cloud storage was emptied by an attacker. The company never switched on any record of reads or deletions. Under the shared-responsibility model, who is responsible for the missing record?</p>
  <ul class="qc-opts">
    <li data-key="a">The company, because recording activity on its own data is on the customer's side of the line</li>
    <li data-key="b">The provider, because the storage runs on the provider's hardware</li>
    <li data-key="c">Nobody, because cloud storage cannot record reads or deletions</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The data and the settings of the account are on the customer's side. The provider offers the records, but only the customer can switch them on. The hardware being the provider's (b) does not move the customer's settings below the line, and (c) is wrong: Section 5 shows the switches.</p></div>

</div>

<div class="box key" markdown="1">

The shared-responsibility line is also an evidence line: below it you cannot reach the evidence, above it the evidence exists only if the customer created it.

</div>

## 3. IaaS, PaaS and SaaS, by the evidence they leave you

### The idea

Cloud services are sold in three main models. The difference between them is how much of the system you control, and so how much evidence you can collect yourself.

- {% include term.html t="iaas" %}: you rent a virtual server. You manage its operating system and everything on it. Example: a virtual server in Amazon EC2.
- {% include term.html t="paas" %}: you bring code, data and settings; the provider runs the servers and the operating system under them. Example: a managed database, where you never log in to the computer that runs it.
- {% include term.html t="saas" %}: you use a finished program that the provider runs. You control only your data and your users. Example: web mail, or an online office suite.

The rule to remember: **more control lower down, less the higher you go.** On your own server you could take everything, as you did in Sessions 1 to 6. Each step up the models gives one more layer to the provider, and the evidence of that layer goes with it.

### How it works

Watch the line move, one model at a time. Notice what the "evidence you can collect yourself" list loses at each step.

{% include demo.html id="S11-D1" %}

| Model | You control | Evidence you can collect yourself | Evidence only the provider holds |
|---|---|---|---|
| Your own server | Everything, down to the hardware | A forensic image of the disk, a memory image, a packet capture, every log | Nothing |
| IaaS | The operating system and everything above it | A snapshot of the virtual disk, a memory image taken from inside the server, the operating system's logs, network records if you switched them on | The physical host, the software that runs the virtual machines, the physical network |
| PaaS | Your code, your data, the service's settings | The logs that the service offers, your data through the service, the records of the account | The operating system, its memory and its disk |
| SaaS | Your data and your users | An export of your data, the audit log that the vendor offers, often limited by your plan and kept for a fixed time | Almost everything else |

**Where does S3 sit?** Amazon S3, the storage service you use today, stores files called objects in containers called buckets. You never see a server, an operating system or a disk. You control your data and the settings of your buckets, and nothing below them. For evidence, it behaves like PaaS: you can collect the objects through the service, their metadata, and the records that you switched on. That is all, which is why switching them on matters so much.

<div class="box metaphor" markdown="1">

**The comparison.** The four models are like four ways to live in a city: your own house, an unfurnished rented flat, a serviced apartment and a hotel room. Ask one question in each: if something is stolen, whose camera recordings can you get?

**Why it fits.** In your own house, you installed the cameras, so every recording is yours (your own server). In an unfurnished flat, the building belongs to the landlord but you fit out the rooms, so the cameras inside the rooms are yours and the cameras in the corridors are not (IaaS). In a serviced apartment, the furniture and the cleaning are the landlord's too, and you only bring your belongings (PaaS). In a hotel room, almost everything is the hotel's, and you get only what the front desk agrees to show you (SaaS).

**Where it breaks.** A landlord's corridor camera records whether you ask for it or not. A cloud provider records your account's actions only if you switched those records on, and only for as long as you chose to keep them. And a hotel may show the police a corridor recording that includes other guests; a cloud provider will never give you a record that shows another customer.

**So what.** In the cloud, the question is never only "whose camera is it?" It is also "did anyone switch it on before the theft?" For the layers you control, readiness is your job.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A company runs its web shop on a virtual server it rents (IaaS) and its e-mail on an online mail service (SaaS). Which piece of evidence can it collect itself from the web shop, but not from the e-mail service?</p>
  <ul class="qc-opts">
    <li data-key="a">The list of users who signed in</li>
    <li data-key="b">A memory image taken from inside the running system</li>
    <li data-key="c">A copy of its own data</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). On IaaS the company controls the operating system, so it can run a memory capture inside its server, as you did on your own VM in Session 6. On SaaS it never reaches the operating system. A sign-in record (a) and a copy of its own data (c) are usually available from both, through the service.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The models in the standards, and the edge cases</summary>

The three models come from NIST's definition of cloud computing, SP 800-145, which also defines the deployment models (public, private, community and hybrid cloud). Real services do not always fit one box. Serverless functions, such as AWS Lambda, are often called "function as a service" and sit between PaaS and SaaS; containers run by the provider sit between IaaS and PaaS. For an investigator, the box matters less than the question it stands for: which layers can I reach, and which records exist for the layers I cannot?

Even on IaaS, the snapshot of a virtual disk is not a forensic image in Session 1's sense. It is made by the provider's software, it shows the virtual disk, and what the physical disks hold underneath stays below the line. It is still the closest the cloud comes to an image, which is why responders on IaaS take a snapshot before they change anything.
</details>

<div class="box key" markdown="1">

More control lower down, less the higher you go. For S3, the evidence you can reach is the objects, their metadata and the records you switched on.

</div>

## 4. Three challenges: volatility, multi-tenancy and jurisdiction

### The idea

Three words describe what makes cloud forensics harder than disk forensics. You will meet them in exam questions and in your coursework, so learn them with their meaning.

**Volatility.** In Session 6, volatile evidence was what disappears when the power goes off. In the cloud, much more is volatile. A whole virtual server can be created, used for twenty minutes and deleted, and its disk goes with it. Logs are kept for a fixed time and then removed. Settings change in seconds. The order of volatility still applies, but the cloud adds whole resources to the fast end of it.

**Multi-tenancy.** {% include term.html t="multi-tenancy" %} means that many customers share the same physical computers and disks. Only the provider's software keeps them apart. For an investigator, this has two results. You cannot image a shared disk, because it holds other customers' data, which you have no right to see. And you must trust the provider's separation, because you cannot check it yourself.

**Jurisdiction.** {% include term.html t="jurisdiction" %} is the power of a country's law over a person, a company or data. Cloud data sits in a Region, and a Region is in a country. A Sri Lankan company that stores its files in the Mumbai Region keeps them in India. The provider may be a company of a third country. When an investigator needs the provider's help, the question "whose law applies?" can have more than one answer.

### How it works

Apply each challenge to the case's cloud drop.

**Volatility.** Suppose the suspect created the drop, used it for one evening and deleted it the next day. Whatever was not recorded while it existed is gone. There is no unallocated space to search afterwards. The only evidence that can survive is what was written somewhere else while the drop existed: the provider's records, in a place that the suspect could not delete.

**Multi-tenancy.** The unit cannot ask for "the disk that held the drop". There is no single such disk. The files may be spread across many disks, mixed with other customers' data, and copied for safety into several buildings. The unit's evidence about the drop can come only from the drop's own account and from what the provider produces.

**Jurisdiction.** If the drop is in another country, the unit's client cannot simply demand records from the provider. A request usually goes through the law of the place where the data or the provider is, often through official channels between countries, and it takes time. During that time, volatility keeps working.

Notice how the three challenges work together. Volatility removes evidence, multi-tenancy stops you from fetching it yourself, and jurisdiction slows down every request to the one party who has it. That is the argument for the next section.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "Volatility in the cloud means RAM." | It means anything that disappears quickly: servers, their disks, short-lived logs and settings. | The cloud adds whole resources to the fast end of the order of volatility. |
| "Multi-tenancy means several users in one account." | It means several customers on the same physical hardware. | Users in one account are one tenant. |
| "The data is in Mumbai, so only Indian law applies." | The law of the data's location matters, and so may the law of the provider's home country and of the customer. | Several laws can claim the same data. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An investigator asks the provider for a forensic image of the physical disk that stored a suspect's files. Which challenge is the main reason the request is refused?</p>
  <ul class="qc-opts">
    <li data-key="a">Volatility</li>
    <li data-key="b">Jurisdiction</li>
    <li data-key="c">Multi-tenancy</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The physical disk holds other customers' data too, and the files may be spread across many disks, so there is no disk that belongs to the suspect alone. Volatility (a) and jurisdiction (b) can make the request harder, but even with no time pressure and the right court, a shared disk would not be imaged for one customer.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Jurisdiction in more detail</summary>

A few instruments come up again and again. The Council of Europe's Convention on Cybercrime (the Budapest Convention) sets common rules for cooperation between countries on electronic evidence, and Sri Lanka is a party to it. Mutual legal assistance treaties are the formal route by which one country asks another for evidence. The US CLOUD Act (2018) lets US authorities require providers under US law to produce data they control even when it is stored abroad, and allows agreements with other countries. Data protection laws, such as Sri Lanka's Personal Data Protection Act No. 9 of 2022 and the EU's GDPR, limit how personal data may be moved and handled, including during an investigation.

None of this is legal advice, and Session 17 returns to the law. For this module, the practical point is enough: in the cloud, a missing record often cannot be requested quickly, and sometimes cannot be requested at all.
</details>

<div class="box key" markdown="1">

Volatility removes evidence, multi-tenancy stops you from fetching it yourself, and jurisdiction slows every request to the provider.

</div>

## 5. Readiness in the cloud: records only run forward

### The idea

Session 1 defined {% include term.html t="forensic-readiness" %} as an organisation's ability to collect trustworthy evidence quickly and cheaply when something happens. On a laptop, even an organisation with no readiness at all still leaves traces: deleted files in unallocated space, the registry, the event logs. Sessions 2 to 5 lived on those traces.

The cloud gives you no such second chance. There is no unallocated space that you can read. If the provider was not asked to record an action, the action left no record that you can ever reach.

**A record that was off at the time of an incident cannot be switched on afterwards for the past.** Switching it on today records from today. Yesterday stays dark for ever.

### How it works

In AWS, the most important records are kept by {% include term.html t="cloudtrail" %}, the service that records actions in an account. Out of the box, AWS keeps one thing for you without being asked: {% include term.html t="event-history" %}, the last 90 days of {% include term.html t="management-event" text="management events" %} in each Region. A management event is an action on the settings of a resource: creating a bucket, changing who may read it, signing in.

What Event history never holds is the record of actions on the content: reading a file, writing a file, deleting a file. These are {% include term.html t="data-event" text="data events" %}, and CloudTrail records them only when you switch them on. In a leak, those are exactly the actions you need.

Watch what happens when the switch comes too late.

{% include demo.html id="S11-D2" %}

For this module, readiness means four records and one safeguard, all switched on before anything happens:

| Setting | What it records or protects | Without it |
|---|---|---|
| A CloudTrail {% include term.html t="trail" %} with management events | Every action on the account's settings, kept as files for as long as you keep them | Only the last 90 days, kept by AWS rather than by you, and never as files in your custody |
| CloudTrail data events on the case bucket | Every read, write and delete of an object in that bucket: who, when, from where, with which program | No record at all of who touched the files |
| S3 {% include term.html t="server-access-log" text="server access logs" %} | S3's own record of each request to the bucket, written by a different part of AWS | One record only, with nothing to compare it against |
| {% include term.html t="object-versioning" text="Object versioning" %} on the case bucket | Every earlier version of every object, after any overwrite or delete | An overwrite or a delete destroys the content for good |
| {% include term.html t="log-file-integrity-validation" text="Log-file integrity validation" %} on the trail | Proof that each CloudTrail log file has not been changed or removed since delivery | The log files are only as trustworthy as everyone who could reach them |

And one guardrail, which is not evidence but protects you: a {% include term.html t="budget-alarm" %} at US$1, set before anything else.

Most of these are off when you create an account. Data events are off by default because they are charged by volume: a busy bucket can produce millions of them. That is why you switch them on for one bucket only, the case bucket.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A company discovers on Friday that a confidential file was copied on Tuesday. On Friday it switches on CloudTrail data events for the bucket. What will they show about Tuesday?</p>
  <ul class="qc-opts">
    <li data-key="a">Tuesday's reads, because CloudTrail keeps 90 days of history</li>
    <li data-key="b">Nothing: data events are recorded only from the moment they are switched on</li>
    <li data-key="c">Tuesday's reads, but only from the IP addresses that the company already knows</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Records run forward only. The 90 days of Event history (a) cover management events, never data events, so Tuesday's read of the file is not there. Nothing in AWS can rebuild a record that was never written.</p></div>

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">Which of these does Event history show without any setup, for the last 90 days?</p>
  <ul class="qc-opts">
    <li data-key="a">Every download of every file</li>
    <li data-key="b">Every request recorded by S3 server access logs</li>
    <li data-key="c">The creation of a new bucket</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Creating a bucket is a management event. Downloads (a) are data events, which need a trail with data events switched on. Server access logs (b) are a separate record that S3 writes only when you switch them on, into a bucket you name.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Cost, scope and the readiness trade-off</summary>

Readiness is a trade-off between what you will be able to prove and what you pay to record and keep. At the time of writing, AWS charges nothing for the first copy of management events that a trail delivers to S3, and US$0.10 for each 100,000 data events; the files themselves take up ordinary S3 storage. On one small case bucket, the scripted incident produces a few dozen data events, a cost far below one cent. On a company's busiest bucket, data events can cost real money every month, which is why organisations scope them to the buckets that matter, and why that choice is itself a readiness decision that must be justified.

Server access logs cost nothing to deliver; you pay only to store the files. Versioning keeps every version, so storage grows with every overwrite. Readiness always has a price, and so does its absence: the price of not knowing.
</details>

<div class="box key" markdown="1">

A record that was off at the time of the incident cannot be switched on afterwards for the past. Readiness is decided before the incident, or not at all.

</div>

## 6. Two records, two clocks

### The idea

Your environment will hold two independent records of every request to the case bucket.

**CloudTrail** is the account's audit record. For each action it records who acted, what they did, when, from where and with which program. It delivers its records as compressed files to the trail's bucket, about every five minutes. AWS says that an event usually arrives within about five minutes of the action, but does not guarantee it.

**S3 server access logs** are written by S3 itself, one line for each request to the bucket, including requests from people who are not signed in at all. They are delivered as files to a separate bucket, on what AWS calls a best-effort basis. Most records arrive within a few hours. Some arrive later, and AWS states plainly that some may never arrive, and that the logs are not a complete account of every request.

### How it works

Why keep two records? Because each one can be wrong, late or incomplete in its own way, and the places where they agree or disagree are themselves evidence. Session 13 compares them line by line. Today, notice the timing, because it decides when the evidence can be collected.

{% include demo.html id="S11-D4" %}

<div class="box metaphor" markdown="1">

**The comparison.** CloudTrail and the server access logs are like two witnesses to the same night at a hotel: the front-desk register, filled in at once and handed to the manager every few minutes, and the night cleaner's notebook, handed in the next morning, sometimes with a page missing.

**Why it fits.** The register (CloudTrail) is quick and records who each guest is. The notebook (server access logs) is written by a different person, slowly, and it records things the register ignores, such as someone who walked in without checking in. A careful investigator wants both, because two independent witnesses who agree are stronger than one.

**Where it breaks.** Two human witnesses describe the same event in the same words, roughly. These two records do not: they count requests differently and record different details, so one action does not always appear as one line in each. And a missing page in the notebook is not a sign that someone tore it out: the server access logs are allowed to miss records.

**So what.** Wait for the slow witness before you collect, and never treat a missing access-log record, on its own, as proof that nothing happened.

</div>

This is why the scripted incident runs **at the close of this session**. If you ran it at the start of Session 12 and collected an hour later, CloudTrail's files would be there and many server access log records would not. You would collect one complete record and one partial record, and your comparison would show gaps that the method created, not the incident. Running it now gives the slow record the night to arrive. Session 12 opens by checking what arrived.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">An analyst runs an incident and collects both logs twenty minutes later. CloudTrail shows six reads; the server access logs show two. What is the most careful conclusion?</p>
  <ul class="qc-opts">
    <li data-key="a">The access-log records may not have been delivered yet, so the difference says nothing about the reads</li>
    <li data-key="b">Four of the reads were faked in CloudTrail</li>
    <li data-key="c">The server access logs were tampered with</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Twenty minutes is well inside the hours that server access logs may take. Before any other explanation, the analyst must allow for delivery delay, and even after waiting, a missing record may simply never have been delivered. Nothing in the timing points to faking (b) or tampering (c).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What each record is for</summary>

CloudTrail is built to answer "who": it records the identity behind each request, including which credential was used, and it covers the whole account, not one bucket. Server access logs are built to describe the request itself: each line holds details about the HTTP request, the response and its size. They also record requests that never reached CloudTrail's view of an identity, such as an anonymous request to a public bucket. Session 13 uses these differences to match one record against the other.

Both records also have a time, written in UTC. Session 5's rule applies from the first minute: your own notes of the incident are kept in UTC too, so that your notes, CloudTrail and the access logs can be laid on one timeline without conversion errors.
</details>

<div class="box key" markdown="1">

CloudTrail arrives in minutes; server access logs arrive in hours, or not at all. Run the incident now, and collect after the slow record has had time to land.

</div>

## 7. What the cloud keeps for you: versions and a signed record

### The idea

Two settings protect the evidence itself, not only the record of what happened to it.

**Object versioning** keeps the content. Session 2 taught that deleting a file usually removes the pointer, not the data. A versioned S3 bucket does something similar, on purpose. When an object is overwritten, the old content is kept as an earlier version. When an object is deleted, S3 does not remove anything: it puts a {% include term.html t="delete-marker" %} on top. Each version has its own {% include term.html t="version-id" %}. The normal view of the bucket shows only the newest version, so a deleted object looks gone. It is not.

**Log-file integrity validation** protects the record. It lets anyone check later that a CloudTrail log file has not been changed or removed since AWS delivered it. It is the cloud's help with the chain of custody.

### How it works

**Versions.** Follow one object, `staging/pricing-plan.txt`, through three writes and a delete.

{% include demo.html id="S11-D3" %}

Compare this with Session 2. On a disk, the deleted data survives by accident, until something overwrites it. In a versioned bucket, every version survives by design, until someone with the right permission deletes that specific version. That permanent delete is real: there is no unallocated space behind it. This is the edge of the comparison. Versioning keeps data that an ordinary delete would destroy. It does not protect it from someone who has the power to remove versions themselves.

Getting a version back belongs to Session 12, together with listing an object's whole history. Today you only switch versioning on, so that the history exists.

**The signed record.** When log-file integrity validation is on, CloudTrail does three things.

1. It calculates a SHA-256 {% include term.html t="hash-value" %} of every log file it delivers. This is the same kind of value that you used in Session 1.
2. Every hour it writes a {% include term.html t="digest-file" %} that lists the log files of that hour and their hash values. It signs the digest with a private key that only AWS holds, and anyone can check the signature with AWS's public key.
3. Each digest file also carries the signature of the digest before it. The digests form a chain, hour after hour.

So a changed log file no longer matches its hash value. A removed log file is missing from the place its digest says it should be. A removed digest file breaks the chain. Each is detected.

{% include demo.html id="S11-D5" %}

<div class="box metaphor" markdown="1">

**The comparison.** Log-file integrity validation is like an evidence bag with a numbered, signed seal, where each new seal also records the number of the seal before it.

**Why it fits.** The hash value of each log file is the seal: break it, and the change shows. The signature on each digest is the signer's name on the seal, which only AWS can write. The chain of digests is the numbered sequence: a missing number shows that a whole bag has gone.

**Where it breaks.** A seal proves only that the bag has not been opened since it was sealed. It says nothing about whether the right items went into the bag, or whether everything that happened was written down. Integrity validation proves that a log file is unchanged since delivery. It cannot prove that every action was recorded, and it does not cover the server access logs at all.

**So what.** Validation lets you defend the CloudTrail files in your custody record. The completeness of what was recorded is a separate question, and it is a limitation you must state.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">In a versioned bucket, a user deletes `report.txt`. What does the bucket now hold for that key?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing: the object and its versions are removed</li>
    <li data-key="b">The earlier versions, with a delete marker on top that makes the object look deleted</li>
    <li data-key="c">One copy of the latest version, hidden in a recycle bin for 30 days</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). An ordinary delete in a versioned bucket only adds a delete marker. Every version stays, each with its own version ID. (a) describes a bucket without versioning, and S3 has no recycle bin (c).</p></div>

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">Log-file integrity validation reports that every CloudTrail log file for a day is valid. What does this prove?</p>
  <ul class="qc-opts">
    <li data-key="a">That every action in the account that day was recorded</li>
    <li data-key="b">That the server access logs for that day are complete</li>
    <li data-key="c">That the CloudTrail log files have not been changed or removed since AWS delivered them</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Validation checks the files against the hash values and signatures that AWS wrote at delivery. It cannot show that nothing was left unrecorded (a), and it does not cover the server access logs at all (b).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How validation is checked, and what it relies on</summary>

The digest files are delivered to the same bucket as the log files, in a separate folder, and the signature of each digest is stored with it. AWS uses a different key pair in each Region. The AWS CLI has a command that walks the chain and checks every hash value and signature for a period of time: `aws cloudtrail validate-logs`. It checks the files in the place where CloudTrail delivered them. A copy that you move elsewhere needs its own hash values, which is why your custody record still hashes every file you collect.

Two limits matter. Digest files start about an hour after validation is switched on, so the first hour after you enable it has no digest yet. And validation trusts AWS's own keys: it proves that nobody else changed the files, not that AWS's record was right in the first place.
</details>

### Whose version of events do you trust?

<div class="box lens" markdown="1">

**Through another lens: *Inception*.** In Christopher Nolan's film *Inception* (2010), a team enters a person's dreams, and dreams inside those dreams, to plant an idea. At every level the world looks completely real, so the characters can never be sure which level they are on. The hero carries a small spinning top: in a dream it spins for ever, in the waking world it falls. It is his private test of what is real.

A cloud investigation has the same nested feel. You never touch the original. You see the provider's console, which shows the provider's view of your data. You read the provider's logs, which are the provider's account of what happened. Every layer is someone else's version of events, and each one looks completely real.

**Where it breaks.** The provider's record is not a dream. It is written as it happens, kept outside the reach of the people being recorded, and sealed with hash values and signatures that anyone can check with a public key. The spinning top is the opposite: a private test that only its owner can read. In the cloud, the test of what is real belongs to everyone, but only if it was switched on before the incident.

**The question it raises.** When you write in a report that "the file was read at 02:14 from this address", which layer are you standing on, and what lets a stranger check that it is the real one?

</div>

<div class="box key" markdown="1">

**The pivotal idea.** In the cloud you never hold the original; you trust, and must verify, the provider's record.

</div>

That sentence explains the lab. Every setting you switch on today either creates the provider's record or makes it possible to verify.

## 8. The lab: build the drop, prove it is ready, make the incident happen

Your task in one line: in your own AWS account, in the Mumbai Region, build the case bucket and its records to the specification below, verify every setting with saved evidence, take a guided look at flaws.cloud, and then run the scripted incident and stop.

You need a browser and the AWS CLI on your Kali VM. The Windows VM and REMnux stay off. Allow about two hours. **There must be at least one hour between finishing Part C and starting Part F**, so that the new settings have settled and the first digest file has been delivered; Part E fills that time.

<div class="box safety" markdown="1">

**This is a real account, with real records and a real bill. Six rules.**

1. **Only your own account, and flaws.cloud.** Never list, read or test a bucket, an account or a system that you do not own. flaws.cloud is the one exception, because its owner publishes it for this kind of exploration, and you use it read-only.
2. **Never show a secret.** The secret part of an access key, a password or an MFA code never appears in a screenshot, a file you share, a chat or a report. If a secret is ever exposed, delete that access key at once and create a new one.
3. **Mask your account ID.** In anything you show, mask all but the last four digits: `********3333`. Keep the original, unmasked files in your private folder: they are evidence, and evidence is never edited.
4. **Synthetic files only.** Nothing real goes into the account: no one's personal details and no genuine business files. The incident script makes its own invented files.
5. **Do not destroy your evidence.** Never suspend versioning, delete object versions, empty a bucket, delete the trail or stop logging until the module is over. Every one of those removes evidence that your coursework needs.
6. **Watch the cost.** Set the budget alarm first. Create only what this page asks for. If the alarm e-mails you, stop and tell the lecturer.

</div>

<div class="box lms" markdown="1">

The LMS tells you when to create your AWS account, so that its time-limited plan covers this session, the coursework and any resubmission. It also carries the coursework brief, the readiness checklist and the scripted-incident files as downloads, and the recording of this session if one is made. Use the LMS for anything about dates.

</div>

### What this costs, and why it should cost you nothing

A new AWS account starts on the **Free Plan**. It comes with US$100 of credits at sign-up, and you can earn up to US$100 more by completing short onboarding activities, one of which is setting up a cost budget. The plan ends six months after the account is opened, or earlier if the credits run out; the account then closes, and AWS keeps its contents for a limited time before deleting them. While you are on the Free Plan you are not charged, unless you choose to upgrade to a paid plan. Do not upgrade.

The only pay-per-use cost in this environment is CloudTrail data events, charged per 100,000 events. One small bucket and one short incident produce a few dozen events: a fraction of a cent, which the credits absorb. Storage of a few small files and logs costs almost nothing.

The budget alarm is set at **US$1**, not at zero. An alarm at zero would fire on the first fraction of a cent and teach you to ignore it. An alarm at US$1 fires only if something unexpected is running, and then it means something.

### Part A: the guardrail, your identities and your tools

Create a working folder on Kali first. Every file you save today goes into it.

```bash
mkdir -p ~/nb6018-cw/s11/readiness ~/nb6018-cw/s11/incident
cd ~/nb6018-cw/s11
```

You will also keep a **configuration log**: one line, in UTC, for every setting you make. Make a short helper for it and test it once:

```bash
note() { printf '%s  %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> ~/nb6018-cw/s11/config-log.txt; tail -n 1 ~/nb6018-cw/s11/config-log.txt; }
note "S11 started on Kali"
```

The helper lasts until you close the terminal. In a new terminal, paste the `note()` line again before you use it.

1. **Sign in as the root user, and secure it.** Sign in to the AWS console with the e-mail address of your new account. This is the {% include term.html t="root-user" %}: it can do everything, so you use it only for steps 1 to 3. Open the account menu at the top right, choose **Security credentials**, and under **Multi-factor authentication (MFA)** choose **Assign MFA device**. Use an authenticator app on your phone. {% include term.html t="multi-factor-authentication" text="MFA" %} means that a stolen password is not enough to take over the account.

   <div class="box expect" markdown="1">

   The MFA section lists one device. The **Access keys** section of the same page shows that the root user has **no access keys**. Leave it that way. Then, on Kali: `note "root MFA assigned"`.

   </div>

   <div class="box trouble" markdown="1">

   If AWS already asked you to set up MFA when you opened the account, it is done: check that the device is listed and move on. If the root user has an access key, delete it.

   </div>

2. **Set the budget alarm, before anything else.** On the console home page, find the **Explore AWS** panel and its list of activities that earn credits. Choose the activity **Set up a cost budget using AWS Budgets**. Create a **Monthly cost budget** from the template, with a budgeted amount of **1.00** US dollars and your e-mail address as the recipient. When it is created, open the budget, choose **Edit**, and in the budget's scope look for **Advanced options**, where the charge types are listed: **clear Credits**, so that the alarm watches what your usage would cost and not the cost after credits. Save.

   <div class="box expect" markdown="1">

   **Budgets** lists one monthly cost budget with an amount of $1.00 and alerts that send e-mail to you. The Explore AWS panel shows the budget activity as completed; the credit it earns is added to your account's credits. `note "budget alarm set at USD 1, credits excluded"`.

   </div>

   <div class="box trouble" markdown="1">

   If you cannot find the Explore AWS panel, open **Billing and Cost Management**, then **Budgets**, then **Create budget**, choose **Use a template**, then **Monthly cost budget**. If you cannot find the charge types, keep the budget as it is and tell the lecturer: with credits included, the alarm may stay silent while credits last, so you will check the bill page by hand at each session. Console screens change; the names here were checked when this page was written.

   </div>

3. **Create your working identity.** Still as the root user, open **IAM**, then **Users**, then **Create user**. Name it `nb6018-analyst`. Tick **Provide user access to the AWS Management Console**, choose **I want to create an IAM user**, and set a strong password of your own. On the permissions page choose **Attach policies directly** and tick **AdministratorAccess**. Create the user. Then open the user, choose the **Security credentials** tab, and assign an MFA device to this user too.

   An {% include term.html t="iam-user" %} is a named identity inside your account. From now on, everything you do is done as `nb6018-analyst`, so every record you create today names it. AdministratorAccess lets it do every step of this lab; in a company, staff would get much narrower permissions.

   <div class="box expect" markdown="1">

   The user `nb6018-analyst` with the policy AdministratorAccess and one MFA device. On the IAM dashboard, the **Sign-in URL for IAM users** of your account: copy it to your notes (it contains your account ID, so mask it in anything you show). Sign out of the root user. `note "IAM user nb6018-analyst created, MFA assigned; root signed out"`.

   </div>

   <div class="box trouble" markdown="1">

   If the console offers to create a user in IAM Identity Center instead, choose the option for an IAM user. If you forget the sign-in URL, sign in as the root user again only to read it, then sign out.

   </div>

4. **Sign in as `nb6018-analyst` and choose the Region.** Use the sign-in URL from step 3. At the top right of the console, open the Region menu and choose **Asia Pacific (Mumbai) ap-south-1**. Keep this Region for every step of the module.

   <div class="box expect" markdown="1">

   The top right of the console shows `nb6018-analyst` and the Region **Mumbai**. `note "signed in as nb6018-analyst; region ap-south-1"`.

   </div>

   <div class="box trouble" markdown="1">

   Some services, such as IAM and Budgets, show **Global** instead of a Region. That is normal: they are not tied to one Region. When you return to S3 or CloudTrail, check that the Region is Mumbai again.

   </div>

5. **Create one access key for the AWS CLI.** In IAM, open `nb6018-analyst`, the **Security credentials** tab, **Create access key**. Choose the use case **Command Line Interface (CLI)**, confirm, and create it. The page shows an {% include term.html t="access-key" %} ID and its secret. Keep the page open for the next step and do not copy the secret anywhere else.

   <div class="box expect" markdown="1">

   One access key, shown as **Active**. Its ID starts with `AKIA`. The secret is shown only once. `note "access key created for nb6018-analyst (ID ends ....)"`, with only the last four characters of the ID.

   </div>

   <div class="box trouble" markdown="1">

   If you close the page before step 6, the secret cannot be shown again: deactivate and delete that key, and create a new one. Never paste the secret into a document, a chat or a screenshot. If you download the `.csv` file that AWS offers, delete it after step 6.

   </div>

6. **Install and configure the AWS CLI on Kali.** The {% include term.html t="aws-cli" %} lets you type every console action as a command and save its output to a file.

   ```bash
   sudo apt update && sudo apt install -y awscli
   aws --version
   aws configure
   ```

   `aws configure` asks four questions. Paste the access key ID, then the secret, then type `ap-south-1` for the Region and `json` for the output format. Then check who the CLI is acting as:

   ```bash
   aws sts get-caller-identity > ~/nb6018-cw/s11/readiness/01-identity.json
   sed -E 's/[0-9]{8}([0-9]{4})/********\1/g' ~/nb6018-cw/s11/readiness/01-identity.json
   ```

   The second command prints a **masked copy** for your eyes; the file itself stays unmasked as evidence. Use the same `sed` command whenever you show an output to anyone.

   <div class="box expect" markdown="1">

   `aws --version` begins with `aws-cli/2.`. The masked identity shows `"Account": "********3333"` (with your own last four digits) and an `"Arn"` that ends in `user/nb6018-analyst`. The credentials now live in `~/.aws/credentials` on Kali, and nowhere else. `note "AWS CLI configured on Kali; identity checked"`.

   </div>

   <div class="box trouble" markdown="1">

   If `apt` cannot find `awscli`, update Kali first (`sudo apt full-upgrade`), or install AWS CLI version 2 from AWS's own installer as AWS's documentation describes. If `get-caller-identity` says `InvalidClientTokenId` or `SignatureDoesNotMatch`, the key or the secret was pasted wrongly: run `aws configure` again. If the ARN ends in `root`, you configured a root key: delete that key at once and repeat step 5 as `nb6018-analyst`.

   </div>

### Part B: the case bucket and its second record

{: start="7"}
7. **Choose your bucket names.** A {% include term.html t="bucket" %} name must be unique across all of AWS, in lower case, with letters, numbers and hyphens. Use three names built the same way, with your own initials and four digits of your choice:

   - the case bucket, for example `nb6018-case-ab-4821`;
   - the access-log bucket: the same name with `-access-logs` at the end;
   - the trail bucket: `nb6018-trail-ab-4821`.

   Save them on Kali so every later command uses the same names:

   ```bash
   cat > ~/nb6018-cw/s11/names.sh <<'EOF'
   export REGION=ap-south-1
   export CASE=nb6018-case-ab-4821
   export LOGS=nb6018-case-ab-4821-access-logs
   export TRAIL=nb6018-trail-ab-4821
   export TRAIL_NAME=nb6018-trail
   EOF
   nano ~/nb6018-cw/s11/names.sh
   source ~/nb6018-cw/s11/names.sh
   ```

   In `nano`, change `ab-4821` to your own initials and digits on all three lines, then save with Ctrl+O, Enter and Ctrl+X.

   <div class="box expect" markdown="1">

   `echo $CASE $LOGS $TRAIL` prints your three names. Your bucket names will appear in every record you collect, so they are not secret, but they identify your work: never reuse someone else's.

   </div>

   <div class="box trouble" markdown="1">

   If a name is taken when you create the bucket, change the four digits, update `names.sh` and run `source ~/nb6018-cw/s11/names.sh` again.

   </div>

8. **Create the case bucket, with versioning.** In the console, open **S3** (Region: Mumbai), choose **Create bucket**, and choose the bucket type **General purpose**. Enter your case bucket name. Leave **Object Ownership** as **ACLs disabled**. Leave **Block all public access** ticked. Under **Bucket Versioning**, choose **Enable**. Leave the default encryption as it is (server-side encryption with Amazon S3 managed keys). Leave **Object Lock** disabled. Choose **Create bucket**.

   <div class="box expect" markdown="1">

   The bucket appears in the list with the Region **Asia Pacific (Mumbai) ap-south-1**. On its **Properties** tab, **Bucket Versioning** shows **Enabled**. `note "case bucket created in ap-south-1 with versioning enabled and public access blocked"`.

   </div>

   <div class="box trouble" markdown="1">

   If the Region in the list is not Mumbai, you created it in the wrong Region: delete that empty bucket and create it again with Mumbai selected. If you forgot versioning, open **Properties**, **Bucket Versioning**, **Edit**, **Enable**, **Save changes**, and note the time: versioning protects only what is written after it is enabled.

   </div>

9. **Create the access-log bucket.** Create a second general purpose bucket with your access-log name, in Mumbai, with every setting left at its default: public access blocked, default encryption, no Object Lock. This bucket only receives the server access logs, so nothing else ever goes into it.

   <div class="box expect" markdown="1">

   Two buckets in Mumbai. `note "access-log bucket created in ap-south-1"`.

   </div>

   <div class="box trouble" markdown="1">

   The access-log bucket must be in the same Region and account as the case bucket, must use the default S3 encryption and must not have Object Lock. If you changed any of these, delete it while it is still empty and create it again.

   </div>

10. **Switch on server access logging for the case bucket.** Open the case bucket, the **Properties** tab, and find **Server access logging**. Choose **Edit**, then **Enable**. For the **Destination**, choose **Browse S3**, select your access-log bucket, and type the prefix `case/` after its name, so that the destination reads `s3://<your access-log bucket>/case/`. Leave **Log object key format** at the first, non-date-based option. Choose **Save changes**.

    <div class="box expect" markdown="1">

    **Server access logging** shows **Enabled** with your destination. The console has also added a statement to the access-log bucket's policy that allows the S3 logging service to write there. `note "server access logging on: case bucket to access-log bucket, prefix case/"`.

    </div>

    <div class="box trouble" markdown="1">

    If you see a warning about the destination's permissions, let the console update the bucket policy. Never choose the case bucket itself as the destination: a bucket that logs into itself creates a loop of logs about logs. AWS notes that a logging change can take up to about an hour to take full effect.

    </div>

### Part C: the audit record

{: start="11"}
11. **Create the trail.** Open **CloudTrail** (Region: Mumbai), choose **Trails**, then **Create trail**. Fill in the first page like this:

    | Setting | Choose | Why |
    |---|---|---|
    | Trail name | `nb6018-trail` | Every later command uses this name |
    | Storage location | **Create new S3 bucket**, named with your trail bucket name | A separate bucket that holds only CloudTrail's files |
    | Log file SSE-KMS encryption | **Clear** the tick (disabled) | When enabled, it creates a KMS key that is charged monthly, more than this whole lab. The log files are still encrypted at rest with S3's own keys |
    | Log file validation | **Enabled** (ticked) | Log-file integrity validation: the digest files |
    | SNS notification delivery | Not enabled | Not needed |
    | CloudWatch Logs | Not enabled | Not needed, and charged |

    Choose **Next**.

    <div class="box expect" markdown="1">

    The page moves on to **Choose log events**. Nothing has been created yet.

    </div>

    <div class="box trouble" markdown="1">

    If the console warns that a customer managed KMS key is required, check that you cleared **Log file SSE-KMS encryption**. If the trail bucket name is taken, change its digits here and in `names.sh`.

    </div>

12. **Choose the events: management events, and data events for the case bucket only.** On **Choose log events**, tick **Management events** and **Data events**. Under **Management events**, keep **API activity** with both **Read** and **Write** ticked. Under **Data events**, set:

    - **Resource type** (or data event type): **S3**;
    - **Log selector template**: **Custom**;
    - a condition with the field **resources.ARN**, the operator **starts with**, and the value `arn:aws:s3:::` followed by your case bucket name and a slash, for example `arn:aws:s3:::nb6018-case-ab-4821/`;
    - **Selector name** (optional): `case bucket objects`.

    Leave network activity events and Insights events off: they are charged and not needed. Choose **Next**, read the summary, and choose **Create trail**.

    <div class="box expect" markdown="1">

    The trail list shows `nb6018-trail` with **Multi-region trail: Yes**, **Status: Logging**, and your trail bucket. `note "trail nb6018-trail created: management read+write, S3 data events scoped to case bucket, validation on, SSE-KMS off"`.

    </div>

    <div class="box trouble" markdown="1">

    The slash at the end of the ARN matters: it limits the condition to objects inside your case bucket. Never choose a template that logs data events for **all** buckets: CloudTrail would also record its own writes to the trail bucket and the logging service's writes to the access-log bucket, and the volume and the cost would grow. If your console shows **basic event selectors** instead, with **Read** and **Write** boxes for **All current and future S3 buckets**, clear both of those boxes and add your case bucket under **Individual bucket selection** with **Read** and **Write** ticked. If the data-event screen is different from this page, finish creating the trail with management events only, then set the selectors from Kali with the command in the box below step 13.

    </div>

13. **Wait five minutes, then confirm that CloudTrail is delivering.** On Kali:

    ```bash
    source ~/nb6018-cw/s11/names.sh
    aws s3 ls "s3://$TRAIL/" --recursive | head -n 5
    ```

    <div class="box expect" markdown="1">

    One or more paths that begin `AWSLogs/`, then your account ID, then `/CloudTrail/` and a Region, ending in `.json.gz`. These are the first log files: CloudTrail recorded your own setup. Do not download them: collection is Session 12's work. `note "first CloudTrail log files seen in trail bucket"`.

    </div>

    <div class="box trouble" markdown="1">

    If the list is empty after ten minutes, open the trail in the console and check that **Logging** is on. If the command says `AccessDenied`, check that `names.sh` has the right trail bucket name.

    </div>

<details class="deeper" markdown="1">
<summary>Setting the event selectors from the command line</summary>

If the console's data-event screen does not match step 12, or the check in Part D shows the wrong selectors, set them from Kali. This command **replaces** all the trail's selectors, so the file must contain both the management events and the data events:

```bash
source ~/nb6018-cw/s11/names.sh
cat > ~/nb6018-cw/s11/selectors.json <<EOF
[
  { "Name": "Management events",
    "FieldSelectors": [ { "Field": "eventCategory", "Equals": ["Management"] } ] },
  { "Name": "case bucket objects",
    "FieldSelectors": [
      { "Field": "eventCategory",  "Equals": ["Data"] },
      { "Field": "resources.type", "Equals": ["AWS::S3::Object"] },
      { "Field": "resources.ARN",  "StartsWith": ["arn:aws:s3:::$CASE/"] } ] }
]
EOF
aws cloudtrail put-event-selectors --trail-name "$TRAIL_NAME" --advanced-event-selectors file://$HOME/nb6018-cw/s11/selectors.json
note "event selectors set from the CLI"
```

The output repeats the selectors back. Then run check 9 of Part D again.
</details>

### Part D: verify every setting, and save the proof

Settings are claims until you can show them. In this part you ask AWS, from Kali, for each setting, and you save each answer to a file. These files are your proof that the environment was ready before the incident. Do not edit them; when you show one, show a masked copy.

{: start="14"}
14. **Run the checks.** Copy the whole block into the Kali terminal:

    ```bash
    source ~/nb6018-cw/s11/names.sh
    cd ~/nb6018-cw/s11/readiness
    aws s3api get-bucket-location     --bucket "$CASE"  > 02-case-location.json
    aws s3api get-bucket-versioning   --bucket "$CASE"  > 03-case-versioning.json
    aws s3api get-public-access-block --bucket "$CASE"  > 04-case-public-access.json
    aws s3api get-bucket-logging      --bucket "$CASE"  > 05-case-access-logging.json
    aws s3api get-bucket-logging      --bucket "$LOGS"  > 06-logs-bucket-own-logging.json
    aws s3api get-bucket-policy       --bucket "$LOGS"  --query Policy --output text > 07-logs-bucket-policy.json
    aws cloudtrail describe-trails    --trail-name-list "$TRAIL_NAME" > 08-trail.json
    aws cloudtrail get-event-selectors --trail-name "$TRAIL_NAME"     > 09-event-selectors.json
    aws cloudtrail get-trail-status   --name "$TRAIL_NAME"            > 10-trail-status.json
    aws s3api get-public-access-block --bucket "$TRAIL" > 11-trail-bucket-public-access.json
    aws s3api get-bucket-policy       --bucket "$TRAIL" --query Policy --output text > 12-trail-bucket-policy.json
    ls -l
    note "readiness checks saved to readiness/02 to 12"
    ```

    <div class="box expect" markdown="1">

    Twelve files, `01` to `12`, all with some content except possibly `06`, which may be empty or hold only `{}`. That empty answer is the right one: the access-log bucket must not log itself.

    </div>

    <div class="box trouble" markdown="1">

    If a command prints an error instead of saving a file, read the error: `NoSuchBucket` means a name in `names.sh` is wrong; `TrailNotFoundException` means the trail name or the Region is wrong; `NoSuchBucketPolicy` means that the bucket has no policy, which for `07` or `12` means that step 10 or step 11 did not finish.

    </div>

15. **Read each answer against the readiness checklist.** Open each file with `cat` (or `sed` with the mask for anything you will show) and tick the checklist below. Every item must be true before Part F.

**The readiness checklist.** This is today's checkpoint.

| # | Item | Proof | What it must show |
|---|---|---|---|
| 1 | The root user has MFA and no access keys; you work as `nb6018-analyst` | Console, and `01-identity.json` | One MFA device on the root user; the identity's ARN ends in `user/nb6018-analyst` |
| 2 | A US$1 monthly cost budget with an e-mail alert, credits excluded | Budgets page in the console | Amount $1.00; your e-mail address as recipient |
| 3 | The case bucket is in Mumbai | `02` | `"LocationConstraint": "ap-south-1"` |
| 4 | Versioning is on | `03` | `"Status": "Enabled"` |
| 5 | Public access is blocked on the case bucket | `04` | All four settings `true` |
| 6 | Server access logging goes to the separate access-log bucket | `05` | `"TargetBucket"` is your access-log bucket and `"TargetPrefix": "case/"` |
| 7 | The access-log bucket does not log itself, and only the logging service may write to it | `06`, `07` | `06` empty or `{}`; `07` allows `logging.s3.amazonaws.com` to put objects |
| 8 | The trail covers all Regions, with log-file integrity validation | `08` | `"IsMultiRegionTrail": true`, `"LogFileValidationEnabled": true`, `"HomeRegion": "ap-south-1"`, your trail bucket |
| 9 | Management events and data events for the case bucket only | `09` | One selector with `eventCategory` equal to `Management`; one with `Data`, `AWS::S3::Object` and `resources.ARN` starting with `arn:aws:s3:::` and your case bucket name and a slash |
| 10 | The trail is logging | `10` | `"IsLogging": true` |
| 11 | The trail bucket is closed to the public and written only by CloudTrail | `11`, `12` | All four public-access settings `true`; the policy names only `cloudtrail.amazonaws.com` as the service allowed to write |
| 12 | CloudTrail is delivering, and digest files have started | `aws s3 ls "s3://$TRAIL/" --recursive` | Log files under `CloudTrail/`, and, one hour or more after Part C, files under `CloudTrail-Digest/` |
| 13 | Your secrets are safe and your log is complete | Your own check | The access key secret exists only in `~/.aws/credentials`; `config-log.txt` has a UTC line for every step |

The checkpoint is judged by you, against this table: every row true, and the incident in Part F run to the end. It is formative and is not marked here, but it is the foundation of your coursework, and an item that is false today cannot be put right later for today's evidence.

### Part E: flaws.cloud, while the settings settle

**flaws.cloud** is a set of challenges built by Scott Piper on purpose, to teach the mistakes people make in AWS. Everything runs in one AWS account that he owns, and each level teaches one mistake. You use it read-only, to see what a misconfigured bucket exposes, before you look at your own. You do levels 1 and 2 only.

{: start="16"}
16. **Level 1: a bucket that anyone can list.** Open `http://flaws.cloud` in your browser and read the introduction. The site itself is served from an S3 bucket named after the site, in the Region `us-west-2`. On Kali, ask S3 for that bucket's list of objects without signing in at all:

    ```bash
    aws s3 ls s3://flaws.cloud/ --no-sign-request --region us-west-2
    ```

    <div class="box expect" markdown="1">

    A list of the site's files, with dates and sizes, including one file whose name starts with `secret`. `--no-sign-request` means that the request carried no identity at all: S3 gave the list to an anonymous stranger. Open that file in your browser by adding its name after `http://flaws.cloud/`. It congratulates you and gives the address of level 2.

    </div>

    <div class="box trouble" markdown="1">

    If the command says `AccessDenied` or cannot connect, open the site and follow its own hints for level 1 in the browser instead. If the site does not answer at all, skip to Part F when your hour has passed, and do Part E later.

    </div>

    Answer for yourself before you move on: what did the owner expose, and to whom? Which setting in your own build stops this from happening to your case bucket? If you were the owner, which of the records that you switched on today would show your anonymous request?

17. **Level 2: a bucket that any AWS account can list.** Read the level 2 page. The mistake is similar, but this time the bucket refuses anonymous requests and accepts a request from **any** signed-in AWS identity, in any account in the world. Your `nb6018-analyst` key is such an identity. List the level 2 bucket with your own credentials (no `--no-sign-request` this time), using the bucket name that is the level 2 address without `http://`:

    ```bash
    aws s3 ls s3://<the level 2 address, without http://>/ --region us-west-2
    ```

    <div class="box expect" markdown="1">

    A list that includes a second `secret` file, which leads to level 3. This time your request was signed with your own access key, so the owner's records, if switched on, would name an identity in your account.

    </div>

    <div class="box trouble" markdown="1">

    If it says `AccessDenied`, check that you removed `--no-sign-request` and that `aws sts get-caller-identity` still works.

    </div>

    **Stop at the end of level 2.** From level 3 on, the challenges ask you to use credentials that the site leaves lying around. Using credentials you found is outside this module, even where a site invites it. Note one sentence for each level: the mistake, what it exposed, and the setting that would have prevented it.

### Part F: the scripted incident, then stop

Check the time. Start Part F only when **at least one hour** has passed since step 12, and when every row of the checklist is true. The incident has two halves: actions from your Kali VM, on your own network, and then actions from {% include term.html t="cloudshell" %}, which runs on AWS's own computers and so reaches S3 from a different network address. That second address is the "unfamiliar network location" of the incident.

The script creates three invented files, uploads them, and changes each one twice, waiting a minute between actions. It records every command it runs, with the time in UTC, in `incident-log.txt`. Download `s11-incident.sh` from the LMS into `~/nb6018-cw/s11/incident/`, or copy it from the box below.

{: start="18"}
18. **Read the script, then run part 1 from Kali.**

    ```bash
    #!/usr/bin/env bash
    # NB6018CEM Session 11: scripted incident, part 1 (Kali).
    # Uploads three synthetic files to the case bucket and changes each one twice.
    # Every command is written to incident-log.txt with its time in UTC.
    set -euo pipefail
    source "$HOME/nb6018-cw/s11/names.sh"
    W="$HOME/nb6018-cw/s11/incident"
    mkdir -p "$W/files"
    cd "$W"
    LOG="$W/incident-log.txt"
    GAP="${GAP:-60}"

    stamp() { printf '%s  %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"; }
    run()   { stamp "RUN $*"; "$@" 2>&1 | tee -a "$LOG"; }

    make_file() {   # make_file <name> <version>
      {
        echo "SYNTHETIC TEACHING FILE - NB6018CEM - contains no real data"
        echo "file: $1   version: $2"
        echo "written on Kali at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
        for i in $(seq 1 $((10 * $2))); do echo "line $i of version $2: $(head -c 12 /dev/urandom | base64)"; done
      } > "files/$2-$1"
    }

    stamp "START part 1 on Kali; region $REGION; case bucket $CASE"
    stamp "Kali public address: $(curl -s https://checkip.amazonaws.com)"
    for v in 1 2 3; do
      for f in client-list.csv design-notes.txt pricing-plan.txt; do
        make_file "$f" "$v"
        run aws s3 cp "files/$v-$f" "s3://$CASE/staging/$f" --region "$REGION" --no-progress
        sleep "$GAP"
      done
    done
    stamp "END part 1. Next: part 2 in CloudShell, region $REGION."
    ```

    Run it:

    ```bash
    cd ~/nb6018-cw/s11/incident
    bash s11-incident.sh
    ```

    <div class="box expect" markdown="1">

    About ten minutes of output: a start line with your Kali public address, then nine `upload:` lines, three for each file, each after a `RUN aws s3 cp ...` line with its UTC time, and an end line. The folder `files/` holds the nine local versions, `1-` to `3-` for each file. Keep them: they are your own copy of what you uploaded. Do not open the case bucket in the console to look: every look is a request, and the records you switched on would record it as part of the incident.

    </div>

    <div class="box trouble" markdown="1">

    If a line says `AccessDenied`, the CLI is not acting as `nb6018-analyst`: run `aws sts get-caller-identity`. If the script stops halfway, do not start it again from the beginning: write down the last successful line, and ask the lecturer how to finish without changing the plan of the incident. If you must leave, you can run the script with a shorter wait, `GAP=20 bash s11-incident.sh`, but never shorter than 20 seconds.

    </div>

19. **Run part 2 from CloudShell.** In the AWS console, signed in as `nb6018-analyst` with the Region **Mumbai**, open **CloudShell** from the icon at the top of the console. It opens a terminal in your browser, already signed in as you. Paste this block, after changing the `CASE` line to your own case bucket name:

    ```bash
    export CASE=nb6018-case-ab-4821
    LOG=~/part2-log.txt
    stamp() { printf '%s  %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"; }
    run()   { stamp "RUN $*"; "$@" 2>&1 | tee -a "$LOG"; }
    stamp "START part 2 in CloudShell; case bucket $CASE"
    stamp "CloudShell public address: $(curl -s https://checkip.amazonaws.com)"
    run aws s3 ls "s3://$CASE/staging/"
    mkdir -p ~/downloaded
    run aws s3 cp "s3://$CASE/staging/" ~/downloaded/ --recursive --no-progress
    sleep 60
    run aws s3 rm "s3://$CASE/staging/pricing-plan.txt"
    stamp "END part 2"
    ```

    <div class="box expect" markdown="1">

    A start line with a public address that differs from your Kali address, the list of three objects, three `download:` lines, and, a minute later, one `delete:` line for `pricing-plan.txt`. As section 7 explained, the bucket now holds the three versions of `pricing-plan.txt` under a delete marker. Session 12 shows you that history; today, do not look.

    </div>

    <div class="box trouble" markdown="1">

    If CloudShell will not open, check that the Region is Mumbai, and wait a minute: the first start takes longer. If `aws s3 rm` says `AccessDenied`, you are not signed in to the console as `nb6018-analyst`. Never type your access key into CloudShell: it is already signed in as the identity you used to open the console.

    </div>

20. **Bring the part 2 log home, and stop.** In CloudShell choose **Actions**, then **Download file**, and enter `/home/cloudshell-user/part2-log.txt`. Move the downloaded file into `~/nb6018-cw/s11/incident/` on Kali. Then write the last lines of your configuration log:

    ```bash
    note "scripted incident part 1 (Kali) and part 2 (CloudShell) complete; logs in incident/"
    note "STOP: no further requests to the case bucket until Session 12"
    ```

    <div class="box expect" markdown="1">

    `~/nb6018-cw/s11/incident/` holds `incident-log.txt`, `part2-log.txt` and the folder `files/`; `~/nb6018-cw/s11/readiness/` holds files `01` to `12`; `config-log.txt` has a UTC line for every step of the day.

    </div>

    <div class="box trouble" markdown="1">

    If the download offers a different folder, move the file afterwards; keep its name. If you cannot download it, copy its text from CloudShell into a file of the same name on Kali, and note that you did so.

    </div>

**Now stop.** Do not open, list, download or change anything in the case bucket until Session 12. Every request you make is recorded by the very records you switched on, and would become part of the evidence. Leave the logs to arrive. Session 12 opens by checking what has landed overnight.

### If you have time

**Write one line of justification for each setting.** For every row of the readiness checklist, write one sentence that begins "Without this, I could not show ...". If you cannot finish a sentence, reread the section that introduced the setting.

**Find your own setup in Event history.** In the CloudTrail console, open **Event history** and filter by **Event name** = `CreateBucket`. You should see your own bucket creations, recorded even before your trail existed. Which part of today does that confirm, and which actions of Part F will you never find there?

## If you missed Session 11

This session builds the environment that your coursework is about, so you cannot skip it. Everything you need is on this page, and you can do it alone. Work through these in order:

1. **Read sections 1 to 7 and run the five demos.** Allow about 75 minutes. Answer every quick check before you open the answer.
2. **Create your AWS account** at the time the LMS gives, if you have not already.
3. **Do Parts A to D in one sitting** (about 75 minutes), keeping the configuration log from the first step.
4. **Do Part E**, flaws.cloud levels 1 and 2, while the settings settle.
5. **Run Part F at least one hour after Part C**, and as early as you can before Session 12: the evening before is the latest that still gives the slow logs a night to arrive.
6. **Tick every row of the readiness checklist** and keep the files.
7. **If you are blocked**, write to the lecturer through the LMS with the step number and the exact error message, masked. Do not work around a step you do not understand: a wrong setting today becomes a gap in your evidence.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. Explain why the shared-responsibility model matters to an investigator, and not only to a security engineer.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The line between the provider's and the customer's responsibilities also decides where evidence can exist and who must create it. Below the line the investigator can never collect evidence directly, and above it the evidence exists only if the customer switched the records on before the incident. The points that earn marks: (1) the line marks what evidence can be reached; (2) below it, only the provider holds it; (3) above it, the customer must have created it.
</details>

**2. Compare the evidence a company can collect itself from a virtual server it rents (IaaS) with what it can collect from an online mail service (SaaS).**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
On IaaS the company controls the operating system, so it can take a snapshot of the virtual disk, capture memory from inside the server and keep the system's own logs. On SaaS it controls only its data and users, so it gets an export of its data and whatever audit log the vendor offers, for as long as the vendor keeps it. The points that earn marks: (1) IaaS evidence from the operating system up; (2) SaaS evidence limited to data and the vendor's logs; (3) the principle: less control, less evidence.
</details>

**3. Explain why multi-tenancy stops an investigator from imaging the disk that held a suspect's cloud files.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
In multi-tenancy many customers share the same physical disks, so any disk that held the suspect's files also holds other customers' data, which the investigator has no right to see. The files may also be spread over many disks and copied to several buildings, so there is no single disk that belongs to the suspect. The points that earn marks: (1) shared physical hardware; (2) other customers' data and privacy; (3) the data is spread, so there is no one disk to image.
</details>

**4. A company switches on CloudTrail data events the morning after it discovers a leak. What can it learn about the leak from them, and why?**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Nothing about the leak itself, because data events are recorded only from the moment they are switched on, and no record can be created afterwards for the past. They help only from that morning on, for example to see whether the attacker comes back. The points that earn marks: (1) nothing about the past; (2) records run forward only; (3) a correct use from now on, such as watching for a return.
</details>

**5. Explain why the scripted incident is run at the close of Session 11 and not at the start of Session 12.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
CloudTrail delivers its files within minutes, but S3 server access logs are delivered on a best-effort basis, usually within a few hours. Running the incident the evening before gives the slow record time to arrive, so the collection in Session 12 holds both records rather than one complete record and one partial one. The points that earn marks: (1) CloudTrail is quick; (2) server access logs can take hours; (3) collecting too soon gives gaps created by timing, not by the incident.
</details>

**6. State what log-file integrity validation proves about CloudTrail logs, and one thing it cannot prove.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
It proves that a CloudTrail log file has not been changed or removed since AWS delivered it, because each file's hash value is listed in a signed hourly digest file and the digests are chained. It cannot prove that every action was recorded in the first place, and it says nothing about the server access logs. The points that earn marks: (1) unchanged since delivery; (2) the mechanism: hash values in signed, chained digests; (3) one correct limit.
</details>

## Coming next

Tonight, the slow record catches up. Session 12 opens by checking which logs have landed and when, so you see the two clocks of section 6 in your own account. Then you collect: the CloudTrail logs and the server access logs, each file hashed on arrival and entered in a custody record, the metadata of every version of every object, and the deleted file brought back from its versions. Session 12 also closes Day 6 with its end-of-day quiz.
