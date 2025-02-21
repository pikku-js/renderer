import { Attributes } from "./constants";
import type { AttributeHole } from "./holes/AttributeHole";
import { EventHole } from "./holes/attributes/EventHole";
import { StringHole } from "./holes/attributes/StringHole";
import { makeMarkerComment } from "./utils";

export type AttributeDefinition = {
  index: number;
  name: string;
  value: string;
  direct: boolean;
  type: Attributes;
};

export const detectAttributes = (
  strings: string,
  index: number,
): AttributeDefinition | undefined => {
  const regex = /(\S+)(?==(?:["']?)$)/;
  const match = strings.match(regex);

  if (match) {
    const result = {
      index: index,
      name: match[1],
      value: makeMarkerComment(index),
      direct: false,
      type: Attributes.STD,
    };

    switch (match[1][0]) {
      case "@":
        result.type = Attributes.EVENT;
        result.direct = true;
        return result;
      case ":":
        result.type = Attributes.PROP;
        result.direct = true;
        return result;
      default:
        return result;
    }
  }

  return undefined;
};

export const processAttribute = (
  fragment: DocumentFragment,
  definition: AttributeDefinition,
): AttributeHole | undefined => {
  const node = fragment.querySelector<HTMLElement>(
    selectorPattern(definition.name, definition.value, definition.direct),
  );

  if (node) {
    if (definition.direct) {
      node.removeAttribute(definition.name);
    }

    switch (definition.type) {
      case Attributes.EVENT:
        return new EventHole(node, definition);
      default:
        return new StringHole(node, definition);
    }
  }

  return undefined;
};

const selectorPattern = (
  name: string,
  value: string,
  isDirect: boolean,
): string => {
  if (isDirect) return `[\\${name}='${value}']`;
  return `[${name}='${value}']`;
};
