---
session_code: S13
description: "Reading the cloud drop's records: a CloudTrail event field by field, jq filters at scale, server access log lines, the request ID as a join key, what each record can cover, your own requests tagged and set aside, addresses checked against AWS's published ranges, a timeline in UTC checked against your own log, and the method for limitations and recommendations in the report template."
hook: >-
  The drop's records are collected and sealed. Today the unit reads them.
  Two records written by AWS, and one written by you: where do they agree, where do they not, and which of the requests in them were yours?
outcomes:
  - "Explain what each field of a CloudTrail data event records, and tell a data event from a management event"
  - "Apply jq filters to turn a folder of CloudTrail files into one row for each request"
  - "Identify the fields of a server access log line, including its time, operation name, requester, address, key, version ID and request ID"
  - "Apply a join key to match CloudTrail events with access-log lines, and explain every row that stays unmatched"
  - "Identify your own collection requests in both records, tag them and set them aside without deleting them"
  - "Apply a check of which network an address belongs to, and explain what that check can and cannot show about a person"
  - "Construct a timeline in UTC from both records and test it against your own incident logs"
  - "Apply a method for stating limitations and for writing a recommendation tied to a finding, in the report template"
before:
  - "Normalise every source to [UTC](../s05/#8-one-clock-normalise-every-source-to-utc), and write a timeline in the unit's seven columns (Session 5)"
  - "Explain why [an address is a device at a time, not a person](../s07/#8-attribution-an-address-is-a-device-at-a-time-not-a-person) (Session 7)"
  - "Use jq and a [join key](../s08/#5-correlation-inside-the-capture-from-an-alert-to-a-chain) to set two records side by side (Session 8)"
  - "Keep sealed originals and work on a [working copy](../s12/#4-preservation-hash-on-arrival-keep-the-original-work-on-a-copy) (Session 12)"
  - "Explain [log delivery latency and best-effort delivery](../s12/#2-the-two-clocks-in-your-own-account) (Session 12)"
  - "Explain how [your own requests enter the records](../s12/#3-the-observer-in-the-record) (Session 12)"
  - "Have both collections of the [Session 12 lab](../s12/#8-the-lab-collect-preserve-and-recover-from-your-own-drop) sealed, with the collection log (Session 12)"
demos:
  - id: S13-D1
    title: "Taking a record apart"
    file: s13-d1-record-apart.html
    teaches: "One CloudTrail data event answers who, what, when, from where, with which program and which request, each from a different field, and a management event fills the same fields differently."
  - id: S13-D2
    title: "A filter, one stage at a time"
    file: s13-d2-filter-stages.html
    teaches: "Each stage of a jq filter either removes records or changes their shape, so the rows that come out are decided stage by stage."
  - id: S13-D3
    title: "One key, two records"
    file: s13-d3-one-key-two-records.html
    teaches: "Rows join where both records carry the same request ID, and every row left alone on either side has a reason that the analyst must find."
  - id: S13-D4
    title: "Lifting out the analyst"
    file: s13-d4-lifting-out-analyst.html
    teaches: "Tagging the requests made inside the collection windows lifts them out of the incident's view while every row stays in the file."
  - id: S13-D5
    title: "Where the records agree"
    file: s13-d5-where-records-agree.html
    teaches: "A timeline built from three sources holds firm where they agree, and shows each gap where one source is silent, so the gaps become statements."
slides: s13-cloud-log-analysis.pptx
evidence: "none from the lab share: you analyse the evidence set you collected in Session 12 from your own AWS environment; the unit's practice set exists only for practising the method"
---

Session 12 collected and sealed your evidence. Today you open it. Three plain statements come first.

**Today you analyse.** You read the CloudTrail files and the server access logs, match them, separate your own requests from the incident, ask where each address belongs, and build the incident's timeline. Then you write your first draft into the report template.

**The evidence is yours, and so are the conclusions.** This page teaches the method in full, using an invented account. It never tells you what your records show. Your rows, your timeline, your limitations and your recommendations come from your own files, in your own words.

**You still read only.** Everything today reads files on your Kali VM. Only two optional steps send requests to AWS: a third collection of the log buckets, if records were still missing, and the audit tool at the very end. Both are recorded in your collection log before they run.

## 1. One record, five questions

### The idea

In Session 12 you opened one CloudTrail file and saw that it begins `{"Records":[{"eventVersion":`. Each item in that list is one event: one request, recorded by AWS.

An event is a small set of named fields. Read them in the right order and one event answers the five questions that every investigation asks: **who** acted, **what** they did, **when**, **from where**, and **with which program**. A sixth field names the request itself, so that other records can point to it.

Here is a {% include term.html t="data-event" %} from an invented account. It records an upload to the case bucket. The account ID is masked, as you mask yours.

```json
{
  "eventVersion": "1.11",
  "userIdentity": {
    "type": "IAMUser",
    "arn": "arn:aws:iam::********3333:user/nb6018-analyst",
    "accountId": "********3333",
    "accessKeyId": "AKIA************0001",
    "userName": "nb6018-analyst"
  },
  "eventTime": "2026-10-14T09:12:05Z",
  "eventSource": "s3.amazonaws.com",
  "eventName": "PutObject",
  "awsRegion": "ap-south-1",
  "sourceIPAddress": "203.0.113.24",
  "userAgent": "[aws-cli/2.31.4 ... os/linux ... md/command#s3.cp]",
  "requestParameters": {
    "bucketName": "nb6018-case-ab-4821",
    "key": "staging/client-list.csv"
  },
  "responseElements": {
    "x-amz-server-side-encryption": "AES256",
    "x-amz-version-id": "EMnY9tlicZLhCUJwnHBdHIyvNLVlRXFw"
  },
  "requestID": "CA9ED085EBCC042E",
  "eventID": "0b6e6f3c-1f2a-4d2a-9c1e-5a1b2c3d4e5f",
  "readOnly": false,
  "eventCategory": "Data"
}
```

Real events carry a few more fields, such as `resources`, `additionalEventData` and `tlsDetails`. The ones above are the ones you will use every time.

### How it works

| Question | Field | What it holds | Read it with care because |
|---|---|---|---|
| Who? | `userIdentity` | The kind of identity, its ARN, its account and the access key that signed the request | An identity is an account, not a person |
| What? | `eventSource`, `eventName` | The service and the action, here S3 and `PutObject` | The name is the API's name, not the command you typed |
| What, exactly? | `requestParameters` | What was asked: the bucket, the key and, for some requests, a version ID | A request may name no key at all, for example a listing |
| What came back? | `responseElements` | What S3 answered, for requests that change something; for an upload, the version ID that S3 gave the new version | For read-only requests this field is `null` |
| When? | `eventTime` | The time the request was completed, in {% include term.html t="utc" %}, from the clock of the AWS computer that served it | The time is AWS's, not yours |
| From where? | `sourceIPAddress` | The {% include term.html t="ip-address" %} that the request came from | For some requests that AWS makes for you, it holds a service name or `AWS Internal` instead |
| With which program? | `userAgent` | The {% include term.html t="user-agent" %}: the program and version that sent the request, here the AWS CLI | The program writes this text itself, so it is a claim, not a proof |
| Which request? | `requestID` | The {% include term.html t="request-id" %}: the code that S3 gave this one request | Section 4 uses it to find the same request in the other record |
| Which event? | `eventID` | A code that CloudTrail gives each event | Not the same thing as the Windows event ID of Session 5: here it is a unique label, not a kind |

Two fields say what sort of record this is. `eventCategory` is `Data` for a data event and `Management` for a {% include term.html t="management-event" %}. `readOnly` is `true` for a request that only reads and `false` for one that changes something.

**Management against data, in practice.** Your trail records both, as you set it up in Session 11. A data event is a request about the content of your case bucket: an upload, a download, a delete, a head request. A management event is a request about settings or accounts: reading the bucket's versioning setting, signing in, asking `sts get-caller-identity` who you are. Both arrive in the same files, mixed together, so your first filter in Section 2 separates them.

**Reading the identity.** Inside `userIdentity`, the access key ID tells you what kind of credentials signed the request. AWS documents that key IDs beginning `AKIA` are long-term keys, such as the one you created for Kali in Session 11, and that key IDs beginning `ASIA` are temporary credentials. A session in {% include term.html t="cloudshell" %} signs its requests with temporary credentials, so expect `ASIA` there, often with a `sessionContext` block that says when the session began. Never show a key ID in full: keep its first four and last four characters, as above.

{% include demo.html id="S13-D1" %}

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "CloudTrail shows that the suspect uploaded the file." | "CloudTrail shows that the IAM user `nb6018-analyst` uploaded the file." | The record names an identity. Who used it is a separate question. |
| "The user agent proves the AWS CLI was used." | "The user agent says that the AWS CLI sent the request." | Any program can send any user agent text. |
| "The `eventTime` is when I ran the command." | "The `eventTime` is when AWS completed the request, by AWS's clock." | Your clock and AWS's clock are two different clocks. Section 8 compares them. |

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An event has <code>eventName</code> <code>GetBucketVersioning</code>, <code>eventCategory</code> <code>Management</code> and <code>readOnly</code> <code>true</code>. What does it record?</p>
  <ul class="qc-opts">
    <li data-key="a">A download of an object from the bucket</li>
    <li data-key="b">A change to the bucket's versioning setting</li>
    <li data-key="c">A request that read the bucket's versioning setting and changed nothing</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). It is a management event, so it is about a setting, not content (not a). <code>readOnly</code> is <code>true</code>, so nothing was changed (not b).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Order, clocks, and fields that are sometimes missing</summary>

AWS states that a CloudTrail log file is not an ordered list: the events inside a file, and across files, are in no guaranteed order. So you never read a file from top to bottom as a story. You extract the events and sort them by `eventTime`.

`eventTime` comes from the AWS computer that served the request. AWS says its services keep their clocks in step with the Network Time Protocol. The time is given to the second, and it is always UTC, ending in `Z`.

