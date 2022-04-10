# docusaurus-remark-plugin-codetabs

Docusaurus v2 plugin to quickly create multi-language code tabs by converting code blocks to Tabs.

_**Note**: as a consequence, this only works when used with Docusaurus themes containing the `Tabs` and `TabItem` components._

_Other note: Performance is probably suboptimal. PRs are welcome._

## Installation

```bash
# npm
npm install docusaurus-remark-plugin-codetabs

# yarn
yarn add docusaurus-remark-plugin-codetabs
```

## Usage

Add the plugin to the Remark plugins array for each instance using it in `docusaurus.config.js`

```js
module.exports = {
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          remarkPlugins: [
+           [require('docusaurus-remark-plugin-codetabs'), {
+             // options             
+           }],
          ],
        },
        blog: {
          remarkPlugins: [
+           [require('docusaurus-remark-plugin-codetabs'), {
+             // options             
+           }],
          ],
        },
      },
    ],
  ],
};
```

## Options

| Option | Type | Default | Description |
| :-: | :-: | :-: | :-- |
| `sync` | `boolean` \| `"all"` | `false` | Whether to sync tab choices for code tabs generated with the same labels (or all code tabs regardless of labels) |
| `customLabels` | `Object` | `{}` | Custom default labels for languages. Entries are in the form `lang: label`. If the language already has a default label, this overrides it

### `sync`

Code tabs with the same tab order and labels can be automatically synced up by setting `sync` to `true`.

If you're incrementally adding languages, you can have all code tabs with the same labels sync whenever applicable by setting `sync` to `"all"`.

### `customLabels`

Custom default labels can be defined here. See `src/languages.js` for the list of the defaults for this plugin.

## Syntax

Code tabs are denoted by code blocks with the metastring `codetabs`. The language for the code block can be anything, but `md` should be most useful for IDE syntax highlighting.

    ```md codetabs
    ```

### Code tabs
Each code tab is delimited by the standard code block convention `````` ```[language] [metadata]``````; these can be indented any amount. 

These inner code blocks deviate in syntax from normal code blocks, however, in that they do not have closing ` ``` `; instead, the end of each inner code block is inferred by the beginning of the next, or the end of the `codetabs` code block.

    ```md codetabs
    ``` jsx
    <MyComponent />
    ```js
    console.log('');
    ```

### Tab labels

A default label is assigned to each tab based on its language; however, a `label=` tag can be specified in the metastring to customize the label for a tab. Labels must be delimited by either single or double quotes.

    ```md codetabs
    ```python label="Python3"
    ```

In the case of duplicate label tabs, the latter ones are ignored.

The group id is generated from the resultant ordered set of labels, in the form ``codetabs-${uniqueLabels.join('-')}``. If `sync="all"`, the group id will always be `codetabs`.

### Code location references

Adding `codeLocation="https://github.com/duanwilliam/docusaurus-remark-plugin-codetabs/blob/main/README.md"` w

    ```js title="index.js" codeLocation="https://github.com/duanwilliam/docusaurus-remark-plugin-codetabs/blob/main/README.md"
    const main = () => {
      console.log("Hello, world");
    }

![codeLocation Example](https://user-images.githubusercontent.com/19932401/162643898-e701eddd-f9e8-40da-b84c-a7682ebf05f9.png)

### Comments

Comments are delimited by empty code block delimiters (` ``` `) on a separate line. Comment blocks will not be rendered.

Comment delimiters **must** be indented to avoid consuming the wrapping `codetabs` code block.

This feature really wasn't intended and probably shouldn't (need to be) used much but hey it's there.

    ```md codetabs
        ```
    this is a comment. it will not show up.
    ```

## Suggested practices

The following are suggestions for writing clean, maintainable code tabs with this plugin.

- Leave newlines between code tab and/or comment delimiters

      ```md codetabs
      ```js
      console.log("Hello, world!");

          ```
      this is a comment

      ```ts
      console.log("Foo, bar!");
      ```

- Avoid indenting code tab delimiters
      
    ```md codetabs
    
    ```js
    console.log("Hello, world!");

    ```ts
    console.log("Hello, world!");

    ```

- Avoid comments when possible

## Example

    ```md codetabs

    ```js title="index.js"
    const main = () => {
      console.log("Hello, world");
    }

    ```rust title='main.rs'
    let assignTitle: &str = r#"title="main.rs""#;

    ```cpp title="main.cpp"
    #include <iostream>
    using namespace std;
    int main() {
      cout << "Hello, world" << endl;
    }

    ```cpp label="C++11" title="main.cpp"
    string label="C++11";

        ```
    this is an important comment.

    ```jsx title="Component.jsx"
    <Tabs>
      <TabItem />
      <TabItem />
    </Tabs>
        ```
    ```

![codetabs example](./assets/example.gif)

## TODO / ideas

- better whitespace handling so code block content doesn't have to be on the same indent level as the `codetabs` wrapper
- typescript
- tests