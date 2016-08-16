// TODO: make this library agnostic

(function ($) {

    const PLUGIN_NAME = 'slideMenu';
    const DEFAULT_OPTIONS = {
        position: 'right',
        showBackLink: true,
        keycodeOpen: null,
        keycodeClose: 27, //esc
        submenuLinkBefore: '',
        submenuLinkAfter: '',
        backLinkBefore: '',
        backLinkAfter: '',
        callbackOpen: null,
        callbackClose: null
    };

    class SlideMenu {

        constructor(options) {
            this.options = options;

            this._menu = options.elem;

            // Add wrapper
            this._menu.find('ul:first').wrap('<div class="slider">');

            this._anchors = this._menu.find('a');
            this._slider = this._menu.find('.slider:first');

            this._level = 0;
            this._isOpen = false;
            this._isAnimating = false;
            this._hasMenu = this._anchors.length > 0;
            this._lastAction = null;

            this._setupEventHandlers();
            this._setupMenu();

            if (this._hasMenu)
                this._setupSubmenus();
        }

        /**
         * Toggle the menu
         * @param {boolean|null} open
         * @param {boolean} animate
         */
        toggle(open = null, animate = true) {
            let offset;

            if (open === null) {
                if (this._isOpen) {
                    this.close();
                } else {
                    this.open();
                }
                return;
            } else if (open) {
                offset = 0;
                this._isOpen = true;
            } else {
                offset = (this.options.position === 'left') ? '-100%' : '100%';
                this._isOpen = false;
            }

            if (animate)
                this._triggerAnimation(this._menu, offset);
            else {
                this._pauseAnimations(this._triggerAnimation.bind(this, this._menu, offset));
                this._isAnimating = false;
            }
        }

        /**
         * Open the menu
         * @param {boolean} animate Use CSS transitions
         */
        open(animate = true) {
            this._lastAction = 'open';
            this.toggle(true, animate);
        }

        /**
         * Close the menu
         * @param {boolean} animate Use CSS transitions
         */
        close(animate = true) {
            this._lastAction = 'close';
            this.toggle(false, animate);
        }

        /**
         * Navigate one menu hierarchy back if possible
         */
        back() {
            this._lastAction = 'back';
            this._navigate(null, -1);
        }

        /**
         * Set up all event handlers
         * @private
         */
        _setupEventHandlers() {
            if (this._hasMenu) {
                this._anchors.click((event) => {
                    let anchor = $(event.target).is('a') ? $(event.target) : $(event.target).parents('a:first');
                    this._navigate(anchor);
                });
            }

            $(this._menu.add(this._slider)).on('transitionend msTransitionEnd', () => {
                this._isAnimating = false;
                this._handleCallbacks();
            });

            $(document).keydown((e) => {
                switch(e.which) {
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
        }

        _handleCallbacks() {
            let func = this.options['callback' + this._lastAction[0].toUpperCase() + this._lastAction.substr(1)];
            if (typeof func === 'function') {
                func();
            }

            if (this._lastAction === 'back') {
                let lastActiveUl = 'ul ' + '.active '.repeat(this._level);
                this._menu.find(lastActiveUl).removeClass('active').hide();
            }
        }

        /**
         * Navigate the _menu - that is slide it one step left or right
         * @param {jQuery} anchor The clicked anchor or button element
         * @param {int} dir
         * @private
         */
        _navigate(anchor, dir = 1) {
            // Abort if an animation is still running
            if (this._isAnimating) {
                return;
            }

            let offset, lastActiveUl;

            this._level = Number(this._menu.data('level')) || 0;
            offset = (this._level + dir) * -100;

            if (dir > 0) {
                if (!anchor.next('ul').length)
                    return;

                anchor.next('ul').addClass('active').show();
            } else if (this._level === 0) {
                return;
            }

            this._lastAction = dir > 0 ? 'forward' : 'back';
            this._menu.data('level', this._level + dir);

            this._triggerAnimation(this._slider, offset);
        }

        /**
         * Start the animation (the CSS transition)
         * @param elem
         * @param offset
         * @param useTransition
         * @private
         */
        _triggerAnimation(elem, offset) {
            if (!String(offset).includes('%'))
                offset += '%';

            elem.css('transform', 'translateX(' + offset + ')');
            this._isAnimating = true;
        }

        /**
         * Initialize the menu
         * @private
         */
        _setupMenu() {
            this._pauseAnimations(() => {
                switch (this.options.position) {
                    case 'left':
                        this._menu.css({
                            left: 0,
                            right: 'auto',
                            transform: 'translateX(-100%)'
                        });
                        break;
                    default:
                        this._menu.css({
                            left: 'auto',
                            right: 0
                        });
                        break;
                }
                this._menu.show();
            });
        }

        /**
         * Pause the CSS transitions, to apply CSS changes directly without an animation
         * @param work
         * @private
         */
        _pauseAnimations(work) {
            this._menu.addClass('no-transition');
            work();
            this._menu[0].offsetHeight; // trigger a reflow, flushing the CSS changes
            this._menu.removeClass('no-transition');
        }

        /**
         * Enhance the markup of menu items which contain a submenu
         * @private
         */
        _setupSubmenus() {
            this._anchors.each((i, anchor) => {
                anchor = $(anchor);
                if (anchor.next('ul').length) {
                    // prevent default behaviour (use link just to navigate)
                    anchor.click(function (ev) {
                        ev.preventDefault();
                    });

                    // add `before` and `after` text
                    let anchorTitle = anchor.text();
                    anchor.html(this.options.submenuLinkBefore + anchorTitle + this.options.submenuLinkAfter);

                    // add a back button
                    if (this.options.showBackLink) {
                        let backLink = $('<a href="#" class="slide-menu-control" data-action="back">' + anchorTitle + '</a>');
                        backLink.html(this.options.backLinkBefore + backLink.text() + this.options.backLinkAfter);
                        anchor.next('ul').prepend($('<li>').append(backLink));
                    }
                }
            });
        }
    }

    // Link control buttons with the API
    $('body').on('click', '.slide-menu-control', function () {
        let menu;
        let target = $(this).data('target');

        if (!target || target === 'this') {
            menu = $(this).parents('.slide-menu:first');
        } else {
            menu = $('#' + target)
        }

        if (!menu.length) return;

        let instance = menu.data(PLUGIN_NAME);
        let action = $(this).data('action');

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

        let instance = new SlideMenu(options);
        $(this).data(PLUGIN_NAME, instance);

        return instance;
    };

}(jQuery));