Some fields are empty for good reasons. `responseElements` is `null` for read-only requests. `sourceIPAddress` holds a service name, or `AWS Internal`, when AWS itself made the request for you, for example some requests made through the console. `tlsDetails` is missing when an AWS service called on your behalf. An empty field is a fact about the request, not a fault in your copy.

For S3 data events, `additionalEventData` also holds `x-amz-id-2`, a second code that S3 gives each request, and the number of bytes sent and received. You can use `x-amz-id-2` as a second check in Section 4.
</details>

<div class="box key" markdown="1">

One CloudTrail event answers who, what, when, from where and with which program, each from its own field, and names its request with a request ID.

</div>

## 2. Parsing at scale with jq

### The idea

Your collection holds hundreds of CloudTrail files, and only a few of their events are about your case bucket. Reading them by eye would take hours and miss things. In Session 8 you used `jq` to pull alerts out of `eve.json`. Today you use it the same way on CloudTrail.

A {% include term.html t="jq-filter" %} is a short program made of stages joined by the pipe sign `|`. Each stage takes what the stage before it produced and does one job: open the list, keep some records, choose some fields, print a row.

### How it works

Build the filter one stage at a time, and look at the output after each stage. The filter below runs over one CloudTrail file; in the lab it runs over every file at once.

| Stage | What you add | What it does |
|---|---|---|
| 1 | `.Records[]` | Opens the list, so that each event comes out on its own |
| 2 | `select(.eventSource == "s3.amazonaws.com")` | Keeps only events about S3 |
| 3 | `select(.requestParameters.bucketName == $case)` | Keeps only events about your case bucket; `$case` is a value you pass in |
| 4 | `[ .eventTime, .eventName, ... ]` | Chooses fields, in a fixed order, as a list |
| 5 | `@tsv` | Prints the list as one row with tab characters between the fields |

Then `sort` puts the rows in time order, because the files are not in order.

{% include demo.html id="S13-D2" %}

The lab's full filter has the same five stages. Stage 4 chooses twelve fields, and uses the operator `//`, which means "if this is empty, use the next one". So the version column holds the version ID from the request if there is one, and the version ID from the answer if there is not:

```
(.requestParameters.versionId // .responseElements."x-amz-version-id" // "-")
```

Each row ends with the name of the file that the event came from, using jq's `input_filename`. That column is your provenance: from any row, you can go back to the exact file, and from the file to its line in the manifest.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">A student's filter has stages 1, 2 and 4, but no stage 3. What will her rows contain?</p>
  <ul class="qc-opts">
    <li data-key="a">S3 events about every bucket in the account, including requests that CloudTrail made to the trail bucket and requests to other buckets</li>
    <li data-key="b">Only events about her case bucket, because the trail records nothing else</li>
    <li data-key="c">Nothing, because stage 4 needs stage 3 before it</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Without stage 3, nothing limits the rows to the case bucket. The trail also records management events for every bucket, so (b) is wrong. Stages are independent: each one only works on what the stage before produced, so (c) is wrong.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Small jq habits that prevent wrong rows</summary>

**Missing fields.** If a field does not exist, jq gives `null`. In `@tsv`, `null` becomes an empty cell, and an empty cell is easy to misread. The lab's filter turns every empty value into `-` with `// "-"`, so a dash always means "this record had no value here".

**Strings only.** `@tsv` prints strings and numbers. The lab adds `map(. // "-" | tostring)` before `@tsv`, so true and false in `readOnly` also print safely.

**Passing values in.** `jq --arg case "$CASE"` makes the shell value available inside the filter as `$case`. That is safer than pasting the name into the filter, where a quote could break it.

**A filter in a file.** A long filter is easier to check when it sits in a file and runs with `jq -f`. You can hash the file and record it, so a stranger can run exactly the filter you ran.

**Listings.** A listing asks about a prefix, not a key, so `requestParameters` holds `prefix` instead of `key`. The lab's filter writes such rows as `prefix=staging/` in the key column.
</details>

<div class="box key" markdown="1">

A jq filter is a pipeline: open the list, keep what you need, choose fields, print rows, then sort by time. Build it stage by stage and check each stage's output.

</div>

## 3. Reading a server access log line

### The idea

The {% include term.html t="server-access-log" %} is S3's own record of each request to your case bucket. It is not JSON. Each line is one request, and its fields are separated by spaces. Some fields contain spaces themselves, so S3 wraps them: the time in square brackets, and the request line and the user agent in double quotes.

Here is one line from the invented account, for the same upload as the event in Section 1. It is broken over several lines here only to fit the page:

```
79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be nb6018-case-ab-4821
[14/Oct/2026:09:12:05 +0000] 203.0.113.24 arn:aws:iam::********3333:user/nb6018-analyst
CA9ED085EBCC042E REST.PUT.OBJECT staging/client-list.csv "PUT /staging/client-list.csv HTTP/1.1"
200 - 312 - 41 12 "-" "[aws-cli/2.31.4 ... md/command#s3.cp]" - Xo2vU1...= SigV4
TLS_AES_128_GCM_SHA256 AuthHeader nb6018-case-ab-4821.s3.ap-south-1.amazonaws.com TLSv1.3 - - ap-south-1
```

### How it works

The fields come in a fixed order. These are the ones you use:

| # | Field | In the line above | Note |
|---|---|---|---|
| 1 | Bucket owner | `79a5...2be` | The owner's canonical ID, a long code |
| 2 | Bucket | `nb6018-case-ab-4821` | |
| 3 | Time | `[14/Oct/2026:09:12:05 +0000]` | Day, month, year, then time; `+0000` means UTC. It is the time S3 received the request |
| 4 | Remote IP | `203.0.113.24` | The address the request came from |
| 5 | Requester | `arn:aws:iam::********3333:user/nb6018-analyst` | The identity, or `-` for a request with no identity |
| 6 | Request ID | `CA9ED085EBCC042E` | The request ID: the same kind of code as CloudTrail's `requestID` |
| 7 | Operation | `REST.PUT.OBJECT` | The {% include term.html t="operation-name" %} |
| 8 | Key | `staging/client-list.csv` | The object's key, URL-encoded: a space, for example, is written `%20` |
| 9 | Request-URI | `"PUT /staging/client-list.csv HTTP/1.1"` | The request line itself; for a listing it holds the prefix |
| 10 | HTTP status | `200` | `200` is success; a `4..` or `5..` code is a failed request |
| 11 | Error code | `-` | The S3 error name, or `-` if there was no error |
| 17 | User-Agent | `"[aws-cli/2.31.4 ...]"` | The same claim as CloudTrail's `userAgent` |
| 18 | Version Id | `-` | The version ID named in the request, or `-` if the request named none |
| 19 | Host Id | `Xo2vU1...=` | S3's second code for the request; CloudTrail keeps it as `x-amz-id-2` |

AWS says that any field may be `-` when its value is unknown, unavailable or does not apply, and that new fields may be added at the end of the line. So a parser must count fields from the start and ignore extra ones at the end.

**The operation names** follow the pattern `REST.METHOD.RESOURCE`. These are the ones your case bucket will show:

| Operation name | The request | CloudTrail's name for it |
|---|---|---|
| `REST.PUT.OBJECT` | Upload a new version | `PutObject` |
| `REST.GET.OBJECT` | Download an object or a version | `GetObject` |
| `REST.HEAD.OBJECT` | Read an object's metadata | `HeadObject` |
| `REST.DELETE.OBJECT` | Delete; in a versioned bucket, add a delete marker | `DeleteObject` |
| `REST.GET.BUCKET` | List objects under a prefix | `ListObjects` |
| `REST.GET.BUCKETVERSIONS` | List versions under a prefix | `ListObjectVersions` |

Notice the Version Id field in the example: it is `-`. The upload did not name a version; S3 created one. The new version's ID is in CloudTrail's `responseElements`, not in this line. For a download by version ID, or a head request for one version, the line does carry the version ID, because the request named it.

**Turning lines into rows.** Splitting these lines with shell tools is fiddly because of the brackets and quotes. The helper `s13-tools.py` does it for you: `s13-tools.py sal` reads the access-log files and prints one row per request with the same twelve columns as your CloudTrail rows. It converts the time to the form `2026-10-14T09:12:05Z`, decodes the key's URL encoding, and writes the prefix of a listing as `prefix=staging/`. It decides nothing; it only rearranges.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An access-log line has operation <code>REST.GET.OBJECT</code>, key <code>staging/pricing-plan.txt</code> and Version Id <code>-</code>. What can you say?</p>
  <ul class="qc-opts">
    <li data-key="a">The request downloaded a version that has since been deleted</li>
    <li data-key="b">The request downloaded <code>staging/pricing-plan.txt</code> without naming a version, so S3 served the version that was latest at that moment</li>
    <li data-key="c">The request failed, because there is no version ID</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A dash in Version Id means the request named no version, so S3 used the latest one. Nothing in the line says what happened later (a). Success or failure is in the HTTP status field, not the version field (c).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>The rest of the line, and two special cases</summary>

After Host Id come the signature version, the cipher suite, the authentication type, the host header, the TLS version, an access point ARN, whether an access control list was needed, and the source Region. You will rarely need them, but they are evidence too: a request without TLS, or without a signature, would stand out.

The fields 12 to 16 are the bytes sent, the object's size, the total time and turn-around time in milliseconds, and the referer. Bytes sent on a download that equal the object's size suggest that the whole object left the bucket.

A copy inside S3 writes two lines: one for the write and one for the read, with the operation `REST.COPY.OBJECT_GET`. A request that S3 itself makes, for example a lifecycle action, has an operation starting `S3.` and no remote IP.

AWS's documentation gives the time format as `[%d/%b/%Y:%H:%M:%S %z]` and says the time is in UTC. The helper reads the `+0000` anyway, so a line with another offset would still be converted correctly.
</details>

<div class="box key" markdown="1">

An access-log line is S3's own record of one request: its time in UTC, its address, its requester, its operation name, its key, its version ID if the request named one, and its request ID.

</div>

## 4. One key across two records

### The idea

