---
session_code: S14
description: "The suspect's email and web traces: where Internet activity leaves evidence, the email header read as evidence, which header lines a sender can forge, deleted messages inside a mail store, browser history, downloads, searches, cookies and cache, the server's side of a visit, attribution when the network is not yours, and how ordinary artefacts become evidence through pattern, sequence and context."
hook: >-
  The suspect wrote to his contact, searched the web and used a cloud drive, all from his own computer.
  Today the unit reads those traces: who wrote to whom, when, through which account,
  and how far each trace reaches towards a person.
outcomes:
  - "Identify where Internet activity leaves evidence: on the computer, with the provider and on the network, and which of them an examiner can reach directly"
  - "Explain the parts of an email header, and read a chain of Received lines from the bottom up, with every time normalised to UTC"
  - "Compare the header lines that a sender controls with the lines that receiving servers add, and identify a forged line"
  - "Explain how a deleted message survives inside a mail store, and apply tools that see different states of deletion"
  - "Identify browser history, downloads, searches, cookies and cache in the browsers the suspect used, and explain what private browsing and cleaning tools leave behind"
  - "Compare a web server's record of a visit with the visitor's browser record of the same visit"
  - "Justify how far an address or an account can be attributed to a person, and state what each step needs"
  - "Construct a communications timeline in UTC and an attribution note for one message"
before:
  - "Open the [prepared Autopsy case](../s02/#7-the-lab-triage-the-suspects-disk-and-recover-the-documents) of the suspect's computer (Session 2)"
  - "Explain what a [feature](../s03/#5-features-instead-of-files-bulk_extractor) is, such as an email address found in raw bytes (Session 3)"
  - "Name the [cleaning tools the suspect used](../s04/#7-hiding-leaves-its-own-trace) and the traces they left (Session 4)"
  - "Normalise every source to [UTC](../s05/#8-one-clock-normalise-every-source-to-utc) with the case's time zone offset, and write a timeline in the unit's seven columns (Session 5)"
  - "Explain why [an address is a device at a time, not a person](../s07/#8-attribution-an-address-is-a-device-at-a-time-not-a-person) (Session 7)"
  - "Join [two records of one event](../s13/#4-one-key-across-two-records), and say [what an identity and an address can show](../s13/#7-who-and-where-identity-and-network) (Session 13)"
demos:
  - id: S14-D1
    title: "Reading the Received chain"
    file: s14-d1-received-chain.html
    teaches: "Each mail server adds its Received line on top of the ones before it, so the chain is read from the bottom up, hop by hop, with every server's time normalised to UTC."
  - id: S14-D2
    title: "Who wrote this line?"
    file: s14-d2-who-wrote-this-line.html
    teaches: "Some header lines are written by the sender's program and can say anything, others are added by receiving servers, so a forged From line is caught by the lines the sender could not write."
  - id: S14-D3
    title: "A deleted message inside the store"
    file: s14-d3-deleted-message-store.html
    teaches: "A message passes through states of deletion inside a mail store, and each tool sees only some of them: a folder, the free space inside the file, or nothing."
  - id: S14-D4
    title: "One visit, two records"
    file: s14-d4-one-visit-two-records.html
    teaches: "A browser and a web server each record the same visit with different fields, and a page shown from the cache appears in one record and not in the other."
  - id: S14-D5
    title: "The attribution ladder"
    file: s14-d5-attribution-ladder.html
    teaches: "Each step from a message to a person needs its own evidence, so when one source is missing, the step it supported loses its support and the report must say where the chain breaks."
slides: s14-internet-forensics.pptx
evidence: "the prepared Autopsy case of the suspect's computer from folder S02 on the lab share, the same case as Session 2, and the two forms in folder S14 on the lab share"
---

Session 13 closed the cloud drop. Today the unit comes back to the suspect's own computer, with one question it has left open since Session 5: how did he talk to his contact, and what did he look at while he did it?

**Today is the insider case only.** You read the suspect's mail store, his two browsers and the log of his cloud program, and you write the communications into a timeline. A second, separate engagement belongs to this session as well; section 10 says where it stands.

**Every trace today was made by ordinary software.** Email, web searches and cloud drives are part of everyone's working day. Nothing you find is suspicious by itself. Section 9 shows how the reading comes from the pattern, not from any one record.

## 1. Three places where Internet activity leaves evidence

### The idea

When a person sends an email or opens a web page, the activity does not happen in one place. It happens on their own computer, on the computers of the companies that provide the service, and on the network in between. Each of the three keeps its own records, and each is reached in a different way.

Here is the suspect's case. On Monday 23 March 2015 he received a message from his contact, searched the web, installed a cloud program and sent his contact two links. His computer kept copies of all of this. The mail server kept its own copy of every message. Google kept records of his cloud account. Nobody was capturing the network.

### How it works

| Where | What it holds | How the examiner reaches it |
|---|---|---|
| **The person's computer** | The mail program's file of messages, the browsers' databases, cached copies of pages, downloaded files, the logs of cloud and chat programs | From the forensic image, once the device has been lawfully seized |
| **The provider** | The server's copy of each mailbox, sign-in records with addresses and times, the content of cloud accounts, account details | If the server belongs to the client, by asking the client. If it belongs to an outside company, only through {% include term.html t="legal-process" %}, often in another country |
| **The network** | Packets and flow records | Only if someone was capturing at the time, as in Session 7 |

The middle row is the one students forget. A provider's records are often the best evidence of all: they record what reached the provider, with the provider's clock and the address the provider saw. But you cannot simply ask for them. A company such as Google hands over account records only when a court order or a similar legal request obliges it to, under the law of its own country. Session 11 called this problem {% include term.html t="jurisdiction" %}. In a real case, the request goes out early, because providers keep many records for a limited time only.

**Other kinds of Internet activity follow the same map.** A chat program keeps its messages in a database on the computer, and its provider may keep a copy on its servers, unless the messages are encrypted from end to end, in which case the provider holds little or no content. {% include term.html t="peer-to-peer" %} file sharing has no central server at all: its traces are the program's settings, its logs and its folder of shared files on the computer, and copies on other people's computers. Messages on a phone belong to Sessions 15 and 16.

**What the suspect's computer holds.** The documentation of the case, its answer key, lists these programs for Internet activity:

| Program | Its records on the computer |
|---|---|
| Microsoft Outlook 2013 | One mail file for the account `iaman.informant@nist.gov` |
| Internet Explorer 11 | The database `WebCacheV01.dat` |
| Google Chrome 41 | The database `History`, and files for cookies and cache |
| Google Drive, the program for Windows | A text log, `sync_log.log`, and two small databases that it deleted when it signed out |
| Apple iCloud | The installer in the user's `Downloads` folder, and records that the program ran; it was uninstalled on the last day |

The exact versions, which you record in a report, are Internet Explorer 11.0.9600.17691, Chrome 41.0.2272.101 and Google Drive 1.20.8672.3137.

The answer key shows no webmail, no chat program and no peer-to-peer program on this computer. So today's evidence comes from the first row of the table above, the computer, and the page says what the other two rows would add.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">The suspect signed in to Google Drive with a personal Gmail account. The unit wants the addresses from which that account signed in during March 2015. Where are they, and how are they reached?</p>
  <ul class="qc-opts">
    <li data-key="a">On the suspect's computer, in the browser history, which Autopsy shows directly</li>
    <li data-key="b">With Google, as the account's sign-in records, reached only through legal process</li>
    <li data-key="c">With the client company, which owns the computer and can ask Google for them</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Sign-in records belong to the provider. The computer can show that the account was used on this computer, but not every address the account used (a). The client owns the computer, not the Gmail account, so it has no right to Google's records about it (c).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Preservation requests, and what providers usually keep</summary>

Because legal process takes time, many countries let investigators send a **preservation request** first: the provider freezes the account's records for a period while the formal order is prepared. The order then asks for what was preserved. Session 17 returns to the legal side.

What a provider can hand over differs by service and by country. Typical categories are the details the user gave when the account was made, sign-in records with addresses and times, and stored content such as messages and files. The last category usually needs the strongest legal order. A provider can only hand over what it kept, and many records are kept for months, not years.

The same three-place map applies to the client's own mail server, with one difference: the client owns it, so the unit can ask for its logs directly, as part of the engagement.
</details>

<div class="box key" markdown="1">

Internet activity leaves evidence in three places: the computer, the provider and the network. The examiner reaches the computer from the image, the network only if someone captured it, and an outside provider only through legal process.

</div>

## 2. An email message and its header

### The idea

An email message has two parts: the header and the body. The body is the text the person wrote, and any attachments. The {% include term.html t="email-header" %} is the set of lines at the top of the message, each a name and a value, that records who sent it, to whom, when, and which servers carried it.

You have met the word "header" twice already in this module, each time with a different meaning. Keep the three apart.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The header shows it is a PDF." | "The file signature in its first bytes shows it is a PDF." | In Session 3 a header was the first bytes of a file. |
| "The packet header shows the sender." | "The IP layer's packet header shows the source address." | In Session 7 each layer of a packet adds its own packet header. |
| "The header shows the route of the email." | "The email header's Received lines show the route of the email." | An email header is a set of named lines at the top of a message. |

</div>

Here is a short message from an invented company, as it arrives at the receiver. The header ends at the first empty line; the body follows.

```
Received: from relay.example.org (relay.example.org [192.0.2.40])
        by mx.example.com with ESMTPS id 4F2A1B; Tue, 3 Mar 2026 09:14:07 +0000
From: Ravi Perera <ravi@example.org>
To: Asha Silva <asha@example.com>
Subject: Draft budget
Date: Tue, 3 Mar 2026 14:43:58 +0530
Message-ID: <a1c9f2e7.4410@laptop.example.org>
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

Asha, the draft is ready for you to check.
```

