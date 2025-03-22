import { compile } from "@mdx-js/mdx";
import rehypeRaw from "rehype-raw";
import dedent from "dedent";

import recmaMdxHtmlOverride, { type HtmlOverrideOptions } from "../src";

describe("recma-mdx-html-override, output is function-body", () => {
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
      outputFormat: "function-body",
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      ""use strict";
      const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
      function _createMdxContent(props) {
        return _jsxs(_Fragment, {
          children: [_jsx("a", {}), "\\n", _jsx("a-b", {}), "\\n", _jsx("a-b-c", {}), "\\n", _jsx("a-b", {}), "\\n", _jsx("a-b-c", {})]
        });
      }
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("with plugin, only html raw elements, format mdx", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "function-body",
      recmaPlugins: [
        [recmaMdxHtmlOverride, { tags: ["a", "a-b", "a-b-c"] } as HtmlOverrideOptions],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      ""use strict";
      const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
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
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("without plugin, only html raw elements, format md", async () => {
    const compiledSource = await compile(source, {
      format: "md",
      outputFormat: "function-body",
      rehypePlugins: [rehypeRaw],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      ""use strict";
      const {jsx: _jsx, jsxs: _jsxs} = arguments[0];
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
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("with plugin, only html raw elements, format md", async () => {
    const compiledSource = await compile(source, {
      format: "md",
      outputFormat: "function-body",
      rehypePlugins: [rehypeRaw],
      recmaPlugins: [
        [recmaMdxHtmlOverride, { tags: ["a", "a-b", "a-b-c"] } as HtmlOverrideOptions],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      ""use strict";
      const {jsx: _jsx, jsxs: _jsxs} = arguments[0];
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
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });
});

describe("recma-mdx-html-override, output is function-body, jsx is true", () => {
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
      outputFormat: "function-body",
      jsx: true,
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      "use strict";
      function _createMdxContent(props) {
        return <><a />{"\\n"}<a-b />{"\\n"}<a-b-c />{"\\n"}<a-b />{"\\n"}<a-b-c /></>;
      }
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("with plugin, only html raw elements, format mdx, jsx true", async () => {
    const compiledSource = await compile(source, {
      outputFormat: "function-body",
      jsx: true,
      recmaPlugins: [
        [recmaMdxHtmlOverride, { tags: ["a", "a-b", "a-b-c"] } as HtmlOverrideOptions],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      "use strict";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          "a-b": "a-b",
          "a-b-c": "a-b-c",
          ...props.components
        }, _mdxcomponent0 = _components["a-b"], _mdxcomponent1 = _components["a-b-c"];
        return <><_components.a />{"\\n"}<_mdxcomponent0 />{"\\n"}<_mdxcomponent1 />{"\\n"}<_mdxcomponent0 />{"\\n"}<_mdxcomponent1 /></>;
      }
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("without plugin, only html raw elements, format md, jsx true", async () => {
    const compiledSource = await compile(source, {
      format: "md",
      outputFormat: "function-body",
      jsx: true,
      rehypePlugins: [rehypeRaw],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      "use strict";
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
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });

  // ******************************************
  it("with plugin, only html raw elements, format md, jsx true", async () => {
    const compiledSource = await compile(source, {
      format: "md",
      outputFormat: "function-body",
      jsx: true,
      rehypePlugins: [rehypeRaw],
      recmaPlugins: [
        [recmaMdxHtmlOverride, { tags: ["a", "a-b", "a-b-c"] } as HtmlOverrideOptions],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      "use strict";
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
      function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      return {
        default: MDXContent
      };
      "
    `);
  });
});