You now have two sets of rows: CloudTrail's and the access logs'. Many rows describe the same request twice, once in each record. To use both, you must put each pair together.

You did exactly this in Session 8. Suricata's alert and Zeek's flow record described the same connection, and the Community ID was the value that both carried. A value that two records share, so that their rows can be matched, is a {% include term.html t="join-key" %}. Here the join key is the request ID: S3 gives each request one, CloudTrail keeps it as `requestID`, and the access log keeps it as Request ID. One shared key across two records: the same move as in Session 8.

### How it works

**First, join by request ID.** For each CloudTrail row, look for the access-log row with the same request ID. If there is exactly one, the pair is joined. Check the pair: the time, the key and the address should agree, and the two operation names should be the same kind of request.

**Then, where there is no shared key, join by time, key and address.** Some records carry no request ID. Your own incident logs are the main example: they hold the command and its time, but no request ID. A row can still be matched when the key and the address agree, the operation is the same kind, and the times differ by a few seconds at most. This match is weaker. A request ID names one request; three agreeing values only make one request very likely. So the joined table says which way each pair was joined.

**Last, explain what is left.** Some rows will stay alone. The CloudTrail-only list holds requests with no access-log line; the access-log-only list holds lines with no CloudTrail event. Every row in either list needs a reason, and the reason comes from your evidence, not from guessing:

| Ask of each lonely row | Where to look |
|---|---|
| Has its line or event arrived yet? | The delivery times in your collections, and a later collection |
| Could the other record ever hold it? | The trail's event selectors and the access-log setting from Session 11 |
| Did the request succeed? | The HTTP status, or `errorCode` in CloudTrail |
| Is it one of your own requests? | Your collection log, in Section 6 |

`s13-tools.py join` does the matching and writes three files: the joined pairs, the CloudTrail-only rows and the access-log-only rows. The two lists end in an empty column, `your_reason`. Filling it is your work.

{% include demo.html id="S13-D3" %}

<div class="box metaphor" markdown="1">

**The comparison.** Joining the two records is like matching a shop receipt with a line on a card statement by the transaction reference printed on both.

**Why it fits.** The shop and the bank each record the same payment, separately, in their own format. The reference number is the shared value: with it, you match the receipt to its line without trusting the amount or the time alone. Where a reference is missing, you can still match by amount, shop and time, but you are less sure, so you say so.

**Where it breaks.** A bank statement arrives every month, complete. The access logs are delivered on a {% include term.html t="best-effort-delivery" %} basis: a line may arrive hours late or never. And some requests are written into only one of the two records, depending on how each was set up, so a lonely row may be normal rather than a gap.

**So what.** Join by request ID first, fall back to time, key and address only where you must, and give every lonely row a reason from your evidence.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">A CloudTrail <code>GetObject</code> event has no matching access-log line. The incident happened four hours before the latest collection. Which statement is supported?</p>
  <ul class="qc-opts">
    <li data-key="a">The download did not happen, because S3 has no record of it</li>
    <li data-key="b">The CloudTrail event is false, because the two records disagree</li>
    <li data-key="c">No access-log line had arrived for this request by the latest collection; a later collection may still bring it</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). It states what was seen and when. A missing line is not evidence that nothing happened (a), and disagreement between records needs a reason, not a verdict (b).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Why the times in a pair can differ, and when the fallback can mislead</summary>

The access log's time is when S3 received the request; CloudTrail's `eventTime` is when the request was completed. Both come from AWS's computers, so in a pair they usually differ by a second or less, and the helper prints the difference for each pair. A large difference inside a pair is worth a look: a slow download of a big object can take longer.

The fallback can join the wrong rows when two requests of the same kind, for the same key, from the same address, fall within a few seconds of each other. The helper only joins a row when there is exactly one candidate; if there are several, it leaves the row alone and writes `several candidates` in its note, so that you decide.

`x-amz-id-2` in CloudTrail's `additionalEventData` and the access log's Host Id are a second shared value. If your request IDs ever seem to disagree, compare these too.
</details>

<div class="box key" markdown="1">

Correlation is a join: request ID first, then time, key and address, and a reason from your evidence for every row that stays alone.

</div>

## 5. What each record can cover

### The idea

Two records that both describe your bucket do not have to hold the same requests. Each was set up with its own scope, and each is delivered in its own way. Which requests a record can contain, and which it cannot, is its {% include term.html t="record-coverage" %}.

You do not need to guess it. Your join has already sorted every row into three groups: in both, in CloudTrail only, in the access logs only. Coverage is what those three groups show about each record, once each lonely row has its reason.

### How it works

Some limits on coverage are documented by AWS. These are the ones that touch your environment:

- **The selector.** Your trail records data events whose resource ARN starts with `arn:aws:s3:::<your case bucket>/`, as Session 11 set it. Data events for any other bucket are not recorded.
- **Failed sign-ins.** AWS says CloudTrail does not record requests that fail authentication, because the credentials were not valid, while the server access logs do. Requests refused for lack of permission (`AccessDenied`) are recorded by both.
- **S3's own actions.** Lifecycle actions, such as expiring old versions, appear only in the server access logs.
- **The log buckets.** Neither record covers requests to the trail bucket or the access-log bucket, because you did not switch that on. Your Session 12 downloads from those buckets are in neither.
- **Delivery.** CloudTrail delivers data events within minutes, typically. The access logs are best-effort and may be late or missing, as Session 12 showed.

**One question that AWS leaves open.** AWS lists `ListObjects` and `ListObjectVersions` among the object-level operations that CloudTrail can record as S3 data events. It also documents that "starts with the bucket ARN and a slash" is the way to record data events for all objects in a bucket. What it does not say is whether that selector matches a listing, which asks about a prefix in the bucket rather than about one object.

Your evidence answers this for your trail. You have two sets of test cases: the listings that part 2 of the incident made from CloudShell (`aws s3 ls`, and the recursive `aws s3 cp`, which lists the prefix before it downloads), and the version listings that your own collection made in Session 12. Look for them in each record:

```bash
jq -r --arg case "$CASE" '.Records[] | select(.eventSource=="s3.amazonaws.com" and .requestParameters.bucketName==$case and (.eventName|startswith("List"))) | [.eventTime,.eventName,.sourceIPAddress] | @tsv' $(cut -f2 "$W/trail-files-in-order.tsv") | sort
grep -h -E 'REST\.GET\.BUCKET(VERSIONS)? ' "$W"/access-logs/case/* | cut -d' ' -f3-8
```

Whatever you find is the answer for your evidence: listings in both records, or in the access logs only. Write it as a finding, with the rows that show it. If your access logs do not yet hold the listing either, you cannot answer yet, and that too is what you write.

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "CloudTrail records every request to the bucket." | "CloudTrail records the requests that match the trail's selectors and that pass authentication." | Coverage comes from settings and from AWS's rules. |
| "The access log has more lines, so it is the better record." | "Each record holds some requests that the other does not; my join shows which." | A comparison needs the rows and their reasons, not a count. |
| "The listing is not in CloudTrail, so it did not happen." | "The listing is not in CloudTrail; the access log holds it." | A record's silence about a request may be its coverage, not the request's absence. |

</div>

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">An access-log line shows HTTP status <code>403</code> and error code <code>InvalidAccessKeyId</code>. The student finds no CloudTrail event at that time. What is the best reading?</p>
  <ul class="qc-opts">
    <li data-key="a">CloudTrail lost the event, so its files should be validated again</li>
    <li data-key="b">The request failed authentication, which CloudTrail does not record, so only the access log could hold it</li>
    <li data-key="c">The access-log line is false, because CloudTrail records every request</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). An invalid key fails authentication, and AWS documents that CloudTrail does not record such requests. Nothing points to a lost file (a), and CloudTrail does not record every request (c).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Coverage is a readiness finding too</summary>

When a record cannot hold a kind of request, that is a fact about how the environment was prepared, not only about the incident. It belongs in two places in your report: as a limitation of what your timeline can show, and, if it mattered, as the starting point of a recommendation. Section 9 gives the method for both.

AWS's table of S3 logging options also lists other differences, for example that only CloudTrail can be limited to a prefix, and that only CloudTrail log files carry integrity validation. You met the second in Session 12. Use such general facts only to explain rows you actually have.
</details>

<div class="box key" markdown="1">

Coverage is read from your own join: what each record holds, what it cannot hold, and why. AWS documents some limits; your rows show the rest.

</div>

## 6. Setting your own requests apart

### The idea

Session 12 warned you: your collection's requests to the case bucket are in the records too. They look like the incident's. They were made by the same IAM user, probably from the same address as part 1 of the incident, with the same program.

The incident is what you investigate. Your collection is how you investigated. A stranger reading your timeline must be able to tell them apart at a glance, and must also be able to see that you hid nothing. So you **tag** your requests and **set them aside**. You never delete them.

### How it works

Your `collection-log.txt` holds the evidence you need: the start and end time of each collection, and your address at each point. Write those windows into a small file, one line per collection, in UTC:

```
2026-10-14T10:39:53Z	2026-10-14T10:51:20Z	c1
```

Then every row whose time falls inside a window gets the tag `analyst-c1`. Check each tagged row against two more facts:

1. **Its address** is the address your collection log recorded.
2. **Its kind of request** is one your collection made: version listings, head requests, downloads by version ID. The incident never made a head request and never asked for a version by its ID.

A row inside a window that fails these checks is not tagged. It is something else that happened during your collection, and it needs its own explanation.

The second collection made no request to the case bucket, but your later steps today might: an extra listing, or the audit tool at the end. Each gets its own window in the same file.

{% include demo.html id="S13-D4" %}

<div class="box metaphor" markdown="1">

**The comparison.** Your tagged requests are like the test tone that a sound engineer records at the start of a tape.

**Why it fits.** The tone is on the tape for a reason, the engineer wrote down when it was recorded, and it stays there. Nobody cuts it out; everyone who plays the tape knows to skip it. Your requests stay in the rows, labelled, and the incident's view skips them.

