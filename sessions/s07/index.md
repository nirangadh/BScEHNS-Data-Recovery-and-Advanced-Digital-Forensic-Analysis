---
session_code: S07
description: "What a packet capture holds at each layer, why the capture point decides how complete it is, what flow records and encrypted traffic still show, how files are recovered from traffic, how exfiltration is spotted, and why an address identifies a device and not a person."
hook: >-
  Confidential files left our client's building. The disk showed what the suspect prepared. If the network had been watched,
  what would the wire have recorded, and how far would that record take us towards a name?
outcomes:
  - "Explain what a packet capture holds at the data link, network and transport layers, and what each layer can and cannot tell an examiner"
  - "Compare port mirroring (SPAN) with a network TAP as capture points, and justify why a capture is only as complete as the point where it was taken"
  - "Explain what a NetFlow or IPFIX flow record holds, and identify what it does not hold"
  - "Identify what stays visible when traffic is encrypted with TLS 1.2, with TLS 1.3 and with Encrypted Client Hello"
  - "Apply Wireshark, NetworkMiner and Zeek to reassemble a stream, recover transferred files, verify them with hash values and summarise the flows"
  - "Identify the signs of exfiltration in traffic, including the indicators of DNS tunnelling"
  - "Justify why an IP address or a MAC address identifies a device on a network at a time, and not a person"
before:
  - "Explain what a [hash value and verification](../s01/#3-the-hash-value-showing-that-nothing-changed) prove (Session 1)"
  - "Explain [file carving by a file signature](../s03/#1-carving-finding-a-file-by-its-shape) (Session 3)"
  - "Explain what [entropy](../s04/#3-no-signature-but-not-nothing-entropy) says about data (Session 4)"
  - "Explain what a [network connection in memory](../s06/#6-what-a-running-process-carries) shows, and the [order of volatility](../s06/#2-the-order-of-volatility-collect-first-what-dies-first) (Session 6)"
demos:
  - id: S07-D1
    title: "SPAN versus TAP under load"
    file: s07-d1-span-versus-tap.html
    teaches: "A mirror port squeezes both directions of a link into one port and drops copies silently when the load rises, while a TAP gives each direction its own output and keeps every frame."
  - id: S07-D2
    title: "Packets fold into a flow record"
    file: s07-d2-packets-to-flow-record.html
    teaches: "Many packets become one line per direction that keeps the addresses, ports, protocol, times and counts, and loses all content and the detail of each packet."
  - id: S07-D3
    title: "From a stream to a file"
    file: s07-d3-stream-to-file.html
    teaches: "Reassembly puts the pieces of a transfer back in sending order, and a file can then be carved from the stream by its file signature."
  - id: S07-D4
    title: "What TLS leaves visible"
    file: s07-d4-tls-what-stays-visible.html
    teaches: "Encryption hides the content but not the handshake fields sent before the keys exist, and which fields those are depends on the TLS version."
  - id: S07-D5
    title: "DNS tunnelling beside normal lookups"
    file: s07-d5-dns-tunnelling-indicators.html
    teaches: "Data hidden in DNS must travel inside the names, which leaves four marks: long random-looking labels, many unique names under one domain, unusual record types and a steady rate."
slides: s07-network-evidence-exfiltration.pptx
evidence: "the lab share, folder `S07` (the lab steps say exactly which files)"
---

Session 6 ended with one end of a {% include term.html t="network-connection" %}: a {% include term.html t="process" %} on one computer, and an address and a port on another. Memory told you which program was talking. It could not tell you what was said. Today you move to the wire.

The unit owes you one plain statement first. **Our case has no network traffic.** The client was not recording its network when the suspect worked there, so nobody can replay what his computer sent. The NIST material for the case contains disk images and nothing from the network.

So today is method training, and this page says so every time. You learn on two networks from the unit's teaching library that were recorded in full. The warm-up is **Nitroba**, a small made-up university case. The main exercise is a part of the traffic of **M57-Patents**, a made-up company from the same M57 library as the rehearsal case of Session 3. Neither capture is the suspect's traffic, and neither is the traffic of the person he worked with.

The link to the case is this. The suspect's own channels, email to the other party and a personal cloud storage service, are the kind of traffic that this session teaches you to find, and Session 14 examines them from his disk.

## 1. What a capture is

### The idea

Two computers talk by sending each other small units of data. Each unit is a {% include term.html t="packet" %}. A web page, an email or a file is cut into many packets, and each packet travels by itself.

Now put a recorder at one point of the network. It copies every packet that passes, writes the exact time beside each copy, and saves all of them in one file. That file is a {% include term.html t="packet-capture" %}. Many people call it a "pcap", after the usual file ending.

A packet capture is the most complete network evidence that exists. It holds every byte that passed that point, in both directions. Session 1 called the second stage of a forensic investigation examination. This is the network part of that stage.

### How it works

Every packet has two parts. At the front is addressing information: where the packet comes from, where it goes, and which program it is for. Behind that is the data that the packet carries, for example a piece of a file.

The addressing information is not one block. Each layer of the network adds its own part to the front, and each such part is a {% include term.html t="packet-header" %}. Section 2 opens these parts one by one.

The rules by which two programs exchange data are a {% include term.html t="protocol" %}. There is a protocol for web pages, one for sending email, one for asking the name of a server. A capture tool knows several hundred protocols and can show each packet in the terms of its protocol.

The tool of this session is **Wireshark**. It is free and open-source, and it is the standard tool of the field. It opens a capture and shows one line for each packet. Its command-line partner is **tshark**.

| A capture gives you | A capture does not give you |
|---|---|
| Every packet that passed the {% include term.html t="capture-point" %}, with its time | Anything that took another road through the network |
| The content, when it was not encrypted | The content of encrypted traffic |
| Addresses and ports of both ends | The program that sent the packet. Session 6 got that from memory |
| The order and the size of everything | The person at the keyboard |

Network traffic is also {% include term.html t="volatile-evidence" %}, and of the shortest-lived kind. A packet exists on the wire for less than a second. If nobody recorded it, it is gone. This is why the client's missing capture cannot be made later, and why Session 1 asked for {% include term.html t="forensic-readiness" %}: an organisation must decide to record before the incident.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The capture shows what the network did." | "The capture shows what passed one point of the network." | Other traffic took other roads. Section 3 is about this. |
| "The packet's payload" | "The data that the packet carries" | Wireshark and many books say payload. On this portal, payload keeps its meaning from Session 4: the data hidden in a cover file. |
| "The header of the packet" | "The packet header" | The single word header keeps its meaning from Session 3: the first bytes of a file. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">A company starts to record its network traffic one day after an employee is suspected of sending files out. What can the new capture show about the day of the suspected transfer?</p>
  <ul class="qc-opts">
    <li data-key="a">Everything, because the packets are still stored in the switches</li>
    <li data-key="b">Nothing, because packets that nobody recorded when they passed no longer exist</li>
    <li data-key="c">Only the encrypted packets, because those are kept longer</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A packet exists only while it travels. Network devices pass packets on and do not keep them, so option (a) is wrong. Encryption has nothing to do with how long a packet exists, so option (c) is wrong.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The capture file itself: formats, the snap length and the clock</summary>

**Two formats.** The older format has the file ending `.pcap`. The newer one, pcapng, can also store which network adapter saw each packet, comments and other details. Wireshark saves pcapng unless you choose otherwise, and it reads both. Some other tools read only the older format. You will meet this in the lab.

**The snap length.** A recorder can be told to keep only the first bytes of every packet, to save space. The limit is called the snap length. A capture taken with a short snap length holds the addressing information and little or none of the carried data. The capture file records the limit, and Wireshark shows it under **Statistics**, **Capture File Properties**.

**Whose clock?** The time beside each packet comes from the clock of the recording computer. If that clock was wrong, every time in the capture is wrong by the same amount. Capture files store time as a count of seconds in {% include term.html t="utc" %}, and the tool then shows it in the time zone of your own computer unless you tell it to show UTC. Session 5 taught why you must know which of the two you are reading.

**A capture is a file like any other.** It gets a {% include term.html t="hash-value" %} when it is made and an entry in the {% include term.html t="evidence-register" %}, and everyone works on a copy.
</details>

<div class="box key" markdown="1">

A packet capture holds every packet that passed one point, with its time. It is complete for that point, and silent about everything else.

</div>

## 2. What a capture holds, layer by layer

### The idea

Open one packet in Wireshark and you see several parts, one under the other. Each part belongs to one layer of the network, and each layer answers a different question.

Think of one packet that carries a piece of a file from an office computer to a server on the internet. The lowest layer says which two network adapters on the local network passed it between them. The next says which two devices, anywhere in the world, are the real sender and receiver. The next says which two programs. Only then comes the piece of the file.

An examiner reads the layers from the bottom up, and asks at each one: what does this tell me, and what can it not tell me?

### How it works

**The physical layer.** This is the cable, the fibre or the radio signal. A capture taken from a cable holds almost nothing of it: the signals have already been turned into bytes. Its forensic meaning is the place itself. Somebody had to connect a recorder at one physical point, and that point decides everything else.

**The data link layer: frames and MAC addresses.** On a local network a packet travels inside a {% include term.html t="frame" %}. The frame names two hardware addresses, the sender's and the receiver's. Such an address is a {% include term.html t="mac-address" %}, written like `00:1a:2b:3c:4d:5e`. The maker of a network adapter sets it, and its first half shows the maker.

A MAC address is used only inside one local network. When a packet crosses a router, the router takes it out of its frame and builds a new frame for the next network, with its own MAC address as the sender. So a capture shows the MAC address of a user's device only when it was taken inside that device's own local network. Taken anywhere else, every frame seems to come from a router.

**The network layer: IP addresses.** Inside the frame is the part that crosses networks. It names two addresses that stay the same for the whole journey: the source and the destination {% include term.html t="ip-address" %}. An address such as `192.0.2.10` is the older form, IPv4. The newer form, IPv6, is longer and written in hexadecimal.

An IP address belongs to a network, which lends it to a device. Many networks lend addresses for hours or days and then hand them to another device. And most offices and homes use private addresses inside, which a router replaces with one shared public address on the way out. Section 8 returns to both facts, because they decide what an address can prove.

