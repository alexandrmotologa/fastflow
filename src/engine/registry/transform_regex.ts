import { NodeDefinition } from '../types';

export const transformRegexNode: NodeDefinition = {
  subtype: 'transform_regex',
  category: 'transform',
  displayName: 'Regex Parser',
  defaultLabel: 'Regex Extractor',
  description: 'Applies regular expression patterns to extract domains, emails, IDs, or tokens.',
  defaultConfig: {
    sourceField: 'corporateEmail',
    pattern: '^([^@]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$',
    captureFieldNames: 'username, domain',
    fallbackValue: 'unknown',
  },
  execute: async (context) => {
    const inputs = context.inputs || {};
    const sourceField = context.config.sourceField || 'corporateEmail';
    const textToMatch = String(inputs[sourceField] || '');

    const patternStr = context.config.pattern || '(.*)';
    const captureNames = (context.config.captureFieldNames || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    let regex: RegExp;
    try {
      regex = new RegExp(patternStr);
    } catch (err: any) {
      throw new Error(`Invalid Regular Expression: ${err.message}`);
    }

    const match = textToMatch.match(regex);
    const extracted: Record<string, any> = {
      isMatch: !!match,
      sourceValue: textToMatch,
    };

    if (match) {
      extracted.matchedFull = match[0];
      captureNames.forEach((name: string, index: number) => {
        extracted[name] = match[index + 1] !== undefined ? match[index + 1] : null;
      });
    } else {
      captureNames.forEach((name: string) => {
        extracted[name] = context.config.fallbackValue || null;
      });
    }

    return {
      outputs: {
        ...inputs,
        regexExtracted: extracted,
        companyDomain: extracted.domain || 'cyberdyne-defense.org',
      },
      logs: [
        `Executed regex /${patternStr}/ on field '${sourceField}'`,
        `Match result: ${match ? 'FOUND' : 'NOT FOUND'} (${match ? match[0] : 'none'})`,
      ],
    };
  },
};
