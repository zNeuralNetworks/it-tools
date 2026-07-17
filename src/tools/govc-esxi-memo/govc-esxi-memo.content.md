# govc / ESXi cheatsheet

## Environment

```bash
export GOVC_URL='https://esxi-host'      # or user:pass@host
export GOVC_USERNAME=root
export GOVC_PASSWORD='...'
export GOVC_INSECURE=1                    # self-signed ESXi cert
export GOVC_VIM_VERSION=7.0               # REQUIRED for import.ova on ESXi 7.x
                                          # (new govc defaults to a 9.x VIM version the
                                          # old hostd rejects → upload "OK" then 400,
                                          # ImportVApp hangs holding a VM lock)
```

## Inventory & info

```bash
govc find / -type m                       # all VMs
govc vm.info <vm>                         # power state, CPU/mem
govc vm.info -e <vm>                      # + extra config (guestinfo, tools)
govc datastore.info
govc datastore.ls -ds=<ds> <path>
govc host.info                            # host CPU/mem usage
govc about
```

## Power

```bash
govc vm.power -on  <vm>
govc vm.power -off <vm>                   # hard off
govc vm.power -s   <vm>                   # guest shutdown (needs tools)
govc vm.power -r   <vm>                   # guest reboot (needs tools)
govc vm.power -reset <vm>                 # hard reset (wedged guests)
```

## Create / modify VMs

```bash
govc vm.create -m 4096 -c 2 -g ubuntu64Guest -disk 40GB -net "VM Network" <name>
govc vm.change -vm <vm> -m 8192 -c 4      # resize (power off first)
govc vm.change -vm <vm> -mem.limit 32768  # memory limit (MB)
govc vm.network.add -vm <vm> -net "SPAN-Monitor"
govc device.ls -vm <vm>
govc snapshot.create -vm <vm> pre-change
govc snapshot.revert -vm <vm> pre-change
```

## OVA import

```bash
govc import.spec app.ova > spec.json      # inspect/edit options first
govc import.ova -options spec.json app.ova
```

- ⚠️ Set `GOVC_VIM_VERSION` to the host's real version (see above) or the
  import wedges at `0% running`.
- ⚠️ **Never `govc task.cancel` a stuck ImportVApp** — the rollback deletes
  the VM *and* its datastore folder.

## Disks

- ⚠️ Prefer `vmkfstools` clone on the host + edit VMX + re-register over
  `govc vm.disk.attach` for pre-existing VMDKs (attach mangles paths).

```bash
# on the ESXi shell:
vmkfstools -i src.vmdk dst.vmdk -d thin
govc vm.disk.create -vm <vm> -name <vm>/data -size 200G   # new disk is fine
```

## Guest ops (no SSH needed — needs VMware Tools running)

```bash
# inline guest.run is unreliable — upload a script, then execute it:
govc guest.upload -f -vm <vm> -l user:pass /tmp/local.sh /tmp/script.sh
govc guest.start  -vm <vm> -l user:pass /bin/bash /tmp/script.sh
govc guest.download -vm <vm> -l user:pass /tmp/out.txt /tmp/local-out.txt
```

## Cloud-init via guestinfo (no seed ISO)

```bash
govc vm.change -vm <vm> \
  -e guestinfo.metadata="$(gzip -c9 meta.yml | base64 -w0)" \
  -e guestinfo.metadata.encoding=gzip+base64 \
  -e guestinfo.userdata="$(gzip -c9 user.yml | base64 -w0)" \
  -e guestinfo.userdata.encoding=gzip+base64
```
