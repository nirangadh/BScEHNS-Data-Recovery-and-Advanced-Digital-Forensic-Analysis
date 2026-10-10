---
session_code: S08
description: "What an intrusion detection system is and where it sits, how signature-based and anomaly-based detection differ, how a Suricata rule reads, why an alert is a hypothesis, how alerts are correlated with flow records and with a timeline, and what makes a good indicator of compromise."
hook: >-
  Our own sensor has raised alerts about another computer at the client. Is that computer really infected,
  what exactly happened on it, and can this infection explain how the confidential files left the building?
outcomes:
  - "Explain what an intrusion detection system is, where it sits, and why it sees only what passes its capture point"
  - "Compare network-based with host-based detection, and detection (IDS) with prevention (IPS)"
  - "Compare signature-based with anomaly-based detection: what each catches, what each misses, and how false positives trade against false negatives"
  - "Identify the parts of a Suricata rule: action, protocol, addresses, ports, direction, the options that match content, the message and the rule ID"
  - "Justify why an alert is a hypothesis, and apply a check against the packets before reporting it"
  - "Apply Suricata, Zeek and Wireshark to join alerts to flow records and rebuild the chain of an attack"
  - "Apply normalisation to UTC to merge alerts with a timeline, and justify what the merged result confirms or excludes"
  - "Identify good indicators of compromise, and explain how long each kind stays useful"
before:
  - "Explain why every source is [normalised to UTC](../s05/#8-one-clock-normalise-every-source-to-utc) before timelines are merged (Session 5)"
  - "Explain what a [super-timeline](../s05/#9-the-super-timeline-what-it-adds-and-what-it-buries) adds, and find your own `s05-timeline-utc.csv` (Session 5)"
  - "Explain why a capture is only as complete as its [capture point](../s07/#3-where-the-capture-was-taken-span-and-tap) (Session 7)"
  - "Explain what a [flow record](../s07/#5-flow-records-the-summary-without-the-content) holds, in NetFlow or IPFIX form (Session 7)"
  - "Explain why [attribution](../s07/#8-attribution-an-address-is-a-device-at-a-time-not-a-person) stops at a device at a time (Session 7)"
demos:
  - id: S08-D1
    title: "Two detectors, the same traffic"
    file: s08-d1-signature-versus-anomaly.html
    teaches: "Signature-based and anomaly-based detection read the same events, each catches what the other misses, and moving a threshold trades false positives against false negatives."
  - id: S08-D2
    title: "A rule reads the traffic"
    file: s08-d2-how-a-rule-reads.html
    teaches: "A rule is a list of conditions that are tested one after another, and an alert fires only when every part matches."
  - id: S08-D3
    title: "From one alert to the chain"
    file: s08-d3-alert-to-chain.html
    teaches: "The Community ID joins an alert to its flow record, and the flows just before and after it show the lookup, the download and the contact."
  - id: S08-D4
    title: "Two timelines on one clock"
    file: s08-d4-two-timelines-utc.html
    teaches: "Two records merged and sorted in UTC either interleave, and then support each other, or stay in two blocks, and then exclude a link."
  - id: S08-D5
    title: "How long an indicator stays useful"
    file: s08-d5-indicator-useful-life.html
    teaches: "An indicator stops matching when the attacker changes the thing it describes, and the cheapest things to change are the first to go."
slides: s08-intrusion-detection-correlation.pptx
evidence: "the lab share, folder `S08` (the lab steps say exactly which files), and your own `s05-timeline-utc.csv` from Session 5"
---

In Session 7 you read traffic by hand, one conversation at a time. That works for one office on one afternoon. It does not work for a network of hundreds of computers that talk all day. Today a machine does the first reading, and you learn how far its reading can be trusted.

The unit owes you three plain statements first.

**Where today's evidence comes from in the case.** Session 7 told you that our case has no network traffic, because the client was not recording. That is still true for the days of the leak. The sensor that found this computer is the unit's own: the unit connected it at the client's internet gateway after the engagement began, because the client had recorded nothing before.

**Whose computer it is.** It is another computer at the client. It is **not** the suspect's computer. Its dates, host names and addresses are its own, and this page shows them as the evidence recorded them.

**What the capture really is.** It is a published teaching exercise from malware-traffic-analysis.net, a site whose author, Brad Duncan, shares captures of malware traffic for training. The exercise is dated 22 January 2025 and is called "Download from Fake Software Site". The office network in it is a training network. The malware in it is real. So the method is real and the storyline around it is ours, as with every dataset of this module.

The question for today comes from the defence. A suspect in an insider case can say: "I did not send those files. Malware did." An infected computer at the same client makes that sentence sound possible. By the end of today you can answer it for this infection, with evidence.

## 1. A machine reads first: the intrusion detection system

### The idea

A night guard cannot look at every person who enters a large building. So the building gets a machine at the door that looks at everyone and calls the guard only when something fits a description.

On a network, that machine is an {% include term.html t="intrusion-detection-system" %}, IDS for short. It reads traffic, compares it with what an attack looks like, and writes a record when something fits. That record is an {% include term.html t="alert" %}.

An IDS does not decide that an attack happened. It says: "this looks like one, come and look." Keep that sentence. Section 4 is built on it.

### How it works

**Where it sits.** An IDS that reads packets needs packets. It gets them in the way that Session 7 taught: a copy of the traffic from a {% include term.html t="capture-point" %}, through a mirror port or a network TAP. The computer or device that receives the copy is the {% include term.html t="sensor" %}.

So everything that Session 7 said about a {% include term.html t="packet-capture" %} is true for an IDS as well. It sees only what passes its capture point. A sensor at the internet gateway sees what leaves and what comes in. It sees nothing that stays between two computers of the same office. And if the mirror port drops copies, the IDS never sees those packets and raises no alert for them.

An IDS can read in two ways. It can read live, packet by packet, as the traffic passes. Or it can read a capture file afterwards. The rules and the alerts are the same. Today you use the second way: the unit's sensor recorded the traffic, and you run the IDS over the file.

**Network-based and host-based.** There are two places to watch from.

| | {% include term.html t="network-based-ids" %} | {% include term.html t="host-based-ids" %} |
|---|---|---|
| Where it runs | On a sensor at a capture point | On the computer that it protects |
| What it reads | Packets | That computer's files, programs, logs and settings |
| Sees | Every computer whose traffic passes the point | One computer, in depth |
| Does not see | What happens inside a computer. The content of encrypted traffic | Other computers. Anything, if the attacker switches it off |
| Example of an alert | "A computer downloaded a program from an address that is known to be bad" | "A program changed the list of programs that start with Windows" |

The two complete each other. The network side tells you that something crossed the wire. The host side tells you what it did after it arrived. Session 6 took the host side by hand, from memory. Today is the network side.

**Detection and prevention.** An IDS only watches. It gets a copy, so it cannot stop anything: by the time the alert is written, the packet has arrived.

An {% include term.html t="intrusion-prevention-system" %}, IPS for short, uses the same rules and stands **in the path** of the traffic. Every packet goes through it, and it can drop a packet that matches. The names say it: detection against prevention, IDS against IPS.

| | IDS | IPS |
|---|---|---|
| Position | Beside the traffic, on a copy | In the path of the traffic |
| When a rule matches | Writes an alert | Writes an alert and can block |
| If it is wrong | A person loses time on a false alarm | Honest traffic is blocked and work stops |
| If it fails or is overloaded | The network goes on, unwatched | The network may slow down or stop |

Prevention sounds better, and for well-known attacks it is. But a rule that is wrong costs far more in an IPS. That is why organisations often run new rules in detection mode first.

The tool of this session is **Suricata**. It is free and open-source, it can work as an IDS or as an IPS, and it can read a capture file. Another free tool with the same kind of rules is **Snort**. **Zeek**, which you used in Session 7, is different: it writes logs of what it sees and judges little. You will use Suricata and Zeek together.

<div class="box metaphor" markdown="1">

**The comparison.** An IDS is like a smoke alarm. An IPS is like a sprinkler system.

**Why it fits.** A smoke alarm watches the air in one room and makes a noise. It does nothing to the fire. A person must come and look. A sprinkler has the same kind of sensor and also acts: it opens the water by itself. The alarm watches only the room where it hangs, as a sensor watches only its capture point.

**Where it breaks.** A smoke alarm reacts to one physical thing, smoke, whoever caused it. An IDS reacts to descriptions that people wrote, and an attacker can read the same descriptions and change the attack. A false alarm from a sprinkler floods one room once. A wrong rule in an IPS can block the same honest traffic for a whole company until somebody notices. And smoke does not try to hide from the alarm.

**So what.** When you read an alert, ask two things first. Where was the sensor, so what could it see at all? And was the system only watching, or could it have blocked, so did the traffic arrive?

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A sensor at a company's internet gateway runs a network-based IDS. One office computer copies files to another office computer over the local network. What will the IDS record about it?</p>
  <ul class="qc-opts">
    <li data-key="a">An alert, if the files are confidential</li>
    <li data-key="b">Nothing, because that traffic never passes the capture point of the sensor</li>
    <li data-key="c">A flow record but no alert</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The sensor receives a copy of the traffic at the gateway only, and traffic between two office computers does not go there. Option (a) forgets that an IDS can judge only what it sees. Option (c) is wrong for the same reason: no packets, no record of any kind.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Where sensors go, what encryption does to an IDS, and names you will hear</summary>

**More than one sensor.** Large organisations place sensors at several points: at the internet gateway, in front of important servers, and between parts of the internal network. Each sensor has its own view. Traffic that crosses two sensors is recorded twice, with two slightly different times, which is one reason why section 5 needs a way to recognise the same flow in two records.

**Encryption.** Most traffic is inside {% include term.html t="tls" %}. A network-based IDS cannot read that content. It can still use what Session 7 said stays visible: addresses, ports, sizes, timing, the server name in the handshake, and fingerprints of the handshake. Many rules today match those things. Some organisations decrypt traffic at a proxy before the sensor reads it, and their staff are told.

**Host-based names.** Security products on computers are sold today as "endpoint detection and response". Free host-based tools include Wazuh and OSSEC. Microsoft Defender on a Windows computer does part of the same work. You do not need these names for the lab.

**Where alerts go.** In an organisation, alerts from many sensors are sent to one central system, where analysts read them. The work of those analysts is what you practise today on one capture.
</details>

<div class="box key" markdown="1">

An IDS reads a copy of the traffic at a capture point and raises alerts. It sees only what passes that point. Network-based watches the wire, host-based watches one computer. An IDS detects; an IPS stands in the path and can block.

</div>

## 2. Two ways to detect: known patterns and departures from normal

### The idea

How does a machine know what an attack looks like? There are two answers, and you must know both by name.

The first answer: somebody has seen this attack before and written down what it looks like. The machine compares the traffic with that description. This is {% include term.html t="signature-based-detection" %}.

The second answer: nobody describes any attack. The machine first learns what is normal for this network, and then reports whatever is not normal. This is {% include term.html t="anomaly-based-detection" %}.

Think of two guards at a door. The first has a book of wanted posters and looks for those faces. The second has worked at this door for years, knows everyone who belongs here, and notices a stranger.

### How it works

