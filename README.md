# Slide Menu

*A library agnostic multilevel JavaScript menu with a smooth slide effect and various options.*

Support: All current browsers and IE11+ (if using `dist/slide-menu.ie.js`).

**[Demo](https://grubersjoe.github.io/slide-menu)**

## v1 has been released – breaking changes

Version 1 has been released and includes breaking changes: Since the library has been rewritten in Typescript, jQuery is no longer a required dependency (yay!). Obviously, this also menas, that `SlideMenu` can't be used as a jQuery plugin any more.

See below instructions how to use the new version. 

## Install
```sh
npm install @grubersjoe/slide-menu
``` 

Now include `dist/slide-menu.js` and `dist/slide-menu.css` into your bundler/ build system of choice or use a 1998 `<script>` tag. `SlideMenu` is available in the global namespace (`window.SlideMenu`) afterwards.

To keep the bundle size small (16 kB vs. 23 kB) Internet Explorer 11 is not supported out of the box. If you need to support Internet Explorer 11 use `dist/slide-menu.ie.js` instead. 


## Usage
All you need is the traditional CSS menu HTML markup and a wrapper with the class `slide-menu`. Menus can be nested endlessly to create the desired hierarchy. If you wish to programmatically control the menu, you should also set an ID to be able to use the API (see below).

**Example**

```html
<nav class="slide-menu" id="example-menu">
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

Create the menu then like this:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  const menu = new SlideMenu(document.getElementById('example-menu'));
});
```
 
## Options

The `SlideMenu()` constructor takes an optional second parameter to pass in various options:
  
Option | Description | Valid values | Default
--- | --- | --- | ---
`position` | Position of the menu | `'left'` or `'right'` | `'right'`
`showBackLink` | Add a link to navigate back in submenus (first entry) | *boolean* | `true`
`keycodeOpen` | Key used to open the menu | [Any valid KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) | `undefined`
`keycodeClose` | Key used to close the menu | [Any valid KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) | `undefined`
`submenuLinkBefore` | HTML to prepend to links with a submenu | HTML code |  `''`
`submenuLinkAfter` | HTML to append to links with a submenu | HTML code |  `''`
`backLinkBefore` | HTML to prepend to back link in submenus | HTML code |  `''`
`backLinkAfter` | HTML to append to back link in submenus | HTML code |  `''`
 
 Example:
 
 ```javascript
document.addEventListener("DOMContentLoaded", function () {
  const menu = new SlideMenu(document.getElementById('example-menu'),{
      showBackLink: false,
      submenuLinkAfter: ' <strong>⇒</strong>'
  });
});
 ```
 
## API

You can call the API in two different ways:

* Reuse the reference to the `SlideMenu` instance directly: 
    ```javascript
    const menu = new SlideMenu(document.getElementById('example-menu'));
  
    // ... later
    menu.close();
    ```
* The `SlideMenu` instance is added as property of the menu DOM element (not incredibly kosher I guess). So if you need to control an existing menu without a reference to it, you can fetch it any time this way:

    ```javascript
    const menu = document.getElementById('example-menu')._slideMenu;
    menu.open();
    ```

### Methods

* `toggle(animate = true)` - Toggle the menu
* `open(animate = true)` - Open the menu
* `close(animate = true)` - Close the menu
* `back()` - Navigate on level back if possible
* `navigateTo(target)`
    Open the menu level which contains specified menu element. `target` can either be a `document.querySelector` compatible string selector or the the DOM element (inside the menu). The first found element (if any) will be used.

### Events

`SlideMenu` emits events for all kind of actions. All of the events also have  an `*-after` equivalent, which is triggered after the step is complete (completely animated).

* `sm.open[-after]` fires immediately when the `open()` method is called or after the animation is complete respectively.
* `sm.close[-after]` fires immediately when the `close()` method is called or after the animation is complete respectively. 
* `sm.forward[-after]`fires immediately when navigating forward in the menu hierarchy or after the animation is complete respectively. 
* `sm.back[-after]` fires immediately when navigating backwards in the menu hierarchy or after the animation is complete respectively. 

### Control buttons
 
Buttons to control the menu can be created easily. Add the class `slide-menu__control` to anchors or buttons and set the `data` attributes `target` to the ID of the desired menu and `action` to the API method:

```html
<button type="button" class="slide-menu__control" data-action="open">Open</button>
<button type="button" class="slide-menu__control" data-action="back">Back</button>
```

*Inside* the menu container the attribute `data-target` can be omitted or set to to the string `this` to control *this* menu.

```html
<a class="slide-menu-control" data-action="close">Close this menu</a>
<a class="slide-menu-control" data-target="this" data-action="close">Close this menu</a>
```
