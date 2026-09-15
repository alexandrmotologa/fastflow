import { WorkflowTemplate } from '../engine/types';
import aiLeadEnrichment from './ai_lead_enrichment.json';
import sqlDataSanitizer from './sql_data_sanitizer.json';
import orderFraudTriage from './order_fraud_triage.json';

export const builtInTemplates: WorkflowTemplate[] = [
  aiLeadEnrichment as WorkflowTemplate,
  sqlDataSanitizer as WorkflowTemplate,
  orderFraudTriage as WorkflowTemplate,
];

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return builtInTemplates.find((t) => t.id === id);
}
