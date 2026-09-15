import { NodeDefinition } from '../types';

export const transformJsonNode: NodeDefinition = {
  subtype: 'transform_json',
  category: 'transform',
  displayName: 'JSON Transform',
  defaultLabel: 'Map & Filter JSON',
  description: 'Transforms, extracts, and remaps fields from upstream node payloads.',
  defaultConfig: {
    mapping: JSON.stringify(
      {
        leadId: '{{customer.id}}',
        fullName: '{{customer.name}}',
        corporateEmail: '{{customer.email}}',
        organization: '{{customer.company}}',
        qualificationScore: 85,
        channel: '{{metadata.utm_source}}',
      },
      null,
      2
    ),
  },
  execute: async (context) => {
    const inputs = context.inputs || {};

    const resolvePath = (obj: any, path: string) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    let mappingRules: Record<string, any> = {};
    try {
      mappingRules =
        typeof context.config.mapping === 'string'
          ? JSON.parse(context.config.mapping)
          : context.config.mapping;
    } catch {
      mappingRules = {};
    }

    const transformed: Record<string, any> = {};

    for (const [targetKey, expr] of Object.entries(mappingRules)) {
      if (typeof expr === 'string' && expr.startsWith('{{') && expr.endsWith('}}')) {
        const path = expr.slice(2, -2).trim();
        const resolved = resolvePath(inputs, path);
        transformed[targetKey] = resolved !== undefined ? resolved : null;
      } else {
        transformed[targetKey] = expr;
      }
    }

    return {
      outputs: transformed,
      logs: [
        `Mapped ${Object.keys(transformed).length} fields from input keys: [${Object.keys(inputs).join(', ')}]`,
      ],
    };
  },
};