**Where it breaks.** A test tone sounds nothing like the music. Your requests look exactly like the incident's: same user, same program, perhaps the same address. Only your notes, made at the time, separate them. Without the collection log, the tag would be a guess.

**So what.** Tag your requests from your collection log, check each one, and keep them in every file. The tag is a claim that your log supports.

</div>

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">Inside the window of collection c1, a student finds a <code>PutObject</code> from the same user and address. Her collection made only listings, head requests and downloads. What should she do?</p>
  <ul class="qc-opts">
    <li data-key="a">Leave it untagged, and investigate it as an unexplained write that happened during her collection</li>
    <li data-key="b">Tag it as analyst, because it falls inside the window</li>
    <li data-key="c">Delete it from her rows, because it confuses the timeline</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). Her collection never uploaded anything, so the time alone does not make it hers (b). Deleting a row (c) destroys evidence and hides it from a stranger.</p></div>

</div>

<div class="box key" markdown="1">

Tag your own requests from your collection log, check each one by address and kind, and set them aside without deleting them.

</div>

## 7. Who and where: identity and network

### The idea

Two parts of your incident came from two places. Part 1 ran on Kali, on your own network. Part 2 ran in CloudShell, on AWS's computers. The records name an identity and an address for every request. Today you learn to show what each address is, and to say exactly what that shows.

Session 7 gave you the rule: **an address identifies a device on a network at a time, not a person.** Nothing in the cloud changes it.

### How it works

**The identity.** For each part of the incident, read `userIdentity` from the joined rows: the type, the ARN, and the kind of access key (`AKIA` or `ASIA`, Section 1). Read `userAgent` too: AWS's CLI writes the environment it runs in into its user agent, and when it runs in CloudShell that text usually contains `exec-env/CloudShell`. Remember that this is the program's own claim.

**The address.** Collect every address in your rows, with a count:

```bash
cut -f5 "$R/ct-rows.tsv" "$R/sal-rows.tsv" | grep -v '^address$' | sort | uniq -c
```

Then set each one beside the address that your own logs recorded with `checkip.amazonaws.com`: `incident-log.txt` for Kali and `part2-log.txt` for CloudShell. Those addresses are what the outside world saw. If CloudTrail's address for a request is different from the one your own log recorded, that difference needs a reason before you write anything about it.

**Which network.** An address belongs to a block of addresses, an {% include term.html t="ip-range" %}, that one network uses. AWS publishes the ranges it uses as a file, `ip-ranges.json`. Each entry gives a range, the service that uses it, and the Region. To show that an address is on AWS's network, you download the file, hash it and record it like any other item of evidence, and look the address up:

```bash
python3 s13-tools.py network records/ip-ranges.json 203.0.113.24 198.51.100.73
```

The answer is either the matching ranges, with their service and Region, or `no match in this file`. For an address that is not AWS's, the second route is the regional internet registry: `whois` on Kali asks it who holds the range, usually an internet service provider.

<div class="box metaphor" markdown="1">

**The comparison.** Finding which network an address belongs to is like reading the postmark on a letter.

**Why it fits.** The postmark shows which post office handled the letter, and when. It is printed by the post office, not by the writer, and a published list tells you where each office is. AWS's published ranges are that list for its addresses; the registry is the list for everyone else's.

**Where it breaks.** A postmark at least shows the town the writer was in. An address in AWS's ranges only shows that the request left from AWS's network, which millions of customers share: it says nothing about which customer, which account or which person. And the list changes over time, so you record the copy you used and its date.

**So what.** The network check shows where a request entered the internet. The identity and your other evidence must carry everything after that, step by step, as in Session 7.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">An address in a <code>DeleteObject</code> event matches an AWS range for service <code>EC2</code> in <code>ap-south-1</code>. Which statement is supported by that match alone?</p>
  <ul class="qc-opts">
    <li data-key="a">The account owner deleted the object</li>
    <li data-key="b">The request came from the suspect's own computer</li>
    <li data-key="c">The request reached S3 from an address on AWS's network in the Mumbai Region, at that time</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). The range shows the network and the Region, and nothing more. Who acted (a) needs the identity and other evidence, and an AWS address points away from any home or office network, not towards one (b).</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Reading ip-ranges.json and the registry</summary>

The file has a `syncToken` and a `createDate`, which tell you which edition you downloaded, and two lists: `prefixes` for IPv4 and `ipv6_prefixes` for IPv6. One address can match several entries: the service `AMAZON` covers all of AWS's ranges, and a second entry such as `EC2` names the service more closely. The helper prints every match, the narrowest range first.

`no match in this file` means only that: the address is not in AWS's published list as of that edition. Record it in those words.

`whois` asks the regional internet registry that holds a range, in Asia that is usually APNIC, and the answer names the organisation and its range. Like the postmark, it names a network, never a household or a person.

The address in a CloudTrail event is the one that AWS saw arriving. Requests from inside AWS can arrive by routes that show a different address, and AWS writes some requests that it makes for you as a service name or `AWS Internal`. That is why your own log's record of the address, made at the time, is worth setting beside it.
</details>

<div class="box key" markdown="1">

An identity names an account, and an address names a device on a network at a time. A published range shows which network; it never shows which person.

</div>

## 8. The timeline as an argument

### The idea

Now the rows become a {% include term.html t="timeline" %}. You know the method from Session 5: every event in one time standard, UTC, in the unit's seven columns, sorted by time. Session 8 added rows from another tool to the same columns. Today two more sources join: the two AWS records.

There is a third source, and it is the most unusual one in the module. Your own incident logs from Session 11, `incident-log.txt` and `part2-log.txt`, record every command you ran, with its time in UTC. They were written by you, not by AWS. They go into the timeline as their own rows, with their own tag.

### How it works

Each row keeps the seven columns, with these values:

| Column | CloudTrail row | Access-log row | Your incident log row |
|---|---|---|---|
| `timestamp_utc` | `eventTime` | The converted time | The time at the start of the line |
| `timestamp_desc` | `CloudTrail eventTime` | `Access log request time` | `Command started (own log)` |
| `source` | The file, from the last column of the row | The file, from the last column | `incident-log.txt` or `part2-log.txt` |
| `artefact` | `CloudTrail data event` | `S3 server access log` | `own incident log` |
| `description` | Operation, key, version, identity, address, request ID | The same, with the HTTP status | The command you ran |
| `original_zone` | `UTC` | `UTC (+0000 in the record)` | `UTC (date -u)` |
| `tag` | Your tag, for example `analyst-c1` | Your tag | `own-log` |

All three sources are already in UTC, so normalisation here is a check, not a conversion: the `original_zone` column records that you checked.

**Testing the provider's record.** Set your own log's rows beside the joined pairs. For each command in your log there should be a request in the records, a second or so after it, from the address you recorded. Where they agree, the timeline is firm: three records, two of them written by AWS and one by you, say the same thing. Where they disagree, you have something to explain: a request with no command, a command with no request, or times that differ by more than a few seconds. A difference that is the same for every row points to a clock: your Kali VM's clock against AWS's.

{% include demo.html id="S13-D5" %}

<div class="box mixups" markdown="1">

| People say | Better | Why |
|---|---|---|
| "The timeline shows what happened." | "The timeline shows what the records say happened, and where they agree." | Every row is someone's record, never the event itself. |
| "My own log proves the incident." | "My own log is an independent record that I can test the provider's against." | You wrote it; it supports, but it is also a record with a clock. |
| "There is a gap, so I leave that period out." | "There is a gap; I state it, with its reason." | A stated gap is part of the argument; a hidden one weakens all of it. |

</div>

### Your own spinning top

<div class="box lens" markdown="1">

**Through another lens: the totem in *Inception*.** In Session 11 you met Christopher Nolan's film, where people move through dreams inside dreams and cannot tell which level they are on. Each of them keeps a totem: a small object whose behaviour only its owner knows. The hero's is a spinning top. In a dream it spins for ever; in the waking world it falls. Session 11 called it a private test, and set it against the provider's records, which anyone can check.

Today you hold a totem of your own. Your incident logs were written by you, on your machine, as each command ran. AWS never touched them. When you set them beside the provider's records, they are your test of which layer you are standing on: if the provider's account and yours agree, you are on solid ground.

**Where it breaks.** The film ends on the top still spinning, and never tells you whether it falls. Your test has an answer: every line of your log can be checked against a request ID, a key, an address and a time. And there is a harder break. A real suspect keeps no such log. In a real case, the investigator has no totem, so the two provider records must test each other. That is exactly what your join in Section 4 did.

**The question it raises.** If your timeline rested on one record only, with nothing to test it against, how much of it could you defend?

</div>

<div class="box key" markdown="1">

**The pivotal idea.** A timeline is an argument built from records you did not write; it holds only where they agree, and its gaps must be stated.

</div>

That sentence is the lab. You join the records to find where they agree, test them against your own log, and write down every gap.

<div class="qc" data-answer="b" markdown="0">
  <p class="qc-q">Every request in a student's records is 41 seconds later than the matching command in her own incident log, from the first upload to the last. What is the most likely explanation?</p>
  <ul class="qc-opts">
    <li data-key="a">Each request waited 41 seconds in a queue at AWS</li>
    <li data-key="b">Her Kali VM's clock was about 41 seconds behind AWS's clock when she ran the incident</li>
    <li data-key="c">The records are wrong, because her own log was written first</li>
  </ul>
  <div class="qc-why"><p>Answer: (b). A difference that is the same for every row points to one clock against another. Real delays vary from request to request (a). Writing first does not make a record right (c): both are records, and the difference is explained, then stated.</p></div>

</div>

## 9. Limitations and recommendations: two methods

### The idea

A report does not end with the timeline. It also says how far the reader can rely on it, and what should change. These are two different statements, and each has a method.

A {% include term.html t="limitation" %} is a known weakness in the evidence or the method that could change a conclusion, stated with its effect. A {% include term.html t="recommendation" %} is a proposed change, tied to a {% include term.html t="finding" %} and to the risk it showed, with the evidence that supports it. Neither is a list copied from somewhere else. Each comes from your evidence.

### How it works

