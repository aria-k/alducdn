Aldu.extend({
  UI : {
    Panel : {
      init : function() {
        Aldu.ready(function() {
          $('.aldu-helpers-panel').children().each(function(i, panel) {
            var status = $(panel).data('status');
            var height = $(panel).outerHeight(true);
            switch (status) {
            case 'off':
              $(panel).css('top', "-" + height + "px");
              $(panel).parent().animate({
                'height' : "0px"
              });
              break;
            case 'on':
            default:
              $(panel).css('top', "0px");
              $(panel).parent().animate({
                'height' : height + "px"
              });
            }
            $('a.toggle', panel).click(function() {
              $(this).toggleClass('toggle-active');
              var shortcuts = $('.toolbar-shortcuts');
              var status = shortcuts.data('status');
              var height = $(this).outerHeight(true);
              switch (status) {
              case 'off':
                $(panel).parent().animate({
                  height : '+=' + height
                });
                shortcuts.slideDown();
                status = 'on';
                break;
              case 'on':
              default:
                $(panel).parent().animate({
                  height : '-=' + height
                });
                shortcuts.slideUp();
                status = 'off';
                break;
              }
              $(shortcuts).data('status', status);
            });
          });
        });
      }
    }
  }
});
