import SlideMenu from './SlideMenu';

declare global {
  interface Element {
    msMatchesSelector(selectors: string): boolean;
  }

  interface Window {
    SlideMenu: typeof SlideMenu;
  }
}
