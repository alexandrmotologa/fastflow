import { NodeDefinition } from '../types';

export const transformCodeNode: NodeDefinition = {
  subtype: 'transform_code',
  category: 'transform',
  displayName: 'Custom Code (JS)',
  defaultLabel: 'JavaScript Expression',
  description: 'Executes custom JavaScript code to perform programmatic transformations on inputs.',
  defaultConfig: {
    code: `// 'inputs' contains all merged data from upstream nodes
const baseScore = Number(inputs.qualificationScore || inputs.llmScore || 80);

return {
  ...inputs,
  calculatedArr: baseScore * 1800,
  isHighValueAccount: baseScore >= 85,
  pipelineStage: baseScore >= 85 ? 'priority_fastlane' : 'standard_queue',
  checksum: 'ff_' + Math.random().toString(36).substring(2, 9),
  transformedAt: new Date().toISOString()
};`,
  },
  execute: async (context) => {
    const inputs = context.inputs || {};
    const code = context.config.code || 'return inputs;';

    const startTime = performance.now();

    try {
      // Execute the user expression passing 'inputs' and 'input' as parameters
      const userFn = new Function('inputs', 'input', 'context', code);
      const result = await Promise.resolve(userFn(inputs, inputs, context));

      const durationMs = Math.round(performance.now() - startTime);

      if (typeof result !== 'object' || result === null) {
        return {
          outputs: { value: result },
          logs: [
            `Evaluated custom script (${durationMs}ms)`,
            `Returned primitive output: ${String(result)}`,
          ],
        };
      }

      return {
        outputs: result,
        logs: [
          `Evaluated custom script (${durationMs}ms)`,
          `Produced object with ${Object.keys(result).length} properties`,
        ],
      };
    } catch (err: any) {
      throw new Error(`Custom Code Script Error: ${err.message}`);
    }
  },
};

export const transformCodeExecutor = transformCodeNode;