**The transport layer: ports, TCP and UDP.** One computer runs many programs that use the network at once. A {% include term.html t="port" %} is the number that says which program a packet is for. A web server listens on port 443 or 80, a mail server on port 25, a name server on port 53. The program that starts a conversation picks a high port for itself, such as 49152.

Two transport protocols carry almost all traffic.

| | {% include term.html t="tcp" %} | {% include term.html t="udp" %} |
|---|---|---|
| Before data is sent | Sets up a connection in three steps | Nothing. It just sends |
| Order | Numbers every byte, so the receiver can put the data in order | No numbering |
| Lost data | Is noticed and sent again | Is not noticed by the protocol |
| Typical use | Web pages, email, file transfer | Name lookups, live voice and video |
| For the examiner | The numbering lets a tool rebuild exactly what was sent | Each message stands alone |

**Above the transport layer** is the application's own protocol, and inside it the content: the web page, the email, the file.

Here is the whole picture, as the examiner uses it.

| Layer | What the capture shows | What it can tell | What it cannot tell |
|---|---|---|---|
| Physical | Nothing directly | Where the recorder was connected | Anything about content |
| Data link | Frames with two MAC addresses | Which adapter sent the frame on this local network, and its maker | Anything beyond the nearest router. Who used the adapter |
| Network | Two IP addresses | Which two devices are the ends of the journey, as the network numbered them at that time | Which physical device held the address, without the network's own records |
| Transport | Two ports, TCP or UDP, the numbering of the data | Which kind of service was probably used, and how much was sent in which direction | Which program really sent it. A port number is a custom, not a proof |
| Application | The protocol and, if not encrypted, the content | What was said and which files were sent | The meaning and the purpose. Whether a person or a program did it |

<div class="box metaphor" markdown="1">

**The comparison.** A packet is like a letter inside an envelope inside a courier's bag.

**Why it fits.** The letter is the data that the packet carries. The envelope names the sender's and the receiver's postal address: these are the IP addresses, and they stay the same for the whole journey. The line "for the accounts office" on the envelope is the port: it says who in the building should get it. The courier's bag carries the letter for one stage only, from this depot to the next, and its label names just those two depots: that is the frame with its MAC addresses.

**Where it breaks.** A postal envelope reaches the receiver as the sender wrote it. On a network, a router in the middle may rewrite the sender's address on the envelope itself, so that many computers of one office appear under one shared address. A letter is also one piece of paper, while a file is cut into thousands of packets that may arrive in the wrong order or twice. And nobody at the post office can copy every letter without opening a single envelope, while a recorder on a network does exactly that.

**So what.** Before you write down an address from a capture, ask which layer it belongs to and where the capture was taken. A MAC address is good for one local network. An IP address is good for one journey at one time.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A capture was taken at the connection between an office and its internet provider, outside the office router. An examiner wants the MAC address of the laptop that sent a file. What will the frames show as the sender?</p>
  <ul class="qc-opts">
    <li data-key="a">The MAC address of the laptop, because a MAC address never changes</li>
    <li data-key="b">No MAC address, because MAC addresses are removed on the internet</li>
    <li data-key="c">The MAC address of the office router, because each router builds a new frame for the next network</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). A MAC address is used only inside one local network, and the router puts its own address on the frames that it sends on. Option (a) mixes up "the adapter keeps its address" with "the address travels with the packet". Option (b) is wrong because every frame has two MAC addresses, only not the ones the examiner hoped for.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>More from each layer: the models, flags, and what wireless adds</summary>

**Two models, one idea.** Textbooks draw the layers as the OSI model with seven layers or the TCP/IP model with four. The four layers of this section are the lower layers of both. You do not need the numbers today, only the order.

**What else the IP part holds.** Each packet carries a counter, the time to live, which every router lowers by one. Its value hints at how many routers the packet has crossed and at the sender's operating system, because systems start from different values. It is a hint, not a fact.

**What else TCP holds.** TCP marks packets with flags. A connection opens with SYN, then SYN and ACK, then ACK. It closes with FIN, or is cut with RST. A capture that shows a SYN and no answer shows an attempt, not a conversation. The sequence numbers are the numbering that section 4 uses to rebuild a transfer.

**Address translation.** The replacement of private addresses by one public address is called network address translation. You met the word in Session 0, where a NAT network lets your VM reach the internet through the host machine. An office router does the same for a whole office, and it keeps a table of who used which port at which moment. That table lives in memory and is rarely logged.

**Wireless.** A capture taken from the air holds more of the lower layers: signal strength, channel, and the frames by which devices join a network. It is a subject of its own and not part of this module's labs.

**The neighbour table.** A computer keeps a small table that links the IP addresses of its neighbours to their MAC addresses. RFC 3227 named it in the order of volatility, in Session 6, as part of the network state. It is the bridge between the two kinds of address, and it lasts only minutes.
</details>

<div class="box key" markdown="1">

Frames carry MAC addresses and are good for one local network. IP addresses name the two ends of the journey. Ports name the service, by custom. Each layer answers one question and no more.

</div>

## 3. Where the capture was taken: SPAN and TAP

### The idea

A recorder sees only what passes the place where it is connected. That place is the {% include term.html t="capture-point" %}. Two computers on the same office switch can exchange files all day, and a recorder at the internet connection will hold none of it.

So the first question about any capture is not "what is in it?" It is "where was it taken, and how?" There are two common answers, and you must know both by name: **SPAN** and **TAP**.

### How it works

**Port mirroring, known as SPAN.** A switch can be told to copy the traffic of one or more of its ports to another port, and the recorder is connected there. This function is {% include term.html t="port-mirroring" %}. The company Cisco named its version Switched Port Analyzer, SPAN for short, and the whole field now uses that name. It costs nothing, because the switch is already there, and it is set up with a few commands.

**A network TAP.** A {% include term.html t="network-tap" %} is a separate piece of hardware. You cut the link, in the sense that you unplug the cable, and place the TAP in between. The traffic passes through it as before. The TAP copies the signal of each direction to its own monitoring output. The letters stand for test access point.

The difference shows when the network is busy.

A mirror port is one port. It must carry the copies of both directions of the link that it watches. If each direction of a 1 Gbit/s link carries 600 Mbit/s, the mirror port is offered 1,200 Mbit/s and can send only 1,000. The switch throws the rest away. Copying is also the least important job of a switch: when it is busy with its real work, it may drop copies even earlier.

The switch tells nobody. The users notice nothing, because their real traffic was never touched. The capture file looks normal. Each lost copy is a {% include term.html t="dropped-packet" %}, and the examiner learns about it only later, from gaps.

A TAP has one output for each direction, each as fast as the link, and it does no other work. It keeps every frame, including damaged ones that a switch would not pass on.

{% include demo.html id="S07-D1" %}

A mirror port can also be set up wrongly. The person who configures it chooses which ports and which direction to copy: received traffic, sent traffic or both. Choose only one direction, or the wrong port, or leave out one of the office's virtual networks, and the capture holds half of every conversation or misses whole groups of computers. Again nothing warns you.

| | Port mirroring (SPAN) | Network TAP |
|---|---|---|
| What it is | A function of an existing switch | A separate device in the cable |
| Cost and effort | None, and quick to set up | Must be bought, and the link is interrupted while it is installed |
| Under heavy load | Drops copies silently | Keeps every frame |
| Damaged frames | Usually not copied | Copied |
| Can be set up wrongly | Yes: wrong port, one direction, missing virtual networks | Hardly: it copies what is on the cable |
| Changes the timing of packets | Slightly, because the switch copies when it has time | Almost not at all |
| Typical use | A quick or short-term capture, or inside a small office | A permanent capture point on an important link |

Neither is "better" in every case. A unit called to an incident at night will often use a mirror port, because it is there. What matters is that the examiner **knows which was used and writes it down**, with the device, the ports, the directions and the time. A capture is only as complete as the point where it was taken, and a report must say so.

<div class="box metaphor" markdown="1">

**The comparison.** A mirror port is like asking a busy post-room clerk to photocopy every letter that passes the desk. A TAP is like a second pipe that carries a copy of everything, with nobody in between.

**Why it fits.** The clerk's real job is to move the post. While the room is quiet, every letter is copied. When the post arrives in sacks, the clerk keeps the post moving and skips some copies. The pile of copies still looks like a normal pile. The pipe has no other job and no choice: what goes through the first pipe goes through the second.

**Where it breaks.** A clerk knows that copies were skipped and could tell you. A switch keeps, at most, a counter that few people ever read. And a clerk can be told "copy only the letters from the third floor", which sounds like the mirror port's settings, while a wrong setting on a switch produces no puzzled look and no question back.

**So what.** A packet that is missing from a capture is not proof that it was never sent. Before you write "no transfer took place", find out how the capture was taken and whether the capture point could have lost traffic.

</div>

**How loss shows in the capture.** TCP numbers its data, so gaps can be seen. Wireshark marks them with notes such as "TCP Previous segment not captured" and "TCP ACKed unseen segment". The second note is the clearer sign: one side confirmed data that the capture does not contain, so the data did cross the network and only the copy is missing.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A capture from a mirror port shows a file transfer with several gaps. Wireshark notes that the receiver acknowledged data that is not in the capture. What is the best reading?</p>
  <ul class="qc-opts">
    <li data-key="a">The data crossed the network, and the copies were lost at the capture point</li>
    <li data-key="b">The sender removed parts of the file to hide them</li>
    <li data-key="c">The capture file was changed after it was made</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). The receiver confirmed the data, so it arrived. Only the copy for the recorder is missing, which is what a mirror port under load produces. Option (b) confuses a gap in the copy with a gap in the transfer. Option (c) is a question for the hash value of the capture, and nothing here points to it.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Kinds of TAP, remote mirroring, and loss at the recorder</summary>

**Kinds of TAP.** A passive TAP for fibre splits off part of the light and needs no power. A TAP for copper cable needs power, and good ones keep the link alive when the power fails. An aggregating TAP joins both directions into one output for a recorder with one adapter, and so it can drop frames under load for the same reason as a mirror port.