**Limitations.** Work through these categories one at a time, and for each, ask the question of your own evidence. Some will give you a limitation; some will not.

| Category | The question to ask of your evidence | Where to look |
|---|---|---|
| Delivery | Had every record arrived when I collected, and how do I know? | Your collections' times, the join's lonely rows, `two-clocks.md` |
| Coverage | Which requests could a record not hold, and did any matter here? | Section 5, your selectors |
| Retention | How long will each record exist, and what had already gone? | The trail's and buckets' settings, Event history's 90 days |
| Clocks | Do the clocks in my sources agree, and to what precision? | Section 8's comparison |
| My own requests | What did my collection add to the records, and is all of it tagged? | Section 6 |
| Identity and address | What can the identity and the address show, and what can they not? | Section 7 |

Write each limitation you find in three parts: **what you saw**, **its effect on a conclusion**, and **the evidence that shows it**. "Server access logs are best-effort" is a fact. "The access logs hold no line for one of the three downloads, so that download rests on CloudTrail alone; see `sal-only.tsv` and the c2 collection time" is a limitation.

**Recommendations.** Build each one as a chain of four links:

1. **The finding:** what happened, from your timeline.
2. **The risk it shows:** what could go wrong because of it, for this bucket and this kind of data.
3. **The change that would have helped:** one specific change to logging, detection or readiness.
4. **The evidence that supports it:** the rows, files or settings that show the finding and why the change follows.

A recommendation that cannot name its finding is a general wish. A recommendation that cannot name its evidence is an opinion. Both links must be there.

<div class="box metaphor" markdown="1">

**The comparison.** A recommendation is like a prescription: it follows a diagnosis, for this patient, from these test results.

**Why it fits.** A doctor does not prescribe because a medicine is good in general. She prescribes because of a finding, for a risk it shows, and the patient's notes record why. Your recommendation follows a finding in your timeline, for a risk it shows, and your report records the evidence.

**Where it breaks.** Medicine has agreed guidelines that link a diagnosis to a treatment. Cloud security has many tools and checklists, but none of them knows your incident. A tool's list of weaknesses is like a page of test results with no patient attached: useful, but not yet a diagnosis.

**So what.** Start every recommendation from a finding in your own evidence. A tool's output, or a list of good practice, becomes a recommendation only when you tie it to that finding.

</div>

<div class="qc" data-answer="c" markdown="0">
  <p class="qc-q">Which of these is a recommendation written by the method?</p>
  <ul class="qc-opts">
    <li data-key="a">"Cloud logging should always be improved."</li>
    <li data-key="b">"A security tool reported 14 warnings about the account, so all of them should be fixed."</li>
    <li data-key="c">"A finding from the timeline, the risk it showed for this bucket, one specific change, and the rows that support both."</li>
  </ul>
  <div class="qc-why"><p>Answer: (c). It has all four links. (a) has no finding, no risk and no evidence. (b) starts from a tool's output, not from a finding in this incident.</p></div>

</div>

<details class="deeper" markdown="1">
<summary>Ordering several recommendations</summary>

When you have more than one, put them in order and say why. Two questions help: how serious is the risk that each one addresses, judged from your findings, and how much effort does the change cost. A change that closes a serious risk at little cost comes first. Say what each ranking rests on, in a sentence; the reader may weigh it differently, and should be able to see why you did not.

A recommendation is not a response action. Response actions are what you would do about this incident now, such as containment. Recommendations change what happens next time. Your report has room for both; Session 17 returns to response actions.
</details>

<div class="box key" markdown="1">

A limitation is what you saw, its effect, and its evidence. A recommendation is a finding, a risk, a change and its evidence. Both come from your files.

</div>

## 10. The report template

### The idea

Your coursework report has a fixed shape. The {% include term.html t="report-template" %} gives you that shape now, with its headings in order and a short note under each, so that you start writing while the analysis is fresh. Today you write two parts into it: the first draft of the timeline section and one recommendation. Session 16 returns to the template and to the craft of report writing in depth.

<div class="box lms" markdown="1">

The report template is on the LMS, as a Word file and as a plain text file with the same headings. Download it and save your copy in `~/nb6018-cw/s13/report/`. The LMS also carries the helper `s13-tools.py`, the catch-up checklist and the dates of the coursework. Use the LMS for anything about dates.

</div>

### How it works

Each section of the template has one job. This is what the reader needs from each:

| Section | Its job |
|---|---|
| Executive summary | What happened, how sure you are, and what should change, for a reader who reads nothing else |
| Environment and method | What was set up, how the evidence was collected and preserved, and with which tools, so that a stranger could repeat it |
| Findings | What the evidence shows, each finding with its evidence named: the timeline, the correlation of the records, and the attribution of the actions |
| Limitations | What weakens the findings, and by how much, by the method of Section 9 |
| Incident response actions and recommendations | What to do about this incident, and what should change, each tied to a finding |
| References | The sources you relied on, in one consistent style |
| Appendices | The command and collection logs, the hash values and custody record, and supporting screenshots |

The timeline section can carry your full timeline as a table, or a short timeline of the key events with the full one in an appendix. Either way, every row a reader sees keeps its source and its UTC time.

<div class="qc" data-answer="a" markdown="0">
  <p class="qc-q">Where in the template does the statement "the access logs hold no line for one download" belong?</p>
  <ul class="qc-opts">
    <li data-key="a">Limitations, written with its effect on a conclusion and its evidence</li>
    <li data-key="b">Recommendations, because it describes a weakness</li>
    <li data-key="c">Nowhere, because it is a problem with the evidence</li>
  </ul>
  <div class="qc-why"><p>Answer: (a). It weakens what the evidence can show, so it is a limitation. It can become the start of a recommendation only through the four links (b). Leaving it out (c) hides a gap, which weakens the whole report.</p></div>

</div>

<div class="box key" markdown="1">

The template fixes the report's shape. Each section has one job, and every finding in it names its evidence.

</div>

## 11. The lab: read the records, rebuild the incident

Your task in one line: from your Kali VM, turn your sealed evidence into rows, join the two records, set your own requests aside, show which network each address belongs to, build the incident's timeline in UTC and test it against your own logs, then write the first draft of the timeline section and one recommendation.

You need the Kali VM, your folders `~/nb6018-cw/s11/` and `~/nb6018-cw/s12/` from the last two sessions, and the helper `s13-tools.py` and the report template from the LMS. The Windows VM and REMnux stay off. Allow about two hours and ten minutes.

<div class="box safety" markdown="1">

**This is still your coursework evidence. Five rules.**

1. **Read only from `work/` and the sealed folders.** Never edit, move or decompress anything inside `evidence/`.
2. **Keep everything you make** in `~/nb6018-cw/s13/`. Never delete a row from your evidence files, even one you set aside.
3. **Record every request to AWS** in your collection log before you make it. Today that is at most a third collection of the log buckets and the optional audit tool.
4. **Never show a secret, and mask your account ID** and access key IDs in anything you show.
5. **Write your own words.** Your findings, limitations and recommendations come from your evidence; never copy wording from this page, a classmate or a tool.

</div>

### Part A: confirm the evidence, and prepare

1. **Create today's folder and environment.**

   ```bash
   mkdir -p ~/nb6018-cw/s13/{records,report}
   cat > ~/nb6018-cw/s13/s13-env.sh <<'EOF'
   source "$HOME/nb6018-cw/s12/s12-env.sh"
   S13="$HOME/nb6018-cw/s13"
   R="$S13/records"
   B=$(ls -d "$S12"/evidence/c*-* | sort | tail -n 1)
   W="$S12/work/$(basename "$B" | cut -d- -f1)"
   true
   EOF
   source ~/nb6018-cw/s13/s13-env.sh
   echo "base: $B"; echo "work: $W"
   cp ~/Downloads/s13-tools.py "$S13/" && sha256sum "$S13/s13-tools.py"
   ```

   `B` is your latest collection, the base of today's analysis, because it holds every log file of the earlier ones. `W` is its working copy. In every new terminal, run `source ~/nb6018-cw/s13/s13-env.sh` again.

   <div class="box expect" markdown="1">

   The base is your newest folder, for example `evidence/c2-20261014T1930Z`, and the working copy is `work/c2`. The helper's SHA-256 value, which you note in `records/`.

   </div>

   <div class="box trouble" markdown="1">

   If the base is `c1`, you never ran Session 12's Part I: run it now, then start again. If `s13-tools.py` is not in `Downloads`, copy it from wherever you saved it, or make it from the code in "The helper, in full" below.

   </div>

2. **Check every sealed collection against its manifest.**

   ```bash
   for c in "$S12"/evidence/c*-*; do
     ( cd "$c" && sha256sum -c --quiet manifest-sha256.txt ) && echo "$(basename "$c"): every file matches"
   done
   clog "S13 start: manifests re-checked before analysis"
   ```

   <div class="box expect" markdown="1">

   One `every file matches` line for each collection, and a new line in your collection log.

   </div>

   <div class="box trouble" markdown="1">

   If any file fails, stop. Record the file and the time, and tell the lecturer. Never analyse from a collection that does not match its manifest.

   </div>

3. **Make the working copy of the base, and prove it matches the originals.** Session 12 made `work/c1` only.

   ```bash
   mkdir -p "$W" && cp -r "$B/trail" "$B/access-logs" "$W/" && chmod -R u+w "$W"
   find "$W/trail" -name '*.json.gz' -exec gunzip {} +
   n=0; for f in $(find "$W/trail" -name '*.json'); do
     gunzip -c "$B/${f#$W/}.gz" | cmp -s - "$f" || { echo "DIFFERENT: $f"; n=$((n+1)); }
   done; echo "$n CloudTrail working copies differ from their originals"
   diff -rq "$B/access-logs" "$W/access-logs" && echo "access-log working copies identical"
   find "$W/trail" -path '*/CloudTrail/*' -name '*.json' | awk -F_ '{print $(NF-1) "\t" $0}' | sort > "$W/trail-files-in-order.tsv"
   clog "S13 working copy $W made from $(basename "$B") and checked against the originals"
   ```

   <div class="box expect" markdown="1">

   `0 CloudTrail working copies differ from their originals` and `access-log working copies identical`. Each decompressed file is exactly the content of a sealed original whose hash value is in the manifest, so every row you build today can be traced to the manifest.

   </div>

   <div class="box trouble" markdown="1">

   If `work/c2` already exists from an earlier attempt, delete only that working folder and run the step again: working copies can always be remade. If a file differs, make the working copy again; if it still differs, record it and tell the lecturer.

   </div>