### How it works

**Each line is a name, a colon and a value.** A long value continues on the next line, which then starts with a space. The names are standard: `From`, `To`, `Subject`, `Date`, `Message-ID`, `Received` and others. A program may add lines of its own whose names start with `X-`.

**Two programs write the header.** The sender's email program writes the lines about the message: `From`, `To`, `Subject`, `Date` and usually `Message-ID`. Then every mail server that receives the message adds lines about its delivery, always at the top, above the lines already there. A {% include term.html t="mail-server" %} is a computer that receives email for its users and passes messages on to other mail servers. Section 4 is about this difference, because it decides which lines a sender can make up.

**Attachments travel inside the body.** The `Content-Type` line says how the body is built. A message with an attachment is split into parts, each with its own small header, and the file is carried as text. That is why an email client, or a forensic tool, can list the attachment's name, its type and its size.

**There is a second set of addresses that the reader never sees.** When one mail server hands a message to the next, it first says who the message is from and who it is for, in two commands of its own. These delivery addresses are the envelope of the message. Usually they agree with `From` and `To`. They do not have to: a copy sent as `Bcc` is delivered to an address that appears in no `To` line at all.

**Where a mail program keeps the header.** A mail program does not keep each message as a text file. It stores each message as a set of values: the sender, the subject, the time sent, the time received, the body and so on. For messages that arrived from outside, it may also keep the original header text as one more value. For a message the user wrote, the copy in Sent Items was saved by the user's own program. It never travelled through a server before it was saved, so it carries no `Received` lines.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An examiner opens a message from the suspect's Sent Items folder and finds no Received lines in it. What is the best reading?</p>
  <ul class="qc-opts">
    <li data-key="a">The message was never sent, because no server received it</li>
    <li data-key="b">The suspect removed the Received lines to hide the route</li>
    <li data-key="c">The copy in Sent Items was saved by his own program, so no server ever added lines to it; the route is in the receiver's copy</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). Received lines are added by servers on the way, and they appear in the copy that arrives. The sender's own copy cannot show them. Whether the message was sent (a) is shown by other records, such as the receiver's copy or a reply. Nothing suggests editing (b).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The standards behind the email format</summary>

The format of a message is set by RFC 5322, from the IETF, the body that publishes the internet's standards. MIME, the way attachments and other character sets are carried, is set by RFC 2045 and the documents that follow it. The conversation between mail servers, SMTP, is set by RFC 5321, which also defines the envelope: the `MAIL FROM` and `RCPT TO` commands. RFC 5321 says that each server adds a `Received` line at the top of the header and must not change the lines already there.

The standard allows header lines in any order, but servers add theirs at the top, which is why the order of the `Received` lines carries meaning.
</details>

<div class="box key" markdown="1">

An email header is the set of named lines above the body. The sender's program writes the lines about the message; each server on the way adds lines about its delivery at the top.

</div>

## 3. Reading the header as evidence

### The idea

The header is the most useful part of an email for an examiner. It records a route, a set of clocks, and the names and addresses that each server saw. Five parts of it carry most of the evidence: the `Received` lines, `Message-ID`, `Date`, `From` against `Return-Path`, and the results of the receiving server's checks.

Here is the full header of the invented message from section 2, as the receiver's server stored it. It went through three servers.

```
Return-Path: <ravi@example.org>
Authentication-Results: mx.example.com; spf=pass smtp.mailfrom=example.org;
        dkim=pass header.d=example.org; dmarc=pass header.from=example.org
Received: from mail.example.org (mail.example.org [198.51.100.25])
        by mx.example.com with ESMTPS id 4F2A1B; Tue, 3 Mar 2026 09:14:07 +0000
Received: from relay.example.org (relay.example.org [192.0.2.40])
        by mail.example.org with ESMTP id 77C1; Tue, 3 Mar 2026 10:14:05 +0100
Received: from laptop (unknown [203.0.113.57])
        by relay.example.org with ESMTPSA id a9F3; Tue, 3 Mar 2026 14:44:02 +0530
From: Ravi Perera <ravi@example.org>
To: Asha Silva <asha@example.com>
Subject: Draft budget
Date: Tue, 3 Mar 2026 14:43:58 +0530
Message-ID: <a1c9f2e7.4410@laptop.example.org>
```

### How it works

**The Received lines, from the bottom up.** A {% include term.html t="received-header" %} is a line that a mail server adds at the top of the message when it receives it. So the newest line is at the top, and the first server's line is at the bottom. Read them from the bottom up, and you follow the message in the order it travelled.

Each line has the same three parts:

| Part | In the bottom line above | What it says |
|---|---|---|
| `from` | `laptop (unknown [203.0.113.57])` | The machine that handed the message over. The first word is the name that machine gave for itself, which is its own claim. The address in square brackets is the address the receiving server saw. |
| `by` | `relay.example.org` | The server that wrote this line |
| After the `;` | `Tue, 3 Mar 2026 14:44:02 +0530` | The time on that server's clock, with its {% include term.html t="time-zone-offset" %} |

The `by` of one line should be the `from` of the line above it: `relay.example.org` hands to `mail.example.org`, which hands to `mx.example.com`. If the chain breaks, something needs an explanation.

**Every hop has its own clock and its own offset.** Normalise each one to UTC, exactly as in Session 5:

| Hop, from the bottom | Time as written | UTC |
|---|---|---|
| The sender's program (`Date` line) | `14:43:58 +0530` | 09:13:58 |
| `relay.example.org` | `14:44:02 +0530` | 09:14:02 |
| `mail.example.org` | `10:14:05 +0100` | 09:14:05 |
| `mx.example.com` | `09:14:07 +0000` | 09:14:07 |

In UTC the hops follow each other within seconds. That is what an honest chain looks like. A hop that seems to happen before the hop below it points to a wrong clock on one of the servers, or to a line that was made up.

{% include demo.html id="S14-D1" %}

**The Date line tests the sender's clock.** `Date` is written by the sender's program, by the clock of the sender's computer. The first server's line is written a moment later, by the server's clock. If the two differ by minutes, the sender's computer clock was wrong. This is the check that Session 5 promised: servers' clocks, which the suspect could not touch, test the clock of his computer.

**Message-ID.** The {% include term.html t="message-id" %} is a unique label that the sending program, or the first server, gives the message. It stays the same in every copy: in the sender's Sent Items, in the receiver's Inbox, and in a reply's `In-Reply-To` line. So it works like Session 13's request ID: it is a join key between mailboxes. The sender's program chooses it, so it can be copied or made up, but that is rare and easy to spot when two different messages share one.

**From against Return-Path.** `From` is the author that the reader sees. The {% include term.html t="return-path" %} is the line that the last receiving server adds to record the envelope's sender address, where failure notices are sent. In ordinary mail the two usually name the same domain. When they differ, it is a reason to look, not yet a finding: mailing lists and bulk mail services often send with their own address in the envelope.

**The receiving server's checks.** Many receiving servers test whether a message really came from the domain it names, and write the results into an `Authentication-Results` line. These checks are {% include term.html t="email-authentication" %}:

| Check | The question it asks |
|---|---|
| SPF | Is the server that delivered the message allowed to send mail for the envelope sender's domain? |
| DKIM | Does the message carry a valid digital signature from a domain, made when it was sent? |
| DMARC | Does the domain in `From` match a domain that passed SPF or DKIM, and what does that domain ask receivers to do if not? |

The line records what the receiving server found, at that moment. A pass is good evidence that the message came through the named domain's own mail system. It says nothing about which person used that system.

<div class="box metaphor" markdown="1">

**The comparison.** The Received lines are like the tracking history of a parcel. Each depot that handles the parcel adds a scan to the top of the list, with its place and its time.

**Why it fits.** You read the history from the bottom, the first scan, to the top, the delivery. Each scan is written by the depot that held the parcel, with that depot's clock, so the history shows the route and the time of each stage. A depot that seems to scan the parcel before the depot below it is a sign that something is wrong.

**Where it breaks.** A parcel's depots all belong to one company that you trust. The servers of an email belong to strangers, and any server can write any line it likes, including invented lines below its own, before it passes the message on. So you trust a line only as far as you trust the server that wrote it. Start from your own organisation's receiving server at the top, and work down until the first server you cannot vouch for. Below that point, every line is that server's claim.

**So what.** Read the chain from the bottom up to follow the route, and from the top down to decide how much of it to trust. Write in the report which server's line each fact comes from.

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A message's lowest Received line says it left a server at 10:02:00 +0100. The line above it says the next server received it at 09:58:00 +0000. What should the examiner conclude?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing is wrong: in UTC the times are 09:02:00 and 09:58:00, so the second hop came 56 minutes later, which needs only a delay to explain</li>
    <li data-key="b">The second server received the message before the first one sent it, so one line is forged</li>
    <li data-key="c">The message travelled backwards in time because of daylight saving time</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Normalise first: 10:02 at +0100 is 09:02 UTC. Then the order is correct. Option (b) compares local times from two different clocks, the error of Session 5. A 56-minute gap is long and worth a note, but it is not impossible: servers queue messages.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Variations you will meet in real headers</summary>

**Names in the `from` part.** Most servers write the name the sending machine gave, then in brackets the name found for its address and the address itself. The word `unknown` means the receiving server found no name for the address. Only the bracketed address was observed; the first name is a claim.

**`with` and `id`.** `ESMTPS` means the hop used encryption; `ESMTPSA` means the sender also signed in. `id` is the receiving server's own number for the message, which appears in that server's logs. With the server's logs, `id` is the join key for one hop.