**Mirroring from far away.** Switches can send mirrored traffic across the network to a recorder in another place. Cisco calls the forms RSPAN and ERSPAN. They are convenient, they add their own delay and loss, and the mirrored traffic competes with real traffic on the way.

**The recorder can lose packets too.** A computer that records from a fast link may fail to write every packet to its disk in time. Capture programs count what they dropped, and pcapng files can store that count. Wireshark shows it under **Statistics**, **Capture File Properties**. So there are three places where a packet can be lost: the copying device, the path to the recorder, and the recorder itself.

**Capturing on the computer itself.** The simplest capture point is the suspect computer's own network adapter, with a capture tool running on it. That is a {% include term.html t="live-acquisition" %} in the sense of Session 6: the tool changes the computer that it runs on, and a program with enough rights on that computer can hide its traffic from the tool.

**The law.** Recording other people's traffic is an interception. It needs a legal basis, such as the owner's written authority and the organisation's own policy. Session 17 returns to the law. In this module you capture only your own VM.
</details>

<div class="box key" markdown="1">

SPAN is a switch function: free, quick, and it drops copies silently under load or when set up wrongly. A TAP is hardware in the cable and keeps every frame. A capture is only as complete as its capture point.

</div>

## 4. From packets to a file

### The idea

The suspect in a network case did not send packets. He sent a file. The capture holds that file only as hundreds of pieces, each inside its own packet, mixed with the packets of everybody else in the office.

To get the file back, a tool must do three things. It must pick out the packets of one conversation. It must put their data back in the order in which it was sent. And it must cut the file out of the result.

### How it works

**Pick out the conversation.** Wireshark groups traffic in two ways. A {% include term.html t="conversation" %} is all the traffic between two endpoints: under **Statistics**, **Conversations** you see one line for each pair, with the number of packets and bytes in each direction. To see less at a time, you type a {% include term.html t="display-filter" %}, for example `ip.addr == 192.0.2.10` for one address or `tcp.port == 25` for one port. A display filter hides packets. It deletes nothing.

**Put the data in order.** TCP numbers the data that it sends, and section 2 said why this helps the examiner. Packets can arrive early, late or twice. A tool sorts them by their numbers, drops the repeats, removes every packet header and joins what is left. Doing this is {% include term.html t="reassembly" %}, and the result is the {% include term.html t="stream" %}: the data of one TCP connection, exactly as the sending program wrote it. In Wireshark you right-click a packet and choose **Follow**, **TCP Stream**.

**Cut out the file.** A stream contains the protocol's own text as well as the file. A web transfer begins with lines that name the file and its type, and the file follows. There are three ways to get the file.

1. **Wireshark's Export Objects.** Under **File**, **Export Objects**, Wireshark lists the protocols for which it can do the whole job: reassemble, understand the protocol, and save each transferred object as a file. In current versions the list is HTTP for web transfers, IMF for email messages, SMB for Windows file sharing, FTP-DATA and TFTP for two file transfer protocols, and DICOM for medical images. You pick the protocol, see every object with its packet number, name and size, and save one or all.
2. **NetworkMiner.** This free tool for Windows reads a whole capture and does the same work without being asked, for the protocols that it knows. Its **Files** tab lists every file that it rebuilt, with the two addresses, the protocol and the time. It writes the files into a folder on your disk.
3. **File carving from the stream.** When neither tool knows the protocol, you save the stream as raw bytes and carve it. This is {% include term.html t="file-carving" %} exactly as in Session 3, applied to a new source: you search for the {% include term.html t="file-signature" %}, cut from the {% include term.html t="header" %} to the {% include term.html t="footer" %}, and get the file.

{% include demo.html id="S07-D3" %}

**Then hash it.** A file recovered from traffic is a new item that you created. Calculate its hash value at once, and record the capture, the stream and the tool that it came from. If two different tools recover the same file from the same capture, their two hash values must be equal. That is {% include term.html t="verification" %} of your method, and the lab makes you do it.

**What can go wrong.** A recovered file is only as complete as the stream. One dropped packet leaves a hole, and the tools differ in what they do then: one saves a damaged file, another saves nothing. Encrypted traffic gives no files at all. And the name of a recovered file comes from the protocol, so two tools may give two names to the same content. The hash value decides whether two files are the same, as it has since Session 1.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The file was in packet 4,120." | "The file was rebuilt from the stream that begins at packet 4,120." | No single packet holds a whole file. |
| "Wireshark found three files, NetworkMiner found five, so one is wrong." | "The two tools know different protocols and treat damaged streams differently." | Compare the hash values of what both found, and explain the rest. |
| "A stream" for anything in the capture | A stream is the ordered data of one TCP connection | Session 4's alternate data stream is a different thing with a longer name. Keep them apart. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner recovers the same spreadsheet from one capture with two tools. The two files have different names and the same SHA-256 value. What should the notes say?</p>
  <ul class="qc-opts">
    <li data-key="a">That two different files were transferred</li>
    <li data-key="b">That both tools recovered identical content, and that each tool took the name from a different place</li>
    <li data-key="c">That one tool changed the file, because the names differ</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). Equal hash values mean equal content, whatever the names. The name is not part of the content: it comes from the protocol or from the tool. Options (a) and (c) both judge a file by its name.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>What Export Objects saves for email, UDP, and saving a stream as raw bytes</summary>

**Email is a special case.** For mail sent with the protocol SMTP, Export Objects offers the choice IMF, the internet message format. It saves each whole message as a file with the ending `.eml`, named after the subject. An attached file is inside that message as text, in an encoding called base64 that turns every three bytes into four letters. To get the attached file you must decode it, for example by opening the message in a mail program or with a script. NetworkMiner decodes attachments by itself and lists them as files. So for one mail the two tools give different things, a message and an attachment, and only after decoding can their hash values be compared. Session 14 reads the other parts of a message. Today you need only the attachment.

**UDP has no stream.** UDP does not number its data, so there is nothing to put in order. Wireshark still offers **Follow**, **UDP Stream**, which simply shows the messages between two endpoints in the order in which they were captured.

**Saving a stream for carving.** In the **Follow** window, set **Show data as** to **Raw**, choose one direction, and click **Save as**. The saved file holds the bytes of that direction only. Carve it with the tools of Session 3, such as `foremost`, or by hand in a hex viewer.

**The command line.** `tshark -r capture.pcap --export-objects http,outfolder` does the work of the Export Objects window for one protocol, which is useful when a case has hundreds of captures.

**Tools you will hear named.** Commercial network forensics products do reassembly on a large scale and keep months of traffic. NetworkMiner itself has a paid edition with more functions. Everything in this module is done with free tools.
</details>

<div class="box key" markdown="1">

A file crosses the network in pieces. Reassembly puts the pieces of one TCP connection in sending order as a stream. Export Objects and NetworkMiner cut files out when they know the protocol. When they do not, you carve the stream. Then you hash.

</div>

## 5. Flow records: the summary without the content

### The idea

A full capture of a busy network fills disks in hours. Few organisations keep one for long, and many, like our client, keep none.

There is a much smaller record that many networks do keep, often without thinking of forensics at all. A router can note, for each conversation that passes, who talked to whom, when, and how much. It writes one line and forgets the packets. That line is a {% include term.html t="flow-record" %}.

Think of an itemised phone bill. It lists every call: the two numbers, the start time, the length. It contains not one spoken word. A flow record is that, for a network.

### How it works

A {% include term.html t="flow" %} is all the packets that share the same five values: source address, destination address, source port, destination port and protocol. A router or a probe watches packets pass. For each new set of five values it opens a record, and for each further packet of that flow it adds to the counts. When the flow ends, or after a set time, it sends the record to a collector, which stores it.

You must know the two names under which flow records appear.

- {% include term.html t="netflow" %} is the format that Cisco introduced in the 1990s. Version 5 has a fixed list of fields. Version 9 lets the device describe its own fields.
- {% include term.html t="ipfix" %}, IP Flow Information Export, is the open internet standard that grew out of NetFlow version 9. It is set out in RFC 7011.

Other makers use other names for the same idea. When a network engineer says "we have NetFlow", the examiner hears: there may be months of flow records.

| A flow record holds | A flow record does not hold |
|---|---|
| Source and destination IP address | Any content: no file, no message, no web address |
| Source and destination port | The size or time of any single packet |
| The protocol, such as TCP or UDP | Names of users or programs |
| The time of the first and the last packet | Anything about a flow that did not pass the device |
| The number of packets and of bytes | |
| Often: the device's interface, and the TCP flags seen | |

{% include demo.html id="S07-D2" %}

A classic NetFlow record describes **one direction**. A conversation between two computers therefore gives two records, one each way. This is useful. Put the two side by side and you see at once whether a computer mostly received, as it does when a person browses, or mostly sent.

Here are two records of one conversation, as a tool might print them.

```
first seen (UTC)  duration  proto  source              destination         packets   bytes
14:02:07          184.3 s   TCP    192.0.2.10:49152    203.0.113.80:443       9,412  13,804,120
14:02:07          184.3 s   TCP    203.0.113.80:443    192.0.2.10:49152       4,790     287,400
```

Read them like an examiner. Who: the device that held `192.0.2.10`. To where: `203.0.113.80`, port 443, so probably an encrypted web service. When: from 14:02:07 UTC, for about three minutes. How much: about 13.8 MB out and 0.3 MB back. By which protocol: TCP. That is a complete flow summary, and it is the form that the checkpoint of this session asks for.

Now read what is not there. What was sent? Unknown. Which program sent it? Unknown. Who sat at the computer? Unknown. The record is exact about the envelope and silent about the letter.

Session 8 sets flow records beside the logs of a computer and correlates them. Today you learn to name them and to read them.

<div class="box metaphor" markdown="1">

**The comparison.** A flow record is like one line of an itemised phone bill.

**Why it fits.** The two telephone numbers are the two IP addresses with their ports. The start time and the length of the call are the first and last time of the flow. The bill lists every call and is small enough to keep for years, and so are flow records. Neither holds a word of what was said.

**Where it breaks.** A phone number is tied to a contract with a named person, and it stays with that person. An IP address is lent to a device and may be lent to another one tomorrow. A phone bill lists every call, while a router under load may be set to look at only one packet in a hundred, so small flows can be missing and the counts are estimates. And one long transfer may be cut into several records, because the device sends a record every few minutes for flows that are still running.

