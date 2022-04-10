import type { MDASTNode } from "./types";

const languageTabRegex =
  /(?:^\s*```[^\S\r\n]*(?<language>\S+)(?:$|(?:\s+(?<metastring>.*)$))(?<codeBlock>[\s\S]*?))(?:(?=(?:^\s*```\s*\S*|(?![\s\S]))))/gm;

const tabLabelRegex = /label=(["'])(?<label>.*?)\1/;
const codeLocationRegex = /codeLocation=(["'])(?<codeLocation>.*?)\1/;

export const noteStyle = {
  fontSize: ".9em",
  fontWeight: 600,
  color: "#0E75DD",
  textAlign: "center",
  paddingBottom: "13px",
  textDecoration: "underline",
};

export const transformNode = (node, { sync, tabLabels }): MDASTNode[] | undefined => {
  // regex = [ full match, language, metastrings, code block ]
  // map => [ code block, language, metastrings, tab label ]
  // reduce => eliminate duplicate tabs
  let seenLabels = {};
  const matches = [...node.value.matchAll(languageTabRegex)]
    .map(({ groups: { language, metastring, codeBlock } }) => ({
      codeBlock: codeBlock.trim(),
      language: language || "",
      metastring: metastring || "",
      label:
        metastring?.match(tabLabelRegex)?.groups.label ||
        tabLabels?.[language] ||
        language ||
        tabLabels[""],
      codeLocation: metastring?.match(codeLocationRegex)?.groups.codeLocation,
    }))
    .reduce((accum, match) => {
      if (!seenLabels.hasOwnProperty(match.label)) {
        accum.push(match);
        seenLabels[match.label] = true;
      }
      return accum;
    }, []);

  // no valid entries found
  if (matches.length === 0) {
    return undefined;
  }

  const labels = matches.map(({ label }) => label);

  const groupIdProp =
    sync === "all"
      ? 'groupId="codetabs"'
      : sync
      ? `groupId="codetabs-${labels.join("-")}"`
      : "";
  let res = [
    {
      type: "jsx",
      value: `<Tabs
          defaultValue="${labels[0]}"
          ${groupIdProp}
          values={[${labels.map(
            (label) => `{label: "${label}", value: "${label}"}`
          )}]}
        >`,
    },
  ] as MDASTNode[];



  matches.forEach(
    ({ codeBlock, language, metastring, label, codeLocation }) => {
      res.push(
        ...[
          {
            type: "jsx",
            value: `<TabItem value="${label}">`,
          },
          {
            type: node.type,
            meta: metastring,
            lang: language,
            value: codeBlock,
          },
          {
            type: "jsx",
            value: codeLocation
              ? `<div style={${JSON.stringify(
                  noteStyle
                )}}><a href="${codeLocation}" target="_blank">See full example on GitHub</a></div>`
              : "",
          },
          {
            type: "jsx",
            value: `</TabItem>`,
          },
        ]
      );
    }
  );

  res.push({
    type: "jsx",
    value: `</Tabs>`,
  });
  return res;
};