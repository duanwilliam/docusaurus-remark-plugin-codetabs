let defaultTabLabels = require('./languages.js');

const languageTabRegex = /(?:^\s*```[^\S\r\n]*(\S+)(?:$|(?:\s+(.*)$))([\s\S]*?))(?:(?=(?:^\s*```\s*\S*|(?![\s\S]))))/mg;

const tabLabelRegex = /label=(["'])(.*?)\1/;

const transformNode = (node, sync) => {
  // regex = [ full match, language, metastrings, code block ]
  // map => [ code block, language, metastrings, tab label ]
  // reduce => eliminate duplicate tabs
  let seenLabels = {};
  const matches = [...node.value.matchAll(languageTabRegex)]
    .map(([, language, metastring, codeBlock]) => [
      codeBlock.trim(),
      language || '',
      metastring || '',
      metastring?.match(tabLabelRegex)?.[2] || defaultTabLabels?.[language] || language ||defaultTabLabels[''],
    ]).reduce((accum, match) => {
      const label = match[3];
      if(!seenLabels.hasOwnProperty(label)) {
        accum.push(match);
        seenLabels[label] = true;
      }
      return accum;
    }, [])
  ;
    
  // no valid entries found
  if(matches.length === 0) {
    return null;
  }

  const labels =  matches.map(([,,,label]) => label);

  const groupIdProp = sync
    ? `groupId="codetabs-${labels.join('-')}"`
    : ''
  ;

  let res = [
    {
      type: 'jsx',
      value:
        `<Tabs
          defaultValue="${matches[0][3]}"
          ${groupIdProp}
          values={[${labels.map((label) =>
            `{label: "${label}", value: "${label}"}`
          )}]}
        >`,
    },
  ];

  matches.forEach(([codeBlock, language, metastring, label]) => {
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

const importTabsRegex = /import\s+Tabs\s+from\s+(["'`])@theme\/Tabs\1/m;
const importTabItemRegex = /import\s+TabItem\s+from\s+(["'`])@theme\/TabItem\1/m;
const isImportTabsNode = (node) => node.type === 'import' && importTabsRegex.test(node.value);
const isImportTabItemNode = (node) => node.type === 'import' && importTabItemRegex.test(node.value);
const importTabsNode = {
  type: 'import',
  value: "import Tabs from '@theme/Tabs';",
};
const importTabItemNode = {
  type: 'import',
  value: "import TabItem from '@theme/TabItem';",
}

const isCodetabsNode = (node) => node.type === 'code' && node.meta === 'codetabs';

const attacher = (options = {}) => {
  const {
    sync = false,
    customLabels = {},
  } = options;
  defaultTabLabels = {...defaultTabLabels, ...customLabels};

  let transformed = false;
  let importTabsNodeExists = false;
  let importTabItemNodeExists = false;

  const transformer = (node) => {
    if (isImportTabsNode(node)) {
      importTabsNodeExists = true;
    }
    if (isImportTabItemNode(node)) {
      importTabItemNodeExists = true;
    }

    if (isCodetabsNode(node)) {
      transformed = true;
      return transformNode(node, sync);
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
    if (node.type === 'root' && transformed) {
      if(!importTabItemNodeExists) {
        node.children.unshift(importTabItemNode);
      }
      if(!importTabsNodeExists) {
        node.children.unshift(importTabsNode);
      }
    }
    return undefined;
  };
  return transformer;
};

module.exports = attacher;