**So what.** Flow records can show that a device sent a large amount of data to an address at a time. They can never show what the data was. Use them to find where to look, and say in the report which of the two things you are stating.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An organisation kept IPFIX flow records for the last six months and no packet captures. Which question about a suspected transfer can the records answer?</p>
  <ul class="qc-opts">
    <li data-key="a">Which file was sent</li>
    <li data-key="b">Which employee sent it</li>
    <li data-key="c">Which address sent how many bytes to which address and port, and when</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). A flow record holds the addresses, ports, protocol, times and counts. It holds no content, so option (a) is out, and it names addresses and never people, so option (b) is out.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Timeouts, sampling, records in both directions, and Zeek</summary>

**When a record is written.** A device ends a record when it sees the connection close, when the flow has been silent for a short time (often 15 seconds), or when the flow has run for a set time (often 30 minutes, and often set much shorter). So one long transfer appears as a chain of records with the same five values, and the examiner adds them up.

**Sampling.** On fast links, a device may examine only one packet in every hundred or thousand and multiply the counts. The records then give a good picture of large flows and may miss small ones completely. Whether sampling was on, and at what rate, belongs in the examiner's notes.

**Both directions in one record.** IPFIX has an extension that reports both directions of a conversation in one record. Tools that build their own records from a capture often do the same.

**Zeek.** Zeek is a free, open-source tool that reads traffic, live or from a capture file, and writes logs. Its `conn.log` has one line for each connection, with both directions: the two addresses and ports, the protocol, the service that it recognised, the start time, the duration, and the bytes sent by each side. That is a flow record made after the event, from a capture. Zeek also writes one log for each protocol that it understands, such as `dns.log`, `http.log` and `smtp.log`, and these hold selected details of the content. In the lab you make and read these logs.

**Standards.** NetFlow version 9 is described in RFC 3954. IPFIX is set out in RFC 7011, with its list of fields in RFC 7012.
</details>

<div class="box key" markdown="1">

A flow record, in NetFlow or IPFIX form, holds the addresses, ports, protocol, first and last time, and packet and byte counts of a flow. It holds no content at all.

</div>

## 6. When the traffic is encrypted

### The idea

Most traffic on today's networks is encrypted. Web pages, mail, cloud storage and chat nearly all travel inside {% include term.html t="tls" %}, Transport Layer Security. Session 4 taught what {% include term.html t="encryption" %} does: without the key, the content is unreadable. No tool of this session recovers a file from a TLS connection.

That does not make an encrypted capture empty. Think of an armoured van. You cannot see the cargo. You can still see which depot it left, where it stopped, at what time, how often it came, and how heavy it was.

The facts about traffic that can be read without reading the content are often called TLS metadata. Session 2 used the word {% include term.html t="metadata" %} for the information about a file as opposed to its content. This is the same idea, for a connection.

### How it works

**What is always visible.** Encryption works above the transport layer. So everything from section 2 is still there: both IP addresses, both ports, the time of every packet and the size of every packet. From sizes and times you get the amount sent in each direction and the rhythm of the exchange. A flow record of an encrypted connection is as good as one of an open connection.

**What the handshake shows.** Two programs cannot encrypt before they have agreed on keys. So a TLS connection begins with a {% include term.html t="handshake" %}, and its first messages travel in the clear.

The first message is the ClientHello, sent by the program that starts the connection. It contains the name of the site that the program wants, for example `files.example.com`. This field is the {% include term.html t="server-name-indication" %}, SNI for short. It exists because one server address often hosts thousands of sites, and the server must know which one is wanted before it can answer. An observer on the wire reads it too.

Later in the handshake, the server proves who it is with a {% include term.html t="certificate" %}. This is where the versions of TLS differ, and where many books are out of date.

| What an observer wants | TLS 1.2 | TLS 1.3 | TLS 1.3 with Encrypted Client Hello |
|---|---|---|---|
| The server name in the ClientHello | Readable | Readable | Hidden. Only a shared outer name is readable |
| The server's certificate | Readable | Encrypted | Encrypted |
| The content | Encrypted | Encrypted | Encrypted |
| Destination address and port, sizes, timing | Readable | Readable | Readable |

Read the table row by row.

- **The server name** is readable in TLS 1.2 and in TLS 1.3. It is hidden only when both sides use {% include term.html t="encrypted-client-hello" %}, an addition to TLS 1.3 that encrypts the real name. The observer then sees an outer name that belongs to the hosting provider and is shared by very many sites.
- **The certificate** is readable only up to TLS 1.2. TLS 1.3 encrypts everything after the server's first message, and the certificate comes after it. In a capture of TLS 1.3 you will not find the certificate.
- **The destination address, the sizes and the timing** are readable always.

{% include demo.html id="S07-D4" %}

So an examiner with an encrypted capture can often still write: this device contacted the site with this name, at this address, at this time, and sent about this much. She must also write which of these facts the capture really held, because that depends on the TLS version.

<div class="box metaphor" markdown="1">

**The comparison.** An encrypted connection is like an armoured van that an observer watches from the street.

**Why it fits.** The locked cargo space is the encrypted content. The depot the van leaves and the building where it stops are the two addresses. The clock on the street gives the times. How low the van sits on its wheels is the size. The delivery note that the driver shows at the gate before the doors are unlocked is the handshake: it names the customer, and anyone standing at the gate can read it.

**Where it breaks.** A van is one object that you can follow, stop and open with a court order. A TLS connection can be opened afterwards only with keys that modern TLS throws away when the connection ends, so a recorded connection usually stays closed for ever. And many customers share one building on the internet: thousands of sites sit behind one address of a large provider, so the address alone may say little.

**So what.** Do not stop at "it is encrypted". Record the server name if the capture has one, the address, the times and the amounts. Then say plainly that the content is unknown.

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An examiner opens a capture of a connection that used TLS 1.3 without Encrypted Client Hello. Which of these can she read from it?</p>
  <ul class="qc-opts">
    <li data-key="a">The server's certificate and the server name</li>
    <li data-key="b">The server name, and not the certificate</li>
    <li data-key="c">Neither, because TLS 1.3 encrypts the whole handshake</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). The ClientHello with the server name is sent before any keys exist, so it is readable. TLS 1.3 encrypts everything after the server's first message, and the certificate comes after it. Option (a) is true for TLS 1.2. Option (c) would need Encrypted Client Hello.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Fingerprints such as JA3 and JA4, encrypted name lookups, and decrypting with keys</summary>

**Fingerprints of the program.** The ClientHello also lists which methods of encryption the program offers, in which order, and with which extensions. Different programs make different lists. A short code calculated from the list is a fingerprint of the kind of program that started the connection. **JA3** was the first widely used method. Browsers then began to shuffle the order of their lists, which made JA3 unstable, and **JA4** was designed to cope with that and to cover more protocols. A fingerprint can separate a common browser from an unusual tool on the same computer. It identifies a kind of program, never one computer and never a person, and two different programs can share a fingerprint.

**The name lookup may also be hidden.** Before a connection, a computer normally asks the DNS for the address of the site, in the clear, and that question appears in the capture too. Newer systems can send these questions inside TLS, to a public resolver. Then neither the lookup nor, with Encrypted Client Hello, the handshake shows the name.

**Decrypting with keys.** If the examiner controls one end, a browser can be told to write the keys of each connection to a file, and Wireshark can then decrypt a capture of those connections. This works for your own traffic in a test. It does not work for traffic recorded in the past without the keys, because modern TLS creates fresh keys for every connection and discards them.

**Inspection by the organisation.** Some organisations decrypt and re-encrypt their staff's web traffic at a proxy, with the staff's knowledge. Where such a proxy exists, its logs may hold full web addresses. That is a source to ask the client about. It is not something a capture gives you.

**Standards.** TLS 1.3 is set out in RFC 8446, and TLS 1.2 in RFC 5246.
</details>

<div class="box key" markdown="1">

Encryption hides content, not the fact of the conversation. The server name is readable unless Encrypted Client Hello hides it. The certificate is readable only up to TLS 1.2. The destination, the sizes and the timing are always there.

</div>

## 7. Spotting exfiltration

### The idea

Moving data out of an organisation without permission is {% include term.html t="exfiltration" %}. In our case the suspect is believed to have used email, a cloud storage service and removable media. On a network, exfiltration is hard to see for a simple reason: it uses the same protocols as honest work. An upload to a cloud service is an upload, whoever does it.

So the examiner does not look for a forbidden protocol. She looks for traffic that does not fit the normal life of that device and that office. Four questions do most of the work: how much, in which direction, to where, and when.

### How it works

**Volume and direction.** An office computer mostly receives. A person reads pages, opens mail and downloads documents, and sends little back. A conversation in which a workstation sends many megabytes and receives almost nothing has the shape of an upload. The **Conversations** window of Wireshark and the two byte columns of a flow record show this in one look. Section 5's example had that shape.

**Unusual destinations.** Ask where the data went. An address that no computer of the office contacted before, a service that the organisation does not use, a connection to a bare address with no name lookup before it: each is a question. None is proof. People try new services every day.

**Unusual times.** Traffic at three in the morning from the computer of someone who works from nine to five is a question. So is a large upload minutes after the same computer read many confidential files. The disk gave you a {% include term.html t="timeline" %} in Session 5. Network times, in UTC, can be laid beside it.

**The protocol does not fit.** Section 2 said that a port number is a custom. Traffic on the web port that is not web traffic, or a name lookup that is far larger than a name lookup needs to be, is a sign that something is using a protocol as a cover. The most important case has its own name.

**DNS tunnelling.** {% include term.html t="dns" %}, the Domain Name System, turns names into addresses. Before almost every connection, a computer sends a {% include term.html t="dns-query" %}: "what is the address of `www.example.com`?" Nearly every network lets these queries out, even networks that block everything else, and few people ever read them.

That makes DNS a hiding place. A program can cut a file into small pieces, write each piece as letters, and ask for a name that begins with those letters, under a domain whose name server the attacker controls. The query travels through the organisation's own resolver to that name server. The attacker's server reads the pieces out of the names. Hiding other data in DNS queries and answers is {% include term.html t="dns-tunnelling" %}.

