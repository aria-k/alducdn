Aldu.CDN = {
  defaults : {
    host : 'cdn.aldu.net',
    version : 'latest',
    force : false
  },
  _load : function(plugin, options) {
    Aldu.log('Aldu.CDN.require: ' + plugin.name + ' loaded', 2);
    Aldu.CDN.plugins[plugin.name].status = 'loaded';
    Aldu.Event.trigger(plugin.name);
  },
  require : function(_plugin, _options, callback, args) {
    Aldu.log('Aldu.CDN.require: requiring ' + _plugin, 4);
    if (typeof Aldu.CDN.plugins[_plugin] === 'undefined') {
      Aldu.log('Aldu.CDN.require: ' + _plugin + ' is undefined', 2);
      return false;
    }
    if (Aldu.isFunction(_options)) {
      args = callback;
      callback = _options;
      _options = {};
    }
    callback && Aldu.Event.one(_plugin, callback, args);
    if (Aldu.CDN.plugins[_plugin].status === 'loaded') {
      Aldu.log('Aldu.CDN.require: ' + _plugin + ' is already loaded', 4);
      Aldu.Event.trigger(_plugin);
      return true;
    }
    if (Aldu.CDN.plugins[_plugin].status === 'loading') {
      Aldu.log('Aldu.CDN.require: ' + _plugin + ' is loading', 4);
      return true;
    }
    Aldu.CDN.plugins[_plugin].status = 'loading';
    var plugin = Aldu.extend({
      name : _plugin,
      version : Aldu.CDN.defaults.version,
      host : Aldu.CDN.defaults.host,
      path : '/' + _plugin + '/',
      js : [ _plugin + '.min.js' ],
      css : [],
      depends : [],
      preload : null,
      load : Aldu.CDN._load,
      options : {}
    }, Aldu.CDN.plugins[_plugin]);
    var options = Aldu.extend({
      version : plugin.version
    }, _options);
    if (Aldu.CDN.defaults.force) {
      plugin.host = Aldu.CDN.defaults.host;
    }
    plugin.prefix = 'http://' + plugin.host + plugin.path + options.version + '/';
    for ( var i in plugin.js) {
      plugin.js[i] = plugin.prefix + plugin.js[i];
    }
    for ( var i in plugin.css) {
      plugin.css[i] = plugin.prefix + plugin.css[i];
    }
    Aldu.chain(Aldu.load, plugin.css);
    if (plugin.preload) {
      plugin.preload(plugin, options);
    }
    if (plugin.depends.length) {
      Aldu.chain(Aldu.CDN.require, plugin.depends, Aldu.chain, [ Aldu.load,
          plugin.js, plugin.load, [ plugin, options ] ]);
    }
    else {
      Aldu.chain(Aldu.load, plugin.js, plugin.load, [ plugin, options ]);
    }
  },
  isLoaded : function(plugin) {
    if (typeof Aldu.CDN.plugins[plugin] !== 'undefined') {
      return Aldu.CDN.plugins[plugin].status === 'loaded';
    }
    return false;
  }
};
