// TODO: make this library agnostic
// TODO: document the events

import './styles/slide-menu.scss';

interface IOptions {
  elem: JQuery;
  position: string;
  showBackLink: boolean;
  keycodeOpen: number | null;
  keycodeClose: number | null;
  submenuLinkBefore: string;
  submenuLinkAfter: string;
  backLinkBefore: string;
  backLinkAfter: string;
}

enum Directions {
  Backward = -1,
  Forward = 1,
}

enum Actions {
  Back = 'back',
  Close = 'close',
  Foward = 'forward',
  Open = 'open',
}

const PLUGIN_NAME = 'slideMenu';
const DEFAULT_OPTIONS = {
  backLinkAfter: '',
  backLinkBefore: '',
  keycodeClose: undefined,
  keycodeOpen: undefined,
  position: 'right',
  showBackLink: true,
  submenuLinkAfter: '',
  submenuLinkBefore: '',
};
const CLASS_ACTIVE = 'slide-menu__submenu--active';
const CLASS_SLIDER = 'slide-menu__slider';

(($) => {
  class SlideMenu {
    private options: IOptions;
    private anchors: JQuery;
    private level: number;
    private isOpen: boolean;
    private isAnimating: boolean;
    private lastAction: Actions | null;
    private readonly menu: JQuery<HTMLElement>;
    private readonly slider: JQuery;
    private readonly hasMenu: boolean;

    constructor(options: IOptions) {
      this.options = options;

      this.menu = options.elem;

      // Add wrapper
      this.menu.find('ul:first').wrap(`<div class="${CLASS_SLIDER}">`);

      this.anchors = this.menu.find('a');
      this.slider = this.menu.find(`.${CLASS_SLIDER}:first`);

      this.level = 0;
      this.isOpen = false;
      this.isAnimating = false;
      this.hasMenu = this.anchors.length > 0;
      this.lastAction = null;

      this.setupEventHandlers();
      this.setupMenu();

      if (this.hasMenu) {
        this.setupSubmenus();
      }
    }

    /**
     * Toggle the menu
     * @param {boolean|null} open
     * @param {boolean} animate
     */
    public toggle(open?: boolean, animate = true): void {
      let offset;

      if (open === undefined) {
        return this.isOpen ? this.close() : this.open();
      } else if (open) {
        offset = 0;
        this.isOpen = true;
      } else {
        offset = (this.options.position === 'left') ? '-100%' : '100%';
        this.isOpen = false;
      }

      this.triggerEvent();

      if (animate) {
        this.triggerAnimation(this.menu, offset);
      } else {
        this.pauseAnimations(this.triggerAnimation.bind(this, this.menu, offset));
        this.isAnimating = false;
      }
    }

    /**
     * Open the menu
     * @param {boolean} animate Use CSS transitions
     */
    public open(animate: boolean = true): void {
      this.lastAction = Actions.Open;
      this.toggle(true, animate);
    }

    /**
     * Close the menu
     * @param {boolean} animate Use CSS transitions
     */
    public close(animate: boolean = true): void {
      this.lastAction = Actions.Close;
      this.toggle(false, animate);
    }

    /**
     * Navigate one menu hierarchy back if possible
     */
    public back(): void {
      this.lastAction = Actions.Back;
      this.navigate(undefined, Directions.Backward);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Navigate to a specific link on any level (useful to open the correct hierarchy directly)
     * @param {string|JQuery} target A string selector a plain DOM object or a jQuery instance
     */
    public navigateTo(target: string|JQuery): void {
      const $elem = typeof target === 'string' ? $(target) : target;
      const $target = this.menu.find($elem).first();

      if (!$target.length) {
        return;
      }

      // Hide other menu branches
      this.slider.find(`.${CLASS_ACTIVE}`).hide().removeClass(CLASS_ACTIVE);

      const parents = $target.parents('ul');
      const level = parents.length - 1;

      // Trigger the animation only if levels are different
      if (level > 0 && level !== this.level) {
        this.level = level;
        this.triggerAnimation(this.slider, -this.level * 100);
      }

      parents.show().addClass(CLASS_ACTIVE);
    }

    /**
     * Set up all event handlers
     * @private
     */
    private setupEventHandlers(): void {
      if (this.hasMenu) {
        this.anchors.on('click', (event) => {
          const anchor = $(event.target).is('a')
            ? $(event.target)
            : $(event.target).parents('a:first');
          this.navigate(anchor);
        });
      }

      $(this.menu.add(this.slider)).on('transitionend msTransitionEnd', () => {
        this.isAnimating = false;
        this.triggerEvent(true);
      });

      $(document).on('keydown', (e) => {
        switch (e.which) {
          case this.options.keycodeClose:
            this.close();
            break;

          case this.options.keycodeOpen:
            this.open();
            break;

          default:
            return;
        }
        e.preventDefault();
      });

      this.menu.on('sm.back-after', () => {
        const lastActiveSelector = `.${CLASS_ACTIVE} `.repeat(this.level + 1);
        const lastActiveUl = `ul ${lastActiveSelector}`;
        this.menu.find(lastActiveUl).removeClass(CLASS_ACTIVE).hide();
      });
    }

    /**
     * Trigger a custom event to support callbacks
     * @param {boolean} afterAnimation Mark this event as `before` or `after` callback
     * @private
     */
    private triggerEvent(afterAnimation: boolean = false): void {
      if (this.lastAction) {
        let eventName = `sm.${this.lastAction}`;
        if (afterAnimation) {
          eventName += '-after';
        }
        this.menu.trigger(eventName);
      }
    }

    /**
     * Navigate the menu - that is slide it one step left or right
     * @param {jQuery} anchor The clicked anchor or button element
     * @param {Directions} dir Navigation direction: Directions.Forward or Directions.Backward
     * @private
     */
    private navigate(anchor?: JQuery, dir: Directions = Directions.Forward) {
      // Abort if an animation is still running
      if (this.isAnimating) {
        return;
      }

      const offset = (this.level + dir) * -100;

      if (anchor && dir === Directions.Forward) {
        if (!anchor.next('ul').length) {
          return;
        }

        anchor.next('ul').addClass(CLASS_ACTIVE).show();
      } else if (this.level === 0) {
        return;
      }

      this.lastAction = dir === Directions.Forward ? Actions.Foward : Actions.Back;
      this.level = this.level + dir;
      this.triggerAnimation(this.slider, offset);
    }

    /**
     * Start the animation (the CSS transition)
     * @param elem
     * @param offset
     * @private
     */
    private triggerAnimation(elem: JQuery, offset: string | number): void {
      this.triggerEvent();

      // Add percentage sign
      if (!offset.toString().includes('%')) {
        offset += '%';
      }

      elem.css('transform', `translateX(${offset})`);
      this.isAnimating = true;
    }

    /**
     * Initialize the menu
     * @private
     */
    private setupMenu(): void {
      this.pauseAnimations(() => {
        switch (this.options.position) {
          case 'left':
            this.menu.css({
              left: 0,
              right: 'auto',
              transform: 'translateX(-100%)',
            });
            break;
          default:
            this.menu.css({
              left: 'auto',
              right: 0,
            });
            break;
        }
        this.menu.show();
      });
    }

    /**
     * Pause the CSS transitions, to apply CSS changes directly without an animation
     * @param callback
     * @private
     */
    private pauseAnimations(callback: () => void): void {
      this.menu.addClass('no-transition');
      callback();
      // noinspection TsLint
      this.menu[0].offsetHeight; // trigger a reflow, flushing the CSS changes
      this.menu.removeClass('no-transition');
    }

    /**
     * Enhance the markup of menu items which contain a submenu
     * @private
     */
    private setupSubmenus(): void {
      this.anchors.each((i, anchor) => {
        const $anchor = $(anchor);
        if ($anchor.next('ul').length) {
          // prevent default behaviour (use link just to navigate)
          $anchor.on('click', (ev) => {
            ev.preventDefault();
          });

          // Add `before` and `after` text
          const anchorTitle = $anchor.text();
          $anchor.html(this.options.submenuLinkBefore + anchorTitle + this.options.submenuLinkAfter);

          // Add a back button
          if (this.options.showBackLink) {
            const backLink = $(`<a class="slide-menu-control" data-action="back">${anchorTitle}</a>`);
            backLink.html(this.options.backLinkBefore + backLink.text() + this.options.backLinkAfter);
            $anchor.next('ul').prepend($('<li>').append(backLink));
          }
        }
      });
    }
  }

  // Link control buttons with the API
  $('body').on('click', '.slide-menu-control', function() {
    let menu;
    const target = $(this).data('target');

    if (!target || target === 'this') {
      menu = $(this).parents('.slide-menu:first');
    } else {
      menu = $(`#${target}`);
    }

    if (!menu.length) {
      return;
    }

    const instance = menu.data(PLUGIN_NAME);
    const action = $(this).data('action');
    const arg = $(this).data('arg');

    if (instance instanceof SlideMenu && typeof instance[action] === 'function') {
      arg ? instance[action](arg) : instance[action]();
    }
  });

  // Register the jQuery plugin
  $.fn[PLUGIN_NAME] = function register(options: IOptions) {
    if (!$(this).length) {
      // noinspection TsLint
      console.warn('Slide Menu: Unable to find menu DOM element. Maybe a typo?');
      return;
    }

    options = $.extend({}, DEFAULT_OPTIONS, options);
    options.elem = $(this);

    const instance = new SlideMenu(options);
    $(this).data(PLUGIN_NAME, instance);

    return instance;
  };
})(jQuery);
