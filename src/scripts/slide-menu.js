// TODO: make this library agnostic

(function ($) {

    const PLUGIN_NAME = 'slideMenu';
    const DEFAULT_OPTIONS = {
        position: 'right',
        showBackLink: true,
        submenuLinkBefore: '',
        submenuLinkAfter: '',
        backLinkBefore: '',
        backLinkAfter: '',
    };

    class SlideMenu {

        constructor(options) {
            this.options = options;

            this._menu = options.elem;

            this._menu.find('ul:first').wrap('<div class="slider">');

            this._anchors = this._menu.find('a');
            this._slider = this._menu.find('.slider:first');

            this._isOpen = false;
            this._isAnimating = false;
            this._hasMenu = this._anchors.length > 0;

            this._setupEventHandlers();
            this._setupMenu();

            if (this._hasMenu)
                this._setupSubmenus();
        }

        /**
         * Toggle the menu
         * @param {boolean|null} open
         */
        toggle(open = null) {
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
                offset = (this.options.position === 'left') ? -this._menu.outerWidth() : this._menu.outerWidth();
                this._isOpen = false;
            }

            this._triggerAnimation(this._menu, offset);
        }

        open() {
            this.toggle(true);
        }

        close() {
            this.toggle(false);
        }

        back() {
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
                if (this._menu.css('visibility') === 'hidden')
                    this._menu.css('visibility', 'visible');

                this._isAnimating = false;
            });
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

            let level, offset, lastActiveUl;

            level = Number(this._menu.data('level')) || 0;
            offset = (level + dir) * -this._menu.outerWidth();

            if (dir > 0) {
                if (!anchor.next('ul').length)
                    return;

                anchor.next('ul').addClass('active').show();
            } else {
                if (level === 0)
                    return;

                lastActiveUl = 'ul ' + '.active '.repeat(level);
                this._menu.find(lastActiveUl).removeClass('active').fadeOut();
            }

            this._menu.data('level', level + dir);
            this._triggerAnimation(this._slider, offset);
        }

        /**
         * Start the animation (the CSS transition)
         * @param elem
         * @param offset
         * @private
         */
        _triggerAnimation(elem, offset) {
            elem.css('transform', 'translateX(' + offset + 'px)');
            this._isAnimating = true;
        }

        /**
         *
         * @private
         */
        _setupMenu() {
            switch (this.options.position) {
                case 'left':
                    this._menu.css({
                        left: 0,
                        right: 'auto',
                        transform: 'translateX(' + (-this._menu.outerWidth()) + 'px)'
                    });
                    break;
                default:
                    this._menu.css({
                        left: 'auto',
                        right: 0
                    });
                    break;
            }

        }

        /**
         * Adds an indicator to links in the menus, which have a submenu
         * @private
         */
        _setupSubmenus() {
            this._anchors.each((i, anchor) => {
                anchor = $(anchor);
                if (anchor.next('ul').length) {
                    let anchorTitle = anchor.text();
                    anchor.html(this.options.submenuLinkBefore + anchorTitle + this.options.submenuLinkAfter);

                    // prevent default behaviour (use link just to navigate)
                    anchor.click(function (ev) {
                        ev.preventDefault();
                    });

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
    $('body').unbind().on('click', '.slide-menu-control', function () {
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
        options = $.extend({}, DEFAULT_OPTIONS, options);
        options.elem = $(this);

        let instance = new SlideMenu(options);
        $(this).data(PLUGIN_NAME, instance);

        return instance;
    };

}(jQuery));
