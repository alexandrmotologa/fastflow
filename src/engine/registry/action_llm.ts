import { NodeDefinition } from '../types';

export const actionLlmNode: NodeDefinition = {
  subtype: 'action_llm',
  category: 'action',
  displayName: 'AI Prompt / LLM',
  defaultLabel: 'Claude Intelligence',
  description: 'Synthesizes, enriches, or classifies incoming data using an LLM prompt.',
  defaultConfig: {
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.2,
    maxTokens: 500,
    systemPrompt: 'You are an enterprise sales intelligence analyst. Analyze inbound leads and return qualification summaries.',
    userPromptTemplate: 'Analyze organization "{{organization}}" with email "{{corporateEmail}}". Output estimated industry, risk profile, and recommended AE tier.',
  },
  execute: async (context) => {
    const inputs = context.inputs || {};

    let userPrompt = context.config.userPromptTemplate || '';
    for (const [key, val] of Object.entries(inputs)) {
      userPrompt = userPrompt.replaceAll(`{{${key}}}`, String(val ?? ''));
    }

    // Realistic simulated latency of an LLM completion
    await new Promise((r) => setTimeout(r, 450));

    const companyName = inputs.organization || inputs.fullName || 'Target Account';
    const domain = inputs.companyDomain || 'cyberdyne-defense.org';

    const aiOutput = {
      accountClassification: 'Tier 1 Enterprise Tech & Defense',
      qualificationScore: 94,
      intentSummary: `Verified domain ${domain} for ${companyName}. Organization has high buying intent for automation and DAG orchestration infrastructure.`,
      recommendedAction: 'Immediate Priority Routing to Strategic AE',
      tags: ['defense', 'autonomous-systems', 'high-arr', 'fast-track'],
      modelUsed: context.config.model,
      tokensUsed: {
        input: 78,
        output: 142,
        total: 220,
      },
    };

    return {
      outputs: {
        ...inputs,
        aiEnrichment: aiOutput,
        llmScore: aiOutput.qualificationScore,
      },
      logs: [
        `Invoked ${context.config.model} (Tokens: 220, latency: 450ms)`,
        `Classification: ${aiOutput.accountClassification} (Score: ${aiOutput.qualificationScore})`,
      ],
    };
  },
};
