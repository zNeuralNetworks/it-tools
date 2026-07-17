# Arista EOS cheatsheet

## CLI navigation

```bash
enable                        # privileged mode
configure session <name>      # SAFE config: named session (preferred)
configure                     # direct config mode (no safety net)
show session-config diffs     # preview session changes before commit
commit                        # apply session
commit timer 00:05:00         # apply with auto-rollback unless confirmed
abort                         # discard session
rollback clean-config         # factory-ish reset (careful)
configure replace <url>       # atomic config replace
bar | grep / | include / | section bgp   # output filters
watch 2 show int e1 counters  # repeat a show command
```

## Interfaces & VLANs

```bash
interface Ethernet1
  description uplink-to-spine1
  no switchport               # routed port
  ip address 10.0.0.1/31
interface Ethernet2
  switchport mode trunk
  switchport trunk allowed vlan 10,20
vlan 10
  name servers
interface Vlan10               # SVI
  ip address 10.10.10.1/24
show interfaces status
show interfaces Ethernet1 counters errors
show lldp neighbors
```

## MLAG quick battery

```bash
show mlag                     # state: active, peer-link, ports
show mlag detail              # negotiation status, reload-delay
show mlag config-sanity       # find config drift between peers
show port-channel summary
```

## BGP / EVPN / VXLAN battery

```bash
show ip bgp summary                    # underlay peers
show bgp evpn summary                  # overlay peers
show bgp evpn route-type mac-ip        # type-2 (MAC/IP)
show bgp evpn route-type imet          # type-3 (flood lists)
show interfaces vxlan1                 # VNI→VLAN map, flood list
show vxlan vtep                        # discovered remote VTEPs
show vxlan address-table               # MACs learned over VXLAN
show ip route vrf <name> <prefix>      # VRF lookup
show ip bgp neighbors <ip> advertised-routes
```

## VRFs

```bash
vrf instance PROD
ip routing vrf PROD
interface Vlan20
  vrf PROD
  ip address 10.20.0.1/24
show vrf
ping vrf PROD 10.20.0.10
```

## eAPI (JSON-RPC over HTTPS)

```bash
management api http-commands
  no shutdown

curl -sk https://user:pass@switch/command-api -d '{
  "jsonrpc":"2.0","method":"runCmds","id":1,
  "params":{"version":1,"cmds":["show version"],"format":"json"}
}'
```

## Ops / maintenance

```bash
show version                  # EOS train, uptime, memory
show boot-config              # image booted next reload
copy running-config startup-config    # wr mem works too
show reload cause
show logging last 20
bash                          # full Linux shell underneath
show tech-support | gzip > /mnt/flash/tech.gz
```

## Small-platform caveats (7010/7020-class)

- **One sFlow destination per VRF** — a second collector needs another VRF.
- **No ERSPAN** on these SKUs — SPAN to a local port only.
- **Hitless/SSU upgrades are data-plane only** and same-train; control plane still restarts.
- Prefer **eAPI for config writes** over screen-scraping SSH.
