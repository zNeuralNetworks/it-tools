# IPv4 subnetting cheatsheet

## Prefix → hosts

| CIDR | Mask | Hosts* | Typical use |
|---|---|---|---|
| /32 | 255.255.255.255 | 1 (host) | loopbacks, host routes |
| /31 | 255.255.255.254 | 2 (RFC 3021) | point-to-point links |
| /30 | 255.255.255.252 | 2 | legacy p2p |
| /29 | 255.255.255.248 | 6 | tiny segment |
| /28 | 255.255.255.240 | 14 | small segment |
| /27 | 255.255.255.224 | 30 | — |
| /26 | 255.255.255.192 | 62 | — |
| /25 | 255.255.255.128 | 126 | — |
| /24 | 255.255.255.0 | 254 | the default LAN |
| /23 | 255.255.254.0 | 510 | two /24s glued |
| /22 | 255.255.252.0 | 1022 | campus user VLAN |
| /21 | 255.255.248.0 | 2046 | — |
| /20 | 255.255.240.0 | 4094 | — |
| /16 | 255.255.0.0 | 65 534 | site aggregate |
| /8  | 255.0.0.0 | 16 777 214 | 10.0.0.0 |

*usable = 2^(32−prefix) − 2, except /31 (2) and /32 (1).

## Fast math

- **Block size** = 256 − last mask octet. `/26` → 256−192 = 64 → networks at .0, .64, .128, .192.
- Each extra prefix bit **halves** hosts; each bit removed **doubles**.
- Wildcard mask = inverse: `/27` → mask .224 → wildcard `0.0.0.31`.

## Reserved & special ranges

| Range | What |
|---|---|
| 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 | RFC 1918 private |
| 100.64.0.0/10 | CGN / shared (RFC 6598) — also Tailscale |
| 127.0.0.0/8 | loopback |
| 169.254.0.0/16 | link-local (APIPA = DHCP failed) |
| 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 | documentation (TEST-NET 1–3) |
| 198.18.0.0/15 | benchmarking |
| 224.0.0.0/4 | multicast (224.0.0.0/24 = link-local: .1 all-hosts, .2 all-routers, .5/.6 OSPF, .9 RIPv2, .13 PIM, .18 VRRP) |
| 240.0.0.0/4 | reserved; 255.255.255.255 broadcast |

## Habits that prevent outages

- Use **/31 for p2p** links (RFC 3021) — halves link-subnet burn vs /30.
- Summarize on **binary boundaries** only: two /24s aggregate to a /23 only if the third octet pair is even+odd (e.g. .2 and .3, not .3 and .4).
- First host = network+1, last host = broadcast−1; gateway convention: pick one (.1 or last) and never mix per site.