4. **Decide whether a third collection is needed.** Look at when the newest access-log file of your base landed, and how long after the incident that was:

   ```bash
   tail -n 1 "$B/listings/access-logs-landed.tsv" | cut -f1
   grep -h -E 'START|END' ~/nb6018-cw/s11/incident/*.txt
   ```

   If your base collection was made less than about a day after the incident, collect the two log buckets again into `c3`, exactly as Session 12's Part I did, recording it in the same way; then run steps 1 to 3 again so that `c3` is your base. Part D will also show whether lines are still missing.

   <div class="box expect" markdown="1">

   Two times, and a decision that you write in `records/s13-notes.md` in one sentence, with the reason.

   </div>

   <div class="box trouble" markdown="1">

   A third collection reads only the log buckets: it makes no request to the case bucket, so it adds nothing to the records you analyse.

   </div>

### Part B: CloudTrail into rows

{: start="5"}
5. **Write the filter into a file, and run it over every CloudTrail file.**

   ```bash
   cat > "$S13/ct-rows.jq" <<'EOF'
   .Records[]
   | select(.eventSource == "s3.amazonaws.com" and .requestParameters.bucketName == $case)
   | [ .eventTime, "CT", .eventName,
       (.userIdentity.arn // .userIdentity.type),
       .sourceIPAddress,
       (.requestParameters.key // (if .requestParameters.prefix then "prefix=" + (.requestParameters.prefix | tostring) else "-" end)),
       (.requestParameters.versionId // .responseElements."x-amz-version-id" // "-"),
       .requestID, (.eventCategory // "-"), (.userAgent // "-"), .eventID, input_filename ]
   | map(. // "-" | tostring) | @tsv
   EOF
   sha256sum "$S13/ct-rows.jq"
   { printf 'time_utc\trecord\toperation\tidentity\taddress\tkey\tversion_id\trequest_id\tdetail\tuser_agent\trecord_id\tsource_file\n'
     cut -f2 "$W/trail-files-in-order.tsv" | xargs -d '\n' jq -r --arg case "$CASE" -f "$S13/ct-rows.jq" | sort
   } > "$R/ct-rows.tsv"
   wc -l < "$R/ct-rows.tsv"; cut -f1,3,5,6 "$R/ct-rows.tsv" | column -t -s "$(printf '\t')" | head -n 15
   ```

   <div class="box expect" markdown="1">

   A header and one row for each request about your case bucket, in time order: the nine `PutObject` rows of part 1, then part 2's requests from CloudShell, then your Session 12 collection. The detail column says `Data` for data events; a `Management` row is a request about the bucket's settings.

   </div>

   <div class="box trouble" markdown="1">

   If you get only the header, check that `$CASE` holds your case bucket's name (`echo "$CASE"`). If jq reports a syntax error, compare your filter file with the page, character by character: a missing quote is the usual cause. If `column` is missing, leave it out; the file is the same.

   </div>

6. **Count what you have, by kind.**

   ```bash
   cut -f3,9 "$R/ct-rows.tsv" | sort | uniq -c
   ```

   <div class="box expect" markdown="1">

   A count for each pair of operation and category, such as `9 PutObject Data`. Write the counts in your notes: they are the first check of the incident's shape.

   </div>

   <div class="box trouble" markdown="1">

   If the uploads are fewer than you made, check whether the newest CloudTrail files were collected: compare the last `eventTime` with your collection time.

   </div>

### Part C: the access logs into rows

{: start="7"}
7. **Run the helper over the access-log files.**

   ```bash
   python3 "$S13/s13-tools.py" sal $(find "$W/access-logs" -type f | sort) > "$R/sal-rows.tsv"
   wc -l < "$R/sal-rows.tsv"; cut -f1,3,5,6,7,9 "$R/sal-rows.tsv" | column -t -s "$(printf '\t')" | head -n 15
   cut -f3 "$R/sal-rows.tsv" | sort | uniq -c
   ```

   <div class="box expect" markdown="1">

   The same twelve columns as the CloudTrail rows, with `SAL` in the record column, times in the form `2026-10-14T09:12:05Z`, operation names such as `REST.PUT.OBJECT`, keys with `/`, and the HTTP status in the detail column. A count for each operation name.

   </div>

   <div class="box trouble" markdown="1">

   If the helper says some lines were skipped, open one of the files and look for a line that does not begin with the long owner code: it may be cut off. Note it. If you get only the header, your base holds no access-log files yet: go back to step 4.

   </div>

### Part D: join the two records

{: start="8"}
8. **Join, and read the counts.**

   ```bash
   mkdir -p "$R/join"
   python3 "$S13/s13-tools.py" join "$R/ct-rows.tsv" "$R/sal-rows.tsv" "$R/join" 5
   cut -f1,2,5,8,17 "$R/join/matched.tsv" | column -t -s "$(printf '\t')" | head -n 12
   ```

   <div class="box expect" markdown="1">

   Four lines of counts: rows in each record, pairs joined by request ID and by time, key and address, and rows left alone on each side. Most pairs join by request ID, a second or less apart.

   </div>

   <div class="box trouble" markdown="1">

   If nothing joins by request ID, check the columns: the request ID must be column 8 in both files. If the counts look reversed, check the order of the two files in the command: CloudTrail first.

   </div>

9. **Give every lonely row its reason.** Open `join/ct-only.tsv` and `join/sal-only.tsv` in a text editor or a spreadsheet, and fill the column `your_reason` for every row, using the four questions of Section 4. Save them under new names, `ct-only-reasons.tsv` and `sal-only-reasons.tsv`, so that the helper's output stays as it was.

   <div class="box expect" markdown="1">

   No row without a reason. Your reasons point to evidence: a delivery time, a selector, a status code, your collection log.

   </div>

   <div class="box trouble" markdown="1">

   If a row has no reason you can support, write "unexplained" and what you checked. An honest "unexplained" is a finding; an invented reason is not.

   </div>

10. **Check the listings.** Run the two commands from Section 5, and write what you find for part 2's listings and for your own version listings, in one sentence each, in `records/s13-notes.md`.

    <div class="box expect" markdown="1">

    Each listing found in the access logs, and, depending on your trail, found or not found in CloudTrail. Your sentence states which, with the times.

    </div>

    <div class="box trouble" markdown="1">

    If a listing is in neither record, check whether the access-log file for that hour has arrived. If it has not, your answer is "not yet known", with the time of your latest collection.

    </div>

### Part E: set your own requests apart

{: start="11"}
11. **Write your collection windows, then tag.**

    ```bash
    grep -E 'collection start|collection end|address at' "$S12/collection-log.txt"
    nano "$R/analyst-windows.tsv"
    ```

    Write one line for each collection that made requests to the case bucket: its start time, its end time and its name, separated by tab characters, in UTC, from the collection log. Then tag both sets of rows:

    ```bash
    for f in ct-rows sal-rows; do
      awk -F'\t' -v OFS='\t' 'NR==FNR { s[++n]=$1; e[n]=$2; l[n]=$3; next }
        FNR==1 { print $0, "tag"; next }
        { t="-"; for (i=1; i<=n; i++) if ($1 >= s[i] && $1 <= e[i]) t="analyst-" l[i]; print $0, t }' \
        "$R/analyst-windows.tsv" "$R/$f.tsv" > "$R/$f-tagged.tsv"
    done
    awk -F'\t' 'NR>1 && $13 != "-" {print $13, $3, $5}' "$R/ct-rows-tagged.tsv" | sort | uniq -c
    ```

    <div class="box expect" markdown="1">

    Your tagged CloudTrail rows, counted by kind and address: version listings, head requests and downloads by version ID, all from your collection address. Section 3 of Session 12 expected about fourteen.

    </div>

    <div class="box trouble" markdown="1">

    If a tagged row is of a kind your collection never made, or from another address, remove its window line, narrow the window, and tag again: that row is not yours, and it needs its own explanation in your notes. If nothing is tagged, check that the windows are in UTC and in the same form as the rows.

    </div>

### Part F: identity and network

{: start="12"}
12. **Read the identities, the keys and the programs.**

    ```bash
    xargs -a <(cut -f2 "$W/trail-files-in-order.tsv") -d '\n' jq -r --arg case "$CASE" '.Records[] | select(.eventSource=="s3.amazonaws.com" and .requestParameters.bucketName==$case) | [.userIdentity.type, .userIdentity.arn, ((.userIdentity.accessKeyId // "-")[0:4] + "..." + (.userIdentity.accessKeyId // "-")[-4:]), .sourceIPAddress, (if (.userAgent|test("exec-env/CloudShell")) then "CloudShell" else "other" end)] | @tsv' | sort | uniq -c
    ```

    <div class="box expect" markdown="1">

    A few lines, each a combination of identity, masked key, address and program with its count. Expect at least two: one with an `AKIA` key from your Kali address, and one with an `ASIA` key marked `CloudShell`.

    </div>

    <div class="box trouble" markdown="1">

    If a line shows `-...-` for the key, that event carried no access key ID: look at its identity type, which may be an AWS service acting for you.

    </div>

