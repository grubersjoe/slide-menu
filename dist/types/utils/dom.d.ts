export declare function wrapElement(elem: HTMLElement, wrapper: HTMLElement): HTMLElement;
export declare function unwrapElement(elem: HTMLElement): void;
export declare function parents(elem: Node | null, selector: string, limit?: number): HTMLElement[];
export declare function parentsOne(elem: Node, selector: string): HTMLElement | null;