**Signature-based detection.** The descriptions are written as text, one line for each pattern. On this portal, and in the tools, such a line is a {% include term.html t="rule" %}. A rule can say, for example: "a web request from one of our computers whose path contains this exact text". Section 3 reads a rule part by part.

Rules are precise. When a good rule matches, you know exactly which attack is meant, and the alert can name it. But a rule exists only after somebody has seen the attack, studied it and written the rule. An attack that is new, or an old one that the attacker has changed a little, matches no rule. The IDS stays silent.

**Anomaly-based detection.** Here the system measures first. For days or weeks it records what is normal: how much each computer sends, to which services, at which hours. That record is the {% include term.html t="baseline" %}. Afterwards the system compares live traffic with the baseline and raises an alert when the difference is larger than a set threshold.

This can catch what no rule describes: a new kind of malware that suddenly sends 48 MB to an unknown address is unusual, whatever its name. But "unusual" is not "malicious". A monthly backup is unusual. A new member of staff is unusual. And an attacker who works slowly, in small steps that look like ordinary traffic, stays below the threshold.

**Two ways to be wrong.** You know one of them already. A {% include term.html t="false-positive" %}, from Session 3, is a result that a tool reports although it is not a real find. For an IDS that is an alert when there was no attack.

The other is new. A {% include term.html t="false-negative" %} is a real attack that the tool did not report. No alert was written, so nobody looks. A false positive costs time. A false negative costs the case, because you do not know that it happened.

| | Signature-based detection | Anomaly-based detection |
|---|---|---|
| Compares traffic with | Rules: written descriptions of known patterns | A baseline of what is normal here |
| Catches | Attacks that somebody has seen and described | Departures from normal, including attacks nobody has seen |
| Misses | New attacks, and changed versions of old ones | Attacks that look like normal traffic. Anything that was already there while the baseline was measured |
| Typical false positive | Honest traffic that happens to contain the pattern | Honest activity that is merely unusual |
| The alert tells you | Which known pattern matched | Only that something was different, and by how much |
| Needs | Rules that are kept up to date | Time to learn, and a network that was clean while it learned |

{% include demo.html id="S08-D1" %}

**The trade.** Every detector has a setting that decides how easily it raises an alert: how broad a rule is, or how high a threshold is. Make it more sensitive, and it misses less and cries wolf more often: fewer false negatives, more false positives. Make it stricter, and the false alarms go down while more attacks pass in silence. You cannot push both to zero. Somebody chooses the balance, and the examiner should know which way it was chosen.

This has a hard consequence for you. **"The IDS raised no alert" does not mean "nothing happened".** It means that no rule matched and no threshold was crossed, at the capture point, with the rules of that day.

Suricata, the tool of today, works mainly by rules. So today's alerts come from signature-based detection, and everything in this section about what it misses applies to them.

<div class="box metaphor" markdown="1">

**The comparison.** Signature-based detection is a guard with a book of wanted posters. Anomaly-based detection is a doorman who knows the regulars.

**Why it fits.** The posters are the rules: each describes one known face exactly. The guard recognises those faces at once and can say who they are. A new criminal is in no book and walks past. The doorman has no posters. His knowledge of the regulars is the baseline. He notices a stranger without knowing anything about him, and he also stops the new postman, who is harmless.

**Where it breaks.** A wanted criminal does not usually know which posters the guard holds. An attacker often does: many rule collections are public, and an attacker can test an attack against them and change it until no rule matches. And the doorman's idea of "the regulars" may already include the intruder, if the intruder was coming and going while the doorman learned the faces.

**So what.** Treat silence with the same care as an alert. When you report what an IDS found, report also which kind of detection it used and which rules it had, because that decides what it could not have found.

</div>

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The IDS has a signature for it." | "The IDS has a rule for it." | On this portal a file signature, from Session 3, is the byte pattern that marks a file type. The text that an IDS matches is a rule. The method is signature-based detection. |
| "No alerts, so the network is clean." | "No rule matched at this capture point." | New attacks, encrypted content and traffic on other roads raise no alert. |
| "A false positive means the IDS is broken." | "A false positive is the price of a sensitive setting." | Every detector produces some. The question is whether somebody checks them. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A company is hit by malware that was written last week and has never been seen anywhere else. It sends stolen files out in one large upload at night. Which detection is more likely to raise an alert, and why?</p>
  <ul class="qc-opts">
    <li data-key="a">Signature-based detection, because rules are more precise</li>
    <li data-key="b">Neither, because new malware cannot be detected</li>
    <li data-key="c">Anomaly-based detection, because a large upload at night departs from the baseline even though no rule describes the malware</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). No rule can exist for something nobody has seen, so signature-based detection gives a false negative here. The upload is unusual in size and in time, which is exactly what a baseline shows. Option (a) confuses precise with complete. Option (b) is too dark: new malware can be noticed by what it does.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Where the baseline comes from, mixed methods, and rules for behaviour</summary>

**A baseline is evidence too.** Session 7 said that an organisation which knows its normal traffic finds exfiltration faster, and that collecting this knowledge is part of {% include term.html t="forensic-readiness" %}. Flow records are the usual raw material: they are small, they cover months, and they show volume, direction, destination and time for every computer.

**Poisoned baselines.** If an intruder was already inside while the system learned, the intruder's traffic became part of "normal". Good practice is to build the baseline from a period that was checked, and to renew it, because normal changes.

**Real systems mix both.** Many rule collections contain rules that are close to anomaly thinking: "a program was downloaded from a bare address with no name", or "a web request used a program name that browsers do not use". These rules describe suspicious behaviour and not one known attack. They catch more and they are wrong more often. In Suricata's most used free rule collection their messages often contain the words INFO, POLICY or HUNTING. Section 3 returns to this.

**Numbers behind the trade.** Imagine a network with a million connections a day, of which ten belong to an attack. A detector that is right 99.9 per cent of the time on honest traffic still raises a thousand false alerts a day, beside at most ten real ones. This is why analysts group, filter and check alerts before they believe any of them, and why you do the same in the lab.
</details>

<div class="box key" markdown="1">

Signature-based detection compares traffic with rules for known patterns and misses what is new. Anomaly-based detection compares it with a baseline and misses what looks normal. Fewer false positives means more false negatives, and the other way round.

</div>

## 3. How a Suricata rule reads

### The idea

An alert is only as good as the rule that raised it. If you cannot read the rule, you cannot say what the alert means.

A rule is one line of text. It looks crowded at first. It has only three areas, always in the same order: what to do, which traffic to look at, and what must be inside that traffic.

In this module you **read** rules. You do not write rules, and you never try to shape traffic so that it avoids one.

### How it works

Here is a rule that the unit wrote for training. It is complete and valid, and Suricata accepts it.

```
alert http $HOME_NET any -> $EXTERNAL_NET any (msg:"NB6018 TRAINING Request for update script"; flow:established,to_server; http.method; content:"GET"; http.uri; content:"/download/update.ps1"; classtype:trojan-activity; sid:9000001; rev:1;)
```

Read it from left to right.

| Part | In this rule | What it means |
|---|---|---|
| The action | `alert` | What Suricata does when everything matches: write an alert and let the traffic pass. In an IPS the word could be `drop` |
| The protocol | `http` | Look only at web traffic. Other words here are `tcp`, `udp`, `dns`, `tls` |
| Source address and port | `$HOME_NET any` | From any computer of our own network, from any {% include term.html t="port" %} |
| The direction | `->` | From the left side to the right side |
| Destination address and port | `$EXTERNAL_NET any` | To any address outside our network, on any port |
| The options, in round brackets | everything from `(` to `)` | Further conditions, and labels. Each option ends with a semicolon |

The words with a dollar sign are variables. The person who sets up the IDS tells it once which addresses are "ours": that is `$HOME_NET`. Everything else is `$EXTERNAL_NET`. If this is set wrongly, rules look at the wrong side and alerts are missing or false. So the setting belongs in your notes.

Inside the brackets, two kinds of option stand side by side. Keep them apart.

**Options that test the traffic.** These decide whether the rule matches.

- `flow:established,to_server;` The connection is open, and this data travels towards the server.
- `http.method; content:"GET";` Look at the method of the web request. It must contain `GET`.
- `http.uri; content:"/download/update.ps1";` Look at the path of the request. It must contain this text.

The pattern is always the same: first a word that says **where** to look, then `content:` with **what** to find there.

**Options that only label the alert.** These test nothing.

- `msg:"..."` is the message, the text that the alert will carry. The author of the rule wrote it. It is the author's opinion of what a match means.
- `sid:9000001;` is the {% include term.html t="rule-id" %}. Suricata calls it the sid. Every alert carries it, so you can always find the exact rule that fired. `rev:1;` is the revision, which goes up when the author corrects the rule.
- `classtype:trojan-activity;` puts the rule into a class, and the class gives the alert a priority.

{% include demo.html id="S08-D2" %}

Now you can say what an alert from this rule means, in full: "A computer of our network sent a web request with the method GET and with this path to an outside address, on an open connection." That is all. The rule does not test whether the server answered. It does not test what came back. It does not know whether anything ran on the computer. The message says "Request for update script" because the author expects that. You must check it.

**The rules you will meet in the lab.** The unit's sensor uses a public collection, the Emerging Threats Open ruleset, which has tens of thousands of rules. Its messages begin with `ET` and a word for the kind of rule. Read that word as the author's level of claim.

| The message begins with | The author is saying |
|---|---|
| `ET MALWARE`, `ET EXPLOIT`, `ET PHISHING` | This pattern is known from a named attack or family of malware |
| `ET HUNTING` | This is suspicious behaviour. It may well be honest. Somebody should look |
| `ET INFO`, `ET POLICY` | This happened. It is often normal, and it may break an organisation's policy or be useful context |

A rule of the second or third kind can match correctly and still say nothing about an attack. "A program was downloaded over the web" is true every time somebody installs honest software.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The alert says it is a Trojan." | "The message of the rule says so. The rule matched a request with this path." | The message is a label. The tested options are the facts. |
| "The header of the rule" | "The first part of the rule: action, protocol, addresses, ports and direction" | Header keeps its meaning from Session 3, and packet header from Session 7. |
| "The rule looks at the payload." | "The rule looks at the data that the packet carries, or at a named part of it such as the path." | Payload keeps its meaning from Session 4. Suricata's own documents use the word; this portal does not. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">An alert was raised by the training rule above. Which of these does the alert, by itself, establish?</p>
  <ul class="qc-opts">
    <li data-key="a">That a computer of the home network sent a GET request whose path contained the text of the rule to an outside address</li>
    <li data-key="b">That a script was downloaded and run on that computer</li>
    <li data-key="c">That the user of that computer asked for the script on purpose</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). That is what the tested options say, and nothing more. Option (b) needs the server's answer, which the rule does not test, and evidence from the computer itself. Option (c) adds a person and an intention, which no rule can see.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The three numbers of an alert, other options, and where the rules come from</summary>

**Three numbers.** An alert shows a group such as `[1:9000001:1]`. The first number is the generator, which is 1 for ordinary rules. The second is the rule ID. The third is the revision. Quote all three in your notes: a rule can change between revisions, and then the same rule ID means something slightly different.

