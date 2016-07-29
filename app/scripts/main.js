// TODO: create some kind of plugin API
// TODO: later: make this library agnostic

(function ($) {

    $.fn.slideMenu = function (options) {
        // This is the easiest way to have default options.
        let settings = $.extend({
            color: '#556b2f',
            backgroundColor: 'white'
        }, options);

        let menu = this;
        let anchors = menu.find('a');

        /**
         * Navigate the menu - that is slide it left or right
         * @param {jQuery} menu The menu element to control
         * @param {jQuery} anchor The clicked anchor or button element
         * @param {int} dir
         */
        function navigateMenu(menu, anchor, dir = 1) {
            let level, offset, lastActiveUl, slider;

            slider = menu.find('.slider:first');
            level = Number(menu.data('level')) || 0;
            offset = (level + dir) * -menu.width();

            if (dir > 0) {
                if (!anchor.next('ul').length)
                    return;

                anchor.next('ul').addClass('active').show();
            } else {
                if (level === 0)
                    return;

                lastActiveUl = 'ul ' + '.active '.repeat(level);
                menu.find(lastActiveUl).removeClass('active').fadeOut();
            }

            menu.data('level', level + dir);
            slider.css('transform', 'translateX(' + offset + 'px)');
        }

        anchors.each(function () {
            if ($(this).next('ul').length) {
                $(this).text($(this).text() + ' *');
            }
        });

        anchors.click(function () {
            navigateMenu(menu, $(this));
        });

        $('.slide-menu-control').click(function () {
            let menu = $('#' + $(this).data('target'));
            let action = $(this).data('action');
            let offset;

            if (menu.length === 0)
                return;

            let actions = new Map([
                ['back', function () {
                    navigateMenu(menu, null, -1);
                }],
                ['open', function () {
                    offset = 0;
                    menu.addClass('open');
                }],
                ['close', function () {
                    offset = menu.width();
                    menu.removeClass('open');
                }],
                ['toggle', function () {
                    if (menu.hasClass('open')) {
                        actions.get('close')();
                    } else {
                        actions.get('open')();
                    }
                }],
            ]);

            if (actions.has(action)) {
                actions.get(action)();
                menu.css('transform', 'translateX(' + offset + 'px)');
            }
        });

        return this;
    };
}(jQuery));

$(document).ready(function () {
    $('#my-menu').slideMenu();
});