# Homelab map

> Hostnames/IPs only — credentials live in Vaultwarden (`rbw`), never here.

## Core infrastructure

| Service | Address | Notes |
|---|---|---|
| pfSense | 192.168.1.1 | firewall/DHCP; REST API v2 |
| ESXi (DL360 Gen9) | 192.168.1.15 | drive via `govc` |
| iLO 4 | 192.168.1.16 | REST `/rest/v1`, no trailing slashes |
| Arista 710P | 192.168.1.10 | eAPI + EOS MCP |
| AdGuard DNS (primary) | 192.168.1.58 | `.lan` split-DNS; API `:3000` |
| AdGuard DNS (secondary) | 192.168.1.66:3002 | HA pair — add rewrites to BOTH |
| Vaultwarden | 192.168.1.59:8200 | secrets (rbw) |
| step-ca | 192.168.1.59:9000 | internal CA; root at `certs.lan` |

## Platform VMs

| VM | IP | Runs |
|---|---|---|
| forge-vm | 192.168.1.63 | Gitea `:3000` (SSH `:22222`) |
| coolify-vm | 192.168.1.67 | Coolify `:8000` + Traefik (all `*.lan` apps) |
| semaphore-vm | 192.168.1.73 | Semaphore `:3030` + Gitea act_runner |
| ops-vm | 192.168.1.66 | NetBox `:8001`, Uptime Kuma `:3001`, Oxidized |
| monitoring | 192.168.1.55 | Prometheus/Grafana/Loki/ntfy |
| storage-vm | 192.168.1.64 | NFS, registry `:5000`, **Verdaccio `:4873`, Docker-mirror `:5001`** |
| dev-vm | 192.168.1.57 | headless agent dev box (also heavy image builds) |
| plane-vm | 192.168.1.68 | Plane issue tracking |
| wazuh | 192.168.1.62 | SIEM |
| containerlab | 192.168.1.50 | cEOS labs (mgmt `192.168.123.0/24`) |
| supabase-vm | 192.168.1.60 | Supabase (CraftStack) |
| ai-vm | 192.168.1.61 | Ollama/LiteLLM/Open WebUI |
| k3s | 192.168.1.76–78 | K3s+Cilium+ArgoCD (VIPs `.80–.89`) |
| n8n-vm | 192.168.1.90 | n8n automation |
| nextcloud-vm | 192.168.1.91 | Nextcloud (200G `/data`) |

## Front doors (`https://*.lan` via Traefik on .67 unless noted)

`cockpit.lan` · `tools.lan` · `gitea.lan`(.63) · `plane.lan` · `semaphore.lan` ·
`netbox.lan`(.66) · `uptimekuma.lan`(.66) · `grafana.lan`(.55) · `wazuh.lan`(.62) ·
`authentik.lan`(.65) · `openwebui.lan`(.61) · `n8n.lan` · `nextcloud.lan` ·
`argocd.lan`(.80) · `supabase.lan`(.60) · `cal.lan`(.56) · `penpot.lan`(.74) ·
`certs.lan` (CA root download)

## Quick habits

- New `.lan` name = AdGuard rewrite on **both** DNS nodes + step-ca cert.
- Heavy image builds: **dev-vm → push `192.168.1.64:5000/<app>` → Coolify pulls.**
  Never build big SPAs on coolify-vm.
- cEOS direct access from a workstation: `route add 192.168.123.0/24 192.168.1.50`.
- Backups: ops-vm restic → storage-vm + B2; caches are deliberately excluded.
