(function($){
    $(document).ready(function () {

        $('.slide-menu').each(function () {

            var menu    = $(this);
            var width   = menu.width();
            var slider  = menu.find('.slider:first');
            var anchors = menu.find('a');

            anchors.each(function () {
                if ($(this).next('ul').length) {
                    $(this).text($(this).text() + ' *');
                }
            });

            anchors.click(function () {
                var level, offset, direction, lastActiveUl;

                level = Number(menu.data('level')) || 0;
                direction = $(this).hasClass('btn-back') ? -1 : 1;
                offset = (level + direction) * -width;

                if (direction > 0) {
                    // abort if no submenu exists
                    if ($(this).next('ul').length === 0)
                        return;

                    // show the next level otherwise
                    $(this).next('ul').addClass('active').show();
                } else {
                    // abort if on top level
                    if (level === 0)
                        return;

                    // find the last active ul and fade it out
                    lastActiveUl = 'ul ' + '.active '.repeat(level);
                    menu.find(lastActiveUl).removeClass('active').fadeOut();
                }

                // save current level and trigger the animation
                menu.data('level', level + direction);
                slider.css('transform', 'translateX(' + offset + 'px)');
            })
        });

        $('.btn-slide-menu-control').click(function () {
            var menu  = $('#' + $(this).data('target'));
            var offset;

            if (menu.length === 0)
                return;

            function open() {
                offset = 0;
                menu.addClass('open');
            }

            function close() {
                offset = menu.width();
                menu.removeClass('open');
            }

            switch ($(this).data('action')) {
                case 'open':
                    open();
                    break;
                case 'close':
                    close();
                    break;
                default:
                    if (menu.hasClass('open')) {
                        close();
                    }  else {
                        open();
                    }
                    break;
            }

            menu.css('transform', 'translateX(' + offset + 'px)');
        });
    });
})(jQuery);