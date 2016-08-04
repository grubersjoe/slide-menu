'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: make this library agnostic

(function ($) {

    var PLUGIN_NAME = 'slideMenu';
    var DEFAULT_OPTIONS = {
        submenuIndicator: ''
    };

    var SlideMenu = function () {
        function SlideMenu(options) {
            _classCallCheck(this, SlideMenu);

            this.options = options;
            this.menu = options.elem;
            this.anchors = this.menu.find('a');
            this.slider = this.menu.find('.slider:first');

            this._isOpen = false;
            this._isAnimating = false;

            this._setupEventHandlers();
            this._setupSubmenus();
        }

        /**
         * Toggle the menu
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
                    offset = this.menu.width();
                    this._isOpen = false;
                }

                this._triggerAnimation(this.menu, offset);
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

                this.anchors.click(function (event) {
                    _this._navigate($(event.target));
                });

                $(this.menu.add(this.slider)).on('transitionend msTransitionEnd', function () {
                    _this._isAnimating = false;
                });
            }

            /**
             * Navigate the menu - that is slide it one step left or right
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

                level = Number(this.menu.data('level')) || 0;
                offset = (level + dir) * -this.menu.width();

                if (dir > 0) {
                    if (!anchor.next('ul').length) return;

                    anchor.next('ul').addClass('active').show();
                } else {
                    if (level === 0) return;

                    lastActiveUl = 'ul ' + '.active '.repeat(level);
                    this.menu.find(lastActiveUl).removeClass('active').fadeOut();
                }

                this.menu.data('level', level + dir);
                this._triggerAnimation(this.slider, offset);
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

                if (this.options.submenuIndicator) {
                    this.anchors.each(function (i, anchor) {
                        anchor = $(anchor);
                        if (anchor.next('ul').length) {
                            anchor.html(anchor.text() + ' ' + _this2.options.submenuIndicator);
                            anchor.click(function (ev) {
                                ev.preventDefault();
                            });
                        }
                    });
                }
            }
        }]);

        return SlideMenu;
    }();

    // Link control buttons with 'API'


    $('body').on('click', '.slide-menu-control', function () {
        var menu = $('#' + $(this).data('target'));

        if (!menu.length) return;

        var instance = menu.data(PLUGIN_NAME);
        var action = $(this).data('action');

        if (typeof instance[action] === 'function') {
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
