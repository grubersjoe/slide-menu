// TODO: document the events

import './styles/slide-menu.scss';

import { parents, parentsOne, wrapElement } from './Utils';

declare let window: IWindow;

interface IWindow extends Window {
  SlideMenu: typeof SlideMenu;
}

interface ISlideMenuElement extends HTMLElement {
  _slideMenu: SlideMenu;
}

interface IMenuOptions {
  position: string;
  showBackLink: boolean;
  keyOpen: string;
  keyClose: string;
  submenuLinkBefore: string;
  submenuLinkAfter: string;
  backLinkBefore: string;
  backLinkAfter: string;
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
  Foward = 'forward',
  Navigate = 'navigate',
  Open = 'open',
}

const DEFAULT_OPTIONS = {
  backLinkAfter: '',
  backLinkBefore: '',
  keyClose: undefined,
  keyOpen: undefined,
  position: 'right',
  showBackLink: true,
  submenuLinkAfter: '',
  submenuLinkBefore: '',
};

class SlideMenu {
  public static readonly NAMESPACE = 'slide-menu';
  public static readonly CLASS_NAMES = {
    active: `${SlideMenu.NAMESPACE}__submenu--active`,
    control: `${SlideMenu.NAMESPACE}__control`,
    slider: `${SlideMenu.NAMESPACE}__slider`,
  };

  private level: number;
  private isOpen: boolean;
  private isAnimating: boolean;
  private lastAction: Action | null;

  private readonly options: IMenuOptions;

  private readonly menu: ISlideMenuElement;
  private readonly slider: HTMLElement;

  constructor(elem: HTMLElement, options: IMenuOptions) {
    if (elem === null) {
      throw new Error('Argument `elem` must be a valid HTML node');
    }

    // (Create a new object for every instance)
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this.menu = elem as ISlideMenuElement;

    // Add wrapper
    this.slider = document.createElement('div');
    this.slider.classList.add(SlideMenu.CLASS_NAMES.slider);

    const firstUl = this.menu.querySelector('ul');
    if (firstUl) {
      wrapElement(firstUl, this.slider);
    }

    this.level = 0;
    this.isOpen = false;
    this.isAnimating = false;
    this.lastAction = null;

    this.initMenu();
    this.initSubmenus();
    this.initEventHandlers();

    // Save this instance in menu DOM node
    this.menu._slideMenu = this;
  }

  /**
   * Toggle the menu
   * @param {boolean|null} show
   * @param {boolean} animate
   */
  public toggle(show: boolean, animate: boolean = true): void {
    let offset;

    if (show === undefined) {
      return this.isOpen ? this.close(animate) : this.open(animate);
    } else if (show) {
      offset = 0;
    } else {
      offset = (this.options.position === MenuPosition.Left) ? '-100%' : '100%';
    }

    this.isOpen = show;

    if (animate) {
      this.slideElem(this.menu, offset);
    } else {
      const action = this.slideElem.bind(this, this.menu, offset);
      this.runWithoutAnimation(action);
    }
  }

  /**
   * Open the menu
   * @param {boolean} animate Use CSS transitions
   */
  public open(animate: boolean = true): void {
    this.triggerEvent(Action.Open);
    this.toggle(true, animate);
  }

