(function($) {
  var methods = {
    stop : function(callback) {
      $('img', this).each(function(i, img) {
        if (img.complete) {
          return;
        }
        $(img).data('imgload', $(img).prop('src'));
        $(img).prop('src', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAABJJREFUeF4FwIEIAAAAAKD9qY8AAgABdDtSRwAAAABJRU5ErkJggg==");
        if (callback)
          callback.call();
      });
      return this;
    },
    load : function(callback, data) {
      var images = $('img', this); 
      var total = images.length;
      var count = total;
      var loaded = 0;
      images.each(function(i, img) {
        if ($(img).data('imgload')) {
          $(img).prop('src', $(img).data('imgload'));
        }
        if (img.complete) {
          count--;
        }
        else {
          $(img).load(function() {
            loaded++;
            if (loaded >= count && callback) {
              callback(data);
            }
          }).error(function() {
            loaded++;
            if (loaded >= count && callback) {
              callback(data);
            }
          });
        }
      });
      if ((total == 0 || count <= 0) && callback) {
        callback(data);
      }
      return this;
    }
  };
  $.fn.imgload = function(method, callback) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if (typeof method === 'object' || typeof method === 'function' || !method) {
      return methods.load.apply(this, arguments);
    }
    else {
      $.error('Method ' + method + ' does not exist on jQuery.imgload');
    }
  };
})(jQuery);