# Jinja2 filters cheatsheet (Ansible)

## Defaults & existence

```jinja
{{ x | default('fallback') }}          {# undefined → fallback #}
{{ x | default('fb', true) }}          {# also empty/false → fallback #}
{{ x | default(omit) }}                {# omit the module param entirely #}
{{ x is defined }} / {{ x is none }} / {{ x | bool }}
{{ hostvars[h].mgmt_ip | mandatory }}  {# fail loudly if missing #}
```

## Dicts & lists

```jinja
{{ a | combine(b) }}                          {# shallow merge, b wins #}
{{ a | combine(b, recursive=true) }}          {# deep merge #}
{{ d | dict2items }} / {{ l | items2dict }}
{{ users | map(attribute='name') | list }}
{{ ifaces | selectattr('enabled') | list }}
{{ ifaces | selectattr('vlan', 'equalto', 10) | list }}
{{ ifaces | rejectattr('shutdown', 'defined') | list }}
{{ l | flatten }} / {{ l | unique }} / {{ l | sort }} / {{ a | difference(b) }}
{{ l | json_query('[?state==`up`].name') }}   {# JMESPath #}
{{ vlans | groupby('site') }}
{{ l | zip(other) | list }} / {{ range(1, 5) | list }}
```

## Strings & formats

```jinja
{{ s | regex_search('Vlan(\\d+)', '\\1') }}
{{ s | regex_replace('^Eth', 'Ethernet') }}
{{ s | split(',') }} / {{ l | join(', ') }}
{{ obj | to_nice_yaml(indent=2) }} / {{ obj | to_nice_json }}
{{ s | from_yaml }} / {{ s | from_json }}
{{ s | b64encode }} / {{ s | b64decode }}
{{ s | hash('sha256') }} / {{ pw | password_hash('sha512') }}
{{ '%02d' | format(n) }} / {{ s | upper | trim }}
{{ 1024 | human_readable }}                    {# 1.00 KB #}
```

## Network (ansible.utils / netcommon)

```jinja
{{ '10.0.0.5/24' | ansible.utils.ipaddr('address') }}    {# 10.0.0.5 #}
{{ '10.0.0.5/24' | ansible.utils.ipaddr('network') }}    {# 10.0.0.0 #}
{{ '10.0.0.5/24' | ansible.utils.ipaddr('prefix') }}     {# 24 #}
{{ '10.0.0.0/24' | ansible.utils.nthhost(3) }}           {# 10.0.0.3 #}
{{ '10.0.0.0/16'  | ansible.utils.ipsubnet(24, 5) }}     {# 5th /24 #}
{{ ip | ansible.utils.ipmath(8) }}                       {# ip + 8 #}
{{ '2001:db8::1' | ansible.utils.ipv6 }}
{{ 'aa:bb:cc:dd:ee:ff' | ansible.utils.hwaddr('cisco') }}
```

## Loops & whitespace control

```jinja
{% for h in hosts if h.enabled %}{{ loop.index }}: {{ h.name }}{% endfor %}
loop.first / loop.last / loop.index0 / loop.length
{% for i in ifaces %}{% if i.skip %}{% continue %}{% endif %}...{% endfor %}
  {# break/continue need jinja2.ext.loopcontrols — AVD requires it #}
{%- ... -%}    {# strip whitespace/newlines around the tag #}
```

## Tests worth knowing

```jinja
x is string / is mapping / is sequence / is number
ip is ansible.utils.in_network '10.0.0.0/8'
version is version('4.28', '>=')
path is exists       {# controller-side! #}
```

> **Debug recipe:** `ansible localhost -m debug -a "msg={{ '<expr>' }}"` beats
> five playbook runs.
