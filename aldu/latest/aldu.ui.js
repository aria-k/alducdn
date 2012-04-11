Aldu.extend({
  UI : {
    Form : {
      init : function(context) {
        $('input:submit', context).on('click', function(event) {
          if (!event.target.form) {
            var id = $(event.target).attr('form');
            $('form#' + id).submit();
          }
        });
        $('form', context).each(function(i, form) {
          if (!form.elements.length) {
            var id = form.id;
            $(form).on('submit', function(event) {
              event.preventDefault();
              $(':input[form=' + id + ']', context).each(function(i, input) {
                $(input).trigger('update.aldu');
                var ck = $(input).data('ckeditorInstance');
                if (ck) {
                  ck.updateElement();
                }
                var hidden = $('<input>').attr({
                  type : 'hidden',
                  name : $(input).attr('name'),
                  value : $(input).val()
                });
                $(form).append(hidden);
              });
              form.submit();
            });
          }
        });
      }
    },
    Panel : {
      init : function() {
        Aldu.ready(function() {
          $('.aldu-helpers-panel').each(function(i, panel) {
            var status = $(panel).data('status');
            var height = $(panel).outerHeight(true);
            var parent = $(panel).parent();
            switch (status) {
            case 'off':
              parent.animate({
                'height' : "0px"
              });
              break;
            case 'on':
            default:
              parent.animate({
                'height' : height + "px"
              });
            }
            $(panel).css('position', 'fixed');
            $('a.toggle', panel).click(function() {
              $(this).toggleClass('toggle-active');
              var shortcuts = $('.aldu-ui-toolbar-shortcuts');
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