  /**
   * Close the menu
   * @param {boolean} animate Use CSS transitions
   */
  public close(animate: boolean = true): void {
    this.triggerEvent(Action.Close);
    this.toggle(false, animate);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Navigate one menu hierarchy back if possible
   */
  public back(): void {
    // Event is triggered in navigate()
    this.navigate(Direction.Backward);
  }

  /**
   * Navigate to a specific link on any level (useful to open the correct hierarchy directly)
   * @param {string | HTMLElement} target
   */
  public navigateTo(target: string | HTMLElement): void {
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
    this.slider
      .querySelectorAll(`.${SlideMenu.CLASS_NAMES.active}`)
      .forEach((activeElem: HTMLElement) => {
        activeElem.style.display = 'none';
        activeElem.classList.remove(SlideMenu.CLASS_NAMES.active);
      });

    const parentUl = parents(target, 'ul');
    const level = parentUl.length - 1;

    // Trigger the animation only if currently on different level
    if (level > -1 && level !== this.level) {
      this.level = level;
      this.slideElem(this.slider, -this.level * 100);
    }

    parentUl.forEach((ul: HTMLUListElement) => {
      ul.style.display = 'block';
      ul.classList.add(SlideMenu.CLASS_NAMES.active);
    });
  }

  /**
   * Set up all event handlers
   */
  private initEventHandlers(): void {
    // Ordinary navigation inside the menu
    this.menu
      .querySelectorAll('a')
      .forEach((a) => a.addEventListener('click', (event) => {

        const target = event.target as HTMLElement;
        const targetAnchor = target.matches('a')
          ? target
          : parentsOne(target, 'a');

        if (targetAnchor) {
          this.navigate(Direction.Forward, targetAnchor);
        }
      }));

    // Handler for end of CSS transition
    this.menu.addEventListener('transitionend', this.onTransitionEnd.bind(this));

    this.initKeybindings();
    this.initSubmenuVisibility();
  }

  private onTransitionEnd() {
    this.isAnimating = false;

    if (this.lastAction) {
      this.triggerEvent(this.lastAction, true);
    }
  }

  private initKeybindings(): void {
    document.addEventListener('keydown', (event) => {
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

  private initSubmenuVisibility() {
    // Hide the lastly shown menu when navigating back (important for navigateTo)
    this.menu.addEventListener('sm.back-after', () => {
      const lastActiveSelector = `.${SlideMenu.CLASS_NAMES.active} `.repeat(this.level + 1);
      const lastActiveUl = this.menu.querySelector(`ul ${lastActiveSelector}`) as HTMLUListElement;

      if (lastActiveUl) {
        lastActiveUl.style.display = 'none';
        lastActiveUl.classList.remove(SlideMenu.CLASS_NAMES.active);
      }
    });
  }

  /**
   * Trigger a custom event to support callbacks
   * @param action
   * @param {boolean} afterAnimation Mark this event as `before` or `after` callback
   */
  private triggerEvent(action: Action, afterAnimation: boolean = false): void {
    this.lastAction = action;
    const name = `sm.${action}${afterAnimation ? '-after' : ''}`;
    const event = new Event(name);
    this.menu.dispatchEvent(event);
  }

  /**
   * Navigate the menu - that is slide it one step left or right
   * @param {Direction} dir Navigation direction: Direction.Forward or Direction.Backward
   * @param {HTMLElement} anchor The clicked anchor or button element
   */
  private navigate(dir: Direction = Direction.Forward, anchor?: HTMLElement) {
    if (this.isAnimating || (dir === Direction.Backward && this.level === 0)) {
      return;
    }

    const offset = (this.level + dir) * -100;

    if (anchor && dir === Direction.Forward) {
      const ul = (anchor.parentNode as HTMLElement).querySelector('ul');

      if (!ul) {
        return;
      }

      ul.classList.add(SlideMenu.CLASS_NAMES.active);
      ul.style.display = 'block';
    }

    const action = dir === Direction.Forward ? Action.Foward : Action.Back;
    this.triggerEvent(action);

    this.level = this.level + dir;
    this.slideElem(this.slider, offset);
  }

  /**
   * Start the slide animation (the CSS transition)
   * @param elem
   * @param offset
   */
  private slideElem(elem: HTMLElement, offset: string | number): void {
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
          Object.assign(this.menu.style, {
            left: 0,
            right: 'auto',
            transform: 'translateX(-100%)',
          });
          break;
        default:
          Object.assign(this.menu.style, {
            left: 'auto',
            right: 0,
          });
          break;
      }

      this.menu.style.display = 'block';
    });
  }

  /**
   * Pause the CSS transitions, to apply CSS changes directly without an animation
   * @param action
   */
  private runWithoutAnimation(action: () => void): void {
    const transitionElems = [this.menu, this.slider];
    transitionElems.forEach((elem) => elem.style.transition = 'none');

    action();

    // noinspection TsLint
    this.menu.offsetHeight; // Trigger a reflow, flushing the CSS changes
    transitionElems.forEach((elem) => elem.style.removeProperty('transition'));

    this.isAnimating = false;
  }

  /**
   * Enhance the markup of menu items which contain a submenu
   */
  private initSubmenus(): void {
    this.menu
      .querySelectorAll('a')
      .forEach((anchor) => {
        const submenu = (anchor.parentNode as HTMLElement).querySelector('ul');
        if (submenu) {
          // Prevent default behaviour (use link just to navigate)
          anchor.addEventListener('click', (event) => {
            event.preventDefault();
          });

          // Add `before` and `after` text
          const { submenuLinkBefore, submenuLinkAfter } = this.options;
          const anchorInnerHtml = anchor.textContent;
          anchor.innerHTML = submenuLinkBefore + anchorInnerHtml + submenuLinkAfter;

          if (this.options.showBackLink) {
            const { backLinkBefore, backLinkAfter } = this.options;

            const backLink = document.createElement('a');
            backLink.innerHTML = backLinkBefore + anchorInnerHtml + backLinkAfter;
            backLink.classList.add(SlideMenu.CLASS_NAMES.control);
            backLink.setAttribute('data-action', Action.Back);

            const backLinkLi = document.createElement('li');
            backLinkLi.appendChild(backLink);

            submenu.insertBefore(backLinkLi, submenu.firstChild);
          }
        }
      });
  }
}

// Link control buttons with the API
document.addEventListener('click', (event) => {
  const control = event.target as HTMLElement;

  if (!control.className.includes(`${SlideMenu.CLASS_NAMES.control}`)) {
    return;
  }

  const target = control.getAttribute('data-target');
  const menu = (!target || target === 'this')
    ? parentsOne(control, `.${SlideMenu.NAMESPACE}`)
    : document.getElementById(target); // assumes #id

  if (!menu) {
    throw new Error(`Unable to find menu ${target}`);
  }

  const instance = (menu as ISlideMenuElement)._slideMenu;
  const action = control.getAttribute('data-action');
  const arg = control.getAttribute('data-arg');

  if (instance && action && typeof instance[action] === 'function') {
    arg ? instance[action](arg) : instance[action]();
  }
});

// Expose SlideMenu to global namespace
window.SlideMenu = SlideMenu;
