---
session_code: S00
description: "Build and check the three virtual machines used in NB6018CEM before Day 1: Kali, Windows and an isolated REMnux, with a verify script and a rescue route."
hook: >-
  The unit gives every new analyst a workstation before the first case arrives.
  In this module you build yours. Session 1 starts with a check, not with an installation.
outcomes:
  - "Build the three virtual machines that every session uses"
  - "Explain why the REMnux machine is kept on an isolated network"
  - "Apply the verify script and fix what it reports"
  - "Take a snapshot and return to it"
evidence: "none for this page. The tool installers and the rescue files are on the lab share, in the folders `Tools` and `Rescue`"
---

Do this page before Day 1. It takes one evening, and most of that time is downloading. Session 1 only *checks* your environment. If a step fails and you cannot fix it, use [the rescue route](#the-rescue-route) and carry on.

## What you are building

Every lab in this module runs inside a {% include term.html t="virtual-machine" %}. You need no extra hardware. Your real computer is the {% include term.html t="host-machine" %}. A program called a {% include term.html t="hypervisor" %} runs the virtual machines on it. This page uses VirtualBox, which is free.

| VM | What it is for | Memory | Processors | Network |
|---|---|---|---|---|
| **Kali Linux** | Your main analysis toolbox | 4096 MB | 2 | NAT |
| **Windows 11** | Windows tools such as FTK Imager | 4096 MB | 2 | NAT |
| **REMnux** | The closed lab for suspicious programs, from Session 9 | 4096 MB | 2 | Isolated, no internet |

A {% include term.html t="nat-network" %} lets a VM use the internet through your host machine. An {% include term.html t="isolated-network" %} does the opposite: the VM can talk only to other VMs on the same closed network. REMnux lives there because in Sessions 9 and 10 you examine a suspicious program, and it must have no path out.

## The checklist on one page

Use this list to follow your progress. You can print this page and tick the lines by hand.

| Step | You are done when |
|---|---|
| Host check | Your computer has a 64-bit Intel or AMD processor with virtualisation switched on, 8 GB of memory or more, and 100 GB of free disk |
| 1 | VirtualBox is installed and it opens |
| 2 | The Kali VM starts and you can log in |
| 3 | The Windows VM starts and Guest Additions are installed |
| 4 | The REMnux VM starts and you can log in |
| 5 | REMnux is on the isolated network; Kali and Windows share one folder with the host |
| 6 | The tools are installed in Kali and in Windows |
| 7 | The verify script ends with `RESULT: READY` in all three VMs |
| 8 | Each VM has a snapshot called `baseline-clean` |

## Host check

Your host machine needs:

- a 64-bit Intel or AMD processor with hardware virtualisation (called VT-x or AMD-V);
- 16 GB of memory if possible. 8 GB works, but then you run one VM at a time;
- 100 GB of free disk space.

To check virtualisation on a Windows host, open Task Manager, choose **Performance**, then **CPU**, and read the line **Virtualization**. On a Linux host, run `lscpu | grep -i virtualization`.

<div class="box expect" markdown="1">

Windows shows `Virtualization: Enabled`. Linux shows `VT-x` or `AMD-V`.

</div>

<div class="box trouble" markdown="1">

If it says Disabled, restart the computer, enter its firmware settings (often the F2, F10 or Delete key during start-up) and switch on Intel Virtualization Technology or SVM Mode.

If your computer is a Mac with an Apple processor, these VMs will not run on it, because they need an Intel or AMD processor. Use a lab machine and tell the lecturer before Day 1.

</div>

## Step 1: install VirtualBox

Download VirtualBox for your host from the [VirtualBox downloads page](https://www.virtualbox.org/wiki/Downloads) and install it with the default choices.

<div class="box expect" markdown="1">

The window **Oracle VirtualBox Manager** opens. Its list of machines is empty.

</div>

<div class="box trouble" markdown="1">

If the installer warns that network connections will be reset for a moment, that is normal. Accept it.

</div>

## Step 2: add the Kali VM

1. Open the [Kali download page](https://www.kali.org/get-kali/), choose **Virtual Machines**, and download the **VirtualBox** file. It is a large `.7z` file.
2. Extract it with 7-Zip into a folder that you will keep. The folder now holds a `.vbox` file and a `.vdi` file.
3. In VirtualBox choose **Machine**, then **Add**, and select the `.vbox` file.
4. Select the new machine and choose **Settings**. Under **System**, set **Base Memory** to 4096 MB. Under **System**, **Processor**, set 2 processors.
5. Start the VM. Log in with the user name `kali` and the password `kali`.

<div class="box expect" markdown="1">

The Kali desktop appears. A terminal opens when you choose the black terminal icon.

</div>

<div class="box trouble" markdown="1">

If VirtualBox reports that VT-x or AMD-V is not available, go back to the host check.

If the VM is very slow on a Windows host and a small turtle icon shows at the bottom of the VM window, Windows is using its own hypervisor at the same time. Ask in the lab before you change this, because other software on your computer may depend on it.

</div>

## Step 3: build the Windows VM

Microsoft offers Windows 11 Enterprise free for 90 days of evaluation. The 90 days start when you install it, so do this step close to Day 1, not weeks before.

1. Open the [Microsoft Evaluation Center page for Windows 11 Enterprise](https://www.microsoft.com/evalcenter/evaluate-windows-11-enterprise), register, and download the 64-bit ISO file.
2. In VirtualBox choose **Machine**, then **New**. Name it `NB6018-Windows` and select the ISO file. Tick **Skip Unattended Installation**.
3. Set 4096 MB of memory and 2 processors. Set the disk to 80 GB. Do not tick the option to allocate the full size now, so the disk file grows only as it is used.
4. Start the VM and follow the Windows installer. When it asks you to sign in, look for **Sign-in options** and choose to join a domain instead. This lets you create a local user name and password.
5. When the desktop appears, open the VM window's **Devices** menu and choose **Insert Guest Additions CD image**. In Windows, open the CD drive, run `VBoxWindowsAdditions`, accept the defaults and restart.

<div class="box expect" markdown="1">

The Windows desktop fills the VM window and resizes when you resize the window. That shows Guest Additions are working.

</div>

<div class="box trouble" markdown="1">

If the installer says this PC cannot run Windows 11, shut the VM down and open **Settings**, **System**. Check that **Enable EFI** is ticked, that **TPM** is set to v2.0, and that the VM has 4096 MB and 2 processors.

If the installer offers no way to create a local account, disconnect the VM's network cable for a moment (**Devices**, **Network**, untick **Connect Network Adapter**) and try the sign-in screen again.

</div>

## Step 4: import the REMnux VM

REMnux comes as an {% include term.html t="ova-file" %}: one file that holds a complete VM.

1. Open the [REMnux page "Get the Virtual Appliance"](https://docs.remnux.org/install-distro/get-virtual-appliance) and download the **VirtualBox OVA**. It is about 9 GB.
2. In VirtualBox choose **File**, then **Import Appliance**, select the OVA file and choose **Finish**.
3. Start the VM. Log in with the user name `remnux` and the password `malware`.
4. Before you isolate this VM, open this page in the REMnux web browser. Go to [Step 7](#step-7-run-the-verify-script), copy the first script, and save it in the home folder as `verify-lab.sh`. After Step 5 this VM has no internet, so do it now.

<div class="box expect" markdown="1">

The REMnux desktop appears, and the file `verify-lab.sh` is in the home folder.

</div>

<div class="box trouble" markdown="1">

If the import fails with a message about disk space, free some space on the host. The imported VM needs room to grow.

</div>

## Step 5: set the networks and the shared folder

**Kali and Windows** stay on NAT, which is the default. You change nothing.

**REMnux** moves to the isolated network. Shut it down first, then open its **Settings**:

1. **Network**, **Adapter 1**: set **Attached to** to **Internal Network**, and type the name `nb6018-isolated`. Make sure adapters 2, 3 and 4 are not enabled.
2. **General**, **Advanced**: set **Shared Clipboard** and **Drag'n'Drop** to **Disabled**.
3. **Shared Folders**: the list must be empty.

<div class="box safety" markdown="1">

The REMnux VM must never have a NAT or bridged adapter, a shared folder or a shared clipboard after this step. In Session 10 the Windows VM joins this closed network for one lab, under strict rules, and then leaves it. Do not connect it now.

</div>

**The shared folder** lets you move files between your host, Kali and Windows.

1. On the host, create a folder called `nb6018-share`.
2. For the Kali VM and then for the Windows VM, open **Settings**, **Shared Folders**, and add a folder. Set **Folder Path** to `nb6018-share`, **Folder Name** to `nb6018`, and tick **Auto-mount** and **Make Permanent**.
3. In Kali, open a terminal and run `sudo adduser $USER vboxsf`. Then log out and log in again.

<div class="box expect" markdown="1">

In Kali, the folder `/media/sf_nb6018` opens and shows the files you put in `nb6018-share`. In Windows, File Explorer opens `\\VBOXSVR\nb6018` and shows the same files.

</div>

<div class="box trouble" markdown="1">

If Kali says "Permission denied" for the folder, the `adduser` command has not taken effect yet. Log out and in, or restart the VM.

If Windows cannot find `\\VBOXSVR`, Guest Additions are not installed. Repeat the last part of Step 3.

</div>

## Step 6: install the tools

**In Kali**, open a terminal and run:

```bash
sudo apt update
sudo apt install -y ewf-tools guymager dc3dd sleuthkit autopsy testdisk foremost bulk-extractor steghide wireshark tshark jq
```

<div class="box expect" markdown="1">

The command ends without the word "Error". Some tools were already installed, and `apt` says so.

</div>

**In Windows**, open PowerShell and create three folders:

```powershell
mkdir C:\Evidence, C:\Cases, C:\Tools
```

Then copy the contents of the `Tools` folder from the {% include term.html t="lab-share" %} into `C:\Tools`, and run the FTK Imager installer with the default choices. The other tools in that folder are for later sessions. Each session tells you when to install one.

<div class="box expect" markdown="1">

FTK Imager opens from the Start menu.

</div>

<div class="box trouble" markdown="1">

If `apt` says that it cannot find a package, run `sudo apt update` again and check the spelling of the command. If the FTK Imager installer is not in the `Tools` folder, tell the lecturer.

</div>

<div class="box lms" markdown="1">

If you are studying away from the lab, the LMS explains how to get the `Tools` folder.

</div>

**In REMnux**, install nothing. Its tools are already there.

## Step 7: run the verify script

The verify script reads your settings and reports each one as `PASS`, `WARN`, `FAIL` or `LATER`. It changes nothing. `LATER` means a tool that a future session will add, so it is not a problem today.

**Kali and REMnux.** Copy this script into a file called `verify-lab.sh` in your home folder.

```bash
#!/usr/bin/env bash
# NB6018CEM lab verify script for the Kali and REMnux virtual machines. MIT licence.
# Usage:  bash verify-lab.sh kali      (in the Kali VM)
#         bash verify-lab.sh remnux    (in the REMnux VM)
# It only reads settings. It changes nothing on your machine.

role="${1:-}"
case "$role" in
  kali|remnux) ;;
  *) echo "Usage: bash verify-lab.sh kali   or   bash verify-lab.sh remnux"; exit 2 ;;
esac

pass=0; warn=0; fail=0
line()  { printf '%-5s %-26s %s\n' "$1" "$2" "$3"; }
ok()    { line PASS  "$1" "$2"; pass=$((pass+1)); }
note()  { line WARN  "$1" "$2"; warn=$((warn+1)); }
bad()   { line FAIL  "$1" "$2"; fail=$((fail+1)); }
later() { line LATER "$1" "$2"; }
have()  { command -v "$1" >/dev/null 2>&1; }

echo "NB6018CEM lab check - role: $role"
echo "---------------------------------------------------------------"

# 1. The virtual machine itself
mem_mb=$(awk '/MemTotal/ {printf "%d", $2/1024}' /proc/meminfo)
if [ "$mem_mb" -ge 3500 ]; then ok "Memory" "${mem_mb} MB"
else bad "Memory" "${mem_mb} MB - set this VM to 4096 MB"; fi

cpus=$(nproc)
if [ "$cpus" -ge 2 ]; then ok "Processors" "$cpus"
else bad "Processors" "$cpus - set this VM to 2 processors"; fi

free_gb=$(df -BG --output=avail "$HOME" 2>/dev/null | tail -1 | tr -dc '0-9')
free_gb=${free_gb:-0}
if [ "$free_gb" -ge 20 ]; then ok "Free disk space" "${free_gb} GB"
else note "Free disk space" "${free_gb} GB - evidence files need about 20 GB free"; fi

# 2. The network
online() {
  timeout 5 bash -c 'exec 3<>/dev/tcp/1.1.1.1/443' 2>/dev/null && return 0
  timeout 5 bash -c 'exec 3<>/dev/tcp/8.8.8.8/53' 2>/dev/null && return 0
  timeout 5 bash -c 'exec 3<>/dev/tcp/www.kali.org/443' 2>/dev/null && return 0
  return 1
}
if [ "$role" = "kali" ]; then
  if online; then ok "Internet (NAT)" "reachable"
  else note "Internet (NAT)" "not reachable - check the adapter is set to NAT"; fi
else
  if online; then bad "Isolation" "this VM can reach the internet - set its adapter to Internal Network"
  else ok "Isolation" "no path to the internet"; fi
  if ip route show default 2>/dev/null | grep -q .; then
    note "Default route" "present - expected none on the isolated network"
  else ok "Default route" "none"; fi
fi

# 3. The shared folder
shared=$(ls -d /media/sf_* 2>/dev/null | head -1)
if [ "$role" = "kali" ]; then
  if [ -n "$shared" ] && [ -r "$shared" ]; then ok "Shared folder" "$shared"
  elif [ -n "$shared" ]; then note "Shared folder" "$shared exists but you cannot read it - run: sudo adduser \$USER vboxsf   then log out and in"
  else note "Shared folder" "not found - add the shared folder nb6018 in the VM settings"; fi
else
  if [ -n "$shared" ]; then bad "Shared folder" "$shared - remove shared folders from this VM"
  else ok "Shared folder" "none (correct for this VM)"; fi
fi

# 4. The tools
need() {  # need <command> <package or hint>
  if have "$1"; then ok "Tool: $1" "found"
  else bad "Tool: $1" "missing - run: sudo apt install -y $2"; fi
}
soon() {  # soon <command> <session>
  if have "$1"; then ok "Tool: $1" "found"
  else later "Tool: $1" "not installed yet - added in Session $2"; fi
}
check() { # check <command> <session>
  if have "$1"; then ok "Tool: $1" "found"
  else note "Tool: $1" "not found - tell the lecturer before Session $2"; fi
}

if [ "$role" = "kali" ]; then
  need sha256sum      coreutils
  need ewfverify      ewf-tools
  need guymager       guymager
  need dc3dd          dc3dd
  need fls            sleuthkit
  need autopsy        autopsy
  need photorec       testdisk
  need foremost       foremost
  need bulk_extractor bulk-extractor
  need steghide       steghide
  need wireshark      wireshark
  need tshark         tshark
  need jq             jq
  soon log2timeline.py 5
  soon vol             6
  soon zeek            7
  soon suricata        8
  soon aws             11
else
  check inetsim   9
  check yara      9
  check capa      9
  check floss     9
  check wireshark 9
fi

echo "---------------------------------------------------------------"
echo "Passed: $pass   Warnings: $warn   Failed: $fail"
if [ "$fail" -eq 0 ]; then
  echo "RESULT: READY"
else
  echo "RESULT: NOT READY - fix the $fail item(s) marked FAIL and run this again"
fi
[ "$fail" -eq 0 ]
```

Run it in Kali with `bash verify-lab.sh kali`, and in REMnux with `bash verify-lab.sh remnux`.

**Windows.** Copy this script into Notepad and save it as `C:\Tools\verify-windows.ps1`. In the save window, set the file type to **All files**, so that Notepad does not add `.txt`.

```powershell
# NB6018CEM lab verify script for the Windows virtual machine. MIT licence.
# Run in PowerShell:  powershell -ExecutionPolicy Bypass -File .\verify-windows.ps1
# It only reads settings. It changes nothing on your machine.

$pass = 0; $warn = 0; $fail = 0
function Line($status, $item, $detail) { '{0,-5} {1,-26} {2}' -f $status, $item, $detail }
function Ok($item, $detail)    { $script:pass++; Line 'PASS'  $item $detail }
function Note($item, $detail)  { $script:warn++; Line 'WARN'  $item $detail }
function Bad($item, $detail)   { $script:fail++; Line 'FAIL'  $item $detail }
function Later($item, $detail) { Line 'LATER' $item $detail }

'NB6018CEM lab check - role: windows'
'---------------------------------------------------------------'

# 1. The virtual machine itself
$cs = Get-CimInstance Win32_ComputerSystem
$memMb = [math]::Round($cs.TotalPhysicalMemory / 1MB)
if ($memMb -ge 3500) { Ok 'Memory' "$memMb MB" } else { Bad 'Memory' "$memMb MB - set this VM to 4096 MB" }

$cpus = $cs.NumberOfLogicalProcessors
if ($cpus -ge 2) { Ok 'Processors' "$cpus" } else { Bad 'Processors' "$cpus - set this VM to 2 processors" }

$freeGb = [math]::Round((Get-PSDrive C).Free / 1GB)
if ($freeGb -ge 20) { Ok 'Free disk space' "$freeGb GB" } else { Note 'Free disk space' "$freeGb GB - evidence files need about 20 GB free" }

# 2. The network
function Test-Port($hostName, $port) {
  try {
    $c = New-Object System.Net.Sockets.TcpClient
    $t = $c.BeginConnect($hostName, $port, $null, $null)
    $done = $t.AsyncWaitHandle.WaitOne(4000) -and $c.Connected
    $c.Close()
    return $done
  } catch { return $false }
}
if ((Test-Port '1.1.1.1' 443) -or (Test-Port '8.8.8.8' 53)) { Ok 'Internet (NAT)' 'reachable' }
else { Note 'Internet (NAT)' 'not reachable - check the adapter is set to NAT' }

# 3. Folders
foreach ($d in 'C:\Evidence', 'C:\Cases', 'C:\Tools') {
  if (Test-Path $d) { Ok "Folder $d" 'found' } else { Bad "Folder $d" "missing - run: mkdir $d" }
}
if (Test-Path '\\VBOXSVR\nb6018') { Ok 'Shared folder' '\\VBOXSVR\nb6018' }
else { Note 'Shared folder' 'not found - add the shared folder nb6018 in the VM settings and install Guest Additions' }

# 4. Tools
$uninstall = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
             'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
$ftk = Get-ItemProperty $uninstall -ErrorAction SilentlyContinue |
       Where-Object { $_.DisplayName -like '*FTK Imager*' } | Select-Object -First 1
if ($ftk) { Ok 'Tool: FTK Imager' ("version " + $ftk.DisplayVersion) }
else { Bad 'Tool: FTK Imager' 'missing - install it from the Tools folder on the lab share' }

if (Get-Command Get-FileHash -ErrorAction SilentlyContinue) { Ok 'Tool: Get-FileHash' 'found' }
else { Bad 'Tool: Get-FileHash' 'missing - this Windows version is too old' }

$laterTools = @(
  @{ Name = 'Eric Zimmerman tools'; Pattern = 'MFTECmd*';   Session = 5 },
  @{ Name = 'winpmem';              Pattern = 'winpmem*';   Session = 6 },
  @{ Name = 'PEStudio';             Pattern = 'pestudio*';  Session = 9 },
  @{ Name = 'DB Browser for SQLite'; Pattern = 'DB Browser*'; Session = 16 }
)
foreach ($t in $laterTools) {
  $hit = Get-ChildItem 'C:\Tools', 'C:\Program Files' -Recurse -Depth 3 -Filter $t.Pattern -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($hit) { Ok ("Tool: " + $t.Name) 'found' }
  else { Later ("Tool: " + $t.Name) ("not installed yet - needed from Session " + $t.Session) }
}

# 5. The Windows evaluation period
try {
  $lic = Get-CimInstance SoftwareLicensingProduct -Filter "PartialProductKey IS NOT NULL AND ApplicationID='55c92734-d682-4d71-983e-d6ec3f16059f'" -ErrorAction Stop | Select-Object -First 1
  if ($lic -and $lic.GracePeriodRemaining -gt 0) {
    $days = [math]::Floor($lic.GracePeriodRemaining / 1440)
    if ($days -ge 30) { Ok 'Windows evaluation' "$days days left" }
    else { Note 'Windows evaluation' "$days days left - ask the lecturer whether to rebuild this VM" }
  }
} catch { }

'---------------------------------------------------------------'
"Passed: $pass   Warnings: $warn   Failed: $fail"
if ($fail -eq 0) { 'RESULT: READY' }
else { "RESULT: NOT READY - fix the $fail item(s) marked FAIL and run this again" }
```

Open PowerShell and run:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Tools\verify-windows.ps1
```

<div class="box expect" markdown="1">

Each VM prints a list and ends with these two lines. The numbers will differ.

```
Passed: 19   Warnings: 0   Failed: 0
RESULT: READY
```

</div>

<div class="box trouble" markdown="1">

Every `FAIL` line ends with its own fix. Do that fix and run the script again.

A `WARN` does not stop you, but read it. The most common one is the shared folder: repeat the last part of Step 5.

In REMnux, `FAIL Isolation` means the VM can still reach the internet. Shut it down and repeat Step 5. Do not go on until this line says `PASS`.

</div>

## Step 8: take the baseline snapshots

A {% include term.html t="snapshot" %} saves the state of a VM. If a later lab breaks something, you return to the snapshot in a minute and lose nothing but that lab's changes.

For each of the three VMs: shut it down, select it in VirtualBox, open **Snapshots**, choose **Take**, and name the snapshot `baseline-clean`.

<div class="box expect" markdown="1">

Each VM shows `baseline-clean` in its snapshot list, with **Current State** below it.

</div>

<div class="box trouble" markdown="1">

To return to a snapshot later, shut the VM down, select the snapshot and choose **Restore**. Files inside the VM that you created after the snapshot are lost, so keep your notes and results in the shared folder.

</div>

## The rescue route

If Step 2 or Step 4 will not work on your computer, do not lose the evening. The lab share has two ready-made files in the folder `Rescue`:

- `nb6018-kali-baseline.ova`
- `nb6018-remnux-baseline.ova`

Each one is a VM that has already passed this page. To use one:

1. Copy the OVA file to your host.
2. In VirtualBox choose **File**, **Import Appliance**, select the file and choose **Finish**.
3. Do Step 5 for that VM, because the shared folder and the networks belong to your own host.
4. Do Step 7 and Step 8.

There is no rescue file for the Windows VM, because the Windows evaluation licence does not allow us to share a copy. If Step 3 fails, use a lab machine for the Windows work in Session 1 and tell the lecturer, so that it can be fixed in the room.

<div class="box lms" markdown="1">

If you are studying away from the lab, the LMS explains how to get the rescue files.

</div>

## If your host has 8 GB of memory

Everything on this page still works. Follow two rules.

- Run one VM at a time. Shut one down before you start the next.
- Close other programs on the host while a VM runs, especially web browsers.

The sessions are written so that you never need two VMs open together, except in Session 10, which gives its own instructions.

<details class="deeper" markdown="1">
<summary>Using VMware or KVM</summary>

The lab uses VirtualBox, and the lecturer can help you fastest with it. The module also works on VMware Workstation and on KVM with virt-manager. The steps are the same in idea.

- **Kali:** the same download page offers a VMware file and a QEMU file for KVM.
- **REMnux:** download the general OVA, not the VirtualBox one. VMware imports it directly. For KVM, the REMnux documentation describes the conversion.
- **Windows:** create a new VM from the same ISO file. Enable UEFI and a virtual TPM.
- **The isolated network:** in VMware, use a custom virtual network with no host connection and no NAT. In KVM, create a virtual network of the isolated type.
- **The shared folder:** each hypervisor has its own shared-folder feature. The verify script looks for the VirtualBox path, so it will show a `WARN` for this item. That is expected.

The rule that matters does not change: REMnux must have no path to the internet, and the verify script must say so.
</details>

## Coming next

Bring your host machine, with the three VMs and their snapshots, to Session 1. The first lab step runs the verify script again, and then you receive your first item of evidence.
