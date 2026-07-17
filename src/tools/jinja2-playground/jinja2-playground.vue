<script setup lang="ts">
import { computed, ref } from 'vue';
import nunjucks from 'nunjucks';
import { parse as parseYaml } from 'yaml';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const template = ref(`hostname {{ inventory_hostname }}
{% for vlan in vlans -%}
vlan {{ vlan.id }}
   name {{ vlan.name | upper }}
{% endfor -%}
{% if bgp_as is defined %}
router bgp {{ bgp_as }}
{% endif %}`);

const contextYaml = ref(`inventory_hostname: leaf1
bgp_as: 65101
vlans:
  - { id: 10, name: servers }
  - { id: 20, name: storage }`);

const trimBlocks = ref(true);
const lstripBlocks = ref(true);

const result = computed(() => {
  let context: Record<string, unknown>;
  try {
    context = (parseYaml(contextYaml.value) ?? {}) as Record<string, unknown>;
  }
  catch (err) {
    return { output: '', error: `YAML context error: ${(err as Error).message}` };
  }
  try {
    const env = new nunjucks.Environment(null, {
      autoescape: false,
      trimBlocks: trimBlocks.value,
      lstripBlocks: lstripBlocks.value,
      throwOnUndefined: false,
    });
    return { output: env.renderString(template.value, context), error: '' };
  }
  catch (err) {
    return { output: '', error: (err as Error).message };
  }
});
</script>

<template>
  <div style="max-width: 900px; margin: 0 auto;">
    <n-alert type="warning" mb-3>
      Rendered with <strong>nunjucks</strong>, a JS dialect of Jinja2: core syntax, loops,
      conditionals, whitespace control and common filters behave the same, but
      Ansible/Python-specific filters (<code>ipaddr</code>, <code>combine</code>,
      <code>to_nice_yaml</code>, …) are <strong>not available</strong>. Use this for template
      logic experiments — verify Ansible-specific behavior with
      <code>ansible -m debug</code>.
    </n-alert>

    <c-card title="Template (Jinja2 / nunjucks)" mb-2>
      <c-input-text v-model:value="template" multiline rows="10" monospace />
    </c-card>

    <c-card title="Context (YAML)" mb-2>
      <c-input-text v-model:value="contextYaml" multiline rows="6" monospace />
    </c-card>

    <n-space mb-2>
      <n-form-item label="trim_blocks" label-placement="left">
        <n-checkbox v-model:checked="trimBlocks" />
      </n-form-item>
      <n-form-item label="lstrip_blocks" label-placement="left">
        <n-checkbox v-model:checked="lstripBlocks" />
      </n-form-item>
    </n-space>

    <c-card title="Rendered output">
      <n-alert v-if="result.error" type="error">
        {{ result.error }}
      </n-alert>
      <TextareaCopyable v-else :value="result.output" language="txt" />
    </c-card>
  </div>
</template>
