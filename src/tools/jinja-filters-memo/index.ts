import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.jinja-filters-memo.title'),
  path: '/jinja-filters-memo',
  description: t('tools.jinja-filters-memo.description'),
  keywords: ['ansible', 'jinja', 'automation', 'playbook'],
  component: () => import('./jinja-filters-memo.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/FileText')),
  createdAt: new Date('2026-07-16'),
  category: 'Cheatsheets',
});