**Other options you will see.** `nocase` makes the text match in capital or small letters. `startswith` and `endswith` fix where the text must be. `pcre` gives a pattern in place of a fixed text. `threshold` limits how often a rule may fire in a period, so that one noisy computer does not write ten thousand alerts. `reference` points to a public description of the attack, and `metadata` holds dates and tags from the author. None of these changes the way you read the rule: where to look, what to find, and labels.

**Rule IDs and their owners.** Authors agree on ranges of rule IDs so that two collections do not use the same number. The rules of Emerging Threats have seven-digit rule IDs that begin with 2. The unit's training rule uses a number in a range kept for local rules.

**The ruleset is part of the evidence.** New rules are published every day. The same capture gives different alerts with the rules of last year and the rules of today, because rules for an attack are often written after the attack. So the unit has pinned one snapshot of the ruleset, with its date and hash value, on the lab share, and the key was computed with it. In a report, you name the ruleset and its date, as you name a tool and its version. The licence files of the ruleset travel with the unit's copy.

**Writing rules.** Writing a rule that detects an attack and does not fire on honest traffic is a skill of its own, and it is not assessed in this module. If you try it, test the rule on captures of honest traffic first. A rule is judged by its false positives as much as by what it catches.
</details>

<div class="box key" markdown="1">

A rule reads: action, protocol, source address and port, direction, destination address and port, then options. Some options test the traffic. The message and the rule ID only label the alert. An alert means exactly what the tested options say.

</div>

## 4. An alert is a hypothesis, not a finding

### The idea

A doctor does not operate because a screening test came back positive. The test says "possible". Then come the examinations that confirm it or rule it out.

An alert is the screening test. It says that some traffic fitted a description. Whether an attack happened is a question that you answer by looking at the traffic itself.

Until you have done that, the alert is a hypothesis. A hypothesis is a statement that may be true and has not been tested yet. A finding is a statement that you have tested and can show to another person.

### How it works

**What an alert looks like.** Suricata writes each alert in two files. The first is `fast.log`, one line for each alert, made for human eyes:

```
01/22/2025-19:45:56.530137  [**] [1:9000001:1] NB6018 TRAINING Request for update script [**] [Classification: A Network Trojan was detected] [Priority: 1] {TCP} 192.0.2.10:49731 -> 203.0.113.80:80
```

Read it in four pieces. The time. The three numbers and the message, which come from the rule. The class and the priority, which also come from the rule. And the protocol, the two addresses and the two ports, which come from the traffic. Only the first and the last piece are observations. The middle is the author's labelling.

The time in `fast.log` has no time zone written beside it. It is the local time of the computer that ran Suricata. Session 5 taught what follows from that: before you compare it with anything, you must know which clock it is. In the lab you start Suricata with its clock set to {% include term.html t="utc" %}, and the second file states its zone in every record.

The second file is `eve.json`. It holds one record for each alert, in the JSON form, made for programs. It contains everything from `fast.log` and more:

```
{"timestamp":"2025-01-22T19:45:56.530137+0000","pcap_cnt":31,"event_type":"alert",
 "src_ip":"192.0.2.10","src_port":49731,"dest_ip":"203.0.113.80","dest_port":80,"proto":"TCP",
 "community_id":"1:lEICeLw60WvS6WALAkcCuZPvFeU=",
 "alert":{"signature_id":9000001,"rev":1,"signature":"NB6018 TRAINING Request for update script",
          "category":"A Network Trojan was detected","severity":1},
 "http":{"hostname":"files.example.net","url":"/download/update.ps1","http_method":"GET","status":200,"length":186240}}
```

Three fields matter most today. `timestamp` ends with `+0000`, which is the offset from UTC. `pcap_cnt` is the number of the packet in the capture that fired the rule: you can open exactly that packet in Wireshark. And `community_id` is the code that section 5 uses to join this alert to other records. Suricata's own field names say `signature` and `signature_id` where this page says message and rule ID.

**The check.** For each rule that fired, you do the same five things.

1. **Read the rule.** Which options test the traffic? What exactly did it match? What does its message claim beyond that?
2. **Open the packet.** Go to the packet number in Wireshark. Is the matched text really there, in the place the rule names?
3. **Read the direction and the ends.** Which computer sent this, to which address and port? Is the "home" side really one of our computers?
4. **Read what followed.** Follow the {% include term.html t="stream" %}. Did the server answer? With what size? An attempt and a completed exchange are different facts.
5. **Look for a second source.** Does another record agree: a flow record, a name lookup just before, the same pattern again a minute later?

Then you give the rule one of three marks.

| Mark | When | Example |
|---|---|---|
| **Confirmed** | The traffic contains what the rule describes, and what followed fits the rule's claim | The request is there, the server answered with a large script, and the computer contacted a new address seconds later |
| **False positive** | The rule matched, and there was no attack in that traffic | The text matched inside honest traffic, or the rule only reports something normal, such as a Windows update |
| **Unclear** | You cannot decide with this evidence | The traffic is encrypted, the stream has gaps, or the rule describes behaviour that could be either |

"Unclear" is an honest mark. An examiner who marks everything as confirmed or false has usually guessed. Write the reason for each mark in a few words, so that another person can test it.

**A rule can match correctly and still not point to an attack.** A rule that says "a Windows computer asked for its update list" fires on exactly that, every day, on every office network. The match is right. The alert is still a false positive in the sense of section 2: an alert when there was no attack. Mark such a rule as a false positive, and write in the reason that the rule reported normal activity.

<div class="box metaphor" markdown="1">

**The comparison.** An alert is like a positive result of a medical screening test. A finding is like a diagnosis.

**Why it fits.** A screening test is cheap, fast and given to everybody, as an IDS reads every packet. It is set to be sensitive, so that few sick people are missed, and so it gives many false positives. Nobody is treated on the screening result alone. A doctor orders further examinations that look at the body directly, and only their result is the diagnosis. Your further examination is the packets.

**Where it breaks.** An illness does not study the test and change itself to pass it. An attacker does exactly that with public rules. And a patient can be examined again next week, while a packet that was not recorded is gone, so sometimes the examination that would decide the question is no longer possible. Then the honest mark is "unclear".

**So what.** Never copy the message of an alert into a report as a fact. Report what you saw in the traffic, name the rule that pointed you there, and say which mark you gave and why.

</div>

<div class="box lens" markdown="1">

**Through another lens: the Panopticon.** In the eighteenth century the philosopher Jeremy Bentham designed a prison that he called the Panopticon. The cells stand in a ring around one watchtower. A guard in the tower can see into every cell. The prisoners cannot see into the tower, so they never know whether anyone is looking at them at this moment.

In 1975 the French thinker Michel Foucault used this building to explain something about power. The tower works even when it is empty. People who may be watched at any time begin to behave as if they are always watched. Being visible is enough to control them. The watcher sees and is not seen, and that one-sided view is the whole mechanism.

A monitored network looks like this building. The sensor is the tower. Staff know that traffic may be recorded, cannot tell when anyone reads it, and most of them behave. For honest users, visibility really does work as control.

Now look at where the picture breaks, because that is the lesson. An attacker is not a prisoner in a cell. The tower does not discipline him. He studies it: where it stands, what it can see, which rules it holds. Then he works in its blind spots. He uses a road that does not pass the capture point, hides inside encryption, or changes the attack until no rule matches. And the real tower is smaller than Bentham's. It sees one capture point, not every cell.

So the watcher must not trust the tower too much. A quiet screen is not an innocent network, and a loud alert is not a proven attack. Session 7's lens was a film about a listener who heard every word and still misread the meaning. Today's lens is the other half: a watcher who believes that he sees everything.

The question to carry into the lab: for each alert, what did the tower really see, and what are you adding?

</div>

<div class="box key" markdown="1">

An alert is an inference, not proof. It becomes a finding only when the evidence confirms it. Read the rule, open the packet, read what followed, and mark each rule confirmed, false positive or unclear, with a reason.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An alert has the message "ET MALWARE Example Stealer Checkin". In Wireshark you find the request that fired it. The server never answered: the connection shows only the request, sent three times, and then nothing. What is the best mark and note?</p>
  <ul class="qc-opts">
    <li data-key="a">False positive, because no data came back</li>
    <li data-key="b">Confirmed that the computer tried to contact that server with this pattern, with a note that no answer was captured, so the exchange was not completed in this capture</li>
    <li data-key="c">Confirmed that data was stolen, because the message names a stealer</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The request is real evidence about the computer: something on it sent that pattern. What it did not achieve is just as much part of the finding. Option (a) throws away a true observation. Option (c) repeats the label of the rule and claims a result that the traffic does not show.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Why one event gives many alerts, alerts on answers, and what to write down</summary>

**Many alerts, one event.** One download can fire five rules: one for the bare address, one for the kind of file, one for the program name, one for the path, one for the family of malware. And one rule can fire a hundred times for a request that is repeated every few seconds. So you group alerts by rule first, and then by connection. The number of alerts says little. The number of different things that happened says much more.

**Alerts on the answer.** Some rules test what the server sent back. Then the alert's source address is the outside server and its destination is our computer. This is still an alert about our computer's connection. The Community ID of section 5 is the same for both directions, which is one reason why it is a better join key than the addresses as written.

**The order in fast.log.** Suricata reads with several threads at once, so the lines of `fast.log` are not always in the order of time. Sort before you read.

**Your notes for each rule.** The rule ID and revision. The number of alerts. The packet number that you opened. The filter or stream that you read. What you saw. The mark and its reason. With these six items another examiner can repeat your check in two minutes.
</details>

## 5. Correlation inside the capture: from an alert to a chain

### The idea

One confirmed alert is one moment: at this second, this computer sent this request. An investigation needs the story around it. How did the computer get there? What came back? What did it do next?

The alert cannot tell you. But the same capture holds the answers, in the records of another tool. Setting records from two or more sources side by side, to see whether they agree, complete each other or rule each other out, is {% include term.html t="correlation" %}.

Today you correlate twice. First inside the capture: Suricata's alerts with Zeek's records of the same packets. Then, in section 6, against your timeline from Session 5.

### How it works

**Two tools, one capture.** In Session 7 you ran Zeek over a capture. It wrote `conn.log`, with one {% include term.html t="flow-record" %} for each connection: both addresses, both ports, the protocol, the start time, the duration, and the bytes that each side sent. It also wrote logs for single protocols.

| Zeek log | One line for each | Tells you |
|---|---|---|
| `conn.log` | connection | Who talked to whom, when, for how long, how much in each direction |
| `dns.log` | {% include term.html t="dns-query" %} | Which name a computer asked for, and which addresses it was given |
| `http.log` | web request | The site, the path, the method, the program name, the size of the answer |
| `ssl.log` | TLS connection | The server name from the handshake, and the TLS version |

Suricata judged the traffic and said little about each connection. Zeek describes every connection and judges nothing. Together they give you both.

**The join key.** To put an alert beside its flow record, you need something that both records share. The obvious choice is the five values of the {% include term.html t="flow" %}: the two addresses, the two ports and the protocol. But the two tools may write them in a different order, for example when the alert was raised on the server's answer.

