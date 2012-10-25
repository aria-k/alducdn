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
      var head = document.getElementsByTagName('head')[0];
      head.insertBefore(link, head.firstChild);
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
  }
};