13. **Download AWS's ranges, record them, and look up every address.**

    ```bash
    clog "download ip-ranges.json from ip-ranges.amazonaws.com (no request to my account)"
    curl -s -o "$R/ip-ranges.json" https://ip-ranges.amazonaws.com/ip-ranges.json
    clog "ip-ranges.json SHA-256 $(sha256sum "$R/ip-ranges.json" | cut -d' ' -f1)"
    cut -f5 "$R/ct-rows.tsv" "$R/sal-rows.tsv" | grep -v '^address$' | sort | uniq -c
    python3 "$S13/s13-tools.py" network "$R/ip-ranges.json" $(cut -f5 "$R/ct-rows.tsv" "$R/sal-rows.tsv" | grep -v '^address$' | sort -u)
    grep -h 'public address' ~/nb6018-cw/s11/incident/*.txt
    ```

    Enter `ip-ranges.json` in your evidence register as a new item, with its source, time and hash value. For any address that matches no range, run `whois` on it and note the organisation and the range it names.

    <div class="box expect" markdown="1">

    The `createDate` and `syncToken` of the file, then each address with its matches. Your Kali address, `no match in this file`; the address of part 2, matched to AWS ranges with a Region. The two `public address` lines from your own logs, to set beside them.

    </div>

    <div class="box trouble" markdown="1">

    If `curl` gives an empty file, Kali has no internet: fix the network and repeat. If an address in the records is not the one your own log recorded, write both in your notes before you interpret either.

    </div>

### Part G: build the timeline and test it

{: start="14"}
14. **Turn every row into the unit's seven columns.**

    ```bash
    cat > "$S13/timeline.awk" <<'EOF'
    function q(s) { gsub(/"/, "\"\"", s); return "\"" s "\"" }
    BEGIN { FS = "\t"; OFS = "," }
    FNR == 1 && FILENAME ~ /rows-tagged\.tsv$/ { next }
    FILENAME ~ /ct-rows-tagged\.tsv$/ {
      print $1, "CloudTrail eventTime", q($12), "CloudTrail data event", q($3 " " $6 " version " $7 " by " $4 " from " $5 " request " $8), "UTC", $13; next }
    FILENAME ~ /sal-rows-tagged\.tsv$/ {
      print $1, "Access log request time", q($12), "S3 server access log", q($3 " " $6 " version " $7 " by " $4 " from " $5 " request " $8 " status " $9), "UTC (+0000 in the record)", $13; next }
    /  RUN / {
      t = substr($0, 1, 20); d = substr($0, 23)
      print t, "Command started (own log)", q(FILENAME), "own incident log", q(d), "UTC (date -u)", "own-log" }
    EOF
    { echo "timestamp_utc,timestamp_desc,source,artefact,description,original_zone,tag"
      awk -f "$S13/timeline.awk" "$R/ct-rows-tagged.tsv" "$R/sal-rows-tagged.tsv" \
          ~/nb6018-cw/s11/incident/incident-log.txt ~/nb6018-cw/s11/incident/part2-log.txt | sort
    } > "$R/s13-timeline-utc.csv"
    wc -l < "$R/s13-timeline-utc.csv"; head -n 6 "$R/s13-timeline-utc.csv"
    ```

    <div class="box expect" markdown="1">

    A CSV file with the seven columns of Session 5. For each upload of part 1, three rows within a few seconds: your command, the access-log line and the CloudTrail event. Your collection's rows carry their `analyst-` tag.

    </div>

    <div class="box trouble" markdown="1">

    If a spreadsheet shows the columns shifted, a description contains a character the spreadsheet misread: open the file in a text editor to check, and import it as CSV with the double quote as the text marker.

    </div>

15. **Test the records against your own log.** Put the `own-log` rows beside the joined pairs, command by command:

    ```bash
    grep ',own-log$' "$R/s13-timeline-utc.csv" | cut -c1-20 > "$R/own-times.txt"
    awk -F'\t' 'NR>1 {print $3, $5, $8, $7}' "$R/join/matched.tsv" | head -n 20
    ```

    For each command in your logs, find its request, note the seconds between them, and mark where the records and your log agree and where they do not. Write the result in `records/s13-notes.md`: how many commands matched, the usual difference in seconds, and every disagreement with your reason.

    <div class="box expect" markdown="1">

    Each upload, listing, download and delete in your logs matched to a request a second or two later, from the address your log recorded. A few seconds' steady difference is a clock; a missing request is a gap to explain.

    </div>

    <div class="box trouble" markdown="1">

    If every difference is large and the same, your Kali VM's clock was off: state the difference as a finding about your own record, and keep the provider's times as the times of the requests.

    </div>

### Part H: write into the template

{: start="16"}
16. **Draft the timeline section.** In your copy of the report template, write the first draft of the timeline part of Findings: the incident's key events in UTC, each with its source, built from your timeline file, with your own requests left out of the incident's view and named in a sentence. Say in one or two sentences where the three records agreed and where they did not.

    <div class="box expect" markdown="1">

    A short table or list that a stranger could check, row by row, against `s13-timeline-utc.csv`.

    </div>

    <div class="box trouble" markdown="1">

    If you are unsure whether an event belongs, ask: is it part of the incident, and does a record support it? If both, it belongs. If the second is no, it belongs in Limitations instead.

    </div>

17. **Draft one recommendation by the method.** Choose one finding from your timeline or your coverage check. Write the four links of Section 9 in your own words, under the heading for recommendations.

    <div class="box expect" markdown="1">

    One recommendation with a finding, a risk, a change and named evidence. Not a list; one.

    </div>

    <div class="box trouble" markdown="1">

    If your change could apply to any account in the world without changing a word, it is not yet tied to your finding: go back to link 1.

    </div>

18. **Close the session's record.**

    ```bash
    ( cd "$R" && sha256sum *.tsv *.csv join/*.tsv 2>/dev/null ) > "$S13/s13-outputs-sha256.txt"
    clog "S13 end: analysis outputs hashed, $(sha256sum "$S13/s13-outputs-sha256.txt" | cut -d' ' -f1)"
    ```

    <div class="box expect" markdown="1">

    A list of hash values for everything you made today, and a last line in your collection log.

    </div>

    <div class="box trouble" markdown="1">

    If you change a file later, hash it again and note why: your outputs are working documents, but a stranger should see which version your report used.

    </div>

<details class="deeper" markdown="1">
<summary>The helper, in full</summary>

This is `s13-tools.py`, the same file as on the LMS. Save it as `~/nb6018-cw/s13/s13-tools.py` if you cannot reach the LMS. It reads only the files you name, writes rows to the screen or to the folder you give, and decides nothing.

{% raw %}
```python
#!/usr/bin/env python3
# NB6018CEM Session 13 helper. Code: MIT licence.
# Three jobs that save time and decide nothing for you:
#   sal      turn server access log lines into rows with the same columns as the CloudTrail rows
#   join     join CloudTrail rows and access-log rows, first by request ID, then by time, key and address
#   network  look up addresses in AWS's published ip-ranges.json
# It only reads the files you name and writes to the screen; you redirect the output into records/.
# Usage:
#   python3 s13-tools.py sal FILE...                       > sal-rows.tsv
#   python3 s13-tools.py join ct-rows.tsv sal-rows.tsv OUTDIR [SECONDS]
#   python3 s13-tools.py network ip-ranges.json ADDRESS...
import csv, datetime, ipaddress, json, re, sys
from urllib.parse import unquote, urlsplit, parse_qs

COLS = ["time_utc", "record", "operation", "identity", "address", "key", "version_id",
        "request_id", "detail", "user_agent", "record_id", "source_file"]
TOKEN = re.compile(r'\[[^\]]*\]|"(?:[^"\\]|\\.)*"|\S+')
SAME_KIND = {"PutObject": "REST.PUT.OBJECT", "GetObject": "REST.GET.OBJECT", "HeadObject": "REST.HEAD.OBJECT",
             "DeleteObject": "REST.DELETE.OBJECT", "ListObjects": "REST.GET.BUCKET",
             "ListObjectVersions": "REST.GET.BUCKETVERSIONS"}


def clean(v):
    v = (v or "-").replace("\t", " ").replace("\n", " ")
    return v if v else "-"


def sal(files):
    w = csv.writer(sys.stdout, delimiter="\t", lineterminator="\n")
    w.writerow(COLS)
    bad = 0
    for name in files:
        with open(name, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                f = TOKEN.findall(line.strip())
                if len(f) < 19 or not f[2].startswith("["):
                    if line.strip():
                        bad += 1
                    continue
                f = [x[1:-1] if x[:1] == '"' and x[-1:] == '"' else x for x in f]
                when = datetime.datetime.strptime(f[2][1:-1], "%d/%b/%Y:%H:%M:%S %z")
                when = when.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                key = unquote(f[7]) if f[7] != "-" else "-"
                if key == "-" and f[8] != "-":
                    parts = f[8].split(" ")
                    query = parse_qs(urlsplit(parts[1]).query) if len(parts) > 1 else {}
                    if "prefix" in query:
                        key = "prefix=" + query["prefix"][0]
                status = f[9] + ("" if f[10] == "-" else " " + f[10])
                w.writerow([when, "SAL", f[6], f[4], f[3], key, f[17], f[5], status, clean(f[16]), f[18], name])
    if bad:
        print(f"note: {bad} line(s) did not look like access-log records and were skipped", file=sys.stderr)


def load(path):
    with open(path, encoding="utf-8") as fh:
        rows = list(csv.reader(fh, delimiter="\t"))
    if not rows or rows[0][:2] != COLS[:2]:
        sys.exit(f"{path}: the first line must be the header row, starting {COLS[0]} {COLS[1]}")
    return [dict(zip(COLS, r + ["-"] * (len(COLS) - len(r)))) for r in rows[1:] if r]


def ts(v):
    return datetime.datetime.strptime(v, "%Y-%m-%dT%H:%M:%SZ")


def join(ct_path, sal_path, outdir, seconds=5):
    ct, sl = load(ct_path), load(sal_path)
    by_id = {}
    for i, r in enumerate(sl):
        by_id.setdefault(r["request_id"], []).append(i)
    used, matched, ct_alone = set(), [], []
    for r in ct:
        hit = [i for i in by_id.get(r["request_id"], []) if i not in used] if r["request_id"] != "-" else []
        if len(hit) == 1:
            used.add(hit[0]); matched.append(("request-id", r, sl[hit[0]])); continue
        ct_alone.append(r)
    still = []
    for r in ct_alone:
        options = [i for i, s in enumerate(sl) if i not in used
                   and s["key"] == r["key"] and s["address"] == r["address"]
                   and SAME_KIND.get(r["operation"]) == s["operation"]
                   and abs((ts(s["time_utc"]) - ts(r["time_utc"])).total_seconds()) <= seconds]
        if len(options) == 1:
            used.add(options[0]); matched.append(("time-key-address", r, sl[options[0]]))
        else:
            r = dict(r); r["note"] = "several candidates" if options else "-"; still.append(r)
    sal_alone = [s for i, s in enumerate(sl) if i not in used]
    with open(f"{outdir}/matched.tsv", "w", encoding="utf-8") as fh:
        w = csv.writer(fh, delimiter="\t", lineterminator="\n")
        w.writerow(["joined_by", "seconds_apart"] + ["ct_" + c for c in COLS] + ["sal_" + c for c in COLS])
        for how, a, b in sorted(matched, key=lambda m: m[1]["time_utc"]):
            gap = int((ts(b["time_utc"]) - ts(a["time_utc"])).total_seconds())
            w.writerow([how, gap] + [a[c] for c in COLS] + [b[c] for c in COLS])
    for name, rows, extra in (("ct-only.tsv", still, ["note"]), ("sal-only.tsv", sal_alone, [])):
        with open(f"{outdir}/{name}", "w", encoding="utf-8") as fh:
            w = csv.writer(fh, delimiter="\t", lineterminator="\n")
            w.writerow(COLS + extra + ["your_reason"])
            for r in sorted(rows, key=lambda x: x["time_utc"]):
                w.writerow([r[c] for c in COLS] + [r.get(e, "-") for e in extra] + [""])
    by_how = {h: sum(1 for m in matched if m[0] == h) for h in ("request-id", "time-key-address")}
    print(f"CloudTrail rows {len(ct)}, access-log rows {len(sl)}")
    print(f"joined by request ID {by_how['request-id']}, by time, key and address {by_how['time-key-address']}")
    print(f"CloudTrail only {len(still)}, access log only {len(sal_alone)}")
    print(f"written: {outdir}/matched.tsv, {outdir}/ct-only.tsv, {outdir}/sal-only.tsv")


def network(ranges_path, addresses):
    d = json.load(open(ranges_path, encoding="utf-8"))
    print(f"ip-ranges.json createDate {d.get('createDate', '?')}, syncToken {d.get('syncToken', '?')}")
    nets = [(ipaddress.ip_network(p["ip_prefix"]), p) for p in d.get("prefixes", [])]
    nets += [(ipaddress.ip_network(p["ipv6_prefix"]), p) for p in d.get("ipv6_prefixes", [])]
    for a in addresses:
        try:
            ip = ipaddress.ip_address(a)
        except ValueError:
            print(f"{a}\tnot an IP address (CloudTrail shows a service name for some requests)"); continue
        hits = [(n, p) for n, p in nets if ip.version == n.version and ip in n]
        if not hits:
            print(f"{a}\tno match in this file"); continue
        for n, p in sorted(hits, key=lambda h: -h[0].prefixlen):
            print(f"{a}\t{n}\tservice {p.get('service')}\tregion {p.get('region')}\tborder group {p.get('network_border_group')}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["sal"] and len(a) > 1:
        sal(a[1:])
    elif a[:1] == ["join"] and len(a) in (4, 5):
        join(a[1], a[2], a[3], int(a[4]) if len(a) == 5 else 5)
    elif a[:1] == ["network"] and len(a) > 2:
        network(a[1], a[2:])
    else:
        sys.exit(__doc__ or "usage: s13-tools.py sal FILE... | join CT SAL OUTDIR [SECONDS] | network RANGES ADDRESS...")
```
{% endraw %}
</details>

