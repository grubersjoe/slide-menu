import SlideMenu from '../SlideMenu';
import './demo.scss';

function logEvent(menuName: string, event: Event): void {
  const events = document.getElementById('events');

  if (!events) {
    throw new Error('#events does not exist.');
  }

  const li = document.createElement('li');

  // html-webpack-plugin does not work with ES6 template strings =/
  li.appendChild(document.createTextNode(menuName + ': ' + event.timeStamp + ' - ' + event.type));

  events.appendChild(li);
}

document.addEventListener('DOMContentLoaded', function() {
  const menuLeftElem = document.getElementById('test-menu-left');
  const menuRightElem = document.getElementById('test-menu-right');

  if (!menuLeftElem || !menuRightElem) {
    throw new Error(`Test menus don't exist`);
  }

  const allEvents = [
    'sm.back',
    'sm.back-after',
    'sm.close',
    'sm.close-after',
    'sm.forward',
    'sm.forward-after',
    'sm.navigate',
    'sm.navigate-after',
    'sm.open',
    'sm.open-after',
  ];

  allEvents.forEach(eventName => {
    menuLeftElem.addEventListener(eventName, event => logEvent('Menu left', event));
    menuRightElem.addEventListener(eventName, event => logEvent('Menu right', event));
  });

  new SlideMenu(menuLeftElem, {
    position: 'left',
    submenuLinkAfter: ' ⮞',
    backLinkBefore: '⮜ ',
  });

  const menuRight = new SlideMenu(menuRightElem, {
    keyClose: 'Escape',
    submenuLinkAfter: '<span style="margin-left: 1em; font-size: 85%;">⮞</span>',
    backLinkBefore: '<span style="margin-right: 1em; font-size: 85%;">⮜</span>',
  });

  if (window.innerWidth >= 768) {
    menuRight.open(false);
  }
});
