/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/slideMenu.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/slideMenu.js":
/*!**************************!*\
  !*** ./src/slideMenu.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // TODO: make this library agnostic\n// TODO: document the events\n\n__webpack_require__(/*! ./styles/slide-menu.scss */ \"./src/styles/slide-menu.scss\");\n\n__webpack_require__(/*! ./styles/demo.scss */ \"./src/styles/demo.scss\");\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n(function ($) {\n  var PLUGIN_NAME = 'slideMenu';\n  var DEFAULT_OPTIONS = {\n    position: 'right',\n    showBackLink: true,\n    keycodeOpen: null,\n    keycodeClose: 27, // esc\n    submenuLinkBefore: '',\n    submenuLinkAfter: '',\n    backLinkBefore: '',\n    backLinkAfter: ''\n  };\n\n  var SlideMenu = function () {\n    function SlideMenu(options) {\n      _classCallCheck(this, SlideMenu);\n\n      this.options = options;\n\n      this.menu = options.elem;\n\n      // Add wrapper\n      this.menu.find('ul:first').wrap('<div class=\"slider\">');\n\n      this.anchors = this.menu.find('a');\n      this.slider = this.menu.find('.slider:first');\n\n      this.level = 0;\n      this.isOpen = false;\n      this.isAnimating = false;\n      this.hasMenu = this.anchors.length > 0;\n      this.lastAction = null;\n\n      this.setupEventHandlers();\n      this.setupMenu();\n\n      if (this.hasMenu) {\n        this.setupSubmenus();\n      }\n    }\n\n    /**\n     * Toggle the menu\n     * @param {boolean|null} open\n     * @param {boolean} animate\n     */\n\n\n    _createClass(SlideMenu, [{\n      key: 'toggle',\n      value: function toggle() {\n        var open = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;\n        var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;\n\n        var offset = void 0;\n\n        if (open === null) {\n          if (this.isOpen) {\n            this.close();\n          } else {\n            this.open();\n          }\n          return;\n        } else if (open) {\n          offset = 0;\n          this.isOpen = true;\n        } else {\n          offset = this.options.position === 'left' ? '-100%' : '100%';\n          this.isOpen = false;\n        }\n\n        this.triggerEvent();\n\n        if (animate) {\n          this.triggerAnimation(this.menu, offset);\n        } else {\n          this.pauseAnimations(this.triggerAnimation.bind(this, this.menu, offset));\n          this.isAnimating = false;\n        }\n      }\n\n      /**\n       * Open the menu\n       * @param {boolean} animate Use CSS transitions\n       */\n\n    }, {\n      key: 'open',\n      value: function open() {\n        var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;\n\n        this.lastAction = 'open';\n        this.toggle(true, animate);\n      }\n\n      /**\n       * Close the menu\n       * @param {boolean} animate Use CSS transitions\n       */\n\n    }, {\n      key: 'close',\n      value: function close() {\n        var animate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;\n\n        this.lastAction = 'close';\n        this.toggle(false, animate);\n      }\n\n      /**\n       * Navigate one menu hierarchy back if possible\n       */\n\n    }, {\n      key: 'back',\n      value: function back() {\n        this.lastAction = 'back';\n        this.navigate(null, -1);\n      }\n\n      /**\n       * Navigate to a specific link on any level (useful to open the correct hierarchy directly)\n       * @param {string|object} target A string selector a plain DOM object or a jQuery instance\n       */\n\n    }, {\n      key: 'navigateTo',\n      value: function navigateTo(target) {\n        var _this = this;\n\n        target = this.menu.find($(target)).first();\n\n        if (!target.length) {\n          return false;\n        }\n\n        var parents = target.parents('ul');\n        var level = parents.length - 1;\n\n        if (level === 0) {\n          return false;\n        }\n\n        this.pauseAnimations(function () {\n          _this.level = level;\n          parents.show().first().addClass('active');\n          _this.triggerAnimation(_this.slider, -_this.level * 100);\n        });\n      }\n\n      /**\n       * Set up all event handlers\n       * @private\n       */\n\n    }, {\n      key: 'setupEventHandlers',\n      value: function setupEventHandlers() {\n        var _this2 = this;\n\n        if (this.hasMenu) {\n          this.anchors.click(function (event) {\n            var anchor = $(event.target).is('a') ? $(event.target) : $(event.target).parents('a:first');\n            _this2.navigate(anchor);\n          });\n        }\n\n        $(this.menu.add(this.slider)).on('transitionend msTransitionEnd', function () {\n          _this2.isAnimating = false;\n          _this2.triggerEvent(true);\n        });\n\n        $(document).keydown(function (e) {\n          switch (e.which) {\n            case _this2.options.keycodeClose:\n              _this2.close();\n              break;\n\n            case _this2.options.keycodeOpen:\n              _this2.open();\n              break;\n\n            default:\n              return;\n          }\n          e.preventDefault();\n        });\n\n        this.menu.on('sm.back-after', function () {\n          var lastActiveUl = 'ul ' + '.active '.repeat(_this2.level + 1);\n          _this2.menu.find(lastActiveUl).removeClass('active').hide();\n        });\n      }\n\n      /**\n       * Trigger a custom event to support callbacks\n       * @param {boolean} afterAnimation Mark this event as `before` or `after` callback\n       * @private\n       */\n\n    }, {\n      key: 'triggerEvent',\n      value: function triggerEvent() {\n        var afterAnimation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;\n\n        var eventName = 'sm.' + this.lastAction;\n        if (afterAnimation) eventName += '-after';\n        this.menu.trigger(eventName);\n      }\n\n      /**\n       * Navigate the menu - that is slide it one step left or right\n       * @param {jQuery} anchor The clicked anchor or button element\n       * @param {int} dir Navigation direction: 1 = forward, 0 = backwards\n       * @private\n       */\n\n    }, {\n      key: 'navigate',\n      value: function navigate(anchor) {\n        var dir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;\n\n        // Abort if an animation is still running\n        if (this.isAnimating) {\n          return;\n        }\n\n        var offset = (this.level + dir) * -100;\n\n        if (dir > 0) {\n          if (!anchor.next('ul').length) {\n            return;\n          }\n\n          anchor.next('ul').addClass('active').show();\n        } else if (this.level === 0) {\n          return;\n        }\n\n        this.lastAction = dir > 0 ? 'forward' : 'back';\n        this.level = this.level + dir;\n\n        this.triggerAnimation(this.slider, offset);\n      }\n\n      /**\n       * Start the animation (the CSS transition)\n       * @param elem\n       * @param offset\n       * @private\n       */\n\n    }, {\n      key: 'triggerAnimation',\n      value: function triggerAnimation(elem, offset) {\n        this.triggerEvent();\n\n        if (!String(offset).includes('%')) {\n          offset += '%';\n        }\n\n        elem.css('transform', 'translateX(' + offset + ')');\n        this.isAnimating = true;\n      }\n\n      /**\n       * Initialize the menu\n       * @private\n       */\n\n    }, {\n      key: 'setupMenu',\n      value: function setupMenu() {\n        var _this3 = this;\n\n        this.pauseAnimations(function () {\n          switch (_this3.options.position) {\n            case 'left':\n              _this3.menu.css({\n                left: 0,\n                right: 'auto',\n                transform: 'translateX(-100%)'\n              });\n              break;\n            default:\n              _this3.menu.css({\n                left: 'auto',\n                right: 0\n              });\n              break;\n          }\n          _this3.menu.show();\n        });\n      }\n\n      /**\n       * Pause the CSS transitions, to apply CSS changes directly without an animation\n       * @param work\n       * @private\n       */\n\n    }, {\n      key: 'pauseAnimations',\n      value: function pauseAnimations(work) {\n        this.menu.addClass('no-transition');\n        work();\n        this.menu[0].offsetHeight; // trigger a reflow, flushing the CSS changes\n        this.menu.removeClass('no-transition');\n      }\n\n      /**\n       * Enhance the markup of menu items which contain a submenu\n       * @private\n       */\n\n    }, {\n      key: 'setupSubmenus',\n      value: function setupSubmenus() {\n        var _this4 = this;\n\n        this.anchors.each(function (i, anchor) {\n          anchor = $(anchor);\n          if (anchor.next('ul').length) {\n            // prevent default behaviour (use link just to navigate)\n            anchor.click(function (ev) {\n              ev.preventDefault();\n            });\n\n            // add `before` and `after` text\n            var anchorTitle = anchor.text();\n            anchor.html(_this4.options.submenuLinkBefore + anchorTitle + _this4.options.submenuLinkAfter);\n\n            // add a back button\n            if (_this4.options.showBackLink) {\n              var backLink = $('<a class=\"slide-menu-control\" data-action=\"back\">' + anchorTitle + '</a>');\n              backLink.html(_this4.options.backLinkBefore + backLink.text() + _this4.options.backLinkAfter);\n              anchor.next('ul').prepend($('<li>').append(backLink));\n            }\n          }\n        });\n      }\n    }]);\n\n    return SlideMenu;\n  }();\n\n  // Link control buttons with the API\n\n\n  $('body').on('click', '.slide-menu-control', function (e) {\n    var menu = void 0;\n    var target = $(this).data('target');\n\n    if (!target || target === 'this') {\n      menu = $(this).parents('.slide-menu:first');\n    } else {\n      menu = $('#' + target);\n    }\n\n    if (!menu.length) return;\n\n    var instance = menu.data(PLUGIN_NAME);\n    var action = $(this).data('action');\n\n    if (instance && typeof instance[action] === 'function') {\n      instance[action]();\n    }\n  });\n\n  // Register the jQuery plugin\n  $.fn[PLUGIN_NAME] = function (options) {\n    if (!$(this).length) {\n      console.warn('Slide Menu: Unable to find menu DOM element. Maybe a typo?');\n      return;\n    }\n\n    options = $.extend({}, DEFAULT_OPTIONS, options);\n    options.elem = $(this);\n\n    var instance = new SlideMenu(options);\n    $(this).data(PLUGIN_NAME, instance);\n\n    return instance;\n  };\n})(jQuery);\n\n//# sourceURL=webpack:///./src/slideMenu.js?");

/***/ }),

/***/ "./src/styles/demo.scss":
/*!******************************!*\
  !*** ./src/styles/demo.scss ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/styles/demo.scss?");

/***/ }),

/***/ "./src/styles/slide-menu.scss":
/*!************************************!*\
  !*** ./src/styles/slide-menu.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/styles/slide-menu.scss?");

/***/ })

/******/ });