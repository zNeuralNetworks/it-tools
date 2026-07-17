import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.jinja2-playground.title'),
  path: '/jinja2-playground',
  description: t('tools.jinja2-playground.description'),
  keywords: ['jinja', 'jinja2', 'template', 'nunjucks', 'ansible', 'render'],
  component: () => import('./jinja2-playground.vue'),
  icon: defineAsyncComponent(() => import('@vicons/tabler/es/Code')),
  createdAt: new Date('2026-07-16'),
  category: 'Development',
});