**`for`.** Some servers add `for <address>`, the envelope recipient, which can reveal a `Bcc` recipient.

**Time zone names.** Most servers write a numeric offset such as `-0400`. Older ones may write a name such as `EDT`. Convert the name to its offset before you normalise.

**Other lines.** `X-Originating-IP` was added by some webmail services to show the address of the user's device; many no longer add it. `ARC-` lines record the checks made by an earlier server when a message is forwarded. Treat every `X-` line as the claim of the program that wrote it.

**A pass that would fail today.** SPF and DMARC read records that the domain publishes in the DNS, and DKIM reads a published key. A domain can change those records later. That is why the result recorded at the time of delivery matters more than a test you run years afterwards.
</details>

<div class="box key" markdown="1">

Read the Received lines from the bottom up to follow the route, normalise every hop's time to UTC, and trust each line only as far as you trust the server that wrote it.

</div>

## 4. Who writes which line

### The idea

A sender's program can put anything into the lines it writes. A forger does not need special tools: any program that sends mail lets its user type the `From` line. What a sender cannot easily control are the lines that the receiving servers add after the message has left the sender's hands.

So the most important question about any header line is: **who wrote it?**

### How it works

| Line | Who writes it, and can the sender choose it? | Check it against |
|---|---|---|
| `From` | The sender's program: anything at all | Return-Path, the DKIM domain, the receiving server's results |
| `To`, `Cc` | The sender's program: anything, and `Bcc` recipients appear in neither | The envelope recipient, if a `for` part records it |
| `Reply-To` | The sender's program: replies go to this address, not to `From` | The address the reader would expect |
| `Subject`, `Date` | The sender's program, including the time | The first server's Received time |
| `Message-ID` | The sender's program or the first server: rarely changed | The same ID in other mailboxes |
| `Received` | Each receiving server. The sender cannot change lines added after the message left, but can add false lines below them before sending | The chain's continuity; the receiving organisation's own logs |
| `Return-Path` | The last receiving server, from the envelope, whose sender address the sending side chose | SPF, in the receiving server's results |
| `Authentication-Results` | The receiving server: not the sender, if it is your own server's line | Your own server's logs |

{% include demo.html id="S14-D2" %}

**Webmail can hide the sender's own address.** With {% include term.html t="webmail" %}, a person reads and writes email in a web browser, on the provider's website. The browser talks to the provider over HTTPS, not to a mail server. So the first `Received` line is written by the provider's own server, and its `from` part shows the provider's internal machine, or the provider's choice of what to show. Many large providers leave out the address of the user's device completely. Then the user's address is only in the provider's sign-in records, which section 1 says are reached through legal process.

Webmail also leaves no mail store on the computer. Its traces on the computer are browser traces: visits to the provider's site, page titles, cookies and cached pieces of pages. Section 6 shows where these live.

<div class="box metaphor" markdown="1">

**The comparison.** The header is like a bank deposit slip with the bank's stamps on it. The customer fills in the slip: their name, the account and the amount. The teller then stamps it with the branch and the time.

**Why it fits.** The customer can write any name on the slip, as a sender can write any `From`. The stamp is the bank's, as a `Received` line is the server's. To check who really made the deposit, you trust the stamp more than the handwriting.

**Where it breaks.** A bank teller works for a bank you can name and question. A mail server may be run by anyone: a criminal can run his own server and stamp his own messages with whatever he likes. Only the lines written after the message reached a server you trust are stamps in the bank's sense. And the checks in `Authentication-Results` are only as strong as the records that the sending domain chose to publish: a domain that publishes no SPF or DMARC record gives the receiver nothing to test against.

**So what.** For each fact you take from a header, name the line it came from and who wrote that line. A fact from a line the sender wrote is the sender's claim.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A message shows <code>From: Finance Office &lt;finance@example.com&gt;</code>. Its <code>Return-Path</code> is <code>&lt;invoice@example.net&gt;</code>, and the receiving server recorded <code>spf=pass smtp.mailfrom=example.net; dmarc=fail header.from=example.com</code>. What does this show?</p>
  <ul class="qc-opts">
    <li data-key="a">The message came from example.com's finance office, because SPF passed</li>
    <li data-key="b">The message was delivered by a server allowed to send for example.net, while its From line names example.com, which failed DMARC: the From line is the sender's claim and does not hold</li>
    <li data-key="c">Nothing, because Return-Path and From often differ</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). SPF passed for the envelope's domain, example.net, not for example.com (a). Return-Path and From may differ innocently (c), but here DMARC adds the decisive fact: the domain shown to the reader did not authenticate the message.</p></div>

</div>

<div class="box key" markdown="1">

The sender writes the lines about the message and can make them say anything. The receiving servers write the lines about delivery. Trust a fact only as far as you trust whoever wrote its line.

</div>

## 5. The mail store on the disk

### The idea

An email program keeps its mailboxes on the computer in a {% include term.html t="mail-store" %}: a file or database that holds every folder and message. Outlook keeps one of two kinds of file. A PST file is a set of personal folders, kept only on the computer. An OST file is an offline copy of a mailbox that lives on a mail server; Outlook keeps it in step with the server.

The suspect used Outlook 2013 with one account, `iaman.informant@nist.gov`, kept in an OST file named after the account: `iaman.informant@nist.gov.ost`. It lies inside his profile, `C:\Users\informant`. The answer key gives two possible folders for it, so in the lab you find it by its name.

### How it works

**A mail store is a small file system inside one file.** Inside the file, an index records each folder and each message, and points to the blocks that hold its parts: the subject, the times, the body, each attachment. When Outlook deletes something, it changes the index first. You have seen this pattern before. In Session 2, deletion removed the pointer, not the data. The same lesson holds inside a single file.

A message can pass through these states:

| State | What happened | What remains inside the file |
|---|---|---|
| 1. In its folder | Nothing | The complete message, listed |
| 2. In Deleted Items | The user pressed Delete once | The complete message, listed in another folder. A move, not a deletion |
| 3. Out of the index | The user emptied Deleted Items, or pressed Shift and Delete | No listing. The blocks are marked free inside the file, and still hold the data until they are reused |
| 4. Overwritten | New messages reused the blocks, or Outlook compacted the file | Nothing in this file |

A message missing from the store may still exist elsewhere: on the mail server, in the other person's mailbox, or quoted in a reply.

{% include demo.html id="S14-D3" %}

**Tools see different states.** This matters more than any other point in the lab.

| Tool | States it shows | Note |
|---|---|---|
| Autopsy's email parser | 1 and 2 | Lists every folder, including Deleted Items. It reads the index and does not try to recover items from free space. |
| `readpst`, as installed | 1 only | By default it **leaves out the folder Deleted Items**. |
| `readpst -D` | 1 and 2 | The option `-D` includes Deleted Items. |
| `pffexport -m all` | 1, 2 and some of 3 | Exports the listed items, and also items it finds in the free space of the file, written to separate folders for recovered and orphan items. |

A tool that shows fewer messages is not wrong. It is answering a different question. The report must say which tool, which version and which options produced each list.

**What the case shows.** The answer key lists twelve messages in the store: five in the Inbox, two in Sent Items, four in Deleted Items, and one recovered from the unused area of the file. The recovered one is a message the suspect sent on 23 March 2015 with the subject `It's me`. It carries two links to files on Google Drive. Section 8 follows those links.

The key also records that seven messages were deleted on the last day. Four of them stayed in Deleted Items, and one was recovered from free space. The other two are not in the store at all. One of them, the reply that sent his contact a file named `space_and_earth.mp4`, survives in the Windows search index, which keeps its own copy of what it indexes.

**Quoted text is a weaker witness.** When a person replies, the program copies the earlier message below the reply, with a short block of `From`, `Sent`, `To` and `Subject`. The contact's warning `Watch out!` on 24 March survives only in that form, inside the suspect's reply. Quoted text is written by the replying program and can be edited by the person replying. It is evidence that the earlier message existed, but it is the replier's copy of it, not the message itself.

<div class="box metaphor" markdown="1">

**The comparison.** Session 2 compared a file system to a library with a catalogue and shelves. A mail store is that library, inside one file: the index is the catalogue, and the blocks are the shelves.

**Why it fits.** Moving a message to Deleted Items is moving a book to another room: it is still catalogued. Emptying Deleted Items removes the catalogue card; the book stays on its shelf until the space is needed. A tool that reads only the catalogue never sees it. A tool that walks the shelves can.

**Where it breaks.** The shelves of an OST file do not hold plain pages. Outlook stores the blocks in an encoded and often compressed form, so a simple search for a word in the raw file can miss a message that a proper tool recovers. Outlook can also compact the file, which rewrites the whole library and throws away every loose book at once. And unlike a library, an OST file is a copy: the mail server keeps the original mailbox, which may still hold what the computer lost, or may have lost what the computer kept.

**So what.** Run a tool that reads the index and a tool that recovers from free space, record what each one shows, and say which state each message was found in.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An examiner converts an OST file with <code>readpst</code> and its default options and finds no message in Deleted Items. Autopsy lists four there. What explains the difference?</p>
  <ul class="qc-opts">
    <li data-key="a">Autopsy recovered four messages from free space inside the file</li>
    <li data-key="b">The file changed between the two runs</li>
    <li data-key="c"><code>readpst</code> leaves out the folder Deleted Items unless it is run with <code>-D</code></li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The four messages are listed in a folder; they are state 2, not state 3. Autopsy's parser reads the index and does not recover from free space (a). The examiner works on a copy whose hash value is recorded, so a change would show (b).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>PST and OST formats, compaction, shadow copies, and lines a tool writes</summary>

