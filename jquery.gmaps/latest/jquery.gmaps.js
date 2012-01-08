(function($) {
  $.fn.gMaps = function(options) {
    var id = $(this).attr('id') ? $(this).attr('id') : 'gMap-' + Math.random();
    var opts = {
      id: id,
      address: null,
      zoom: 8,
      width: $(this).width(),
      height: $(this).height(),
      lat: -34.397,
      lng: 150.644,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    return this.each(function() {
      if (options) {
        $.extend(opts, options);
      }
      $.gMaps.init(this, opts);
    });
  };

  $.gMaps = {
    buffer: 0,
    maps: [],
    markers: [],
    geocoder: new google.maps.Geocoder(),

    init: function(element, opts) {
      var center = new google.maps.LatLng(opts.lat, opts.lng);
      var gOpts = {
        zoom: opts.zoom,
        center: center,
        mapTypeId: opts.mapTypeId
      };
      $(element).width(opts.width);
      $(element).height(opts.height);
      $.gMaps.maps[opts.id] = new google.maps.Map(element, gOpts);
      $.gMaps.markers[opts.id] = [];
      $.gMaps.mark(opts.id, opts.address);
    },

    mark: function(id, address, callback) {
      if (address) {
        $.gMaps.geocoder.geocode({
          'address': address
        }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            var loc = results[0].geometry.location;
            var viewport = results[0].geometry.viewport;
            $.gMaps.maps[id].panTo(loc);
            $.gMaps.maps[id].fitBounds(viewport);
            //$.gMaps.maps[id].setZoom(opts.zoom);
            if ($.gMaps.markers[id].length == 0) {
              $.gMaps.markers[id].push(new google.maps.Marker({
                map: $.gMaps.maps[id],
                position: loc
              }));
            }
            var marker = $.gMaps.markers[id].slice().pop();
            marker.setPosition(loc);
            if (callback) callback.call();
          }
          else {
            alert("Geocode was not successful for the following reason: " + status);
          }
        });
      }
      else {
        $.gMaps.markers[id].push(new google.maps.Marker({
          map: $.gMaps.maps[id],
          position: $.gMaps.maps[id].getCenter()
        }));
      }
    }
  };
})(jQuery);
