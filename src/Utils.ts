export function wrapElement(elem: HTMLElement, wrapper: HTMLElement): HTMLElement {
  if (elem.parentNode === null) {
    throw Error('`elem` has no parentNode');
  }

  elem.parentNode.insertBefore(wrapper, elem);
  wrapper.appendChild(elem);

  return elem;
}

export function parents(elem: Node, selector: string, limit?: number): HTMLElement[] {
  const matched = [];

  while (elem.parentNode !== null && (limit !== undefined && matched.length < limit)) {
    if (elem instanceof HTMLElement && elem.matches(selector)) {
      matched.push(elem);
    }
    elem = elem.parentNode;
  }

  return matched;
}

export function parentsOne(elem: Node, selector: string): HTMLElement | null {
  const matches = parents(elem, selector, 1);

  return matches.length ? matches[0] : null;
}