The parts of a name between the dots are called labels. The trick leaves marks in them, and you must know these indicators.

| Indicator | Normal lookups | Tunnelling |
|---|---|---|
| Length and look of the labels | Short and readable: `www`, `mail`, `intranet` | Long, up to the limit of 63 characters, and random-looking, which means high {% include term.html t="entropy" %} |
| Unique names under one domain | Few names, asked again and again | Hundreds or thousands of names, each asked once |
| Record types | Mostly A and AAAA, the types that ask for an address | Unusual types that can carry more data, such as TXT, often in large numbers |
| Rate | In bursts, when a person does something | Steady, like a clock, for minutes or hours |
| Size and volume | Small questions and small answers | Questions and answers near the size limit, and far more DNS traffic than the device normally produces |

{% include demo.html id="S07-D5" %}

Why must every name be new? A resolver remembers answers. If the program asked for the same name twice, the second question would be answered from memory and would never reach the attacker's server. A name that nobody has asked before always travels the whole way. This is why "many unique names under one domain" is the most telling indicator of all.

The marks are visible without any content. The names are in the capture, in Zeek's `dns.log`, and in the logs of the organisation's own resolver. Even flow records show the volume and the rhythm on port 53.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "A TXT query means tunnelling." | "TXT has honest uses. Many TXT queries with long unique names under one domain are an indicator." | Mail systems read TXT records all day. |
| "The labels are random, so it is malicious." | "The labels have high entropy and no words. Some honest services also generate such names." | Content delivery networks and security products use long generated names. |
| "A large upload proves exfiltration." | "A large upload to an unusual destination at an unusual time is a lead." | Backups and video calls are large uploads too. |

</div>

**From indicator to finding.** One indicator is a question. Several that point to the same device, the same destination and the same time are a pattern that a report may describe. The report describes the pattern, with its numbers: how many queries, how many unique names, to which domain, over what time. It does not say what was sent, unless the content was recovered.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">In one hour, an office computer sends 4,200 DNS queries. Each asks for a different name of about 50 random-looking characters, all under the same domain, at a steady rate. What is the most reasonable next step?</p>
  <ul class="qc-opts">
    <li data-key="a">Treat it as a possible DNS tunnel, record the indicators with their numbers, and examine the device</li>
    <li data-key="b">Ignore it, because DNS queries are too small to carry files</li>
    <li data-key="c">Report that the user stole data, because the names are random</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Long random-looking labels, thousands of unique names under one domain and a steady rate are the indicators together. Option (b) forgets that thousands of small queries add up. Option (c) jumps from a pattern in traffic to a person and a motive, which the traffic cannot show.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>How much a query can carry, other covert channels, and a baseline</summary>

**The arithmetic.** A whole name may be at most 253 characters long, and each label at most 63. Names allow only letters, digits and the hyphen, and do not distinguish capital letters, so data must be written in an encoding that needs about eight characters for five bytes. After the attacker's own domain is subtracted, one query carries perhaps 100 to 150 bytes. A file of one megabyte needs several thousand queries. This is why the channel is slow and noisy, and why it can be found.

**Why TXT.** The data that leaves travels in the names. The data that comes back, such as commands, travels in the answers. An address answer holds 4 or 16 bytes. A TXT answer holds free text of a few hundred bytes. Other types with room in them are also misused, and a tunnel can work with address answers only, so the record type is the weakest of the indicators.

**Other covert channels.** The same idea, hiding data in a protocol that is always allowed, has been used with the "ping" protocol ICMP and with ordinary web requests. The questions are the same: is this more traffic of this kind than the device needs, and does it look as the protocol normally looks?

**A baseline.** "Unusual" needs a "usual". An organisation that knows how much DNS traffic its computers normally produce, and which outside services they normally use, finds exfiltration far more quickly. That knowledge is called a baseline, and collecting it is part of forensic readiness. Session 8 builds on it when it sets alerts beside your timeline.
</details>

<div class="box key" markdown="1">

Exfiltration hides in normal protocols. Look at volume and direction, destination and time. For DNS tunnelling look for long, high-entropy labels, many unique names under one domain, unusual record types such as TXT, and a steady rate.

</div>

## 8. Attribution: an address is a device at a time, not a person

### The idea

You have found the conversation. A device with the address `192.0.2.10` sent fourteen megabytes to an outside server at 14:02 UTC. The client now asks the only question that matters to it: who did this?

The capture does not say. It says which address sent the packets. Getting from an address to a person is a chain of separate steps, and each step needs its own evidence. Deciding who was responsible, and showing the evidence for each step, is {% include term.html t="attribution" %}.

This is the most important idea of today. Session 14 returns to it.

### How it works

Follow the chain, one link at a time.

| Step | From | To | What supports it | How it can fail |
|---|---|---|---|---|
| 1 | The packets | An IP address | The capture itself | The source address of a packet can be forged, most easily with UDP |
| 2 | The public IP address | A device inside the office | The router's translation table or log for that second | The table is in memory and is rarely logged. Many devices share one public address |
| 3 | The inside IP address | A MAC address | The log of the service that lends addresses, or a capture taken inside the local network | Addresses are lent for a time and then given to another device. Logs are overwritten |
| 4 | The MAC address | A physical device | An inventory, or the device itself in the unit's hands | Software can change a MAC address. Phones and newer laptops use random ones |
| 5 | The device | A user account | The logon records on the device, from Session 5 | Shared accounts, a computer left unlocked, remote access |
| 6 | The account | A person | Evidence from outside the network: door records, cameras, witnesses, an admission | Passwords are shared, stolen and guessed |

A capture alone gets you to the end of step 1. With a capture taken inside the local network it gets you to step 3. Every further step needs another source, and most of those sources are short-lived or were never recorded.

So the sentence that a network examiner may write is narrow. **An IP address or a MAC address identifies a device on a network at a time.** It does not identify a person. The words "at a time" matter as much as the word "device": the same address may belong to another device an hour later.

The service that lends addresses to devices is called DHCP. Its log says which MAC address held which IP address from when to when. That log is the usual bridge at step 3, and asking for it early is good practice, because many systems keep it for days only.

<div class="box metaphor" markdown="1">

**The comparison.** An address in a capture is like the number plate of a car on a traffic camera.

**Why it fits.** The camera shows, with an exact time, that a car with this plate passed this point. That is real evidence, and it is where an inquiry starts. It does not show who was driving. The owner may have lent the car, or the car may have been taken. To name the driver, the police need more: a photograph of the face, a witness, an admission.

**Where it breaks.** A plate is fixed to one car for years and is listed in one national register. An IP address is lent for hours, by thousands of separate networks, each with its own records or none. One public address may stand for a whole office, as if two hundred cars shared one plate. And changing a MAC address takes one command and breaks no seal.

**So what.** Write "the device that held address 192.0.2.10 at 14:02 UTC", and never "the suspect". Then list which steps of the chain your evidence covers, and ask early for the records that cover the others, before they are overwritten.

</div>

<div class="box lens" markdown="1">

**Through another lens: The Conversation.** In this film from 1974, directed by Francis Ford Coppola, Harry Caul is the best surveillance expert in his city. A client pays him to record a young couple who walk and talk in a crowded square. Caul uses several microphones, and afterwards he works on the tapes for days until every word is clear. The recording is a technical masterpiece.

Listening again and again, Caul becomes sure that the couple are in danger, and he acts on that belief. He is wrong. The words on the tape were exactly what was said. Their meaning depended on which word the speaker stressed and on things that no microphone could record. Caul heard every word and misread the conversation.

The parallel with today is close. A packet capture is Caul's tape. It is exact: every byte, every time, every address. The moment you say what it means, who sent this, why, with what intention, you are no longer reading the capture. You are making an inference from it, and an inference can be wrong while the evidence is perfect.

Where the parallel breaks: Caul worked alone, in secret, and nobody checked his reading. An examiner writes down every step from the evidence to the conclusion, so that another person can test each one. And Caul could listen for tone of voice, while a packet has no tone at all.

The question to carry into the lab: when you write a sentence about this traffic, which part did the capture record, and which part did you add?

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A capture taken inside an office network shows that the device with IP address 10.0.0.23 and a certain MAC address uploaded a large file at 21:40 UTC. Which sentence may the examiner write on this evidence alone?</p>
  <ul class="qc-opts">
    <li data-key="a">"The employee to whom the laptop with this MAC address was issued uploaded the file."</li>
    <li data-key="b">"The laptop with this MAC address uploaded the file."</li>
    <li data-key="c">"A device that used this IP address and this MAC address on the office network at 21:40 UTC uploaded the file."</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). It states what the capture recorded and stops there. Option (b) assumes that the MAC address was not changed and belongs to that laptop, which needs the inventory and the device. Option (a) adds a person, which needs evidence from outside the network.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Forged addresses, shared addresses at the provider, and what helps attribution</summary>

**Can the source address be forged?** For a TCP conversation that really exchanged data, forging the source address is very hard, because the answers go to the address that was claimed and the conversation would never get started. For single UDP messages it is easy. So a completed TCP transfer is good evidence that the address was really in use by the sender, and a single UDP packet is not.

**Sharing at the provider.** Many internet providers, mobile networks above all, put thousands of customers behind one public address. To find the customer, the provider needs the address, the exact time and the source port. A request that gives only the address and the day may be unanswerable.

**Other people's networks.** Traffic can be passed through a virtual private network, an anonymity network or a hacked computer of a third party. The capture then shows the address of that middle station. The device behind it appears in nobody's capture but the middle station's own.

**What strengthens attribution.** Agreement between independent sources. The capture gives a time and an inside address. The lending log gives the MAC address for that time. The device's own disk shows, by the methods of Session 5, which account was logged on and that the file was opened minutes before. Session 6's memory capture could tie the connection to one program. Each source closes one link, and the report shows them link by link.
</details>

<div class="box key" markdown="1">

Every packet leaves a trace, yet attribution is inference, not proof. An address identifies a device on a network at a time. Each step from there to a person needs its own evidence.

</div>

## 9. The lab: read two captured networks

