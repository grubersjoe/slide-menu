import '../styles/slide-menu.scss';

import { parents, parentsOne, unwrapElement, wrapElement } from './utils/dom';

interface MenuHTMLElement extends HTMLElement {
  _slideMenu: SlideMenu;
}

interface SlideMenuOptions {
  backLinkBefore: string;
  backLinkAfter: string;
  keyOpen: string;
  keyClose: string;
  position: MenuPosition;
  showBackLink: boolean;
  submenuLinkBefore: string;
  submenuLinkAfter: string;
}

enum Direction {
  Backward = -1,
  Forward = 1,
}

enum MenuPosition {
  Left = 'left',
  Right = 'right',
}

enum Action {
  Back = 'back',
  Close = 'close',
  Forward = 'forward',
  Navigate = 'navigate',
  Open = 'open',
}

const DEFAULT_OPTIONS = {
  backLinkAfter: '',
  backLinkBefore: '',
  keyClose: '',
  keyOpen: '',
  position: 'right',
  showBackLink: true,
  submenuLinkAfter: '',
  submenuLinkBefore: '',
};

class SlideMenu {
  public static readonly NAMESPACE = 'slide-menu';
  public static readonly CLASS_NAMES = {
    active: `${SlideMenu.NAMESPACE}__submenu--active`,
    backlink: `${SlideMenu.NAMESPACE}__backlink`,
    control: `${SlideMenu.NAMESPACE}__control`,
    decorator: `${SlideMenu.NAMESPACE}__decorator`,
    wrapper: `${SlideMenu.NAMESPACE}__slider`,
  };

  private level: number = 0;
  private isOpen: boolean = false;
  private isAnimating: boolean = false;
  private lastAction: Action | null = null;

  private readonly options: typeof DEFAULT_OPTIONS;

  private readonly menuElem: MenuHTMLElement;
  private readonly wrapperElem: HTMLElement;

  public constructor(elem: HTMLElement, options?: Partial<SlideMenuOptions>) {
    if (elem === null) {
      throw new Error('Argument `elem` must be a valid HTML node');
    }

    // (Create a new object for every instance)
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.menuElem = elem as MenuHTMLElement;

    // Add wrapper (for the slide effect)
    this.wrapperElem = document.createElement('div');
    this.wrapperElem.classList.add(SlideMenu.CLASS_NAMES.wrapper);

    const firstUl = this.menuElem.querySelector('ul');
    if (firstUl) {
      wrapElement(firstUl, this.wrapperElem);
    }

    this.initMenu();
    this.initSubmenus();
    this.initEventHandlers();

    // Save this instance in menu DOM node
    this.menuElem._slideMenu = this;
  }

  /**
   * Toggle the menu
   */
  public toggle(show?: boolean, animate: boolean = true): void {
    let offset;

    if (show === undefined) {
      return this.isOpen ? this.close(animate) : this.open(animate);
    } else if (show) {
      offset = 0;
    } else {
      offset = this.options.position === MenuPosition.Left ? '-100%' : '100%';
    }

    this.isOpen = show;

    if (animate) {
      this.moveSlider(this.menuElem, offset);
    } else {
      const action = this.moveSlider.bind(this, this.menuElem, offset);
      this.runWithoutAnimation(action);
    }
  }

  /**
   * Open the menu
   */
  public open(animate: boolean = true): void {
    this.triggerEvent(Action.Open);
    this.toggle(true, animate);
  }

  /**
   * Close the menu
   */
  public close(animate: boolean = true): void {
    this.triggerEvent(Action.Close);
    this.toggle(false, animate);
  }

  /**
   * Navigate one menu hierarchy back if possible
   */
  public back(): void {
    // Event is triggered in navigate()
    this.navigate(Direction.Backward);
  }

  /**
   * Destroy the SlideMenu
   */
  public destroy(): void {
    const { submenuLinkAfter, submenuLinkBefore, showBackLink } = this.options;

    // Remove link decorators
    if (submenuLinkAfter || submenuLinkBefore) {
      const linkDecorators = Array.from(
        this.wrapperElem.querySelectorAll(`.${SlideMenu.CLASS_NAMES.decorator}`),
      ) as HTMLElement[];

      linkDecorators.forEach((decorator: HTMLElement) => {
        if (decorator.parentElement) {
          decorator.parentElement.removeChild(decorator);
        }
      });
    }

    // Remove back links
    if (showBackLink) {
      const backLinks = Array.from(
        this.wrapperElem.querySelectorAll(`.${SlideMenu.CLASS_NAMES.control}`),
      ) as HTMLElement[];

      backLinks.forEach((backlink: HTMLElement) => {
        const parentLi = parentsOne(backlink, 'li');

        if (parentLi && parentLi.parentElement) {
          parentLi.parentElement.removeChild(parentLi);
        }
      });
    }

    // Remove the wrapper element
    unwrapElement(this.wrapperElem);

    // Remove inline styles
    this.menuElem.style.cssText = '';
    this.menuElem.querySelectorAll('ul').forEach((ul: HTMLElement) => (ul.style.cssText = ''));

    // Delete the reference to *this* instance
    // NOTE: Garbage collection is not possible, as long as other references to this object exist
    delete this.menuElem._slideMenu;
  }

