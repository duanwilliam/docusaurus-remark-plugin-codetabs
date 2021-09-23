import type { MDASTNode, Options } from './types';
import { languages as defaultTabLabels } from './languages';

const languageTabRegex = /(?:^\s*```[^\S\r\n]*(?<language>\S+)(?:$|(?:\s+(?<metastring>.*)$))(?<codeBlock>[\s\S]*?))(?:(?=(?:^\s*```\s*\S*|(?![\s\S]))))/mg;

const tabLabelRegex = /label=(["'])(?<label>.*?)\1/;

const transformNode = (node, { sync, tabLabels }): MDASTNode[] | undefined => {
  // regex = [ full match, language, metastrings, code block ]
  // map => [ code block, language, metastrings, tab label ]
  // reduce => eliminate duplicate tabs
  let seenLabels = {};
  const matches = [...node.value.matchAll(languageTabRegex)]
    .map(({groups: {language, metastring, codeBlock}}) => ({
      codeBlock: codeBlock.trim(),
      language: language || '',
      metastring: metastring || '',
      label: metastring?.match(tabLabelRegex)?.groups.label || tabLabels?.[language] || language || tabLabels[''],
    })).reduce((accum, match) => {
      if(!seenLabels.hasOwnProperty(match.label)) {
        accum.push(match);
        seenLabels[match.label] = true;
      }
      return accum;
    }, []);
    
  // no valid entries found
  if(matches.length === 0) {
    return undefined;
  }

  const labels =  matches.map(({label}) => label);

  const groupIdProp = sync === 'all'
    ? 'groupId="codetabs"'
    : sync
      ? `groupId="codetabs-${labels.join('-')}"`
      : ''
  ;

  let res = [
    {
      type: 'jsx',
      value:
        `<Tabs
          defaultValue="${labels[0]}"
          ${groupIdProp}
          values={[${labels.map((label) =>
            `{label: "${label}", value: "${label}"}`
          )}]}
        >`,
    },
  ] as MDASTNode[];

  matches.forEach(({codeBlock, language, metastring, label}) => {
    res.push(...[
      {
        type: 'jsx',
        value:
          `<TabItem value="${label}">`,
      },
      {
        type: node.type,
        meta: metastring,
        lang: language,
        value: codeBlock,
      },
      {
        type: 'jsx',
        value: `</TabItem>`,
      },
    ]);
  });

  res.push(
    {
      type: 'jsx',
      value: `</Tabs>`,
    },
  );
  return res;
}

const importNode = {
  type: 'import',
  value: "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';",
};

const isCodetabsNode = (node) => node.type === 'code' && node.meta === 'codetabs';

const attacher = (options = {} as Options) => {
  const {
    sync = false,
    customLabels,
  } = options;

  const tabLabels = {...defaultTabLabels, ...customLabels};
  const resolvedOptions = {
    sync: sync,
    tabLabels: tabLabels,
  };

  let transformed = false;
  let alreadyImported = false;

  const transformer = (node: MDASTNode): MDASTNode[] | undefined => {
    if (node.type === 'import' && node.value.includes('@theme/Tabs')) {
      alreadyImported = true;
    }

    if (isCodetabsNode(node)) {
      transformed = true;
      return transformNode(node, resolvedOptions);
    }
    if (Array.isArray(node.children)) {
      let index = 0;
      while (index < node.children.length) {
        const result = transformer(node.children[index]);
        if (result) {
          node.children.splice(index, 1, ...result);
          index += result.length;
        } else {
          index += 1;
        }
      }
    }
    if (node.type === 'root' && transformed && !alreadyImported) {
      node.children.unshift(importNode);
    }
    return undefined;
  };
  return transformer;
};

module.exports = attacher;