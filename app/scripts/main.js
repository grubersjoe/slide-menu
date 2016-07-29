// TODO: create some kind of plugin API
// TODO: later: make this library agnostic

(function ($) {

    class SlideMenu {
        constructor(elem) {
            this.menu    = elem;
            this.anchors = elem.find('a');
            this.slider  = elem.find('.slider:first');

            this._isOpen = false;

            this._setupEventHandlers();
        }

        toggle(open = null) {
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
                offset = this.menu.width();
                this._isOpen = false;
            }

            console.log(offset);

            this.menu.css('transform', 'translateX(' + offset + 'px)');
        }

        open() {
            this.toggle(true);
        }

        close() {
            this.toggle(false);
        }

        back() {
            this._navigate(null, -1);
        }

        _setupEventHandlers() {
            this.anchors.each(function () {
                if ($(this).next('ul').length) {
                    $(this).text($(this).text() + ' *');
                }
            });

            this.anchors.click((event) => {
                this._navigate($(event.target));
            });
        }

        /**
         * Navigate the menu - that is slide it one step left or right
         * @param {jQuery} anchor The clicked anchor or button element
         * @param {int} dir
         */
        _navigate(anchor, dir = 1) {
            let level, offset, lastActiveUl;

            level = Number(this.menu.data('level')) || 0;
            offset = (level + dir) * -this.menu.width();

            if (dir > 0) {
                if (!anchor.next('ul').length)
                    return;

                anchor.next('ul').addClass('active').show();
            } else {
                if (level === 0)
                    return;

                lastActiveUl = 'ul ' + '.active '.repeat(level);
                this.menu.find(lastActiveUl).removeClass('active').fadeOut();
            }

            this.menu.data('level', level + dir);
            this.slider.css('transform', 'translateX(' + offset + 'px)');
        }
    }


    $.fn.slideMenu = function (options) {
        let instance = new SlideMenu($(this));
        $(this).data('SlideMenu', instance);

        return instance;
    };

}(jQuery));

$(document).ready(function () {
    $('#my-menu').slideMenu();
});