'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: make this library agnostic

(function ($) {

    var PLUGIN_NAME = 'slideMenu';
    var DEFAULT_OPTIONS = {
        showBackLink: true,
        submenuLinkBefore: '',
        submenuLinkAfter: '',
        backLinkBefore: '',
        backLinkAfter: ''
    };

    var SlideMenu = function () {
        function SlideMenu(options) {
            _classCallCheck(this, SlideMenu);

            this.options = options;

            this._menu = options.elem;

            this._menu.find('ul:first').wrap('<div class="slider">');

            this._anchors = this._menu.find('a');
            this._slider = this._menu.find('.slider:first');

            this._isOpen = false;
            this._isAnimating = false;

            this._setupSubmenus();
            this._setupEventHandlers();
        }

        /**
         * Toggle the _menu
         * @param {boolean|null} open
         */


        _createClass(SlideMenu, [{
            key: 'toggle',
            value: function toggle() {
                var open = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

                var offset = void 0;

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
                    offset = this._menu.width();
                    this._isOpen = false;
                }

                this._triggerAnimation(this._menu, offset);
            }
        }, {
            key: 'open',
            value: function open() {
                this.toggle(true);
            }
        }, {
            key: 'close',
            value: function close() {
                this.toggle(false);
            }
        }, {
            key: 'back',
            value: function back() {
                this._navigate(null, -1);
            }

            /**
             * Set up all event handlers
             * @private
             */

        }, {
            key: '_setupEventHandlers',
            value: function _setupEventHandlers() {
                var _this = this;

                this._anchors.click(function (event) {
                    var anchor = $(event.target).is('a') ? $(event.target) : $(event.target).parents('a:first');
                    _this._navigate(anchor);
                });

                $(this._menu.add(this._slider)).on('transitionend msTransitionEnd', function () {
                    _this._isAnimating = false;
                });
            }

            /**
             * Navigate the _menu - that is slide it one step left or right
             * @param {jQuery} anchor The clicked anchor or button element
             * @param {int} dir
             * @private
             */

        }, {
            key: '_navigate',
            value: function _navigate(anchor) {
                var dir = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

                // Abort if an animation is still running
                if (this._isAnimating) {
                    return;
                }

                var level = void 0,
                    offset = void 0,
                    lastActiveUl = void 0;

                level = Number(this._menu.data('level')) || 0;
                offset = (level + dir) * -this._menu.width();

                if (dir > 0) {
                    if (!anchor.next('ul').length) return;

                    anchor.next('ul').addClass('active').show();
                } else {
                    if (level === 0) return;

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

        }, {
            key: '_triggerAnimation',
            value: function _triggerAnimation(elem, offset) {
                elem.css('transform', 'translateX(' + offset + 'px)');
                this._isAnimating = true;
            }

            /**
             * Adds an indicator to links in the menus, which have a submenu
             * @private
             */

        }, {
            key: '_setupSubmenus',
            value: function _setupSubmenus() {
                var _this2 = this;

                this._anchors.each(function (i, anchor) {
                    anchor = $(anchor);
                    if (anchor.next('ul').length) {
                        var anchorTitle = anchor.text();
                        anchor.html(_this2.options.submenuLinkBefore + anchorTitle + _this2.options.submenuLinkAfter);

                        // prevent default behaviour (use link just to navigate)
                        anchor.click(function (ev) {
                            ev.preventDefault();
                        });

                        // add a back button
                        if (_this2.options.showBackLink) {
                            var backLink = $('<a href="#" class="slide-menu-control" data-action="back">' + anchorTitle + '</a>');
                            backLink.html(_this2.options.backLinkBefore + backLink.text() + _this2.options.backLinkAfter);
                            anchor.next('ul').prepend($('<li>').append(backLink));
                        }
                    }
                });
            }
        }]);

        return SlideMenu;
    }();

    // Link control buttons with the API


    $('body').unbind().on('click', '.slide-menu-control', function () {
        var menu = void 0;
        var target = $(this).data('target');

        if (!target || target === 'this') {
            menu = $(this).parents('.slide-menu:first');
        } else {
            menu = $('#' + target);
        }

        if (!menu.length) return;

        var instance = menu.data(PLUGIN_NAME);
        var action = $(this).data('action');

        if (instance && typeof instance[action] === 'function') {
            instance[action]();
        }
    });

    // Register the jQuery plugin
    $.fn[PLUGIN_NAME] = function (options) {
        options = $.extend(DEFAULT_OPTIONS, options);
        options.elem = $(this);

        var instance = new SlideMenu(options);
        $(this).data(PLUGIN_NAME, instance);

        return instance;
    };
})(jQuery);
//# sourceMappingURL=slide-menu.js.map
