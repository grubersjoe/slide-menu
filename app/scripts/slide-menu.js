// TODO: make this library agnostic

(function ($) {

    const PLUGIN_NAME = 'slideMenu';
    const DEFAULT_OPTIONS = {
        submenuIndicator: ''
    };

    class SlideMenu {

        constructor(options) {
            this.options = options;
            this.menu    = options.elem;
            this.anchors = this.menu.find('a');
            this.slider  = this.menu.find('.slider:first');

            this._isOpen = false;

            this._setupEventHandlers();
            this._addSubmenuIndicator();
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
                offset = this.menu.width();
                this._isOpen = false;
            }

            this.menu.css('transform', 'translateX(' + offset + 'px)');
        }

        /**
         * Open the menu
         */
        open() {
            this.toggle(true);
        }

        /**
         * Close the menu
         */
        close() {
            this.toggle(false);
        }

        /**
         * Navigate one step backward in menu hierarchy if possible
         */
        back() {
            this._navigate(null, -1);
        }

        /**
         * Set up all event handlers
         * @private
         */
        _setupEventHandlers() {
            this.anchors.click((event) => {
                this._navigate($(event.target));
            });
        }

        /**
         * Navigate the menu - that is slide it one step left or right
         * @param {jQuery} anchor The clicked anchor or button element
         * @param {int} dir
         * @private
         */
        _navigate(anchor, dir = 1) {
            let level, offset, lastActiveUl;

            level = Number(this.menu.data('level')) || 0;
            offset = (level + dir) * -this.menu.width();

            if (dir > 0) {
                if (!anchor.next('ul').length)
                    return;

                anchor.next('ul').addClass('active').show();
            } else {
                if (level === 0)
                    return;

                lastActiveUl = 'ul ' + '.active '.repeat(level);
                this.menu.find(lastActiveUl).removeClass('active').fadeOut();
            }

            this.menu.data('level', level + dir);
            this.slider.css('transform', 'translateX(' + offset + 'px)');
        }

        /**
         * Adds an indicator to links in the menus, which have a submenu
         * @private
         */
        _addSubmenuIndicator() {
            if (this.options.submenuIndicator) {
                this.anchors.each((i, anchor) => {
                    anchor = $(anchor);
                    if (anchor.next('ul').length) {
                        anchor.text(anchor.text() + ' ' + this.options.submenuIndicator);
                    }
                });
            }
        }
    }

    // Link control buttons with 'API'
    $('body').on('click', '.slide-menu-control', function () {
        let menu = $('#' + $(this).data('target'));

        if (!menu.length) return;

        let instance = menu.data(PLUGIN_NAME);
        let action = $(this).data('action');

        if (typeof instance[action] === 'function') {
            instance[action]();
        }
    });

    // Register the jQuery plugin
    $.fn[PLUGIN_NAME] = function (options) {
        options = $.extend(DEFAULT_OPTIONS, options);
        options.elem = $(this);

        let instance = new SlideMenu(options);
        $(this).data(PLUGIN_NAME, instance);

        return instance;
    };

}(jQuery));