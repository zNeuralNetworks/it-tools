import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.arista-eos-memo.title'),
  path: '/arista-eos-memo',
  description: t('tools.arista-eos-memo.description'),
  keywords: ['arista', 'eos', 'bgp', 'evpn', 'vxlan', 'mlag', 'network', 'switch'],
  component: () => import('./arista-eos-memo.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/FileText')),
  createdAt: new Date('2026-07-16'),
  category: 'Cheatsheets',
});
