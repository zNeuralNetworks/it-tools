import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.ipv4-subnetting-memo.title'),
  path: '/ipv4-subnetting-memo',
  description: t('tools.ipv4-subnetting-memo.description'),
  keywords: ['subnet', 'cidr', 'ipv4', 'netmask', 'network', 'rfc1918'],
  component: () => import('./ipv4-subnetting-memo.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/FileText')),
  createdAt: new Date('2026-07-16'),
  category: 'Cheatsheets',
});
