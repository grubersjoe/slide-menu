// TODO: make this library agnostic
// TODO: document the events

import './styles/slide-menu.scss';
import './styles/demo.scss';

(function ($) {
  const PLUGIN_NAME = 'slideMenu';
  const DEFAULT_OPTIONS = {
    position: 'right',
    showBackLink: true,
    keycodeOpen: null,
    keycodeClose: 27, // esc
    submenuLinkBefore: '',
    submenuLinkAfter: '',
    backLinkBefore: '',
    backLinkAfter: '',
  };

  class SlideMenu {
    constructor(options) {
      this.options = options;

      this.menu = options.elem;

      // Add wrapper
      this.menu.find('ul:first').wrap('<div class="slider">');

      this.anchors = this.menu.find('a');
      this.slider = this.menu.find('.slider:first');

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
    toggle(open = null, animate = true) {
      let offset;

      if (open === null) {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
        return;
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
    open(animate = true) {
      this.lastAction = 'open';
      this.toggle(true, animate);
    }

    /**
     * Close the menu
     * @param {boolean} animate Use CSS transitions
     */
    close(animate = true) {
      this.lastAction = 'close';
      this.toggle(false, animate);
    }

    /**
     * Navigate one menu hierarchy back if possible
     */
    back() {
      this.lastAction = 'back';
      this.navigate(null, -1);
    }

    /**
     * Navigate to a specific link on any level (useful to open the correct hierarchy directly)
     * @param {string|object} target A string selector a plain DOM object or a jQuery instance
     */
    navigateTo(target) {
      target = this.menu.find($(target)).first();

      if (!target.length) {
        return false;
      }

      const parents = target.parents('ul');
      const level = parents.length - 1;

      if (level === 0) {
        return false;
      }

      this.pauseAnimations(() => {
        this.level = level;
        parents.show().first().addClass('active');
        this.triggerAnimation(this.slider, -this.level * 100);
      });
    }

    /**
     * Set up all event handlers
     * @private
     */
    setupEventHandlers() {
      if (this.hasMenu) {
        this.anchors.click((event) => {
          const anchor = $(event.target).is('a') ? $(event.target) : $(event.target).parents('a:first');
          this.navigate(anchor);
        });
      }

      $(this.menu.add(this.slider)).on('transitionend msTransitionEnd', () => {
        this.isAnimating = false;
        this.triggerEvent(true);
      });

      $(document).keydown((e) => {
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
        const lastActiveUl = `ul ${'.active '.repeat(this.level + 1)}`;
        this.menu.find(lastActiveUl).removeClass('active').hide();
      });
    }

    /**
     * Trigger a custom event to support callbacks
     * @param {boolean} afterAnimation Mark this event as `before` or `after` callback
     * @private
     */
    triggerEvent(afterAnimation = false) {
      let eventName = `sm.${this.lastAction}`;
      if (afterAnimation) eventName += '-after';
      this.menu.trigger(eventName);
    }

    /**
     * Navigate the menu - that is slide it one step left or right
     * @param {jQuery} anchor The clicked anchor or button element
     * @param {int} dir Navigation direction: 1 = forward, 0 = backwards
     * @private
     */
    navigate(anchor, dir = 1) {
      // Abort if an animation is still running
      if (this.isAnimating) {
        return;
      }

      const offset = (this.level + dir) * -100;

      if (dir > 0) {
        if (!anchor.next('ul').length) {
          return;
        }

        anchor.next('ul').addClass('active').show();
      } else if (this.level === 0) {
        return;
      }

      this.lastAction = dir > 0 ? 'forward' : 'back';
      this.level = this.level + dir;

      this.triggerAnimation(this.slider, offset);
    }

    /**
     * Start the animation (the CSS transition)
     * @param elem
     * @param offset
     * @private
     */
    triggerAnimation(elem, offset) {
      this.triggerEvent();

      if (!String(offset).includes('%')) {
        offset += '%';
      }

      elem.css('transform', `translateX(${offset})`);
      this.isAnimating = true;
    }

    /**
     * Initialize the menu
     * @private
     */
    setupMenu() {
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
     * @param work
     * @private
     */
    pauseAnimations(work) {
      this.menu.addClass('no-transition');
      work();
      this.menu[0].offsetHeight; // trigger a reflow, flushing the CSS changes
      this.menu.removeClass('no-transition');
    }

    /**
     * Enhance the markup of menu items which contain a submenu
     * @private
     */
    setupSubmenus() {
      this.anchors.each((i, anchor) => {
        anchor = $(anchor);
        if (anchor.next('ul').length) {
          // prevent default behaviour (use link just to navigate)
          anchor.click((ev) => {
            ev.preventDefault();
          });

          // add `before` and `after` text
          const anchorTitle = anchor.text();
          anchor.html(this.options.submenuLinkBefore + anchorTitle + this.options.submenuLinkAfter);

          // add a back button
          if (this.options.showBackLink) {
            const backLink = $(`<a class="slide-menu-control" data-action="back">${anchorTitle}</a>`);
            backLink.html(this.options.backLinkBefore + backLink.text() + this.options.backLinkAfter);
            anchor.next('ul').prepend($('<li>').append(backLink));
          }
        }
      });
    }
  }

  // Link control buttons with the API
  $('body').on('click', '.slide-menu-control', function (e) {
    let menu;
    const target = $(this).data('target');

    if (!target || target === 'this') {
      menu = $(this).parents('.slide-menu:first');
    } else {
      menu = $(`#${target}`);
    }

    if (!menu.length) return;

    const instance = menu.data(PLUGIN_NAME);
    const action = $(this).data('action');

    if (instance && typeof instance[action] === 'function') {
      instance[action]();
    }
  });

  // Register the jQuery plugin
  $.fn[PLUGIN_NAME] = function (options) {
    if (!$(this).length) {
      console.warn('Slide Menu: Unable to find menu DOM element. Maybe a typo?');
      return;
    }

    options = $.extend({}, DEFAULT_OPTIONS, options);
    options.elem = $(this);

    const instance = new SlideMenu(options);
    $(this).data(PLUGIN_NAME, instance);

    return instance;
  };
}(jQuery));
