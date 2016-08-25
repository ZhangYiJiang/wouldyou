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

  $('body.game .kiss-verb-button').click(function(){
    var selector = $('.kiss-verb-button').not(this).css('visibility', 'hidden');
    removeOtherOptions(this);
  });

  $('body.game .merry-verb-button').click(function(){
    var selector = $('.merry-verb-button').not(this).css('visibility', 'hidden');
    removeOtherOptions(this);
  });

  $('body.game .kill-verb-button').click(function(){
    var selector = $('.kill-verb-button').not(this).css('visibility', 'hidden');
    removeOtherOptions(this);
  });

  function removeOtherOptions(selectedOption) {
    var selector = $(selectedOption).closest('ul');
    var selector = selector.find('.verb-button').not(selectedOption);
    selector.remove();
  }

})(jQuery);
//# sourceMappingURL=app.js.map
