# Ansible cheatsheet

## Variable precedence (low → high, later wins)

1. role defaults (`roles/x/defaults/`)
2. inventory file / script **group vars**
3. `group_vars/all` → `group_vars/*` (inventory dir, then playbook dir)
4. inventory file / script **host vars**
5. `host_vars/*` (inventory dir, then playbook dir)
6. host facts / cached `set_fact`
7. play `vars:` → `vars_prompt` → `vars_files`
8. role `vars/` (`roles/x/vars/`)
9. block `vars:` → task `vars:`
10. `include_vars`
11. `set_fact` / `register`
12. role params (`roles: - {role: x, var: y}`) / `include_role` vars
13. **extra vars `-e`** — always wins

> Group-level tie-break: child group beats parent; same-depth groups resolve
> alphabetically (last wins) unless `ansible_group_priority` is set.

## Ad-hoc one-liners

```bash
ansible all -i inv.yml -m ping
ansible leafs -m command -a "show version" -o          # -o = one line/host
ansible web -m ansible.builtin.setup -a 'filter=ansible_default_ipv4'
ansible db -bK -m apt -a "name=htop state=present"     # -b become, -K ask pass
ansible-inventory -i inv.yml --graph                    # group tree
ansible-inventory -i inv.yml --host leaf1               # resolved vars for host
ansible localhost -m debug -a "msg={{ '10.0.0.0/24' | ansible.utils.ipaddr('net') }}"
```

## Playbook essentials

```bash
ansible-playbook site.yml -i inv.yml --check --diff     # dry-run with diffs
ansible-playbook site.yml --limit leaf1,leaf2 --tags bgp
ansible-playbook site.yml --start-at-task "push configs"
ansible-playbook site.yml --list-tasks / --list-hosts / --syntax-check
ANSIBLE_STDOUT_CALLBACK=yaml ansible-playbook ...       # readable output
```

## Vault

```bash
ansible-vault create secrets.yml
ansible-vault edit secrets.yml
ansible-vault encrypt_string 'S3cret!' --name 'bgp_password'   # inline !vault for group_vars
ansible-playbook site.yml --vault-password-file ~/.vault_pass
# mixed vault ids:
ansible-vault encrypt --vault-id prod@prompt secrets.yml
```

## ansible.cfg keys that matter

```ini
[defaults]
inventory = ./inventory.yml
host_key_checking = False
forks = 20
stdout_callback = yaml
gathering = explicit          # stop implicit fact-gathering on network gear
jinja2_extensions = jinja2.ext.loopcontrols,jinja2.ext.do   # REQUIRED for AVD
[persistent_connection]
command_timeout = 60
```

## AVD / network-automation gotchas (paid for in blood)

- **Run from the bundle/repo root with `ANSIBLE_CONFIG` pinned** — a cwd inside
  `avd_inventory/` silently skips `ansible.cfg` → `loopcontrols` unloaded →
  `eos_designs` dies with `unknown tag 'break'`.
- AVD ≥6 renders via **pyavd**; 3.x containers can't parse 6.x schema inputs.
- `underlay_routing_protocol: BGP` is silently invalid in 6.x — it's `ebgp`.
- Network modules want `ansible_connection: ansible.netcommon.httpapi` (eAPI)
  and no fact gathering; keep `gathering = explicit`.
- `--check` on network modules ≠ full validation — pre-deploy gate with
  Batfish/ANTA, not check mode.