**Formats.** Old PST files from Outlook 97 to 2002 use 32-bit offsets and a 2 GB limit. Since Outlook 2003 the format uses 64-bit offsets. Outlook 2013 introduced a variant for OST files with 4 KB pages and compressed blocks. Check that a tool supports the variant you have: `readpst` gained support for it in version 0.6.71, and the library behind Autopsy's parser supports it too.

**Encoding.** Most stores use a simple substitution called compressible encryption. It is not real protection; it only stops the text from being read in a hex editor. The suspect's OST file had no password. The same encoding is why a tool that reads raw bytes for a {% include term.html t="feature" %}, such as Session 3's bulk_extractor looking for email addresses, may find few of them inside a mail store, and find them instead in other places on the disk, such as the search index or the page file.

**Compaction.** Outlook can compact a store, which rewrites it without the free blocks. A compacted store holds nothing in state 3.

**Shadow copies.** Windows keeps earlier versions of files in volume shadow copies, but the answer key records that this computer was set to leave Outlook's OST files out of them. So the shadow copies cannot bring back an older version of the mail store.

**Lines that a tool writes.** When `readpst` turns a message into a `.eml` file, it copies the original header text if the store kept it. If the store kept no header text, `readpst` writes `From`, `To`, `Subject`, `Date` and `Message-Id` lines itself, from the values stored for the message, and gives the time in UTC with `+0000`. It always adds its own `MIME-Version` and `Content-Type` lines. So in a converted file, ask once more: who wrote this line? It may be the tool.
</details>

<div class="box key" markdown="1">

A mail store is a small file system inside one file. Deleted Items is a folder, not a deletion; a message out of the index may survive in the file's free space. Each tool shows only some states, so name the tool for every list.

</div>

## 6. The browser's records

### The idea

A browser keeps several records of what its user did, each for its own reason:

| Record | What it holds | Why the browser keeps it |
|---|---|---|
| {% include term.html t="browser-history" %} | Each address visited, with the time, and often the title of the page and a count of visits | To suggest addresses as the user types |
| Downloads | The file saved, the address it came from, the time, the size and where it was saved | To show the user their downloads |
| Searches | The words typed into a search engine. They become part of the address of the results page, and Chrome also stores them in a table of their own | Because a search is a visit |
| {% include term.html t="cookie" %} | Small pieces of data that a site asks the browser to keep and send back, often to remember a sign-in, with the time each was made and last used | So the site remembers the user |
| {% include term.html t="cache" %} | Copies of pages, pictures and scripts kept on the disk | To show the page again quickly |

Session 5 read these records as sources of time. Today you read what they say.

### How it works

**Where the two browsers keep them.** The answer key gives the paths, all under `C:\Users\informant\AppData\Local`:

```
Microsoft\Windows\WebCache\WebCacheV01.dat          Internet Explorer 11
Google\Chrome\User Data\Default\History            Chrome 41
Google\Chrome\User Data\Default\Cookies            Chrome 41
```

Internet Explorer 11 keeps one database for its history and downloads, and for the indexes of its cookies and its cache. Chrome keeps history, downloads and search terms in `History`, in tables named `urls`, `visits`, `downloads` and `keyword_search_terms`, and its cookies and cached content in other files of the same `Default` folder.

Both browsers store their times in UTC, as Session 5 said. `WebCacheV01.dat` is a database of the Microsoft format called ESE. Chrome's `History` is a SQLite database, a file format you will meet in depth in Session 16. Today you may read a SQLite database with queries. Recovering its deleted rows belongs to Session 16.

**Webmail and cloud services, as the browser sees them.** Webmail leaves visits to the provider's site, often with page titles that name the mailbox or a subject, plus cookies for the sign-in and cached pieces of pages. In this case the answer key shows no webmail. The cloud services appear instead, on Monday 23 March 2015, in Chrome. Times are UTC.

```
19:55:09  Search  apple icloud
19:55:28  Visit   https://www.apple.com/icloud/setup/pc.html
19:56:04  Search  google drive
19:56:15  Visit   https://www.google.com/drive/download/
```

Minutes later, the two installers, `googledrivesync.exe` and `icloudsetup.exe`, are in his `Downloads` folder, and the key records that they ran.

**Then the cloud program keeps its own log.** Google Drive's program for Windows writes a text log, `sync_log.log`, in the user's profile. Unlike the logs of Session 5, every line states its own offset, `-0400`, so you can normalise it without guessing:

| As written in the log | UTC | Event |
|---|---|---|
| `2015-03-23 16:05:32,279 -0400` | 20:05:32 | The program signs in with a personal Google account |
| `2015-03-23 16:32:35,072 -0400` | 20:32:35 | A file named `happy_holiday.jpg` is created in the Google Drive folder |
| `2015-03-23 16:32:35,086 -0400` | 20:32:35 | A file named `do_u_wanna_build_a_snow_man.mp3` is created there too |
| `2015-03-23 16:42:17,026 -0400` | 20:42:17 | Both files are deleted |
| `2015-03-25 11:22:47,053 -0400` | 15:22:47 | The program signs out |

The account in the sign-in line is `iaman.informant.personal@gmail.com`. A file created in the Google Drive folder is uploaded to that account. So the log shows two files reaching a personal cloud account, and leaving it ten minutes later.

**Private browsing and cleaning tools.** {% include term.html t="private-browsing" %} is a browser mode that keeps no history, cookies or cache in the user's profile after the window closes: InPrivate in Internet Explorer, Incognito in Chrome. A cleaning tool such as CCleaner, which the suspect ran on 25 March, empties these records on demand. Neither removes the rest:

| What they remove | What they leave |
|---|---|
| History, cookies and cache in the profile | The records that the browser program ran, from Session 5; a downloaded file, which stays where it was saved; Windows' own records of opened files; the provider's records and the server's logs; a capture, if anyone took one; memory, while the window is open (Session 6) |
| The cleaning tool's own folder, if it is uninstalled | Its installation and execution traces, from Session 4 |

In this case the answer key still lists the Internet Explorer searches of 25 March, `anti-forensic tools`, `eraser` and `ccleaner`, made between 14:46 and 14:48 UTC, about half an hour before CCleaner ran. Whatever the program was set to remove, it did not remove those records beyond recovery.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A computer's browser history is empty for one afternoon, although logon records show the user was active all afternoon. Which explanation can the examiner test on the computer itself?</p>
  <ul class="qc-opts">
    <li data-key="a">A cleaning tool was run, which would leave its own traces of installation and running</li>
    <li data-key="b">The user browsed in a private window, which can be proved from the empty history alone</li>
    <li data-key="c">The user did no browsing, which the empty history proves</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). A cleaning tool leaves its own signature, as Session 4 showed, so the explanation can be tested. An empty history is consistent with private browsing, with cleaning and with no browsing at all: by itself it proves none of them (b, c). The browser's execution records and the server's side are the next places to look.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Inside the two databases</summary>

**ESE and dirty databases.** `WebCacheV01.dat` is written by a background process while the user is signed in. A copy taken from an image is often marked dirty: some changes may still sit in the transaction log files beside it. Tools differ in how they handle this, which is one reason two tools can show slightly different rows.

**Chrome's tables.** In `History`, `urls` holds one row for each address, with a visit count and the last visit time. `visits` holds one row for each visit, with its time and how the user arrived, for example by typing the address or following a link. `keyword_search_terms` links the words of a search to the address of its results page. `downloads` holds each download, and `downloads_url_chains` the address it came from.

**Chrome's time.** Chrome counts microseconds since 1 January 1601, in UTC. In SQLite, `datetime(t/1000000 - 11644473600, 'unixepoch')` turns such a number into a readable UTC time: it removes the seconds between 1601 and 1970, then reads the rest as a Unix time.

**The Windows search index.** Windows keeps a database of its own, `Windows.edb`, to make searching fast. It holds copies of text from indexed files, messages and visited pages. The answer key found in it two items that the browsers and the mail store had lost. It is a further witness, outside both programs, and a reason never to conclude that a record is gone from the whole computer because it is gone from one program.
</details>

<div class="box key" markdown="1">

Each browser keeps history, downloads, searches, cookies and cache in its own databases, in UTC. Private modes and cleaning tools empty some of these, never all the records of the computer, and never the provider's.

</div>

## 7. The server's side of a visit

### The idea

Every web page a browser shows was asked for from a web server. The browser records the visit. The server records the request. These are two records of one event, written by two parties who never see each other's files, exactly like the two records of Session 13.

A web server writes its records in an {% include term.html t="access-log" %}: a file with one line for each request it answers. Here is one line, from an invented server, in the common format that many servers use:

```
198.51.100.73 - - [03/Mar/2026:09:20:11 +0000] "GET /reports/q1.pdf HTTP/1.1" 200 48211
"https://www.example.com/reports/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
```

### How it works

| Part | In the line above | What it records |
|---|---|---|
| Client address | `198.51.100.73` | The address the server saw: a device, or a router or proxy in front of it |
| Two dashes | `- -` | Identity fields, almost always empty |
| Time | `[03/Mar/2026:09:20:11 +0000]` | The server's clock, with its offset |
| Request | `"GET /reports/q1.pdf HTTP/1.1"` | The method, the path asked for, and the protocol |
| Status | `200` | The result: `200` success, `304` not changed since the last copy, `404` not found |
| Size | `48211` | The bytes sent back |
| Referrer | `"https://www.example.com/reports/"` | The page the browser came from, as the browser says |
| User agent | `"Mozilla/5.0 ..."` | The {% include term.html t="user-agent" %}, the browser's claim about itself |

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The server access log of the web server." | "The access log of the web server." | In Session 11, a server access log was S3's own record of requests to a bucket. An access log is the general record that any web server writes. |
| "The access log shows who visited." | "The access log shows which address asked, when, and what for." | The address is a device or a router at a time, as Session 7 taught. |

