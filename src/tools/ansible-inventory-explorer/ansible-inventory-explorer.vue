<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  allHosts,
  detectFormat,
  matchPattern,
  parseInventory,
  renderGroupTree,
  toIniInventory,
  toYamlInventory,
} from './ansible-inventory-explorer.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const rawInventory = ref(`[spines]
spine1 ansible_host=10.0.0.1
spine2 ansible_host=10.0.0.2

[leafs]
leaf1 ansible_host=10.0.1.1
leaf2 ansible_host=10.0.1.2
leaf3 ansible_host=10.0.1.3 maintenance=true

[dc1:children]
spines
leafs

[dc1:vars]
ansible_network_os=arista.eos.eos
`);
const pattern = ref('leafs:!leaf3');

const parsed = computed(() => {
  try {
    const model = parseInventory(rawInventory.value);
    return { model, error: '' };
  }
  catch (err) {
    return { model: null, error: (err as Error).message };
  }
});

const format = computed(() => detectFormat(rawInventory.value));
const converted = computed(() => {
  if (!parsed.value.model) { return ''; }
  return format.value === 'ini'
    ? toYamlInventory(parsed.value.model)
    : toIniInventory(parsed.value.model);
});
const tree = computed(() => (parsed.value.model ? renderGroupTree(parsed.value.model) : ''));
const hostCount = computed(() => (parsed.value.model ? allHosts(parsed.value.model).length : 0));
const matched = computed(() => {
  if (!parsed.value.model) { return []; }
  try {
    return matchPattern(parsed.value.model, pattern.value);
  }
  catch {
    return [];
  }
});
</script>

<template>
  <div style="max-width: 900px; margin: 0 auto;">
    <c-card title="Inventory (INI or YAML — auto-detected)" mb-2>
      <c-input-text
        v-model:value="rawInventory"
        multiline
        rows="14"
        placeholder="Paste your Ansible inventory here…"
        monospace
      />
      <n-alert v-if="parsed.error" type="error" mt-2>
        {{ parsed.error }}
      </n-alert>
      <div v-else mt-2 op-70>
        Detected format: <strong>{{ format.toUpperCase() }}</strong> · {{ hostCount }} hosts
      </div>
    </c-card>

    <c-card :title="`Converted to ${format === 'ini' ? 'YAML' : 'INI'}`" mb-2>
      <TextareaCopyable :value="converted" :language="format === 'ini' ? 'yaml' : 'ini'" />
    </c-card>

    <c-card title="Group tree (resolved membership)" mb-2>
      <TextareaCopyable :value="tree" language="txt" />
    </c-card>

    <c-card title="Host-pattern tester">
      <c-input-text
        v-model:value="pattern"
        placeholder="e.g. leafs:&dc1:!maintenance or web*:!web03"
        label="Pattern"
        label-position="left"
        monospace
        mb-2
      />
      <div op-70 mb-2>
        Union with <code>:</code> (or <code>,</code>), intersect with <code>:&amp;</code>, exclude with <code>:!</code>, globs with <code>*</code>.
      </div>
      <TextareaCopyable
        :value="matched.length ? matched.join('\n') : '(no hosts matched)'"
        language="txt"
      />
    </c-card>
  </div>
</template>
