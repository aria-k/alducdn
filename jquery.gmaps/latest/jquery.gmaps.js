(function($) {
  $.fn.gMaps = function(options) {
    var id = $(this).attr('id') ? $(this).attr('id') : 'gMap-' + Math.random();
    var opts = {
      id: id,
      address: null,
      locate: true,
      zoom: 8,
      width: $(this).width(),
      height: $(this).height(),
      //lat: -34.397,
      //lng: 150.644,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    return this.each(function() {
      $.extend(opts, options);
      var map = this;
      if (window.navigator && options.locate) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          $.gMaps.init(map, $.extend({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }, opts));
        });
      }
      else {
        $.gMaps.init(this, $.extend({
          lat: -34.397,
          lng: 150.644
        }, opts));
      }
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
