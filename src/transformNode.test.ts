import { noteStyle, transformNode } from "./transformNode";
describe("docusaurus-remark-plugin-code-tab", () => {
  it.each([
    [
      {
        meta: {
          codeLocation: "http://foo.com",
        },
      },
      { showcodeLocationUrl: true },
    ],
    [
      {
        meta: {
          codeLocation: undefined,
        },
      },
      { showcodeLocationUrl: false },
    ],
  ])(
    "should render Tabs with a TabItem with the following %o ",
    (input, expected) => {
      const lang = "ruby";
      const codeBlock = `#!/usr/bin/env ruby
      print "Hello World"`;
      const node = {
        type: "code",
        meta: "codetabs",
        value: `\`\`\`${lang} title="regex"${
          input.meta.codeLocation ? ` codeLocation="${input.meta.codeLocation}"` : ""
        }"
        ${codeBlock}`,
      };

      const result = transformNode(node, {
        sync: undefined,
        tabLabels: undefined,
      });
      expect(result[0].type).toBe("jsx");
      expect(result[0].value).toBe(`<Tabs
          defaultValue=\"${lang}\"
          
          values={[{label: \"${lang}\", value: \"${lang}\"}]}
        >`);
      expect(result[1].value).toBe(`<TabItem value=\"${lang}\">`);
      expect(result[2].value).toBe(codeBlock);
      expect(result[3].value).toBe(
        expected.showcodeLocationUrl
          ? `<div style={${JSON.stringify(noteStyle)}}><a href=\"${
              input.meta.codeLocation
            }\" target=\"_blank\">See full example on GitHub</a></div>`
          : ""
      );
      expect(result[4].value).toBe("</TabItem>");
      expect(result[5].value).toBe("</Tabs>");
    }
  );
});