  /**
   * Navigate to a specific link on any level (useful to open the correct hierarchy directly)
   */
  public navigateTo(target: HTMLElement | string): void {
    this.triggerEvent(Action.Navigate);

    if (typeof target === 'string') {
      const elem = document.querySelector(target);
      if (elem instanceof HTMLElement) {
        target = elem;
      } else {
        throw new Error('Invalid parameter `target`. A valid query selector is required.');
      }
    }

    // Hide other active menus
    const activeMenus = Array.from(
      this.wrapperElem.querySelectorAll(`.${SlideMenu.CLASS_NAMES.active}`),
    ) as HTMLElement[];

    activeMenus.forEach(activeElem => {
      activeElem.style.display = 'none';
      activeElem.classList.remove(SlideMenu.CLASS_NAMES.active);
    });

    const parentUl = parents(target, 'ul');
    const level = parentUl.length - 1;

    // Trigger the animation only if currently on different level
    if (level >= 0 && level !== this.level) {
      this.level = level;
      this.moveSlider(this.wrapperElem, -this.level * 100);
    }

    parentUl.forEach((ul: HTMLElement) => {
      ul.style.display = 'block';
      ul.classList.add(SlideMenu.CLASS_NAMES.active);
    });
  }

  /**
   * Set up all event handlers
   */
  private initEventHandlers(): void {
    // Ordinary links inside the menu
    const anchors = Array.from(this.menuElem.querySelectorAll('a'));

    anchors.forEach((anchor: HTMLAnchorElement) =>
      anchor.addEventListener('click', event => {
        const target = event.target as HTMLElement;
        const targetAnchor = target.matches('a') ? target : parentsOne(target, 'a');

        if (targetAnchor) {
          this.navigate(Direction.Forward, targetAnchor);
        }
      }),
    );

    // Handler for end of CSS transition
    this.menuElem.addEventListener('transitionend', this.onTransitionEnd.bind(this));
    this.wrapperElem.addEventListener('transitionend', this.onTransitionEnd.bind(this));

    this.initKeybindings();
    this.initSubmenuVisibility();
  }

  private onTransitionEnd(event: Event): void {
    // Ensure the transitionEnd event was fired by the correct element
    // (elements inside the menu might use CSS transitions as well)
    if (event.target !== this.menuElem && event.target !== this.wrapperElem) {
      return;
    }

    this.isAnimating = false;

    if (this.lastAction) {
      this.triggerEvent(this.lastAction, true);
    }
  }

  private initKeybindings(): void {
    document.addEventListener('keydown', event => {
      switch (event.key) {
        case this.options.keyClose:
          this.close();
          break;
        case this.options.keyOpen:
          this.open();
          break;
        default:
          return;
      }

      event.preventDefault();
    });
  }

  private initSubmenuVisibility(): void {
    // Hide the lastly shown menu when navigating back (important for navigateTo)
    this.menuElem.addEventListener('sm.back-after', () => {
      const lastActiveSelector = `.${SlideMenu.CLASS_NAMES.active} `.repeat(this.level + 1);
      const lastActiveUl = this.menuElem.querySelector(
        `ul ${lastActiveSelector}`,
      ) as HTMLUListElement;

      if (lastActiveUl) {
        lastActiveUl.style.display = 'none';
        lastActiveUl.classList.remove(SlideMenu.CLASS_NAMES.active);
      }
    });
  }

  /**
   * Trigger a custom event to support callbacks
   */
  private triggerEvent(action: Action, afterAnimation: boolean = false): void {
    this.lastAction = action;

    const name = `sm.${action}${afterAnimation ? '-after' : ''}`;
    const event = new CustomEvent(name);

    this.menuElem.dispatchEvent(event);
  }

  /**
   * Navigate the menu - that is slide it one step left or right
   */
  private navigate(dir: Direction = Direction.Forward, anchor?: HTMLElement): void {
    if (this.isAnimating || (dir === Direction.Backward && this.level === 0)) {
      return;
    }

    const offset = (this.level + dir) * -100;

    if (anchor && anchor.parentElement !== null && dir === Direction.Forward) {
      const ul = anchor.parentElement.querySelector('ul');

      if (!ul) {
        return;
      }

      ul.classList.add(SlideMenu.CLASS_NAMES.active);
      ul.style.display = 'block';
    }

    const action = dir === Direction.Forward ? Action.Forward : Action.Back;
    this.triggerEvent(action);

    this.level = this.level + dir;
    this.moveSlider(this.wrapperElem, offset);
  }

