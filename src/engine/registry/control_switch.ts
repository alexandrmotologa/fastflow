import { NodeDefinition } from '../types';

export const controlSwitchNode: NodeDefinition = {
  subtype: 'control_switch',
  category: 'logic',
  displayName: 'Conditional Branch',
  defaultLabel: 'If / Else Switch',
  description: 'Branches workflow execution along true or false paths based on evaluated conditions.',
  defaultConfig: {
    field: 'qualificationScore',
    operator: '>=',
    threshold: '80',
  },
  execute: async (context) => {
    const inputs = context.inputs || {};
    const field = context.config.field || 'qualificationScore';
    const operator = context.config.operator || '>=';
    const thresholdRaw = context.config.threshold ?? '80';

    const val = inputs[field];
    let conditionPassed = false;

    const numVal = Number(val);
    const numThreshold = Number(thresholdRaw);

    if (!isNaN(numVal) && !isNaN(numThreshold)) {
      switch (operator) {
        case '>=':
          conditionPassed = numVal >= numThreshold;
          break;
        case '>':
          conditionPassed = numVal > numThreshold;
          break;
        case '<=':
          conditionPassed = numVal <= numThreshold;
          break;
        case '<':
          conditionPassed = numVal < numThreshold;
          break;
        case '==':
          conditionPassed = numVal === numThreshold;
          break;
        case '!=':
          conditionPassed = numVal !== numThreshold;
          break;
      }
    } else {
      switch (operator) {
        case '==':
          conditionPassed = String(val) === String(thresholdRaw);
          break;
        case '!=':
          conditionPassed = String(val) !== String(thresholdRaw);
          break;
        default:
          conditionPassed = Boolean(val);
      }
    }

    const branch = conditionPassed ? 'true' : 'false';

    return {
      outputs: {
        ...inputs,
        _branchSelected: branch,
        _evaluation: {
          field,
          operator,
          threshold: thresholdRaw,
          actualValue: val,
          passed: conditionPassed,
        },
      },
      branchTargetHandle: branch,
      logs: [
        `Evaluated: ${field} (${val}) ${operator} ${thresholdRaw} => ${conditionPassed ? 'TRUE' : 'FALSE'}`,
        `Routing downstream pulses through port '${branch}'`,
      ],
    };
  },
};