### Checkpoint

Judge your own work against this table. It is formative and is not marked here, but every row feeds your coursework.

| # | Check | Your proof |
|---|---|---|
| 1 | Every collection matches its manifest, and the working copy matches its originals | Steps 2 and 3, collection log |
| 2 | CloudTrail rows and access-log rows in twelve columns, with their source files | `ct-rows.tsv`, `sal-rows.tsv` |
| 3 | The correlation table: joined pairs, and every lonely row with a reason from your evidence | `join/matched.tsv`, `ct-only-reasons.tsv`, `sal-only-reasons.tsv` |
| 4 | Your answer about listings, with the rows that show it | `s13-notes.md` |
| 5 | Your own requests tagged and kept, each checked by address and kind | `analyst-windows.tsv`, the tagged files |
| 6 | Each identity and address read, and each address's network shown with a recorded copy of the ranges | Steps 12 and 13, register entry |
| 7 | The incident timeline in Session 5's seven columns, all in UTC | `s13-timeline-utc.csv` |
| 8 | The timeline tested against your own logs, with agreements and disagreements stated | `s13-notes.md` |
| 9 | The template's timeline section drafted, in your own words | Your report copy |
| 10 | One recommendation with all four links | Your report copy |

### If you have time

**Audit the account with Prowler, and test one of its findings.** Prowler is an open-source tool that checks an AWS account's settings against good practice. Its list is not a set of recommendations: it knows nothing about your incident. Your task is to choose one of its findings and ask whether your evidence ties it to a finding of your own, by the four links of Section 9.

Run it only after the last collection your report relies on, because its checks read your buckets' settings, and those reads become new lines in the records.

```bash
python3 --version
pipx install prowler
clog "Prowler start from Kali, address $(curl -s https://checkip.amazonaws.com)"
prowler aws --services s3 cloudtrail iam --output-directory "$S13/prowler"
clog "Prowler end"
```

Prowler needs Python 3.10 to 3.13; if Kali's `python3` is newer, ask the lecturer for the supported route. Your `nb6018-analyst` user already has the permissions it needs, so nothing in IAM changes. Prowler only reads: it changes no setting and costs nothing beyond the requests it makes. Add its time window to `analyst-windows.tsv`, so that its requests are tagged like your collection's if you ever collect again.

## If you missed Session 13

This session works on the evidence you collected, so you can do it alone from this page.

1. **Read sections 1 to 10 and run the five demos** (about 70 minutes). Answer each quick check before you open the answer.
2. **Get the helper and the template from the LMS.**
3. **Do Parts A to H in one sitting** (about two hours and ten minutes). Late is not a problem: more access-log lines will have arrived, and Part A step 4 tells you whether to collect them.
4. **Tick the checkpoint table** and keep every file.
5. **If you are blocked**, write to the lecturer through the LMS with the step number and the exact error message, with your account ID masked.

**If your evidence is incomplete,** for example a collection is missing or Session 12 never ran, first practise Parts B to G on the unit's practice set from the lab share, the same set that Session 12 offered. Mark everything you make from it PRACTICE. Then complete Session 12 on your own environment and do this lab again on your own evidence: your coursework needs your own records.

## Check yourself

Write each answer in about two sentences before you open the model answer.

**1. Name the CloudTrail fields that tell you who made a request and from where, and explain why neither names a person.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
`userIdentity` names the identity, with its ARN and access key, and `sourceIPAddress` names the address the request came from. An identity is an account that anyone with its credentials can use, and an address identifies a device on a network at a time, so getting to a person needs further evidence. The points that earn marks: (1) `userIdentity`; (2) `sourceIPAddress`; (3) account and address are not people, so another step is needed.
</details>

**2. Explain why a jq filter for CloudTrail rows must end with a sort, and what would go wrong without it.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
CloudTrail does not store events in time order, inside a file or across files, so the rows come out in the order the files were read. Without a sort, a timeline built from them would put events in the wrong order and could suggest a sequence that never happened. The points that earn marks: (1) the files are not ordered; (2) sort by the time field; (3) the risk of a false sequence.
</details>

**3. A CloudTrail event and an access-log line share the request ID `7B4A0FABB1E2C3D4`. Explain what the shared value shows, and what you check before you treat them as one request.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
S3 gives each request one request ID, and both records keep it, so the shared value shows that the two rows record the same request. Before treating them as one, you check that the key, the address and the kind of operation agree and that the times are within a second or two. The points that earn marks: (1) one ID per request, kept by both records; (2) a check of key, address and operation; (3) a check of time.
</details>

**4. A student's analysis has no row tagged as her own collection, although her collection log shows fourteen requests to the case bucket. Give two possible causes and say how she checks each.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
Her windows may not match the rows, for example written in local time instead of UTC or with a mistyped time, which she checks by comparing a window with the times of her listing in the rows. Or the rows may not include those requests, for example because her CloudTrail rows came from a collection made before them, which she checks against the times of her base collection. The points that earn marks: (1) a window problem, with a check; (2) a coverage or collection problem, with a check; (3) no row is deleted or invented to fix it.
</details>

**5. An address matches no range in AWS's published list. Write what the student may state, and what she may not.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
She may state that the address is not in AWS's published ranges in the edition she downloaded, giving its date and hash value, and she may add what the registry says about who holds the range. She may not state who used the address, because a range shows a network, and an address identifies a device on a network at a time, not a person. The points that earn marks: (1) "no match in this edition", with the edition recorded; (2) a registry check for the holder; (3) no claim about a person.
</details>

**6. Explain the difference between a limitation and a recommendation in a forensic report, using the method of this session.**

<details class="answer" markdown="1"><summary>Show a model answer</summary>
A limitation states a weakness in the evidence or the method, its effect on a conclusion, and the evidence that shows it; it tells the reader how far to rely on the findings. A recommendation proposes a change for the future, tied to a finding and the risk it showed, with supporting evidence; it tells the reader what should change. The points that earn marks: (1) limitation as weakness, effect and evidence; (2) recommendation as finding, risk, change and evidence; (3) one qualifies the findings, the other acts on them.
</details>

## Coming next

You now hold the incident's timeline, the correlation behind it, and the first pages of your report. Session 14 leaves the cloud for the wider internet: the suspect's own email and web traces on the disk, a parallel engagement on a compromised web server, and attribution from network identifiers when the network is not yours.
