import { NodeDefinition, NodeSubtype } from '../types';
import { triggerWebhookNode } from './trigger_webhook';
import { triggerCronNode } from './trigger_cron';
import { transformJsonNode } from './transform_json';
import { transformRegexNode } from './transform_regex';
import { transformCodeNode } from './transform_code';
import { actionLlmNode } from './action_llm';
import { actionHttpNode } from './action_http';
import { controlSwitchNode } from './control_switch';
import { outputSlackNode } from './output_slack';
import { outputSqlNode } from './output_sql';

export const nodeRegistry: Record<NodeSubtype, NodeDefinition> = {
  webhook: triggerWebhookNode,
  cron: triggerCronNode,
  transform_json: transformJsonNode,
  transform_regex: transformRegexNode,
  transform_code: transformCodeNode,
  action_llm: actionLlmNode,
  action_http: actionHttpNode,
  control_switch: controlSwitchNode,
  output_slack: outputSlackNode,
  output_sql: outputSqlNode,
};

export function getNodeDefinition(subtype: string): NodeDefinition | undefined {
  return nodeRegistry[subtype as NodeSubtype];
}

export function getAllNodeDefinitions(): NodeDefinition[] {
  return Object.values(nodeRegistry);
}
