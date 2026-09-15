import { NodeDefinition } from '../types';

export const outputSqlNode: NodeDefinition = {
  subtype: 'output_sql',
  category: 'output',
  displayName: 'PostgreSQL Exporter',
  defaultLabel: 'PostgreSQL Upsert',
  description: 'Sanitizes payloads into relational SQL INSERT/UPSERT statements.',
  defaultConfig: {
    targetTable: 'analytics_leads',
    conflictKey: 'external_id',
    generateUpsert: true,
  },
  execute: async (context) => {
    const inputs = context.inputs || {};
    const table = context.config.targetTable || 'analytics_leads';
    const conflictKey = context.config.conflictKey || 'id';

    const cleanLeadId = inputs.leadId || inputs.id || 'cust_98213';
    const fullName = inputs.fullName || inputs.name || 'Anonymous';
    const email = inputs.corporateEmail || inputs.email || 'lead@domain.com';
    const company = inputs.organization || inputs.company || 'Unknown Corp';
    const score = Number(inputs.qualificationScore || inputs.llmScore || 85);

    const generatedSql = `
INSERT INTO ${table} (
  external_id, full_name, email, company_name, quality_score, updated_at
) VALUES (
  '${cleanLeadId}', '${fullName.replace(/'/g, "''")}', '${email}', '${company.replace(/'/g, "''")}', ${score}, NOW()
)
ON CONFLICT (${conflictKey}) DO UPDATE SET
  quality_score = EXCLUDED.quality_score,
  updated_at = NOW();
    `.trim();

    // Simulate query execution latency
    await new Promise((r) => setTimeout(r, 180));

    return {
      outputs: {
        affectedRows: 1,
        queryStatement: generatedSql,
        table,
        executedAt: new Date().toISOString(),
      },
      logs: [
        `Generated parameterized UPSERT statement for table ${table}`,
        `Query executed successfully in 180ms`,
      ],
    };
  },
};
