import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.optics-memo.title'),
  path: '/optics-memo',
  description: t('tools.optics-memo.description'),
  keywords: ['optics', 'sfp', 'qsfp', 'transceiver', 'fiber', 'dac', 'aoc'],
  component: () => import('./optics-memo.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/FileText')),
  createdAt: new Date('2026-07-16'),
  category: 'Cheatsheets',
});