So the people who build these tools agreed on one way to turn the five values into a short code. Every tool sorts the two ends in the same fixed order and calculates a {% include term.html t="hash-value" %} over them. The result is the {% include term.html t="community-id" %}. It looks like this:

```
1:lEICeLw60WvS6WALAkcCuZPvFeU=
```

The `1:` in front is the version of the method. The rest is the hash value, written in letters and digits. The same five values give the same code in Suricata, in Zeek, and in any other tool that follows the method. Both directions of one conversation give the same code.

The join is then one step: find the flow record whose Community ID equals the alert's.

{% include demo.html id="S08-D3" %}

**When there is no Community ID.** Not every tool writes one, and some must be told to. Suricata writes it only when its configuration says so. Zeek has it built in from version 6. Older versions, such as the one in some Kali builds, need an extra package. The unit's helper script can calculate the code from the five values of a `conn.log`, so the lab works either way.

Without any Community ID you join by hand: the two addresses, the two ports, the protocol, and a time within a few seconds. It works. It is slower, and it can fail when the clocks of two sensors differ or when a computer reuses a port quickly.

**From the flow to the chain.** The join gives the alert a flow record. Now you read around it, for the same computer, in order of time. An infection that arrives over the network usually shows three steps.

1. **The lookup.** Shortly before the connection, the computer asks the DNS for a name, and the answer is the address that it then contacts. `dns.log` holds the name. This tells you which name led to the address.
2. **The download.** The computer receives far more than it sends, from an address or name that it has not used before. `conn.log` shows the shape, and `http.log` shows the path, if the traffic was not encrypted.
3. **The contact.** Soon afterwards the computer begins to talk to a server again and again, in small exchanges, often at a regular rhythm. This is the malware reporting to the attacker's server and asking for instructions.

Many rule messages write "CnC" or "C2" for the third step. Both stand for "command and control": the server from which an attacker steers infected computers. On this page it is the attacker's server.

Lookup, download, contact: that is the chain. Not every attack shows all three in a capture. A step may be encrypted, or may have happened before the recording began. Then you say so.

**What the join adds.** Three things that the alert alone could not give you.

- **Size and duration.** The alert said "a request left". The flow record says that 186,240 bytes came back in two seconds.
- **Flows with no alert.** The contact with the attacker's server may match no rule at all. You find it because it follows the download, from the same computer, to a new address. Correlation finds false negatives of the IDS.
- **A check on the alert.** If the alert says "download" and the flow record shows 96 bytes coming back, something does not fit, and you look again.

And one thing it does not add. The chain is still about a device. Session 7's rule stands: an address identifies a device on a network at a time. If the capture shows an account name beside that address, the name identifies an account, and an account is not a person.

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An alert was raised on a server's answer, so it reads 203.0.113.80:80 -> 192.0.2.10:49731. The flow record of the same connection reads 192.0.2.10:49731 -> 203.0.113.80:80. Will a join by Community ID find it?</p>
  <ul class="qc-opts">
    <li data-key="a">No, because source and destination are swapped</li>
    <li data-key="b">Only if the two tools ran on the same computer</li>
    <li data-key="c">Yes, because the method sorts the two ends in a fixed order before it calculates, so both directions give the same code</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The code depends on the five values and not on which end is written first. Option (a) would be true for a naive comparison of the text. Option (b) is wrong because the code is calculated from the traffic, and it does not matter where the tool runs.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What the code is made of, its limits, and other ways to join</summary>

**The calculation.** Version 1 takes a seed number, the two addresses, the protocol number and the two ports, puts the smaller end first, and calculates a SHA-1 hash value over these bytes. The 20 bytes of the result are written in base64, the encoding that you met in Session 7 for mail attachments, and `1:` is put in front. SHA-1 is no longer safe for proving that a file is unchanged. Here it only gives a short name to five values, and for that it is fine.

**The seed.** All tools must use the same seed, or the codes differ. The usual seed is 0, and the unit's configuration says so.

**What it cannot tell apart.** A Community ID names five values, not one connection. If a computer uses the same source port for the same server twice in one day, both connections get the same code. So you still use the time to choose between them. The helper script does this for you by taking the flow record nearest in time.

**A new port, a new code.** Each new connection from a computer normally uses a new source port. Ten contacts with the same server give ten different Community IDs. To find them all, you search by the server's address and port, not by one code.

**Zeek's own key.** Zeek gives every connection a `uid`, a short random name that appears in all of its own logs. Use it to move between `conn.log`, `dns.log` and `http.log`. It means nothing outside Zeek, which is why the Community ID exists.

**Flow records from routers.** The same correlation works with {% include term.html t="netflow" %} or IPFIX records from a router when no capture exists. You then have the shape of the chain, who, to where, when and how much, without any content.
</details>

<div class="box key" markdown="1">

Correlation sets records from different sources side by side. The Community ID joins an alert to its flow record, because every tool calculates it from the same five values. Around the joined flow you read the chain: lookup, download, contact.

</div>

## 6. Correlation against the timeline: it can exclude as well as confirm

### The idea

Now back to the question from the defence. "It was malware." The client has a computer that was infected. Did that infection have anything to do with the confidential files that left?

You hold two records. One is the set of alerts that you confirmed today. The other is the {% include term.html t="timeline" %} of the suspect's computer, which you built in Session 5 and saved as `s05-timeline-utc.csv`.

If you put both on one clock and sort them, the order of the rows answers a simple question: could these two records be about the same events?

### How it works

**Same columns.** Two records can be merged only when they have the same shape. Session 5 fixed the unit's timeline format with seven columns. So each confirmed alert becomes one row in those columns.

| Column | For an alert |
|---|---|
| `timestamp_utc` | The time of the alert, converted to UTC, in the form `2025-01-22T19:45:56Z` |
| `timestamp_desc` | `IDS alert` |
| `source` | The file that holds the record: `eve.json (Suricata)` |
| `artefact` | `ids alert` |
| `description` | The rule ID, the message, the two addresses and ports, and the Community ID |
| `original_zone` | The clock that the source used: `UTC`, or `local (UTC+5:30)` if Suricata ran on a computer set to that zone |
| `tag` | `confirmed-alert` |

Only confirmed alerts go in. A row in a timeline looks like a fact to everybody who reads it later, so a hypothesis has no place there.

**Same clock.** This is {% include term.html t="normalisation" %}, exactly as in Session 5. The record in `eve.json` carries its offset, so the conversion is safe. If you had only `fast.log`, you would first have to find out which clock wrote it. The original zone is kept in its own column, so that anyone can see that a time was converted, and from what.

**Merge, sort, read.** The rows of both files are put together and sorted by `timestamp_utc`. The result is written to a **new** file. Your Session 5 file is evidence that you produced and hashed. It is not changed, and you show that by its hash value before and after.

Now there are two possible pictures.

{% include demo.html id="S08-D4" %}

**Picture one: the rows interleave.** Rows from both sources lie between each other, seconds or minutes apart, about the same computer. A page was opened, then an alert, then a file was created, then a program started. Each source supports the other. This is what you would hope to see if you had a timeline of the infected computer itself, and it would confirm the alerts from an independent side.

**Picture two: two blocks.** All rows of one source come first, then a gap, then all rows of the other. No row of one lies inside the time span of the other.

That second picture is what your two files give. Read it plainly.

- The alerts are about **another computer**, not the suspect's.
- The alerts are dated **January 2025**. The suspect's timeline covers **March 2015**. The gap is almost ten years.

A program cannot send files from a computer that it is not on, ten years before it arrived on a different one. So **this infection cannot explain the leak.** The correlation excludes it.

That is a result. It is as real as a match, and it goes into the report. Students often feel that a correlation which "finds nothing" has failed. It has not. You asked a clear question and the evidence answered "no".

**The limits of the exclusion.** Say them in the same breath, or the sentence is too strong.

- It excludes **this infection**. It does not show that the suspect's own computer was free of malware in 2015. That is a different question, and the evidence for it is the suspect's own disk, which you examined in Sessions 2 to 5.
- It depends on **both clocks**. A gap of ten years is safe against any time zone mistake. A gap of five hours would not be: that is exactly the size of a normalisation mistake.
- It depends on **the sensor's view**. The capture shows what this computer did at the gateway during the recording. It does not show the client's whole network over ten years.

<div class="box metaphor" markdown="1">

**The comparison.** An excluding correlation is like an alibi.

**Why it fits.** An alibi does not say who did something. It says who could not have done it: this person was in another place at that time, and here is the record that shows it. Your merged timeline does the same for the infection. It was on another computer, at another time, and both facts come from records with known clocks. An alibi is checked as strictly as an accusation, and so is this: you check the dates, the zones and the identity of the computer.

**Where it breaks.** An alibi clears a person completely for that act. Your exclusion clears one infection only. Other malware, on the suspect's own computer, in the right month, is not touched by it. And an alibi is about a person, while your records are about devices: you have shown where a program was not, and nothing yet about who did what.

**So what.** Write the exclusion as narrowly as the evidence is: which infection, which computer, which dates, which records. Then say what would be needed to answer the wider question, and where that evidence is.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">Two timelines are merged in UTC. The rows of the first all fall between 09:00 and 09:20 on one day. The rows of the second all fall between 14:05 and 14:30 on the same day. One source recorded local time at UTC+5. What should the examiner do before writing "the two records are five hours apart and unrelated"?</p>
  <ul class="qc-opts">
    <li data-key="a">Nothing, because the merged file is already in UTC</li>
    <li data-key="b">Check that the local source was really converted, because a gap of about five hours is exactly what a missed conversion of UTC+5 would produce</li>
    <li data-key="c">Delete the rows of the local source, because local time is unreliable</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A gap that equals a time zone offset is a warning sign, and the column original_zone shows whether the conversion was done. Option (a) trusts the name of the column over the content. Option (c) destroys evidence that only needs to be normalised.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The "it was malware" defence, and how examiners answer it</summary>

**The defence is real.** Defendants have said in court that malware on their computer, and not they themselves, did what they were accused of. Lawyers and examiners often call this the Trojan horse defence.

**One case.** In October 2003 a jury in England found Aaron Caffrey, then 19, not guilty of an attack two years earlier that had slowed the computer systems of the Port of Houston in the United States. He said that attackers had used a Trojan to take control of his computer and launch the attack from it. The forensic examination of his computer had found attack tools and no trace of a Trojan. The jury acquitted him all the same. The case was widely reported at the time, for example by the technology news site The Register.

**What it teaches.** "We found no malware" did not settle the question for that jury. An absence is weak when the other side can say that the malware removed itself. So examiners learned to answer the defence with positive evidence, from several sources that agree.

1. **Look for the malware properly.** Disk, memory and network: Sessions 2 to 7 gave you the methods. Say what you searched, with which tools, and what you found or did not find.
2. **Check what the malware could do.** If malware was present, was it able to do the act in question? Sessions 9 and 10 teach how to answer that from the program itself.
3. **Look for the person.** Malware does not open a document, read it for two minutes, rename it and then plug in a USB stick. The artefacts of Session 5 show sequences that fit a person at a keyboard. Session 7's chain from address to person still has to be walked.
4. **Use the timeline.** If the malware arrived after the act, or was on another computer, it cannot be the cause. That is today's method.

