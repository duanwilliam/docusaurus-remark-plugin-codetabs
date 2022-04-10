import type { MDASTNode, Options } from "./types";
import { languages as defaultTabLabels } from "./languages";
import { transformNode } from "./transformNode";

const importNode = {
  type: "import",
  value:
    "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';",
};

const isCodetabsNode = (node) =>
  node.type === "code" && node.meta === "codetabs";

  const attacher = (options = {} as Options) => {
  const { sync = false, customLabels } = options;

  const tabLabels = { ...defaultTabLabels, ...customLabels };
  const resolvedOptions = {
    sync: sync,
    tabLabels: tabLabels,
  };

  let transformed = false;
  let alreadyImported = false;

  const transformer = (node: MDASTNode): MDASTNode[] | undefined => {
    if (node.type === "import" && node.value.includes("@theme/Tabs")) {
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
    if (node.type === "root" && transformed && !alreadyImported) {
      node.children.unshift(importNode);
    }
    return undefined;
  };
  return transformer;
};

module.exports = attacher;
