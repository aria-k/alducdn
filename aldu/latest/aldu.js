var Aldu = {
  verbosity : 1,
  Event : {
    _listeners : {},
    on : function(type, callback, args, target, one) {
      Aldu.log('Aldu.Event.on: ' + type, 4);
      var listener = {
        target : target ? target : this,
        callback : callback,
        arguments : args ? args : []
      };
      if (one === 1) {
        var _callback = listener.callback;
        listener.callback = function(event) {
          Aldu.Event.off(type, listener.callback, listener.target);
          return _callback.apply(this, arguments);
        };
      }
      if (typeof this._listeners[type] === "undefined") {
        this._listeners[type] = [];
      }
      this._listeners[type].push(listener);
    },
    one : function(type, callback, args, target) {
      return this.on(type, callback, args, target, 1);
    },
    trigger : function(event, target) {
      if (typeof event == "string") {
        event = {
          type : event,
          target : target ? target : this
        };
      }
      if (!event.type) {
        throw new Error("Event object missing 'type' property.");
      }
      Aldu.log('Aldu.Event.trigger: ' + event.type, 4);
      if (this._listeners[event.type] instanceof Array) {
        var listeners = [];
        Aldu.each(this._listeners[event.type], function(i, listener) {
          listeners.push(Aldu.extend({}, listener));
        });
        for ( var i = 0, len = listeners.length; i < len; i++) {
          if (listeners[i].target === event.target) {
            var args = listeners[i].arguments;
            args.push(event);
            listeners[i].callback.apply(this, args);
          }
        }
      }
    },
    off : function(type, callback, target) {
      Aldu.log('Aldu.Event.off: ' + type, 4);
      if (this._listeners[type] instanceof Array) {
        var listeners = this._listeners[type];
        for ( var i = 0, len = listeners.length; i < len; i++) {
          if (listeners[i].callback === callback && listeners[i].target === target) {
            listeners.splice(i, 1);
            break;
          }
        }
      }
    }
  },
  log : function(message, level) {
    level = typeof level !== 'undefined' ? level : 1;
    if (window.console && level <= Aldu.verbosity) {
      console.log(message);
    }
  },
  debug : function(message, level) {
    level = typeof level !== 'undefined' ? level : 1;
    if (window.console && level <= Aldu.verbosity) {
      console.debug(message);
    }
  },
  extend : function() {
    var options, name = '', src, copy, copyIsArray = false, clone, target = arguments[0]
        || {}, i = 1, length = arguments.length, deep = false;
    // Handle a deep copy situation
    if (typeof target === "boolean") {
      deep = target;
      target = arguments[1] || {};
      // skip the boolean and the target
      i = 2;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && typeof target !== "function") {
      target = {};
    }
    if (length === i) {
      target = this;
      --i;
    }
    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) != null) {
        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];
          // Prevent never-ending loop
          if (target === copy) {
            continue;
          }
          // Recurse if we're merging plain objects or arrays
          if (deep && copy
              && (Aldu.isObject(copy) || (copyIsArray = Aldu.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && typeof src === 'array' ? src : [];
            }
            else {
              clone = src && typeof src === 'object' ? src : {};
            }
            // Never move original objects, clone them
            target[name] = Aldu.extend(deep, clone, copy);
            // Don't bring in undefined values
          }
          else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    // Return the modified object
    return target;
  },
  each : function(object, callback, args) {
    var name = '', i = 0, length = object.length, isObj = length === undefined
        || Aldu.isFunction(object);
    if (args) {
      if (isObj) {
        for (name in object) {
          if (callback.apply(object[name], args) === false) {
            break;
          }
        }
      }
      else {
        for (; i < length;) {
          if (callback.apply(object[i++], args) === false) {
            break;
          }
        }
      }
      // A special, fast, case for the most common use of each
    }
    else {
      if (isObj) {
        for (name in object) {
          if (callback.call(object[name], name, object[name]) === false) {
            break;
          }
        }
      }
      else {
        for (; i < length;) {
          if (callback.call(object[i], i, object[i++]) === false) {
            break;
          }
        }
      }
    }
    return object;
  },
  _loaded : false,
  ready : function(callback) {
    Aldu.Event.one('ready', callback);
    if ( Aldu._loaded || document.readyState === "complete" ) {
      // Handle it asynchronously to allow scripts the opportunity to delay ready
      return Aldu.Event.trigger('ready');
    }
    if ( document.addEventListener ) {
      DOMContentLoaded = function() {
        document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
        Aldu.Event.trigger('ready');
      };

    } else if ( document.attachEvent ) {
      DOMContentLoaded = function() {
        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
        if ( document.readyState === "complete" ) {
          document.detachEvent( "onreadystatechange", DOMContentLoaded );
          Aldu.Event.trigger('ready');
        }
      };
    }
    // Mozilla, Opera and webkit nightlies currently support this event
    if ( document.addEventListener ) {
      // Use the handy event callback
      document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

      // A fallback to window.onload, that will always work
      window.addEventListener( "load", function() {
        Aldu.Event.trigger('ready');
      }, false );

    // If IE event model is used
    } else if ( document.attachEvent ) {
      // ensure firing before onload,
      // maybe late but safe also for iframes
      document.attachEvent( "onreadystatechange", DOMContentLoaded );

      // A fallback to window.onload, that will always work
      window.attachEvent( "onload", function() {
        Aldu.Event.trigger('ready');
      } );
    }
  },
  isBoolean : function(_var) {
    return typeof _var === 'boolean';
  },
  isArray : function(_var) {
    return typeof _var === 'array';
  },
  isFunction : function(_var) {
    return typeof _var === 'function';
  },
  isObject : function(_var) {
    return typeof _var === 'object';
  },
  inArray : function(obj, a) {
    var i = a.length;
    while (i--) {
      if (a[i] === obj) {
        return true;
      }
    }
    return false;
  },
  load : function(url, callback, args) {
    Aldu.log('Aldu.load: ' + url, 4);
    if (url.match(/\.css$/)) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      Aldu.Event.one('load', callback, args, link);
      if (callback) {
        link.onload = link.onreadystatechange = function(_event) {
          var event = Aldu.extend({
            type : 'load',
            target : this
          }, _event);
          if (event.target.readyState) {
            if (event.target.readyState === 'loaded'
                || event.target.readyState === 'complete') {
              Aldu.Event.trigger(event.type, event.target);
            }
            return;
          }
          Aldu.Event.trigger(event.type, event.target);
        };
      }
      link.href = url;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    else {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      Aldu.Event.one('load', callback, args, script);
      if (callback) {
        script.onload = script.onreadystatechange = function(_event) {
          var event = Aldu.extend({
            type : 'load',
            target : this
          }, _event);
          if (event.target.readyState) {
            if (event.target.readyState === 'loaded' ||
                event.target.readyState === 'complete') {
              event.target.onreadystatechange = null;
              Aldu.Event.trigger(event.type, event.target);
            }
            return;
          }
          Aldu.Event.trigger(event.type, event.target);
        };
      }
      script.src = url;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  },
  /**
   * Chain "action" on "array"'s elements, calling "callback" afterwards,
   * optionally passing "args" as arguments. "action" must be a function
   * accepting an "array"'s element as the first argument and a callback
   * function as the second argument.
   */
  chain : function(action, array, callback, args) {
    if (array.length) {
      action(array[0], function(_action, _array, _callback, _args) {
        Aldu.chain(_action, _array.slice(1), _callback, _args);
      }, [ action, array, callback, args ]);
    }
    else {
      callback && callback.apply(this, args ? args : []);
    }
  },
  CDN : {
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
        version : '',
        host : 'cdn.aldu.net',
        path : '',
        js : [],
        css : [],
        depends : [],
        preload : null,
        load : Aldu.CDN._load,
        options : {}
      }, Aldu.CDN.plugins[_plugin]);
      var options = Aldu.extend({
        version : plugin.version
      }, _options);
      plugin.prefix = '//' + plugin.host + plugin.path + options.version + '/';
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
    plugins : {
      'dojo' : {
        version : '1.6.1',
        host : 'ajax.googleapis.com',
        path : '/ajax/libs/dojo/',
        js : [ 'dojo/dojo.xd.js' ]
      },
      'ext-core' : {
        version : '3.1.0',
        host : 'ajax.googleapis.com',
        path : '/ajax/libs/ext-core/',
        js : [ 'ext-core.js' ]
      },
      'mootools' : {
        version : '1.4.1',
        host : 'ajax.googleapis.com',
        path : '/ajax/libs/mootools/',
        js : [ 'mootools-yui-compressed.js' ]
      },
      'prototype' : {
        version : '1.7.0.0',
        host : 'ajax.googleapis.com',
        path : '/ajax/libs/prototype/',
        js : [ 'prototype.js' ]
      },
      'scriptaculous' : {
        depends : [ 'prototype' ],
        version : '1.9.0',
        host : 'ajax.googleapis.com',
        path : '/ajax/libs/scriptaculous/',
        js : [ 'scriptaculous.js' ]
      },
      'jquery' : {
        version : '1.7.1',
        host : 'ajax.googleapis.com',
        path : '/ajax/libs/jquery/',
        js : [ 'jquery.min.js' ]
      },
      'jquery.ui' : {
        depends : [ 'jquery' ],
        version : '1.8.17',
        host : 'ajax.googleapis.com',
        path : '/ajax/libs/jqueryui/',
        js : [ 'jquery-ui.min.js' ],
        options : {
          themes : {
            'base' : 'themes/base/jquery-ui.css',
            'black-tie' : 'themes/black-tie/jquery-ui.css',
            'blitzer' : 'themes/blitzer/jquery-ui.css',
            'cupertino' : 'themes/cupertino/jquery-ui.css',
            'dark-hive' : 'themes/dark-hive/jquery-ui.css',
            'dot-luv' : 'themes/dot-luv/jquery-ui.css',
            'eggplant' : 'themes/eggplant/jquery-ui.css',
            'excite-bike' : 'themes/excite-bike/jquery-ui.css',
            'flick' : 'themes/flick/jquery-ui.css',
            'hot-sneaks' : 'themes/hot-sneaks/jquery-ui.css',
            'humanity' : 'themes/humanity/jquery-ui.css',
            'le-frog' : 'themes/le-frog/jquery-ui.css',
            'mint-choc' : 'themes/mint-choc/jquery-ui.css',
            'overcast' : 'themes/overcast/jquery-ui.css',
            'pepper-grinder' : 'themes/pepper-grinder/jquery-ui.css',
            'redmond' : 'themes/redmond/jquery-ui.css',
            'smoothness' : 'themes/smoothness/jquery-ui.css',
            'south-street' : 'themes/south-street/jquery-ui.css',
            'start' : 'themes/start/jquery-ui.css',
            'sunny' : 'themes/sunny/jquery-ui.css',
            'swanky-purse' : 'themes/swanky-purse/jquery-ui.css',
            'trontastic' : 'themes/trontastic/jquery-ui.css',
            'ui-darkness' : 'themes/ui-darkness/jquery-ui.css',
            'ui-lightness' : 'themes/ui-lightness/jquery-ui.css',
            'vader' : 'themes/vader/jquery-ui.css'
          }
        },
        load : function(plugin, _options) {
          var options = Aldu.extend({
            theme : 'base'
          }, _options);
          if (options.theme) {
            if (typeof plugin.options.themes[options.theme] === 'undefined')
              return false;
            var theme = plugin.options.themes[options.theme];
            Aldu.load(plugin.prefix + theme);
          }
          Aldu.CDN._load(plugin, options);
        }
      },
      'jquery.mobile' : {
        depends : [ 'jquery' ],
        version : '1.0',
        host : 'code.jquery.com',
        path : '/mobile/',
        css : [ 'jquery.mobile-1.0.min.css' ],
        js : [ 'jquery.mobile-1.0.min.js' ]
      },
      'jquery.mobile.datebox' : {
        depends : [ 'jquery.mobile' ],
        version : [ 'latest' ],
        host : 'dev.jtsage.com',
        path : '/cdn/datebox/',
        css : [ 'jquery.mobile.datebox.min.css' ],
        js : [ 'jquery.mobile.datebox.min.js' ]
      },
      'jquery.tools' : {
        depends : [ 'jquery' ],
        version : '1.2.6',
        host : 'cdn.jquerytools.org',
        path : '/',
        js : [ 'all/jquery.tools.min.js' ]
      },
      'aldu.jquery' : {
        depends : [ 'jquery' ],
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/aldu/',
        js : [ 'aldu.jquery.js' ]
      },
      'aldu.ui' : {
        depends : [ 'jquery', 'jquery.ui' ],
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/aldu/',
        css : [ 'aldu.ui.css' ],
        js : [ 'aldu.ui.js' ]
      },
      'google' : {
        version : '',
        host : 'www.google.com',
        path : '',
        js : [ 'jsapi' ]
      },
      'google.chrome-frame' : {
        depends : [ 'google' ],
        version : '1.0.2',
        load : function(plugin, _options) {
          var options = Aldu.extend({}, _options);
          google.load('chrome-frame', plugin.version, {
            'callback' : function() {
              Aldu.CDN._load(plugin, options);
            }
          });
        }
      },
      'google.maps' : {
        depends : [ 'google' ],
        version : '3',
        load : function(plugin, _options) {
          var options = Aldu.extend({
            sensor : true
          }, _options);
          google.load('maps', plugin.version, {
            'other_params' : 'sensor=' + (options.sensor ? 'true' : 'false'),
            'callback' : function() {
              Aldu.CDN._load(plugin, options);
            }
          });
        }
      },
      'google.analytics' : {
        load : function(plugin, _options) {
          var options = Aldu.extend({
            account : '',
            domainName : 'none',
            allowLinker : true
          }, _options);
          var _gaq = [];
          _gaq.push([ '_setAccount', options.account ]);
          _gaq.push([ '_setDomainName', options.domainName ]);
          _gaq.push([ '_setAllowLinker', options.allowLinker ]);
          _gaq.push([ '_trackPageview' ]);
          (function() {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl'
                : 'http://www')
                + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ga, s);
            Aldu.CDN._load(plugin, options);
          })();
        }
      },
      'google.plus' : {
        host : 'apis.google.com',
        js : [ 'js/plusone.js' ],
        options : {
          parsetage : 'onload'
        },
        preload : function(plugin, _options) {
          var options = Aldu.extend(plugin.options, _options);
          window.___gcfg = {
            //lang : 'en-US',
            parsetags : options.parsetag
          };
        }
      },
      'twitter' : {
        host : 'platform.twitter.com',
        path : '/',
        js : [ 'widgets.js' ]
      },
      'facebook' : {
        load : function(plugin, _options) {
          var options = Aldu.extend({
            appId : '',
            channelURL : '//' + location.hostname + '/channel.html',
            status : true,
            cookie : true,
            oauth : true,
            xfbml : true
          }, _options);
          window.fbAsyncInit = function() {
            FB.init(options);
            Aldu.CDN._load(plugin, options);
          };
          $('<div>').prop('id', 'fb-root').appendTo('body');
          (function(d){
            var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
            js = d.createElement('script'); js.id = id; js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            d.getElementsByTagName('head')[0].appendChild(js);
          }(document));
        }
      },
      'jquery.gmap' : {
        depends : [ 'jquery', 'google.maps' ],
        version : '3.0-beta',
        host : 'cdn.aldu.net',
        path : '/jquery.gmap/',
        js : [ 'jquery.gmap.min.js', 'jquery.gmap.ext.js' ]
      },
      'jquery.imgload' : {
        depends : [ 'jquery' ],
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/jquery.imgload/',
        js : [ 'jquery.imgload.js' ]
      },
      'jquery.formutils' : {
        depends : [ 'jquery' ],
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/jquery.formutils/',
        js : [ 'jquery.formutils.js' ]
      },
      'jquery.cycle' : {
        depends : [ 'jquery' ],
        version : '',
        host : 'malsup.github.com',
        path : '',
        js : [ 'jquery.cycle.all.js' ]
      },
      'jquery.cyclelite' : {
        depends : [ 'jquery' ],
        version : '',
        host : 'malsup.github.com',
        path : '',
        js : [ 'jquery.cycle.lite.js' ]
      },
      'jquery.form' : {
        depends : [ 'jquery' ],
        version : '',
        host : 'malsup.github.com',
        path : '',
        js : [ 'jquery.form.js' ]
      },
      'jquery.blockUI' : {
        depends : [ 'jquery' ],
        version : '',
        host : 'malsup.github.com',
        path : '',
        js : [ 'jquery.blockUI.js' ],
        load : function(plugin, options) {
          Aldu.extend($.blockUI.defaults, options);
          Aldu.CDN._load(plugin, options);
        }
      },
      'jquery.corner' : {
        depends : [ 'jquery' ],
        version : '',
        host : 'malsup.github.com',
        path : '',
        js : [ 'jquery.corner.js' ]
      },
      'jquery.taconite' : {
        depends : [ 'jquery' ],
        version : '',
        host : 'malsup.github.com',
        path : '',
        js : [ 'jquery.taconite.js' ]
      },
      'jquery.placeholder' : {
        depends : [ 'jquery' ],
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/jquery.placeholder/',
        js : [ 'jquery.placeholder.min.js' ]
      },
      'jquery.fancybox' : {
        depends : [ 'jquery' ],
        version : '2.0.4',
        host : 'cdn.aldu.net',
        path : '/jquery.fancybox/',
        css : [ 'jquery.fancybox.css' ],
        js : [ 'jquery.fancybox.js' ]
      },
      'jquery.datatables' : {
        depends : [ 'jquery' ],
        host : 'datatables.net',
        path : '/download/build',
        js : [ 'jquery.dataTables.nightly.js' ] 
      },
      'jquery.jeditable' : {
        host : 'www.appelsiini.net',
        path : '/download',
        js : [ 'jquery.jeditable.mini.js' ]
      },
      'mediaelement' : {
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/mediaelement/',
        css : [ 'mediaelementplayer.css' ],
        js : [ 'mediaelement-and-player.min.js' ]
      },
      'codemirror' : {
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/codemirror/',
        css : [ 'lib/codemirror.css' ],
        js : [ 'lib/codemirror.js' ],
        options : {
          modes : {
            'clike' : {
              js : [ 'mode/clike/clike.js' ]
            },
            'clojure' : {
              js : [ 'mode/clojure/clojure.js' ]
            },
            'coffeescript' : {
              js : [ 'mode/coffeescript/coffescript.js' ]
            },
            'css' : {
              js : [ 'mode/css/css.js' ]
            },
            'diff' : {
              css : [ 'mode/diff/diff.css' ],
              js : [ 'mode/diff/diff.js' ]
            },
            'gfm' : {
              js : [ 'mode/gfm/gfm.js' ]
            },
            'groovy' : {
              js : [ 'mode/groovy/groovy.js' ]
            },
            'haskell' : {
              js : [ 'mode/haskell/haskell.js' ]
            },
            'htmlembedded' : {
              js : [ 'mode/htmlembedded/htmlembedded.js' ]
            },
            'htmlmixed' : {
              depends : [ 'xml', 'javascript', 'css' ],
              js : [ 'mode/htmlmixed/htmlmixed.js' ]
            },
            'javascript' : {
              js : [ 'mode/javascript/javascript.js' ]
            },
            'jinja2' : {
              js : [ 'mode/jinja2/jinja2.js' ]
            },
            'lua' : {
              js : [ 'mode/lua/lua.js' ]
            },
            'markdown' : {
              js : [ 'mode/markdown/markdown.js' ]
            },
            'ntriples' : {
              js : [ 'mode/ntriples/ntriples.js' ]
            },
            'pascal' : {
              js : [ 'mode/pascal/pascal.js' ]
            },
            'perl' : {
              js : [ 'mode/perl/perl.js' ]
            },
            'php' : {
              depends : [ 'htmlmixed', 'clike' ],
              js : [ 'mode/php/php.js' ]
            },
            'plsql' : {
              js : [ 'mode/plsql/plsql.js' ]
            },
            'python' : {
              js : [ 'mode/python/python.js' ]
            },
            'r' : {
              js : [ 'mode/r/r.js' ]
            },
            'rpm' : {
              js : [ 'mode/rpm/rpm.js' ]
            },
            'rst' : {
              js : [ 'mode/rst/rst.js' ]
            },
            'ruby' : {
              js : [ 'mode/ruby/ruby.js' ]
            },
            'rust' : {
              js : [ 'mode/rust/rust.js' ]
            },
            'scheme' : {
              js : [ 'mode/scheme/scheme.js' ]
            },
            'smalltalk' : {
              js : [ 'mode/smalltalk/smalltalk.js' ]
            },
            'sparql' : {
              js : [ 'mode/sparql/sparql.js' ]
            },
            'stex' : {
              js : [ 'mode/stex/stex.js' ]
            },
            'tiddlywiki' : {
              css : [ 'mode/tiddlywiki/tiddlywiki.css' ],
              js : [ 'mode/tiddlywiki/tiddlywiki.js' ]
            },
            'velocity' : {
              js : [ 'mode/velocity/velocity.js' ]
            },
            'xml' : {
              js : [ 'mode/xml/xml.js' ]
            },
            'xmlpure' : {
              js : [ 'mode/xmlpure/xmlpure.js' ]
            },
            'yaml' : {
              js : [ 'mode/yaml/yaml.js' ]
            }
          },
          themes : {
            'cobalt' : 'theme/cobalt.css',
            'eclipse' : 'theme/eclipse.css',
            'elegant' : 'theme/elegant.css',
            'monokai' : 'theme/monokai.css',
            'neat' : 'theme/neat.css',
            'night' : 'theme/night.css',
            'rubyblue' : 'theme/rubyblue.css'
          }
        },
        load : function(plugin, _options) {
          if (jQuery) {
            jQuery.fn.codemirror = function(_options) {
              var options = Aldu.extend({
                matchBrackets : true,
                lineNumbers : true,
                tabSize : 2,
                tabMode : 'indent'
              }, _options);
              return this.each(function() {
                CodeMirror.fromTextArea(this, options);
              });
            };
          }
          var options = Aldu.extend({
            modes : [],
            themes : []
          }, _options);
          var loadMode = function(v, callback, args) {
            Aldu.log('Aldu.CDN.plugin.codemirror.load: loading ' + v, 4);
            if (typeof plugin.options.modes[v] === 'undefined')
              return false;
            var mode = $.extend({
              depends : [],
              js : [],
              css : []
            }, plugin.options.modes[v]);
            for ( var i in mode.js) {
              mode.js[i] = plugin.prefix + mode.js[i];
            }
            for ( var i in mode.css) {
              mode.css[i] = plugin.prefix + mode.css[i];
            }
            if (mode.depends.length) {
              Aldu.chain(arguments.callee, mode.depends, Aldu.chain, [
                  Aldu.load, mode.js, callback, args ]);
            }
            else {
              Aldu.chain(Aldu.load, mode.js, callback, args);
            }
            Aldu.chain(Aldu.load, mode.css);
          };
          if (options.modes.length) {
            Aldu.chain(loadMode, options.modes, Aldu.CDN._load, [ plugin,
                options ]);
          }
          else {
            Aldu.CDN._load(plugin, options);
          }
          Aldu.each(options.themes, function(i, theme) {
            if (typeof plugin.options.themes[theme] === 'undefined')
              return;
            var path = plugin.options.themes[theme];
            Aldu.load(plugin.prefix + path);
          });
        }
      },
      'ckeditor' : {
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/ckeditor/',
        js : [ 'ckeditor.js' ],
        options : {
          adapters : {
            jquery : [ 'adapters/jquery.js' ]
          }
        },
        load : function(plugin, options) {
          if (jQuery) {
            Aldu.load(plugin.prefix + plugin.options.adapters['jquery'],
                function() {
                  Aldu.CDN._load(plugin, options);
                });
          }
        }
      }
    }
  },
  init : function(plugins, callback) {
    if (document.addEventListener) {
      document.addEventListener( "DOMContentLoaded", function() {
        Aldu._loaded = true;
      }, false );
    }
    Aldu.chain(Aldu.CDN.require, plugins, callback);
  },
  color : function() {
    var colors = [ 'red', 'orange', 'yellow', 'magenta', 'green', 'blue',
        'indigo', 'violet', 'lime', 'cyan' ];
    $('div,section,article,nav,aside').each(function(i) {
      $(this).css('border', '1px solid ' + colors[i % 10]);
    });
  }
};
