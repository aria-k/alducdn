(function($) {
  $.fn.updateOptions = function(options) {
    var settings = {
      'dataType' : 'json',
      'data' : null,
      'tag' : 'option',
      'key' : 'id',
      'values' : ['name'],
      'delimiter' : ', ',
      'beforeUpdate' : null,
      'afterUpdate' : null,
      'removeFirst' : true
    };
    return this.each(function() {
      if (options) {
        $.extend(settings, options);
      }
      var target = $(this);
      $.ajax({
        url : settings.url,
        data : settings.data,
        dataType : settings.dataType,
        beforeSend : function(xhr, settings) {
          var option = $('<option>').prop({
            selected : true
          }).text('Loading...');
          target.prepend(option);
        },
        success : function(data) {
          target.children(':first').remove();
          if (settings.removeFirst) {
            target.children().remove();
          }
          else {
            target.children(':first').siblings().remove();
          }
          $.each(data, function(k, v) {
            var tag = $('<' + settings.tag + '>');
            var values = new Array();
            for (var i in settings.values) {
              values.push(v[settings.values[i]]);
            }
            var value = values.join(settings.delimiter);
            tag.attr('value', v[settings.key]).html(value).appendTo(target);
            if (settings.afterUpdate) {
              settings.afterUpdate(tag, value);
            }
          });
        }
      });
    });
  };
})(jQuery);
