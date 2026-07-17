import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.homelab-map-memo.title'),
  path: '/homelab-map-memo',
  description: t('tools.homelab-map-memo.description'),
  keywords: ['homelab', 'inventory', 'services', 'vm', 'lan'],
  component: () => import('./homelab-map-memo.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/FileText')),
  createdAt: new Date('2026-07-16'),
  category: 'Cheatsheets',
});
