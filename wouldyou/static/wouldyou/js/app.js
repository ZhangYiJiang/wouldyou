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
  var verbBtn = $('body.game .verb-button');
  var gameArea = $('body.game .game-area');
  var url = gameArea.data('url'),
      setId = gameArea.data('set'),
      model = gameArea.data('model');

  verbBtn.click(function(evt){
    evt.preventDefault();

    // Make sure the button can't be clicked more than once
    var $t = $(this);
    if ($t.data('clicked'))
      return;
    $t.data('clicked', true);

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

    // Save action using Ajax
    var subject = $t.closest('.game-card')
      .data('subject');
    $.post(url, {
      set: setId,
      model: model,
      verb: verb,
      subject: subject
    }).fail(function () {
      // TODO: Figure out what to do in case of failures
    });
  });

})(jQuery);
//# sourceMappingURL=app.js.map
