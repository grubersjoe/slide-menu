# Slide Menu

*A simple multilevel CSS menu, with a slide effect*.

## Install
```
bower install slide-menu
``` 

## Getting started
All you need is the traditional CSS menu HTML markup and a wrapper with the class `slide-menu`. Menus can be nested endlessly. To programmatically control the menu you should also asign an ID to be able to use API (see below).

```
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
        <a href="/blog">About</a>
    </li>
</ul>
</nav>
```

The SCSS and JS code is included automatically when using [wiredep](https://github.com/taptapship/wiredep). Add `dist/scripts/slide-menu.js` and the CSS or SCSS code manually to your project otherwise.

Create the menu then like this:

```
$(document).ready(function () {
    var menu = $('#my-menu').slideMenu();
});
```
 
## Options
 
Some aspects can be configured with an options object:
  
Option | Description | Valid values | Default
--- | --- | --- | ---
`showBackLink` | Show a link to parent level in submenus | *boolean* | `true`
`submenuLinkBefore` | HTML to prepend to links with a submenu | HTML code |  *empty*
`submenuLinkAfter` | HTML to append to links with a submenu | HTML code |  *empty*
`backLinkBefore` | HTML to prepend to back link in submenus | HTML code |  *empty*
`backLinkAfter` | HTML to append to back link in submenus | HTML code |  *empty*
 
 Example:
 
 ```
 $(document).ready(function () {
     var menu = $('#my-menu').slideMenu({
         showBackLink: false,
         submenuLinkAfter: ' <strong>*</strong>'
     });
 });
 ```
 
 ## API
 
Either use the variable where you initialized the slideMenu (`menu` in above example) to call the API or, if you need the instance later, fetch it from the element like this:

```
var menu = $('#my-menu').data('slideMenu');

menu.open();
menu.close();
```

* `toggle()` - Toggle the menu
* `open()` - Open the menu
* `close()` - Close the menu
* `back()` - Navigate on level back if possible

 
Buttons to control the menu can be created easily. Add the class `slide-menu-control` to links or buttons and set the `data` attributes `target` with the ID of desired menu and `action` to specify the API method:

```
<a class="slide-menu-control" data-target="my-menu" data-action="open">Open</a>
<a class="slide-menu-control" data-target="my-menu" data-action="close">Close</a>
```

Inside the menu container the attribute `data-target` can be omitted or set to to the string `this` to control *this* menu.

```
<a class="slide-menu-control" data-action="close">Close this menu</a>
<a class="slide-menu-control" data-target="this" data-action="close">Close this menu</a>
```