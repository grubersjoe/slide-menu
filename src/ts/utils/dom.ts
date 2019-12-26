export function wrapElement(elem: HTMLElement, wrapper: HTMLElement): HTMLElement {
  if (elem.parentElement === null) {
    throw Error('`elem` has no parentElement');
  }

  elem.parentElement.insertBefore(wrapper, elem);
  wrapper.appendChild(elem);

  return elem;
}

export function unwrapElement(elem: HTMLElement): void {
  const parent = elem.parentElement;

  if (parent === null) {
    throw Error('`elem` has no parentElement');
  }

  while (elem.firstChild) {
    parent.insertBefore(elem.firstChild, elem);
  }
  parent.removeChild(elem);
}

export function parents(elem: Node | null, selector: string, limit?: number): HTMLElement[] {
  const matched: HTMLElement[] = [];

  while (
    elem &&
    elem.parentElement !== null &&
    (limit === undefined ? true : matched.length < limit)
  ) {
    if (elem instanceof HTMLElement && elem.matches(selector)) {
      matched.push(elem);
    }

    elem = elem.parentElement;
  }

  return matched;
}

export function parentsOne(elem: Node, selector: string): HTMLElement | null {
  const matches = parents(elem, selector, 1);

  return matches.length ? matches[0] : null;
}
