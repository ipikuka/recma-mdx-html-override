import type { Plugin } from "unified";
import type {
  FunctionDeclaration,
  Node,
  Program,
  Property,
  VariableDeclaration,
  VariableDeclarator,
} from "estree";
import type { JSXOpeningElement } from "estree-jsx";
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
  const extraMap: Record<string, string> = {};
  let hypenIndex = 0;
  let functionPropsName = "props";
  let functionNode: FunctionDeclaration | undefined;
  let targetVariableDeclarator: VariableDeclarator;
  let targetVariableDeclaration: VariableDeclaration;

  return (tree: Node) => {
    // console.dir(tree, { depth: 16 });
    if (!settings.tags) return;

    function containsHyphen(name: string): boolean {
      return name.includes("-");
    }

    // find the function _createMdxContent(){}
    visit(tree, (node, _, index) => {
      if (index === undefined) return;

      if (node.type !== "FunctionDeclaration") return SKIP;

      /* istanbul ignore if */
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

    // visit call expressions to change _jsx("xxx", {}) to _jsx(_components.xxx, {})
    visit(functionNode, (node) => {
      if (node.type !== "CallExpression") return CONTINUE;

      if (
        "name" in node.callee &&
        node.callee.name !== "_jsx" &&
        node.callee.name !== "_jsxDEV" &&
        node.callee.name !== "_jsxs"
      ) {
        return;
      }

      const firstArgument = node.arguments[0];

      // focus "Literals" in the first parameter of jsx/jsxs
      if (firstArgument.type === "Literal" && typeof firstArgument.value === "string") {
        const currentTag = firstArgument.value;

        if (
          (typeof settings.tags === "string" && currentTag === settings.tags) ||
          settings.tags.includes(currentTag)
        ) {
          node.arguments[0] = {
            type: "MemberExpression",
            object: { type: "Identifier", name: "_components" },
            property: containsHyphen(currentTag)
              ? { type: "Literal", value: currentTag }
              : { type: "Identifier", name: currentTag },
            computed: containsHyphen(currentTag),
            optional: false,
          };

          if (!componentMap[currentTag]) {
            componentMap[currentTag] = currentTag;
          }
        }
      }

      return CONTINUE;
    });

    // visit JSX elements to change <xxx /> to <__components.xxx />
    visit(functionNode, (node) => {
      if (node.type !== "JSXElement") return CONTINUE;

      const openingElement: JSXOpeningElement = node.openingElement;

      if (openingElement.name.type === "JSXIdentifier") {
        const currentTag = openingElement.name.name;

        if (
          (typeof settings.tags === "string" && currentTag === settings.tags) ||
          settings.tags.includes(currentTag)
        ) {
          if (containsHyphen(currentTag)) {
            const newNameMappedToCurrentTag = `_mdxcomponent${hypenIndex}`;
            hypenIndex++;

            if (!extraMap[currentTag]) {
              extraMap[currentTag] = newNameMappedToCurrentTag;
            }

            node.openingElement.name = {
              type: "JSXIdentifier",
              name: extraMap[currentTag],
            };
          } else {
            node.openingElement.name = {
              type: "JSXMemberExpression",
              object: { type: "JSXIdentifier", name: "_components" },
              property: { type: "JSXIdentifier", name: currentTag },
              // A proposal in https://github.com/facebook/jsx/issues/163
              // property: containsHyphen(currentTag)
              //   ? { type: "Literal", value: currentTag, computed: true }
              //   : { type: "JSXIdentifier", name: currentTag },
            };
          }

          if (!componentMap[currentTag]) {
            componentMap[currentTag] = currentTag;
          }
        }
      }

      return CONTINUE;
    });

    if (!Object.keys(componentMap).length) return;

    // find "const _components = {}" variable declarator; and add the components inside, if not exist.
    visit(functionNode, (node, _, __, parents) => {
      if (node.type !== "VariableDeclarator") return CONTINUE;

      if (node.id.type === "Identifier" && node.id.name === "_components") {
        targetVariableDeclarator = node;
        targetVariableDeclaration = parents[parents.length - 1] as VariableDeclaration;

        /* istanbul ignore next */
        if (node.init?.type === "ObjectExpression") {
          const properties = node.init.properties;

          const existingComponentMap: Record<string, string> = {};

          for (const property of properties) {
            if (
              property.type === "Property" &&
              property.key.type === "Identifier" &&
              property.value.type === "Literal" &&
              typeof property.value.value === "string"
            ) {
              existingComponentMap[property.key.name] = property.value.value;
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

          if (Object.entries(extraMap).length) {
            targetVariableDeclaration.declarations.push(
              ...Object.entries(extraMap).map(
                ([key, value]) =>
                  ({
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: value },
                    init: {
                      type: "MemberExpression",
                      object: { type: "Identifier", name: "_components" },
                      property: { type: "Literal", value: key },
                      computed: true,
                      optional: false,
                    },
                  }) as VariableDeclarator,
              ),
            );
          }
        }
      }

      return CONTINUE;
    });

    if (targetVariableDeclarator) return;

    // there is no "_components" declarator; so we will add VariableDeclaration ourself
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
        ...Object.entries(extraMap).map(
          ([key, value]) =>
            ({
              type: "VariableDeclarator",
              id: { type: "Identifier", name: value },
              init: {
                type: "MemberExpression",
                object: { type: "Identifier", name: "_components" },
                property: { type: "Literal", value: key },
                computed: true,
                optional: false,
              },
            }) as VariableDeclarator,
        ),
      ],
    });
  };
};

export default plugin;