</div>

**One visit, two records.** Set the two records side by side:

| Only the browser knows | Only the server knows |
|---|---|
| The title of the page, as the user saw it | The address the request came from |
| Which user profile on which computer | Every request the page caused: the page, its pictures, its scripts |
| How the user arrived: typed, clicked, or from a bookmark | The status code and the bytes sent |
| Where a downloaded file was saved | Requests from other devices behind the same address |

They share the path, the time and the user agent. Unlike Session 13, they share no request ID, so the join is by path and time, which is the weaker kind of join, and the two clocks may differ.

**The cache changes the picture.** When a browser shows a page from its cache, it may not ask the server at all. Or it asks "has this changed?", and the server answers `304` and sends no content. So a browser may record a visit for which the server holds no request, or only a short `304` line.

{% include demo.html id="S14-D4" %}

<div class="box metaphor" markdown="1">

**The comparison.** A browser's history and a server's access log are like a patient's appointment card and the clinic's appointment book.

**Why it fits.** The patient's card shows which clinic they went to and when, in the patient's own handwriting. The clinic's book shows who came through its door, when, and what was done, in the clinic's handwriting. Neither party sees the other's record, so when both agree, the visit is firmly established.

**Where it breaks.** A patient cannot visit a clinic without the clinic seeing them. A browser can show a page from its own cache, with no new request reaching the server. And the clinic sees the patient's face, while a server sees only an address, which may be a router or a proxy standing in front of many devices.

**So what.** When both records exist, join them by path and time, and explain each record that has no partner: a cached visit, a request from another device behind the same address, or a clock difference.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A browser's history shows a visit to a page at 10:05 UTC. The site's access log has no request for that page between 10:00 and 10:10 UTC. Which explanation fits best?</p>
  <ul class="qc-opts">
    <li data-key="a">The history entry is false, because the server has the better record</li>
    <li data-key="b">The browser showed the page from its cache, so no request reached the server</li>
    <li data-key="c">The visit came from a private window, which servers do not log</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A cached page can be shown without a request. Neither record is "better": each records what its writer saw (a). A private window still sends requests, and the server logs them like any other; it changes only what the browser keeps (c).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Formats, proxies and encryption</summary>

The line above is in the **combined** format: the older **common** format stops after the size, without the referrer and the user agent. Servers can be set to record other fields too, such as the time a request took.

When a site sits behind a proxy or a load balancer, the web server sees the proxy's address. The proxy may pass on the real client address in a header named `X-Forwarded-For`, which the server can log. That value is written by whoever sent the request, so it is a claim unless the proxy that added it is the site's own.

HTTPS hides the traffic from the network, not from the server. The server decrypts each request, so its access log records the full path, even when a capture of the same visit shows only an encrypted connection, as in Session 7.
</details>

<div class="box key" markdown="1">

A web server's access log and a visitor's browser history are two sides of one visit. Each knows things the other does not, and a cached page can appear in the browser's record only.

</div>

## 8. Attribution when the network is not yours

### The idea

In Session 7, attribution followed a chain inside an office network: the capture, the router's table, the lending log, the device, the account, the person. Most of those records belonged to the client. On the internet, most of them belong to someone else.

The rule from Session 7 and Session 13 does not change. **An address identifies a device on a network at a time. An account identifies a login.** Neither identifies a person. Every step towards a person needs its own evidence.

### How it works

Here is the chain for a message, with what each step needs and who holds it:

| Step | From | To | What supports it | Who holds it |
|---|---|---|---|---|
| 1 | The message | An account | The store it was found in, the `From` line, the server's records of who sent it | The computer; the mail provider |
| 2 | The account | A sign-in at a time | The provider's sign-in records: time, address, device | The provider: by request if it is the client's, by legal process if not |
| 3 | The sign-in address | A device | The internet provider's records of which customer held the address at that second | The internet provider, by legal process |
| 4 | The device | A user account on it | The store under that profile; logon records, as in Session 5 | The computer |
| 5 | The user account | A person | Who knew the password; who held the second factor of {% include term.html t="multi-factor-authentication" %}; door records, cameras, witnesses, an admission | Mostly outside the computer |

The chain can also run through the computer instead of the provider: if the message is in the store on the suspect's computer, steps 2 and 3 are not needed to tie it to that computer. They are still needed to say where else the account was used.

**What links a login to a person, and what does not.** Some things make it more likely that one person used an account: the account's password was known only to them; the second factor of a sign-in was their own phone; the account was used on their computer, under their profile, while they were logged on; the content refers to things only they knew; they say so themselves. Other things do not link anything: the name inside an address, which anyone can type when they make an account; the display name; one address on its own; the user agent.

{% include demo.html id="S14-D5" %}

**The case, step by step.** Take the message `It's me`, recovered from the suspect's mail store.

- **To an account.** It was found in the store of the account `iaman.informant@nist.gov`, on this computer. It was sent from that account.
- **To this computer.** Its two links point to two Google Drive files. The cloud program on this same computer uploaded two files to a Google account at 20:32:35 UTC, six minutes before the message was sent, and deleted them three and a half minutes after. The answer key confirms that the two links are the files `do_u_wanna_build_a_snow_man.mp3` and `happy_holiday.jpg`; matching the link codes to the file names needs a database that the program deleted, which you will learn to read in Session 16.
- **To the client's documents.** Minutes before the upload, the change journal of Session 5 records that two of the client's documents, a pricing spreadsheet and a meeting presentation, were renamed to those two names.
- **To the Windows account.** The store, the cloud program's log and the renamed files all sit under the profile `informant`, and Windows' logon records, which you read in Session 5, show when that account was logged on.
- **To a person.** This is where the computer stops. The account `informant` was the suspect's, but who sat at the keyboard is shown by evidence outside the image: the client's own mail server logs, Google's records of the personal account, the building's access records, and what the suspect says when he is interviewed.

Notice the account `iaman.informant.personal@gmail.com`. Its name contains the suspect's name. That is not evidence: anyone can create an account with any name. What ties it to this computer is that the program on this computer signed in with it.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "Iaman sent the message." | "The message was sent from the account `iaman.informant@nist.gov`, and was found in that account's store on this computer." | An account is a login, not a person. |
| "The Gmail account is his, because his name is in it." | "The cloud program on this computer signed in with the account." | Anyone can type any name when they make an account. |
| "The provider's records will name the person." | "The provider's records will show the sign-ins: times, addresses and devices." | A provider knows logins and addresses, as the client knows its network. |

</div>

### The mask

<div class="box lens" markdown="1">

**Through another lens: the online disinhibition effect.** In 2004 the psychologist John Suler described why many people say and do things online that they would never do face to face. He named several causes. People feel anonymous. They feel invisible, because nobody sees their face. Replies come later, not at once, so a person does not see the reaction. And authority seems far away. He called the result the online disinhibition effect: people behave as if the screen were a mask.

Read the suspect's messages with that in mind. "Successfully secured." "It's done. See you tomorrow." They are short, plain and careless, from a man who writes as if nobody is watching.

**Where it breaks.** He was not anonymous at all. He wrote from his own work account, through his employer's mail server, on his employer's computer, and he signed the cloud program in with an account that carried his own name. He only *felt* unobserved. Feeling unseen and being unrecorded are different things, and today's evidence is the difference. There is a second break, and it matters more. The effect explains how people behave; it never tells you who they are. A careless tone cannot identify the person who typed a message. And remember that this case was written by NIST for training: the "tone" of these messages is a script writer's. Reading character from text is weak evidence.

**The question it raises.** When you write who sent a message, which part of your sentence comes from the records, and which from your sense of how people behave?

</div>

<div class="box key" markdown="1">

**The pivotal idea.** Online identity is a mask. Attribution links the mask to a person, step by step, with the evidence for each step.

</div>

That is your attribution note in the lab: one message, each step, its evidence, and the step where the computer's evidence ends.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A message was sent from a webmail account whose name is the suspect's name. Which piece of evidence would move the attribution furthest towards the suspect?</p>
  <ul class="qc-opts">
    <li data-key="a">The account's display name matches the suspect's full name</li>
    <li data-key="b">The message's tone matches the way the suspect writes</li>
    <li data-key="c">The provider's records show the sending sign-in came from the suspect's home connection, at a time when his phone confirmed the second factor</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). It links the sign-in to his connection and to a device in his possession, at that time: two independent steps. A name is typed by whoever made the account (a). Tone is a reading of behaviour, not evidence of identity (b).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Shared addresses, VPNs and the strength of a second factor</summary>

**Shared addresses.** As Session 7 said, a mobile network or a large internet provider may put thousands of customers behind one public address. A request for the customer behind an address needs the exact time and, often, the source port. Many web services do not log the port, so the request may have no answer.

**Middle stations.** A virtual private network or an anonymity network puts its own address in front of the user's. The provider then sees the VPN's address, and the chain continues only if the VPN company kept records and can be reached.

**Second factors.** A code from an app on a phone links a sign-in to whoever held the phone at that moment. It is strong evidence, not proof: phones are lent, and some second factors can be intercepted. Treat it as one more step with its own evidence, as Session 11's account set-up suggested when it introduced MFA.
</details>

## 9. Ordinary artefacts, extraordinary reading

### The idea

Everything you found today is ordinary. People search the web for "data leakage" to protect a company as often as to harm one. Installing a cloud program is normal. Sending a colleague a short email is normal. Renaming files is normal. None of these records, alone, is evidence of a crime.

