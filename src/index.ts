import type { Plugin } from "unified";
import type { FunctionDeclaration, Node, Program, Property, VariableDeclarator } from "estree";
import type { JSXIdentifier, JSXOpeningElement } from "estree-jsx";
import { CONTINUE, EXIT, SKIP, visit } from "estree-util-visit";

export type HtmlOverrideOptions = {
  tags?: string | string[];
};

const DEFAULT_SETTINGS: HtmlOverrideOptions = {
  tags: undefined,
};

/**
 *
 * It is a recma plugin which makes selected html raw elements overridable.
 *
 */
const plugin: Plugin<[HtmlOverrideOptions?], Program> = (options = {}) => {
  const settings = Object.assign(
    {},
    DEFAULT_SETTINGS,
    options,
  ) as Required<HtmlOverrideOptions>;

  const componentMap: Record<string, string> = {};
  let functionNode: FunctionDeclaration | undefined;
  let functionPropsName: string = "props";
  let targetVariableDeclarator: VariableDeclarator;

  function containsHyphen(name: string): boolean {
    return name.includes("-");
  }

  return (tree: Node) => {
    // console.dir(tree, { depth: 16 });
    if (!settings.tags) return;

    // finds the function _createMdxContent(){}
    visit(tree, (node, _, index) => {
      if (index === undefined) return;

      if (node.type !== "FunctionDeclaration") return SKIP;

      if (node.id.name === "_createMdxContent") {
        functionNode = node;

        const param = node.params[0];
        if (param.type === "Identifier") {
          functionPropsName = param.name;
        }

        return EXIT;
      }

      /* istanbul ignore next */
      return CONTINUE;
    });

    /* istanbul ignore next */
    if (!functionNode) return;

    // trace call expressions to change _jsx("xxx", {}) to _jsx(_components.xxx, {})
    visit(functionNode, (node) => {
      if (node.type !== "CallExpression") return CONTINUE;

      if ("name" in node.callee) {
        if (
          node.callee.name !== "_jsx" &&
          node.callee.name !== "_jsxDEV" &&
          node.callee.name !== "_jsxs"
        ) {
          return;
        }
      }

      // First child of a CallExpression is a Literal or Identifier to a reference
      const firstArgument = node.arguments[0];

      if (
        firstArgument.type === "Literal" &&
        typeof firstArgument.value === "string" &&
        ((typeof settings.tags === "string" && firstArgument.value === settings.tags) ||
          settings.tags.includes(firstArgument.value))
      ) {
        node.arguments[0] = {
          type: "MemberExpression",
          object: { type: "Identifier", name: "_components" },
          property: containsHyphen(firstArgument.value)
            ? { type: "Literal", value: firstArgument.value }
            : { type: "Identifier", name: firstArgument.value },
          computed: containsHyphen(firstArgument.value),
          optional: false,
        };

        if (!componentMap[firstArgument.value]) {
          componentMap[firstArgument.value] = firstArgument.value;
        }
      }

      return CONTINUE;
    });

    // trace jsx elements to change <xxx /> to <__components.xxx />
    visit(functionNode, (node) => {
      if (node.type !== "JSXElement") return CONTINUE;

      // First child of a CallExpression is a Literal or Identifier to a reference
      const openingElement: JSXOpeningElement = node.openingElement;

      if (openingElement.name.type === "JSXIdentifier") {
        const jsxIdentifier: JSXIdentifier = openingElement.name;

        if (
          (typeof settings.tags === "string" && jsxIdentifier.name === settings.tags) ||
          settings.tags.includes(jsxIdentifier.name)
        ) {
          node.openingElement.name = {
            type: "JSXMemberExpression",
            object: { type: "JSXIdentifier", name: "_components" },
            property: { type: "JSXIdentifier", name: jsxIdentifier.name },
            // A proposal in https://github.com/facebook/jsx/issues/163
            // property: containsHyphen(jsxIdentifier.name)
            //   ? { type: "Literal", value: jsxIdentifier.name, computed: true }
            //   : { type: "JSXIdentifier", name: jsxIdentifier.name },
          };

          if (!componentMap[jsxIdentifier.name]) {
            componentMap[jsxIdentifier.name] = jsxIdentifier.name;
          }
        }
      }

      return CONTINUE;
    });

    if (!Object.keys(componentMap).length) return;

    // find "const _components = {}" variable declarator; and add the components inside, if not exist.
    visit(functionNode, (node) => {
      if (node.type !== "VariableDeclarator") return CONTINUE;

      if (node.id.type === "Identifier" && node.id.name === "_components") {
        targetVariableDeclarator = node;

        if (node.init?.type === "ObjectExpression") {
          const properties = node.init.properties;

          const existingComponentMap: Record<string, string> = {};

          for (const property of properties) {
            if (property.type === "Property") {
              if (
                property.key.type === "Identifier" &&
                property.value.type === "Literal" &&
                typeof property.value.value === "string"
              ) {
                existingComponentMap[property.key.name] = property.value.value;
              }
            }
          }

          const diffComponentMap = Object.entries(componentMap).filter(
            ([key]) => !existingComponentMap[key],
          );

          if (diffComponentMap.length) {
            node.init.properties.splice(
              node.init.properties.length - 1,
              0,
              ...diffComponentMap.map(
                ([key, value]) =>
                  ({
                    type: "Property",
                    kind: "init",
                    key: containsHyphen(key)
                      ? { type: "Literal", value: key }
                      : { type: "Identifier", name: key },
                    value: { type: "Literal", value },
                    method: false,
                    shorthand: false,
                    computed: false,
                  }) as Property,
              ),
            );
          }
        }
      }

      return CONTINUE;
    });

    if (targetVariableDeclarator) return;

    // There is no "_components" declarator; so we will add VariableDeclaration ourself
    functionNode.body.body.unshift({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "_components" },
          init: {
            type: "ObjectExpression",
            properties: [
              ...Object.entries(componentMap).map(
                ([key, value]) =>
                  ({
                    type: "Property",
                    kind: "init",
                    key: containsHyphen(key)
                      ? { type: "Literal", value: key }
                      : { type: "Identifier", name: key },
                    value: { type: "Literal", value },
                    method: false,
                    shorthand: false,
                    computed: false,
                  }) as Property,
              ),
              {
                type: "SpreadElement",
                argument: {
                  type: "MemberExpression",
                  object: { type: "Identifier", name: functionPropsName },
                  property: { type: "Identifier", name: "components" },
                  computed: false,
                  optional: false,
                },
              },
            ],
          },
        },
      ],
    });
  };
};

export default plugin;