Your task has four parts. You warm up on the Nitroba capture and reason from an address to a device. You find how files left the M57-Patents office in the unit's slice of that company's traffic, recover the files with two different tools, and show with hash values that both tools agree. You summarise the slice as flows with Zeek. And you find the unusual DNS traffic in a short practice capture.

You work first in the Kali VM, for Parts A to E, and then in the Windows VM, for Part F. One VM at a time is enough: shut Kali down before you start Windows if your host machine is small. Allow about two hours.

<div class="box safety" markdown="1">

**Other people's traffic, and your own.**

- **Content note.** Nitroba is a made-up harassment case. The capture contains the text of unkind messages that were sent to a teacher in the story.
- Every capture of this lab comes from a teaching library or was made by the unit. Capture live traffic only on your own VM, and only your own traffic. Recording a network that is not yours without written authority is an offence in most countries.
- Files recovered from a capture are unknown files. Do not open them by double-click. Look at them with `file`, with a hex viewer or with a hash value first.
- If Windows Security removes a recovered file, record its message and the name of the file. Do not switch the protection off.

</div>

<div class="box lms" markdown="1">

The three captures, the pre-computed Zeek logs, the helper script, the findings sheet, the evidence register and a blank custody record are in folder `S07` on the lab share. NetworkMiner is in the `Tools` folder. Copy both into `nb6018-share` on your host machine before you start. If you are studying away from the lab, the LMS explains how to get the same files. Together they need less than 1 GB.

</div>

**The items.** Keep every file name exactly as it is.

| Exhibit | File | What it is |
|---|---|---|
| `S07-001` | `nitroba.pcap` | The capture of the Nitroba University scenario from the Digital Corpora teaching library, unchanged. A small network of a student residence, recorded in 2008 |
| `S07-002` | `s07-m57-slice.pcap` | The unit's slice of the M57-Patents network captures from the same library: one window of time, cut out of the company's daily capture files. The evidence register records the source files, their hash values and the window |
| `S07-003` | `zeek-slice/` | The Zeek logs that the unit computed from exhibit `S07-002`. Your fallback if Zeek cannot be installed |
| `S07-004` | `s07-dns-practice.pcap` | A practice capture that the unit generated with a script. Every name in it is under a reserved example domain and every address is a documentation address. It contains no real traffic and was made without any tunnelling tool |
| `S07-005` | `s07-own-capture.pcap` | A capture of your own VM. You create it in the optional part |

**How the M57-Patents traffic was captured.** The people who built the scenario recorded all traffic between the company's small office network and the internet, at the office's gateway, every day for several weeks in late 2009. The dates and times in the capture are those days, shown as recorded. So the capture point is the edge of the office: you see what left and what came in, and nothing that stayed between two office computers.

**Two more files from the unit.**

- `s07-tools.py` runs in Kali. It unpacks attached files from saved mail messages, lists the largest flows of a Zeek `conn.log`, summarises DNS queries, and checks the form of your findings sheet.
- `s07-findings.csv` is the sheet for your ten findings.

### Part A: receive and verify, in Kali

1. In the Kali VM, open a terminal. Create two folders, copy the files, and verify the three captures against the evidence register:

   ```bash
   mkdir -p ~/evidence/s07 ~/cases/s07
   cp -r /media/sf_nb6018/S07/* ~/evidence/s07/
   cd ~/evidence/s07
   sha256sum nitroba.pcap s07-m57-slice.pcap s07-dns-practice.pcap
   chmod a-w nitroba.pcap s07-m57-slice.pcap s07-dns-practice.pcap
   ```

   <div class="box expect" markdown="1">

   Three SHA-256 values. Each equals the value for its exhibit in `s07-evidence-register.md`. Write the entries in the custody record: received, and verified on receipt.

   </div>

   <div class="box trouble" markdown="1">

   If Kali says "Permission denied" for `/media/sf_nb6018`, repeat the last part of Step 5 in Session 0. If a value does not match, copy that file again. If it still differs, tell the lecturer and do not continue with that exhibit.

   </div>

2. Record your tools:

   ```bash
   wireshark --version | head -n 1
   tshark --version | head -n 1
   ```

   <div class="box expect" markdown="1">

   Two lines with the same version number, for example `Wireshark 4.6.` and a last digit. Write the version into the custody record.

   </div>

   <div class="box trouble" markdown="1">

   If either command is not found, install both with `sudo apt install wireshark tshark` and tell the lecturer, because that step needs the internet.

   </div>

### Part B: warm-up on Nitroba, from an address to a device

{:start="3"}
3. Open the capture and set the clock that you read:

   ```bash
   wireshark ~/evidence/s07/nitroba.pcap &
   ```

   In Wireshark choose **View**, **Time Display Format**, **UTC Date and Time of Day**. Then open **Statistics**, **Capture File Properties**.

   <div class="box expect" markdown="1">

   The main window shows three areas: the list of packets, the layers of the selected packet, and its bytes. The properties window shows the format of the file, the time of the first and of the last packet, the number of packets, and whether any were dropped. Write the first and the last time into your notes, in UTC. You need them for the findings sheet.

   </div>

   <div class="box trouble" markdown="1">

   If the times change when you compare with a neighbour, one of you is still reading local time: set the time display format again. Wireshark remembers it for the next start.

   </div>

4. Click one packet in the list. In the middle area, open the layers one by one, from the top line down.

   <div class="box expect" markdown="1">

   A line that begins with `Frame`, which is Wireshark's own summary. Then `Ethernet II` with two MAC addresses. Then `Internet Protocol` with two IP addresses. Then `Transmission Control Protocol` or `User Datagram Protocol` with two ports. Then, for many packets, the application's protocol. These are the layers of section 2, in the same order.

   </div>

   <div class="box trouble" markdown="1">

   If a packet has no transport line, you clicked a packet of a helper protocol such as ARP. Click another one.

   </div>

5. Open **Statistics**, **Conversations**, and choose the **IPv4** tab. Click the heading **Bytes** to sort.

   <div class="box expect" markdown="1">

   One line for each pair of addresses, with packets and bytes in each direction and the start time. Some addresses are private addresses of the residence's own network, and the others are servers on the internet. Note the three inside addresses with the most traffic.

   </div>

   <div class="box trouble" markdown="1">

   If the window is empty, a display filter is still set and the box **Limit to display filter** is ticked. Clear the filter bar in the main window.

   </div>

6. Type the display filter `http.request` into the filter bar and press Enter. Pick one of your three inside addresses and narrow the filter to it, for example `http.request && ip.src == 192.0.2.10` with the address that you chose. Right-click one of the packets and choose **Follow**, **TCP Stream**.

   <div class="box expect" markdown="1">

   The list now shows only web requests from that address. The stream window shows a whole exchange as text: the request in one colour and the server's answer in another. In the request you can read the name of the site in the line `Host:` and a description of the browser and the operating system in the line `User-Agent:`. Write down the `User-Agent` text of two or three requests from this address.

   </div>

   <div class="box trouble" markdown="1">

   If the stream is unreadable signs, you followed an encrypted or compressed exchange. Close the window and choose another request. The filter bar turns red while a filter is not valid: check the two `=` signs and the two `&` signs.

   </div>

7. Find the hardware behind the address. Clear the filter, type `ip.src == ` and your address, click a packet and read the source address in the `Ethernet II` line. Then answer three questions in your notes, in one sentence each. Which MAC address sent the frames for this IP address? Do all requests from this IP address describe the same browser and system? Could more than one device stand behind this address?

   <div class="box expect" markdown="1">

   A MAC address, with the maker's name in front of it if Wireshark knows the maker. Your third answer is "yes, in principle": a residence shares one small network, a second router can hide several devices behind one address, and anyone in range can join an open wireless network. Your notes end with a sentence of this form: "A device that used IP address ... and MAC address ... on this network between ... and ... UTC made these requests." They name no person.

   </div>

   <div class="box trouble" markdown="1">

   If your notes name a student, or say "the user", read section 8 again. The capture holds addresses, times and browser descriptions. It holds no names of people who can be tied to a device by this evidence alone.

   </div>

### Part C: the M57-Patents slice in Wireshark

{:start="8"}
8. Close the Nitroba capture and open the slice:

   ```bash
   wireshark ~/evidence/s07/s07-m57-slice.pcap &
   ```

   Open **Statistics**, **Capture File Properties**, then **Statistics**, **Protocol Hierarchy**.

   <div class="box expect" markdown="1">

   The properties show a window of time on one day in late 2009, and the number of packets. The hierarchy shows which protocols the slice contains and what share of the bytes each one has. Write the window into your notes in UTC. Note every protocol that can carry a file or a message.

   </div>

   <div class="box trouble" markdown="1">

   If the properties report dropped packets or a snap length that is smaller than the packets, note it: it limits what you may conclude. Section 3 explains why.

   </div>

9. Find the conversation with the shape of an upload. Open **Statistics**, **Conversations**, the **TCP** tab. Sort by the bytes sent from the inside address to the outside address.

   <div class="box expect" markdown="1">

   Near the top is at least one conversation in which an address of the office sent far more bytes than it received. Write down its two addresses, its two ports, its start time and its two byte counts. The server's port tells you which protocol was probably used. This is your candidate for the exfiltration channel.

   </div>

   <div class="box trouble" markdown="1">

   If you cannot tell which side is "inside", look at the addresses: private addresses, which begin with `10.`, with `192.168.` or with `172.16.` to `172.31.`, belong to the office. If several conversations look alike, take them all into your notes and decide after the next step.

   </div>

10. Read the conversation. Select it in the Conversations window, click **Follow Stream**, and read the beginning and the end of the stream.

    <div class="box expect" markdown="1">

    The protocol's own lines, in readable text: who is greeting whom, and what is announced. Somewhere a file or a message with an attached file is named, followed by a long block that is the file itself, either as raw bytes or as lines of letters and digits. Write into your notes which protocol this is, which names appear, and the number of the stream, which Wireshark shows in the filter bar as `tcp.stream eq` and a number.

    </div>

    <div class="box trouble" markdown="1">

    If the whole stream is unreadable, the conversation is encrypted and no file can be recovered from it: record what section 6 says is still visible, and go back to step 9 for the next candidate. Long lines of letters, digits, `+` and `/` are not encryption. They are the base64 encoding of an attached file.

    </div>