The reading comes from three things: the **pattern**, which is the same kind of act seen in several sources; the **sequence**, which is the order of events; and the **context**, which is who the person is, what their job allowed, and what the client's rules said. A finding states the reading, the alternatives you considered, and how confident you are, with the reason.

### How it works

Here is Monday 23 March 2015 from the sources of today and of Session 5, in UTC:

| UTC | Source | Event |
|---|---|---|
| 17:29:27 | Mail store | A message arrives from the contact's account: "How are you doing?" |
| 18:02 to 18:19 | Chrome and IE 11 | Searches: `data leakage methods`, `leaking confidential information`, `how to leak a secret`, `how to delete data`, `anti-forensics` and others |
| 18:41:55 | Change journal | A client presentation is renamed `space_and_earth.mp4` |
| 18:44:31 | Mail store | He replies: "Successfully secured." |
| 19:19 | Windows search index | He sends `space_and_earth.mp4` with the words "This is a sample." The message is gone from the store |
| 19:55 to 19:56 | Chrome | Searches for `apple icloud` and `google drive`; the download pages |
| 20:05:32 | Drive log | The program signs in with a personal account |
| 20:30:44, 20:31:02 | Change journal | Two client documents are renamed `happy_holiday.jpg` and `do_u_wanna_build_a_snow_man.mp3` |
| 20:32:35 | Drive log | Both files are uploaded |
| 20:38:47 | Mail store, recovered | He sends `It's me` with two Drive links |
| 20:41:19 | Mail store, Deleted Items | The reply: "I got it." |
| 20:42:17 | Drive log | Both files are deleted from Drive |

Take any one row and it has an innocent reading. Take them in order and the innocent readings stop fitting. The searches sit between a contact's message and the sending of a renamed client document. The upload, the link and the deletion fall inside ten minutes. The files carry harmless names that their content does not match. Then, two days later, the messages are deleted and a cleaning tool is run.

**How to state it.** Say what the records show, with their sources. Say which other explanation you tested and why it does not fit. Then say how sure you are and what would change your mind. For example: "The records show that two client documents were renamed, uploaded to a personal cloud account from this computer and shared by email within about eight minutes, and deleted from the cloud account less than four minutes after the email. We considered routine use of the cloud service for the client's work; it does not fit the new harmless names, the personal account or the quick deletion. The records do not by themselves show who operated the computer."

Note the last sentence. It is not modesty. It is the limit that section 8 found.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "Searching for 'data leakage methods' proves intent." | "The searches are consistent with planning; they fall between the contact's message and the sending of a client document." | One record has an innocent reading; the sequence carries the meaning. |
| "He used Google Drive, so he leaked the files." | "Two renamed client documents were uploaded to a personal account and shared by link." | The service is ordinary; what was done with it is the finding. |
| "The evidence proves he did it." | "The evidence shows these acts from this computer and these accounts; the person is shown by evidence outside the image." | Each step of the chain is stated with its own support. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An employee in IT security searched for "data exfiltration techniques" on the same afternoon that a file left the company. Which statement is best for a report?</p>
  <ul class="qc-opts">
    <li data-key="a">"The employee researched exfiltration and then exfiltrated the file."</li>
    <li data-key="b">"The searches fall on the same afternoon as the transfer. Searches of this kind are part of the employee's role, so the order of events and the other sources must decide whether they are connected."</li>
    <li data-key="c">"The searches are irrelevant, because they are part of the employee's job."</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). It states the records, names the innocent reading that the context supplies, and leaves the decision to the sequence and the other sources. Option (a) jumps from order to cause. Option (c) throws away a record that may matter.</p></div>

</div>

<div class="box key" markdown="1">

The same artefacts come from ordinary work. The reading comes from pattern, sequence and context, stated with the alternatives you tested and your confidence.

</div>

## 10. The parallel engagement: a second client's web server

The unit carries more than one case at a time. In the same week it took a separate engagement for a second client, whose web server is suspected of a compromise. The unit is still preparing that engagement's evidence, and its part of this session will be added to this page when the evidence is ready. Nothing in today's work depends on it.

## 11. The lab: the suspect's messages and visits

Your task in one line: from the prepared case of the suspect's computer, list his messages in every state of deletion, read his browsers' and his cloud program's records, write all of them into a communications timeline in UTC, and write an attribution note for one message.

You need the Windows VM with Autopsy and DB Browser for SQLite, the Kali VM, your shared folder, and the two forms from folder `S14` on the lab share. REMnux stays off. Allow about an hour and forty minutes.

<div class="box lms" markdown="1">

The prepared Autopsy case is the one from Session 2, in folder `S02` on the lab share. The communications form and the attribution note form are in folder `S14`. If you are studying away from the lab, the LMS explains how to get the same files.

</div>

<div class="box safety" markdown="1">

**Two rules for today.**

1. **The case is read only.** You export copies of files from it and work on the copies. Record the SHA-256 value of every copy before you use it.
2. **Never open a link from the evidence.** The two Google Drive links in the mail are evidence, not addresses to visit. Opening them would send a request to Google from your own computer, and the files were deleted in 2015 in any case.

</div>

### Part A: open the case and find the stores

1. **Open the case of Session 2.** If `C:\Cases\S02\CFReDS-PC` is still on your Windows VM, open `CFReDS-PC.aut` in Autopsy. If not, extract `S02-autopsy-case-PC.zip` from the lab share into `C:\Cases\S02` first, exactly as in Session 2. Then create a folder for today's notes, `C:\Cases\S14`, and a folder `s14` in your shared folder.

   <div class="box expect" markdown="1">

   The case opens with no ingest, and `cfreds_2015_data_leakage_pc.E01` is under **Data Sources**.

   </div>

   <div class="box trouble" markdown="1">

   If Autopsy asks for the image, point it to the `.E01` file in `C:\Evidence\S02`, as in Session 2. If the evidence folder is empty, copy the image from the lab share again and check its hash value against the evidence register before you go on.

   </div>

2. **Show every time in UTC.** In Autopsy, open **Tools**, **Options**, **View**. Under the setting for displaying times, choose to use another time zone, and pick UTC (GMT+0:00). Click **OK**.

   <div class="box expect" markdown="1">

   Times in the result lists change. A file you know from Session 5, for example the resignation letter on the desktop, now shows its times four hours later than in local time.

   </div>

   <div class="box trouble" markdown="1">

   If the list of time zones has no entry named UTC, choose the one named GMT with an offset of zero. Both mean the same clock.

   </div>

3. **Find the four files by name.** Use **Tools**, **File Search by Attributes**, and search for each name in turn: `iaman.informant@nist.gov.ost`, `WebCacheV01.dat`, `History`, `sync_log.log`. For each, write in `C:\Cases\S14\s14-notes.txt` its full path in the image and its size.

   <div class="box expect" markdown="1">

   Four paths in the suspect's profile, all under `Users\informant\AppData\Local`:

   ```
   Microsoft\...\iaman.informant@nist.gov.ost
   Microsoft\Windows\WebCache\WebCacheV01.dat
   Google\Chrome\User Data\Default\History
   Google\Drive\user_default\sync_log.log
   ```

   Searching for `History` also finds other files and folders of that name: keep only Chrome's.

   </div>

   <div class="box trouble" markdown="1">

   If the mail store's folder is not the one the answer key names, write down the folder where you found it. The key itself gives two folders for this file. Your path is the one that goes into your timeline.

   </div>

### Part B: the mail store

{: start="4"}
4. **List the messages in Autopsy.** In the tree, open **Data Artifacts**, then **E-Mail Messages**. Open the account's folders. For each message, note the folder, the time sent or received, the sender, the recipients, the subject and whether it has an attachment.

   <div class="box expect" markdown="1">

   Eleven messages in three folders: five in Inbox, two in Sent Items and four in Deleted Items. The earliest arrives on 23 March 2015 at 17:29:27 UTC with the subject `Hello, Iaman`; the latest, `Done`, was sent on 24 March at 21:05:09 UTC.

   </div>

   <div class="box trouble" markdown="1">

   If there is no **E-Mail Messages** node, the case was built without the email parser. Right-click the data source, choose **Run Ingest Modules**, tick only **Email Parser**, and wait for it to finish. If the times are four hours earlier than above, step 2 did not take effect: open the options again.

   </div>

5. **Read the header of one received message.** Select `Last request` in the Inbox. In the lower pane, open the tab **Headers**. Then do the same for `Done` in Deleted Items, which the suspect sent.

   <div class="box expect" markdown="1">

   One of two results, and both are correct observations. Either the header text of `Last request` is there, with one or more `Received` lines: then read them from the bottom up as in section 3, and write each hop's time in UTC into your notes. Or the tab is empty or shows only a few lines: then the store kept no original header for the message. `Done` has no `Received` lines in either case, because it is the suspect's own copy.

   </div>

   <div class="box trouble" markdown="1">

   If there are no `Received` lines, write one sentence in your notes: "The mail store kept no transport header for the received messages, so the route and the servers' times cannot be read from this store." That is a limitation, in the sense of Session 13, and it belongs in your attribution note.

   </div>

6. **Export the mail store and hash it.** In Autopsy, right-click the file `iaman.informant@nist.gov.ost`, choose **Extract File(s)**, and save it into the `s14` folder of your shared folder. In PowerShell:

   ```powershell
   Get-FileHash \\VBOXSVR\nb6018\s14\iaman.informant@nist.gov.ost -Algorithm SHA256
   ```

   <div class="box expect" markdown="1">

   One SHA-256 value, which you write into your notes with the file's path in the image. This copy is your working copy for steps 7 to 9.

   </div>

   <div class="box trouble" markdown="1">

   If PowerShell cannot find the path, check the name of your shared folder: Session 5 called it `nb6018`. If Windows hides the file, it is still there: `Get-ChildItem \\VBOXSVR\nb6018\s14 -Force` lists it.

   </div>

