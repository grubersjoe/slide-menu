'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: make this library agnostic

(function ($) {

    var PLUGIN_NAME = 'slideMenu';
    var DEFAULT_OPTIONS = {
        position: 'right',
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

            // Add wrapper
            this._menu.find('ul:first').wrap('<div class="slider">');

            this._anchors = this._menu.find('a');
            this._slider = this._menu.find('.slider:first');

            this._level = 0;
            this._isOpen = false;
            this._isAnimating = false;
            this._hasMenu = this._anchors.length > 0;

            this._setupEventHandlers();
            this._setupMenu();

            if (this._hasMenu) this._setupSubmenus();
        }

        /**
         * Toggle the menu
         * @param {boolean|null} open
         * @param {boolean} animate
         */


        _createClass(SlideMenu, [{
            key: 'toggle',
            value: function toggle() {
                var open = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
                var animate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

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
                    offset = this.options.position === 'left' ? '-100%' : '100%';
                    this._isOpen = false;
                }

                if (animate) this._triggerAnimation(this._menu, offset);else {
                    this._pauseAnimations(this._triggerAnimation.bind(this, this._menu, offset));
                    this._isAnimating = false;
                }
            }

            /**
             * Open the menu
             * @param {boolean} animate Use CSS transitions
             */

        }, {
            key: 'open',
            value: function open() {
                var animate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

                this.toggle(true, animate);
            }

            /**
             * Close the menu
             * @param {boolean} animate Use CSS transitions
             */

        }, {
            key: 'close',
            value: function close() {
                var animate = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

                this.toggle(false, animate);
            }

            /**
             * Navigate one menu hierarchy back if possible
             */

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

                if (this._hasMenu) {
                    this._anchors.click(function (event) {
                        var anchor = $(event.target).is('a') ? $(event.target) : $(event.target).parents('a:first');
                        _this._navigate(anchor);
                    });
                }

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

                var offset = void 0,
                    lastActiveUl = void 0;

                this._level = Number(this._menu.data('level')) || 0;
                offset = (this._level + dir) * -100;

                if (dir > 0) {
                    if (!anchor.next('ul').length) return;

                    anchor.next('ul').addClass('active').show();
                } else {
                    if (this._level === 0) return;

                    lastActiveUl = 'ul ' + '.active '.repeat(this._level);
                    this._menu.find(lastActiveUl).removeClass('active').fadeOut();
                }

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

        }, {
            key: '_triggerAnimation',
            value: function _triggerAnimation(elem, offset) {
                if (!String(offset).includes('%')) offset += '%';

                elem.css('transform', 'translateX(' + offset + ')');
                this._isAnimating = true;
            }

            /**
             * Initialize the menu
             * @private
             */

        }, {
            key: '_setupMenu',
            value: function _setupMenu() {
                var _this2 = this;

                this._pauseAnimations(function () {
                    switch (_this2.options.position) {
                        case 'left':
                            _this2._menu.css({
                                left: 0,
                                right: 'auto',
                                transform: 'translateX(-100%)'
                            });
                            break;
                        default:
                            _this2._menu.css({
                                left: 'auto',
                                right: 0
                            });
                            break;
                    }
                });
            }

            /**
             * Pause the CSS transitions, to apply CSS changes directly without an animation
             * @param work
             * @private
             */

        }, {
            key: '_pauseAnimations',
            value: function _pauseAnimations(work) {
                this._menu.addClass('no-transition');
                work();
                this._menu[0].offsetHeight; // trigger a reflow, flushing the CSS changes
                this._menu.removeClass('no-transition');
            }

            /**
             * Enhance the markup of menu items which contain a submenu
             * @private
             */

        }, {
            key: '_setupSubmenus',
            value: function _setupSubmenus() {
                var _this3 = this;

                this._anchors.each(function (i, anchor) {
                    anchor = $(anchor);
                    if (anchor.next('ul').length) {
                        // prevent default behaviour (use link just to navigate)
                        anchor.click(function (ev) {
                            ev.preventDefault();
                        });

                        // add `before` and `after` text
                        var anchorTitle = anchor.text();
                        anchor.html(_this3.options.submenuLinkBefore + anchorTitle + _this3.options.submenuLinkAfter);

                        // add a back button
                        if (_this3.options.showBackLink) {
                            var backLink = $('<a href="#" class="slide-menu-control" data-action="back">' + anchorTitle + '</a>');
                            backLink.html(_this3.options.backLinkBefore + backLink.text() + _this3.options.backLinkAfter);
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
        options = $.extend({}, DEFAULT_OPTIONS, options);
        options.elem = $(this);

        var instance = new SlideMenu(options);
        $(this).data(PLUGIN_NAME, instance);

        return instance;
    };
})(jQuery);
//# sourceMappingURL=slide-menu.js.map