**A fair warning.** The defence is sometimes true. Computers are taken over, and files have been placed on them by others. An examiner tests the defence with the same care as the accusation, and reports what the evidence shows, whichever side it helps. Session 17 returns to this duty.
</details>

<div class="box key" markdown="1">

Convert confirmed alerts to the timeline's columns, normalise to UTC, merge into a new file, sort and read. Rows that interleave support each other. Two blocks, on different computers and years apart, exclude a link. An exclusion is a finding, stated with its limits.

</div>

## 7. Indicators of compromise: recognising the same attack elsewhere

### The idea

You have confirmed what happened on one computer. The client's next question is practical: "Is any other computer affected? And how will we know if it comes back?"

The answer is a list. A piece of evidence from one attack that can be searched for elsewhere, to recognise the same attack, is an {% include term.html t="indicator-of-compromise" %}, IOC for short. The address of the server that delivered the download is one. So is the name that the computer looked up.

Think of the description that the police send out after a robbery. "A blue van, this number plate, two people, one with a red jacket." Some parts of it stay true for weeks. Others are changed within the hour.

### How it works

**The kinds.** Your chain gives you indicators of several kinds. Each has its strengths, and each has a useful life.

| Kind | Example of the form | Where you search for it | How long it stays useful |
|---|---|---|---|
| IP address | `203.0.113.80` | Flow records, firewall logs, captures | Days to weeks. Renting another server takes minutes. Later an honest site may get the address |
| Domain name | `files.example.net` | DNS logs, proxy logs, the server name in TLS handshakes | Weeks. A new name costs little, but it must be registered and set up |
| URL path | `/download/update.ps1` | Web and proxy logs, `http.log`, captures of unencrypted traffic | Weeks to months. The attacker's own tools must be changed |
| Hash value of a file | A SHA-256 value | Disks and memory of other computers, mail gateways | Until the file is changed by one byte, which can be minutes. While it lasts, it is exact |
| Certificate of a server | Its fingerprint or its serial number | TLS handshakes up to TLS 1.2, scans of servers | Until the attacker makes a new one, often months |
| Fingerprint of a TLS handshake | A JA3 or JA4 value | Captures and logs of TLS handshakes | Months, but many honest programs may share it |

Session 7 named JA3 and JA4 in its deeper layer: a short code calculated from how a program opens a TLS connection. It can show that the same kind of program is talking, whatever address it talks to.

{% include demo.html id="S08-D5" %}

**The pattern behind the table.** The indicators that are easiest to collect are the ones that the attacker can change most cheaply. A hash value is exact and is dead after one changed byte. An address is easy to block and easy to replace. What the attacker changes least willingly is the way the attack works: lookup, download of a script from a bare address, contact every few seconds. That behaviour is harder to write down as one value, and it lasts longest.

**What makes a good indicator.** Five tests.

1. **It comes from confirmed evidence.** An indicator from an alert that you marked unclear or false positive sends other people on a false trail.
2. **It is specific.** The address of a large hosting provider, or of a public DNS resolver, appears in everybody's logs. As an indicator it produces only false positives.
3. **It says where and when.** "Seen in the web request of 22 January 2025, 19:45 UTC, from this computer". An indicator without a source and a time cannot be checked or retired.
4. **It can be searched for.** Give the exact value, and say in which kind of log it will show.
5. **It has an end.** Addresses and names should be reviewed and removed after a time. A list that only grows turns into noise.

**What does not belong on the list.** Addresses and names of honest services that the infected computer also used: the Windows update servers, the company's own domain controller, a search engine. They are in the capture, near the attack in time, and they are not part of it. Sorting them out is the work of section 4.

**Hash values without the file.** Today you do not extract any file from the capture, so you cannot calculate a hash value yourself. If Zeek's `files.log` or the exercise material gives one, you may list it and name that source. Extracting and examining the files themselves is the work of Sessions 9 and 10, under isolation.

**Writing indicators safely.** A report is read in mail programs and browsers that turn addresses into links. So in running text, indicators are written in a way that cannot be clicked by mistake: `hxxp://` in place of `http://`, and square brackets around the dots, as in `files[.]example[.]net`. In a list that a machine will read, you write the plain values.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "Every address in the capture is an IOC." | "An IOC is evidence of the attack that you confirmed." | Most addresses in any capture are honest. |
| "Block the IP address and the problem is solved." | "Blocking the address stops this server for now. The behaviour will return from another address." | An address is the cheapest thing for the attacker to change. |
| "The hash value matches nowhere else, so nobody else is infected." | "No other computer holds this exact file. A changed copy would have another hash value." | A hash value proves presence when it matches. Its absence proves little. |

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">An examiner can give a client only two indicators from an attack. Which pair is the most useful for finding other infected computers during the coming months?</p>
  <ul class="qc-opts">
    <li data-key="a">The domain name that the malware looked up, and the path of its regular request to the attacker's server</li>
    <li data-key="b">The IP address of the client's own DNS server, and the IP address of the attacker's server</li>
    <li data-key="c">The hash value of the downloaded file, and the time of the first alert</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). A name and a path cost the attacker more to change than an address or a file, and both can be searched for in logs. Option (b) contains an honest address that every computer uses, which gives only false positives. Option (c) has the shortest-lived indicator and a time, which is not an indicator at all.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The pyramid of pain, and sharing indicators</summary>

**The pyramid of pain.** In 2013 the security researcher David Bianco drew the kinds of indicator as a pyramid. At the bottom are hash values. Above them come IP addresses, then domain names, then network and host artefacts such as a URL path or a registry key, then the attacker's tools, and at the top the attacker's ways of working, which are known by the words tactics, techniques and procedures. This ordering is called the {% include term.html t="pyramid-of-pain" %}.

The name says what the pyramid measures: how much pain defenders cause the attacker when they detect and block at that level. Block a hash value, and the attacker changes one byte. Block an address, and the attacker rents another. Recognise the behaviour itself, and the attacker must learn to work differently, which costs weeks or more.

The lesson for an examiner is about the list that you hand over. Give the exact indicators, because they are certain and quick to use. Then describe the behaviour in words, because it is the part that will still be true next month.

**Where the pyramid breaks.** It ranks by cost to the attacker, not by how sure a match is. A hash value sits at the bottom and is the most certain match there is. A description of behaviour sits at the top and matches honest programs too. A good list needs both ends.

**Sharing.** Organisations exchange indicators so that an attack on one of them becomes a warning for the others. There are agreed formats for this, of which STIX is the best known, and platforms on which indicators are collected and aged. For this module it is enough to know that your list should be exact, sourced and dated, so that it could be shared.

**Rules from indicators.** A confirmed indicator can become a rule: "alert when any of our computers asks for this name". This is how the collection of rules grows, and it is why rules for an attack often appear only after the attack has been studied.
</details>

<div class="box key" markdown="1">

An indicator of compromise is confirmed evidence of one attack that others can search for: an address, a domain name, a URL path, a hash value, a certificate, a JA3 or JA4 value. Good ones are specific, sourced and dated. The cheaper an indicator is for the attacker to change, the shorter its life.

</div>

## 8. The lab: from alerts to a judgement

Your task has five parts in one line each. You run Suricata over the capture of the infected computer and read its alerts. You check the top alerts against the packets and mark each one. You join the confirmed alerts to Zeek's flow records and write down the chain. You merge the confirmed alerts with your Session 5 timeline and judge what the result shows. And you build a list of indicators from confirmed evidence only.

You work in the Kali VM only. One VM is enough today. Allow about two hours.

<div class="box safety" markdown="1">

**This capture carries live malware inside its traffic. Four rules, with no exceptions.**

1. **The capture stays in Kali.** You unpack the archive inside the Kali VM, into `~/evidence/s08`, and nowhere else. Never copy the unpacked capture to the shared folder, to your host machine or to the Windows VM.
2. **Packet tools only.** You read it with Suricata, Zeek, tshark and Wireshark. These tools read packets and write text about them.
3. **Nothing is taken out of it.** No **Export Objects** in Wireshark, although Session 7 taught it. No NetworkMiner. No `foremost` and no other carving. Do not save any stream as a file.
4. **Do not switch any protection off.** If a virus scanner on your host machine warns about the archive or removes it, that is the scanner doing its job. Write down its message and tell the lecturer, who will give you the archive again in a way that reaches Kali directly. Until then, go on with the unit's pre-computed alerts and logs: they carry you through every step except the packet checks of Part D.

**Why so strict?** The programs that this computer downloaded are inside the capture, as data in packets. While they stay there they can do nothing: a packet tool does not run what it reads. The moment a tool writes one of them to disk as a file, a real malicious program exists on your computer, and Windows is what it was written for. Handling such files safely needs an isolated network and a snapshot to return to. Sessions 9 and 10 teach that, and until then no file leaves this capture.

**Why may a virus scanner react to the archive?** Scanners know the files of published malware collections by their hash values, and many treat any password-protected archive from such a site as suspicious. The password protection is there so that the archive can be moved and stored without a scanner or a careless click opening it.

</div>

<div class="box lms" markdown="1">

The archive with the capture, the pinned ruleset, the Suricata configuration, the pre-computed logs, the helper script, the two sheets, the evidence register and a blank custody record are in folder `S08` on the lab share. Copy the folder into `nb6018-share` on your host machine before you start. You also need your own `s05-timeline-utc.csv`, which has been in `nb6018-share` since Session 5. The lecturer gives you the password of the archive in class. If you are studying away from the lab, the LMS explains how to get the same files. Together they need less than 200 MB.

</div>

**The items.** Keep every file name exactly as it is.

| Exhibit | File | What it is |
|---|---|---|
| `S08-001` | `2025-01-22-traffic-analysis-exercise.pcap.zip` | The archive of the exercise, as published by malware-traffic-analysis.net, unchanged and password-protected. It holds one capture, `2025-01-22-traffic-analysis-exercise.pcap` |
| `S08-002` | `s08-pinned.rules`, with `classification.config` and `reference.config` | The unit's pinned snapshot of the Emerging Threats Open ruleset, joined into one file, and the two small files that give the rules their classes and references. The archive it was made from, `emerging.rules.tar.gz`, is beside it with its licence files |
| `S08-003` | `suricata-out/` | The `eve.json` and `fast.log` that the unit computed from exhibit `S08-001` with exhibit `S08-002`. Your fallback if Suricata cannot be installed |
| `S08-004` | `zeek-out/` | The Zeek logs that the unit computed from exhibit `S08-001`. Your fallback if Zeek cannot be installed |
| `S08-005` | `s08-fallback-s05-timeline-utc.csv` | A correct copy of the Session 5 timeline, made by the unit. Only for a student whose own file is missing |

**The network in the capture.** The exercise states it, and you may use it. The office network is `10.1.17.0/24`. Its domain is `bluemoontuesday.com`, its domain controller is `10.1.17.2`, and its gateway is `10.1.17.1`. The unit's configuration sets `$HOME_NET` to this network. Every date and time in the capture is from January 2025 and is shown as recorded.

**Four more files from the unit.**

