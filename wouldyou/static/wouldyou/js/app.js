/*!
 * JavaScript Cookie v2.1.2
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api(key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

/**
 * Featherlight - ultra slim jQuery lightbox
 * Version 1.4.1 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2016, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
**/
!function(a){"use strict";function b(a,c){if(!(this instanceof b)){var d=new b(a,c);return d.open(),d}this.id=b.id++,this.setup(a,c),this.chainCallbacks(b._callbackChain)}if("undefined"==typeof a)return void("console"in window&&window.console.info("Too much lightness, Featherlight needs jQuery."));var c=[],d=function(b){return c=a.grep(c,function(a){return a!==b&&a.$instance.closest("body").length>0})},e=function(a,b){var c={},d=new RegExp("^"+b+"([A-Z])(.*)");for(var e in a){var f=e.match(d);if(f){var g=(f[1]+f[2].replace(/([A-Z])/g,"-$1")).toLowerCase();c[g]=a[e]}}return c},f={keyup:"onKeyUp",resize:"onResize"},g=function(c){a.each(b.opened().reverse(),function(){return c.isDefaultPrevented()||!1!==this[f[c.type]](c)?void 0:(c.preventDefault(),c.stopPropagation(),!1)})},h=function(c){if(c!==b._globalHandlerInstalled){b._globalHandlerInstalled=c;var d=a.map(f,function(a,c){return c+"."+b.prototype.namespace}).join(" ");a(window)[c?"on":"off"](d,g)}};b.prototype={constructor:b,namespace:"featherlight",targetAttr:"data-featherlight",variant:null,resetCss:!1,background:null,openTrigger:"click",closeTrigger:"click",filter:null,root:"body",openSpeed:250,closeSpeed:250,closeOnClick:"background",closeOnEsc:!0,closeIcon:"&#10005;",loading:"",persist:!1,otherClose:null,beforeOpen:a.noop,beforeContent:a.noop,beforeClose:a.noop,afterOpen:a.noop,afterContent:a.noop,afterClose:a.noop,onKeyUp:a.noop,onResize:a.noop,type:null,contentFilters:["jquery","image","html","ajax","iframe","text"],setup:function(b,c){"object"!=typeof b||b instanceof a!=!1||c||(c=b,b=void 0);var d=a.extend(this,c,{target:b}),e=d.resetCss?d.namespace+"-reset":d.namespace,f=a(d.background||['<div class="'+e+"-loading "+e+'">','<div class="'+e+'-content">','<span class="'+e+"-close-icon "+d.namespace+'-close">',d.closeIcon,"</span>",'<div class="'+d.namespace+'-inner">'+d.loading+"</div>","</div>","</div>"].join("")),g="."+d.namespace+"-close"+(d.otherClose?","+d.otherClose:"");return d.$instance=f.clone().addClass(d.variant),d.$instance.on(d.closeTrigger+"."+d.namespace,function(b){var c=a(b.target);("background"===d.closeOnClick&&c.is("."+d.namespace)||"anywhere"===d.closeOnClick||c.closest(g).length)&&(d.close(b),b.preventDefault())}),this},getContent:function(){if(this.persist!==!1&&this.$content)return this.$content;var b=this,c=this.constructor.contentFilters,d=function(a){return b.$currentTarget&&b.$currentTarget.attr(a)},e=d(b.targetAttr),f=b.target||e||"",g=c[b.type];if(!g&&f in c&&(g=c[f],f=b.target&&e),f=f||d("href")||"",!g)for(var h in c)b[h]&&(g=c[h],f=b[h]);if(!g){var i=f;if(f=null,a.each(b.contentFilters,function(){return g=c[this],g.test&&(f=g.test(i)),!f&&g.regex&&i.match&&i.match(g.regex)&&(f=i),!f}),!f)return"console"in window&&window.console.error("Featherlight: no content filter found "+(i?' for "'+i+'"':" (no target specified)")),!1}return g.process.call(b,f)},setContent:function(b){var c=this;return(b.is("iframe")||a("iframe",b).length>0)&&c.$instance.addClass(c.namespace+"-iframe"),c.$instance.removeClass(c.namespace+"-loading"),c.$instance.find("."+c.namespace+"-inner").not(b).slice(1).remove().end().replaceWith(a.contains(c.$instance[0],b[0])?"":b),c.$content=b.addClass(c.namespace+"-inner"),c},open:function(b){var d=this;if(d.$instance.hide().appendTo(d.root),!(b&&b.isDefaultPrevented()||d.beforeOpen(b)===!1)){b&&b.preventDefault();var e=d.getContent();if(e)return c.push(d),h(!0),d.$instance.fadeIn(d.openSpeed),d.beforeContent(b),a.when(e).always(function(a){d.setContent(a),d.afterContent(b)}).then(d.$instance.promise()).done(function(){d.afterOpen(b)})}return d.$instance.detach(),a.Deferred().reject().promise()},close:function(b){var c=this,e=a.Deferred();return c.beforeClose(b)===!1?e.reject():(0===d(c).length&&h(!1),c.$instance.fadeOut(c.closeSpeed,function(){c.$instance.detach(),c.afterClose(b),e.resolve()})),e.promise()},resize:function(a,b){if(a&&b){this.$content.css("width","").css("height","");var c=Math.max(a/parseInt(this.$content.parent().css("width"),10),b/parseInt(this.$content.parent().css("height"),10));c>1&&this.$content.css("width",""+a/c+"px").css("height",""+b/c+"px")}},chainCallbacks:function(b){for(var c in b)this[c]=a.proxy(b[c],this,a.proxy(this[c],this))}},a.extend(b,{id:0,autoBind:"[data-featherlight]",defaults:b.prototype,contentFilters:{jquery:{regex:/^[#.]\w/,test:function(b){return b instanceof a&&b},process:function(b){return this.persist!==!1?a(b):a(b).clone(!0)}},image:{regex:/\.(png|jpg|jpeg|gif|tiff|bmp|svg)(\?\S*)?$/i,process:function(b){var c=this,d=a.Deferred(),e=new Image,f=a('<img src="'+b+'" alt="" class="'+c.namespace+'-image" />');return e.onload=function(){f.naturalWidth=e.width,f.naturalHeight=e.height,d.resolve(f)},e.onerror=function(){d.reject(f)},e.src=b,d.promise()}},html:{regex:/^\s*<[\w!][^<]*>/,process:function(b){return a(b)}},ajax:{regex:/./,process:function(b){var c=a.Deferred(),d=a("<div></div>").load(b,function(a,b){"error"!==b&&c.resolve(d.contents()),c.fail()});return c.promise()}},iframe:{process:function(b){var c=new a.Deferred,d=a("<iframe/>").hide().attr("src",b).css(e(this,"iframe")).on("load",function(){c.resolve(d.show())}).appendTo(this.$instance.find("."+this.namespace+"-content"));return c.promise()}},text:{process:function(b){return a("<div>",{text:b})}}},functionAttributes:["beforeOpen","afterOpen","beforeContent","afterContent","beforeClose","afterClose"],readElementConfig:function(b,c){var d=this,e=new RegExp("^data-"+c+"-(.*)"),f={};return b&&b.attributes&&a.each(b.attributes,function(){var b=this.name.match(e);if(b){var c=this.value,g=a.camelCase(b[1]);if(a.inArray(g,d.functionAttributes)>=0)c=new Function(c);else try{c=a.parseJSON(c)}catch(h){}f[g]=c}}),f},extend:function(b,c){var d=function(){this.constructor=b};return d.prototype=this.prototype,b.prototype=new d,b.__super__=this.prototype,a.extend(b,this,c),b.defaults=b.prototype,b},attach:function(b,c,d){var e=this;"object"!=typeof c||c instanceof a!=!1||d||(d=c,c=void 0),d=a.extend({},d);var f,g=d.namespace||e.defaults.namespace,h=a.extend({},e.defaults,e.readElementConfig(b[0],g),d);return b.on(h.openTrigger+"."+h.namespace,h.filter,function(g){var i=a.extend({$source:b,$currentTarget:a(this)},e.readElementConfig(b[0],h.namespace),e.readElementConfig(this,h.namespace),d),j=f||a(this).data("featherlight-persisted")||new e(c,i);"shared"===j.persist?f=j:j.persist!==!1&&a(this).data("featherlight-persisted",j),i.$currentTarget.blur(),j.open(g)}),b},current:function(){var a=this.opened();return a[a.length-1]||null},opened:function(){var b=this;return d(),a.grep(c,function(a){return a instanceof b})},close:function(a){var b=this.current();return b?b.close(a):void 0},_onReady:function(){var b=this;b.autoBind&&(a(b.autoBind).each(function(){b.attach(a(this))}),a(document).on("click",b.autoBind,function(c){c.isDefaultPrevented()||"featherlight"===c.namespace||(c.preventDefault(),b.attach(a(c.currentTarget)),a(c.target).trigger("click.featherlight"))}))},_callbackChain:{onKeyUp:function(b,c){return 27===c.keyCode?(this.closeOnEsc&&a.featherlight.close(c),!1):b(c)},onResize:function(a,b){return this.resize(this.$content.naturalWidth,this.$content.naturalHeight),a(b)},afterContent:function(a,b){var c=a(b);return this.onResize(b),c}}}),a.featherlight=b,a.fn.featherlight=function(a,c){return b.attach(this,a,c)},a(document).ready(function(){b._onReady()})}(jQuery);
/*!
 * imagesLoaded PACKAGED v4.1.1
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

/**
 * EvEmitter v1.0.3
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'ev-emitter/ev-emitter',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {



function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var i = 0;
  var listener = listeners[i];
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  while ( listener ) {
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
    // get next listener
    i += isOnce ? 0 : 1;
    listener = listeners[i];
  }

  return this;
};

return EvEmitter;

}));

/*!
 * imagesLoaded v4.1.1
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'ev-emitter/ev-emitter'
    ], function( EvEmitter ) {
      return factory( window, EvEmitter );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('ev-emitter')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EvEmitter
    );
  }

})( window,

// --------------------------  factory -------------------------- //

function factory( window, EvEmitter ) {



var $ = window.jQuery;
var console = window.console;

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( Array.isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length == 'number' ) {
    // convert nodeList to array
    for ( var i=0; i < obj.length; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

// -------------------------- imagesLoaded -------------------------- //

/**
 * @param {Array, Element, NodeList, String} elem
 * @param {Object or Function} options - if function, use as callback
 * @param {Function} onAlways - callback function
 */
function ImagesLoaded( elem, options, onAlways ) {
  // coerce ImagesLoaded() without new, to be new ImagesLoaded()
  if ( !( this instanceof ImagesLoaded ) ) {
    return new ImagesLoaded( elem, options, onAlways );
  }
  // use elem as selector string
  if ( typeof elem == 'string' ) {
    elem = document.querySelectorAll( elem );
  }

  this.elements = makeArray( elem );
  this.options = extend( {}, this.options );

  if ( typeof options == 'function' ) {
    onAlways = options;
  } else {
    extend( this.options, options );
  }

  if ( onAlways ) {
    this.on( 'always', onAlways );
  }

  this.getImages();

  if ( $ ) {
    // add jQuery Deferred object
    this.jqDeferred = new $.Deferred();
  }

  // HACK check async to allow time to bind listeners
  setTimeout( function() {
    this.check();
  }.bind( this ));
}

ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

ImagesLoaded.prototype.options = {};

ImagesLoaded.prototype.getImages = function() {
  this.images = [];

  // filter & find items if we have an item selector
  this.elements.forEach( this.addElementImages, this );
};

/**
 * @param {Node} element
 */
ImagesLoaded.prototype.addElementImages = function( elem ) {
  // filter siblings
  if ( elem.nodeName == 'IMG' ) {
    this.addImage( elem );
  }
  // get background image on element
  if ( this.options.background === true ) {
    this.addElementBackgroundImages( elem );
  }

  // find children
  // no non-element nodes, #143
  var nodeType = elem.nodeType;
  if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
    return;
  }
  var childImgs = elem.querySelectorAll('img');
  // concat childElems to filterFound array
  for ( var i=0; i < childImgs.length; i++ ) {
    var img = childImgs[i];
    this.addImage( img );
  }

  // get child background images
  if ( typeof this.options.background == 'string' ) {
    var children = elem.querySelectorAll( this.options.background );
    for ( i=0; i < children.length; i++ ) {
      var child = children[i];
      this.addElementBackgroundImages( child );
    }
  }
};

var elementNodeTypes = {
  1: true,
  9: true,
  11: true
};

ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
  var style = getComputedStyle( elem );
  if ( !style ) {
    // Firefox returns null if in a hidden iframe https://bugzil.la/548397
    return;
  }
  // get url inside url("...")
  var reURL = /url\((['"])?(.*?)\1\)/gi;
  var matches = reURL.exec( style.backgroundImage );
  while ( matches !== null ) {
    var url = matches && matches[2];
    if ( url ) {
      this.addBackground( url, elem );
    }
    matches = reURL.exec( style.backgroundImage );
  }
};

/**
 * @param {Image} img
 */
ImagesLoaded.prototype.addImage = function( img ) {
  var loadingImage = new LoadingImage( img );
  this.images.push( loadingImage );
};

ImagesLoaded.prototype.addBackground = function( url, elem ) {
  var background = new Background( url, elem );
  this.images.push( background );
};

ImagesLoaded.prototype.check = function() {
  var _this = this;
  this.progressedCount = 0;
  this.hasAnyBroken = false;
  // complete if no images
  if ( !this.images.length ) {
    this.complete();
    return;
  }

  function onProgress( image, elem, message ) {
    // HACK - Chrome triggers event before object properties have changed. #83
    setTimeout( function() {
      _this.progress( image, elem, message );
    });
  }

  this.images.forEach( function( loadingImage ) {
    loadingImage.once( 'progress', onProgress );
    loadingImage.check();
  });
};

ImagesLoaded.prototype.progress = function( image, elem, message ) {
  this.progressedCount++;
  this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
  // progress event
  this.emitEvent( 'progress', [ this, image, elem ] );
  if ( this.jqDeferred && this.jqDeferred.notify ) {
    this.jqDeferred.notify( this, image );
  }
  // check if completed
  if ( this.progressedCount == this.images.length ) {
    this.complete();
  }

  if ( this.options.debug && console ) {
    console.log( 'progress: ' + message, image, elem );
  }
};

ImagesLoaded.prototype.complete = function() {
  var eventName = this.hasAnyBroken ? 'fail' : 'done';
  this.isComplete = true;
  this.emitEvent( eventName, [ this ] );
  this.emitEvent( 'always', [ this ] );
  if ( this.jqDeferred ) {
    var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
    this.jqDeferred[ jqMethod ]( this );
  }
};

// --------------------------  -------------------------- //

function LoadingImage( img ) {
  this.img = img;
}

LoadingImage.prototype = Object.create( EvEmitter.prototype );

LoadingImage.prototype.check = function() {
  // If complete is true and browser supports natural sizes,
  // try to check for image status manually.
  var isComplete = this.getIsImageComplete();
  if ( isComplete ) {
    // report based on naturalWidth
    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
    return;
  }

  // If none of the checks above matched, simulate loading on detached element.
  this.proxyImage = new Image();
  this.proxyImage.addEventListener( 'load', this );
  this.proxyImage.addEventListener( 'error', this );
  // bind to image as well for Firefox. #191
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  this.proxyImage.src = this.img.src;
};

LoadingImage.prototype.getIsImageComplete = function() {
  return this.img.complete && this.img.naturalWidth !== undefined;
};

LoadingImage.prototype.confirm = function( isLoaded, message ) {
  this.isLoaded = isLoaded;
  this.emitEvent( 'progress', [ this, this.img, message ] );
};

// ----- events ----- //

// trigger specified handler for event type
LoadingImage.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

LoadingImage.prototype.onload = function() {
  this.confirm( true, 'onload' );
  this.unbindEvents();
};

LoadingImage.prototype.onerror = function() {
  this.confirm( false, 'onerror' );
  this.unbindEvents();
};

LoadingImage.prototype.unbindEvents = function() {
  this.proxyImage.removeEventListener( 'load', this );
  this.proxyImage.removeEventListener( 'error', this );
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );
};

// -------------------------- Background -------------------------- //

function Background( url, element ) {
  this.url = url;
  this.element = element;
  this.img = new Image();
}

// inherit LoadingImage prototype
Background.prototype = Object.create( LoadingImage.prototype );

Background.prototype.check = function() {
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  this.img.src = this.url;
  // check if image is already complete
  var isComplete = this.getIsImageComplete();
  if ( isComplete ) {
    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
    this.unbindEvents();
  }
};

Background.prototype.unbindEvents = function() {
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );
};

Background.prototype.confirm = function( isLoaded, message ) {
  this.isLoaded = isLoaded;
  this.emitEvent( 'progress', [ this, this.element, message ] );
};

// -------------------------- jQuery -------------------------- //

ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
  jQuery = jQuery || window.jQuery;
  if ( !jQuery ) {
    return;
  }
  // set local variable
  $ = jQuery;
  // $().imagesLoaded()
  $.fn.imagesLoaded = function( options, callback ) {
    var instance = new ImagesLoaded( this, options, callback );
    return instance.jqDeferred.promise( $(this) );
  };
};
// try making plugin
ImagesLoaded.makeJQueryPlugin();

// --------------------------  -------------------------- //

return ImagesLoaded;

});


Object.values = Object.values || function (obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        var val = obj[key];
    }
  }
  return val;
};

