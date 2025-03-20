# recma-mdx-html-override

[![npm version][badge-npm-version]][url-npm-package]
[![npm downloads][badge-npm-download]][url-npm-package]
[![publish to npm][badge-publish-to-npm]][url-publish-github-actions]
[![code-coverage][badge-codecov]][url-codecov]
[![type-coverage][badge-type-coverage]][url-github-package]
[![typescript][badge-typescript]][url-typescript]
[![license][badge-license]][url-license]

This package is a **[unified][unified]** (**[recma][recma]**) plugin **that ensures selected html raw elements overridable via MDXComponents in MDX**.

**[unified][unified]** is a project that transforms content with abstract syntax trees (ASTs) using the new parser **[micromark][micromark]**. **[recma][recma]** adds support for producing a javascript code by transforming **[esast][esast]** which stands for Ecma Script Abstract Syntax Tree (AST) that is used in production of compiled source for the **[MDX][MDX]**.

## When should I use this?

**Use this plugin to be able to override selected html raw elements via MDXComponents**.

You can find the keys (JSX identifiers, `wrapper` and html tags) can be passed in MDXComponents and the rules whether a key is a `Literal` or a `Reference to an Identifier` in [@mdx-js/mdx docs](https://mdxjs.com/docs/using-mdx/#components).

**`recma-mdx-html-override`** focuses the `Literal` ones (the names that start with a lowercase or is not a valid JS identifier) to make them overridable via MDXComponents.

Basically, **`recma-mdx-html-override`** changes the `Literal` parameters into **`_components.[literal]`** in the `jsx`/`jsxs` call expressions making approppriate changes in the compiled source; and ensures them overridable via components.

## Installation

This package is suitable for ESM only. In Node.js (version 18+), install with npm:

```bash
npm install recma-mdx-html-override
```

or

```bash
yarn add recma-mdx-html-override
```

## Usage

Say we have the following file, `example.mdx`,

```mdx
# Hi {props.foo}
      
<Test name={props.baz} />
```

And our module, `example.js`, looks as follows:

```javascript
import { read } from "to-vfile";
import { compile } from "@mdx-js/mdx";
import recmaMdxChangeProps from "recma-mdx-html-override";

main();

async function main() {
  const source = await read("example.mdx");

  const compiledSource = await compile(source, {
    recmaPlugins: [recmaMdxChangeProps],
  });

  return String(compiledSource);
}
```

Now, running `node example.js` produces the `compiled source` like below:

```js
function _createMdxContent(_props) {
  const _components = {
    h1: "h1",
    ..._props.components
  }, {Test} = _components;
  // ...
  return _jsxs(_Fragment, {
    children: [_jsxs(_components.h1, {
      children: ["Hi ", props.foo]
    }), "\\n", _jsx(Test, {
      name: props.baz
    })]
  });
}
```

And, this provides us to pass an object containing the `props` key during function construction of the compiled source.

```js
const scope = {
  title: "My Article",
  props: {
    foo: "foofoo",
    bar: "barbar",
  }
}
``` 

Without the `recma-mdx-html-override`, the statements `props.foo` and `props.baz` will be `undefined` during function construction.

```js
function _createMdxContent(props) {
  const _components = {
    h1: "h1",
    ...props.components
  }, {Test} = _components;
  // ...
  return _jsxs(_Fragment, {
    children: [_jsxs(_components.h1, {
      children: ["Hi ", props.foo]
    }), "\\n", _jsx(Test, {
      name: props.baz
    })]
  });
}
```

## Options

All options are optional, and implemented as for being more flexible in case of need to change the names.

```typescript
export type HtmlOverrideOptions = {
  funcName?: string; // default is "_createMdxContent" which the plugin looks for
  propName?: string; // default is "props" which the plugin looks for
  propAs?: string; // default is "_props" which the plugin converts into
};
```

The options are self-explainotary, so that is why no need to represent more example here.

```javascript
use(recmaMdxChangeProps, {propAs: "__props__"} as HtmlOverrideOptions);
```

## Syntax tree

This plugin only modifies the ESAST (Ecma Script Abstract Syntax Tree) as explained.

## Types

This package is fully typed with [TypeScript][url-typescript]. The plugin options is exported as `HtmlOverrideOptions`.

## Compatibility

This plugin works with `unified` version 6+. It is compatible with `mdx` version 3+.

## Security

Use of `recma-mdx-html-override` does not involve user content so there are no openings for cross-site scripting (XSS) attacks.

## My Plugins

I like to contribute the Unified / Remark / MDX ecosystem, so I recommend you to have a look my plugins.

### My Remark Plugins

- [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
- [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
- [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown
- [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
- [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
- [`remark-flexible-toc`](https://www.npmjs.com/package/remark-flexible-toc)
  – Remark plugin to expose the table of contents via `vfile.data` or via an option reference
- [`remark-mdx-remove-esm`](https://www.npmjs.com/package/remark-mdx-remove-esm)
  – Remark plugin to remove import and/or export statements (mdxjsEsm)

### My Rehype Plugins

- [`rehype-pre-language`](https://www.npmjs.com/package/rehype-pre-language)
  – Rehype plugin to add language information as a property to `pre` element
- [`rehype-highlight-code-lines`](https://www.npmjs.com/package/rehype-highlight-code-lines)
  – Rehype plugin to add line numbers to code blocks and allow highlighting of desired code lines
- [`rehype-code-meta`](https://www.npmjs.com/package/rehype-code-meta)
  – Rehype plugin to copy `code.data.meta` to `code.properties.metastring`

### My Recma Plugins

- [`recma-mdx-escape-missing-components`](https://www.npmjs.com/package/recma-mdx-escape-missing-components)
  – Recma plugin to set the default value `() => null` for the Components in MDX in case of missing or not provided so as not to throw an error
- [`recma-mdx-change-props`](https://www.npmjs.com/package/recma-mdx-change-props)
  – Recma plugin to change the `props` parameter into the `_props` in the `function _createMdxContent(props) {/* */}` in the compiled source in order to be able to use `{props.foo}` like expressions. It is useful for the `next-mdx-remote` or `next-mdx-remote-client` users in `nextjs` applications.
- [`recma-mdx-change-imports`](https://www.npmjs.com/package/recma-mdx-change-imports)
  – Recma plugin to convert import declarations for assets and media with relative links into variable declarations with string URLs, enabling direct asset URL resolution in compiled MDX.
- [`recma-mdx-import-media`](https://www.npmjs.com/package/recma-mdx-import-media)
  – Recma plugin to turn media relative paths into import declarations for both markdown and html syntax in MDX.
- [`recma-mdx-import-react`](https://www.npmjs.com/package/recma-mdx-import-react)
  – Recma plugin to ensure getting `React` instance from the arguments and to make the runtime props `{React, jsx, jsxs, jsxDev, Fragment}` is available in the dynamically imported components in the compiled source of MDX.
- [`recma-mdx-html-override`](https://www.npmjs.com/package/recma-mdx-html-override)
  – Recma plugin to ensure selected html raw elements overridable via MDXComponents in MDX.

## License

[MIT License](./LICENSE) © ipikuka

[unified]: https://github.com/unifiedjs/unified
[micromark]: https://github.com/micromark/micromark
[recma]: https://mdxjs.com/docs/extending-mdx/#list-of-plugins
[esast]: https://github.com/syntax-tree/esast
[estree]: https://github.com/estree/estree
[MDX]: https://mdxjs.com/

[badge-npm-version]: https://img.shields.io/npm/v/recma-mdx-html-override
[badge-npm-download]:https://img.shields.io/npm/dt/recma-mdx-html-override
[url-npm-package]: https://www.npmjs.com/package/recma-mdx-html-override
[url-github-package]: https://github.com/ipikuka/recma-mdx-html-override

[badge-license]: https://img.shields.io/github/license/ipikuka/recma-mdx-html-override
[url-license]: https://github.com/ipikuka/recma-mdx-html-override/blob/main/LICENSE

[badge-publish-to-npm]: https://github.com/ipikuka/recma-mdx-html-override/actions/workflows/publish.yml/badge.svg
[url-publish-github-actions]: https://github.com/ipikuka/recma-mdx-html-override/actions/workflows/publish.yml

[badge-typescript]: https://img.shields.io/npm/types/recma-mdx-html-override
[url-typescript]: https://www.typescriptlang.org/

[badge-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-html-override/graph/badge.svg?token=
[url-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-html-override

[badge-type-coverage]: https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fipikuka%2Frecma-mdx-html-override%2Fmaster%2Fpackage.json
