(function( $ ){
  $.fn.autoload = function( plugin, options, each ) {
    if (typeof options === 'function') {
      each = options;
      options = {};
    }
    if (this.length) {
      if (Aldu.isObject(plugin)) {
        Aldu.chain(Aldu.CDN.require, plugin, function(jq, each) {
          jq.each(each);
        }, [ this, each ]);
      }
      else {
        Aldu.CDN.require(plugin, options, function(jq, each) {
          jq.each(each);
        }, [ this, each ]);
      }
    }
  };
})( jQuery );