11. Recover the files with Export Objects. Choose **File**, **Export Objects**, and then the protocol that you identified. Click **Save All** and choose a new folder, `~/cases/s07/wireshark-out`.

    <div class="box expect" markdown="1">

    A window that lists every object of that protocol in the slice, each with a packet number, a host name or sender, a type, a size and a file name. After **Save All**, the folder holds one file for each line. If you chose **IMF**, the files are whole mail messages with the ending `.eml`.

    </div>

    <div class="box trouble" markdown="1">

    If the list is empty, try the other protocols in the Export Objects menu that you noted in step 8. If your channel is a protocol that the menu does not offer, save the stream as raw bytes, as the deeper part of section 4 describes, and carve it with `foremost -i` and the name of the saved file. Record that you carved.

    </div>

12. If your files are mail messages, unpack the attached files. Then hash everything that you recovered:

    ```bash
    cd ~/cases/s07
    python3 ~/evidence/s07/s07-tools.py attachments wireshark-out wireshark-attached
    find wireshark-out wireshark-attached -type f -exec sha256sum {} + | sort > s07-wireshark-hashes.txt
    cat s07-wireshark-hashes.txt
    cp s07-wireshark-hashes.txt /media/sf_nb6018/
    ```

    <div class="box expect" markdown="1">

    The script prints one line for each attached file that it wrote, or says that the folder holds no mail messages, which is fine for any other channel. The list then shows one SHA-256 value and one path for each recovered file. Find the files that left the office in the conversation of step 9: they are your exfiltration artefacts. Write their names and hash values into your notes and into the custody record, as items that you created from exhibit `S07-002`.

    </div>

    <div class="box trouble" markdown="1">

    If `find` reports that `wireshark-attached` does not exist, your channel was not mail: remove that name from the command. Use `file` and the name of a recovered file to see what kind of file it is before you think about opening it.

    </div>

### Part D: summarise the slice with Zeek

{:start="13"}
13. Check that Zeek is installed, and run it over the slice:

    ```bash
    zeek --version
    mkdir -p ~/cases/s07/zeek && cd ~/cases/s07/zeek
    zeek -C -r ~/evidence/s07/s07-m57-slice.pcap
    ls
    ```

    <div class="box expect" markdown="1">

    A version line, then after a short wait a set of files that end in `.log`. There is always a `conn.log`. The others depend on the protocols in the slice, for example `dns.log`, `http.log`, `smtp.log` and `files.log`. The option `-r` reads a capture file, and `-C` tells Zeek not to reject packets whose checksums look wrong, which is common in captures.

    </div>

    <div class="box trouble" markdown="1">

    If Kali says that `zeek` is not found, install it with `sudo apt install zeek`. This needs the internet. If it cannot be installed, or the lecturer says to skip it, use the unit's logs: `cp ~/evidence/s07/zeek-slice/*.log .` and continue with step 14. Record in your notes which of the two you used, because logs that you did not make yourself are a different source.

    </div>

14. List the largest senders. Zeek's `conn.log` has one line for each connection, with the bytes that each side sent:

    ```bash
    cat conn.log | zeek-cut -u ts id.orig_h id.resp_h id.resp_p proto service duration orig_bytes resp_bytes | sort -t$'\t' -k8,8nr | head -n 10
    ```

    <div class="box expect" markdown="1">

    Ten lines with nine columns: the start time in UTC, the address that opened the connection, the address and the port that answered, the protocol, the service that Zeek recognised, the duration in seconds, and the bytes sent by the opener and by the answerer. The conversation of step 9 is at or near the top, and its numbers agree with what Wireshark showed, within a small difference. Two tools, one fact.

    </div>

    <div class="box trouble" markdown="1">

    If `zeek-cut` is not found, the helper does the same job: `python3 ~/evidence/s07/s07-tools.py flows conn.log`. Wireshark counts whole frames and Zeek counts only the data that the connection carried, so the byte counts differ a little. Use Zeek's numbers in the findings sheet.

    </div>

15. Read the protocol log of your channel. Use the line that fits the protocol that you found:

    ```bash
    cat smtp.log  | zeek-cut -u ts id.orig_h id.resp_h mailfrom rcptto subject
    cat http.log  | zeek-cut -u ts id.orig_h host method uri request_body_len
    cat files.log | zeek-cut -u ts source mime_type filename seen_bytes sha1
    ```

    <div class="box expect" markdown="1">

    For the log that exists, a few lines that name the same transfer in the protocol's own terms: for mail, the sender, the receiver and the subject. For the web, the site, the method and the size of what was sent. `files.log` lists the files that Zeek saw inside the traffic, with their type and size. You are reading selected details of the content, which a true flow record would not have.

    </div>

    <div class="box trouble" markdown="1">

    If a log does not exist, the slice has no traffic of that protocol: that is information too. If `sha1` shows only a hyphen, this installation of Zeek does not hash files by default. Your own SHA-256 values from step 12 are the ones that count.

    </div>

16. Write the flow summary into your notes, in five lines: who, to where, when, how much, by which protocol.

    <div class="box expect" markdown="1">

    Five lines of this form. Who: the inside IP address. To where: the outside IP address and the port. When: the start time in UTC and the duration. How much: the bytes sent by the inside address and the bytes that came back. By which protocol: the transport protocol and the service. Add a sixth line of your own: one thing that this summary does not show.

    </div>

    <div class="box trouble" markdown="1">

    If your "who" is a name, change it to the address. If your sixth line is empty, read the right-hand column of the table in section 5.

    </div>

### Part E: find the unusual DNS traffic

{:start="17"}
17. List the names that the practice capture asks for, with the type of each query:

    ```bash
    cd ~/cases/s07
    tshark -r ~/evidence/s07/s07-dns-practice.pcap -Y "dns.flags.response == 0" -T fields -e frame.time_relative -e dns.qry.type -e dns.qry.name > dns-queries.txt
    wc -l dns-queries.txt
    head -n 5 dns-queries.txt
    sort -k3 dns-queries.txt | awk '{print $3}' | uniq -c | sort -nr | head -n 5
    ```

    <div class="box expect" markdown="1">

    The number of queries, then five sample lines with three columns: the seconds since the start of the capture, the record type as a number (1 is A, 28 is AAAA, 16 is TXT) and the name. The last command counts how often each full name was asked. A few short names were asked several times. Scroll through `dns-queries.txt` and you also see many long names that were each asked once.

    </div>

    <div class="box trouble" markdown="1">

    If the file is empty, check the filter for the two `=` signs. Every name here ends in a reserved example domain, so nothing in this file can lead to a real server.

    </div>

18. Summarise by domain with the helper, and judge:

    ```bash
    python3 ~/evidence/s07/s07-tools.py dns dns-queries.txt
    ```

    <div class="box expect" markdown="1">

    One line for each domain: the number of queries, the number of unique names, the length of the longest label, the record types seen, and the usual gap between two queries. One domain stands out on all four indicators of section 7 at once. Write its name and its numbers into your notes, and one sentence that states the pattern without saying what was sent. The unit generated these names from random letters, so here nothing was sent at all.

    </div>

    <div class="box trouble" markdown="1">

    If two domains look unusual to you, compare the unique names: a normal domain has few names that are asked again, and the unusual one has a new name in every query.

    </div>

19. Copy your work to the shared folder, and shut Kali down if your host can run only one VM:

    ```bash
    cp ~/evidence/s07/s07-findings.csv ~/cases/s07/ && chmod u+w ~/cases/s07/s07-findings.csv
    cp ~/cases/s07/s07-wireshark-hashes.txt /media/sf_nb6018/
    ```

    <div class="box expect" markdown="1">

    The hash list is in `nb6018-share` on your host machine. You fill the findings sheet in Part G, in Kali or in a text editor on any computer.

    </div>

    <div class="box trouble" markdown="1">

    If the copy fails, check the shared folder as in step 1.

    </div>

### Part F: the second extraction, with NetworkMiner in Windows

{:start="20"}
20. Start the Windows VM. Copy the folder of NetworkMiner from `\\VBOXSVR\nb6018\Tools` to `C:\Tools`, and copy `s07-m57-slice.pcap` from `\\VBOXSVR\nb6018\S07` to a new folder `C:\Cases\S07`. Start `NetworkMiner.exe` from its folder. Read its version in the title bar and write it into the custody record.

    <div class="box expect" markdown="1">

    A window with a row of tabs, among them **Hosts**, **Files**, **Messages**, **Credentials**, **Sessions**, **DNS** and **Parameters**. The title bar names the free edition and a version number.

    </div>

    <div class="box trouble" markdown="1">

    If Windows asks whether to run a program from the internet, the file is the unit's copy from the lab share: choose to run it. If the program does not start, do not run it from the shared folder: it needs to write into its own folder, so it must be on `C:`. The tab **Sessions** is NetworkMiner's own word for connections. On this portal, a session is a class.

    </div>

21. Choose **File**, **Open** and open `C:\Cases\S07\s07-m57-slice.pcap`. When the progress bar has finished, look at the **Hosts** tab, then the **Files** tab. If your channel was mail, look at the **Messages** tab too.

    <div class="box expect" markdown="1">

    **Hosts** lists every address in the slice, and for many of them details that the tool worked out, such as the MAC address, open ports and a guess at the operating system. **Files** lists every file that the tool rebuilt, with the source and destination address, the protocol, the file name, the size and the time. The files of your channel are in this list. Right-click one of them and choose **Open folder**: the tool has already written them to disk, under `AssembledFiles` in its own folder.

    </div>

    <div class="box trouble" markdown="1">

    If the tool refuses the file with a message about PcapNG, you opened a different capture: the free edition reads only the older pcap format, and the unit's slice is in that format. If Windows Security removes a rebuilt file, write down its message and the file name, and continue with the files that remain.

    </div>