- `s08-suricata.yaml` is the configuration for Suricata. It sets the home network, turns the Community ID on, writes `fast.log` and `eve.json`, and stores no files.
- `s08-tools.py` is the helper script. It counts alerts, starts your triage sheet, calculates Community IDs, joins alerts to flow records, converts alerts to the timeline format and merges two timelines.
- `s08-findings.csv` is the sheet for your ten findings.
- `s08-ioc-list.csv` is the sheet for your indicators.

### Part A: receive and verify

1. In the Kali VM, open a terminal. Create two folders, copy the files, and verify the archive and the rules file against the evidence register:

   ```bash
   mkdir -p ~/evidence/s08 ~/cases/s08
   cp -r /media/sf_nb6018/S08/* ~/evidence/s08/
   cd ~/evidence/s08
   sha256sum 2025-01-22-traffic-analysis-exercise.pcap.zip s08-pinned.rules s08-suricata.yaml
   ```

   <div class="box expect" markdown="1">

   Three SHA-256 values. Each equals the value in `s08-evidence-register.md`. Write the entries in the custody record: received, and verified on receipt.

   </div>

   <div class="box trouble" markdown="1">

   If Kali says "Permission denied" for `/media/sf_nb6018`, repeat the last part of Step 5 in Session 0. If a value does not match, copy that file again. If the archive is missing from the shared folder, a virus scanner on your host machine may have removed it: read rule 4 of the safety box.

   </div>

2. Unpack the capture inside Kali, verify it, protect it from changes, and read its first and last time:

   ```bash
   cd ~/evidence/s08
   7z x 2025-01-22-traffic-analysis-exercise.pcap.zip
   sha256sum 2025-01-22-traffic-analysis-exercise.pcap
   chmod a-w 2025-01-22-traffic-analysis-exercise.pcap
   TZ=UTC capinfos -a -e -c 2025-01-22-traffic-analysis-exercise.pcap
   ```

   <div class="box expect" markdown="1">

   `7z` asks for the password and then writes one file. Its SHA-256 value equals the value for the capture in the evidence register. `capinfos` prints the number of packets and the time of the first and of the last packet. Because of `TZ=UTC` these are UTC times, on 22 January 2025. Write both into your notes: they are finding `F1`.

   </div>

   <div class="box trouble" markdown="1">

   If `7z` is not found, use `unzip 2025-01-22-traffic-analysis-exercise.pcap.zip`, which also asks for the password. If the password is refused, check for a space at its end. Do not unpack the archive on your host machine "to see whether it works".

   </div>

### Part B: run Suricata with the pinned rules

{:start="3"}
3. Check that Suricata is installed, and record its version:

   ```bash
   suricata -V
   ```

   <div class="box expect" markdown="1">

   One line, such as `This is Suricata version 8.0.7 RELEASE`. Your number may differ. Write it into the custody record. The alerts of a capture depend on the tool's version and on the ruleset, so both belong in your notes.

   </div>

   <div class="box trouble" markdown="1">

   The check of Session 0 said that Suricata arrives in Session 8. If the command is not found, install it with `sudo apt update && sudo apt install suricata`. This needs the internet once. Do **not** run `suricata-update`: that command downloads today's rules from the internet, and your alerts would then differ from everybody else's. If Suricata cannot be installed, use exhibit `S08-003`: `mkdir -p ~/cases/s08/suricata && cp ~/evidence/s08/suricata-out/* ~/cases/s08/suricata/`, go on with step 5, and record that the alerts are the unit's.

   </div>

4. Run Suricata over the capture. Start it from the folder that holds the configuration and the rules:

   ```bash
   cd ~/evidence/s08
   mkdir -p ~/cases/s08/suricata
   TZ=UTC suricata -c s08-suricata.yaml -S s08-pinned.rules -r 2025-01-22-traffic-analysis-exercise.pcap -l ~/cases/s08/suricata -k none
   ls -l ~/cases/s08/suricata
   ```

   <div class="box expect" markdown="1">

   For up to a minute Suricata loads the rules and seems to do nothing. Then it prints a line that says how many rules were loaded, and at the end a line that says how many packets it read from one file. That number equals the packet count of step 2. The folder now holds `eve.json`, `fast.log` and `suricata.log`. The options mean: `-c` the configuration, `-S` this rules file and no other, `-r` read a capture file, `-l` where to write, and `-k none` do not reject packets whose checksums look wrong.

   </div>

   <div class="box trouble" markdown="1">

   If Suricata says that some rules failed to load, read on: a few rules of a large collection may use a keyword that your version does not know, and the run is still valid. Note the two numbers. If it says that it cannot open `classification.config`, you did not start it from `~/evidence/s08`. If it says that the logging directory does not exist, run the `mkdir` line again. If `fast.log` is empty, check that you typed `-S` as a capital letter and the name of the rules file correctly.

   </div>

### Part C: read the alerts

{:start="5"}
5. Read `fast.log`, in order of time:

   ```bash
   cd ~/cases/s08/suricata
   wc -l fast.log
   sort fast.log | head -n 15
   ```

   <div class="box expect" markdown="1">

   The number of alerts, then the first fifteen, one line each: the time, the three numbers in square brackets, the message, the class, the priority, the protocol, and the two addresses with their ports. The times are UTC, because you started Suricata with `TZ=UTC`. Many lines repeat the same message. Look at the addresses on the left side of the arrows: one office address appears again and again.

   </div>

   <div class="box trouble" markdown="1">

   The lines of `fast.log` are not always in the order of time, which is why the command sorts them. If the times are several hours away from the times of step 2, Suricata ran without `TZ=UTC`: delete the three output files and repeat step 4.

   </div>

6. Read one alert in `eve.json`, then count the alerts for each rule:

   ```bash
   jq 'select(.event_type=="alert")' eve.json | head -n 45
   jq -r 'select(.event_type=="alert") | "\(.alert.signature_id)\t\(.alert.signature)"' eve.json | sort | uniq -c | sort -nr
   ```

   <div class="box expect" markdown="1">

   First, one whole alert record, spread over many lines. Find `timestamp`, `pcap_cnt`, the two addresses and ports, `community_id`, and inside `alert` the fields `signature_id`, `signature`, `category` and `severity`. Then a table with one line for each rule that fired: how often, its rule ID and its message. A few rules fired many times and many fired once. Count the lines of the table: that is the number of different rules. With the total of step 5 it is finding `F2`.

   </div>

   <div class="box trouble" markdown="1">

   If `jq` prints an error about the quotes, type the command again and take care with the single and double quotes. The helper gives the same table: `python3 ~/evidence/s08/s08-tools.py alerts eve.json`. If there is no `community_id` in the record, Suricata did not use the unit's configuration: repeat step 4 with `-c s08-suricata.yaml`.

   </div>

7. Start your triage sheet. It gets one row for each rule that fired:

   ```bash
   python3 ~/evidence/s08/s08-tools.py triage eve.json ~/cases/s08/s08-triage.csv
   column -s, -t ~/cases/s08/s08-triage.csv | cut -c1-150 | head -n 20
   ```

   <div class="box expect" markdown="1">

   A new file with eight columns: `sid`, `rule_message`, `alerts`, `first_utc`, `last_utc`, `example`, `verdict` and `reason`. The last two are empty. They are yours to fill in Part D. The column `example` shows the addresses and ports of the first alert of that rule.

   </div>

   <div class="box trouble" markdown="1">

   The script refuses to write over an existing sheet, so that it cannot destroy your work. If you want to start again, rename the old file first.

   </div>

### Part D: check the alerts against the packets

{:start="8"}
8. Find the computer that the alerts point to, and what the capture says about it. Put the address from the first command in place of `ADDRESS` in the second:

   ```bash
   jq -r 'select(.event_type=="alert") | .src_ip, .dest_ip' eve.json | sort | uniq -c | sort -nr | head -n 6
   tshark -r ~/evidence/s08/2025-01-22-traffic-analysis-exercise.pcap -Y "ip.src == ADDRESS && (dhcp.option.hostname || kerberos.CNameString)" -T fields -e eth.src -e dhcp.option.hostname -e kerberos.CNameString | sort | uniq -c
   ```

   <div class="box expect" markdown="1">

   The first command counts how often each address appears in the alerts. One address of the office network `10.1.17.0/24` is far ahead of the others. The second command shows, for that address, the MAC address of its frames and the names that the computer itself sent: its host name, when it asked for a network address, and names from its logons to the domain. A name that ends with `$` is the computer's own account. A name without it is a user account. Write the IP address, the MAC address and the host name into your notes: finding `F3`.

   </div>

   <div class="box trouble" markdown="1">

   If the second command prints nothing, try the two parts one at a time: `-Y "dhcp.option.hostname"` without the address, then `-Y "ip.src == ADDRESS && kerberos.CNameString"`. If your notes now say that the person with that account name did something, stop and read section 8 of Session 7 again. The capture shows a device and an account. It shows no person.

   </div>

9. Check the rules, one at a time. Begin with the rules whose message starts with `ET MALWARE`, then the others with priority 1, then the rules that fired most often, until you have checked at least six rules. For each rule, do these four things. Put the rule ID in place of `SID` and a packet number in place of `NUMBER`.

   ```bash
   grep "sid:SID;" ~/evidence/s08/s08-pinned.rules
   jq -r 'select(.event_type=="alert" and .alert.signature_id==SID) | [.timestamp, .pcap_cnt, .src_ip, .src_port, .dest_ip, .dest_port, .community_id] | @tsv' eve.json | head -n 5
   wireshark ~/evidence/s08/2025-01-22-traffic-analysis-exercise.pcap &
   ```

   In Wireshark choose **View**, **Time Display Format**, **UTC Date and Time of Day**. Then choose **Go**, **Go to Packet**, type the packet number from the column `pcap_cnt`, and press Enter. Read the layers of that packet. Then right-click it and choose **Follow**, **TCP Stream**, and read what was asked and what came back. Close the stream window when you have read it.

   <div class="box expect" markdown="1">

   `grep` prints the whole rule. Read it as section 3 taught: which options test the traffic, and what does the message claim? `jq` prints up to five alerts of that rule, each with its time, its packet number, its addresses and ports, and its Community ID. In Wireshark, the packet with that number holds the thing that the rule describes: the path, the name, the program name or the bytes. The stream shows whether the server answered and how much it sent. You now have what you need for the five checks of section 4.

   </div>

   <div class="box trouble" markdown="1">

   If the stream is unreadable signs, the connection is encrypted or carries a program and not text. Do not save it. Read what section 6 of Session 7 says is still visible, and consider the mark "unclear". If the packet seems to have nothing to do with the rule, the rule may have matched on an earlier packet of the same stream: follow the stream and look for the text of the rule there. If Wireshark's time is not UTC, set the time display format again. Do **not** open **File**, **Export Objects** today.

   </div>

10. Fill the sheet. Open `~/cases/s08/s08-triage.csv` in a text editor, for example with `mousepad ~/cases/s08/s08-triage.csv`. For every rule that you checked, write `confirmed`, `false positive` or `unclear` into the column `verdict`, and a few words into `reason`. Then give the rules that you did not open a mark as well: for most of them, the message and the example are enough to decide, and if they are not, the honest mark is `unclear`.

    <div class="box expect" markdown="1">

    Every row has a verdict and a reason. Several rules are confirmed: they describe steps of one infection on the computer of step 8. Some rules reported things that are normal on a Windows network, and you marked them as false positives for the question "is this part of the attack?". Your notes hold the rule IDs that you confirmed, which is finding `F4`, and one rule that you did not confirm, with your reason, which is finding `F5`.

    </div>

    <div class="box trouble" markdown="1">

    If a reason holds a comma, put the whole reason inside double quotes. If you marked every rule as confirmed, look again at the rules whose message begins with `ET INFO` or `ET POLICY`, and ask for each: what does this rule claim, and would honest software do the same?

    </div>

