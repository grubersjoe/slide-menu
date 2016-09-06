# Slide Menu

*A simple multilevel CSS menu, with a slide effect and various options*.

**[Demo](https://grubersjoe.github.io/slide-menu)**

## Install
```sh
bower install slide-menu
``` 

## Getting started
All you need is the traditional CSS menu HTML markup and a wrapper with the class `slide-menu`. Menus can be nested endlessly. To programmatically control the menu you should also asign an ID to be able to use API (see below).

```html
<nav class="slide-menu" id="my-menu">
    <ul>
        <li>
            <a href="#">Home</a>
            <ul>
                <li><a href="#">Submenu entry 1</a></li>
                <li><a href="#">Submenu entry 2</a></li>
                <li><a href="#">Submenu entry 3</a></li>
            </ul>
        </li>
        <li>
            <a href="/blog">Blog</a>
        </li>
        <li>
            <a href="/about">About</a>
        </li>
    </ul>
</nav>
```

The SCSS and JS code is included automatically when using [wiredep](https://github.com/taptapship/wiredep). Add `dist/scripts/slide-menu.js` and the CSS or SCSS code manually to your project otherwise.

Create the menu then like this:

```javascript
$(document).ready(function () {
    var menu = $('#my-menu').slideMenu();
});
```
 
## Options
 
You can pass an options array as argument to the slideMenu() constructor.
  
Option | Description | Valid values | Default
--- | --- | --- | ---
`position` | Position of the menu | `"left"` or `"right"` | `"right"`
`showBackLink` | Show a link to parent level in submenus | *boolean* | `true`
`keycodeOpen` | Keycode used to open the menu | [Any valid JS keycode](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) | `null`
`keycodeClose` | Keycode used to close the menu | [Any valid JS keycode](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) | `27` (ESC)
`submenuLinkBefore` | HTML to prepend to links with a submenu | HTML code |  *empty*
`submenuLinkAfter` | HTML to append to links with a submenu | HTML code |  *empty*
`backLinkBefore` | HTML to prepend to back link in submenus | HTML code |  *empty*
`backLinkAfter` | HTML to append to back link in submenus | HTML code |  *empty*
 
 Example:
 
 ```javascript
 $(document).ready(function () {
     var menu = $('#my-menu').slideMenu({
         showBackLink: false,
         submenuLinkAfter: ' <strong>*</strong>'
     });
 });
 ```
 
## API

You can call the API in two different ways:

* Reuse the variable of the jQuery element, where the plugin has been initialized: 
    ```javascript
    var menu = $('#my-menu').data('slideMenu');
    
    menu.open();
    menu.close(false);
    ```
* If you need to control an existing menu, you can fetch the menu instance  any time this way:

    ```javascript
    $('#my-menu').data('slide-menu').toggle();
    ```

### Methods

* `toggle(animate = true)` - Toggle the menu
* `open(animate = true)` - Open the menu
* `close(animate = true)` - Close the menu
* `back()` - Navigate on level back if possible
* `navigateTo(target)`
    
    Open the menu level which contains specified menu element. `target` can be any jQuery compatible string selector, a plain DOM object or a jQuery object. The first found element will be used.

### Events

All events have also an `*-after` pendant, which is triggered after the transition is complete.

* `sm.open[-after]`

    Fires immediately when the `open()` method is called or after the animation is complete respectively.
* `sm.close[-after]`

    Fires immediately when the `close()` method is called or after the animation is complete respectively. 
* `sm.forward[-after]`

    Fires immediately when navigating forward in the menu hierarchy or after the animation is complete respectively. 
* `sm.back[-after]`

    Fires immediately when navigating backwards in the menu hierarchy or after the animation is complete respectively. 

### Control buttons
 
Buttons to control the menu can be created easily. Add the class `slide-menu-control` to links or buttons and set the `data` attributes `target` to the ID of the desired menu and `action` to the API method:

```html
<a class="slide-menu-control" data-target="my-menu" data-action="open">Open</a>
<a class="slide-menu-control" data-target="my-menu" data-action="close">Close</a>
```

Inside the menu container the attribute `data-target` can be omitted or set to to the string `this` to control *this* menu.

```html
<a class="slide-menu-control" data-action="close">Close this menu</a>
<a class="slide-menu-control" data-target="this" data-action="close">Close this menu</a>
```