$.ajaxSetup({
  headers: {
    'X-CSRFToken': $('meta[name="csrf_token"]').attr('content'),
  }
});

// Block UI widget
(function ($) {
  // Save a copy of the block UI element for future use
  var block = $('#block-ui')
    .clone()
    .removeAttr('id')
    .removeClass('hidden')
    .hide();

  var widget = function(parent, show) {
    this.block = block.clone();

    this.parent = $(parent);
    this.parent.append(this.block);

    this.show();
  };

  widget.prototype = {
    hide: function (completed) {
      this.block.fadeOut(300, function () {
        $(this).remove();
      })
    },

    show: function (completed) {
      this.block.fadeIn(300);
    }, 
  };

  window.BlockUi = widget;
})(jQuery);
(function ($) {
  var alertArea = $('.alert-container');

  // No need to continue if there are no place for alerts on this page
  if (!alertArea.length) return;

  var Widget = function (level, text, icon, dismissable) {
    var me = this;

    this.level = level;
    this.dismissed = false;
    this.alert = $('<div>', {
      'class': 'alert alert-' + level,
    });

    $('<p>', { html: text }).appendTo(this.alert);

    if (icon) {
      $('<i>', {
        'class': 'fa fa-2x fa-' + icon,
      }).prependTo(this.alert);
    }

    if (dismissable) {
      var closeBtn = $(this.closeBtnHtml);
      closeBtn.appendTo(this.alert)
        .click(function () {
          me.dismiss();
          if (typeof dismissable === 'function') {
            dismissable(alert);
          }
        });
    }

    this.alert.hide();
  };

  Widget.prototype = {
    closeBtnHtml: '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>',

    open: function () {
      this.alert.slideDown(200);
    },

    dismiss: function () {
      if (this.dismissed)
        return;

      var me = this;
      this.alert.slideUp(200, function () {
        $(this).remove();
        me.dismissed = true;
      });
    },

  };

  var Manager = function () {
    var me = this;

    this.alerts = [];
    this.alertArea = alertArea;

    this.alertArea.children().each(function () {
      me.alerts.push($(this));
    });
  };

  Manager.prototype = {
    add: function (level, text, icon, dismissable) {
      var alert = this.makeButton(level, text, icon, dismissable);
      this.alerts.push(alert);
      this.alertArea.prepend(alert.alert);
      alert.open();
      return alert;
    },

    clear: function (level) {
      var removedElements, keepElements = [];

      if (!level) {
        removedElements = this.alerts;
      } else {
        removedElements = [];

        this.alerts.forEach(function(alert){
          if (alert.level == level) {
            removedElements.push(alert);
          } else {
            keepElements.push(alert);
          }
        });
      }

      removedElements.forEach(function (alert) {
        alert.dismiss();
      });

      this.alerts = keepElements;
    },

    makeButton: function(level, text, icon, dismissable) {
      return new Widget(level, text, icon, dismissable);
    }
  };

  window.AlertManager = new Manager();
  window.Alert = Widget;
})(jQuery);
(function ($) {
  function generateHtml(content, icon) {
    return '<i class="fa fa-' + icon + '"></i> ' + content;
  }

  var widget = function (buttonElement, message, icon) {
    this.button = $(buttonElement);
    this.originalContent = this.button.html();
    this.successMessage = message || 'Success!';
    this.successIcon = icon || 'thumbs-o-up';
  };

  widget.prototype = {
    defaultSpinner: '<div class="spinner">' +
      '<div class="bounce1"></div>' +
      '<div class="bounce2"></div>' +
      '<div class="bounce3"></div>' +
    '</div>',

    start: function () {
      if (this.button.data('started')) {
        return false;
      }

      // Fix button height and width before replacing content
      this.button.height(this.button.height());

      // Replace with spinner
      var html = this.defaultSpinner;
      this.button.html(html);

      // Make sure button can't be pressed multiple times
      this.button.addClass('btn-started')
        .data('started', true);

      return true;
    },

    reset: function () {
      this.button.html(this.originalContent);

      // Reset started button state
      this.button
        .removeClass('btn-started')
        .data('started', false);
    },

    success: function () {
      var html = generateHtml(this.successMessage, this.successIcon);
      this.button.html(html);
    },
  };

  window.LoadingButton = widget;
})(jQuery);