7. **Install the two Kali tools.** In Kali, with the VM's network on NAT:

   ```bash
   sudo apt update && sudo apt install -y pst-utils pff-tools
   readpst -V
   pffexport -V
   ```

   <div class="box expect" markdown="1">

   Two version lines: `readpst` 0.6.76 and `pffexport` 20231205, or newer. Write both into your notes, because the result of a recovery depends on the tool's version.

   </div>

   <div class="box trouble" markdown="1">

   If `apt` cannot reach the internet, switch the Kali VM's network to NAT, as Session 0 set it up, and try again. If a newer version is installed, use it and write its number down; nothing below depends on the exact version.

   </div>

8. **Convert the store twice with `readpst`.** Copy the store into your home folder, check that the copy matches, then convert it once with the default options and once with `-D`:

   ```bash
   mkdir -p ~/s14/readpst-default ~/s14/readpst-deleted && cd ~/s14
   cp "/media/sf_nb6018/s14/iaman.informant@nist.gov.ost" . && sha256sum "iaman.informant@nist.gov.ost"
   readpst -e -o readpst-default "iaman.informant@nist.gov.ost"
   readpst -D -e -o readpst-deleted "iaman.informant@nist.gov.ost"
   find readpst-default -name '*.eml' | wc -l
   find readpst-deleted -name '*.eml' | wc -l
   ```

   <div class="box expect" markdown="1">

   The SHA-256 value is the one from step 6. The second count is higher than the first by the four messages in Deleted Items: the default run leaves that folder out. Each message is now a `.eml` file, in folders named like Outlook's.

   </div>

   <div class="box trouble" markdown="1">

   If `readpst` reports an unknown file format, your version is older than 0.6.71: repeat step 7. If a count is not what you expected, compare the folders with `find readpst-deleted -type d` before you change anything.

   </div>

