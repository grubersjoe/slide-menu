// TODO: make this library agnostic
// TODO: document the events

(function($) {
  const PLUGIN_NAME = "slideMenu";
  const DEFAULT_OPTIONS = {
    position: "right",
    showBackLink: true,
    keycodeOpen: null,
    keycodeClose: 27, //esc
    submenuLinkBefore: "",
    submenuLinkAfter: "",
    backLinkBefore: "",
    backLinkAfter: ""
  };

  class SlideMenu {
    constructor(options) {
      this.options = options;

      this._menu = options.elem; // the left and right nav menu elements
      // Add wrapper
      this._menu.find("ul:first").wrap('<div class="slider">'); // wraps div with class slider around every ul that is the first child of its parent
      this._anchors = this._menu.find("a"); // returns an object with all of the anchors
      this._slider = this._menu.find(".slider:first"); // returns an object with all of the slider elements that are the first child of its parent

      this._level = 0;
      this._isOpen = false;
      this._isAnimating = false;
      this._hasMenu = this._anchors.length > 0; // returns boolean representing if this._anchors length is greater than 0
      this._lastAction = null;

      // NOTES
      // need to write a new function set up dynamic menus
      // before we bind event handlers and set up menus, we need to add data-processed and data-function attributes to each of the anchor tags
      // for each anchor tag, we check if it's been processed
      // if it's hasn't been processed, we check if there's a data-function
      // if there's a data function, we will inject a new ul with an li with loading next to the anchor tag
      // when this anchor tag gets clicked, we will fire the function which will return a promise
      // when the promise gets resolved, for each new menu item, it will create a new li with anchor inside of the ul
      // each new anchor will go through process of having processed = false and, if needed, data function added to it (how do we know if a new menu item needs to have data-function added to it?)

      this._setupEventHandlers(); // attaches click handlers to all of the anchors
      this._setupMenu(); // set up which side menus are going to be on

      if (this._hasMenu) this._setupSubmenus(); //
    }

    fetchMenuItems(selectedMenuItem) {
      // TODO make ajax call and fetch menu items based on selectedMenuItem
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
        offset = this.options.position === "left" ? "-100%" : "100%";
        this._isOpen = false;
      }

      this._triggerEvent();

      if (animate) this._triggerAnimation(this._menu, offset);
      else {
        this._pauseAnimations(
          this._triggerAnimation.bind(this, this._menu, offset)
        );
        this._isAnimating = false;
      }
    }

    /**
     * Open the menu
     * @param {boolean} animate Use CSS transitions
     */
    open(animate = true) {
      this._lastAction = "open";
      this.toggle(true, animate);
    }

    /**
     * Close the menu
     * @param {boolean} animate Use CSS transitions
     */
    close(animate = true) {
      this._lastAction = "close";
      this.toggle(false, animate);
    }

    /**
     * Navigate one menu hierarchy back if possible
     */
    back() {
      this._lastAction = "back";
      this._navigate(null, -1);
    }

    /**
     * Navigate to a specific link on any level (useful to open the correct hierarchy directly)
     * @param {string|object} target A string selector a plain DOM object or a jQuery instance
     */
    navigateTo(target) {
      target = this._menu.find($(target)).first();

      if (!target.length) return false;

      var parents = target.parents("ul");
      var level = parents.length - 1;

      if (level === 0) return false;

      this._pauseAnimations(() => {
        this._level = level;
        parents
          .show()
          .first()
          .addClass("active");
        this._triggerAnimation(this._slider, -this._level * 100);
      });
    }

    /**
     * Set up all event handlers
     * @private
     */
    _setupEventHandlers() {
      // if there's at least one anchor
      if (this._hasMenu) {
        // bind a click event handler to all of the anchors
        this._anchors.click(event => {
          // if the clicked element is an anchor tag, assign it to the anchor variable
          // else search up through the target element's ancestors for matched anchor tags that are the first child of their parent and assign it to the anchor variable
          let anchor = $(event.target).is("a")
            ? $(event.target)
            : $(event.target).parents("a:first");

          // call navigate to slide the menu one step right
          this._navigate(anchor);
          // if the clicked anchor has data function attribute, remove loading ul/li
          if (anchor.data("function") !== undefined) {
            // do ajax call
            var $ul = anchor.next("ul");
            if ($ul.find(".loading").length) {
              $.ajax({
                url: "https://jsonplaceholder.typicode.com/users",
                context: this,
                success: function(response) {
                  // after getting response of ajax call, remove loading li's
                  $ul.find(".loading").remove("");
                  // on each retrieved menu item, add new li
                  response.forEach(function(menuItem) {
                    $ul.append(
                      '<li><a href="#" data-function="function">' +
                        menuItem.id +
                        "</a></li>"
                    );
                  });
                  anchor.data("function", undefined);
                  this._update();
                }
              });
            }
          }
        });
      }

      // for each menu, add
      // console.log('WHAT IS SLIDER', this._slider);
      // console.log('WHAT IS MENU', this._menu);
      // console.log('WHAT IS THIS', $(this._menu.add(this._slider)));
      // select both this._menu and this._slider and add an event listener that listens for transitionend event
      $(this._menu.add(this._slider)).on(
        "transitionend msTransitionEnd",
        () => {
          // when the listener events are triggered, set this._isAnimating to false
          this._isAnimating = false;
          //
          this._triggerEvent(true);
        }
      );

      $(document).keydown(e => {
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

      this._menu.on("sm.back-after", () => {
        let lastActiveUl = "ul " + ".active ".repeat(this._level + 1);
        this._menu
          .find(lastActiveUl)
          .removeClass("active")
          .hide();
      });
    }

    /**
     * Trigger a custom event to support callbacks
     * @param {boolean} afterAnimation Mark this event as `before` or `after` callback
     * @private
     */
    _triggerEvent(afterAnimation = false) {
      let eventName = "sm." + this._lastAction;
      if (afterAnimation) eventName += "-after";
      this._menu.trigger(eventName);
    }

    /**
     * Navigate the _menu - that is slide it one step left or right
     * @param {jQuery} anchor The clicked anchor or button element
     * @param {int} dir Navigation direction: 1 = forward, 0 = backwards
     * @private
     */
    _navigate(anchor, dir = 1) {
      // console.log('NAVIGATING', anchor, dir);
      // Abort if an animation is still running
      if (this._isAnimating) {
        return;
      }

      let offset = (this._level + dir) * -100;

      if (dir > 0) {
        if (!anchor.next("ul").length) return;

        anchor
          .next("ul")
          .addClass("active")
          .show();
      } else if (this._level === 0) {
        return;
      }

      this._lastAction = dir > 0 ? "forward" : "back";
      this._level = this._level + dir;

      this._triggerAnimation(this._slider, offset);
    }

    /**
     * Start the animation (the CSS transition)
     * @param elem
     * @param offset
     * @private
     */
    _triggerAnimation(elem, offset) {
      this._triggerEvent();

      if (!String(offset).includes("%")) offset += "%";

      elem.css("transform", "translateX(" + offset + ")");
      this._isAnimating = true;
    }

    /**
     * Initialize the menu
     * @private
     */
    _setupMenu() {
      this._pauseAnimations(() => {
        switch (this.options.position) {
          case "left":
            this._menu.css({
              left: 0,
              right: "auto",
              transform: "translateX(-100%)"
            });
            break;
          default:
            this._menu.css({
              left: "auto",
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
      this._menu.addClass("no-transition");
      work();
      this._menu[0].offsetHeight; // trigger a reflow, flushing the CSS changes
      this._menu.removeClass("no-transition");
    }

    /**
     * Enhance the markup of menu items which contain a submenu
     * @private
     */
    _setupSubmenus() {
      this._anchors.each((i, anchor) => {
        anchor = $(anchor);
        // check if anchor.data('processed') is false
        // check if anchor.data('function')
        // anchor click bind event handler
        // inject ul
        // if anchor has data-processed attribute set to false, set it to true
        if (anchor.data("processed") === undefined) {
          anchor.data("processed", true);
          if (anchor.data("function") !== undefined) {
            // add sibling ul with child loading li
            anchor.after($('<ul><li class="loading">loading</li></ul>'));
          }

          // check if there's a ul sibling next to anchor
          if (anchor.next("ul").length) {
            // prevent default behaviour (use link just to navigate)
            anchor.click(function(ev) {
              ev.preventDefault();
            });

            // add `before` and `after` text
            let anchorTitle = anchor.text();
            anchor.html(
              this.options.submenuLinkBefore +
                anchorTitle +
                this.options.submenuLinkAfter
            );

            // add a back button
            if (this.options.showBackLink) {
              let backLink = $(
                '<a href class="slide-menu-control" data-action="back">' +
                  anchorTitle +
                  "</a>"
              );
              backLink.html(
                this.options.backLinkBefore +
                  backLink.text() +
                  this.options.backLinkAfter
              );
              anchor.next("ul").prepend($("<li>").append(backLink));
            }
          }
        }
      });
    }

    _update() {
      this._anchors = this._menu.find("a");
      this._hasMenu = this._anchors.length > 0;
      this._setupEventHandlers();
      this._setupSubmenus();
    }
  }

  // Link control buttons with the API
  $("body").on("click", ".slide-menu-control", function(e) {
    let menu;
    let target = $(this).data("target");

    if (!target || target === "this") {
      menu = $(this).parents(".slide-menu:first");
    } else {
      menu = $("#" + target);
    }

    if (!menu.length) return;

    let instance = menu.data(PLUGIN_NAME);
    let action = $(this).data("action");

    if (instance && typeof instance[action] === "function") {
      instance[action]();
    }

    return false;
  });

  // Register the jQuery plugin
  $.fn[PLUGIN_NAME] = function(options) {
    if (!$(this).length) {
      console.warn(
        "Slide Menu: Unable to find menu DOM element. Maybe a typo?"
      );
      return;
    }

    options = $.extend({}, DEFAULT_OPTIONS, options);
    options.elem = $(this);

    let instance = new SlideMenu(options);
    $(this).data(PLUGIN_NAME, instance);

    return instance;
  };
})(jQuery);