(function ($) {
  $('body').on('click', '.share-btn', function (evt) {
    evt.preventDefault();

    var $t = $(this);
    var url = $t.data('href') || window.location.toString();

    var button = new LoadingButton($t, 'Awesome!', 'check');
    if (!button.start()) return;

    FB.ui({
      method: 'share',
      href: url,
      mobile_iframe: true,
    }, function (response) {
      if (response && !response.hasOwnProperty('error')) {
        button.success();
      } else {
        button.reset();
      }
    });
  })
  .on('click', '.story-btn', function (evt) {
    evt.preventDefault();

    var $t = $(this);
    var action = $t.data('action');
    var celebrity = $t.data('celebrity');

    var button = new LoadingButton($t, 'Awesome!', 'check fa-2x');
    if (!button.start()) return;

    FB.api(
      'me/' + action,
      'post',
      {
        celebrity: celebrity,
        access_token: userAccessToken,
      },
      function(response) {
        if (response && !response.hasOwnProperty('error') && response.hasOwnProperty('id')) {
          button.success();
        } else if (response.hasOwnProperty('error') && response.error.code == 3501) {
          // Duplicate response, just ignore
          button.success();
        } else {
          button.reset();
          AlertManager.add('danger', 'Sorry, something went wrong. Please ' +
            'refresh the page and try again later', 'exclamation-triangle', true);
        }
      }
    );
  });
})(jQuery);
(function ($) {

$('.invite-btn').click(function (evt) {
  evt.preventDefault();

  var btn = $(this),
      url = btn.data('url'),
      message = btn.data('message');

  var invitePage = $('.bg-container'),
      block = new BlockUi(invitePage);


  // See: https://developers.facebook.com/docs/games/services/gamerequests
  FB.ui({
    method: 'apprequests',
    message: message,
    filters: ['app_non_users'],
  }, function(response){
    if (!response || 'error_code' in response ||
        (Array.isArray(response) && !response.length)) {
      block.hide();
      return;
    }

    // Fire off Ajax request
    $.post(url, {
      response: response
    }).done(function(json) {
      // Sanity check - this shouldn't happen
      if (!json.success) console.error(json);

      var data = json.data;
      if (data.hasOwnProperty('redirect')) {
        if (btn.data('no-redirect')) {
          AlertManager.clear();
          AlertManager.add('info', 'Your friends have been successfully added!', 'info-circle');
        } else {
          window.location.href = data.redirect;
        }
      } else if (data.hasOwnProperty('required_count')) {
        var count = data.required_count;

        // Update the count in the help message below the button
        $('.invite-count').text(count);

        // Hide existing error messages
        AlertManager.clear('danger');

        // And add the new one
        var message = "Sorry, you didn't invite enough friends. Please invite " +
            count + " or more friends to continue playing.";
        AlertManager.add('danger', message, 'exclamation-triangle');
      }
    }).fail(function () {
      AlertManager.add('danger', 'Oops! Something seems to have went wrong. Please refresh and try again', 'exclamation-triangle');
    }).always(function () {
      block.hide();
    });
  });
});

})(jQuery);
(function ($) {
  var verbCount = 3;

  var widget = function (gameArea) {
    var me = this;

    this.gameArea = $(gameArea);
    this.gameForm = gameArea.find('form');
    this.buttons = this.gameArea.find('.verb-btn');
    this.selected = [];
    this.completed = false;
    this.gameCards = this.gameArea.find('.game-card');
    this.playerImages = this.gameCards.children('img');

    // Event binding
    this.gameArea.on('click', '.verb-btn', function (evt) {
      evt.preventDefault();
      me.select($(this));
    });

    this.gameArea.find('.undo-btn').click(function (evt) {
      evt.preventDefault();
      me.undo();
    });

    this.gameForm.submit(function (evt) {
      // Don't allow form submission unless game has been completed
      if (!me.completed)
        return false;
    });

    this.playerImages.imagesLoaded(function () {
      me.fixImageSize();
    });

    // Debounced image resizing on window resizing
    this.resizeTimeoutId = false;
    $(window).on('resize', function () {
      if (me.resizeTimeoutId !== false) {
        clearTimeout(me.resizeTimeoutId);
      }

      me.resizeTimeoutId = setTimeout(function () {
        me.playerImages.prop('style', '');
        me.fixImageSize();
        me.resizeTimeoutId = false;
      }, 50);
    });
  };

  widget.prototype = {
    showLikeAlertAfter: 5,

    undo: function () {
      // Clear selected verbs
      this.selected = {};

      // Unselect all cards
      this.gameArea.find('.game-card')
        .removeClass('card-selected')
        .addClass('card-unselected');

      // Enable all buttons
      this.buttons.prop('disabled', false)
        .removeClass('disabled');

      // Clear all hidden inputs
      this.gameArea.find('.game-card input')
        .prop('checked', false);

      // Hide all action image
      this.gameArea.find('.overlay-image')
        .children().hide();
    },

    select: function (btn) {
      var verb = btn.data('verb');
      var btnIndex = btn
        .closest('.game-choice')
        .prevAll('.game-choice').length;

      // Make sure the button can't be clicked again
      if (this.selected.hasOwnProperty(btnIndex))
        return;
      if (Object.values(this.selected).includes(verb)) {
        return;
      }

      this.selected[btnIndex] = verb;

      // Disable the button of the same verb on other cards
      this.otherButtons(btn)
        .addClass('disabled')
        .prop('disabled', true);

      // Switch current card class
      var card = btn.closest('.game-card')
        .removeClass('card-unselected')
        .addClass('card-selected');

      // Fill in hidden input
      btn.next('input').prop('checked', true);

      // Fade in action image
      card.find('.overlay-image').children().filter(function () {
        return $(this).data('verb') == verb;
      }).fadeIn();

      // Check if the game is finished
      if (Object.keys(this.selected).length === verbCount)
        this.complete();
    },

    otherButtons: function (btn) {
      var verb = btn.data('verb');
      return this.buttons.not(btn).filter(function () {
        return $(this).data('verb') === verb;
      });
    },

    complete: function () {
      var me = this;
      var specialMatches = [];

      this.completed = true;

      // Hide reset button
      this.gameArea.find('.undo-btn').fadeOut();

      // Switch 'Skip' button with 'Next'
      this.gameArea.find('.skip-btn').hide();
      this.gameArea.find('.next-btn').removeClass('hidden');

      // Show the correct user story button
      this.gameCards.each(function(i){
        var $t = $(this);
        var selected = me.selected[i];
        var story = $t.find('.game-story[data-verb="' + selected + '"]')
          .removeClass('hidden');

        // Special match
        if (!story.length) {
          specialMatches.push($t.find('.friend-stories').data('subject'));
        }
      });

      // Wait a bit before showing the results, so that any
      // card animations can complete in time
      setTimeout(this.showResults.bind(this), 400);

      if (specialMatches.length) {
        setTimeout(function(){
          me.showMatchModal(specialMatches);
        }, 500);
      }

      // Show a like button after the player played the game a few times
      setTimeout(this.showLikeAlert.bind(this), 1800);
    },

    showResults: function () {
      this.gameArea.find('.game-card').each(function (i, ele) {
        // Add a bit of delay between each card to add tension
        setTimeout(function () {
          $(ele).find('.game-result').fadeIn(300);
        }, 400 * i);
      });
    },

    showMatchModal: function (matches) {
      var modalContent = $('.match-modal');

      modalContent.find('.player-match').filter(function () {
        return matches.includes($(this).data('subject'));
      }).removeClass('hidden');

      modalContent.find('.match-btn').click(function () {
        $.featherlight.close();
      });

      $.featherlight(modalContent);
    },

    showLikeAlert: function () {
      if (!Cookies.get('like_alert_dismissed')) {
        var completeCount = +Cookies.get('complete_count') || 0;

        if (completeCount > this.showLikeAlertAfter) {
          // TODO: Hacky, should be replaced later
          var btnHtml = $('footer.global .fb-like').get(0).outerHTML;
          var message = 'Having fun? Why not spread the word by ' +
            'giving us a like? ';
          var alert = AlertManager.add('info', message + btnHtml, 'thumbs-o-up', function() {
            Cookies.set('like_alert_dismissed', true, {
              expires: 365,  // One year
            });
          });
        } else {
          Cookies.set('complete_count', completeCount + 1, {
            expires: 365,  // One year
          });
        }
      }
    },

    fixImageSize: function () {
      var heights = this.playerImages.map(function () {
          return $(this).height();
        }).get();
      var widths = this.playerImages.map(function () {
          return $(this).width();
        }).get();

      var maxHeight = Math.max.apply(null, heights);
      var maxWidth = Math.max.apply(null, widths);
      this.playerImages.height(maxHeight).width(maxWidth);
    },
  };

  window.Game = widget;
})(jQuery);

if ($('body').hasClass('game')) {
  var game = new Game($('.game-area'));
}

(function ($) {
  var indexHeader = $('.index-header .header-content');
  if (!indexHeader.length) return;

  $('.bg-col').hover(function() {
    var $t = $(this),
        pos = $t.prevAll().length;

    indexHeader.addClass($t.data('verb') + '-selected');
  }, function () {
    var $t = $(this),
        pos = $t.prevAll().length;

    indexHeader.removeClass($t.data('verb') + '-selected');
  })
})(jQuery);
//# sourceMappingURL=app.js.map
