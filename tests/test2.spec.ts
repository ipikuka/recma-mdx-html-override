import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

import recmaMdxHtmlOverride, { type HtmlOverrideOptions } from "../src";

describe("recma-mdx-html-override, output is program, without plugin", () => {
  // ******************************************
  it("without plugin, only html raw element", async () => {
    const source = dedent`
      <img src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, { outputFormat: "program" });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {jsx as _jsx} from "react/jsx-runtime";
      function _createMdxContent(props) {
        return _jsx("img", {
          src: "image.png",
          alt: ""
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
  it("without plugin, only jsx element", async () => {
    const source = dedent`
      <Image src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, { outputFormat: "program" });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {jsx as _jsx} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const {Image} = props.components || ({});
        if (!Image) _missingMdxReference("Image", true);
        return _jsx(Image, {
          src: "image.png",
          alt: ""
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
      function _missingMdxReference(id, component) {
        throw new Error("Expected " + (component ? "component" : "object") + " \`" + id + "\` to be defined: you likely forgot to import, pass, or provide it.");
      }
      "
    `);
  });

  // ******************************************
  it("without plugin, not only html raw element, but also markdown header", async () => {
    const source = dedent`
      # Hi
            
      <img src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, { outputFormat: "program" });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.h1, {
            children: "Hi"
          }), "\\n", _jsx("img", {
            src: "image.png",
            alt: ""
          })]
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
  it("without plugin, markdown header, html raw element and jsx element", async () => {
    const source = dedent`
      # Hi
            
      <img src="image.png" alt="" />

      <Image src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, { outputFormat: "program" });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          ...props.components
        }, {Image} = _components;
        if (!Image) _missingMdxReference("Image", true);
        return _jsxs(_Fragment, {
          children: [_jsx(_components.h1, {
            children: "Hi"
          }), "\\n", _jsx("img", {
            src: "image.png",
            alt: ""
          }), "\\n", _jsx(Image, {
            src: "image.png",
            alt: ""
          })]
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
      function _missingMdxReference(id, component) {
        throw new Error("Expected " + (component ? "component" : "object") + " \`" + id + "\` to be defined: you likely forgot to import, pass, or provide it.");
      }
      "
    `);
  });
});

