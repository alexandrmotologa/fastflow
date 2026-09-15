import { NodeDefinition } from '../types';

export const actionHttpNode: NodeDefinition = {
  subtype: 'action_http',
  category: 'action',
  displayName: 'HTTP Request',
  defaultLabel: 'Fetch External API',
  description: 'Sends outbound REST / JSON requests to third-party endpoints.',
  defaultConfig: {
    url: 'https://api.hunter.io/v2/domain-search?domain={{companyDomain}}',
    method: 'GET',
    headers: JSON.stringify({ 'Content-Type': 'application/json' }, null, 2),
    timeoutMs: 3000,
  },
  execute: async (context) => {
    const inputs = context.inputs || {};
    let url = context.config.url || 'https://api.example.com';

    for (const [key, val] of Object.entries(inputs)) {
      url = url.replaceAll(`{{${key}}}`, String(val ?? ''));
    }

    // Simulate network latency
    await new Promise((r) => setTimeout(r, 250));

    const simulatedResponse = {
      statusCode: 200,
      statusText: 'OK',
      data: {
        domain: inputs.companyDomain || 'cyberdyne-defense.org',
        disposable: false,
        webmail: false,
        mx_records: true,
        smtp_check: true,
        score: 98,
      },
    };

    return {
      outputs: {
        ...inputs,
        httpStatus: simulatedResponse.statusCode,
        httpResponse: simulatedResponse.data,
      },
      logs: [
        `${context.config.method} ${url} -> HTTP 200 OK (250ms)`,
        `Domain verification status: VALID`,
      ],
    };
  },
};
