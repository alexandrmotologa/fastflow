import { NodeDefinition } from '../types';

export const outputSlackNode: NodeDefinition = {
  subtype: 'output_slack',
  category: 'output',
  displayName: 'Slack Dispatcher',
  defaultLabel: 'Notify Slack',
  description: 'Posts structured markdown notification to Slack channels via incoming webhook.',
  defaultConfig: {
    channel: '#sales-hot-leads',
    botName: 'FastFlow Lead Bot',
    template: '🔥 *High-Priority Enterprise Lead Ingested!*\n• *Company:* {{organization}}\n• *Contact:* {{fullName}} <{{corporateEmail}}>\n• *AI Score:* {{llmScore}}/100\n• *Action:* {{aiEnrichment.recommendedAction}}',
  },
  execute: async (context) => {
    const inputs = context.inputs || {};
    let message = context.config.template || '';

    // Interpolate deep object values
    const replaceToken = (text: string, path: string, val: any) => {
      return text.replaceAll(`{{${path}}}`, String(val ?? ''));
    };

    message = replaceToken(message, 'organization', inputs.organization || inputs.customer?.company);
    message = replaceToken(message, 'fullName', inputs.fullName || inputs.customer?.name);
    message = replaceToken(message, 'corporateEmail', inputs.corporateEmail || inputs.customer?.email);
    message = replaceToken(message, 'llmScore', inputs.llmScore || inputs.qualificationScore || 90);
    message = replaceToken(message, 'aiEnrichment.recommendedAction', inputs.aiEnrichment?.recommendedAction || 'Follow up immediately');

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 200));

    return {
      outputs: {
        dispatched: true,
        channel: context.config.channel,
        deliveredMessage: message,
        deliveredAt: new Date().toISOString(),
      },
      logs: [
        `Dispatched message to Slack channel ${context.config.channel}`,
        `Payload size: ${message.length} characters`,
      ],
    };
  },
};
