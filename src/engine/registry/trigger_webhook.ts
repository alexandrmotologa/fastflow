import { NodeDefinition } from '../types';

export const triggerWebhookNode: NodeDefinition = {
  subtype: 'webhook',
  category: 'trigger',
  displayName: 'Webhook Trigger',
  defaultLabel: 'Incoming Webhook',
  description: 'Triggers the workflow when an HTTP POST request is received with JSON body.',
  defaultConfig: {
    endpoint: '/api/v1/webhook/leads',
    method: 'POST',
    secretHeader: 'X-Webhook-Secret',
    mockPayload: JSON.stringify(
      {
        event: 'lead.created',
        timestamp: new Date().toISOString(),
        customer: {
          id: 'cust_98213',
          name: 'Sarah Connor',
          email: 'sarah.connor@cyberdyne-defense.org',
          company: 'Cyberdyne Defense LLC',
          tier: 'enterprise',
          annualBudget: 250000,
        },
        metadata: {
          utm_source: 'linkedin_campaign_q3',
          country: 'US',
        },
      },
      null,
      2
    ),
  },
  execute: async (context) => {
    let payload = {};
    try {
      if (typeof context.config.mockPayload === 'string') {
        payload = JSON.parse(context.config.mockPayload);
      } else if (context.config.mockPayload) {
        payload = context.config.mockPayload;
      }
    } catch {
      payload = { raw: context.config.mockPayload || '' };
    }

    return {
      outputs: {
        ...payload,
        _triggerMeta: {
          receivedAt: new Date().toISOString(),
          endpoint: context.config.endpoint,
          method: context.config.method,
        },
      },
      logs: [
        `Received ${context.config.method} request on ${context.config.endpoint}`,
        `Parsed payload with ${Object.keys(payload).length} top-level fields`,
      ],
    };
  },
};