  /**
   * Start the slide animation (the CSS transition)
   */
  private moveSlider(elem: HTMLElement, offset: string | number): void {
    // Add percentage sign
    if (!offset.toString().includes('%')) {
      offset += '%';
    }

    elem.style.transform = `translateX(${offset})`;
    this.isAnimating = true;
  }

  /**
   * Initialize the menu
   */
  private initMenu(): void {
    this.runWithoutAnimation(() => {
      switch (this.options.position) {
        case MenuPosition.Left:
          Object.assign(this.menuElem.style, {
            left: 0,
            right: 'auto',
            transform: 'translateX(-100%)',
          });
          break;
        default:
          Object.assign(this.menuElem.style, {
            left: 'auto',
            right: 0,
          });
          break;
      }

      this.menuElem.style.display = 'block';
    });
  }

  /**
   * Pause the CSS transitions, to apply CSS changes directly without an animation
   */
  private runWithoutAnimation(action: () => void): void {
    const transitionElems = [this.menuElem, this.wrapperElem];
    transitionElems.forEach(elem => (elem.style.transition = 'none'));

    action();

    // noinspection TsLint
    this.menuElem.offsetHeight; // Trigger a reflow, flushing the CSS changes
    transitionElems.forEach(elem => elem.style.removeProperty('transition'));

    this.isAnimating = false;
  }

  /**
   * Enhance the markup of menu items which contain a submenu
   */
  private initSubmenus(): void {
    this.menuElem.querySelectorAll('a').forEach((anchor: HTMLAnchorElement) => {
      if (anchor.parentElement === null) {
        return;
      }

      const submenu = anchor.parentElement.querySelector('ul');

      if (!submenu) {
        return;
      }

      // Prevent default behaviour (use link just to navigate)
      anchor.addEventListener('click', event => {
        event.preventDefault();
      });

      const anchorText = anchor.textContent;
      this.addLinkDecorators(anchor);

      // Add back links
      if (this.options.showBackLink) {
        const { backLinkBefore, backLinkAfter } = this.options;

        const backLink = document.createElement('a');
        backLink.innerHTML = backLinkBefore + anchorText + backLinkAfter;
        backLink.classList.add(SlideMenu.CLASS_NAMES.backlink, SlideMenu.CLASS_NAMES.control);
        backLink.setAttribute('data-action', Action.Back);

        const backLinkLi = document.createElement('li');
        backLinkLi.appendChild(backLink);

        submenu.insertBefore(backLinkLi, submenu.firstChild);
      }
    });
  }

  // Add `before` and `after` text
  private addLinkDecorators(anchor: HTMLAnchorElement): HTMLAnchorElement {
    const { submenuLinkBefore, submenuLinkAfter } = this.options;

    if (submenuLinkBefore) {
      const linkBeforeElem = document.createElement('span');
      linkBeforeElem.classList.add(SlideMenu.CLASS_NAMES.decorator);
      linkBeforeElem.innerHTML = submenuLinkBefore;

      anchor.insertBefore(linkBeforeElem, anchor.firstChild);
    }

    if (submenuLinkAfter) {
      const linkAfterElem = document.createElement('span');
      linkAfterElem.classList.add(SlideMenu.CLASS_NAMES.decorator);
      linkAfterElem.innerHTML = submenuLinkAfter;

      anchor.appendChild(linkAfterElem);
    }

    return anchor;
  }
}

// Link control buttons with the API
document.addEventListener('click', event => {
  const control = event.target as HTMLElement;

  if (!control.className.includes(`${SlideMenu.CLASS_NAMES.control}`)) {
    return;
  }

  const target = control.getAttribute('data-target');
  const menu =
    !target || target === 'this'
      ? parentsOne(control, `.${SlideMenu.NAMESPACE}`)
      : document.getElementById(target); // assumes #id

  if (!menu) {
    throw new Error(`Unable to find menu ${target}`);
  }

  const instance = (menu as MenuHTMLElement)._slideMenu;
  const method = control.getAttribute('data-action');
  const arg = control.getAttribute('data-arg');

  // @ts-ignore
  if (instance && method && typeof instance[method] === 'function') {
    // @ts-ignore
    arg ? instance[method](arg) : instance[method]();
  }
});

// Expose SlideMenu to the global namespace
// @ts-ignore
window.SlideMenu = SlideMenu;
