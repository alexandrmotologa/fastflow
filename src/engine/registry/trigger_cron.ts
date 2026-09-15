import { NodeDefinition } from '../types';

export const triggerCronNode: NodeDefinition = {
  subtype: 'cron',
  category: 'trigger',
  displayName: 'Cron Scheduler',
  defaultLabel: 'Cron Trigger',
  description: 'Triggers the workflow periodically based on a cron expression.',
  defaultConfig: {
    cronExpression: '*/15 * * * *',
    timezone: 'UTC',
    batchSize: 100,
  },
  execute: async (context) => {
    const now = new Date();
    return {
      outputs: {
        scheduledTime: now.toISOString(),
        timestamp: now.getTime(),
        cronExpression: context.config.cronExpression,
        timezone: context.config.timezone || 'UTC',
        batchSize: context.config.batchSize || 100,
      },
      logs: [
        `Cron tick executed for schedule: ${context.config.cronExpression}`,
        `Batch size configured: ${context.config.batchSize}`,
      ],
    };
  },
};
