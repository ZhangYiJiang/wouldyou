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
      this.button.width(this.button.width());

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

    var button = new LoadingButton($t, 'Awesome!', 'thumbs-o-up fa-2x');
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

    var button = new LoadingButton($t, 'Awesome!', 'thumbs-o-up fa-2x');
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

$('body.onboard .friends button').click(function(){
  var selector = $('.friend-invite');
  var selected = selector.find('input:checked');
  var ids = selected.map(function(){
      return $(this).val();
  }).get();

  // These are defined on the selector tag itself using data-* attributes
  var url = selector.data('request-url'),
    message = selector.data('message');

  var block = new BlockUi(selector);

  // See: https://developers.facebook.com/docs/games/services/gamerequests
  FB.ui({method: 'apprequests',
    message: message,
    to: ids.join(','),
  }, function(response){
    if (!response || 'error_code' in response) {
      block.hide();
      return;
    }

    selected.closest('label')
        .fadeOut();

    // Fire off Ajax request
    $.post(url, {
      response: response
    }).fail(function () {
      // TODO: Figure out front end error handling strategy
    }).always(function () {
      block.hide();
    });
  });
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
      // TODO: Figure out front end error handling strategy
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

  };

  widget.prototype = {
    showLikeAlertAfter: 5,

    undo: function () {
      // Clear selected verbs
      this.selected = [];

      // Unselect all cards
      this.gameArea.find('.game-card')
        .removeClass('card-selected')
        .addClass('card-unselected');

      // Enable all buttons
      this.buttons.removeClass('disabled');

      // Clear all hidden inputs
      this.gameArea.find('.game-card input')
        .prop('checked', false);

      // Hide all action image
      this.gameArea.find('.overlay-image')
        .children().hide();
    },

    select: function (btn) {
      var verb = btn.data('verb');
      // Make sure the button can't be clicked again
      if (this.selected.indexOf(verb) !== -1)
        return;
      this.selected.push(verb);

      // Disable the button of the same verb on other cards
      this.otherButtons(btn)
        .addClass('disabled');

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
      if (this.selected.length === verbCount)
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
      var gameCards = this.gameArea.find('.game-card');

      this.completed = true;

      // Hide reset button
      this.gameArea.find('.undo-btn').fadeOut();

      // Switch 'Skip' button with 'Next'
      this.gameArea.find('.skip-btn').hide();
      this.gameArea.find('.next-btn').removeClass('hidden');

      // Show the correct user story button
      gameCards.each(function(i){
        var selected = me.selected[i];
        $(this).find('.game-story[data-verb="' + selected + '"]')
          .removeClass('hidden');
      });

      // Wait a bit before showing the results, so that any
      // card animations can complete in time
      setTimeout(this.showResults.bind(this), 400);

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
    }
  };

  window.Game = widget;
})(jQuery);

if ($('body').hasClass('game')) {
  var game = new Game($('.game-area'));
}
/*

(function ($) {
  var verbBtn = $('body.game .verb-button');
  var gameArea = $('body.game .game-area');
  var gameAction = $('body.game .game-action');
  var url = gameArea.data('url'),
      setId = gameArea.data('set'),
      model = gameArea.data('model');
  var count = 0;

  verbBtn.click(function(evt){
    evt.preventDefault();

    // Make sure the button can't be clicked more than once
    var $t = $(this);
    if ($t.data('clicked'))
      return;
    $t.data('clicked', true);
    count++;

    // Remove the same option from all other profile
    var verb = $t.data('verb');
    verbBtn.not(this).filter(function () {
      return $(this).data('verb') == verb;
    }).css('visibility', 'hidden');

    // Remove all other option on the same profile
    $t.closest('li')
      .siblings()
      .find('button')
      .remove();

    // Mark the game card as selected
    $t.closest('.game-card-unselected')
      .removeClass('game-card-unselected');

    if (count == 3) {
      $('body.game .game-result')
        .removeClass('hidden');
      verbBtn.closest('li')
        .siblings()
        .remove();
      gameAction.css('justify-content', 'flex-start');
    }
  });

})(jQuery);*/
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
