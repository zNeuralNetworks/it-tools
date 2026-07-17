import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.ansible-inventory-explorer.title'),
  path: '/ansible-inventory-explorer',
  description: t('tools.ansible-inventory-explorer.description'),
  keywords: ['ansible', 'inventory', 'ini', 'yaml', 'group', 'host', 'pattern', 'limit'],
  component: () => import('./ansible-inventory-explorer.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/Sitemap')),
  createdAt: new Date('2026-07-16'),
  category: 'Development',
});
