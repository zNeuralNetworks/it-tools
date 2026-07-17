import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.govc-esxi-memo.title'),
  path: '/govc-esxi-memo',
  description: t('tools.govc-esxi-memo.description'),
  keywords: ['govc', 'esxi', 'vmware', 'vsphere', 'vm', 'ova'],
  component: () => import('./govc-esxi-memo.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/FileText')),
  createdAt: new Date('2026-07-16'),
  category: 'Cheatsheets',
});
