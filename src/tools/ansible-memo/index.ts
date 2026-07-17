import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.ansible-memo.title'),
  path: '/ansible-memo',
  description: t('tools.ansible-memo.description'),
  keywords: ['ansible', 'jinja', 'automation', 'playbook'],
  component: () => import('./ansible-memo.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/FileText')),
  createdAt: new Date('2026-07-16'),
  category: 'Cheatsheets',
});
