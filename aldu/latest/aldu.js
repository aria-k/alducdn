var Aldu = {
  verbosity : 1,
  IE : {
    init : function() {
      // Production steps of ECMA-262, Edition 5, 15.4.4.19
      // Reference: http://es5.github.com/#x15.4.4.19
      if (!Array.prototype.map) {
        Array.prototype.map = function(callback, thisArg) {

          var T, A, k;

          if (this == null) {
            throw new TypeError(" this is null or not defined");
          }

          // 1. Let O be the result of calling ToObject passing the |this| value
          // as the argument.
          var O = Object(this);

          // 2. Let lenValue be the result of calling the Get internal method of
          // O with the argument "length".
          // 3. Let len be ToUint32(lenValue).
          var len = O.length >>> 0;

          // 4. If IsCallable(callback) is false, throw a TypeError exception.
          // See: http://es5.github.com/#x9.11
          if ({}.toString.call(callback) != "[object Function]") {
            throw new TypeError(callback + " is not a function");
          }

          // 5. If thisArg was supplied, let T be thisArg; else let T be
          // undefined.
          if (thisArg) {
            T = thisArg;
          }

          // 6. Let A be a new array created as if by the expression new
          // Array(len) where Array is
          // the standard built-in constructor with that name and len is the
          // value of len.
          A = new Array(len);

          // 7. Let k be 0
          k = 0;

          // 8. Repeat, while k < len
          while (k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            // This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal
            // method of O with argument Pk.
            // This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

              // i. Let kValue be the result of calling the Get internal method
              // of O with argument Pk.
              kValue = O[k];

              // ii. Let mappedValue be the result of calling the Call internal
              // method of callback
              // with T as the this value and argument list containing kValue,
              // k, and O.
              mappedValue = callback.call(T, kValue, k, O);

              // iii. Call the DefineOwnProperty internal method of A with
              // arguments
              // Pk, Property Descriptor {Value: mappedValue, Writable: true,
              // Enumerable: true, Configurable: true},
              // and false.

              // In browsers that support Object.defineProperty, use the
              // following:
              // Object.defineProperty(A, Pk, { value: mappedValue, writable:
              // true, enumerable: true, configurable: true });

              // For best browser support, use the following:
              A[k] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
          }

          // 9. return A
          return A;
        };
      }
    }
  },
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
          if (listeners[i].callback === callback
              && listeners[i].target === target) {
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
    if (Aldu._loaded || document.readyState === "complete") {
      // Handle it asynchronously to allow scripts the opportunity to delay
      // ready
      return Aldu.Event.trigger('ready');
    }
    if (document.addEventListener) {
      DOMContentLoaded = function() {
        document.removeEventListener("DOMContentLoaded", DOMContentLoaded,
            false);
        Aldu.Event.trigger('ready');
      };

    }
    else if (document.attachEvent) {
      DOMContentLoaded = function() {
        // Make sure body exists, at least, in case IE gets a little overzealous
        // (ticket #5443).
        if (document.readyState === "complete") {
          document.detachEvent("onreadystatechange", DOMContentLoaded);
          Aldu.Event.trigger('ready');
        }
      };
    }
    // Mozilla, Opera and webkit nightlies currently support this event
    if (document.addEventListener) {
      // Use the handy event callback
      document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

      // A fallback to window.onload, that will always work
      window.addEventListener("load", function() {
        Aldu.Event.trigger('ready');
      }, false);

      // If IE event model is used
    }
    else if (document.attachEvent) {
      // ensure firing before onload,
      // maybe late but safe also for iframes
      document.attachEvent("onreadystatechange", DOMContentLoaded);

      // A fallback to window.onload, that will always work
      window.attachEvent("onload", function() {
        Aldu.Event.trigger('ready');
      });
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
  escape : function(s) {
    return s.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|\\])/g, '\\$1');
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
            if (event.target.readyState === 'loaded'
                || event.target.readyState === 'complete') {
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
        version : '1.2.7',
        host : 'cdn.aldu.net',
        path : '/jquery.tools/',
        js : [ 'jquery.tools.min.js' ]
      },
      'aldu.jquery' : {
        depends : [ 'jquery' ],
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/aldu/',
        js : [ 'aldu.jquery.min.js' ]
      },
      'aldu.ui' : {
        depends : [ 'aldu.jquery', 'jquery.ui' ],
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/aldu/',
        css : [ 'aldu.ui.min.css' ],
        js : [ 'aldu.ui.min.js' ],
        load : function(plugin, options) {
          Aldu.UI.init();
          Aldu.CDN._load(plugin, options);
        }
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
        options : {
          account : '',
          domainName : 'none',
          allowLinker : true
        },
        load : function(plugin, _options) {
          var options = Aldu.extend(plugin.options, _options);
          window._gaq = [];
          window._gaq.push([ '_setAccount', options.account ]);
          window._gaq.push([ '_setDomainName', options.domainName ]);
          window._gaq.push([ '_setAllowLinker', options.allowLinker ]);
          window._gaq.push([ '_trackPageview' ]);
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
            // lang : 'en-US',
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
        options : {
          appId : '',
          channelURL : '//' + location.hostname + '/channel.html',
          status : true,
          cookie : true,
          oauth : true,
          xfbml : true
        },
        load : function(plugin, _options) {
          var options = Aldu.extend(plugin.options, _options);
          window.fbAsyncInit = function() {
            FB.init(options);
            Aldu.CDN._load(plugin, options);
          };
          $('<div>').prop('id', 'fb-root').appendTo('body');
          (function(d) {
            var js, id = 'facebook-jssdk';
            if (d.getElementById(id)) {
              return;
            }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            d.getElementsByTagName('head')[0].appendChild(js);
          }(document));
        }
      },
      'google.maps.markerclusterer' : {
        depends : [ 'google.maps' ],
        version : '2.0.6',
        host : 'cdn.aldu.net',
        path : '/google.maps.markerclusterer/',
        js : [ 'markerclusterer.min.js' ]
      },
      'google.maps.markerwithlabel' : {
        depends : [ 'google.maps' ],
        version : '1.1.5',
        host : 'cdn.aldu.net',
        path : '/google.maps.markerwithlabel/',
        js : [ 'markerwithlabel.min.js' ]
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
        js : [ 'jquery.imgload.min.js' ]
      },
      'jquery.formutils' : {
        depends : [ 'jquery' ],
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/jquery.formutils/',
        js : [ 'jquery.formutils.min.js' ]
      },
      'jquery.jloupe' : {
        depends : [ 'jquery' ],
        version : '1.3.2',
        host : 'cdn.aldu.net',
        path : '/jquery.jloupe/',
        js : [ 'jquery.jloupe.min.js' ]
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
        js : [ 'jquery.fancybox.pack.js' ]
      },
      'jquery.datatables' : {
        depends : [ 'jquery' ],
        version : '1.9.0',
        host : 'ajax.aspnetcdn.com',
        path : '/ajax/jquery.dataTables/',
        js : [ 'jquery.dataTables.min.js' ],
        extras : {
          rowreordering : {
            host : 'cdn.aldu.net',
            path : '/jquery.datatables/extras/rowreordering/',
            version : [ '1.0.0' ],
            js : [ '/jquery.dataTables.rowReordering.min.js' ]
          },
          tabletools : {
            host : 'cdn.aldu.net',
            path : '/jquery.datatables/extras/tabletools/',
            version : [ '2.0.3' ],
            js : [ '/js/TableTools.min.js' ],
            css : [ '/css/TableTools.css' ],
            swf : [ '/swf/copy_csv_xls_pdf.swf' ],
            callback : function(extra, callback, args) {
              TableTools.DEFAULTS.sSwfPath = '//' + extra.host + extra.path
                  + extra.version + extra.swf[0];
              callback.apply(extra, args);
            }
          }
        },
        load : function(plugin, options) {
          $.fn.dataTableExt.oApi.fnAddDataAndDisplay = function(oSettings,
              aData) {
            /* Add the data */
            var iAdded = this.oApi._fnAddData(oSettings, aData);
            var nAdded = oSettings.aoData[iAdded].nTr;

            /*
             * Need to re-filter and re-sort the table to get positioning
             * correct, not perfect as this will actually redraw the table on
             * screen, but the update should be so fast (and possibly not alter
             * what is already on display) that the user will not notice
             */
            this.oApi._fnReDraw(oSettings);

            /* Find it's position in the table */
            var iPos = -1;
            for ( var i = 0, iLen = oSettings.aiDisplay.length; i < iLen; i++) {
              if (oSettings.aoData[oSettings.aiDisplay[i]].nTr == nAdded) {
                iPos = i;
                break;
              }
            }

            /* Get starting point, taking account of paging */
            if (iPos >= 0) {
              oSettings._iDisplayStart = (Math.floor(i
                  / oSettings._iDisplayLength))
                  * oSettings._iDisplayLength;
              this.oApi._fnCalculateEnd(oSettings);
            }

            this.oApi._fnDraw(oSettings);
            return {
              "nTr" : nAdded,
              "iPos" : iAdded
            };
          };
          $.fn.dataTableExt.oApi.fnGetFilteredNodes = function(oSettings) {
            var anRows = [];
            for ( var i = 0, iLen = oSettings.aiDisplay.length; i < iLen; i++) {
              var nRow = oSettings.aoData[oSettings.aiDisplay[i]].nTr;
              anRows.push(nRow);
            }
            return anRows;
          };
          $.fn.dataTableExt.oApi.fnAddTr = function(oSettings, nTr, bRedraw) {
            if (typeof bRedraw == 'undefined') {
              bRedraw = true;
            }

            var nTds = nTr.getElementsByTagName('td');
            if (nTds.length != oSettings.aoColumns.length) {
              alert('Warning: not adding new TR - columns and TD elements must match');
              return;
            }

            var aData = [];
            for ( var i = 0; i < nTds.length; i++) {
              aData.push(nTds[i].innerHTML);
            }

            /* Add the data and then replace DataTable's generated TR with ours */
            var iIndex = this.oApi._fnAddData(oSettings, aData);
            nTr._DT_RowIndex = iIndex;
            oSettings.aoData[iIndex].nTr = nTr;

            oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

            if (bRedraw) {
              this.oApi._fnReDraw(oSettings);
            }
          };
          $.fn.dataTableExt.oApi.fnGetHiddenNodes = function(oSettings) {
            /*
             * Note the use of a DataTables 'private' function thought the
             * 'oApi' object
             */
            var anNodes = this.oApi._fnGetTrNodes(oSettings);
            var anDisplay = $('tbody tr', oSettings.nTable);

            /* Remove nodes which are being displayed */
            for ( var i = 0; i < anDisplay.length; i++) {
              var iIndex = jQuery.inArray(anDisplay[i], anNodes);
              if (iIndex != -1) {
                anNodes.splice(iIndex, 1);
              }
            }

            /* Fire back the array to the caller */
            return anNodes;
          };
          $.fn.dataTableExt.afnSortData['dom-text'] = function(oSettings,
              iColumn) {
            var aData = [];
            $('td:eq(' + iColumn + ') input:text',
                oSettings.oApi._fnGetTrNodes(oSettings)).each(function() {
              aData.push(this.value);
            });
            return aData;
          };
          $.fn.dataTableExt.afnSortData['dom-select'] = function(oSettings,
              iColumn) {
            var aData = [];
            $('td:eq(' + iColumn + ') select',
                oSettings.oApi._fnGetTrNodes(oSettings)).each(function() {
              aData.push($(this).val());
            });
            return aData;
          };
          $.fn.dataTableExt.afnSortData['dom-checkbox'] = function(oSettings,
              iColumn) {
            var aData = [];
            $('td:eq(' + iColumn + ') input',
                oSettings.oApi._fnGetTrNodes(oSettings)).filter(
                ':radio, :checkbox').each(function() {
              aData.push(this.checked === true ? "1" : "0");
            });
            return aData;
          };
          $.fn.dataTableExt.oPagination.links = {
            fnInit : function(oSettings, nPaging, fnCallbackDraw) {
              var nFirst = document.createElement('button');
              var nPrevious = document.createElement('button');
              var nList = document.createElement('span');
              var nNext = document.createElement('button');
              var nLast = document.createElement('button');

              nFirst.innerHTML = oSettings.oLanguage.oPaginate.sFirst;
              nPrevious.innerHTML = oSettings.oLanguage.oPaginate.sPrevious;
              nNext.innerHTML = oSettings.oLanguage.oPaginate.sNext;
              nLast.innerHTML = oSettings.oLanguage.oPaginate.sLast;

              var oClasses = oSettings.oClasses;
              nFirst.className = oClasses.sPageButton + " "
                  + oClasses.sPageFirst;
              nPrevious.className = oClasses.sPageButton + " "
                  + oClasses.sPagePrevious;
              nNext.className = oClasses.sPageButton + " " + oClasses.sPageNext;
              nLast.className = oClasses.sPageButton + " " + oClasses.sPageLast;

              nPaging.appendChild(nFirst);
              nPaging.appendChild(nPrevious);
              nPaging.appendChild(nList);
              nPaging.appendChild(nNext);
              nPaging.appendChild(nLast);

              $(nFirst).bind('click.DT', function() {
                if (oSettings.oApi._fnPageChange(oSettings, "first")) {
                  fnCallbackDraw(oSettings);
                }
              });

              $(nPrevious).bind('click.DT', function() {
                if (oSettings.oApi._fnPageChange(oSettings, "previous")) {
                  fnCallbackDraw(oSettings);
                }
              });

              $(nNext).bind('click.DT', function() {
                if (oSettings.oApi._fnPageChange(oSettings, "next")) {
                  fnCallbackDraw(oSettings);
                }
              });

              $(nLast).bind('click.DT', function() {
                if (oSettings.oApi._fnPageChange(oSettings, "last")) {
                  fnCallbackDraw(oSettings);
                }
              });

              /* Take the brutal approach to cancelling text selection */
              $('a', nPaging).bind('mousedown.DT', function() {
                return false;
              }).bind('selectstart.DT', function() {
                return false;
              });

              /* ID the first elements only */
              if (oSettings.sTableId !== ''
                  && typeof oSettings.aanFeatures.p == "undefined") {
                nPaging.setAttribute('id', oSettings.sTableId + '_paginate');
                nFirst.setAttribute('id', oSettings.sTableId + '_first');
                nPrevious.setAttribute('id', oSettings.sTableId + '_previous');
                nNext.setAttribute('id', oSettings.sTableId + '_next');
                nLast.setAttribute('id', oSettings.sTableId + '_last');
              }
            },

            fnUpdate : function(oSettings, fnCallbackDraw) {
              if (!oSettings.aanFeatures.p) {
                return;
              }

              var iPageCount = $.fn.dataTableExt.oPagination.iFullNumbersShowPages;
              var iPageCountHalf = Math.floor(iPageCount / 2);
              var iPages = Math.ceil((oSettings.fnRecordsDisplay())
                  / oSettings._iDisplayLength);
              var iCurrentPage = Math.ceil(oSettings._iDisplayStart
                  / oSettings._iDisplayLength) + 1;
              var sList = "";
              var iStartButton, iEndButton, i, iLen;
              var oClasses = oSettings.oClasses;

              /* Pages calculation */
              if (iPages < iPageCount) {
                iStartButton = 1;
                iEndButton = iPages;
              }
              else {
                if (iCurrentPage <= iPageCountHalf) {
                  iStartButton = 1;
                  iEndButton = iPageCount;
                }
                else {
                  if (iCurrentPage >= (iPages - iPageCountHalf)) {
                    iStartButton = iPages - iPageCount + 1;
                    iEndButton = iPages;
                  }
                  else {
                    iStartButton = iCurrentPage - Math.ceil(iPageCount / 2) + 1;
                    iEndButton = iStartButton + iPageCount - 1;
                  }
                }
              }

              /* Build the dynamic list */
              for (i = iStartButton; i <= iEndButton; i++) {
                if (iCurrentPage != i) {
                  sList += '<button class="' + oClasses.sPageButton + '">' + i
                      + '</button>';
                }
                else {
                  sList += '<button disabled="disabled" class="'
                      + oClasses.sPageButtonActive + '">' + i + '</button>';
                }
              }

              /* Loop over each instance of the pager */
              var an = oSettings.aanFeatures.p;
              var anButtons, anStatic, nPaginateList;
              var fnClick = function(e) {
                /*
                 * Use the information in the element to jump to the required
                 * page
                 */
                var iTarget = (this.innerHTML * 1) - 1;
                oSettings._iDisplayStart = iTarget * oSettings._iDisplayLength;
                fnCallbackDraw(oSettings);
                e.preventDefault();
              };
              var fnFalse = function() {
                return false;
              };

              for (i = 0, iLen = an.length; i < iLen; i++) {
                if (an[i].childNodes.length === 0) {
                  continue;
                }

                /* Build up the dynamic list forst - html and listeners */
                var qjPaginateList = $('span:eq(0)', an[i]);
                qjPaginateList.html(sList);
                $('button', qjPaginateList).bind('click.DT', fnClick).bind(
                    'mousedown.DT', fnFalse).bind('selectstart.DT', fnFalse);

                /* Update the 'premanent botton's classes */
                anButtons = an[i].getElementsByTagName('button');
                anStatic = [ anButtons[0], anButtons[1],
                    anButtons[anButtons.length - 2],
                    anButtons[anButtons.length - 1] ];
                $(anStatic).removeClass(
                    oClasses.sPageButton + " " + oClasses.sPageButtonActive
                        + " " + oClasses.sPageButtonStaticDisabled);
                if (iCurrentPage == 1) {
                  anStatic[0].disabled = true;
                  anStatic[1].disabled = true;
                  anStatic[0].className += " "
                      + oClasses.sPageButtonStaticDisabled;
                  anStatic[1].className += " "
                      + oClasses.sPageButtonStaticDisabled;
                }
                else {
                  anStatic[0].disabled = false;
                  anStatic[1].disabled = false;
                  anStatic[0].className += " " + oClasses.sPageButton;
                  anStatic[1].className += " " + oClasses.sPageButton;
                }

                if (iPages === 0 || iCurrentPage == iPages
                    || oSettings._iDisplayLength == -1) {
                  anStatic[2].disabled = true;
                  anStatic[3].disabled = true;
                  anStatic[2].className += " "
                      + oClasses.sPageButtonStaticDisabled;
                  anStatic[3].className += " "
                      + oClasses.sPageButtonStaticDisabled;
                }
                else {
                  anStatic[2].disabled = false;
                  anStatic[3].disabled = false;
                  anStatic[2].className += " " + oClasses.sPageButton;
                  anStatic[3].className += " " + oClasses.sPageButton;
                }
              }
            }
          };
          $.fn.dataTableExt.oApi.fnGetColumnData = function(oSettings, iColumn,
              bUnique, bFiltered, bIgnoreEmpty, bRecurse) {
            // check that we have a column id
            if (typeof iColumn == "undefined")
              return new Array();

            // by default we only wany unique data
            if (typeof bUnique == "undefined")
              bUnique = true;

            // by default we do want to only look at filtered data
            if (typeof bFiltered == "undefined")
              bFiltered = true;

            // by default we do not wany to include empty values
            if (typeof bIgnoreEmpty == "undefined")
              bIgnoreEmpty = true;

            if (typeof bRecurse == "undefined")
              bRecurse = false;

            // list of rows which we're going to loop through
            var aiRows;

            // use only filtered rows
            if (bFiltered == true)
              aiRows = oSettings.aiDisplay;
            // use all rows
            else
              aiRows = oSettings.aiDisplayMaster; // all row numbers

            // set up data array
            var asResultData = new Array();

            for ( var i = 0, c = aiRows.length; i < c; i++) {
              iRow = aiRows[i];
              var aData = this.fnGetData(iRow);
              var sValue = bRecurse ? $(aData[iColumn]).text() : aData[iColumn];

              // ignore empty values?
              if (bIgnoreEmpty == true && sValue.length == 0)
                continue;

              // ignore unique values?
              else if (bUnique == true
                  && jQuery.inArray(sValue, asResultData) > -1)
                continue;

              // else push the value onto the result data array
              else
                asResultData.push(sValue);
            }

            return asResultData;
          };
          var options = Aldu.extend({
            extras : []
          }, options);
          var loadExtra = function(v, callback, args) {
            Aldu.log('Aldu.CDN.plugin.datatables.load: loading ' + v, 4);
            if (typeof plugin.extras[v] === 'undefined')
              return false;
            var extra = $.extend({
              host : plugin.host,
              path : plugin.path + 'extras/' + v + '/',
              version : 'latest',
              js : [],
              css : [],
              callback : function(extra, callback, args) {
                callback.apply(extra, args);
              }
            }, plugin.extras[v]);
            for ( var i in extra.js) {
              extra.js[i] = '//' + extra.host + extra.path + extra.version
                  + extra.js[i];
            }
            for ( var i in extra.css) {
              extra.css[i] = '//' + extra.host + extra.path + extra.version
                  + extra.css[i];
            }
            Aldu.chain(Aldu.load, extra.js, extra.callback, [ extra, callback,
                args ]);
            Aldu.chain(Aldu.load, extra.css);
          };
          if (options.extras.length) {
            Aldu.chain(loadExtra, options.extras, Aldu.CDN._load, [ plugin,
                options ]);
          }
          else {
            Aldu.CDN._load(plugin, options);
          }
        }
      },
      'jquery.jeditable' : {
        host : 'www.appelsiini.net',
        path : '/download',
        js : [ 'jquery.jeditable.mini.js' ]
      },
      'jquery.cookies' : {
        host : 'cdn.aldu.net',
        version : '2.2.0',
        path : '/jquery.cookies/',
        js : [ 'jquery.cookies.min.js' ]
      },
      'jquery.minicolors' : {
        host : 'cdn.aldu.net',
        version : 'latest',
        path : '/jquery.minicolors/',
        js : [ 'jquery.miniColors.min.js' ]
      },
      'mediaelement' : {
        version : 'latest',
        host : 'cdn.aldu.net',
        path : '/mediaelement/',
        css : [ 'mediaelementplayer.css' ],
        js : [ 'mediaelement-and-player.js' ]
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
                mode : 'htmlmixed',
                lineNumbers : true,
                matchBrackets : true,
                extraKeys : {
                  'Tab' : function(cm) {
                    cm.indentLine(cm.getCursor().line);
                  },
                  'Ctrl-S' : function(cm) {
                    cm.save();
                    var form = cm.getTextArea().form;
                    $.ajax({
                      url : $(form).prop('action'),
                      type : $(form).prop('method'),
                      data : new FormData(form),
                      processData : false,
                      contentType : false,
                      success : function(data) {
                        alert('Success!');
                      },
                      error : function() {
                        alert('Error!');
                      }
                    });
                  }
                }
              }, _options);
              return this.each(function() {
                var instance = CodeMirror.fromTextArea(this, options);
                $(this).data('codemirror', instance);
                $(this).on('update.aldu', function() {
                  var cm = $(this).data('codemirror');
                  cm.save();
                });
              });
            };
          }
          var options = Aldu.extend({
            modes : [ 'htmlmixed' ],
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
        depends : [ 'codemirror' ],
        options : {
          adapters : {
            jquery : [ 'adapters/jquery.js' ]
          }
        },
        load : function(plugin, options) {
          CKEDITOR.on('instanceReady', function(event) {
            event.editor.dataProcessor.writer.setRules('p', {
              indent : false,
              breakBeforeOpen : true,
              breakAfterOpen : false,
              breakBeforeClose : false,
              breakAfterClose : true
            });
          });

          /**
           * @fileOverview The "codemirror" plugin. It's indented to enhance the
           *               "sourcearea" editing mode, which displays the xhtml
           *               source code with syntax highlight and line numbers.
           * @see http://marijn.haverbeke.nl/codemirror/ for CodeMirror editor
           *      which this plugin is using.
           */
          CKEDITOR.plugins.add('codemirror', {
            requires : [ 'sourcearea' ],
            /**
             * This's a command-less plugin, auto loaded as soon as switch to
             * 'source' mode and 'textarea' plugin is activeated.
             * 
             * @param {Object}
             *          editor
             */
            init : function(editor) {
              editor.on('mode', function() {
                if (editor.mode == 'source') {
                  var sourceAreaElement = editor.textarea;
                  var holderElement = sourceAreaElement.getParent();
                  $(sourceAreaElement.$).codemirror({});
                  var codemirror = $(sourceAreaElement.$).data('codemirror');
                  // Commit source data back into 'source' mode.
                  editor.on('beforeCommandExec', function(ev) {
                    // Listen to this event once.
                    ev.removeListener();
                    sourceAreaElement.setValue(codemirror.getValue());
                    editor.fire('dataReady');
                    // editor._.modes[ editor.mode
                    // ].loadData(codemirror.getValue());
                  });
                  CKEDITOR.plugins.mirrorSnapshotCmd = {
                    exec : function(editor) {
                      if (editor.mode == 'source') {
                        sourceAreaElement.setValue(codemirror.getValue());
                        editor.fire('dataReady');
                      }
                    }
                  };
                  editor.addCommand('mirrorSnapshot',
                      CKEDITOR.plugins.mirrorSnapshotCmd);
                  // editor.execCommand('mirrorSnapshot');
                }
              });
            }
          });
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
  t : function() {
    var args = Array.prototype.slice.call(arguments);
    var text = args.shift();
    return text;
  },
  init : function(plugins, callback) {
    Aldu.IE.init();
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", function() {
        Aldu._loaded = true;
      }, false);
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
