import './SlideMenu.scss';
import './utils/polyfills';
interface Options {
    backLinkBefore: string;
    backLinkAfter: string;
    keyOpen: string;
    keyClose: string;
    position: MenuPosition;
    showBackLink: boolean;
    submenuLinkBefore: string;
    submenuLinkAfter: string;
}
declare type MenuPosition = 'left' | 'right';
declare class SlideMenu {
    static readonly NAMESPACE = "slide-menu";
    static readonly CLASS_NAMES: {
        active: string;
        backlink: string;
        control: string;
        decorator: string;
        wrapper: string;
    };
    private level;
    private isOpen;
    private isAnimating;
    private lastAction;
    private readonly options;
    private readonly menuElem;
    private readonly wrapperElem;
    constructor(elem: HTMLElement, options?: Partial<Options>);
    toggle(show?: boolean, animate?: boolean): void;
    open(animate?: boolean): void;
    close(animate?: boolean): void;
    back(): void;
    destroy(): void;
    navigateTo(target: HTMLElement | string): void;
    private initEventHandlers;
    private onTransitionEnd;
    private initKeybindings;
    private initSubmenuVisibility;
    private triggerEvent;
    private navigate;
    private moveSlider;
    private initMenu;
    private runWithoutAnimation;
    private initSubmenus;
    private addLinkDecorators;
}
export default SlideMenu;