describe("recma-mdx-html-override, output is program, with plugin", () => {
  // ******************************************
  it("with plugin, it should be effectless without option", async () => {
    const source = dedent`
      <img src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [recmaMdxHtmlOverride],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {jsx as _jsx} from "react/jsx-runtime";
      function _createMdxContent(props) {
        return _jsx("img", {
          src: "image.png",
          alt: ""
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
  it("with plugin, only one html raw element", async () => {
    const source = dedent`
      <img src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxHtmlOverride, { tags: "img" }]],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {jsx as _jsx} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          ...props.components
        };
        return _jsx(_components.img, {
          src: "image.png",
          alt: ""
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
  it("with plugin, not only html raw element but also markdown header", async () => {
    const source = dedent`
      # Hi
            
      <img src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxHtmlOverride, { tags: "img" }]],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          img: "img",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.h1, {
            children: "Hi"
          }), "\\n", _jsx(_components.img, {
            src: "image.png",
            alt: ""
          })]
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
  it("with plugin, markdown header, html raw element and jsx element", async () => {
    const source = dedent`
      # Hi
            
      <img src="image.png" alt="" />

      <Image src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxHtmlOverride, { tags: "img" }]],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          h1: "h1",
          img: "img",
          ...props.components
        }, {Image} = _components;
        if (!Image) _missingMdxReference("Image", true);
        return _jsxs(_Fragment, {
          children: [_jsx(_components.h1, {
            children: "Hi"
          }), "\\n", _jsx(_components.img, {
            src: "image.png",
            alt: ""
          }), "\\n", _jsx(Image, {
            src: "image.png",
            alt: ""
          })]
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
      function _missingMdxReference(id, component) {
        throw new Error("Expected " + (component ? "component" : "object") + " \`" + id + "\` to be defined: you likely forgot to import, pass, or provide it.");
      }
      "
    `);
  });

  // ******************************************
  it("with plugin, the same element in markdown and html raw element", async () => {
    const source = dedent`
      ![](image.png)
            
      <img src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxHtmlOverride, { tags: "img" }]],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png",
              alt: ""
            })
          }), "\\n", _jsx(_components.img, {
            src: "image.png",
            alt: ""
          })]
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
  it("with plugin, there is no matched element in the source", async () => {
    const source = dedent`
      ![](image.png)
            
      <img src="image.png" alt="" />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxHtmlOverride, { tags: ["video"] } as HtmlOverrideOptions]],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png",
              alt: ""
            })
          }), "\\n", _jsx("img", {
            src: "image.png",
            alt: ""
          })]
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
  it("with plugin, there is matched element in the source", async () => {
    const source = dedent`
      ![](image.png)
            
      <video src="video.mp4" controls />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxHtmlOverride, { tags: ["video"] } as HtmlOverrideOptions]],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          video: "video",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png",
              alt: ""
            })
          }), "\\n", _jsx(_components.video, {
            src: "video.mp4",
            controls: true
          })]
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
  it("with plugin, makes unknown html raw element overridable", async () => {
    const source = "<x />";

    /**
     * React treats lowercase tags as custom web components or native HTML elements.
     * If <x /> is not defined as a MDX component, it will appear in the DOM as <x></x>
     * If not provided in mdx components it won’t have any functionality, otherwise will be appropriately mapped.
     */

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxHtmlOverride, { tags: "x" } as HtmlOverrideOptions]],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {jsx as _jsx} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          x: "x",
          ...props.components
        };
        return _jsx(_components.x, {});
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
  it("with plugin, makes an known/unknown html raw elements overridable while missing video tag in content is effectless", async () => {
    const source = dedent`
      ![](image.png)

      <div data-special />

      <p data-custom />
      
      <section />

      <x />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [
        [
          recmaMdxHtmlOverride,
          {
            tags: ["video", "div", "p", "section", "x"],
          } as HtmlOverrideOptions,
        ],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          div: "div",
          section: "section",
          x: "x",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png",
              alt: ""
            })
          }), "\\n", _jsx(_components.div, {
            "data-special": true
          }), "\\n", _jsx(_components.p, {
            "data-custom": true
          }), "\\n", _jsx(_components.section, {}), "\\n", _jsx(_components.x, {})]
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
  it("with plugin, effectless since a deep nested element is just a reference ", async () => {
    const source = dedent`
      ![](image.png)

      <very.deep.nested />            
    `;

    /**
     * the plugin looks for "Literals", not "Identifiers";
     * <very.deep.nested /> is compiled as "Reference to an Identifier" so plugin in this case is affectless.
     */

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [[recmaMdxHtmlOverride, { tags: "very" } as HtmlOverrideOptions]],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        }, {very} = _components;
        if (!very) _missingMdxReference("very", false);
        if (!very.deep) _missingMdxReference("very.deep", false);
        if (!very.deep.nested) _missingMdxReference("very.deep.nested", true);
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png",
              alt: ""
            })
          }), "\\n", _jsx(very.deep.nested, {})]
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
      function _missingMdxReference(id, component) {
        throw new Error("Expected " + (component ? "component" : "object") + " \`" + id + "\` to be defined: you likely forgot to import, pass, or provide it.");
      }
      "
    `);
  });

  // ******************************************
  it("with plugin, works with a not valid js identifier since it is compiled as literal", async () => {
    const source = dedent`    
      ![](image.png)

      <not-valid-js-identifier-but-valid-jsx />
    `;

    const compiledSource = await compile(source, {
      outputFormat: "program",
      recmaPlugins: [
        [
          recmaMdxHtmlOverride,
          { tags: "not-valid-js-identifier-but-valid-jsx" } as HtmlOverrideOptions,
        ],
      ],
    });

    expect(String(compiledSource)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          "not-valid-js-identifier-but-valid-jsx": "not-valid-js-identifier-but-valid-jsx",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "image.png",
              alt: ""
            })
          }), "\\n", _jsx(_components["not-valid-js-identifier-but-valid-jsx"], {})]
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