22. Hash what NetworkMiner rebuilt, and compare with your list from Kali. In PowerShell:

    ```powershell
    $nm = Get-ChildItem C:\Tools\NetworkMiner*\AssembledFiles -Recurse -File | Get-FileHash -Algorithm SHA256
    $ws = Get-Content \\VBOXSVR\nb6018\s07-wireshark-hashes.txt | ForEach-Object { ($_ -split '\s+')[0].ToUpper() }
    $nm | Where-Object { $ws -contains $_.Hash } | Select-Object Hash, Path | Format-List
    $nm | Select-Object Hash, Path | Export-Csv \\VBOXSVR\nb6018\s07-networkminer-hashes.csv -NoTypeInformation
    ```

    <div class="box expect" markdown="1">

    The third command prints every file whose content both tools recovered identically: its SHA-256 value and its path under `AssembledFiles`. Your exfiltration artefacts from step 12 are in this list. Their names may differ from the names in Kali. Their hash values do not. Write the NetworkMiner names beside the hash values in your notes.

    </div>

    <div class="box trouble" markdown="1">

    If the list is empty, check three things. Is the hash list from Kali in the shared folder? Did you unpack the attached files in step 12, so that you compare files with files and not messages with files? Did NetworkMiner rebuild the file at all? If one tool recovered a file and the other did not, that is a result: record it, and say what you tried. NetworkMiner rebuilds many more files than your channel carried, such as pictures from web pages, so a long list of files that are not in your Kali list is normal.

    </div>

### Part G: the findings sheet

{:start="23"}
23. Open your copy of `s07-findings.csv` in a text editor. It has ten rows, `F1` to `F10`, each with a question. Fill the columns `answer` and `source` for each row. The source is the tool and the window or command that gave you the answer.

    | Row | The question |
    |---|---|
    | `F1` | Exhibit `S07-001`: the time of the first and of the last packet, in UTC |
    | `F2` | Exhibit `S07-002`: the inside IP address that sent the files (who) |
    | `F3` | The outside IP address and the port that received them (to where) |
    | `F4` | The start time of that connection in UTC, from `conn.log` (when) |
    | `F5` | The bytes sent by the inside address in that connection, from `conn.log` (how much) |
    | `F6` | The transport protocol and the service (by which protocol) |
    | `F7` | The names of the exfiltration artefacts, as NetworkMiner names them |
    | `F8` | The SHA-256 value of each exfiltration artefact, in the same order |
    | `F9` | Exhibit `S07-004`: the domain that receives the unusual queries, and the number of unique names under it |
    | `F10` | One sentence: what your evidence shows about who sent the files, and where it stops |

    <div class="box expect" markdown="1">

    Ten filled rows. An answer with several parts is written with a space between the parts. Times are written as the tool prints them, in UTC.

    </div>

    <div class="box trouble" markdown="1">

    If an answer needs a comma, put the whole answer inside double quotes.

    </div>

24. Check the form of the sheet, and close the custody record:

    ```bash
    python3 ~/evidence/s07/s07-tools.py check ~/cases/s07/s07-findings.csv
    cp ~/cases/s07/s07-findings.csv /media/sf_nb6018/
    sha256sum ~/cases/s07/s07-findings.csv
    ```

    <div class="box expect" markdown="1">

    The script says that the sheet has ten rows and that each has an answer and a source. It checks the form only. It does not know the right answers. Your custody record lists the three captures as received and verified, each tool with its version, and each file that you created: the recovered files with their hash values, the two hash lists and the Zeek logs.

    </div>

    <div class="box trouble" markdown="1">

    If the script prints a line that begins with `PROBLEM`, it names the row and what is missing. If you have no Kali VM running any more, the lecturer can run the check for you.

    </div>

### Checkpoint

Hand in `s07-findings.csv`, your two hash lists, your notes and your custody record. Your work passes when all five of these are true:

1. Your custody record shows the three captures as verified on receipt, and each recovered file as an item that you created, with its hash value, the exhibit and the tool.
2. Your exfiltration artefacts agree with the unit's key: the names in `F7` and the SHA-256 values in `F8`. Each value appears in both of your hash lists, or your notes explain why one tool did not recover the file.
3. Your flow summary agrees with the unit's key in at least four of the five rows `F2` to `F6`. Byte counts within five per cent count as agreeing.
4. `F9` names the right domain, and your notes state the indicators with their numbers.
5. `F10` and your Nitroba notes name devices, addresses and times, and no person.

The lecturer judges the sheet against the key that the unit recorded when it cut the slice and generated the practice capture. Each answer is a value in a capture, so each row is right or wrong, apart from `F10`, which is judged by reading.

This checkpoint helps with the coursework and the phase test. In the coursework you will read cloud logs that are flow summaries in all but name: who, to where, when, how much. The care about attribution is the same.

### If you have time

**Capture your own traffic and see what TLS leaves.** In Kali, with the internet connected, record 20 seconds of your own VM while it opens one HTTPS site, then read the handshake:

```bash
sudo tshark -i eth0 -a duration:20 -F pcap -w /tmp/s07-own-capture.pcap &
sleep 3; curl -s -o /dev/null https://example.com; wait
tshark -r /tmp/s07-own-capture.pcap -Y "tls.handshake.type == 1" -T fields -e ip.dst -e tls.handshake.extensions_server_name
tshark -r /tmp/s07-own-capture.pcap -Y "tls.handshake.type == 2" -T fields -e tls.handshake.extensions.supported_version
tshark -r /tmp/s07-own-capture.pcap -Y "tls.handshake.type == 11" | wc -l
```

The first reading shows the address and the server name from your ClientHello. The second shows the version that the server chose: `0x0304` is TLS 1.3. The third counts the certificate messages that can be read: with TLS 1.3 the answer is 0, as section 6 said. Now try to find one word of the page in the capture. This is your own traffic on your own VM. Delete the file when you are done. The option `-F pcap` saves the older format, which every tool of this session reads.

**Read the logs in Zui.** Zui is a free desktop program that shows Zeek logs as a searchable table, and it can make them from a capture by itself. If the lecturer has placed its installer in the `Tools` folder, open the slice in it and find your connection again. Zui has had no new release for some time, which is why this session teaches the command line first.

**Carve a stream by hand.** Save one direction of your stream from step 10 as raw bytes and run `foremost` over it. Compare the hash value of what it carves with your value from step 12, and explain any difference with what Session 3 taught about where a carved file ends.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. A report says: "The capture contains no upload from the suspect's computer, so no upload took place." Give two reasons why the capture alone cannot support this sentence.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A capture holds only what passed its capture point, so traffic that took another road, for example through a phone's own connection, is not in it. And the capture point may have lost traffic: a mirror port drops copies silently under load or copies only one direction when it is set up wrongly. The points that earn marks: (1) only traffic past the capture point is recorded; (2) copies can be dropped or never mirrored without any warning; (3) the report should state how and where the capture was taken.
</details>

**2. An investigator must choose a capture point on the busy link between a company's main switch and its firewall, for a capture that may be used in court. Which would you recommend, a mirror port or a TAP, and why?**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A TAP, because it sits in the cable, gives each direction its own output and copies every frame whatever the load, while a mirror port shares one port between both directions and drops copies when the switch is busy. The cost is that a TAP must be bought and the link is interrupted while it is installed. The points that earn marks: (1) a TAP copies everything, including under load; (2) a mirror port can drop or miss traffic silently; (3) a sensible remark on cost or effort, or on recording which was used.
</details>

**3. For one conversation, an examiner has a flow record and no packets. State three things that she can report and two that she cannot.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
She can report the two addresses with their ports, the protocol, the first and last time, and the number of packets and bytes. She cannot report what was sent, because a flow record holds no content, and she cannot report who was at the computer or which program sent it. The points that earn marks: (1) three correct fields; (2) no content; (3) no user or program.
</details>

**4. A capture shows a device opening a TLS 1.3 connection to a file-sharing site and sending about 40 MB. What can the examiner state about the site and the transfer, and what remains unknown?**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
She can state the destination address and port, the server name from the ClientHello if Encrypted Client Hello was not used, the times, and the amount sent in each direction. The content is unknown, and so is the server's certificate, which TLS 1.3 encrypts. The points that earn marks: (1) address, sizes and timing are always visible; (2) the server name is visible unless hidden by Encrypted Client Hello; (3) content and, in TLS 1.3, the certificate are not readable.
</details>

**5. Explain why a tool that hides data in DNS must use a different name in every query, and name two other signs that this produces.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A resolver answers a repeated name from its memory, so only a name that has never been asked travels all the way to the name server that the attacker controls, and the data rides in that name. This produces very many unique names under one domain, and with it long, random-looking labels with high entropy, unusual record types such as TXT, and a steady query rate. The points that earn marks: (1) repeated names are answered from memory and never reach the attacker's server; (2) many unique names under one domain; (3) one further correct indicator.
</details>

**6. A capture taken inside an office shows that the address 10.0.0.23 uploaded a client list at 21:40 UTC. The manager says: "That is the sales manager's computer, so the sales manager did it." Write the examiner's reply.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The capture shows that a device which held that address on the office network at that time made the upload. Tying the address to one computer needs the address-lending log or the device itself, and tying the computer to a person needs further evidence, such as logon records and evidence from outside the network, because addresses are reassigned, MAC addresses can be changed and computers and passwords are shared. The points that earn marks: (1) the address identifies a device on a network at a time; (2) at least one further link that must be shown, with its source; (3) the person is an inference that needs evidence beyond the capture.
</details>

**7. Two tools recover a document from the same capture. One gives a file, the other gives nothing. Give two possible reasons, and say what the examiner records.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
The second tool may not know the protocol of the transfer, or the stream may have a gap from a dropped packet, which one tool tolerates by saving a damaged file and the other does not. The examiner records both results, each tool and version, the hash value of the recovered file, and what was tried, so that the difference is explained and not hidden. The points that earn marks: (1) the tools support different protocols; (2) an incomplete stream is handled differently; (3) both outcomes are recorded with tool, version and hash value.
</details>

## Coming next

Today you read traffic by hand, one conversation at a time. That does not scale to a network of hundreds of computers. In Session 8 a machine does the first reading: an intrusion detection system raises alerts on a capture from a computer that the unit found infected. You will set those alerts beside the timeline file that you saved in Session 5, and build a list of the signs by which the same attack can be recognised elsewhere. The session closes Day 4, so it ends with the day's quiz.
