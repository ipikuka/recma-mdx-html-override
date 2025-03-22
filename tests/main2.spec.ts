import { compile } from "@mdx-js/mdx";
import rehypeRaw from "rehype-raw";
import dedent from "dedent";

import recmaMdxHtmlOverride, { type HtmlOverrideOptions } from "../src";

describe("recma-mdx-html-override, output is program", () => {
  const source = dedent`
    <a></a>
    <a-b></a-b>
    <a-b-c></a-b-c>
    <a-b></a-b>
    <a-b-c></a-b-c>
  `;

  // ******************************************
  it("without plugin, only html raw elements, format mdx", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        return _jsxs(_Fragment, {
          children: [_jsx("a", {}), "\\n", _jsx("a-b", {}), "\\n", _jsx("a-b-c", {}), "\\n", _jsx("a-b", {}), "\\n", _jsx("a-b-c", {})]
        });
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("with plugin, only html raw elements, format mdx", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [
        [recmaMdxHtmlOverride, { tags: ["a", "a-b", "a-b-c"] } as HtmlOverrideOptions],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          "a-b": "a-b",
          "a-b-c": "a-b-c",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.a, {}), "\\n", _jsx(_components["a-b"], {}), "\\n", _jsx(_components["a-b-c"], {}), "\\n", _jsx(_components["a-b"], {}), "\\n", _jsx(_components["a-b-c"], {})]
        });
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("without plugin, only html raw elements, format md", async () => {
    const compiledSource = await compile(source, {
      format: "md",
      outputFormat: "program",
      rehypePlugins: [rehypeRaw],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          "a-b": "a-b",
          "a-b-c": "a-b-c",
          p: "p",
          ...props.components
        }, _component0 = _components["a-b"], _component1 = _components["a-b-c"];
        return _jsxs(_components.p, {
          children: [_jsx(_components.a, {}), "\\n", _jsx(_component0, {}), "\\n", _jsx(_component1, {}), "\\n", _jsx(_component0, {}), "\\n", _jsx(_component1, {})]
        });
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("with plugin, only html raw elements, format md", async () => {
    const compiledSource = await compile(source, {
      format: "md",
      outputFormat: "program",
      rehypePlugins: [rehypeRaw],
      recmaPlugins: [
        [recmaMdxHtmlOverride, { tags: ["a", "a-b", "a-b-c"] } as HtmlOverrideOptions],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          "a-b": "a-b",
          "a-b-c": "a-b-c",
          p: "p",
          ...props.components
        }, _component0 = _components["a-b"], _component1 = _components["a-b-c"];
        return _jsxs(_components.p, {
          children: [_jsx(_components.a, {}), "\\n", _jsx(_component0, {}), "\\n", _jsx(_component1, {}), "\\n", _jsx(_component0, {}), "\\n", _jsx(_component1, {})]
        });
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      "
    `);
  });
});

describe("recma-mdx-html-override, output is program, jsx is true", () => {
  const source = dedent`
    <a></a>
    <a-b></a-b>
    <a-b-c></a-b-c>
    <a-b></a-b>
    <a-b-c></a-b-c>
  `;

  // ******************************************
  it("without plugin, only html raw elements, format mdx, jsx true", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
      jsx: true,
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        return <><a />{"\\n"}<a-b />{"\\n"}<a-b-c />{"\\n"}<a-b />{"\\n"}<a-b-c /></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("with plugin, only html raw elements, format mdx, jsx true", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "program",
      jsx: true,
      recmaPlugins: [
        [recmaMdxHtmlOverride, { tags: ["a", "a-b", "a-b-c"] } as HtmlOverrideOptions],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          "a-b": "a-b",
          "a-b-c": "a-b-c",
          ...props.components
        }, _mdxcomponent0 = _components["a-b"], _mdxcomponent1 = _components["a-b-c"];
        return <><_components.a />{"\\n"}<_mdxcomponent0 />{"\\n"}<_mdxcomponent1 />{"\\n"}<_mdxcomponent0 />{"\\n"}<_mdxcomponent1 /></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("without plugin, only html raw elements, format md, jsx true", async () => {
    const compiledSource = await compile(source, {
      format: "md",
      outputFormat: "program",
      jsx: true,
      rehypePlugins: [rehypeRaw],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          "a-b": "a-b",
          "a-b-c": "a-b-c",
          p: "p",
          ...props.components
        }, _component0 = _components["a-b"], _component1 = _components["a-b-c"];
        return <_components.p><_components.a />{"\\n"}<_component0 />{"\\n"}<_component1 />{"\\n"}<_component0 />{"\\n"}<_component1 /></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("with plugin, only html raw elements, format md, jsx true", async () => {
    const compiledSource = await compile(source, {
      format: "md",
      outputFormat: "program",
      jsx: true,
      rehypePlugins: [rehypeRaw],
      recmaPlugins: [
        [recmaMdxHtmlOverride, { tags: ["a", "a-b", "a-b-c"] } as HtmlOverrideOptions],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          "a-b": "a-b",
          "a-b-c": "a-b-c",
          p: "p",
          ...props.components
        }, _component0 = _components["a-b"], _component1 = _components["a-b-c"];
        return <_components.p><_components.a />{"\\n"}<_component0 />{"\\n"}<_component1 />{"\\n"}<_component0 />{"\\n"}<_component1 /></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });
});