### Part E: Zeek, the join and the chain

{:start="11"}
11. Run Zeek over the same capture:

    ```bash
    zeek --version
    mkdir -p ~/cases/s08/zeek && cd ~/cases/s08/zeek
    zeek -C -r ~/evidence/s08/2025-01-22-traffic-analysis-exercise.pcap protocols/conn/community-id-logging || zeek -C -r ~/evidence/s08/2025-01-22-traffic-analysis-exercise.pcap
    ls
    ```

    <div class="box expect" markdown="1">

    A version line, and after a short wait a set of logs, among them `conn.log`, `dns.log`, `http.log` and `ssl.log`. The first form of the command asks Zeek to write a Community ID into `conn.log`. Zeek can do that from version 6. An older Zeek prints an error about a script that it cannot load, and then the second form runs without it. Both are fine: the next step gives every flow record a Community ID. Write the Zeek version into the custody record.

    </div>

    <div class="box trouble" markdown="1">

    If `zeek` is not found, install it with `sudo apt install zeek`, as in Session 7, or use the unit's logs: `cp ~/evidence/s08/zeek-out/*.log .` and record that the logs are exhibit `S08-004`. Zeek writes its logs into the folder where you start it, so check that you are in `~/cases/s08/zeek`.

    </div>

12. Give every flow record its Community ID, and test the join key on one alert. Take one Community ID from your `jq` output of step 9 and put it in place of `ID`:

    ```bash
    python3 ~/evidence/s08/s08-tools.py cid conn.log > conn-cid.tsv
    head -n 3 conn-cid.tsv
    grep -F "ID" conn-cid.tsv
    ```

    <div class="box expect" markdown="1">

    The script says how many flow records it read, how many Community IDs it took from the log and how many it calculated. `conn-cid.tsv` has one line for each flow record, with the start time in UTC, the two addresses and ports, the protocol, the service, the duration, the bytes sent and received, and the Community ID. `grep` then prints the flow record of your alert: the same two addresses and ports, and a start time at or just before the time of the alert. Two tools that never spoke to each other gave the same connection the same code.

    </div>

    <div class="box trouble" markdown="1">

    If `grep` prints nothing, check that you copied the whole code, from `1:` to the `=` at the end. The option `-F` matters: the code contains `+` and `/`, which `grep` would otherwise read as special signs. If it still prints nothing, join by hand as section 5 describes: search `conn-cid.tsv` for the server's address and port and compare the times.

    </div>

13. Join all alerts to their flow records:

    ```bash
    python3 ~/evidence/s08/s08-tools.py join ../suricata/eve.json conn.log > ~/cases/s08/s08-joined.csv
    column -s, -t ~/cases/s08/s08-joined.csv | cut -c1-170 | head -n 25
    ```

    <div class="box expect" markdown="1">

    One row for each rule and flow: the time of the alert, the rule ID, the message, the two ends, how the row was joined, and then what the flow record adds, which is its start time, the service, the duration and the bytes in each direction. The script reports how many rows it joined and how many alerts have no flow record. For your confirmed rules, read the bytes: a row with a few hundred bytes sent and very many received has the shape of a download.

    </div>

    <div class="box trouble" markdown="1">

    A few alerts may have no flow record, for example alerts on packets that belong to no connection that Zeek tracked. Note them and go on. If most alerts have none, you joined logs of a different capture: check the folder.

    </div>

14. Read the chain. List everything that the computer of step 8 did, in order of time, and read the minutes around your first confirmed alert. Put its address in place of `ADDRESS`:

    ```bash
    python3 ~/evidence/s08/s08-tools.py hostlog . ADDRESS > ~/cases/s08/s08-hostlog.txt
    wc -l ~/cases/s08/s08-hostlog.txt
    less ~/cases/s08/s08-hostlog.txt
    ```

    In `less`, type `/` and the first minutes of the time of your first confirmed alert, for example `/T19:4`, to jump there. Press `q` to leave.

    <div class="box expect" markdown="1">

    One line for each lookup, web request, TLS connection and other connection of that computer, with the time in UTC and the log that it comes from. Before your first confirmed alert you find DNS lookups, and one of them asks for a name that an office computer has no ordinary reason to ask for. Then comes a web request that fetches something from an address, and it matches your alert. After it, requests to the same or a new server repeat again and again. Write the three steps into your notes with their times: the lookup, which is finding `F6`, the download, which is finding `F7`, and the contact, which is finding `F8`. For the download, add the Community ID from step 12 or 13.

    </div>

    <div class="box trouble" markdown="1">

    If you prefer Zeek's own tool, `cat dns.log | zeek-cut -u ts id.orig_h query answers` and `cat http.log | zeek-cut -u ts id.orig_h host uri user_agent` show the same lines. If the file has thousands of lines, most are ordinary work of a Windows computer in a domain. Search for the address of the server in your confirmed alert, and read upwards and downwards from there. If one step of the chain is inside TLS, `ssl.log` still gives the server name: say in your notes that the content of that step was not visible.

    </div>

### Part F: the timeline and the judgement

{:start="15"}
15. Find your Session 5 timeline, record its hash value, and convert your confirmed alerts into its format:

    ```bash
    cd ~/cases/s08
    sha256sum /media/sf_nb6018/s05-timeline-utc.csv
    python3 ~/evidence/s08/s08-tools.py convert suricata/eve.json s08-triage.csv s08-alerts-utc.csv
    head -n 3 s08-alerts-utc.csv
    ```

    <div class="box expect" markdown="1">

    The SHA-256 value of your own timeline: write it down. The script then says how many rows it wrote, from how many confirmed rules, in which zone the alert file had written its times, and which rules it left out because you did not confirm them. The new file begins with the seven column names of Session 5, and each row holds one alert: its time in UTC, `IDS alert`, the source file, `ids alert`, a description with the rule ID, the message, the two ends and the Community ID, the original zone, and the tag `confirmed-alert`.

    </div>

    <div class="box trouble" markdown="1">

    If your `s05-timeline-utc.csv` is not in the shared folder, use the unit's copy in every command of this part: `~/evidence/s08/s08-fallback-s05-timeline-utc.csv`. Record in your custody record that the timeline is exhibit `S08-005` and not your own work. If the script says that the sheet has no valid verdict for some rules, finish step 10 first.

    </div>

16. Merge the two timelines into a **new** file, and prove that your Session 5 file did not change:

    ```bash
    python3 ~/evidence/s08/s08-tools.py merge /media/sf_nb6018/s05-timeline-utc.csv s08-alerts-utc.csv s08-merged-timeline.csv
    sha256sum /media/sf_nb6018/s05-timeline-utc.csv
    cp s08-merged-timeline.csv /media/sf_nb6018/
    ```

    <div class="box expect" markdown="1">

    Three lines with the number of rows and the first and last time of each file. Then two lines that count the rows of one file inside the time span of the other, and a line that states whether the two spans overlap and how large the gap between them is. Then the hash value of your Session 5 file before and after, with the word "unchanged". Your own `sha256sum` prints the same value as in step 15. Note the three row counts and the count of alert rows inside the span of your timeline: finding `F9`.

    </div>

    <div class="box trouble" markdown="1">

    The script refuses to write its result over one of the two input files, and over any file that exists already. That is on purpose. If it reports a line of your timeline whose time is not in the right form, your file was changed after Session 5: use the unit's copy and record why. Never repair the Session 5 file by hand today.

    </div>

17. Read the merged file, and write your judgement in two sentences:

    ```bash
    head -n 4 s08-merged-timeline.csv | cut -c1-160
    tail -n 4 s08-merged-timeline.csv | cut -c1-160
    ```

    <div class="box expect" markdown="1">

    The first rows are from March 2015 and come from the suspect's computer. The last rows are from January 2025 and are your alerts. No row of one source lies between rows of the other. Your two sentences, finding `F10`, say what the comparison shows about this infection and the leak, and where that judgement stops. The first sentence names the two computers and the two dates. The second names one thing that the comparison does not show.

    </div>

    <div class="box trouble" markdown="1">

    If your first sentence says that malware played no part in the case, it is too wide: read "The limits of the exclusion" in section 6. If it says only that "nothing was found", it is too weak: the comparison found something definite about one infection.

    </div>

### Part G: the indicator list and the findings sheet

{:start="18"}
18. Build the indicator list. Copy the unit's sheet and fill it:

    ```bash
    cp ~/evidence/s08/s08-ioc-list.csv ~/evidence/s08/s08-findings.csv ~/cases/s08/
    chmod u+w ~/cases/s08/s08-ioc-list.csv ~/cases/s08/s08-findings.csv
    mousepad ~/cases/s08/s08-ioc-list.csv
    ```

    The sheet has six columns. `type` is one of `ip-address`, `domain`, `url-path`, `hash-value`, `certificate`, `ja3`, `ja4` or `other`. `value` is the plain value. `first_seen_utc` is the first time that your evidence shows it, in the form of the timeline. `source` is the log and the line or the rule ID that shows it. `confirmed_by` is what you checked: the packet number or the stream. `note` is free, for example how long you expect the indicator to stay useful.

    <div class="box expect" markdown="1">

    At least six rows, of at least three different types. Every row comes from a step of your chain or from a rule that you marked confirmed. No row holds an address or a name of the office network itself, of Microsoft's update and test services or of another honest service. The list has no hash value unless one of your logs gave you one, and then the source column names that log.

    </div>

    <div class="box trouble" markdown="1">

    If you have fewer than six, read your `s08-hostlog.txt` again around the chain: each step usually gives an address and a name, and the web requests give paths. If you are not sure whether a name belongs to the attack, it does not go on the list. Write it into your notes as "unclear" with the reason.

    </div>

