Aldu.extend({
  UI : {
    Panel : {
      init : function() {
        $(document).ready(function() {
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
              switch (status) {
              case 'off':
                $(panel).animate({
                  top : '+=' + height
                });
                $(panel).parent().animate({
                  height : '+=' + height
                });
                status = 'on';
                break;
              case 'on':
                $(panel).parent().animate({
                  height : '-=' + height
                });
                $(panel).animate({
                  top : '-=' + height
                });
                status = 'off';
                break;
              }
              $(panel).data('status', status);
            });
          });
        });
      }
    }
  }
});