9. **Read who wrote the lines, then recover from free space.** Open the converted `Done`, and look at its first lines:

   ```bash
   grep -rl "^Subject: Done" readpst-deleted | head -n 1 | xargs sed -n '1,14p'
   ```

   Then let `pffexport` export everything it can find, including items in the store's free space, and search for the recovered message:

   ```bash
   pffexport -m all -f text -t ost "iaman.informant@nist.gov.ost"
   ls -d ost.*
   grep -rl "Use links below" ost.* | head
   ```

   <div class="box expect" markdown="1">

   In `Done`, no `Received` line, and a `Date` line that ends in `+0000`: when the store kept no header, `readpst` wrote these lines itself from the stored values, as section 5 explains. `pffexport` makes folders whose names start with `ost.`, one for the listed items and, if it found any, others for recovered and orphan items. The search finds the body of `It's me` in a folder of recovered items, with two `drive.google.com` links. The same folder holds a text file with its properties, including its subject and times.

   </div>

   <div class="box trouble" markdown="1">

   If `It's me` is not found in any `ost.` folder, the tool did not recover it on your version. Do not search the raw file for its words: the store's blocks are encoded, so a plain search can miss them. Instead, open `RE: It's me` in Deleted Items: it quotes the whole message, with `Sent: Monday, March 23, 2015 4:39 PM`, which is local time. Record the message from the quote, mark it "quoted, not recovered", and tell the lecturer your version of `pffexport`.

   </div>

### Part C: the browsers and the cloud program

{: start="10"}
10. **The history in Autopsy.** Open **Data Artifacts**, **Web History**, and sort by the date column. Find the visits of 23 March 2015 between 18:00 and 18:20 UTC, and of 25 March between 14:46 and 14:49 UTC.

    <div class="box expect" markdown="1">

    Chrome's visits to Google and to the pages the suspect opened on 23 March, and Internet Explorer's visits to Bing, to `eraser.heidi.ie` and to `www.piriform.com` on 25 March. Autopsy may name the program of the Internet Explorer rows "Microsoft Edge", because it reads `WebCacheV01.dat` with its module for Edge, which uses the same database. The database's path shows it is Internet Explorer's: write the browser that the path shows, not the label.

    </div>

    <div class="box trouble" markdown="1">

    If there are no Internet Explorer rows at all, the module could not read the database on your VM. Extract `WebCacheV01.dat`, copy it to Kali, and run `log2timeline.py --parsers esedb --storage-file ie.plaso WebCacheV01.dat`, then `psort.py -o dynamic -w ie.csv ie.plaso`, as in Session 5. The rows in `ie.csv` are already in UTC.

    </div>

11. **Searches and downloads in Autopsy.** Open **Web Search**, then **Web Downloads**.

    <div class="box expect" markdown="1">

    Under **Web Search**, the search words with their times, among them `data leakage methods` and `how to leak a secret` on 23 March, `security checkpoint cd-r` on 24 March and `anti-forensic tools` on 25 March. Under **Web Downloads**, the two installers `googledrivesync.exe` and `icloudsetup.exe` on 23 March at about 19:56 UTC, and the Eraser installer on 25 March at about 14:47 UTC.

    </div>

    <div class="box trouble" markdown="1">

    If one list is empty, step 12 reads Chrome's tables directly. Write in your notes which list was empty: two tools that disagree are something to report, not to hide.

    </div>

12. **Query Chrome's database yourself.** Extract Chrome's `History` file from Autopsy into `C:\Cases\S14`, and record its SHA-256 value. Open DB Browser for SQLite and choose **Open Database Read Only**, then the copy. On the tab **Execute SQL**, run the first query, then the second:

    ```sql
    SELECT datetime(v.visit_time/1000000 - 11644473600, 'unixepoch') AS visit_utc,
           k.term, u.url
    FROM keyword_search_terms k
    JOIN urls u ON u.id = k.url_id
    JOIN visits v ON v.url = u.id
    ORDER BY v.visit_time;
    ```

    ```sql
    SELECT datetime(d.start_time/1000000 - 11644473600, 'unixepoch') AS start_utc,
           d.target_path, d.total_bytes,
           (SELECT c.url FROM downloads_url_chains c WHERE c.id = d.id
            ORDER BY c.chain_index DESC LIMIT 1) AS source_url
    FROM downloads d
    ORDER BY d.start_time;
    ```

    <div class="box expect" markdown="1">

    The first query lists every Chrome search with its time in UTC: the searches of 23 March from 18:02:09, the two cloud searches at 19:55:09 and 19:56:04, and `security checkpoint cd-r` on 24 March at 21:06:50. The second lists the two installers saved to `C:\Users\informant\Downloads\`, with the addresses they came from.

    </div>

    <div class="box trouble" markdown="1">

    If DB Browser says the database is locked or malformed, extract the file `History-journal` from the same folder as well, put it beside your copy, and open the copy again. If a query reports that a table does not exist, check its name on the tab **Database Structure**: Chrome changes its tables between versions, and this is version 41.

    </div>

13. **The cloud program's log.** Select `sync_log.log` in Autopsy and open the tab **Text**, or extract it and open it in Notepad. Search for these four phrases in turn: `Initializing User instance`, `RawEvent(CREATE`, `RawEvent(DELETE`, `Signing Out`.

    <div class="box expect" markdown="1">

    The sign-in at `2015-03-23 16:05:32,279 -0400`, with the personal account named in section 6; two `CREATE` events at `16:32:35` for `happy_holiday.jpg` and `do_u_wanna_build_a_snow_man.mp3` in `C:\Users\informant\Google Drive`; two `DELETE` events for the same files at `16:42:17`; and `Signing Out` on 25 March at `11:22:47`. Every line ends its time with `-0400`.

    </div>

    <div class="box trouble" markdown="1">

    The log also holds many lines of the program's own work. Search, do not read from the top. If **Text** shows nothing, use **Extract File(s)** and Notepad.

    </div>

### Part D: the communications timeline

{: start="14"}
14. **Write the timeline.** Copy `s14-communications-form.csv` from folder `S14` on the lab share into your shared folder as `s14-communications-utc.csv`, remove its read-only mark, and open it in Notepad. It has Session 5's seven columns and one example line. Replace the example with your own rows:

    - every message you found, in every state: one row each, with its folder or "recovered" in `description`, and `deleted-items` or `recovered` in `tag` where it applies;
    - the cloud program's events from step 13;
    - at least six browser rows, among them one cloud-service visit and one download.

    Write each time in UTC, in the form `2015-03-23T20:38:47Z`. For a row from Autopsy or from your queries, `original_zone` is `UTC`. For a row from `sync_log.log`, add four hours to the time as written and put `local (UTC-4), offset in the line` in `original_zone`.

    A row looks like this:

    ```
    2015-03-24T21:06:50Z,Search,C/Users/informant/AppData/Local/Google/Chrome/User Data/Default/History,Chrome history,Google search: security checkpoint cd-r,UTC,
    ```

    Your Session 5 file, `s05-timeline-utc.csv`, stays exactly as it is. Session 8 reads it.

    <div class="box expect" markdown="1">

    Between twenty and thirty rows, all inside 22 to 26 March 2015. Sorted by time, `It's me` at 20:38:47 falls after the upload at 20:32:35 and before the deletion from Drive at 20:42:17.

    </div>

    <div class="box trouble" markdown="1">

    If `It's me` falls before the upload, one of the two times was not converted: Autopsy's time is UTC already, and the log's time needs four hours added. If a description contains a comma, put the whole description in double quotes.

    </div>

15. **Check one time against two sources.** The message `Done` appears in your timeline from the mail store. Find the same minutes in your Session 5 timeline, or in the unit's full timeline of Session 5 if you did not choose those events: Chrome's last run and the user's logoff follow within two minutes.

    <div class="box expect" markdown="1">

    In both files the evening of 24 March runs: `Done` sent at 21:05:09, `CHROME.EXE` run at 21:05:38, the search at 21:06:50, logoff at 21:07:25, all UTC. Two timelines built on different days from different artefacts agree to the second.

    </div>

    <div class="box trouble" markdown="1">

    If they differ by exactly four hours, one file holds local times. Find which, from its `original_zone` column, and correct the rows.

    </div>

### Part E: the attribution note

{: start="16"}
16. **Write the note for `It's me`.** Copy `s14-attribution-note-form.md` from the lab share into your shared folder as `s14-attribution-note.md`. For each step of section 8's chain, write the evidence you have, with its source and its time in UTC, what it shows, what it does not show, and what would be needed to go further, and who holds that. End with one finding sentence and one limitation sentence, in the sense of Session 13.

    <div class="box expect" markdown="1">

    Firm steps from the message to the account, to this computer and to the Windows account `informant`, each with its own evidence. At the step to a person, the evidence from the image ends, and your note names what would be needed from outside it, and who holds it.

    </div>

    <div class="box trouble" markdown="1">

    If your note says "the suspect sent the message", read section 8's mix-ups box again. If you could not read any `Received` lines in step 5, say so in the limitation sentence.

    </div>

### Checkpoint

Hand in `s14-communications-utc.csv` and `s14-attribution-note.md`. Judge your own work against this table first. The lecturer checks the timeline against the case's published answer key.

| # | Check | Your proof |
|---|---|---|
| 1 | Seven columns, every time in UTC and in the right form | The file |
| 2 | Every message the store holds, in every state, with its folder, and `It's me` marked as recovered or quoted | Steps 4, 8 and 9 |
| 3 | The cloud program's sign-in, uploads, deletions and sign-out, each converted from `-0400` | Step 13 |
| 4 | At least six browser rows, with one cloud-service visit and one download | Steps 10 to 12 |
| 5 | `original_zone` filled in on every row | The file |
| 6 | An attribution note that names each step, its evidence, and the step where the image's evidence ends | The note |

### If you have time

**Where did the two names come from?** Open your Session 5 outputs from the change journal, and find the renames on 23 March 2015 at 20:30:44 and 20:31:02 UTC. Write the old and new name of each into your notes. You have now followed one pair of files from the client's folder to a personal cloud account and into an email, across three sessions.

**The sample.** The message sent at about 19:19 UTC on 23 March, with `space_and_earth.mp4`, is not in the store. Use your change journal rows to find which client document carried that name, and write one sentence on what that adds to the attribution note, and one on what it does not.

## If you missed Session 14

This session works on the prepared case, so you can do it alone from this page.

1. **Read sections 1 to 9 and run the five demos** (about 70 minutes). Answer each quick check before you open the answer.
2. **Get the case and the two forms.** The case is in folder `S02` on the lab share, the forms in folder `S14`; the LMS explains how to get them away from the lab.
3. **Do Parts A to E in one sitting** (about an hour and forty minutes), with the internet available to Kali for step 7.
4. **Tick the checkpoint table** and hand in the two files.
5. **If you are blocked**, write to the lecturer through the LMS with the step number and the exact error message.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. Explain why the Received lines of an email are read from the bottom up, and which of them an examiner trusts most.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Each server adds its Received line at the top of the header, so the lowest line is the first server's and the top line the last one's; reading upwards follows the route in order. The examiner trusts most the lines written by servers she can vouch for, starting from her own organisation's receiving server at the top, because any earlier server could have written false lines below its own. The points that earn marks: (1) servers add lines at the top; (2) bottom up follows the route; (3) trust runs from the top down, as far as known servers go.
</details>

**2. A message's From line and its Return-Path name different domains. State what the examiner should check before calling the From line forged.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A difference has innocent causes, such as mailing lists and bulk mail services that use their own envelope address, so it is a reason to look, not a finding. The examiner checks the receiving server's Authentication-Results line: whether SPF or DKIM passed for a domain that matches the From domain, and whether DMARC passed for it. The points that earn marks: (1) the difference alone is not proof; (2) check SPF, DKIM and DMARC in the receiving server's line; (3) alignment of the From domain decides.
</details>

**3. Explain why a message in Outlook's Deleted Items folder and a message that was removed from the store need different tools.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A message in Deleted Items is still listed in the store's index, so any tool that reads the index shows it, as long as it does not skip that folder. A removed message has lost its index entry, so only a tool that searches the free space inside the store file for item data, such as pffexport with its recovery mode, can find it, and only until the space is reused or the file is compacted. The points that earn marks: (1) Deleted Items is a listed folder; (2) removal deletes the index entry, leaving data in free space; (3) recovery needs a tool that reads free space, before reuse.
</details>

**4. Compare what a web server's access log and the visitor's browser history each record about one visit.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The access log records the address the request came from, the time by the server's clock, each request with its status and size, and the user agent, which is a claim. The browser history records the page's address and title, the time by the visitor's computer, the user profile, and how the user arrived, but nothing about the server's answer; a page shown from the cache may appear only in the history. The points that earn marks: (1) the server's fields; (2) the browser's fields; (3) one difference, such as the cache or the address.
</details>

**5. A deleted email recovered from a suspect's computer was sent from an account in his name. State what this establishes, and what it does not.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
It establishes that the message was sent from that account and was stored on this computer, under the user profile whose mail store held it. It does not establish who sat at the keyboard: an account is a login and a name in an address is typed by whoever made it, so linking the message to a person needs further evidence, such as logon records, the provider's sign-in records or evidence from outside the computer. The points that earn marks: (1) account and computer are established; (2) the account and the name are not a person; (3) one kind of further evidence named.
</details>

<div class="quiz" markdown="1">

## End-of-day quiz

This quiz closes Day 7. The phase test examines no cloud domain, so Days 6 and 7 bring back earlier material: one question from each of Days 1 to 5. Write each answer in about two sentences before you open the model answer. Mark yourself on the points you made.

<div class="sa" markdown="1">

**Q1.** In Session 1, forensic readiness was described as an organisation's ability to collect trustworthy evidence quickly when something happens. Name two records that a company should already be keeping before an insider leak, and explain why neither can be created after the leak is discovered. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
Examples are a record of USB devices connected to staff computers and mail server logs kept for months, or clocks kept in step across systems so that records can be compared. Such records only describe events that happen while they are being kept, so switching them on after the leak captures nothing about it: the evidence of the leak either exists already or never will. **Points:** (1) one valid record; (2) a second valid record; (3) records only run forward from when they are switched on, so readiness must come first.
</details>

</div>

<div class="sa" markdown="1">

**Q2.** In Session 3, a carving tool finds the header of a JPEG picture in unallocated space but reaches its size limit without finding a footer. Describe what the tool writes out, and how the examiner should treat that file. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The tool writes out everything from the header up to the size limit, so the file is longer than the real picture and holds other data after its true end, or a different file entirely if the picture was fragmented. The examiner must not assume it is complete: she opens it to see how much of the picture is shown, records it as a possibly partial or mixed carve, and does not expect its hash value to match any original. **Points:** (1) the output ends at the size limit, not at the true end; (2) it may hold other data or be incomplete; (3) it is recorded as partial and its hash value is not used to claim a match.
</details>

</div>

<div class="sa" markdown="1">

**Q3.** In Session 6, memory was the most volatile evidence. A suspect's laptop is found switched off. Name two files on its disk that may still hold pieces of memory, and say what those pieces lack compared with a memory image. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The page file, `pagefile.sys`, holds memory pages that Windows moved to disk when memory was full, and the hibernation file, `hiberfil.sys`, holds the memory that Windows saved when the computer last hibernated. Pieces from the page file have no order and no date, and the hibernation file shows memory at the moment of hibernation, which may be long before the events in question, so neither shows the running system at seizure. **Points:** (1) the page file; (2) the hibernation file; (3) they lack order, date or currency: they are not the state at seizure.
</details>

</div>

<div class="sa" markdown="1">

**Q4.** In Session 8, an IDS could watch the network or a single host. Compare a network-based IDS with a host-based IDS by naming one thing that each can see and the other cannot. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
A network-based IDS sees the traffic of many hosts at once, including hosts that run no security software, and can spot a pattern across them. A host-based IDS sees what happens inside one computer, such as programs started, files changed and the content of traffic after the host has decrypted it, which a network sensor cannot read when the traffic is encrypted. **Points:** (1) the network view covers many hosts, including unmanaged ones; (2) the host view sees events inside the computer; (3) one concrete example, such as decrypted content or a changed file.
</details>

</div>

<div class="sa" markdown="1">

**Q5.** In Session 9, capa labelled capabilities with MITRE ATT&CK technique numbers. Explain what an ATT&CK technique number adds to a malware report, and one thing it does not show. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
It names the behaviour in a public, shared catalogue, so that other analysts and tools understand exactly which method is meant and can compare the sample with other reports and with defences mapped to the same technique. It does not show that the sample actually used the technique on the victim's computer, nor who wrote it or why: it describes a method, not an action, an intention or an attacker. **Points:** (1) a common vocabulary; (2) it allows comparison and mapping to defences; (3) it does not show an action that happened, intent or authorship.
</details>

</div>

</div>

## Coming next

Today's traces all came from one computer. Session 15 turns to the suspect's phone: the extraction the unit received, how a phone's file systems store their data, and the messages and app records that a computer never sees.