19. Fill the findings sheet, check both sheets, and close the custody record. Open `~/cases/s08/s08-findings.csv` in the editor and fill the columns `answer` and `source` for each row.

    | Row | The question |
    |---|---|
    | `F1` | Exhibit `S08-001`: the time of the first and of the last packet, in UTC |
    | `F2` | The number of alerts in `eve.json`, and the number of different rules that fired |
    | `F3` | The computer that the alerts point to: its IP address, its MAC address and its host name |
    | `F4` | The rule IDs that you marked confirmed, with a space between them |
    | `F5` | One rule ID that you marked false positive or unclear, and your reason in a few words |
    | `F6` | The lookup: the name that the computer asked for, and the time in UTC |
    | `F7` | The download: the server's address and port, the time in UTC, and the Community ID of the flow |
    | `F8` | The contact: the address and port of each server that the computer then contacted again and again, and the time of the first contact in UTC |
    | `F9` | The merged timeline: the rows from your Session 5 timeline, the rows from the alerts, and the number of alert rows inside the time span of the Session 5 rows |
    | `F10` | Your judgement, in two sentences: what the comparison shows about this infection and the leak, and where it stops |

    ```bash
    python3 ~/evidence/s08/s08-tools.py check ~/cases/s08/s08-findings.csv ~/cases/s08/s08-ioc-list.csv
    cd ~/cases/s08 && sha256sum s08-findings.csv s08-ioc-list.csv s08-triage.csv s08-merged-timeline.csv
    cp s08-findings.csv s08-ioc-list.csv s08-triage.csv s08-joined.csv /media/sf_nb6018/
    ```

    <div class="box expect" markdown="1">

    The script says that the findings sheet has ten rows, each with an answer and a source, and how many rows the indicator list has. It checks the form only. It does not know the right answers. Four hash values follow, for your custody record. The record now lists the archive, the capture and the rules as verified, each tool with its version, and each file that you created: the alert files, the triage sheet, the Zeek logs, the joined table, the converted alerts, the merged timeline, the indicator list and the findings sheet. The unpacked capture is **not** among the files that you copy to the shared folder.

    </div>

    <div class="box trouble" markdown="1">

    If the script prints a line that begins with `PROBLEM`, it names the row and what is missing. If an answer needs a comma, put the whole answer inside double quotes. If you used the unit's alerts, logs or timeline, the custody record must say so for each one.

    </div>

### Checkpoint

Hand in `s08-findings.csv`, `s08-ioc-list.csv`, `s08-triage.csv`, `s08-joined.csv`, `s08-merged-timeline.csv`, your notes and your custody record. Your work passes when all five of these are true:

1. Your custody record shows the archive, the capture and the rules file as verified on receipt, and the hash value of your Session 5 timeline before and after the merge, unchanged.
2. Your confirmed alerts agree with the unit's key: every rule in `F4` is one that the key confirms, you found at least half of the rules that the key confirms, and each confirmed row of your triage sheet has a reason that names what you saw in the packets.
3. Your chain agrees with the key in at least two of the three steps `F6`, `F7` and `F8`: the name, the addresses and the ports are right, and the times are within one minute. `F7` holds a Community ID that joins to a flow record.
4. Your indicator list has at least six rows of at least three types, holds at least four of the key's core indicators, and holds nothing that the key lists as honest traffic. Every row has a source and a confirmation.
5. `F10` states that this infection, on another computer and almost ten years after the leak, cannot explain the leak, and it states at least one limit of that judgement. No answer names a person as responsible for anything.

The lecturer judges the sheets against the key that the unit recorded when it ran the same tools with the same pinned ruleset. Rule IDs, addresses, names and times are values in the evidence, so those rows are right or wrong. Your reasons, `F5` and `F10` are judged by reading.

This checkpoint helps with the coursework and the phase test. In the coursework you will correlate two kinds of cloud log into one timeline, and you will have to say what the logs confirm and what they cannot show. The habit of marking each claim as confirmed, false or unclear is the same.

### If you have time

**Read the server names of the encrypted connections.** `cat ~/cases/s08/zeek/ssl.log | zeek-cut -u ts id.orig_h id.resp_h server_name version | less` lists every TLS connection with the name from its handshake. Find the connections of the infected computer in the minutes before the download. Which names are ordinary for a browser, and which is not? Session 7 said why you can read these names although the content is encrypted.

**Compare the two outputs of one tool.** Count the alerts in `fast.log` and in `eve.json`. They are equal. Now find one thing that `eve.json` tells you about an alert that `fast.log` does not, and one reason why a person might still prefer `fast.log`.

**Measure the rhythm of the contact.** Take the times of the repeated requests of your chain from `s08-hostlog.txt` and work out the gaps between them. Are they regular? What would a person who browses the web produce in their place? You are describing behaviour, which is the kind of indicator that lasts longest.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. A manager says: "Our IDS has shown no alerts for a year, so we have had no intrusions." Give two reasons why this does not follow.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
An IDS sees only the traffic that passes its capture point, so anything that took another road, or that was inside encryption, raised no alert. And signature-based detection has rules only for known patterns, so a new or changed attack is a false negative. The points that earn marks: (1) limited to the capture point or to visible content; (2) no rule for unknown attacks, or a threshold that was not crossed; (3) silence is therefore not evidence of absence.
</details>

**2. State one advantage and one risk of running a system as an IPS and not as an IDS.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
An IPS stands in the path of the traffic, so it can block a known attack before it arrives, while an IDS can only report it afterwards. The risk is that a false positive blocks honest traffic and stops work, and that a failure of the IPS can stop the network. The points that earn marks: (1) an IPS is in the path and can block; (2) a wrong rule blocks honest traffic; (3) a sensible remark on failure or on testing rules in detection mode first.
</details>

**3. A rule begins `alert tls $HOME_NET any -> $EXTERNAL_NET 443` and its message begins "ET INFO". Before you read the options, what do you already know about an alert from it?**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The alert concerns a TLS connection from a computer of the home network to an outside address on port 443, and Suricata only wrote an alert and let the traffic pass. The words "ET INFO" say that the author reports something that happened and is often normal, and not a known attack. The points that earn marks: (1) action, protocol, direction and ports read correctly; (2) the traffic was not blocked; (3) the message class makes a weak claim that must be checked.
</details>

**4. An analyst has an alert and a `conn.log`, and neither holds a Community ID. Describe how to find the flow record of the alert, and name one way in which this join can go wrong.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Search the flow records for the same two addresses, the same two ports and the same protocol, in either order, with a start time close to the time of the alert. The join can pick the wrong record or none when the two tools' clocks differ, or when the same computer used the same port for that server more than once. The points that earn marks: (1) the five values; (2) a time window; (3) a correct way of failing.
</details>

**5. A student converts alerts to the timeline format and takes the times from `fast.log`. Suricata ran on a laptop set to local time. What goes wrong, and which file avoids it?**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The times in `fast.log` are local times with no zone written beside them, so the rows enter the timeline shifted by the laptop's offset from UTC and sort into the wrong place. `eve.json` writes the offset in every timestamp, so each time can be normalised to UTC safely. The points that earn marks: (1) `fast.log` has local time without a zone; (2) the rows are shifted by the offset; (3) `eve.json` carries the offset, or the tool is run with its clock set to UTC.
</details>

**6. After an incident an examiner hands over two indicators: the hash value of a downloaded program and the domain name that the malware contacted. Compare how long each is likely to stay useful, and say why.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The hash value matches only that exact file, and the attacker can change one byte in seconds, so it may be useless within hours although a match is certain. The domain name costs the attacker more to replace, because a new name must be registered and set up, so it usually stays useful for longer. The points that earn marks: (1) a hash value is exact and very cheap to change; (2) a domain name costs more to change; (3) the link between cost to the attacker and useful life.
</details>

**7. An examiner finds that malware reached a company computer in June. The data in question left the company in March of the same year, from a different computer. Write the sentence for the report, and one limit.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
"The malware found on computer B first appears in the evidence in June, three months after the transfer of March, which came from computer A, so this infection cannot have caused that transfer." The limit: this says nothing about whether computer A itself was infected in March, which needs an examination of computer A. The points that earn marks: (1) different computer and later date, stated from the evidence; (2) the exclusion is limited to this infection; (3) what further evidence would answer the wider question.
</details>

<div class="quiz" markdown="1">

## End-of-day quiz

This quiz closes Day 4 and covers Sessions 7 and 8. Write each answer in about two sentences before you open the model answer. Mark yourself on the points you made.

<div class="sa" markdown="1">

**Q1.** A file was sent over TCP, and a capture holds the transfer. Explain why a tool can rebuild the file exactly from the capture, and what the result is if the capture point dropped one packet from the middle of the transfer. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
TCP numbers the data that it sends, so a tool can put the pieces from many packets back into sending order and join them into the stream, from which the file is cut. If one packet is missing from the capture, the stream has a hole, so the rebuilt file is damaged or is not written at all, although the real transfer was complete. **Points:** (1) the numbering of TCP allows reassembly in order; (2) a missing packet leaves a hole, so the file is damaged or missing; (3) the gap is in the copy, not in the transfer, or the hash value will not match the original.
</details>

</div>

<div class="sa" markdown="1">

**Q2.** A company kept only flow records. For one office computer they show, on a Sunday at 02:10 UTC, 310 MB sent and 2 MB received in one flow to an address that no computer of the company had contacted before, on port 443. State what an examiner may report from this, and what she may not. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
She may report that a device which held that address sent about 310 MB to that outside address and port at that time, and that the volume, the direction, the new destination and the hour are all unusual for the office, which has the shape of an upload. She may not report what was sent, which program sent it or who did it, because a flow record holds no content and names no person. **Points:** (1) the facts of the record: who, to where, when, how much; (2) why it is unusual, with at least two of volume, direction, destination and time; (3) no content, no program and no person can be stated.
</details>

</div>

<div class="sa" markdown="1">

**Q3.** An organisation uses only signature-based detection with rules that are updated every day. Describe one kind of attack that it will probably catch and one that it will probably miss, and name the kind of error that the miss is. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
It will probably catch an attack that has been seen before and for which a rule was written, such as known malware that contacts its server in a known way. It will probably miss an attack that is new, or a known one that was changed so that no rule matches, and that miss is a false negative. **Points:** (1) known patterns are caught, because a rule describes them; (2) new or changed attacks match no rule; (3) the term false negative, used correctly.
</details>

</div>

<div class="sa" markdown="1">

**Q4.** An IDS raises one alert with the message "ET MALWARE Example Loader Download" for a web request from an office computer. Name two checks that the examiner makes in the capture before reporting it, and say what the alert is until then. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
Until it is checked, the alert is a hypothesis: it shows that traffic matched a rule, and the message is only the rule author's label. The examiner reads the rule to see what it really tested, opens the packet to see that the matched content is there, and follows the stream or the flow record to see whether the server answered and how much came back. **Points:** (1) the alert is a hypothesis or an inference, not a finding; (2) one correct check, such as reading the rule or opening the packet; (3) a second correct check, such as the answer of the server, the flow record or what followed.
</details>

</div>

<div class="sa" markdown="1">

**Q5.** Confirmed alerts about computer B, dated January 2025, are merged in UTC with a timeline of computer A that covers four days in March 2015. Describe what the merged file looks like, what it allows the examiner to conclude, and one thing that it does not show. *(3 marks)*

<details class="answer" markdown="1"><summary>Check your answer</summary>
The merged file has two separate blocks, with every row of computer A before every alert and a gap of almost ten years, and no row of one source inside the time span of the other. The examiner may conclude that this infection of computer B cannot explain what happened on computer A in 2015. It does not show whether computer A was itself infected at that time. **Points:** (1) two blocks, no interleaving, a gap of years; (2) the correlation excludes this infection as a cause; (3) a correct limit, such as the state of computer A in 2015 or the need for both clocks to be right.
</details>

</div>

</div>

## Coming next

Today you never looked inside the programs that the infected computer downloaded. You saw that something arrived and what the computer did afterwards, and you left every file where it was. Day 5 opens the question that the wire cannot answer: what is such a program, and what can it do? Session 9 begins with the rules for handling a suspicious program safely, in an isolated network with a snapshot to return to, and then reads a training sample without running it.
